import { prisma } from '@/lib/prisma'
import type { PolymarketRawMarket, NormalizedMarket } from './types'
import { DEMO_MODE } from '@/config/demo'

const GAMMA_BASE_URL = 'https://gamma-api.polymarket.com'

interface FetchMarketsParams {
  status?: 'open' | 'closed' | 'resolved'
  minVolume?: number
  limit?: number
}

/**
 * Helper function to fetch JSON from an API endpoint
 */
async function fetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`[GAMMA] Error fetching ${url}:`, error)
    throw error
  }
}

/**
 * Fetch markets from Gamma API
 */
export async function fetchMarketsFromGamma(
  params: FetchMarketsParams = {}
): Promise<PolymarketRawMarket[]> {
  if (DEMO_MODE) {
    // В демо-режиме не вызываем реальный API
    console.log('[GAMMA] DEMO MODE: Skipping real API call')
    return []
  }

  const { status, minVolume, limit } = params
  const queryParams = new URLSearchParams()

  if (status) {
    queryParams.append('status', status)
  }
  if (minVolume !== undefined) {
    queryParams.append('minVolume', minVolume.toString())
  }
  if (limit !== undefined) {
    queryParams.append('limit', limit.toString())
  }

  const url = `${GAMMA_BASE_URL}/markets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

  if (process.env.NODE_ENV !== 'production') {
    console.log(
      '[GAMMA] Fetching markets from',
      url,
      'with params:',
      params
    )
  }

  try {
    const data = await fetchJson<PolymarketRawMarket[]>(url)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('[GAMMA] Error fetching markets from Gamma API:', error)
    throw new Error('Failed to fetch markets from Gamma API')
  }
}

/**
 * Normalize raw market data from Gamma API to our internal format
 */
export function normalizeMarket(raw: PolymarketRawMarket): NormalizedMarket {
  return {
    id: raw.id || raw.conditionId || '',
    eventId: raw.eventId ?? null,
    question: raw.question || '',
    outcomes: raw.outcomes || [],
    endTime: raw.endDate ? new Date(raw.endDate) : new Date(),
    status: raw.status || 'unknown',
    volume: raw.volume ?? null,
    liquidity: raw.liquidity ?? null,
    raw: raw,
  }
}

/**
 * Get active markets from Gamma API and normalize them
 */
export async function getActiveMarkets(
  params?: Omit<FetchMarketsParams, 'status'>
): Promise<NormalizedMarket[]> {
  try {
    const rawMarkets = await fetchMarketsFromGamma({
      status: 'open',
      limit: params?.limit ?? 100,
    })

    const now = new Date()
    const ONE_WEEK_DAYS = 7

    const filtered = rawMarkets.filter((m) => {
      // фильтр по статусу, если есть
      if (m.status && typeof m.status === 'string') {
        const st = m.status.toLowerCase()
        if (
          st.includes('resolved') ||
          st.includes('closed') ||
          st.includes('final')
        ) {
          return false
        }
      }

      // фильтр по тексту вопроса - исключаем старые события
      if (m.question && typeof m.question === 'string') {
        const questionLower = m.question.toLowerCase()
        
        // Исключаем рынки про старые события 2020-2021
        // Проверяем комбинации: тема + год или специфичные старые темы
        if (
          // Выборы 2020
          (questionLower.includes('2020') &&
            (questionLower.includes('election') ||
              questionLower.includes('presidential') ||
              questionLower.includes('president'))) ||
          // COVID/Pfizer 2020-2021
          (questionLower.includes('pfizer') && questionLower.includes('vaccine')) ||
          (questionLower.includes('covid') && questionLower.includes('vaccine')) ||
          (questionLower.includes('fda approval') &&
            questionLower.includes('vaccine')) ||
          // Airbnb IPO 2020
          (questionLower.includes('airbnb') &&
            (questionLower.includes('ipo') ||
              questionLower.includes('first day publicly trading') ||
              questionLower.includes('market cap at close'))) ||
          // Georgia runoff 2020-2021
          (questionLower.includes('georgia') &&
            (questionLower.includes('runoff') ||
              questionLower.includes('ossoff') ||
              questionLower.includes('perdue'))) ||
          // Любые рынки с явным указанием 2020/2021 в контексте выборов/COVID
          (questionLower.includes('2020') &&
            (questionLower.includes('election') ||
              questionLower.includes('covid') ||
              questionLower.includes('vaccine'))) ||
          (questionLower.includes('2021') &&
            (questionLower.includes('election') ||
              questionLower.includes('covid') ||
              questionLower.includes('vaccine')))
        ) {
          return false
        }
      }

      // фильтр по endDate
      const rawEnd =
        m.endDate ||
        m.endsAt ||
        m.end_time ||
        m.endTime ||
        m.date_end ||
        null

      if (rawEnd) {
        const end = new Date(rawEnd)
        if (!isNaN(end.getTime())) {
          const diffDays =
            (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          if (diffDays < -ONE_WEEK_DAYS) {
            // закончился больше недели назад — выбрасываем
            return false
          }
        }
      }

      // Дополнительный фильтр: если endDate в далёком прошлом (больше года назад)
      if (rawEnd) {
        const end = new Date(rawEnd)
        if (!isNaN(end.getTime())) {
          const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          if (end < oneYearAgo) {
            return false
          }
        }
      }

      return true
    })

    // сортировка по объёму
    const sorted = filtered.sort((a, b) => {
      const va = typeof a.volume === 'number' ? a.volume : 0
      const vb = typeof b.volume === 'number' ? b.volume : 0
      return vb - va
    })

    // при необходимости ограничиваем сверху
    const limited = sorted.slice(0, params?.limit ?? 50)

    // Логируем примеры отфильтрованных рынков для отладки
    if (process.env.NODE_ENV !== 'production') {
      const filteredQuestions = filtered
        .slice(0, 5)
        .map((m) => m.question?.substring(0, 50))
      console.log(
        '[GAMMA] Active markets raw:',
        rawMarkets.length,
        'filtered:',
        filtered.length,
        'sorted/limited:',
        limited.length
      )
      console.log('[GAMMA] Sample filtered markets:', filteredQuestions)
    }

    return limited.map(normalizeMarket)
  } catch (error) {
    console.error('[GAMMA] Error getting active markets:', error)
    throw error
  }
}

/**
 * Sync active markets from Gamma API to database
 */
export async function syncMarketsToDb(): Promise<void> {
  try {
    const markets = await getActiveMarkets()

    for (const market of markets) {
      await prisma.market.upsert({
        where: { id: market.id },
        update: {
          eventId: market.eventId,
          question: market.question,
          outcomes: market.outcomes as any,
          endTime: market.endTime,
          status: market.status,
          extra: market.raw as any,
          updatedAt: new Date(),
        },
        create: {
          id: market.id,
          eventId: market.eventId,
          question: market.question,
          outcomes: market.outcomes as any,
          endTime: market.endTime,
          status: market.status,
          extra: market.raw as any,
        },
      })
    }

    console.log(`[GAMMA] Synced ${markets.length} markets to database`)
  } catch (error) {
    console.error('[GAMMA] Error syncing markets to database:', error)
    throw error
  }
}


import { NextResponse } from 'next/server'
import { DEMO_MODE } from '@/config/demo'
import { MOCK_MARKETS } from '@/data/mockMarkets'
import { getActiveMarkets, syncMarketsToDb } from '@/server/polymarket/gammaClient'
import { getTicker, getOutcomePrices } from '@/server/polymarket/clobClient'

/**
 * GET /api/markets
 * Returns list of active markets from Polymarket with enriched price data
 */
export async function GET() {
  try {
    // В DEMO режиме используем мок-данные
    if (DEMO_MODE) {
      const markets = MOCK_MARKETS.map((m) => {
        const outcomesLabels = m.outcomes.map((o) => o.label)
        
        // Для бинарных рынков (2 исхода) используем первый как YES, второй как NO
        // Для рынков с несколькими исходами - показываем все исходы, но yesPrice/noPrice для первого/второго
        const yes = m.outcomes[0] ?? null
        const no = m.outcomes[1] ?? null
        
        // yesProbability уже содержит вероятность для конкретного исхода
        const yesPrice = yes ? yes.yesProbability : null
        
        // Если есть второй исход - используем его вероятность, иначе 1 - yesPrice
        const noPrice =
          no?.yesProbability ??
          (yesPrice != null ? 1 - yesPrice : null)

        const yesOdds =
          yesPrice && yesPrice > 0 ? 1 / yesPrice : null
        const noOdds =
          noPrice && noPrice > 0 ? 1 / noPrice : null

        return {
          id: m.id,
          question: m.question,
          outcomes: outcomesLabels,
          endTime: m.endsAt,
          status: 'open',
          volume: m.volume,
          liquidity: null,
          category: m.category,
          yesPrice,
          noPrice,
          yesOdds,
          noOdds,
          raw: m,
        }
      })

      return NextResponse.json({ markets })
    }

    // Fetch active markets from Gamma API
    const markets = await getActiveMarkets()

    // Sync to database asynchronously (don't block the response)
    syncMarketsToDb().catch((error) => {
      console.error('Background sync to DB failed:', error)
      // Don't throw - this is a background operation
    })

    // Enrich markets with YES/NO prices and odds
    // Используем Promise.allSettled чтобы не падать на ошибках отдельных рынков
    const enrichedResults = await Promise.allSettled(
      markets.map(async (m) => {
        try {
          // Пробуем получить цены через getTicker
          const tickerYes = await getTicker(m.id, 0)
          let yesPrice =
            tickerYes?.midPrice ?? tickerYes?.bestAsk ?? null
          let noPrice: number | null = null

          // Если getTicker не дал результат, пробуем через getOutcomePrices
          if (yesPrice === null) {
            try {
              const outcomePrices = await getOutcomePrices(m.id)
              const yesOutcome = outcomePrices.find((p) => p.outcomeIndex === 0)
              yesPrice =
                yesOutcome?.bestAskPrice ?? yesOutcome?.bestBidPrice ?? null
            } catch {
              // Игнорируем ошибку
            }
          }

          // если есть явный второй исход — пытаемся взять ticker для outcomeIndex=1
          if (m.outcomes && m.outcomes.length >= 2) {
            const tickerNo = await getTicker(m.id, 1)
            noPrice =
              tickerNo?.midPrice ??
              tickerNo?.bestAsk ??
              (yesPrice != null ? 1 - yesPrice : null)

            // Если всё ещё нет, пробуем через getOutcomePrices
            if (noPrice === null && yesPrice === null) {
              try {
                const outcomePrices = await getOutcomePrices(m.id)
                const noOutcome = outcomePrices.find((p) => p.outcomeIndex === 1)
                noPrice =
                  noOutcome?.bestAskPrice ?? noOutcome?.bestBidPrice ?? null
              } catch {
                // Игнорируем ошибку
              }
            }
          } else if (yesPrice != null) {
            noPrice = 1 - yesPrice
          }

          const yesOdds = yesPrice && yesPrice > 0 ? 1 / yesPrice : null
          const noOdds = noPrice && noPrice > 0 ? 1 / noPrice : null

          return {
            id: m.id,
            question: m.question,
            outcomes: m.outcomes,
            endTime: m.endTime.toISOString(),
            status: m.status,
            volume: m.volume,
            liquidity: m.liquidity,
            yesPrice,
            noPrice,
            yesOdds,
            noOdds,
          }
        } catch (e) {
          console.error(
            '[MARKETS] Failed to enrich market with ticker',
            m.id,
            m.question,
            e
          )
          return {
            id: m.id,
            question: m.question,
            outcomes: m.outcomes,
            endTime: m.endTime.toISOString(),
            status: m.status,
            volume: m.volume,
            liquidity: m.liquidity,
            yesPrice: null,
            noPrice: null,
            yesOdds: null,
            noOdds: null,
          }
        }
      })
    )

    const enriched = enrichedResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        // Если промис rejected, возвращаем базовый объект без цен
        const market = markets[index]
        console.error(
          '[MARKETS] Promise rejected for market',
          market?.id,
          result.reason
        )
        return {
          id: market?.id || 'unknown',
          question: market?.question || 'Unknown',
          outcomes: market?.outcomes || [],
          endTime: market?.endTime.toISOString() || new Date().toISOString(),
          status: market?.status || 'unknown',
          volume: market?.volume || null,
          liquidity: market?.liquidity || null,
          yesPrice: null,
          noPrice: null,
          yesOdds: null,
          noOdds: null,
        }
      }
    })

    return NextResponse.json({ markets: enriched })
  } catch (error) {
    console.error('Error in /api/markets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch markets' },
      { status: 500 }
    )
  }
}


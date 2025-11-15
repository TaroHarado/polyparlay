export interface PolymarketRawMarket {
  id: string
  conditionId?: string
  eventId?: string
  question: string
  outcomes: string[]
  endDate: string
  status: string
  volume?: number
  liquidity?: number
  [key: string]: any
}

export interface NormalizedMarket {
  id: string // используем id/conditionId, выбери консистентную схему
  eventId: string | null
  question: string
  outcomes: string[]
  endTime: Date
  status: string
  volume: number | null
  liquidity: number | null
  raw: any
}


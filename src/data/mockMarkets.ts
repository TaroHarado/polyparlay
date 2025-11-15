export type MockOutcome = {
  id: string // "yes", "no" или что-то вроде "KC_CHIEFS"
  label: string // "Yes", "No", "Kansas City" и т.д.
  yesProbability: number // 0–1, вероятность "Yes" ИМЕННО для этого исхода
}

export type MockMarket = {
  id: string
  question: string
  category: string // "macro", "crypto", "sports", "politics", "ai", "misc"
  endsAt: string // ISO string
  volume: number // в USDC, условно
  outcomes: MockOutcome[]
}

export const MOCK_MARKETS: MockMarket[] = [
  // Fed decision
  {
    id: 'fed-dec-2025',
    question: 'Fed decision in December?',
    category: 'macro',
    endsAt: new Date('2025-12-15').toISOString(),
    volume: 97000000,
    outcomes: [
      { id: '50bps_decrease', label: '50+ bps decrease', yesProbability: 0.02 },
      { id: '25bps_decrease', label: '25 bps decrease', yesProbability: 0.48 },
      { id: 'no_change', label: 'No change', yesProbability: 0.51 },
      { id: '25bps_increase', label: '25+ bps increase', yesProbability: 0.01 },
    ],
  },
  // Super Bowl
  {
    id: 'superbowl-2026',
    question: 'Super Bowl Champion 2026',
    category: 'sports',
    endsAt: new Date('2026-02-08').toISOString(),
    volume: 533000000,
    outcomes: [
      { id: 'kc_chiefs', label: 'Kansas City', yesProbability: 0.12 },
      { id: 'philadelphia', label: 'Philadelphia', yesProbability: 0.11 },
      { id: 'la_rams', label: 'Los Angeles R', yesProbability: 0.1 },
      { id: 'buffalo', label: 'Buffalo', yesProbability: 0.1 },
      { id: 'detroit', label: 'Detroit', yesProbability: 0.09 },
    ],
  },
  // Bitcoin price November
  {
    id: 'btc-nov-2025',
    question: 'What price will Bitcoin hit in November?',
    category: 'crypto',
    endsAt: new Date('2025-11-30').toISOString(),
    volume: 26000000,
    outcomes: [
      { id: 'up_120k', label: '↑ 120,000', yesProbability: 0.04 },
      { id: 'up_115k', label: '↑ 115,000', yesProbability: 0.09 },
      { id: 'down_90k', label: '↓ 90,000', yesProbability: 0.39 },
      { id: 'down_85k', label: '↓ 85,000', yesProbability: 0.16 },
      { id: 'down_80k', label: '↓ 80,000', yesProbability: 0.07 },
    ],
  },
  // EPL Winner
  {
    id: 'epl-winner-2025',
    question: 'English Premier League Winner',
    category: 'sports',
    endsAt: new Date('2025-05-25').toISOString(),
    volume: 100000000,
    outcomes: [
      { id: 'arsenal', label: 'Arsenal', yesProbability: 0.55 },
      { id: 'man_city', label: 'Man City', yesProbability: 0.29 },
      { id: 'liverpool', label: 'Liverpool', yesProbability: 0.08 },
      { id: 'chelsea', label: 'Chelsea', yesProbability: 0.04 },
      { id: 'man_united', label: 'Man United', yesProbability: 0.03 },
    ],
  },
  // La Liga Winner
  {
    id: 'laliga-winner-2025',
    question: 'La Liga Winner',
    category: 'sports',
    endsAt: new Date('2025-05-25').toISOString(),
    volume: 24000000,
    outcomes: [
      { id: 'real_madrid', label: 'Real Madrid', yesProbability: 0.62 },
      { id: 'barcelona', label: 'Barcelona', yesProbability: 0.29 },
      { id: 'atletico', label: 'Atletico Madrid', yesProbability: 0.04 },
      { id: 'villarreal', label: 'Villarreal', yesProbability: 0.01 },
    ],
  },
  // Ethereum price November
  {
    id: 'eth-nov-2025',
    question: 'What price will Ethereum hit in November?',
    category: 'crypto',
    endsAt: new Date('2025-11-30').toISOString(),
    volume: 13000000,
    outcomes: [
      { id: 'up_4k', label: '↑ 4,000', yesProbability: 0.16 },
      { id: 'down_3k', label: '↓ 3,000', yesProbability: 0.65 },
      { id: 'down_2800', label: '↓ 2,800', yesProbability: 0.36 },
      { id: 'down_2600', label: '↓ 2,600', yesProbability: 0.18 },
      { id: 'down_2400', label: '↓ 2,400', yesProbability: 0.09 },
    ],
  },
  // Solana price November
  {
    id: 'sol-nov-2025',
    question: 'What price will Solana hit in November?',
    category: 'crypto',
    endsAt: new Date('2025-11-30').toISOString(),
    volume: 3000000,
    outcomes: [
      { id: 'up_300', label: '↑ 300', yesProbability: 0.001 },
      { id: 'up_270', label: '↑ 270', yesProbability: 0.01 },
      { id: 'up_250', label: '↑ 250', yesProbability: 0.01 },
      { id: 'up_230', label: '↑ 230', yesProbability: 0.03 },
      { id: 'up_200', label: '↑ 200', yesProbability: 0.06 },
      { id: 'down_130', label: '↓ 130', yesProbability: 0.62 },
      { id: 'down_120', label: '↓ 120', yesProbability: 0.37 },
      { id: 'down_110', label: '↓ 110', yesProbability: 0.17 },
    ],
  },
  // AI model end of 2025
  {
    id: 'ai-model-2025',
    question: 'Which company has best AI model end of 2025?',
    category: 'ai',
    endsAt: new Date('2025-12-31').toISOString(),
    volume: 8000000,
    outcomes: [
      { id: 'google', label: 'Google', yesProbability: 0.86 },
      { id: 'openai', label: 'OpenAI', yesProbability: 0.07 },
      { id: 'anthropic', label: 'Anthropic', yesProbability: 0.06 },
      { id: 'xai', label: 'xAI', yesProbability: 0.01 },
      { id: 'alibaba', label: 'Alibaba', yesProbability: 0.01 },
    ],
  },
  // Democratic Nominee 2028
  {
    id: 'dem-nominee-2028',
    question: 'Democratic Presidential Nominee 2028',
    category: 'politics',
    endsAt: new Date('2028-08-01').toISOString(),
    volume: 302000000,
    outcomes: [
      { id: 'newsom', label: 'Gavin Newsom', yesProbability: 0.38 },
      { id: 'aoc', label: 'Alexandria Ocasio-Cortez', yesProbability: 0.12 },
      { id: 'harris', label: 'Kamala Harris', yesProbability: 0.05 },
      { id: 'buttigieg', label: 'Pete Buttigieg', yesProbability: 0.05 },
      { id: 'ossoff', label: 'Jon Ossoff', yesProbability: 0.04 },
    ],
  },
  // Republican Nominee 2028
  {
    id: 'rep-nominee-2028',
    question: 'Republican Presidential Nominee 2028',
    category: 'politics',
    endsAt: new Date('2028-08-01').toISOString(),
    volume: 89000000,
    outcomes: [
      { id: 'vance', label: 'J.D. Vance', yesProbability: 0.59 },
      { id: 'rubio', label: 'Marco Rubio', yesProbability: 0.07 },
      { id: 'carlson', label: 'Tucker Carlson', yesProbability: 0.03 },
      { id: 'trump', label: 'Donald Trump', yesProbability: 0.03 },
      { id: 'greene', label: 'Marjorie Taylor Greene', yesProbability: 0.03 },
    ],
  },
  // Presidential Election 2028
  {
    id: 'pres-2028',
    question: 'Presidential Election Winner 2028',
    category: 'politics',
    endsAt: new Date('2028-11-05').toISOString(),
    volume: 121000000,
    outcomes: [
      { id: 'vance', label: 'JD Vance', yesProbability: 0.29 },
      { id: 'newsom', label: 'Gavin Newsom', yesProbability: 0.19 },
      { id: 'aoc', label: 'Alexandria Ocasio-Cortez', yesProbability: 0.09 },
      { id: 'trump', label: 'Donald Trump', yesProbability: 0.05 },
      { id: 'rubio', label: 'Marco Rubio', yesProbability: 0.04 },
    ],
  },
  // NBA Champion 2026
  {
    id: 'nba-2026',
    question: '2026 NBA Champion',
    category: 'sports',
    endsAt: new Date('2026-06-20').toISOString(),
    volume: 49000000,
    outcomes: [
      { id: 'okc', label: 'Oklahoma City Thunder', yesProbability: 0.33 },
      { id: 'denver', label: 'Denver Nuggets', yesProbability: 0.13 },
      { id: 'cleveland', label: 'Cleveland Cavaliers', yesProbability: 0.08 },
      { id: 'houston', label: 'Houston Rockets', yesProbability: 0.08 },
      { id: 'knicks', label: 'New York Knicks', yesProbability: 0.06 },
    ],
  },
  // UEFA Champions League
  {
    id: 'ucl-winner-2025',
    question: 'UEFA Champions League Winner',
    category: 'sports',
    endsAt: new Date('2025-05-31').toISOString(),
    volume: 75000000,
    outcomes: [
      { id: 'bayern', label: 'Bayern Munich', yesProbability: 0.17 },
      { id: 'arsenal', label: 'Arsenal', yesProbability: 0.16 },
      { id: 'psg', label: 'PSG', yesProbability: 0.11 },
      { id: 'real', label: 'Real Madrid', yesProbability: 0.11 },
      { id: 'liverpool', label: 'Liverpool', yesProbability: 0.1 },
      { id: 'barcelona', label: 'Barcelona', yesProbability: 0.1 },
      { id: 'man_city', label: 'Man City', yesProbability: 0.1 },
    ],
  },
  // Bitcoin price on November 15
  {
    id: 'btc-nov15-2025',
    question: 'Bitcoin price on November 15?',
    category: 'crypto',
    endsAt: new Date('2025-11-15').toISOString(),
    volume: 720000,
    outcomes: [
      { id: 'below_92k', label: '<92,000', yesProbability: 0.001 },
      { id: '92_94k', label: '92,000-94,000', yesProbability: 0.001 },
      { id: '94_96k', label: '94,000-96,000', yesProbability: 0.28 },
      { id: '96_98k', label: '96,000-98,000', yesProbability: 0.63 },
      { id: '98_100k', label: '98,000-100,000', yesProbability: 0.01 },
      { id: 'above_100k', label: '>100,000', yesProbability: 0.001 },
    ],
  },
  // Ethereum price on November 15
  {
    id: 'eth-nov15-2025',
    question: 'Ethereum price on November 15?',
    category: 'crypto',
    endsAt: new Date('2025-11-15').toISOString(),
    volume: 340000,
    outcomes: [
      { id: 'below_2900', label: '<2,900', yesProbability: 0.001 },
      { id: '2900_3000', label: '2,900-3,000', yesProbability: 0.01 },
      { id: '3000_3100', label: '3,000-3,100', yesProbability: 0.01 },
      { id: '3100_3200', label: '3,100-3,200', yesProbability: 0.82 },
      { id: '3200_3300', label: '3,200-3,300', yesProbability: 0.18 },
      { id: 'above_3300', label: '>3,300', yesProbability: 0.001 },
    ],
  },
  // Gemini 3.0 release
  {
    id: 'gemini-3-release',
    question: 'Gemini 3.0 released by...?',
    category: 'ai',
    endsAt: new Date('2025-12-31').toISOString(),
    volume: 13000000,
    outcomes: [
      { id: 'nov15', label: 'November 15', yesProbability: 0.001 },
      { id: 'nov22', label: 'November 22', yesProbability: 0.88 },
      { id: 'nov30', label: 'November 30', yesProbability: 0.93 },
      { id: 'dec31', label: 'December 31', yesProbability: 0.98 },
    ],
  },
  // Largest Company end of 2025
  {
    id: 'largest-company-2025',
    question: 'Largest Company end of 2025?',
    category: 'macro',
    endsAt: new Date('2025-12-31').toISOString(),
    volume: 29000000,
    outcomes: [
      { id: 'nvidia', label: 'NVIDIA', yesProbability: 0.9 },
      { id: 'apple', label: 'Apple', yesProbability: 0.07 },
      { id: 'microsoft', label: 'Microsoft', yesProbability: 0.02 },
      { id: 'alphabet', label: 'Alphabet', yesProbability: 0.01 },
      { id: 'tesla', label: 'Tesla', yesProbability: 0.001 },
    ],
  },
  // Time Person of the Year 2025
  {
    id: 'time-person-2025',
    question: 'Time 2025 Person of the Year',
    category: 'misc',
    endsAt: new Date('2025-12-31').toISOString(),
    volume: 4000000,
    outcomes: [
      { id: 'ai', label: 'Artificial Intelligence', yesProbability: 0.38 },
      { id: 'pope', label: 'Pope Leo XIV', yesProbability: 0.15 },
      { id: 'trump', label: 'Donald Trump', yesProbability: 0.11 },
      { id: 'netanyahu', label: 'Benjamin Netanyahu', yesProbability: 0.06 },
      { id: 'mamdani', label: 'Zohran Mamdani', yesProbability: 0.05 },
    ],
  },
  // House passes Epstein disclosure
  {
    id: 'epstein-disclosure-2025',
    question: 'House passes Epstein disclosure bill/resolution in 2025?',
    category: 'politics',
    endsAt: new Date('2025-12-31').toISOString(),
    volume: 369000,
    outcomes: [
      { id: 'yes', label: 'Yes', yesProbability: 0.93 },
      { id: 'no', label: 'No', yesProbability: 0.07 },
    ],
  },
  // US government shutdown
  {
    id: 'gov-shutdown-2025',
    question: 'Will there be another US government shutdown by January 31?',
    category: 'politics',
    endsAt: new Date('2025-01-31').toISOString(),
    volume: 42000,
    outcomes: [
      { id: 'yes', label: 'Yes', yesProbability: 0.31 },
      { id: 'no', label: 'No', yesProbability: 0.69 },
    ],
  },
  // Russia x Ukraine ceasefire
  {
    id: 'russia-ukraine-ceasefire-2025',
    question: 'Russia x Ukraine ceasefire in 2025?',
    category: 'politics',
    endsAt: new Date('2025-12-31').toISOString(),
    volume: 27000000,
    outcomes: [
      { id: 'yes', label: 'Yes', yesProbability: 0.05 },
      { id: 'no', label: 'No', yesProbability: 0.95 },
    ],
  },
  // Top Spotify Song 2025
  {
    id: 'spotify-song-2025',
    question: 'Top Spotify Song 2025',
    category: 'misc',
    endsAt: new Date('2025-12-31').toISOString(),
    volume: 916000,
    outcomes: [
      { id: 'die_smile', label: 'Die With a Smile by Lady Gaga and Bruno Mars', yesProbability: 0.93 },
      { id: 'ordinary', label: 'Ordinary by Alex Warren', yesProbability: 0.03 },
      { id: 'la_plena', label: 'La Plena by W Sound', yesProbability: 0.01 },
      { id: 'nuevayol', label: 'NUEVAYoL by Bad Bunny', yesProbability: 0.01 },
    ],
  },
  // Highest grossing movie 2025
  {
    id: 'movie-2025',
    question: 'Highest grossing movie in 2025?',
    category: 'misc',
    endsAt: new Date('2025-12-31').toISOString(),
    volume: 70000000,
    outcomes: [
      { id: 'wicked', label: 'Wicked: For Good', yesProbability: 0.57 },
      { id: 'zootopia2', label: 'Zootopia 2', yesProbability: 0.24 },
      { id: 'minecraft', label: 'A Minecraft Movie', yesProbability: 0.09 },
      { id: 'avatar3', label: 'Avatar 3', yesProbability: 0.08 },
      { id: 'lilo', label: 'Lilo & Stitch', yesProbability: 0.02 },
    ],
  },
]


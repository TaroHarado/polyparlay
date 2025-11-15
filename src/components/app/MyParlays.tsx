'use client'

interface SimParlay {
  id: string
  createdAt: string
  stake: number
  kTotal: number
  expectedPayout: number
  legs: Array<{
    marketId: string
    question: string
    outcomeIndex: number
    outcomeLabel: string
    price: number
    odds: number
  }>
}

interface MyParlaysProps {
  parlays: SimParlay[]
}

export default function MyParlays({ parlays }: MyParlaysProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-6 shadow-lg shadow-black/40 space-y-4">
      <h2 className="text-xl font-semibold">My Parlays</h2>

      {parlays.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          No parlays yet. Create your first parlay!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="pb-2">Date</th>
                <th className="pb-2">Legs</th>
                <th className="pb-2">Stake</th>
                <th className="pb-2 text-right">Odds</th>
                <th className="pb-2 text-right">Payout</th>
              </tr>
            </thead>
            <tbody>
              {parlays.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-white/5 transition-colors rounded-lg"
                >
                  <td className="py-3 pr-4 text-slate-400">
                    {new Date(p.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 pr-4 text-slate-300">
                    {p.legs.length}
                  </td>
                  <td className="py-3 pr-4 text-slate-300">
                    ${p.stake.toFixed(2)}
                  </td>
                  <td className="py-3 pr-4 text-right text-[#7C5CFF] font-semibold">
                    {p.kTotal.toFixed(2)}x
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-[#3BE4FF] font-semibold">
                      ${p.expectedPayout.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

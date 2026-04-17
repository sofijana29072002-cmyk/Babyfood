'use client'

import { IntroductionLog, Product, REACTION_LABELS, REACTION_COLORS } from '@/types'
import { formatDateRu } from '@/lib/utils/age'

interface Props {
  logs: (IntroductionLog & { product?: Product })[]
}

const BAD_REACTIONS = ['сыпь', 'живот', 'отказ', 'другое']

export function AllergiesClient({ logs }: Props) {
  const badLogs = logs.filter(l => BAD_REACTIONS.includes(l.reaction))
  const reactionCounts: Record<string, number> = {}
  for (const log of badLogs) {
    reactionCounts[log.reaction] = (reactionCounts[log.reaction] || 0) + 1
  }
  const maxCount = Math.max(...Object.values(reactionCounts), 1)

  const allergenProducts = badLogs.reduce<Record<string, typeof badLogs>>((acc, log) => {
    const name = log.product?.name || 'Неизвестно'
    if (!acc[name]) acc[name] = []
    acc[name].push(log)
    return acc
  }, {})

  const reactionColors: Record<string, string> = {
    сыпь: 'bg-red-500',
    живот: 'bg-orange-400',
    отказ: 'bg-gray-400',
    другое: 'bg-blue-400',
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">🚨 Аллергии и реакции</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Записей с реакцией: {badLogs.length} из {logs.length}
        </p>
      </div>

      {badLogs.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl">🎉</span>
          <p className="text-base font-semibold mt-3">Всё хорошо!</p>
          <p className="text-sm text-muted-foreground mt-1">Плохих реакций не зафиксировано</p>
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className="bg-card rounded-2xl p-5 border border-border">
            <h2 className="font-bold text-sm mb-4">📊 По типу реакции</h2>
            <div className="space-y-3">
              {Object.entries(reactionCounts).map(([reaction, count]) => (
                <div key={reaction} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-20 text-muted-foreground">{REACTION_LABELS[reaction as keyof typeof REACTION_LABELS] || reaction}</span>
                  <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${reactionColors[reaction] || 'bg-gray-400'}`}
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Products with reactions */}
          <div className="bg-card rounded-2xl p-5 border border-border">
            <h2 className="font-bold text-sm mb-4">🥕 Продукты с реакцией</h2>
            <div className="space-y-2">
              {Object.entries(allergenProducts)
                .sort((a, b) => b[1].length - a[1].length)
                .map(([name, productLogs]) => (
                  <div key={name} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <span className="text-xl">{productLogs[0].product?.emoji || '🥣'}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{name}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {productLogs.map(log => (
                          <span
                            key={log.id}
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${REACTION_COLORS[log.reaction] || ''}`}
                          >
                            {REACTION_LABELS[log.reaction] || log.reaction} · {formatDateRu(log.introduced_date)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      productLogs.length >= 2 ? 'bg-red-500' : 'bg-orange-400'
                    }`}>
                      {productLogs.length}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-card rounded-2xl p-5 border border-border">
            <h2 className="font-bold text-sm mb-4">📅 История реакций</h2>
            <div className="space-y-2">
              {badLogs.map(log => (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <span className="text-xl mt-0.5">{log.product?.emoji || '🥣'}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{log.product?.name}</p>
                      <span className="text-xs text-muted-foreground">{formatDateRu(log.introduced_date)}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${REACTION_COLORS[log.reaction] || ''}`}>
                      {REACTION_LABELS[log.reaction] || log.reaction}
                    </span>
                    {log.reaction_notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">"{log.reaction_notes}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

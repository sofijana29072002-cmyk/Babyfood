'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus } from 'lucide-react'
import { Product, ProductStatus, Reaction, REACTION_LABELS, REACTION_COLORS } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { formatDateRu } from '@/lib/utils/age'
import { useRouter } from 'next/navigation'

interface IntroLogSummary {
  product_id: string
  reaction: string
  rating: number | null
  introduced_date: string
}

interface ProductDetailModalProps {
  product: Product
  introLogs: IntroLogSummary[]
  status: ProductStatus
  onClose: () => void
  userId: string
}

export function ProductDetailModal({ product, introLogs, status, onClose, userId }: ProductDetailModalProps) {
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [reaction, setReaction] = useState<Reaction>('хорошо')
  const [notes, setNotes] = useState('')
  const [rating, setRating] = useState(3)
  const [saving, setSaving] = useState(false)

  const reactions: Reaction[] = ['хорошо', 'сыпь', 'живот', 'отказ', 'другое']

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('introduction_log').insert({
      user_id: userId,
      product_id: product.id,
      introduced_date: date,
      reaction,
      reaction_notes: notes || null,
      rating,
    })
    setSaving(false)
    setShowAddForm(false)
    router.refresh()
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-start justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{product.emoji}</span>
            <div>
              <h2 className="font-bold text-lg text-foreground">{product.name}</h2>
              <p className="text-xs text-muted-foreground">
                {product.category} · с {product.min_age_months} мес.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {product.allergen && (
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                ⚠️ Аллерген
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              status === 'introduced' ? 'bg-green-100 text-green-700' :
              status === 'reaction' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {status === 'introduced' ? '✅ Введён' :
               status === 'reaction' ? '⚠️ Была реакция' : '⭕ Не введён'}
            </span>
          </div>

          {/* Notes */}
          {product.notes && (
            <div className="bg-muted/50 rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                Рекомендации педиатра
              </h3>
              <p className="text-sm text-foreground leading-relaxed">{product.notes}</p>
            </div>
          )}

          {/* History */}
          {introLogs.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">История введения</h3>
              <div className="space-y-2">
                {introLogs.map((log, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{formatDateRu(log.introduced_date)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        REACTION_COLORS[log.reaction as Reaction] || ''
                      }`}>
                        {REACTION_LABELS[log.reaction as Reaction] || log.reaction}
                      </span>
                    </div>
                    {log.rating && (
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <span key={s} className={s < log.rating! ? '' : 'opacity-20'}>⭐</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add to diary */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Добавить в дневник
            </button>
          ) : (
            <div className="bg-muted/30 rounded-2xl p-4 space-y-4">
              <h3 className="font-semibold text-sm">Новая запись</h3>

              {/* Date */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Дата введения</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Reaction */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Реакция</label>
                <div className="flex flex-wrap gap-2">
                  {reactions.map(r => (
                    <button
                      key={r}
                      onClick={() => setReaction(r)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        reaction === r ? 'bg-primary text-primary-foreground' : 'bg-white border border-border'
                      }`}
                    >
                      {REACTION_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Как малышу понравилось?</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setRating(s)}>
                      <span className={s <= rating ? 'text-2xl' : 'text-2xl opacity-20'}>⭐</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Заметки (необязательно)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Как отреагировал малыш..."
                  className="w-full px-3 py-2 rounded-xl border border-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? '...' : 'Сохранить'}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

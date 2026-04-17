'use client'

import { useState } from 'react'
import { Plus, X, ChevronLeft, ChevronRight, Trash2, Camera, Download } from 'lucide-react'
import { IntroductionLog, Product, Reaction, REACTION_LABELS, REACTION_COLORS } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { formatDateRu } from '@/lib/utils/age'
import { useRouter } from 'next/navigation'

interface DiaryClientProps {
  introLogs: (IntroductionLog & { product?: Product })[]
  products: Pick<Product, 'id' | 'name' | 'emoji' | 'category' | 'min_age_months'>[]
  userId: string
}

type ViewMode = 'timeline' | 'calendar'

export function DiaryClient({ introLogs, products, userId }: DiaryClientProps) {
  const router = useRouter()
  const [view, setView] = useState<ViewMode>('timeline')
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Form state
  const [formProductId, setFormProductId] = useState('')
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formReaction, setFormReaction] = useState<Reaction>('хорошо')
  const [formNotes, setFormNotes] = useState('')
  const [formRating, setFormRating] = useState(3)
  const [formPhotoUrl, setFormPhotoUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [productSearch, setProductSearch] = useState('')

  const reactions: Reaction[] = ['хорошо', 'сыпь', 'живот', 'отказ', 'другое']
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  )

  const handleSave = async () => {
    if (!formProductId) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('introduction_log').insert({
      user_id: userId,
      product_id: formProductId,
      introduced_date: formDate,
      reaction: formReaction,
      reaction_notes: formNotes || null,
      rating: formRating,
      photo_url: formPhotoUrl || null,
    })
    setSaving(false)
    setShowForm(false)
    setFormProductId('')
    setFormNotes('')
    setFormRating(3)
    setFormReaction('хорошо')
    setFormPhotoUrl('')
    setProductSearch('')
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('introduction_log').delete().eq('id', id)
    setDeletingId(null)
    setConfirmDeleteId(null)
    router.refresh()
  }

  const handleExportPDF = () => {
    window.print()
  }

  // Calendar data
  const logsMap: Record<string, typeof introLogs> = {}
  for (const log of introLogs) {
    const d = log.introduced_date
    if (!logsMap[d]) logsMap[d] = []
    logsMap[d].push(log)
  }

  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7
  const monthYearStr = calendarMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
  const selectedDayLogs = logsMap[selectedDate] || []

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 no-print">
        <div>
          <h1 className="text-xl font-bold text-foreground">Дневник прикорма</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{introLogs.length} записей</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="p-2.5 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors"
            title="Экспорт в PDF"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-2xl font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Добавить
          </button>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">Дневник прикорма</h1>
        <p className="text-sm text-gray-500">Распечатано {new Date().toLocaleDateString('ru-RU')}</p>
      </div>

      {/* View toggle */}
      <div className="flex gap-1 p-1 bg-muted rounded-2xl mb-5 w-fit no-print">
        {(['timeline', 'calendar'] as ViewMode[]).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              view === v ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            {v === 'timeline' ? '📋 Лента' : '📅 Календарь'}
          </button>
        ))}
      </div>

      {/* Timeline view */}
      {view === 'timeline' && (
        <div className="space-y-3">
          {introLogs.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl">📔</span>
              <p className="text-sm text-muted-foreground mt-3">Дневник пока пуст</p>
              <p className="text-xs text-muted-foreground mt-1">Добавьте первую запись о прикорме</p>
            </div>
          ) : (
            introLogs.map((log) => {
              const reactionColor = REACTION_COLORS[log.reaction] || ''
              return (
                <div
                  key={log.id}
                  className="bg-card rounded-2xl p-4 border border-border shadow-sm animate-fade-in"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl mt-0.5">{log.product?.emoji || '🥣'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm text-foreground">{log.product?.name || 'Продукт'}</h3>
                        <div className="flex items-center gap-1 no-print">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDateRu(log.introduced_date)}
                          </span>
                          {confirmDeleteId === log.id ? (
                            <div className="flex items-center gap-1 ml-1">
                              <button
                                onClick={() => handleDelete(log.id)}
                                disabled={deletingId === log.id}
                                className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg hover:opacity-90"
                              >
                                {deletingId === log.id ? '...' : 'Удалить'}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-xs px-2 py-1 bg-muted rounded-lg"
                              >
                                Отмена
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(log.id)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors ml-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap print:block hidden">
                          {formatDateRu(log.introduced_date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${reactionColor}`}>
                          {REACTION_LABELS[log.reaction] || log.reaction}
                        </span>
                        {log.rating && (
                          <span className="text-xs">{'⭐'.repeat(log.rating)}{'☆'.repeat(5 - log.rating)}</span>
                        )}
                        <span className="text-xs text-muted-foreground">{log.product?.category}</span>
                      </div>

                      {log.reaction_notes && (
                        <p className="text-xs text-muted-foreground mt-1.5 italic">"{log.reaction_notes}"</p>
                      )}

                      {(log as any).photo_url && (
                        <img
                          src={(log as any).photo_url}
                          alt="Фото блюда"
                          className="mt-2 rounded-xl w-full max-w-[200px] h-auto object-cover border border-border"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Calendar view */}
      {view === 'calendar' && (
        <div>
          <div className="flex items-center justify-between mb-4 bg-card rounded-2xl p-4 border border-border no-print">
            <button
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
              className="p-2 rounded-xl hover:bg-muted"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-sm capitalize">{monthYearStr}</span>
            <button
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
              className="p-2 rounded-xl hover:bg-muted"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-card rounded-2xl p-4 border border-border mb-4">
            <div className="grid grid-cols-7 mb-2">
              {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dateStr = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const dayLogs = logsMap[dateStr] || []
                const isSelected = dateStr === selectedDate
                const isToday = dateStr === new Date().toISOString().split('T')[0]
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-medium transition-colors ${
                      isSelected ? 'bg-primary text-primary-foreground' :
                      isToday ? 'bg-primary/10 text-primary' :
                      'hover:bg-muted text-foreground'
                    }`}
                  >
                    {day}
                    {dayLogs.length > 0 && (
                      <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'}`} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">{formatDateRu(selectedDate)}</h3>
            {selectedDayLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Нет записей за этот день</p>
            ) : (
              <div className="space-y-2">
                {selectedDayLogs.map(log => (
                  <div key={log.id} className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border">
                    <span className="text-2xl">{log.product?.emoji || '🥣'}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{log.product?.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${REACTION_COLORS[log.reaction] || ''}`}>
                        {REACTION_LABELS[log.reaction] || log.reaction}
                      </span>
                    </div>
                    <button
                      onClick={() => setConfirmDeleteId(log.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors no-print"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add form modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4 no-print"
          onClick={() => setShowForm(false)}
        >
          <div
            className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between rounded-t-3xl">
              <h2 className="font-bold text-base">Новая запись</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-xl hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Product search */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Продукт</label>
                <input
                  type="text"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="Поиск продукта..."
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                  {filteredProducts.slice(0, 20).map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setFormProductId(p.id); setProductSearch(p.name) }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-muted text-left transition-colors ${
                        formProductId === p.id ? 'bg-primary/10 text-primary' : ''
                      }`}
                    >
                      <span>{p.emoji}</span>
                      <span className="flex-1">{p.name}</span>
                      <span className="text-xs text-muted-foreground">{p.category}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Дата</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Reaction */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Реакция</label>
                <div className="flex flex-wrap gap-2">
                  {reactions.map(r => (
                    <button
                      key={r}
                      onClick={() => setFormReaction(r)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        formReaction === r ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'
                      }`}
                    >
                      {REACTION_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Оценка малыша</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setFormRating(s)} className="text-2xl">
                      {s <= formRating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo URL */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1 block">
                  <Camera className="w-3.5 h-3.5" /> Фото блюда (ссылка на фото)
                </label>
                <input
                  type="url"
                  value={formPhotoUrl}
                  onChange={e => setFormPhotoUrl(e.target.value)}
                  placeholder="https://... (необязательно)"
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {formPhotoUrl && (
                  <img src={formPhotoUrl} alt="preview" className="mt-2 rounded-xl max-h-32 object-cover border border-border" />
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Заметки</label>
                <textarea
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="Как прошло введение..."
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={!formProductId || saving}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-2xl hover:opacity-90 disabled:opacity-40"
              >
                {saving ? 'Сохранение...' : 'Сохранить запись'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Plus, X, Trash2, Stethoscope } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface DoctorNote {
  id: string
  title: string
  content: string
  visit_date: string | null
  created_at: string
}

interface Props {
  notes: DoctorNote[]
  userId: string
}

export function DoctorNotesClient({ notes, userId }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [visitDate, setVisitDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleSave = async () => {
    if (!title || !content) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('doctor_notes').insert({
      user_id: userId,
      title,
      content,
      visit_date: visitDate || null,
    })
    setSaving(false)
    setShowForm(false)
    setTitle('')
    setContent('')
    setVisitDate('')
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('doctor_notes').delete().eq('id', id)
    setDeletingId(null)
    setConfirmDeleteId(null)
    router.refresh()
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" />
            Заметки педиатра
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{notes.length} записей</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-2xl font-semibold text-sm hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Добавить
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl">👨‍⚕️</span>
          <p className="text-base font-semibold mt-3">Заметок пока нет</p>
          <p className="text-sm text-muted-foreground mt-1">Записывайте рекомендации педиатра</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map(note => (
            <div key={note.id} className="bg-card rounded-2xl p-4 border border-border shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{note.title}</h3>
                  {note.visit_date && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      📅 Визит: {new Date(note.visit_date).toLocaleDateString('ru-RU')}
                    </p>
                  )}
                  <p className="text-sm text-foreground mt-2 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                </div>
                {confirmDeleteId === note.id ? (
                  <div className="flex flex-col gap-1 ml-2 flex-shrink-0">
                    <button
                      onClick={() => handleDelete(note.id)}
                      disabled={deletingId === note.id}
                      className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-90"
                    >
                      {deletingId === note.id ? '...' : 'Удалить'}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-xs px-3 py-1.5 bg-muted rounded-xl"
                    >
                      Отмена
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(note.id)}
                    className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between rounded-t-3xl">
              <h2 className="font-bold text-base">Новая заметка</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Заголовок</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Например: Плановый осмотр в 6 месяцев"
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Дата визита</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={e => setVisitDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Рекомендации</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={5}
                  placeholder="Запишите рекомендации врача, назначения, вес и рост малыша..."
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={!title || !content || saving}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-2xl hover:opacity-90 disabled:opacity-40"
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

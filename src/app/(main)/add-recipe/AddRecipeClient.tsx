'use client'

import { useState } from 'react'
import { Plus, Trash2, ChefHat } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { MealType } from '@/types'

interface Ingredient { name: string; amount: number; unit: string }

export function AddRecipeClient({ userId }: { userId: string }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('🥣')
  const [mealType, setMealType] = useState<MealType>('завтрак')
  const [minAge, setMinAge] = useState(6)
  const [prepTime, setPrepTime] = useState(15)
  const [servings, setServings] = useState(1)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [tags, setTags] = useState('')
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: 0, unit: 'г' }])
  const [instructions, setInstructions] = useState([''])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const mealTypes: MealType[] = ['завтрак', 'обед', 'ужин', 'перекус']
  const emojiOptions = ['🥣', '🥕', '🍎', '🍗', '🐟', '🥦', '🍚', '🥚', '🧆', '🫕', '🍲', '🥗']

  const addIngredient = () => setIngredients(prev => [...prev, { name: '', amount: 0, unit: 'г' }])
  const removeIngredient = (i: number) => setIngredients(prev => prev.filter((_, idx) => idx !== i))
  const updateIngredient = (i: number, field: keyof Ingredient, value: string | number) => {
    setIngredients(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing))
  }

  const addStep = () => setInstructions(prev => [...prev, ''])
  const removeStep = (i: number) => setInstructions(prev => prev.filter((_, idx) => idx !== i))
  const updateStep = (i: number, value: string) => {
    setInstructions(prev => prev.map((s, idx) => idx === i ? value : s))
  }

  const handleSave = async () => {
    if (!title || ingredients.some(i => !i.name) || instructions.some(s => !s)) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('recipes').insert({
      title,
      emoji,
      meal_type: mealType,
      min_age_months: minAge,
      prep_time_minutes: prepTime,
      servings,
      ingredients: ingredients.filter(i => i.name),
      instructions: instructions.filter(s => s),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      youtube_url: youtubeUrl || null,
      is_custom: true,
      created_by: userId,
    })
    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => router.push('/recipes'), 1500)
    }
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <span className="text-6xl">✅</span>
        <h2 className="text-xl font-bold mt-4">Рецепт сохранён!</h2>
        <p className="text-sm text-muted-foreground mt-2">Переходим к рецептам...</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ChefHat className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-bold">Добавить рецепт</h1>
      </div>

      <div className="space-y-5">
        {/* Emoji */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">Эмодзи</label>
          <div className="flex flex-wrap gap-2">
            {emojiOptions.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`w-10 h-10 rounded-xl text-2xl flex items-center justify-center transition-colors ${
                  emoji === e ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Название рецепта *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Например: Пюре из кабачка с кроликом"
            className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Meal type */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">Тип приёма пищи</label>
          <div className="flex flex-wrap gap-2">
            {mealTypes.map(t => (
              <button
                key={t}
                onClick={() => setMealType(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  mealType === t ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Age, time, servings */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Возраст (мес.)</label>
            <input
              type="number" min={4} max={36} value={minAge}
              onChange={e => setMinAge(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Время (мин.)</label>
            <input
              type="number" min={1} value={prepTime}
              onChange={e => setPrepTime(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Порций</label>
            <input
              type="number" min={1} value={servings}
              onChange={e => setServings(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">Ингредиенты *</label>
          <div className="space-y-2">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  value={ing.name}
                  onChange={e => updateIngredient(i, 'name', e.target.value)}
                  placeholder="Продукт"
                  className="flex-1 px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="number" value={ing.amount || ''}
                  onChange={e => updateIngredient(i, 'amount', Number(e.target.value))}
                  placeholder="0"
                  className="w-16 px-2 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <select
                  value={ing.unit}
                  onChange={e => updateIngredient(i, 'unit', e.target.value)}
                  className="w-16 px-1 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {['г','мл','шт','ст.л.','ч.л.','щепотка'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                {ingredients.length > 1 && (
                  <button onClick={() => removeIngredient(i)} className="p-2 text-muted-foreground hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addIngredient}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Добавить ингредиент
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">Шаги приготовления *</label>
          <div className="space-y-2">
            {instructions.map((step, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-2">
                  {i + 1}
                </span>
                <textarea
                  value={step}
                  onChange={e => updateStep(i, e.target.value)}
                  rows={2}
                  placeholder={`Шаг ${i + 1}...`}
                  className="flex-1 px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
                {instructions.length > 1 && (
                  <button onClick={() => removeStep(i)} className="p-2 text-muted-foreground hover:text-red-500 mt-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addStep}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Добавить шаг
            </button>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Теги (через запятую)</label>
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="пюре, паровое, без глютена..."
            className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* YouTube */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Ссылка на YouTube (необязательно)</label>
          <input
            value={youtubeUrl}
            onChange={e => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!title || saving || ingredients.some(i => !i.name) || instructions.some(s => !s)}
          className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-2xl hover:opacity-90 disabled:opacity-40 text-base"
        >
          {saving ? 'Сохранение...' : '✨ Сохранить рецепт'}
        </button>
      </div>
    </div>
  )
}

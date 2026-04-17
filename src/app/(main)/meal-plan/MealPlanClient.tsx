'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles, ShoppingCart, X, Plus } from 'lucide-react'
import { Recipe, MealType, MealPlan, PlanData, WeekDay, MEAL_EMOJIS, WEEK_DAYS_RU, WEEK_DAYS_SHORT } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { getMonday, formatDateISO, formatDateShort } from '@/lib/utils/age'
import { generateWeekPlan, WEEK_ORDER, MEAL_ORDER, generateShoppingList } from '@/lib/utils/mealplan'
import { useRouter } from 'next/navigation'

interface MealPlanClientProps {
  recipes: Recipe[]
  currentPlan: MealPlan | null
  weekStart: string
  userId: string
  babyAge: number
}

export function MealPlanClient({ recipes, currentPlan, weekStart: initialWeekStart, userId, babyAge }: MealPlanClientProps) {
  const router = useRouter()
  const [weekStart, setWeekStart] = useState(initialWeekStart)
  const [planData, setPlanData] = useState<PlanData>(currentPlan?.plan_data || {})
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showRecipePicker, setShowRecipePicker] = useState<{day: WeekDay; meal: MealType} | null>(null)
  const [pickerSearch, setPickerSearch] = useState('')

  const recipesMap = Object.fromEntries(recipes.map(r => [r.id, r]))

  // Calculate week dates
  const weekMonday = new Date(weekStart + 'T00:00:00')
  const weekDates = WEEK_ORDER.map((_, i) => {
    const d = new Date(weekMonday)
    d.setDate(weekMonday.getDate() + i)
    return d
  })

  const today = formatDateISO(new Date())

  const navigateWeek = async (direction: number) => {
    const newMonday = new Date(weekStart + 'T00:00:00')
    newMonday.setDate(newMonday.getDate() + direction * 7)
    const newWeekStart = formatDateISO(newMonday)
    setWeekStart(newWeekStart)

    // Load plan for new week
    const supabase = createClient()
    const { data } = await supabase
      .from('meal_plans')
      .select('plan_data')
      .eq('user_id', userId)
      .eq('week_start', newWeekStart)
      .single()

    setPlanData(data?.plan_data || {})
  }

  const handleAutoGenerate = async () => {
    setGenerating(true)
    const plan = generateWeekPlan(recipes, babyAge, [])
    setPlanData(plan)

    const supabase = createClient()
    await supabase.from('meal_plans').upsert({
      user_id: userId,
      week_start: weekStart,
      plan_data: plan,
    }, { onConflict: 'user_id,week_start' })

    setGenerating(false)
    router.refresh()
  }

  const handleSavePlan = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('meal_plans').upsert({
      user_id: userId,
      week_start: weekStart,
      plan_data: planData,
    }, { onConflict: 'user_id,week_start' })
    setSaving(false)
    router.refresh()
  }

  const handleRecipePick = async (recipeId: string) => {
    if (!showRecipePicker) return
    const { day, meal } = showRecipePicker

    const newPlan = {
      ...planData,
      [day]: {
        ...(planData[day] || {}),
        [meal]: recipeId,
      }
    }
    setPlanData(newPlan)

    const supabase = createClient()
    await supabase.from('meal_plans').upsert({
      user_id: userId,
      week_start: weekStart,
      plan_data: newPlan,
    }, { onConflict: 'user_id,week_start' })

    setShowRecipePicker(null)
    setPickerSearch('')
  }

  const handleClearCell = (day: WeekDay, meal: MealType) => {
    const newPlan = { ...planData, [day]: { ...(planData[day] || {}), [meal]: null } }
    setPlanData(newPlan)
  }

  const handleGenerateShoppingList = async () => {
    const supabase = createClient()

    // Get or create meal plan
    const { data: plan } = await supabase
      .from('meal_plans')
      .select('id')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .single()

    if (!plan) return

    const items = generateShoppingList(planData, recipesMap)

    await supabase.from('shopping_lists').insert({
      user_id: userId,
      meal_plan_id: plan.id,
      items,
    })

    router.push('/shopping-list')
  }

  const filteredRecipes = recipes.filter(r => {
    if (showRecipePicker?.meal && r.meal_type !== showRecipePicker.meal) return false
    if (pickerSearch && !r.title.toLowerCase().includes(pickerSearch.toLowerCase())) return false
    return true
  })

  const weekRangeStr = `${formatDateShort(weekDates[0])} — ${formatDateShort(weekDates[6])}`
  const isCurrentWeek = weekStart === formatDateISO(getMonday())

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">План питания</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{weekRangeStr}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateShoppingList}
            className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-xl text-xs font-medium hover:bg-muted"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Покупки
          </button>
          <button
            onClick={handleAutoGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-medium hover:opacity-90 disabled:opacity-60"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {generating ? '...' : 'Авто'}
          </button>
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center gap-2 mb-5">
        <button onClick={() => navigateWeek(-1)} className="p-2 rounded-xl border border-border hover:bg-muted">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 text-center">
          <span className="text-sm font-medium">{weekRangeStr}</span>
          {isCurrentWeek && <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Эта неделя</span>}
        </div>
        <button onClick={() => navigateWeek(1)} className="p-2 rounded-xl border border-border hover:bg-muted">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Desktop: full week grid */}
      <div className="hidden md:block">
        <div className="grid grid-cols-8 gap-2">
          {/* Header row */}
          <div className="col-span-1" />
          {WEEK_ORDER.map((day, i) => {
            const dateStr = formatDateISO(weekDates[i])
            const isToday = dateStr === today
            return (
              <div key={day} className={`text-center p-2 rounded-xl ${isToday ? 'bg-primary/10' : ''}`}>
                <p className="text-xs font-medium text-muted-foreground">{WEEK_DAYS_SHORT[day]}</p>
                <p className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                  {weekDates[i].getDate()}
                </p>
              </div>
            )
          })}

          {/* Meal rows */}
          {MEAL_ORDER.map(mealType => (
            <>
              <div key={`label-${mealType}`} className="flex flex-col justify-center p-2">
                <span className="text-lg">{MEAL_EMOJIS[mealType]}</span>
                <span className="text-xs font-medium text-muted-foreground capitalize">{mealType}</span>
              </div>
              {WEEK_ORDER.map(day => {
                const recipeId = planData[day]?.[mealType]
                const recipe = recipeId ? recipesMap[recipeId] : null
                return (
                  <MealCell
                    key={`${day}-${mealType}`}
                    recipe={recipe}
                    onClick={() => setShowRecipePicker({ day, meal: mealType })}
                    onClear={() => handleClearCell(day, mealType)}
                  />
                )
              })}
            </>
          ))}
        </div>
      </div>

      {/* Mobile: card per day */}
      <div className="md:hidden space-y-4">
        {WEEK_ORDER.map((day, i) => {
          const dateStr = formatDateISO(weekDates[i])
          const isToday = dateStr === today
          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isToday ? 'border-primary' : 'border-border'}`}
            >
              {/* Day header */}
              <div className={`px-4 py-2.5 flex items-center justify-between ${isToday ? 'bg-primary/10' : 'bg-muted/30'}`}>
                <span className={`font-semibold text-sm ${isToday ? 'text-primary' : 'text-foreground'}`}>
                  {WEEK_DAYS_RU[day]}
                </span>
                <span className="text-xs text-muted-foreground">{formatDateShort(weekDates[i])}</span>
              </div>

              {/* Meals */}
              <div className="p-3 grid grid-cols-2 gap-2">
                {MEAL_ORDER.map(mealType => {
                  const recipeId = planData[day]?.[mealType]
                  const recipe = recipeId ? recipesMap[recipeId] : null
                  return (
                    <button
                      key={mealType}
                      onClick={() => recipe
                        ? handleClearCell(day, mealType)
                        : setShowRecipePicker({ day, meal: mealType })
                      }
                      className={`relative flex flex-col items-start gap-1 p-2.5 rounded-xl transition-colors text-left ${
                        recipe ? 'bg-muted/30' : 'bg-muted/10 border border-dashed border-border'
                      }`}
                    >
                      <span className="text-base">{recipe?.emoji || MEAL_EMOJIS[mealType]}</span>
                      <span className="text-xs text-muted-foreground">{mealType}</span>
                      {recipe ? (
                        <span className="text-xs font-medium text-foreground leading-tight line-clamp-2">{recipe.title}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">+ Добавить</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Recipe picker modal */}
      <AnimatePresence>
        {showRecipePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowRecipePicker(null)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[80vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between rounded-t-3xl">
                <div>
                  <h3 className="font-bold text-base">Выбрать рецепт</h3>
                  <p className="text-xs text-muted-foreground">
                    {MEAL_EMOJIS[showRecipePicker.meal]} {showRecipePicker.meal} · {WEEK_DAYS_RU[showRecipePicker.day]}
                  </p>
                </div>
                <button onClick={() => setShowRecipePicker(null)} className="p-2 rounded-xl hover:bg-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3">
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  placeholder="Поиск рецепта..."
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="overflow-y-auto flex-1 px-3 pb-4 space-y-2">
                {filteredRecipes.map(recipe => (
                  <button
                    key={recipe.id}
                    onClick={() => handleRecipePick(recipe.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted text-left transition-colors"
                  >
                    <span className="text-2xl flex-shrink-0">{recipe.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{recipe.title}</p>
                      <p className="text-xs text-muted-foreground">{recipe.prep_time_minutes} мин · {recipe.servings} порц.</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================
// Meal cell for desktop grid
// ============================================================
function MealCell({
  recipe,
  onClick,
  onClear,
}: {
  recipe: Recipe | null | undefined
  onClick: () => void
  onClear: () => void
}) {
  if (!recipe) {
    return (
      <button
        onClick={onClick}
        className="h-20 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center"
      >
        <Plus className="w-4 h-4 text-muted-foreground" />
      </button>
    )
  }

  return (
    <div className="relative group h-20 rounded-xl bg-muted/30 p-2 overflow-hidden hover:bg-muted/50 transition-colors">
      <span className="text-lg leading-none">{recipe.emoji}</span>
      <p className="text-xs font-medium text-foreground line-clamp-2 mt-0.5 leading-tight">{recipe.title}</p>
      <button
        onClick={onClear}
        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}

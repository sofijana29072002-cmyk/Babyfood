'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Clock, ChefHat, Heart, ArrowLeft } from 'lucide-react'
import { Recipe, MealType, MEAL_EMOJIS } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface RecipesClientProps {
  recipes: Recipe[]
  favoriteIds: string[]
  babyAge: number
  userId: string
}

const MEAL_TYPES: { value: MealType | 'all'; label: string }[] = [
  { value: 'all', label: '🍽️ Все' },
  { value: 'завтрак', label: '🌅 Завтрак' },
  { value: 'обед', label: '☀️ Обед' },
  { value: 'ужин', label: '🌙 Ужин' },
  { value: 'перекус', label: '🍎 Перекус' },
]

const TAGS = ['без глютена', 'без молока', 'паровое', 'пюре', 'каша', 'суп-пюре', 'мясное', 'рыбное', 'молочное']

export function RecipesClient({ recipes, favoriteIds: initialFavorites, babyAge, userId }: RecipesClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [mealType, setMealType] = useState<MealType | 'all'>('all')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [favorites, setFavorites] = useState(new Set(initialFavorites))
  const [saving, setSaving] = useState<string | null>(null)

  const filteredRecipes = useMemo(() => {
    return recipes.filter(r => {
      if (mealType !== 'all' && r.meal_type !== mealType) return false
      if (activeTag && !r.tags.includes(activeTag)) return false
      if (showFavoritesOnly && !favorites.has(r.id)) return false
      if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [recipes, mealType, activeTag, showFavoritesOnly, search, favorites])

  const handleFavoriteToggle = async (recipeId: string) => {
    if (saving) return
    setSaving(recipeId)
    const supabase = createClient()
    const isFav = favorites.has(recipeId)

    if (isFav) {
      await supabase.from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
      setFavorites(prev => { const s = new Set(prev); s.delete(recipeId); return s })
    } else {
      await supabase.from('favorites').insert({ user_id: userId, recipe_id: recipeId })
      setFavorites(prev => new Set([...prev, recipeId]))
    }
    setSaving(null)
  }

  const mealTypeColors: Record<string, string> = {
    завтрак: 'bg-amber-100 text-amber-700',
    обед: 'bg-orange-100 text-orange-700',
    ужин: 'bg-indigo-100 text-indigo-700',
    перекус: 'bg-green-100 text-green-700',
  }

  if (selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        isFavorite={favorites.has(selectedRecipe.id)}
        onFavoriteToggle={handleFavoriteToggle}
        onBack={() => setSelectedRecipe(null)}
      />
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">Рецепты</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {recipes.length} рецептов для {babyAge}+ месяцев
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск рецепта..."
          className="w-full pl-10 pr-10 py-3 rounded-2xl border border-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Meal type filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-thin">
        {MEAL_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => setMealType(t.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              mealType === t.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-white border border-border hover:bg-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
            showFavoritesOnly ? 'bg-red-100 text-red-600' : 'bg-white border border-border'
          }`}
        >
          <Heart className="w-3.5 h-3.5" fill={showFavoritesOnly ? 'currentColor' : 'none'} />
          Избранное
        </button>
      </div>

      {/* Tag filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-thin">
        {TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeTag === tag ? 'bg-foreground text-background' : 'bg-white border border-border'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mb-3">Найдено: {filteredRecipes.length}</p>

      {/* Recipe grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredRecipes.map((recipe, i) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="p-4 cursor-pointer" onClick={() => setSelectedRecipe(recipe)}>
              <div className="flex items-start justify-between">
                <span className="text-3xl">{recipe.emoji}</span>
                <button
                  onClick={e => { e.stopPropagation(); handleFavoriteToggle(recipe.id) }}
                  className={`p-1.5 rounded-xl ${favorites.has(recipe.id) ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
                >
                  <Heart className="w-5 h-5" fill={favorites.has(recipe.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <h3 className="mt-2 font-semibold text-sm leading-tight">{recipe.title}</h3>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${mealTypeColors[recipe.meal_type] || 'bg-gray-100'}`}>
                  {MEAL_EMOJIS[recipe.meal_type as MealType]} {recipe.meal_type}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  с {recipe.min_age_months} мес.
                </span>
              </div>
              <div className="flex gap-3 mt-2.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{recipe.prep_time_minutes} мин</span>
                <span className="flex items-center gap-1"><ChefHat className="w-3 h-3" />{recipe.servings} порц.</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl">🍽️</span>
          <p className="text-sm text-muted-foreground mt-2">Рецепты не найдены</p>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Recipe Detail View
// ============================================================

function RecipeDetail({
  recipe,
  isFavorite,
  onFavoriteToggle,
  onBack,
}: {
  recipe: Recipe
  isFavorite: boolean
  onFavoriteToggle: (id: string) => void
  onBack: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 md:p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>
        <button
          onClick={() => onFavoriteToggle(recipe.id)}
          className={`p-2 rounded-xl transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
        >
          <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="px-4 md:px-6 space-y-5">
        {/* Hero */}
        <div className="bg-white rounded-3xl p-5 border border-border">
          <div className="flex items-start gap-4">
            <span className="text-5xl">{recipe.emoji}</span>
            <div>
              <h1 className="text-lg font-bold text-foreground">{recipe.title}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-sm px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {MEAL_EMOJIS[recipe.meal_type as MealType]} {recipe.meal_type}
                </span>
                <span className="text-sm px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  ⏱️ {recipe.prep_time_minutes} мин
                </span>
                <span className="text-sm px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  🍽️ {recipe.servings} порц.
                </span>
                <span className="text-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  с {recipe.min_age_months} мес.
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {recipe.tags.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-3xl p-5 border border-border">
          <h2 className="font-bold text-base mb-3">🛒 Ингредиенты</h2>
          <div className="space-y-2">
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground flex-1">{ing.name}</span>
                <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
                  {ing.amount} {ing.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-3xl p-5 border border-border">
          <h2 className="font-bold text-base mb-4">👩‍🍳 Приготовление</h2>
          <div className="space-y-4">
            {recipe.instructions.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <p className="text-sm text-foreground leading-relaxed pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

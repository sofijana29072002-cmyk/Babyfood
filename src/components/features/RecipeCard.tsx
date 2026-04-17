'use client'

import { motion } from 'framer-motion'
import { Clock, ChefHat, Heart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Recipe, MEAL_EMOJIS } from '@/types'

interface RecipeCardProps {
  recipe: Recipe
  isFavorite?: boolean
  onFavoriteToggle?: (id: string) => void
  onAddToPlan?: (id: string) => void
  onClick?: () => void
}

const mealTypeColors: Record<string, string> = {
  завтрак: 'bg-amber-50 text-amber-700',
  обед: 'bg-orange-50 text-orange-700',
  ужин: 'bg-indigo-50 text-indigo-700',
  перекус: 'bg-green-50 text-green-700',
}

export function RecipeCard({ recipe, isFavorite, onFavoriteToggle, onAddToPlan, onClick }: RecipeCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        'bg-white rounded-2xl border border-border shadow-sm',
        'hover:shadow-md transition-shadow duration-200 overflow-hidden'
      )}
    >
      {/* Card header (clickable) */}
      <div className="p-4 cursor-pointer" onClick={onClick}>
        <div className="flex items-start justify-between gap-2">
          <span className="text-3xl">{recipe.emoji}</span>
          {onFavoriteToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onFavoriteToggle(recipe.id)
              }}
              className={cn(
                'p-1.5 rounded-xl transition-colors',
                isFavorite ? 'text-red-500' : 'text-gray-300 hover:text-red-400'
              )}
            >
              <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        <h3 className="mt-2 font-semibold text-sm text-foreground leading-tight">{recipe.title}</h3>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {/* Meal type */}
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium',
            mealTypeColors[recipe.meal_type] || 'bg-gray-100 text-gray-600'
          )}>
            {MEAL_EMOJIS[recipe.meal_type as keyof typeof MEAL_EMOJIS]} {recipe.meal_type}
          </span>

          {/* Min age */}
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            с {recipe.min_age_months} мес.
          </span>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {recipe.prep_time_minutes} мин
          </span>
          <span className="flex items-center gap-1">
            <ChefHat className="w-3.5 h-3.5" />
            {recipe.servings} порц.
          </span>
        </div>

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {recipe.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Add to plan button */}
      {onAddToPlan && (
        <div className="px-4 pb-4">
          <button
            onClick={() => onAddToPlan(recipe.id)}
            className="w-full py-2 px-3 bg-primary/10 text-primary text-sm font-medium rounded-xl hover:bg-primary/20 transition-colors"
          >
            + В план питания
          </button>
        </div>
      )}
    </motion.div>
  )
}

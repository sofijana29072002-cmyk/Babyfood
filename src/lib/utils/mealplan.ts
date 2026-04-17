import { Recipe, MealType, PlanData, WeekDay, ShoppingItem } from '@/types'

export const WEEK_ORDER: WeekDay[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
]

export const MEAL_ORDER: MealType[] = ['завтрак', 'обед', 'ужин', 'перекус']

/**
 * Auto-generate a meal plan for the week based on available recipes
 */
export function generateWeekPlan(
  recipes: Recipe[],
  babyAgeMonths: number,
  introducedProductNames: string[]
): PlanData {
  const availableRecipes = recipes.filter(r => r.min_age_months <= babyAgeMonths)

  const byMealType: Record<MealType, Recipe[]> = {
    завтрак: availableRecipes.filter(r => r.meal_type === 'завтрак'),
    обед: availableRecipes.filter(r => r.meal_type === 'обед'),
    ужин: availableRecipes.filter(r => r.meal_type === 'ужин'),
    перекус: availableRecipes.filter(r => r.meal_type === 'перекус'),
  }

  const plan: PlanData = {}
  const usedThisWeek: Record<MealType, Set<string>> = {
    завтрак: new Set(),
    обед: new Set(),
    ужин: new Set(),
    перекус: new Set(),
  }

  for (const day of WEEK_ORDER) {
    plan[day] = {}

    for (const mealType of MEAL_ORDER) {
      const pool = byMealType[mealType]
      if (pool.length === 0) continue

      // Prefer recipes not used this week
      let candidates = pool.filter(r => !usedThisWeek[mealType].has(r.id))
      if (candidates.length === 0) {
        // Reset if we've used all
        usedThisWeek[mealType].clear()
        candidates = pool
      }

      // Pick a random recipe
      const recipe = candidates[Math.floor(Math.random() * candidates.length)]
      plan[day]![mealType] = recipe.id
      usedThisWeek[mealType].add(recipe.id)
    }
  }

  return plan
}

/**
 * Generate shopping list from meal plan + recipes
 */
export function generateShoppingList(
  plan: PlanData,
  recipesMap: Record<string, Recipe>
): ShoppingItem[] {
  const itemsMap: Record<string, ShoppingItem> = {}

  for (const day of WEEK_ORDER) {
    const dayPlan = plan[day]
    if (!dayPlan) continue

    for (const mealType of MEAL_ORDER) {
      const recipeId = dayPlan[mealType]
      if (!recipeId) continue

      const recipe = recipesMap[recipeId]
      if (!recipe) continue

      for (const ingredient of recipe.ingredients) {
        const key = `${ingredient.name}_${ingredient.unit}`
        if (itemsMap[key]) {
          itemsMap[key].amount += ingredient.amount
        } else {
          itemsMap[key] = {
            product_name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
            checked: false,
          }
        }
      }
    }
  }

  return Object.values(itemsMap).sort((a, b) =>
    a.product_name.localeCompare(b.product_name, 'ru')
  )
}

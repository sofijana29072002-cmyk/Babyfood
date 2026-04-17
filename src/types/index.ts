// ============================================================
// Малыш Ест — TypeScript Types
// ============================================================

export type ProductCategory = 'овощи' | 'фрукты' | 'крупы' | 'мясо' | 'рыба' | 'молочное' | 'другое'
export type MealType = 'завтрак' | 'обед' | 'ужин' | 'перекус'
export type Reaction = 'хорошо' | 'сыпь' | 'живот' | 'отказ' | 'другое'

export interface Profile {
  id: string
  baby_name: string
  baby_birthdate: string | null
  created_at: string
}

export interface Product {
  id: string
  name: string
  category: ProductCategory
  min_age_months: number
  allergen: boolean
  notes: string | null
  emoji: string
  created_at: string
}

export interface RecipeIngredient {
  name: string
  amount: number
  unit: string
  product_id?: string
}

export interface Recipe {
  id: string
  title: string
  meal_type: MealType
  min_age_months: number
  prep_time_minutes: number
  ingredients: RecipeIngredient[]
  instructions: string[]
  servings: number
  tags: string[]
  emoji: string
  created_at: string
}

export interface DayPlan {
  завтрак?: string | null
  обед?: string | null
  ужин?: string | null
  перекус?: string | null
}

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export type PlanData = {
  [K in WeekDay]?: DayPlan
}

export interface MealPlan {
  id: string
  user_id: string
  week_start: string
  plan_data: PlanData
  created_at: string
}

export interface IntroductionLog {
  id: string
  user_id: string
  product_id: string
  introduced_date: string
  reaction: Reaction
  reaction_notes: string | null
  rating: number | null
  created_at: string
  // joined
  product?: Product
}

export interface ShoppingItem {
  product_name: string
  amount: number
  unit: string
  category?: ProductCategory
  checked: boolean
}

export interface ShoppingList {
  id: string
  user_id: string
  meal_plan_id: string | null
  items: ShoppingItem[]
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  recipe_id: string
  created_at: string
  // joined
  recipe?: Recipe
}

// UI Helper types
export type ProductStatus = 'introduced' | 'not_introduced' | 'reaction'

export interface ProductWithStatus extends Product {
  status: ProductStatus
  lastReaction?: Reaction
  rating?: number
}

export interface CalendarDay {
  date: Date
  logs: IntroductionLog[]
}

export const WEEK_DAYS_RU: Record<WeekDay, string> = {
  monday: 'Понедельник',
  tuesday: 'Вторник',
  wednesday: 'Среда',
  thursday: 'Четверг',
  friday: 'Пятница',
  saturday: 'Суббота',
  sunday: 'Воскресенье',
}

export const WEEK_DAYS_SHORT: Record<WeekDay, string> = {
  monday: 'Пн',
  tuesday: 'Вт',
  wednesday: 'Ср',
  thursday: 'Чт',
  friday: 'Пт',
  saturday: 'Сб',
  sunday: 'Вс',
}

export const MEAL_TYPES_RU: Record<MealType, string> = {
  завтрак: 'Завтрак',
  обед: 'Обед',
  ужин: 'Ужин',
  перекус: 'Перекус',
}

export const MEAL_EMOJIS: Record<MealType, string> = {
  завтрак: '🌅',
  обед: '☀️',
  ужин: '🌙',
  перекус: '🍎',
}

export const CATEGORY_EMOJIS: Record<ProductCategory, string> = {
  овощи: '🥦',
  фрукты: '🍎',
  крупы: '🌾',
  мясо: '🥩',
  рыба: '🐟',
  молочное: '🥛',
  другое: '🫙',
}

export const REACTION_COLORS: Record<Reaction, string> = {
  хорошо: 'text-green-600 bg-green-50',
  сыпь: 'text-red-600 bg-red-50',
  живот: 'text-orange-600 bg-orange-50',
  отказ: 'text-gray-600 bg-gray-50',
  другое: 'text-blue-600 bg-blue-50',
}

export const REACTION_LABELS: Record<Reaction, string> = {
  хорошо: '✅ Хорошо',
  сыпь: '🔴 Сыпь',
  живот: '🟠 Живот',
  отказ: '😤 Отказ',
  другое: '❓ Другое',
}

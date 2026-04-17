import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch introduction log with product info
  const { data: introLogs } = await supabase
    .from('introduction_log')
    .select('*, product:products(*)')
    .eq('user_id', user.id)
    .order('introduced_date', { ascending: false })
    .limit(20)

  // Current week's meal plan
  const today = new Date()
  const monday = new Date(today)
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  const weekStart = monday.toISOString().split('T')[0]

  const { data: mealPlan } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start', weekStart)
    .single()

  // Get all products available for current age
  const babyAge = profile?.baby_birthdate
    ? (() => {
        const birth = new Date(profile.baby_birthdate)
        const now = new Date()
        const months = (now.getFullYear() - birth.getFullYear()) * 12 +
          (now.getMonth() - birth.getMonth())
        return Math.max(6, Math.min(12, months))
      })()
    : 6

  const { data: availableProducts } = await supabase
    .from('products')
    .select('*')
    .lte('min_age_months', babyAge)

  // Today's recipes if meal plan exists
  let todayRecipes: Record<string, any> = {}
  if (mealPlan?.plan_data) {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const todayKey = dayNames[today.getDay()]
    const todayPlan = mealPlan.plan_data[todayKey] || {}

    const recipeIds = Object.values(todayPlan).filter(Boolean) as string[]
    if (recipeIds.length > 0) {
      const { data: recipes } = await supabase
        .from('recipes')
        .select('*')
        .in('id', recipeIds)

      if (recipes) {
        const recipesMap = Object.fromEntries(recipes.map((r: any) => [r.id, r]))
        for (const [mealType, recipeId] of Object.entries(todayPlan)) {
          if (recipeId && recipesMap[recipeId as string]) {
            todayRecipes[mealType] = recipesMap[recipeId as string]
          }
        }
      }
    }
  }

  const introducedProductIds = new Set(introLogs?.map(l => l.product_id) || [])

  return (
    <DashboardClient
      profile={profile}
      introLogs={introLogs || []}
      availableProducts={availableProducts || []}
      introducedProductIds={Array.from(introducedProductIds)}
      todayRecipes={todayRecipes}
      babyAge={babyAge}
    />
  )
}

import { createClient } from '@/lib/supabase/server'
import { MealPlanClient } from './MealPlanClient'
import { getMonday, formatDateISO } from '@/lib/utils/age'

export default async function MealPlanPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('baby_birthdate')
    .eq('id', user.id)
    .single()

  const babyAge = profile?.baby_birthdate
    ? (() => {
        const birth = new Date(profile.baby_birthdate)
        const now = new Date()
        return Math.max(6, (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth()))
      })()
    : 6

  // Fetch all available recipes
  const { data: recipes } = await supabase
    .from('recipes')
    .select('*')
    .lte('min_age_months', babyAge)
    .order('meal_type', { ascending: true })

  // Current week's plan
  const weekStart = formatDateISO(getMonday())

  const { data: currentPlan } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start', weekStart)
    .single()

  return (
    <MealPlanClient
      recipes={recipes || []}
      currentPlan={currentPlan || null}
      weekStart={weekStart}
      userId={user.id}
      babyAge={babyAge}
    />
  )
}

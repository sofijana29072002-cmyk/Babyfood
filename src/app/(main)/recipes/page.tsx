import { createClient } from '@/lib/supabase/server'
import { RecipesClient } from './RecipesClient'

export default async function RecipesPage() {
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

  const { data: recipes } = await supabase
    .from('recipes')
    .select('*')
    .lte('min_age_months', babyAge)
    .order('min_age_months', { ascending: true })
    .order('title', { ascending: true })

  const { data: favorites } = await supabase
    .from('favorites')
    .select('recipe_id')
    .eq('user_id', user.id)

  return (
    <RecipesClient
      recipes={recipes || []}
      favoriteIds={(favorites || []).map((f: { recipe_id: string }) => f.recipe_id)}
      babyAge={babyAge}
      userId={user.id}
    />
  )
}

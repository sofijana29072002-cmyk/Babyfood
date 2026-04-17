import { createClient } from '@/lib/supabase/server'
import { AddRecipeClient } from './AddRecipeClient'

export default async function AddRecipePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return <AddRecipeClient userId={user.id} />
}

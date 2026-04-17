import { createClient } from '@/lib/supabase/server'
import { ShoppingListClient } from './ShoppingListClient'

export default async function ShoppingListPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: lists } = await supabase
    .from('shopping_lists')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const latestList = lists?.[0] || null

  return (
    <ShoppingListClient
      shoppingList={latestList}
      userId={user.id}
    />
  )
}

import { createClient } from '@/lib/supabase/server'
import { ProductsClient } from './ProductsClient'

export default async function ProductsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('baby_name, baby_birthdate')
    .eq('id', user.id)
    .single()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('min_age_months', { ascending: true })
    .order('name', { ascending: true })

  const { data: introLogs } = await supabase
    .from('introduction_log')
    .select('product_id, reaction, rating, introduced_date')
    .eq('user_id', user.id)
    .order('introduced_date', { ascending: false })

  const babyAge = profile?.baby_birthdate
    ? (() => {
        const birth = new Date(profile.baby_birthdate)
        const now = new Date()
        const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
        return Math.max(6, Math.min(12, months))
      })()
    : 6

  return (
    <ProductsClient
      products={products || []}
      introLogs={introLogs || []}
      babyAge={babyAge}
      userId={user.id}
    />
  )
}

import { createClient } from '@/lib/supabase/server'
import { DiaryClient } from './DiaryClient'

export default async function DiaryPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: introLogs } = await supabase
    .from('introduction_log')
    .select('*, product:products(*)')
    .eq('user_id', user.id)
    .order('introduced_date', { ascending: false })

  const babyAge = profile?.baby_birthdate
    ? (() => {
        const birth = new Date(profile.baby_birthdate)
        const now = new Date()
        return Math.max(6, (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth()))
      })()
    : 6

  const { data: products } = await supabase
    .from('products')
    .select('id, name, emoji, category, min_age_months')
    .lte('min_age_months', babyAge)
    .order('name', { ascending: true })

  return (
    <DiaryClient
      introLogs={introLogs || []}
      products={products || []}
      userId={user.id}
    />
  )
}

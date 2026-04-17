import { createClient } from '@/lib/supabase/server'
import { AllergiesClient } from './AllergiesClient'

export default async function AllergiesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: logs } = await supabase
    .from('introduction_log')
    .select('*, product:products(*)')
    .eq('user_id', user.id)
    .order('introduced_date', { ascending: false })

  return <AllergiesClient logs={logs || []} />
}

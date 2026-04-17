import { createClient } from '@/lib/supabase/server'
import { DoctorNotesClient } from './DoctorNotesClient'

export default async function DoctorNotesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: notes } = await supabase
    .from('doctor_notes')
    .select('*')
    .eq('user_id', user.id)
    .order('visit_date', { ascending: false })

  return <DoctorNotesClient notes={notes || []} userId={user.id} />
}

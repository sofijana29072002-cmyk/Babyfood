import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Check if profile is complete
    const { data: profile } = await supabase
      .from('profiles')
      .select('baby_name, baby_birthdate')
      .eq('id', user.id)
      .single()

    if (!profile?.baby_birthdate) {
      redirect('/onboarding')
    }
    redirect('/dashboard')
  }

  redirect('/login')
}

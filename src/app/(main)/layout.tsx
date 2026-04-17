import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomNavigation, SidebarNavigation } from '@/components/layout/Navigation'
import { BackgroundAnimation } from '@/components/BackgroundAnimation'
import { FeedingTimer } from '@/components/FeedingTimer'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundAnimation />
      <SidebarNavigation />
      <main className="md:ml-64 pb-24 md:pb-8 min-h-screen relative z-10">
        {children}
      </main>
      <BottomNavigation />
      <FeedingTimer />
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomNavigation, SidebarNavigation } from '@/components/layout/Navigation'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNavigation />
      <main className="md:ml-64 pb-24 md:pb-8 min-h-screen">
        {children}
      </main>
      <BottomNavigation />
    </div>
  )
}

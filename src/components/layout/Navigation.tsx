'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Apple, BookOpen, CalendarDays, ShoppingCart, FileText, HeartPulse, Stethoscope, AlertTriangle, PlusCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ThemeToggle } from '@/components/ThemeToggle'

const navItems = [
  { href: '/dashboard', label: 'Главная', icon: Home },
  { href: '/products', label: 'Продукты', icon: Apple },
  { href: '/diary', label: 'Дневник', icon: FileText },
  { href: '/recipes', label: 'Рецепты', icon: BookOpen },
  { href: '/meal-plan', label: 'План', icon: CalendarDays },
]

const extraItems = [
  { href: '/allergies', label: 'Аллергии', icon: HeartPulse },
  { href: '/doctor-notes', label: 'Заметки врача', icon: Stethoscope },
  { href: '/forbidden-foods', label: 'Нельзя до 1 года', icon: AlertTriangle },
  { href: '/add-recipe', label: 'Добавить рецепт', icon: PlusCircle },
  { href: '/profile', label: 'Профиль', icon: User },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-t border-border shadow-lg pb-safe md:hidden no-print">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div className="relative">
                {isActive && (
                  <div className="absolute inset-0 bg-primary/10 rounded-lg -m-1" />
                )}
                <Icon className={cn('w-5 h-5 relative z-10', isActive && 'stroke-[2.5]')} />
              </div>
              <span className={cn('text-xs font-medium', isActive ? 'opacity-100' : 'opacity-70')}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function SidebarNavigation() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-card border-r border-border p-4 fixed left-0 top-0 bottom-0 z-40 no-print overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-4 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-xl">🥣</div>
        <div>
          <h1 className="font-bold text-lg text-foreground leading-tight">Малыш Ест</h1>
          <p className="text-xs text-muted-foreground">Трекер прикорма</p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              {item.label}
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="my-3 border-t border-border" />

      {/* Extra nav */}
      <nav className="flex flex-col gap-1">
        <p className="text-xs font-semibold text-muted-foreground px-4 mb-1 uppercase tracking-wide">Дополнительно</p>
        {extraItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="my-3 border-t border-border" />

      {/* Shopping list */}
      <Link
        href="/shopping-list"
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium',
          pathname.startsWith('/shopping-list')
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <ShoppingCart className="w-5 h-5" />
        Список покупок
      </Link>

      {/* Theme toggle */}
      <div className="mt-auto pt-4 border-t border-border">
        <ThemeToggle />
      </div>
    </aside>
  )
}

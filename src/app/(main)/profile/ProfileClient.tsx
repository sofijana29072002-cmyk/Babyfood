'use client'

import { useState } from 'react'
import { User, Save, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Profile } from '@/types'

interface Props {
  profile: Profile | null
  userId: string
  email: string
}

export function ProfileClient({ profile, userId, email }: Props) {
  const router = useRouter()
  const [babyName, setBabyName] = useState(profile?.baby_name || '')
  const [babyBirthdate, setBabyBirthdate] = useState(profile?.baby_birthdate || '')
  const [avatarUrl, setAvatarUrl] = useState((profile as any)?.avatar_url || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update({
      baby_name: babyName,
      baby_birthdate: babyBirthdate || null,
      avatar_url: avatarUrl || null,
    }).eq('id', userId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = babyName ? babyName.slice(0, 2).toUpperCase() : '👶'

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-6">👤 Профиль</h1>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Аватар"
              className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl border-4 border-primary/20 shadow-lg">
              {initials}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>

      <div className="space-y-4">
        {/* Avatar URL */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">
            Ссылка на аватарку
          </label>
          <input
            value={avatarUrl}
            onChange={e => setAvatarUrl(e.target.value)}
            placeholder="https://... (ссылка на фото)"
            className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Вставьте ссылку на фото из интернета или загрузите на imgbb.com
          </p>
        </div>

        {/* Baby name */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Имя малыша</label>
          <input
            value={babyName}
            onChange={e => setBabyName(e.target.value)}
            placeholder="Имя малыша"
            className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Birthdate */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Дата рождения</label>
          <input
            type="date"
            value={babyBirthdate}
            onChange={e => setBabyBirthdate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-semibold rounded-2xl hover:opacity-90 disabled:opacity-40"
        >
          <Save className="w-4 h-4" />
          {saved ? '✓ Сохранено!' : saving ? 'Сохранение...' : 'Сохранить'}
        </button>

        {/* Divider */}
        <div className="border-t border-border pt-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Настройки</p>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  )
}

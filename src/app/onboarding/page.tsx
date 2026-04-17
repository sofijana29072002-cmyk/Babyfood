'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Baby, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [babyName, setBabyName] = useState('')
  const [babyBirthdate, setBabyBirthdate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!babyName.trim() || !babyBirthdate) {
      setError('Пожалуйста, заполните все поля')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      baby_name: babyName.trim(),
      baby_birthdate: babyBirthdate,
    })

    if (error) {
      setError('Ошибка сохранения, попробуйте снова')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-cream-50 to-lavender-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">👶</div>
          <h1 className="text-2xl font-bold text-foreground">Знакомство</h1>
          <p className="text-muted-foreground text-sm mt-1">Расскажите нам о вашем малыше</p>
        </div>

        {/* Steps indicator */}
        <div className="flex gap-2 justify-center mb-6">
          {[1, 2].map(s => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step ? 'w-8 bg-primary' : s < step ? 'w-4 bg-primary/40' : 'w-4 bg-muted'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-border"
            >
              <div className="flex items-center gap-2 mb-5">
                <Baby className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Как зовут малыша?</h2>
              </div>

              <input
                type="text"
                value={babyName}
                onChange={e => setBabyName(e.target.value)}
                placeholder="Например, Миша или Соня"
                maxLength={30}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                autoFocus
              />

              <button
                onClick={() => babyName.trim() && setStep(2)}
                disabled={!babyName.trim()}
                className="w-full mt-4 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                Далее →
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-border"
            >
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Дата рождения</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-5">
                Это нужно для подбора рецептов по возрасту {babyName ? `для ${babyName}` : ''}
              </p>

              <input
                type="date"
                value={babyBirthdate}
                onChange={e => setBabyBirthdate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                min={new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-xl mt-3">
                  {error}
                </p>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors"
                >
                  ← Назад
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || !babyBirthdate}
                  className="flex-1 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Начать 🎉
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Вы всегда сможете изменить данные в настройках
        </p>
      </div>
    </div>
  )
}

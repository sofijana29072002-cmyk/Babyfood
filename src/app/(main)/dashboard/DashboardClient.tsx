'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Baby, TrendingUp, Sparkles } from 'lucide-react'
import { Profile, Product, IntroductionLog, Recipe, MEAL_EMOJIS, MealType, CATEGORY_EMOJIS, ProductCategory } from '@/types'
import { formatBabyAge, formatDateRu } from '@/lib/utils/age'

interface DashboardClientProps {
  profile: Profile | null
  introLogs: (IntroductionLog & { product?: Product })[]
  availableProducts: Product[]
  introducedProductIds: string[]
  todayRecipes: Record<string, Recipe>
  babyAge: number
}

export function DashboardClient({
  profile,
  introLogs,
  availableProducts,
  introducedProductIds,
  todayRecipes,
  babyAge,
}: DashboardClientProps) {
  const babyName = profile?.baby_name || 'Малыш'
  const ageStr = profile?.baby_birthdate ? formatBabyAge(profile.baby_birthdate) : `${babyAge} месяцев`

  const totalAvailable = availableProducts.length
  const totalIntroduced = new Set(introLogs.map(l => l.product_id)).size
  const progress = totalAvailable > 0 ? Math.round((totalIntroduced / totalAvailable) * 100) : 0

  // Products not yet introduced but available by age
  const notIntroduced = availableProducts
    .filter(p => !introducedProductIds.includes(p.id))
    .slice(0, 6)

  const mealTypes: MealType[] = ['завтрак', 'обед', 'ужин', 'перекус']
  const hasTodayPlan = Object.keys(todayRecipes).length > 0

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between pt-2"
      >
        <div>
          <p className="text-sm text-muted-foreground">Добро пожаловать 👋</p>
          <h1 className="text-xl font-bold text-foreground">{babyName}</h1>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-2xl">
          <Baby className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">{ageStr}</span>
        </div>
      </motion.div>

      {/* Today's menu */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl p-5 border border-border shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-base flex items-center gap-2">
            ☀️ Меню на сегодня
          </h2>
          <Link href="/meal-plan" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
            Весь план <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {hasTodayPlan ? (
          <div className="grid grid-cols-2 gap-3">
            {mealTypes.map(mealType => {
              const recipe = todayRecipes[mealType]
              if (!recipe) return (
                <div key={mealType} className="rounded-2xl bg-muted/50 p-3 flex flex-col gap-1 border border-dashed border-border">
                  <span className="text-lg">{MEAL_EMOJIS[mealType]}</span>
                  <span className="text-xs font-medium text-muted-foreground capitalize">{mealType}</span>
                  <span className="text-xs text-muted-foreground">Не запланировано</span>
                </div>
              )
              return (
                <div key={mealType} className="rounded-2xl bg-muted/30 p-3 flex flex-col gap-1">
                  <span className="text-lg">{recipe.emoji || MEAL_EMOJIS[mealType]}</span>
                  <span className="text-xs font-medium text-muted-foreground capitalize">{mealType}</span>
                  <span className="text-xs font-semibold text-foreground leading-tight">{recipe.title}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">План питания на эту неделю не составлен</p>
            <Link
              href="/meal-plan"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              Составить план
            </Link>
          </div>
        )}
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-3xl p-5 border border-border shadow-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Прогресс прикорма
          </h2>
          <Link href="/products" className="text-xs text-primary font-medium hover:underline">
            Все продукты
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>
          <span className="text-sm font-bold text-primary">{progress}%</span>
        </div>

        <p className="text-xs text-muted-foreground">
          Введено <strong className="text-foreground">{totalIntroduced}</strong> из{' '}
          <strong className="text-foreground">{totalAvailable}</strong> доступных продуктов
        </p>
      </motion.div>

      {/* Try these next */}
      {notIntroduced.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-5 border border-border shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-base">🌟 Пора попробовать</h2>
            <Link href="/products" className="text-xs text-primary font-medium hover:underline">
              Ещё →
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {notIntroduced.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.05 }}
              >
                <Link
                  href={`/products?highlight=${product.id}`}
                  className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-muted/40 hover:bg-muted transition-colors text-center"
                >
                  <span className="text-2xl">{product.emoji}</span>
                  <span className="text-xs font-medium text-foreground leading-tight">{product.name}</span>
                  <span className="text-xs text-muted-foreground">{product.category}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent diary */}
      {introLogs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-3xl p-5 border border-border shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-base">📔 Последние записи</h2>
            <Link href="/diary" className="text-xs text-primary font-medium hover:underline">
              Весь дневник
            </Link>
          </div>

          <div className="space-y-3">
            {introLogs.slice(0, 4).map(log => {
              const reactionEmoji = {
                хорошо: '✅',
                сыпь: '🔴',
                живот: '🟠',
                отказ: '😤',
                другое: '❓',
              }[log.reaction] || '❓'

              return (
                <div key={log.id} className="flex items-center gap-3">
                  <span className="text-xl">{log.product?.emoji || '🥣'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{log.product?.name || 'Продукт'}</p>
                    <p className="text-xs text-muted-foreground">{formatDateRu(log.introduced_date)}</p>
                  </div>
                  <span className="text-base">{reactionEmoji}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-3"
      >
        <Link
          href="/diary"
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col gap-2 hover:bg-amber-100 transition-colors"
        >
          <span className="text-2xl">📝</span>
          <span className="text-sm font-semibold text-amber-800">Добавить запись</span>
          <span className="text-xs text-amber-600">Записать реакцию на новый продукт</span>
        </Link>
        <Link
          href="/recipes"
          className="bg-lavender-50 border border-lavender-200 rounded-2xl p-4 flex flex-col gap-2 hover:bg-lavender-100 transition-colors"
        >
          <span className="text-2xl">👩‍🍳</span>
          <span className="text-sm font-semibold text-purple-800">Рецепты</span>
          <span className="text-xs text-purple-600">Найти идею для блюда</span>
        </Link>
      </motion.div>
    </div>
  )
}

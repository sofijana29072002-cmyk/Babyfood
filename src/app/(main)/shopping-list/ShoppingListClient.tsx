'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, ShoppingCart, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { ShoppingList, ShoppingItem, ProductCategory, CATEGORY_EMOJIS } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ShoppingListClientProps {
  shoppingList: ShoppingList | null
  userId: string
}

const CATEGORY_ORDER: (ProductCategory | 'другое')[] = [
  'овощи', 'фрукты', 'крупы', 'мясо', 'рыба', 'молочное', 'другое'
]

// Simple product → category mapping
const PRODUCT_CATEGORIES: Record<string, ProductCategory> = {
  'кабачок': 'овощи', 'цветная капуста': 'овощи', 'брокколи': 'овощи', 'тыква': 'овощи',
  'морковь': 'овощи', 'картофель': 'овощи', 'зелёный горошек': 'овощи', 'стручковая фасоль': 'овощи',
  'свёкла': 'овощи', 'шпинат': 'овощи', 'укроп': 'овощи', 'петрушка': 'овощи',
  'помидор': 'овощи', 'огурец': 'овощи', 'баклажан': 'овощи', 'болгарский перец': 'овощи',
  'яблоко': 'фрукты', 'груша': 'фрукты', 'банан': 'фрукты', 'чернослив': 'фрукты',
  'персик': 'фрукты', 'абрикос': 'фрукты', 'слива': 'фрукты', 'черника': 'фрукты',
  'клубника': 'фрукты', 'малина': 'фрукты', 'виноград': 'фрукты', 'киви': 'фрукты',
  'манго': 'фрукты', 'арбуз': 'фрукты', 'дыня': 'фрукты',
  'гречневая крупа': 'крупы', 'рисовая крупа': 'крупы', 'кукурузная крупа': 'крупы',
  'овсяная крупа': 'крупы', 'пшённая крупа': 'крупы', 'ячневая крупа': 'крупы',
  'манная крупа': 'крупы', 'макароны': 'крупы', 'хлеб': 'крупы', 'детские сухари': 'крупы',
  'гречневая мука': 'крупы', 'рисовая мука': 'крупы',
  'индейка': 'мясо', 'кролик': 'мясо', 'курица': 'мясо', 'телятина': 'мясо',
  'говядина': 'мясо', 'свинина': 'мясо',
  'треска': 'рыба', 'хек': 'рыба', 'минтай': 'рыба', 'семга (лосось)': 'рыба',
  'творог': 'молочное', 'кефир': 'молочное', 'сливочное масло': 'молочное',
  'детский йогурт': 'молочное', 'мягкий сыр': 'молочное', 'цельное молоко': 'молочное',
  'сметана': 'молочное', 'ряженка': 'молочное',
}

function getCategory(name: string): ProductCategory {
  const lower = name.toLowerCase()
  for (const [key, cat] of Object.entries(PRODUCT_CATEGORIES)) {
    if (lower.includes(key)) return cat
  }
  return 'другое'
}

export function ShoppingListClient({ shoppingList, userId }: ShoppingListClientProps) {
  const router = useRouter()
  const [items, setItems] = useState<ShoppingItem[]>(
    (shoppingList?.items || []).map(item => ({
      ...item,
      category: getCategory(item.product_name),
    }))
  )
  const [copied, setCopied] = useState(false)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  const handleToggleItem = async (index: number) => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item
    )
    setItems(newItems)

    if (shoppingList) {
      const supabase = createClient()
      await supabase
        .from('shopping_lists')
        .update({ items: newItems })
        .eq('id', shoppingList.id)
    }
  }

  const handleCopyToClipboard = () => {
    const text = items
      .filter(item => !item.checked)
      .map(item => `• ${item.product_name} — ${item.amount} ${item.unit}`)
      .join('\n')

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClearChecked = async () => {
    const newItems = items.filter(i => !i.checked)
    setItems(newItems)
    if (shoppingList) {
      const supabase = createClient()
      await supabase.from('shopping_lists').update({ items: newItems }).eq('id', shoppingList.id)
    }
  }

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => {
      const s = new Set(prev)
      if (s.has(cat)) s.delete(cat)
      else s.add(cat)
      return s
    })
  }

  // Group by category
  const grouped: Record<string, ShoppingItem[]> = {}
  for (const item of items) {
    const cat = item.category || getCategory(item.product_name)
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  }

  const checkedCount = items.filter(i => i.checked).length
  const totalCount = items.length

  if (!shoppingList || items.length === 0) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <h1 className="text-xl font-bold mb-5">Список покупок</h1>
        <div className="text-center py-16">
          <span className="text-5xl">🛒</span>
          <p className="text-sm text-muted-foreground mt-3 mb-5">
            Список покупок ещё не создан.<br />
            Составьте план питания и нажмите «Сгенерировать список покупок»
          </p>
          <button
            onClick={() => router.push('/meal-plan')}
            className="px-5 py-3 bg-primary text-primary-foreground font-semibold rounded-2xl hover:opacity-90"
          >
            Перейти к плану питания
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Список покупок</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {checkedCount} из {totalCount} куплено
          </p>
        </div>
        <div className="flex gap-2">
          {checkedCount > 0 && (
            <button
              onClick={handleClearChecked}
              className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground"
              title="Удалить купленные"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleCopyToClipboard}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              copied ? 'bg-green-100 text-green-700' : 'border border-border hover:bg-muted'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Скопировано!' : 'Скопировать'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%` }}
            className="h-full bg-primary rounded-full transition-all duration-300"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {CATEGORY_ORDER.map(cat => {
          const catItems = grouped[cat]
          if (!catItems || catItems.length === 0) return null

          const isCollapsed = collapsedCategories.has(cat)
          const checkedInCat = catItems.filter(i => i.checked).length

          return (
            <div key={cat} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
              >
                <span className="text-xl">{CATEGORY_EMOJIS[cat as ProductCategory] || '🫙'}</span>
                <span className="font-semibold text-sm flex-1 text-left capitalize">{cat}</span>
                <span className="text-xs text-muted-foreground">{checkedInCat}/{catItems.length}</span>
                {isCollapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
              </button>

              {/* Items */}
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 space-y-2 border-t border-border">
                      {catItems.map((item, i) => {
                        const globalIndex = items.indexOf(item)
                        return (
                          <motion.div
                            key={i}
                            layout
                            className={`flex items-center gap-3 py-2 transition-opacity ${
                              item.checked ? 'opacity-50' : ''
                            }`}
                          >
                            <button
                              onClick={() => handleToggleItem(globalIndex)}
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                item.checked ? 'bg-primary border-primary' : 'border-border hover:border-primary'
                              }`}
                            >
                              {item.checked && <Check className="w-3 h-3 text-primary-foreground" />}
                            </button>
                            <span className={`flex-1 text-sm ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {item.product_name}
                            </span>
                            <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
                              {item.amount} {item.unit}
                            </span>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Empty state - everything checked */}
      {checkedCount === totalCount && totalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8 mt-4"
        >
          <span className="text-5xl">🎉</span>
          <p className="text-sm font-semibold text-foreground mt-2">Все покупки сделаны!</p>
          <p className="text-xs text-muted-foreground mt-1">Отличная работа!</p>
        </motion.div>
      )}
    </div>
  )
}

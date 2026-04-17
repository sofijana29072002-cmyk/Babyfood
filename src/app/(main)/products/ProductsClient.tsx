'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Filter, ChevronDown } from 'lucide-react'
import { Product, ProductStatus, ProductCategory, CATEGORY_EMOJIS } from '@/types'
import { ProductCard } from '@/components/features/ProductCard'
import { ProductDetailModal } from './ProductDetailModal'

interface IntroLogSummary {
  product_id: string
  reaction: string
  rating: number | null
  introduced_date: string
}

interface ProductsClientProps {
  products: Product[]
  introLogs: IntroLogSummary[]
  babyAge: number
  userId: string
}

const CATEGORIES: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'овощи', label: '🥦 Овощи' },
  { value: 'фрукты', label: '🍎 Фрукты' },
  { value: 'крупы', label: '🌾 Крупы' },
  { value: 'мясо', label: '🥩 Мясо' },
  { value: 'рыба', label: '🐟 Рыба' },
  { value: 'молочное', label: '🥛 Молочное' },
  { value: 'другое', label: '🫙 Другое' },
]

const STATUS_FILTERS = [
  { value: 'all', label: 'Все' },
  { value: 'introduced', label: '✅ Введён' },
  { value: 'not_introduced', label: '⭕ Не введён' },
  { value: 'reaction', label: '⚠️ Реакция' },
]

export function ProductsClient({ products, introLogs, babyAge, userId }: ProductsClientProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ProductCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all')
  const [ageFilter, setAgeFilter] = useState<number>(babyAge)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Build intro log map
  const introMap = useMemo(() => {
    const map: Record<string, IntroLogSummary> = {}
    for (const log of introLogs) {
      if (!map[log.product_id]) {
        map[log.product_id] = log
      }
    }
    return map
  }, [introLogs])

  // Get status for a product
  const getStatus = (product: Product): ProductStatus => {
    const log = introMap[product.id]
    if (!log) return 'not_introduced'
    if (log.reaction === 'сыпь' || log.reaction === 'живот') return 'reaction'
    return 'introduced'
  }

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        if (p.min_age_months > ageFilter) return false
        if (category !== 'all' && p.category !== category) return false
        if (statusFilter !== 'all' && getStatus(p) !== statusFilter) return false
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
        return true
      })
      .sort((a, b) => a.min_age_months - b.min_age_months)
  }, [products, category, statusFilter, search, ageFilter, introMap])

  const totalIntroduced = new Set(introLogs.map(l => l.product_id)).size
  const availableCount = products.filter(p => p.min_age_months <= babyAge).length

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">Каталог продуктов</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Введено {totalIntroduced} из {availableCount} доступных
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск продукта..."
          className="w-full pl-10 pr-10 py-3 rounded-2xl border border-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Age filter */}
      <div className="flex items-center gap-3 mb-4 bg-white rounded-2xl p-3 border border-border">
        <span className="text-sm font-medium text-foreground whitespace-nowrap">До {ageFilter} мес.</span>
        <input
          type="range"
          min={6}
          max={12}
          step={1}
          value={ageFilter}
          onChange={e => setAgeFilter(Number(e.target.value))}
          className="flex-1 accent-primary"
        />
        <span className="text-xs text-muted-foreground whitespace-nowrap">{ageFilter} мес.</span>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-thin">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value as ProductCategory | 'all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              category === c.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-white border border-border text-foreground hover:bg-muted'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-thin">
        {STATUS_FILTERS.map(s => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value as ProductStatus | 'all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === s.value
                ? 'bg-foreground text-background'
                : 'bg-white border border-border text-foreground hover:bg-muted'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground mb-3">
        Найдено: {filteredProducts.length} продуктов
      </p>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <AnimatePresence>
          {filteredProducts.map((product, i) => {
            const log = introMap[product.id]
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.03 }}
              >
                <ProductCard
                  product={product}
                  status={getStatus(product)}
                  lastReaction={log?.reaction as any}
                  rating={log?.rating || undefined}
                  onClick={() => setSelectedProduct(product)}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl">🔍</span>
          <p className="text-sm text-muted-foreground mt-2">Ничего не найдено</p>
          <button
            onClick={() => { setSearch(''); setCategory('all'); setStatusFilter('all') }}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Сбросить фильтры
          </button>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            introLogs={introLogs.filter(l => l.product_id === selectedProduct.id)}
            status={getStatus(selectedProduct)}
            onClose={() => setSelectedProduct(null)}
            userId={userId}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

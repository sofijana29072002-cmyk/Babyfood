'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { Product, ProductStatus, Reaction } from '@/types'

interface ProductCardProps {
  product: Product
  status: ProductStatus
  lastReaction?: Reaction
  rating?: number
  onClick?: () => void
}

const statusConfig = {
  introduced: {
    label: 'Введён',
    className: 'bg-green-50 text-green-700 border-green-200',
    dot: 'bg-green-500',
  },
  not_introduced: {
    label: 'Не введён',
    className: 'bg-gray-50 text-gray-500 border-gray-200',
    dot: 'bg-gray-300',
  },
  reaction: {
    label: 'Реакция',
    className: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
}

export function ProductCard({ product, status, lastReaction, rating, onClick }: ProductCardProps) {
  const config = statusConfig[status]

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl p-4 border border-border shadow-sm cursor-pointer',
        'hover:shadow-md transition-shadow duration-200',
        'flex flex-col gap-2'
      )}
    >
      {/* Emoji + allergen badge */}
      <div className="flex items-start justify-between">
        <span className="text-3xl">{product.emoji}</span>
        {product.allergen && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
            ⚠️ Аллерген
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="font-semibold text-sm text-foreground leading-tight">{product.name}</h3>

      {/* Age */}
      <p className="text-xs text-muted-foreground">с {product.min_age_months} мес.</p>

      {/* Status badge */}
      <div className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium w-fit',
        config.className
      )}>
        <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
        {config.label}
      </div>

      {/* Rating stars */}
      {status === 'introduced' && rating && (
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={cn('text-xs', i < rating ? 'opacity-100' : 'opacity-20')}>
              ⭐
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}

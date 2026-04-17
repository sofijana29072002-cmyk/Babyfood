export default function ForbiddenFoodsPage() {
  const sections = [
    {
      emoji: '🍯',
      title: 'Мёд',
      reason: 'Может содержать споры ботулизма, опасные для незрелой иммунной системы.',
      until: 'До 1 года',
      color: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
    },
    {
      emoji: '🧂',
      title: 'Соль',
      reason: 'Почки малыша не справляются с переработкой натрия. Вызывает перегрузку почек.',
      until: 'До 1 года',
      color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    },
    {
      emoji: '🍬',
      title: 'Сахар и сладости',
      reason: 'Формирует неправильные вкусовые предпочтения, вредит зубам и поджелудочной железе.',
      until: 'До 1 года (лучше до 2 лет)',
      color: 'bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800',
    },
    {
      emoji: '🥛',
      title: 'Цельное коровье молоко',
      reason: 'Высокое содержание белка перегружает почки. Можно использовать только в приготовлении каш с 8 месяцев.',
      until: 'Как основное питьё — до 1 года',
      color: 'bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-800',
    },
    {
      emoji: '🍵',
      title: 'Чай и кофе',
      reason: 'Кофеин возбуждает нервную систему. Танины мешают усвоению железа.',
      until: 'До 1 года',
      color: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
    },
    {
      emoji: '🧃',
      title: 'Сок из магазина',
      reason: 'Много сахара и кислоты. Раздражает слизистую желудка и портит зубы.',
      until: 'До 1 года',
      color: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    },
    {
      emoji: '🥜',
      title: 'Целые орехи и крупные куски',
      reason: 'Высокий риск удушья из-за небольшого диаметра дыхательных путей.',
      until: 'До 3 лет в целом виде',
      color: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    },
    {
      emoji: '🐟',
      title: 'Некоторые виды рыбы',
      reason: 'Меч-рыба, тунец, акула содержат много ртути. Выбирайте треску, минтай, лосось.',
      until: 'До 1 года — только безопасные виды',
      color: 'bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800',
    },
    {
      emoji: '🍄',
      title: 'Грибы',
      reason: 'Тяжело перевариваются. Могут вызвать отравление даже съедобные виды у детей.',
      until: 'До 3 лет',
      color: 'bg-stone-50 border-stone-200 dark:bg-stone-900/20 dark:border-stone-800',
    },
    {
      emoji: '🌶️',
      title: 'Острые специи',
      reason: 'Раздражают нежную слизистую желудка и кишечника.',
      until: 'До 1-2 лет',
      color: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    },
    {
      emoji: '🍟',
      title: 'Жареная еда',
      reason: 'Канцерогены при жарке, тяжело переваривается, перегружает печень.',
      until: 'До 3 лет',
      color: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    },
    {
      emoji: '🥫',
      title: 'Консервы и полуфабрикаты',
      reason: 'Соль, консерванты, усилители вкуса — всё это вредно для незрелого организма.',
      until: 'До 3 лет',
      color: 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800',
    },
  ]

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">🚫 Нельзя до 1 года</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Продукты, которые не рекомендованы по рекомендациям ВОЗ и педиатров
        </p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-5">
        <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
          ⚠️ Это общие рекомендации. Всегда консультируйтесь с вашим педиатром — он знает особенности именно вашего малыша.
        </p>
      </div>

      <div className="space-y-3">
        {sections.map((item, i) => (
          <div key={i} className={`rounded-2xl p-4 border ${item.color}`}>
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0">{item.emoji}</span>
              <div>
                <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.reason}</p>
                <span className="inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/60 dark:bg-black/20 text-foreground">
                  🕐 {item.until}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4">
        <h3 className="font-bold text-sm text-green-800 dark:text-green-300 mb-2">✅ Что можно вместо этого?</h3>
        <p className="text-xs text-green-700 dark:text-green-400 leading-relaxed">
          Вода, грудное молоко или адаптированная смесь, овощные и фруктовые пюре, каши без соли и сахара,
          нежирное мясо (курица, индейка, кролик), кисломолочные продукты с 8 месяцев.
        </p>
      </div>
    </div>
  )
}

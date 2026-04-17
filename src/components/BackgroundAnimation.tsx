'use client'

export function BackgroundAnimation() {
  const emojis = ['🥕', '🥦', '🍎', '🫐', '🥑', '🍠']

  return (
    <div className="bg-bubbles" aria-hidden="true">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="bg-bubble" />
      ))}
      {emojis.map((emoji, i) => (
        <div key={`e-${i}`} className="bg-emoji">{emoji}</div>
      ))}
    </div>
  )
}

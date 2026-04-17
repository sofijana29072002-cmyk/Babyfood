'use client'

import { useState, useEffect, useRef } from 'react'
import { Timer, X, Play, Pause, RotateCcw } from 'lucide-react'

export function FeedingTimer() {
  const [open, setOpen] = useState(false)
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [lastFeeding, setLastFeeding] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const format = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const reset = () => {
    setRunning(false)
    setSeconds(0)
  }

  const finish = () => {
    setRunning(false)
    const now = new Date()
    setLastFeeding(now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }))
    setSeconds(0)
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 md:bottom-8 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform no-print"
        title="Таймер кормления"
      >
        <Timer className="w-5 h-5" />
        {running && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
        )}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 no-print" onClick={() => setOpen(false)}>
          <div
            className="bg-card border border-border rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">⏱️ Таймер кормления</h3>
              <button onClick={() => setOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timer display */}
            <div className="text-center py-6">
              <div className={`text-6xl font-mono font-bold tabular-nums ${running ? 'text-primary' : 'text-foreground'}`}>
                {format(seconds)}
              </div>
              {running && (
                <div className="mt-2 flex justify-center">
                  <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping inline-block" />
                    Кормление идёт...
                  </span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setRunning(r => !r)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {running ? 'Пауза' : 'Старт'}
              </button>
              <button
                onClick={reset}
                className="px-4 py-3 rounded-2xl border border-border text-muted-foreground hover:bg-muted transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {seconds > 0 && (
              <button
                onClick={finish}
                className="w-full py-2.5 rounded-2xl bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium text-sm hover:opacity-90 transition-opacity"
              >
                ✅ Завершить кормление
              </button>
            )}

            {lastFeeding && (
              <p className="text-center text-xs text-muted-foreground mt-3">
                Последнее кормление: <strong>{lastFeeding}</strong>
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}

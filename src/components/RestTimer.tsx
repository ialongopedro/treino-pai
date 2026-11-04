import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { BigButton } from './BigButton'
import { avisarFimDoDescanso } from '../lib/feedback'

export function RestTimer({
  segundosIniciais = 75,
  onFim,
}: {
  segundosIniciais?: number
  onFim?: () => void
}) {
  const [segundosRestantes, setSegundosRestantes] = useState(segundosIniciais)
  const [rodando, setRodando] = useState(true)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (!rodando) return
    intervalRef.current = window.setInterval(() => {
      setSegundosRestantes((atual) => {
        if (atual <= 1) {
          window.clearInterval(intervalRef.current ?? undefined)
          avisarFimDoDescanso()
          onFim?.()
          return 0
        }
        return atual - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rodando])

  const minutos = Math.floor(segundosRestantes / 60)
  const segundos = segundosRestantes % 60

  return (
    <div className="flex items-center gap-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-slate-900 rounded-2xl p-4 ring-1 ring-blue-200/60 dark:ring-blue-900/60">
      <div className="text-4xl font-bold tabular-nums text-blue-700 dark:text-blue-300 min-w-[90px]">
        {minutos}:{segundos.toString().padStart(2, '0')}
      </div>
      <p className="text-slate-600 dark:text-slate-300 flex-1">Descanse antes da próxima série</p>
      <BigButton
        variant="secondary"
        onClick={() => setRodando((r) => !r)}
        aria-label={rodando ? 'Pausar' : 'Continuar'}
      >
        {rodando ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </BigButton>
      <BigButton
        variant="secondary"
        onClick={() => setSegundosRestantes((s) => s + 30)}
        aria-label="Adicionar 30 segundos"
      >
        +30s
      </BigButton>
    </div>
  )
}

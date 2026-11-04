import { Minus, Plus } from 'lucide-react'

export function Stepper({
  valor,
  onMudar,
  passo = 1,
  min = 0,
  sufixo = '',
  disabled = false,
}: {
  valor: number
  onMudar: (novoValor: number) => void
  passo?: number
  min?: number
  sufixo?: string
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onMudar(Math.max(min, Math.round((valor - passo) * 10) / 10))}
        aria-label="Diminuir"
        className="min-w-[44px] min-h-[44px] rounded-full bg-slate-100 dark:bg-slate-600 active:bg-slate-200 dark:active:bg-slate-500 shadow-sm flex items-center justify-center disabled:opacity-40 transition-colors"
      >
        <Minus className="w-5 h-5" strokeWidth={2.5} />
      </button>
      <span className="min-w-[56px] text-center text-lg font-semibold tabular-nums">
        {valor}
        {sufixo}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onMudar(Math.round((valor + passo) * 10) / 10)}
        aria-label="Aumentar"
        className="min-w-[44px] min-h-[44px] rounded-full bg-slate-100 dark:bg-slate-600 active:bg-slate-200 dark:active:bg-slate-500 shadow-sm flex items-center justify-center disabled:opacity-40 transition-colors"
      >
        <Plus className="w-5 h-5" strokeWidth={2.5} />
      </button>
    </div>
  )
}

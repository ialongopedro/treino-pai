import { useState } from 'react'
import { X, HeartPulse } from 'lucide-react'
import { Card } from './Card'
import { BigButton } from './BigButton'

const AREAS: { id: string; label: string; dica: string }[] = [
  {
    id: 'joelho',
    label: 'Joelho',
    dica:
      'Evite agachar além do confortável ou fazer movimentos com impacto. Troque agachamento/afundo por uma versão com menor amplitude, ou pule esse exercício hoje.',
  },
  {
    id: 'lombar',
    label: 'Lombar / coluna',
    dica:
      'Evite curvar as costas durante o movimento. Prefira exercícios com apoio (cadeira, parede) e reduza a amplitude. Se a dor persistir, pule o exercício.',
  },
  {
    id: 'ombro',
    label: 'Ombro',
    dica:
      'Evite levantar os braços acima da cabeça com peso. Reduza a amplitude do movimento ou troque por um exercício que não exija erguer os braços.',
  },
  {
    id: 'outro',
    label: 'Outro lugar',
    dica:
      'Pare o exercício que causou a dor, descanse e beba água. Se a dor persistir, piorar, ou vier com falta de ar, dor no peito ou tontura, procure atendimento médico imediatamente.',
  },
]

export function AjudaDor({ onFechar }: { onFechar: () => void }) {
  const [areaId, setAreaId] = useState<string | null>(null)
  const area = AREAS.find((a) => a.id === areaId)

  return (
    <div
      className="fixed inset-0 z-30 bg-black/40 flex items-end sm:items-center justify-center p-4"
      onClick={onFechar}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm">
        <Card className="max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-red-600 dark:text-red-400" /> Sentindo dor?
            </h2>
            <button
              onClick={onFechar}
              aria-label="Fechar"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-500 dark:text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!area ? (
            <>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                Onde você está sentindo dor ou desconforto?
              </p>
              <div className="flex flex-col gap-2">
                {AREAS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAreaId(a.id)}
                    className="min-h-[52px] text-left rounded-xl border-2 border-slate-200 dark:border-slate-600 px-3 active:bg-slate-50 dark:active:bg-slate-700 font-medium"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="font-semibold mb-1">{area.label}</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">{area.dica}</p>
              <p className="text-amber-700 dark:text-amber-400 text-sm mb-4">
                ⚠️ Isso não substitui orientação médica. Em caso de dor forte ou persistente,
                procure um médico.
              </p>
              <BigButton variant="secondary" className="w-full" onClick={() => setAreaId(null)}>
                Voltar
              </BigButton>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

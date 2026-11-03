export type Aba = 'hoje' | 'treino' | 'dieta' | 'evolucao'

const abas: { id: Aba; label: string; icone: string }[] = [
  { id: 'hoje', label: 'Hoje', icone: '🏠' },
  { id: 'treino', label: 'Treino', icone: '🏋️' },
  { id: 'dieta', label: 'Dieta', icone: '🍽️' },
  { id: 'evolucao', label: 'Evolução', icone: '📈' },
]

export function BottomNav({ abaAtual, onMudar }: { abaAtual: Aba; onMudar: (a: Aba) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex pb-[env(safe-area-inset-bottom)] z-20">
      {abas.map((aba) => {
        const ativo = aba.id === abaAtual
        return (
          <button
            key={aba.id}
            onClick={() => onMudar(aba.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 min-h-[64px] ${
              ativo ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span className="text-2xl" aria-hidden>
              {aba.icone}
            </span>
            <span className={`text-sm ${ativo ? 'font-semibold' : ''}`}>{aba.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

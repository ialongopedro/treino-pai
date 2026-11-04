import { Home, Dumbbell, UtensilsCrossed, TrendingUp } from 'lucide-react'

export type Aba = 'hoje' | 'treino' | 'dieta' | 'evolucao'

const abas: { id: Aba; label: string; Icone: typeof Home }[] = [
  { id: 'hoje', label: 'Hoje', Icone: Home },
  { id: 'treino', label: 'Treino', Icone: Dumbbell },
  { id: 'dieta', label: 'Dieta', Icone: UtensilsCrossed },
  { id: 'evolucao', label: 'Evolução', Icone: TrendingUp },
]

export function BottomNav({ abaAtual, onMudar }: { abaAtual: Aba; onMudar: (a: Aba) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 flex pb-[env(safe-area-inset-bottom)] z-20 shadow-[0_-8px_24px_-16px_rgba(15,23,42,0.35)]">
      {abas.map(({ id, label, Icone }) => {
        const ativo = id === abaAtual
        return (
          <button
            key={id}
            onClick={() => onMudar(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 min-h-[64px] transition-colors ${
              ativo ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span
              className={`flex items-center justify-center w-11 h-7 rounded-full transition-colors ${
                ativo ? 'bg-blue-100 dark:bg-blue-900/60' : ''
              }`}
            >
              <Icone className="w-5 h-5" strokeWidth={ativo ? 2.25 : 1.75} />
            </span>
            <span className={`text-xs ${ativo ? 'font-semibold' : ''}`}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

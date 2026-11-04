import { useEffect, useState } from 'react'
import { Dumbbell, User, ChevronLeft } from 'lucide-react'
import { seedIfEmpty, sincronizarCamposNovosDosExercicios } from './db/seed'
import { BottomNav, type Aba } from './components/BottomNav'
import { Hoje } from './screens/Hoje'
import { Treino } from './screens/Treino'
import { Dieta } from './screens/Dieta'
import { Evolucao } from './screens/Evolucao'
import { Perfil } from './screens/Perfil'

export default function App() {
  const [aba, setAba] = useState<Aba>('hoje')
  const [mostrarPerfil, setMostrarPerfil] = useState(false)

  useEffect(() => {
    seedIfEmpty().then(sincronizarCamposNovosDosExercicios)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-10 bg-gradient-to-r from-blue-700 to-blue-600 dark:from-blue-900 dark:to-slate-900 text-white px-4 py-3.5 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/15">
            <Dumbbell className="w-5 h-5" strokeWidth={2} />
          </span>
          <span className="font-bold text-lg tracking-tight">Treino & Dieta</span>
        </div>
        <button
          onClick={() => setMostrarPerfil(true)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/15 active:bg-white/25 transition-colors"
          aria-label="Abrir perfil"
        >
          <User className="w-5 h-5" />
        </button>
      </header>

      <main>
        {mostrarPerfil ? (
          <div>
            <button
              onClick={() => setMostrarPerfil(false)}
              className="m-4 min-h-[44px] px-4 flex items-center gap-1 text-blue-700 dark:text-blue-300 font-medium"
            >
              <ChevronLeft className="w-5 h-5" /> Voltar
            </button>
            <Perfil />
          </div>
        ) : (
          <>
            {aba === 'hoje' && <Hoje onIrPara={setAba} />}
            {aba === 'treino' && <Treino />}
            {aba === 'dieta' && <Dieta />}
            {aba === 'evolucao' && <Evolucao />}
          </>
        )}
      </main>

      {!mostrarPerfil && <BottomNav abaAtual={aba} onMudar={setAba} />}
    </div>
  )
}

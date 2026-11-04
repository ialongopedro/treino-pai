import { useEffect, useState } from 'react'
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
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex justify-between items-center">
        <span className="font-bold text-lg">Treino & Dieta</span>
        <button
          onClick={() => setMostrarPerfil(true)}
          className="min-h-[44px] min-w-[44px] text-2xl"
          aria-label="Abrir perfil"
        >
          👤
        </button>
      </header>

      <main>
        {mostrarPerfil ? (
          <div>
            <button
              onClick={() => setMostrarPerfil(false)}
              className="m-4 min-h-[44px] px-4 text-blue-700 dark:text-blue-300 font-medium"
            >
              ← Voltar
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

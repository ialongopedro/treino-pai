import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { Card } from '../components/Card'
import { ProgressBar } from '../components/ProgressBar'
import { BigButton } from '../components/BigButton'
import { ehDiaDeTreino, hojeISO, nomeDoDia } from '../lib/date'
import { calcularMetaProteina, calcularTotaisDoDia, calcularSequenciaSemanas } from '../lib/calc'
import { obterObjetivo } from '../db/goals'
import type { Aba } from '../components/BottomNav'

const MENSAGENS_MOTIVACIONAIS = [
  'Cada treino é um tijolo na sua autonomia.',
  'Força nas pernas hoje, passos mais firmes amanhã.',
  'Constância vale mais que intensidade. Vai com calma.',
  'Você já está mais forte do que no mês passado.',
  'Hidrate-se e respeite seu corpo. O progresso é uma maratona.',
]

export function Hoje({ onIrPara }: { onIrPara: (aba: Aba) => void }) {
  const perfil = useLiveQuery(() => db.profile.toCollection().first())
  const diaDeTreino = ehDiaDeTreino()
  const hoje = hojeISO()

  const meals = useLiveQuery(() => db.meals.where('data').equals(hoje).toArray(), [hoje]) ?? []
  const foods = useLiveQuery(() => db.foods.toArray()) ?? []
  const sessaoHoje = useLiveQuery(() => db.sessions.where('data').equals(hoje).first(), [hoje])
  const sessions = useLiveQuery(() => db.sessions.toArray()) ?? []

  const totais = calcularTotaisDoDia(meals, foods)
  const metaProteina = perfil ? calcularMetaProteina(perfil.pesoKg, perfil.metaProteinaGKg) : 0
  const sequencia = calcularSequenciaSemanas(sessions)
  const objetivo = obterObjetivo(perfil?.objetivoId)

  const mensagem = MENSAGENS_MOTIVACIONAIS[new Date().getDate() % MENSAGENS_MOTIVACIONAIS.length]

  return (
    <div className="p-4 flex flex-col gap-4 pb-24">
      <h1 className="text-2xl font-bold">Olá{perfil ? `, ${perfil.nome.split(' ')[0]}` : ''}!</h1>
      <p className="text-slate-500 dark:text-slate-400 -mt-2">
        {nomeDoDia()} · {objetivo.emoji} {objetivo.nome}
      </p>

      <Card>
        {diaDeTreino ? (
          <>
            <h2 className="text-xl font-semibold mb-2">💪 Hoje é dia de treino</h2>
            {sessaoHoje?.finalizado ? (
              <p className="text-green-700 dark:text-green-400 font-medium">
                Treino de hoje já concluído. Parabéns!
              </p>
            ) : (
              <>
                <p className="mb-3 text-slate-600 dark:text-slate-300">
                  Treino de corpo inteiro: 5 exercícios, 3 séries cada.
                </p>
                <BigButton className="w-full" onClick={() => onIrPara('treino')}>
                  {sessaoHoje ? 'Continuar treino' : 'Iniciar treino de hoje'}
                </BigButton>
              </>
            )}
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-2">😌 Hoje é dia de descanso</h2>
            <p className="text-slate-600 dark:text-slate-300">
              Aproveite para recuperar. O próximo treino já está te esperando.
            </p>
          </>
        )}
      </Card>

      <Card>
        <ProgressBar valor={totais.proteina} meta={metaProteina} label="Proteína de hoje" />
        <BigButton variant="secondary" className="w-full mt-3" onClick={() => onIrPara('dieta')}>
          Registrar refeição
        </BigButton>
      </Card>

      {sequencia > 0 && (
        <Card>
          <p className="text-lg">
            🔥 <strong>{sequencia}</strong> semana{sequencia > 1 ? 's' : ''} seguida
            {sequencia > 1 ? 's' : ''} treinando
          </p>
        </Card>
      )}

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
        <p className="italic text-blue-800 dark:text-blue-200">"{mensagem}"</p>
      </Card>
    </div>
  )
}

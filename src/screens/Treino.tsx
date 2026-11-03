import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { Card } from '../components/Card'
import { BigButton } from '../components/BigButton'
import { RestTimer } from '../components/RestTimer'
import { ehDiaDeTreino, hojeISO } from '../lib/date'
import { sugerirProgressao, ultimaCargaPorExercicio, doisEpisodiosDorSeguidos } from '../lib/calc'
import { obterObjetivo } from '../db/goals'
import type { SetLog, WorkoutSession } from '../types'

const SERIES_POR_EXERCICIO = 3

interface EntradaSerie {
  cargaKg: string
  repeticoes: string
}

export function Treino() {
  const hoje = hojeISO()
  const diaDeTreino = ehDiaDeTreino()
  const exercicios = useLiveQuery(() => db.exercises.orderBy('ordem').toArray()) ?? []
  const sessions = useLiveQuery(() => db.sessions.toArray()) ?? []
  const sessaoHoje = useLiveQuery(() => db.sessions.where('data').equals(hoje).first(), [hoje])
  const perfil = useLiveQuery(() => db.profile.toCollection().first())
  const objetivo = obterObjetivo(perfil?.objetivoId)

  const [sessionId, setSessionId] = useState<number | null>(null)
  const [entradas, setEntradas] = useState<Record<string, EntradaSerie>>({})
  const [descansando, setDescansando] = useState(false)
  const [exercicioExpandido, setExercicioExpandido] = useState<number | null>(null)

  useEffect(() => {
    if (!diaDeTreino) return
    async function garantirSessao() {
      let s = await db.sessions.where('data').equals(hoje).first()
      if (!s) {
        const novaSessao: WorkoutSession = {
          data: hoje,
          diaSemana: new Date().getDay(),
          sets: [],
          finalizado: false,
        }
        const id = await db.sessions.add(novaSessao)
        setSessionId(id as number)
      } else {
        setSessionId(s.id!)
      }
    }
    garantirSessao()
  }, [diaDeTreino, hoje])

  if (!diaDeTreino) {
    return (
      <div className="p-4 pb-24">
        <Card>
          <h2 className="text-xl font-semibold mb-2">😌 Hoje não é dia de treino</h2>
          <p className="text-slate-600 dark:text-slate-300">
            O plano é treinar segunda, quarta e sexta. Aproveite o descanso!
          </p>
        </Card>
      </div>
    )
  }

  const chave = (exercicioId: number, serie: number) => `${exercicioId}-${serie}`

  async function concluirSerie(exercicioId: number, serie: number, doeu: boolean) {
    if (!sessionId) return
    const entrada = entradas[chave(exercicioId, serie)]
    const cargaKg = parseFloat(entrada?.cargaKg || '0')
    const repeticoes = parseInt(entrada?.repeticoes || '0', 10)

    const sessao = await db.sessions.get(sessionId)
    if (!sessao) return

    const novoSet: SetLog = { exercicioId, numeroSerie: serie, cargaKg, repeticoes, doeu }
    const setsAtualizados = [
      ...sessao.sets.filter((s) => !(s.exercicioId === exercicioId && s.numeroSerie === serie)),
      novoSet,
    ]
    await db.sessions.update(sessionId, { sets: setsAtualizados })

    if (!doeu && serie < SERIES_POR_EXERCICIO) {
      setDescansando(true)
    }
  }

  async function finalizarTreino() {
    if (!sessionId) return
    await db.sessions.update(sessionId, { finalizado: true })
  }

  const todosSetsFeitos =
    sessaoHoje &&
    exercicios.every((ex) =>
      [1, 2, 3].every((serie) =>
        sessaoHoje.sets.some((s) => s.exercicioId === ex.id && s.numeroSerie === serie),
      ),
    )

  return (
    <div className="p-4 pb-24 flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Treino de hoje</h1>
        <p className="text-slate-500 dark:text-slate-400">
          {objetivo.emoji} {objetivo.nome} · {objetivo.repMin}-{objetivo.repMax} reps
        </p>
      </div>

      {sessaoHoje?.finalizado && (
        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900">
          <p className="text-green-800 dark:text-green-300 font-semibold">
            Treino concluído hoje. Muito bem! 💪
          </p>
        </Card>
      )}

      {descansando && (
        <RestTimer segundosIniciais={objetivo.descansoSegundos} onFim={() => setDescansando(false)} />
      )}

      {exercicios.map((ex) => {
        const ultimo = ultimaCargaPorExercicio(sessions, ex.id!)
        const sugestao = ultimo ? sugerirProgressao(ultimo.sets, ultimo.cargaKg, objetivo.repMax) : null
        const alertaDor = doisEpisodiosDorSeguidos(sessions, ex.id!)
        const expandido = exercicioExpandido === ex.id

        return (
          <Card key={ex.id}>
            <button
              className="w-full text-left"
              onClick={() => setExercicioExpandido(expandido ? null : ex.id!)}
            >
              <h2 className="text-lg font-semibold">{ex.nome}</h2>
            </button>

            {ultimo && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Última vez: {ultimo.cargaKg}kg × {ultimo.repeticoes} reps
              </p>
            )}

            {sugestao?.deveAumentar && (
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mt-1">
                🎯 Sugestão: tente {sugestao.cargaSugeridaKg}kg hoje
              </p>
            )}

            {alertaDor && (
              <p className="text-sm text-red-700 dark:text-red-400 font-medium mt-1">
                ⚠️ Dor registrada duas vezes seguidas neste exercício. Converse com o médico ou
                instrutor antes de continuar.
              </p>
            )}

            {expandido && (
              <div className="mt-3 flex flex-col gap-3">
                <p className="text-sm text-slate-600 dark:text-slate-300">{ex.descricao}</p>
                <p className="text-sm text-amber-700 dark:text-amber-400">⚠️ {ex.dicaSeguranca}</p>

                {[1, 2, 3].map((serie) => {
                  const feito = sessaoHoje?.sets.find(
                    (s) => s.exercicioId === ex.id && s.numeroSerie === serie,
                  )
                  return (
                    <div key={serie} className="flex items-center gap-2">
                      <span className="w-16 text-slate-500">Série {serie}</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder="kg"
                        disabled={!!feito}
                        defaultValue={feito?.cargaKg || ultimo?.cargaKg || ''}
                        onChange={(e) =>
                          setEntradas((prev) => ({
                            ...prev,
                            [chave(ex.id!, serie)]: {
                              ...prev[chave(ex.id!, serie)],
                              cargaKg: e.target.value,
                            },
                          }))
                        }
                        className="w-20 min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 text-center"
                      />
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="reps"
                        disabled={!!feito}
                        defaultValue={feito?.repeticoes || ''}
                        onChange={(e) =>
                          setEntradas((prev) => ({
                            ...prev,
                            [chave(ex.id!, serie)]: {
                              ...prev[chave(ex.id!, serie)],
                              repeticoes: e.target.value,
                            },
                          }))
                        }
                        className="w-20 min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 text-center"
                      />
                      {feito ? (
                        <span className="flex-1 text-center text-green-700 dark:text-green-400">
                          ✓ feito
                        </span>
                      ) : (
                        <BigButton
                          className="flex-1 !min-h-[48px] !py-2 text-base"
                          onClick={() => concluirSerie(ex.id!, serie, false)}
                        >
                          Concluir
                        </BigButton>
                      )}
                    </div>
                  )
                })}

                <BigButton
                  variant="danger"
                  className="!min-h-[48px] !py-2 text-base"
                  onClick={() => concluirSerie(ex.id!, 1, true)}
                >
                  😣 Senti dor neste exercício
                </BigButton>
              </div>
            )}
          </Card>
        )
      })}

      {todosSetsFeitos && !sessaoHoje?.finalizado && (
        <BigButton variant="success" className="w-full" onClick={finalizarTreino}>
          Finalizar treino de hoje
        </BigButton>
      )}
    </div>
  )
}

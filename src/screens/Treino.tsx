import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { Card } from '../components/Card'
import { BigButton } from '../components/BigButton'
import { Stepper } from '../components/Stepper'
import { RestTimer } from '../components/RestTimer'
import { ResumoTreino } from '../components/ResumoTreino'
import { EditarExercicios } from './EditarExercicios'
import { ehDiaDeTreino, hojeISO } from '../lib/date'
import { sugerirProgressao, ultimaCargaPorExercicio, doisEpisodiosDorSeguidos } from '../lib/calc'
import { solicitarTelaSempreAcesa } from '../lib/feedback'
import { obterObjetivo } from '../db/goals'
import { obterPerfilCorporal } from '../db/perfisCorporais'
import type { Percepcao, SetLog, WorkoutSession } from '../types'

const SERIES_POR_EXERCICIO = 3

const OPCOES_PERCEPCAO: { id: Percepcao; emoji: string; label: string }[] = [
  { id: 'facil', emoji: '🙂', label: 'Fácil' },
  { id: 'bom', emoji: '😐', label: 'Boa' },
  { id: 'dificil', emoji: '😓', label: 'Difícil' },
  { id: 'dor', emoji: '😣', label: 'Senti dor' },
]

interface EntradaSerie {
  cargaKg: number
  repeticoes: number
}

export function Treino() {
  const hoje = hojeISO()
  const diaDeTreino = ehDiaDeTreino()
  const exercicios = useLiveQuery(() => db.exercises.orderBy('ordem').toArray()) ?? []
  const sessions = useLiveQuery(() => db.sessions.toArray()) ?? []
  const sessaoHoje = useLiveQuery(() => db.sessions.where('data').equals(hoje).first(), [hoje])
  const perfil = useLiveQuery(() => db.profile.toCollection().first())
  const objetivo = obterObjetivo(perfil?.objetivoId)
  const perfilCorporal = obterPerfilCorporal(perfil?.perfilCorporalId)
  const descansoSegundos = objetivo.descansoSegundos + perfilCorporal.descansoExtraSegundos

  const [sessionId, setSessionId] = useState<number | null>(null)
  const [entradas, setEntradas] = useState<Record<string, EntradaSerie>>({})
  const [descansando, setDescansando] = useState(false)
  const [exercicioExpandido, setExercicioExpandido] = useState<number | null>(null)
  const [editandoExercicios, setEditandoExercicios] = useState(false)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

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

  useEffect(() => {
    if (!diaDeTreino || sessaoHoje?.finalizado) return
    solicitarTelaSempreAcesa().then((lock) => {
      wakeLockRef.current = lock
    })
    return () => {
      wakeLockRef.current?.release().catch(() => {})
      wakeLockRef.current = null
    }
  }, [diaDeTreino, sessaoHoje?.finalizado])

  if (editandoExercicios) {
    return <EditarExercicios onFechar={() => setEditandoExercicios(false)} />
  }

  if (!diaDeTreino) {
    return (
      <div className="p-4 pb-24">
        <Card>
          <h2 className="text-xl font-semibold mb-2">😌 Hoje não é dia de treino</h2>
          <p className="text-slate-600 dark:text-slate-300">
            O plano é treinar segunda, quarta e sexta. Aproveite o descanso!
          </p>
          <BigButton variant="secondary" className="w-full mt-3" onClick={() => setEditandoExercicios(true)}>
            ✏️ Editar exercícios
          </BigButton>
        </Card>
      </div>
    )
  }

  const chave = (exercicioId: number, serie: number) => `${exercicioId}-${serie}`

  function entradaAtual(exercicioId: number, serie: number, cargaPadrao: number): EntradaSerie {
    return entradas[chave(exercicioId, serie)] ?? { cargaKg: cargaPadrao, repeticoes: 0 }
  }

  function atualizarEntrada(exercicioId: number, serie: number, campo: keyof EntradaSerie, valor: number) {
    const k = chave(exercicioId, serie)
    setEntradas((prev) => ({
      ...prev,
      [k]: { ...entradaAtual(exercicioId, serie, 0), ...prev[k], [campo]: valor },
    }))
  }

  async function concluirSerie(exercicioId: number, serie: number, percepcao: Percepcao, cargaPadrao: number) {
    if (!sessionId) return
    const entrada = entradaAtual(exercicioId, serie, cargaPadrao)

    const sessao = await db.sessions.get(sessionId)
    if (!sessao) return

    const novoSet: SetLog = {
      exercicioId,
      numeroSerie: serie,
      cargaKg: entrada.cargaKg,
      repeticoes: entrada.repeticoes,
      percepcao,
    }
    const setsAtualizados = [
      ...sessao.sets.filter((s) => !(s.exercicioId === exercicioId && s.numeroSerie === serie)),
      novoSet,
    ]
    await db.sessions.update(sessionId, { sets: setsAtualizados })

    if (percepcao !== 'dor' && serie < SERIES_POR_EXERCICIO) {
      setDescansando(true)
    }
  }

  async function finalizarTreino() {
    if (!sessionId) return
    await db.sessions.update(sessionId, { finalizado: true })
    wakeLockRef.current?.release().catch(() => {})
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
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Treino de hoje</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {objetivo.emoji} {objetivo.nome} · {objetivo.repMin}-{objetivo.repMax} reps
          </p>
        </div>
        <button
          onClick={() => setEditandoExercicios(true)}
          className="min-h-[44px] px-2 text-blue-700 dark:text-blue-300 font-medium text-sm whitespace-nowrap"
        >
          ✏️ Editar
        </button>
      </div>

      {sessaoHoje?.finalizado && (
        <ResumoTreino sessaoHoje={sessaoHoje} sessions={sessions} exercises={exercicios} />
      )}

      {descansando && (
        <RestTimer segundosIniciais={descansoSegundos} onFim={() => setDescansando(false)} />
      )}

      {exercicios.map((ex) => {
        const ultimo = ultimaCargaPorExercicio(sessions, ex.id!)
        const sugestao = ultimo ? sugerirProgressao(ultimo.sets, ultimo.cargaKg, objetivo.repMax) : null
        const alertaDor = doisEpisodiosDorSeguidos(sessions, ex.id!)
        const expandido = exercicioExpandido === ex.id
        const cargaPadrao = sugestao?.deveAumentar ? sugestao.cargaSugeridaKg : ultimo?.cargaKg ?? 0

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
              <div className="mt-3 flex flex-col gap-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">{ex.descricao}</p>
                <p className="text-sm text-amber-700 dark:text-amber-400">⚠️ {ex.dicaSeguranca}</p>

                {[1, 2, 3].map((serie) => {
                  const feito = sessaoHoje?.sets.find(
                    (s) => s.exercicioId === ex.id && s.numeroSerie === serie,
                  )
                  const entrada = entradaAtual(ex.id!, serie, cargaPadrao)

                  if (feito) {
                    const opcao = OPCOES_PERCEPCAO.find((o) => o.id === feito.percepcao)
                    return (
                      <div
                        key={serie}
                        className="flex items-center justify-between gap-2 text-green-700 dark:text-green-400"
                      >
                        <span className="font-medium">
                          Série {serie}: {feito.cargaKg}kg × {feito.repeticoes}
                        </span>
                        <span>
                          {opcao?.emoji} {opcao?.label}
                        </span>
                      </div>
                    )
                  }

                  return (
                    <div key={serie} className="flex flex-col gap-2">
                      <span className="text-slate-500 font-medium">Série {serie}</span>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs text-slate-400">Carga (kg)</span>
                          <Stepper
                            valor={entrada.cargaKg}
                            passo={1}
                            onMudar={(v) => atualizarEntrada(ex.id!, serie, 'cargaKg', v)}
                          />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs text-slate-400">Repetições</span>
                          <Stepper
                            valor={entrada.repeticoes}
                            passo={1}
                            onMudar={(v) => atualizarEntrada(ex.id!, serie, 'repeticoes', v)}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 text-center">Como foi essa série?</p>
                      <div className="grid grid-cols-4 gap-1">
                        {OPCOES_PERCEPCAO.map((opcao) => (
                          <button
                            key={opcao.id}
                            onClick={() => concluirSerie(ex.id!, serie, opcao.id, cargaPadrao)}
                            className={`min-h-[52px] rounded-xl flex flex-col items-center justify-center text-xs font-medium ${
                              opcao.id === 'dor'
                                ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400'
                                : 'bg-slate-100 dark:bg-slate-700'
                            }`}
                          >
                            <span className="text-xl">{opcao.emoji}</span>
                            {opcao.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
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

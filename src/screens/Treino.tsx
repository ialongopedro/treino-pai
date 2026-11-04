import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { Card } from '../components/Card'
import { BigButton } from '../components/BigButton'
import { Stepper } from '../components/Stepper'
import { RestTimer } from '../components/RestTimer'
import { ResumoTreino } from '../components/ResumoTreino'
import { ExerciseIcon } from '../components/ExerciseIcon'
import { EditarExercicios } from './EditarExercicios'
import { ehDiaDeTreino, hojeISO } from '../lib/date'
import { sugerirProgressao, ultimaCargaPorExercicio, doisEpisodiosDorSeguidos } from '../lib/calc'
import { solicitarTelaSempreAcesa } from '../lib/feedback'
import { obterObjetivo } from '../db/goals'
import { obterPerfilCorporal } from '../db/perfisCorporais'
import type { Exercise, Percepcao, SetLog, WorkoutSession } from '../types'

const SERIES_POR_EXERCICIO = 3

const OPCOES_PERCEPCAO: { id: Percepcao; emoji: string; label: string }[] = [
  { id: 'facil', emoji: '🙂', label: 'Fácil' },
  { id: 'bom', emoji: '😐', label: 'Boa' },
  { id: 'dificil', emoji: '😓', label: 'Difícil' },
  { id: 'dor', emoji: '😣', label: 'Dor' },
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
  const [indiceAtual, setIndiceAtual] = useState(0)
  const [mostrarComoFazer, setMostrarComoFazer] = useState(false)
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

  useEffect(() => {
    if (indiceAtual >= exercicios.length && exercicios.length > 0) {
      setIndiceAtual(0)
    }
  }, [exercicios.length, indiceAtual])

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

    if (serie === SERIES_POR_EXERCICIO) {
      const indiceExercicio = exercicios.findIndex((e) => e.id === exercicioId)
      if (indiceExercicio !== -1 && indiceExercicio < exercicios.length - 1) {
        setTimeout(() => {
          setIndiceAtual(indiceExercicio + 1)
          setMostrarComoFazer(false)
        }, 1200)
      }
    }
  }

  async function finalizarTreino() {
    if (!sessionId) return
    await db.sessions.update(sessionId, { finalizado: true })
    wakeLockRef.current?.release().catch(() => {})
  }

  function exercicioCompleto(ex: Exercise) {
    return [1, 2, 3].every((serie) =>
      sessaoHoje?.sets.some((s) => s.exercicioId === ex.id && s.numeroSerie === serie),
    )
  }

  const todosSetsFeitos = sessaoHoje && exercicios.every(exercicioCompleto)
  const exercicioAtual = exercicios[indiceAtual]

  const ultimo = exercicioAtual ? ultimaCargaPorExercicio(sessions, exercicioAtual.id!) : null
  const sugestao = ultimo ? sugerirProgressao(ultimo.sets, ultimo.cargaKg, objetivo.repMax) : null
  const alertaDor = exercicioAtual ? doisEpisodiosDorSeguidos(sessions, exercicioAtual.id!) : false
  const cargaPadrao = sugestao?.deveAumentar ? sugestao.cargaSugeridaKg : ultimo?.cargaKg ?? 0
  const atualCompleto = exercicioAtual ? exercicioCompleto(exercicioAtual) : false

  return (
    <div className="p-4 pb-24 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Treino de hoje</h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            {objetivo.emoji} {objetivo.nome} · {SERIES_POR_EXERCICIO}x{objetivo.repMin}-{objetivo.repMax} reps
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

      {/* Faixa horizontal fina com todos os exercícios, pra ver o treino todo e trocar rápido */}
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
        {exercicios.map((ex, i) => {
          const completo = exercicioCompleto(ex)
          const ativo = i === indiceAtual
          return (
            <button
              key={ex.id}
              onClick={() => {
                setIndiceAtual(i)
                setMostrarComoFazer(false)
              }}
              className={`shrink-0 flex items-center gap-1.5 pl-1.5 pr-3 py-1.5 rounded-full border-2 text-sm font-medium whitespace-nowrap min-h-[44px] ${
                ativo
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                  : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700'
              }`}
            >
              <span
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                  completo ? 'bg-green-600 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200'
                }`}
              >
                {completo ? '✓' : i + 1}
              </span>
              {ex.nome.split(' ').slice(0, 2).join(' ')}
            </button>
          )
        })}
      </div>

      {exercicioAtual && (
        <Card>
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-lg font-semibold">{exercicioAtual.nome}</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap mt-1">
              {indiceAtual + 1}/{exercicios.length}
            </span>
          </div>

          <div className="flex justify-center my-2">
            <ExerciseIcon grupo={exercicioAtual.grupo} className="w-20 h-20" />
          </div>

          <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mt-1">
            🎯 {SERIES_POR_EXERCICIO} séries de {objetivo.repMin}-{objetivo.repMax} reps
          </p>

          {ultimo && (
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
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

          <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">⚠️ {exercicioAtual.dicaSeguranca}</p>

          <button
            onClick={() => setMostrarComoFazer((v) => !v)}
            className="text-sm text-blue-700 dark:text-blue-300 font-medium mt-1"
          >
            {mostrarComoFazer ? 'Esconder como fazer ▾' : 'Como fazer ▸'}
          </button>
          {mostrarComoFazer && (
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{exercicioAtual.descricao}</p>
          )}

          <div className="flex flex-col gap-2 mt-3">
            {[1, 2, 3].map((serie) => {
              const feito = sessaoHoje?.sets.find(
                (s) => s.exercicioId === exercicioAtual.id && s.numeroSerie === serie,
              )
              const entrada = entradaAtual(exercicioAtual.id!, serie, cargaPadrao)

              if (feito) {
                const opcao = OPCOES_PERCEPCAO.find((o) => o.id === feito.percepcao)
                return (
                  <div
                    key={serie}
                    className="flex items-center justify-between gap-2 py-3 border-t border-slate-200 dark:border-slate-700 text-green-700 dark:text-green-400"
                  >
                    <span className="font-semibold">
                      Série {serie}: {feito.cargaKg}kg × {feito.repeticoes}
                    </span>
                    <span className="text-sm whitespace-nowrap">
                      {opcao?.emoji} {opcao?.label}
                    </span>
                  </div>
                )
              }

              return (
                <div key={serie} className="py-3 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Série {serie}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Carga</span>
                      <Stepper
                        valor={entrada.cargaKg}
                        sufixo="kg"
                        passo={1}
                        onMudar={(v) => atualizarEntrada(exercicioAtual.id!, serie, 'cargaKg', v)}
                      />
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Reps</span>
                      <Stepper
                        valor={entrada.repeticoes}
                        passo={1}
                        onMudar={(v) => atualizarEntrada(exercicioAtual.id!, serie, 'repeticoes', v)}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Como foi essa série?</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {OPCOES_PERCEPCAO.map((opcao) => (
                      <button
                        key={opcao.id}
                        onClick={() => concluirSerie(exercicioAtual.id!, serie, opcao.id, cargaPadrao)}
                        className={`min-h-[52px] rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs font-medium ${
                          opcao.id === 'dor'
                            ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <span className="text-xl leading-none">{opcao.emoji}</span>
                        {opcao.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex gap-2 mt-4">
            <BigButton
              variant="secondary"
              className="flex-1"
              disabled={indiceAtual === 0}
              onClick={() => {
                setIndiceAtual((i) => i - 1)
                setMostrarComoFazer(false)
              }}
            >
              ◀ Anterior
            </BigButton>
            <BigButton
              variant={atualCompleto ? 'success' : 'secondary'}
              className="flex-1"
              disabled={indiceAtual === exercicios.length - 1}
              onClick={() => {
                setIndiceAtual((i) => i + 1)
                setMostrarComoFazer(false)
              }}
            >
              Próximo ▶
            </BigButton>
          </div>
        </Card>
      )}

      {todosSetsFeitos && !sessaoHoje?.finalizado && (
        <BigButton variant="success" className="w-full" onClick={finalizarTreino}>
          Finalizar treino de hoje
        </BigButton>
      )}
    </div>
  )
}

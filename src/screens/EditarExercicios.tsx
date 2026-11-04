import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronUp, ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { db } from '../db/db'
import { Card } from '../components/Card'
import { BigButton } from '../components/BigButton'
import { ExerciseIcon } from '../components/ExerciseIcon'
import type { Exercise } from '../types'

const GRUPOS: { id: Exercise['grupo']; label: string }[] = [
  { id: 'perna', label: 'Perna' },
  { id: 'quadril', label: 'Quadril' },
  { id: 'lombar', label: 'Lombar' },
  { id: 'puxar', label: 'Puxar (costas)' },
  { id: 'empurrar', label: 'Empurrar (peito/braço)' },
  { id: 'core', label: 'Core / equilíbrio' },
]

interface FormExercicio {
  nome: string
  grupo: Exercise['grupo']
  descricao: string
  dicaSeguranca: string
  linkVideo: string
}

const FORM_VAZIO: FormExercicio = {
  nome: '',
  grupo: 'perna',
  descricao: '',
  dicaSeguranca: '',
  linkVideo: '',
}

export function EditarExercicios({ onFechar }: { onFechar: () => void }) {
  const exercicios = useLiveQuery(() => db.exercises.orderBy('ordem').toArray()) ?? []
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [formEdicao, setFormEdicao] = useState<FormExercicio>(FORM_VAZIO)
  const [adicionando, setAdicionando] = useState(false)
  const [formNovo, setFormNovo] = useState<FormExercicio>(FORM_VAZIO)

  function abrirEdicao(ex: Exercise) {
    setEditandoId(ex.id!)
    setFormEdicao({
      nome: ex.nome,
      grupo: ex.grupo,
      descricao: ex.descricao,
      dicaSeguranca: ex.dicaSeguranca,
      linkVideo: ex.linkVideo ?? '',
    })
  }

  async function salvarEdicao() {
    if (!editandoId) return
    await db.exercises.update(editandoId, {
      nome: formEdicao.nome,
      grupo: formEdicao.grupo,
      descricao: formEdicao.descricao,
      dicaSeguranca: formEdicao.dicaSeguranca,
      linkVideo: formEdicao.linkVideo || undefined,
    })
    setEditandoId(null)
  }

  async function removerExercicio(ex: Exercise) {
    const confirmou = window.confirm(
      `Remover "${ex.nome}" do treino? O histórico de cargas já registrado continua salvo, só não aparece mais no treino ativo.`,
    )
    if (!confirmou) return
    await db.exercises.delete(ex.id!)
  }

  async function mover(ex: Exercise, direcao: -1 | 1) {
    const indice = exercicios.findIndex((e) => e.id === ex.id)
    const vizinho = exercicios[indice + direcao]
    if (!vizinho) return
    await db.exercises.update(ex.id!, { ordem: vizinho.ordem })
    await db.exercises.update(vizinho.id!, { ordem: ex.ordem })
  }

  async function adicionarExercicio() {
    if (!formNovo.nome.trim()) return
    const maiorOrdem = exercicios.reduce((max, e) => Math.max(max, e.ordem), 0)
    await db.exercises.add({
      nome: formNovo.nome,
      grupo: formNovo.grupo,
      descricao: formNovo.descricao,
      dicaSeguranca: formNovo.dicaSeguranca,
      linkVideo: formNovo.linkVideo || undefined,
      ordem: maiorOrdem + 1,
    })
    setFormNovo(FORM_VAZIO)
    setAdicionando(false)
  }

  return (
    <div className="p-4 pb-24 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar exercícios</h1>
        <button onClick={onFechar} className="min-h-[44px] px-3 text-blue-700 dark:text-blue-300 font-medium">
          Fechar
        </button>
      </div>
      <p className="text-slate-500 dark:text-slate-400 -mt-2">
        Esses são os exercícios do treino atual. Pode reordenar, editar ou remover.
      </p>

      {exercicios.map((ex, indice) => {
        const editando = editandoId === ex.id

        return (
          <Card key={ex.id}>
            {editando ? (
              <div className="flex flex-col gap-2">
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Nome</span>
                  <input
                    value={formEdicao.nome}
                    onChange={(e) => setFormEdicao((f) => ({ ...f, nome: e.target.value }))}
                    className="min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Grupo</span>
                  <select
                    value={formEdicao.grupo}
                    onChange={(e) =>
                      setFormEdicao((f) => ({ ...f, grupo: e.target.value as Exercise['grupo'] }))
                    }
                    className="min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3"
                  >
                    {GRUPOS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Como fazer</span>
                  <textarea
                    value={formEdicao.descricao}
                    onChange={(e) => setFormEdicao((f) => ({ ...f, descricao: e.target.value }))}
                    className="min-h-[72px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Dica de segurança</span>
                  <textarea
                    value={formEdicao.dicaSeguranca}
                    onChange={(e) => setFormEdicao((f) => ({ ...f, dicaSeguranca: e.target.value }))}
                    className="min-h-[56px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Link de vídeo (opcional)</span>
                  <input
                    value={formEdicao.linkVideo}
                    onChange={(e) => setFormEdicao((f) => ({ ...f, linkVideo: e.target.value }))}
                    className="min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3"
                  />
                </label>
                <div className="flex gap-2 mt-1">
                  <BigButton className="flex-1" onClick={salvarEdicao}>
                    Salvar
                  </BigButton>
                  <BigButton variant="secondary" className="flex-1" onClick={() => setEditandoId(null)}>
                    Cancelar
                  </BigButton>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ExerciseIcon grupo={ex.grupo} className="w-12 h-12 shrink-0" />
                <div className="flex flex-col">
                  <button
                    disabled={indice === 0}
                    onClick={() => mover(ex, -1)}
                    aria-label="Mover para cima"
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center disabled:opacity-30"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={indice === exercicios.length - 1}
                    onClick={() => mover(ex, 1)}
                    aria-label="Mover para baixo"
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center disabled:opacity-30"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold">{ex.nome}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {GRUPOS.find((g) => g.id === ex.grupo)?.label}
                  </p>
                </div>
                <button
                  onClick={() => abrirEdicao(ex)}
                  aria-label="Editar"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-blue-700 dark:text-blue-300 font-medium"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => removerExercicio(ex)}
                  aria-label="Remover"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-red-600 dark:text-red-400 font-medium"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </Card>
        )
      })}

      {adicionando ? (
        <Card className="flex flex-col gap-2">
          <h2 className="font-semibold">Novo exercício</h2>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Nome</span>
            <input
              value={formNovo.nome}
              onChange={(e) => setFormNovo((f) => ({ ...f, nome: e.target.value }))}
              className="min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Grupo</span>
            <select
              value={formNovo.grupo}
              onChange={(e) => setFormNovo((f) => ({ ...f, grupo: e.target.value as Exercise['grupo'] }))}
              className="min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3"
            >
              {GRUPOS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Como fazer</span>
            <textarea
              value={formNovo.descricao}
              onChange={(e) => setFormNovo((f) => ({ ...f, descricao: e.target.value }))}
              className="min-h-[72px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Dica de segurança</span>
            <textarea
              value={formNovo.dicaSeguranca}
              onChange={(e) => setFormNovo((f) => ({ ...f, dicaSeguranca: e.target.value }))}
              className="min-h-[56px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2"
            />
          </label>
          <div className="flex gap-2 mt-1">
            <BigButton className="flex-1" onClick={adicionarExercicio} disabled={!formNovo.nome.trim()}>
              Adicionar
            </BigButton>
            <BigButton
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setAdicionando(false)
                setFormNovo(FORM_VAZIO)
              }}
            >
              Cancelar
            </BigButton>
          </div>
        </Card>
      ) : (
        <BigButton variant="secondary" className="w-full" onClick={() => setAdicionando(true)}>
          + Adicionar exercício
        </BigButton>
      )}
    </div>
  )
}

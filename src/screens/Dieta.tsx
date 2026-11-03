import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { Card } from '../components/Card'
import { BigButton } from '../components/BigButton'
import { ProgressBar } from '../components/ProgressBar'
import { hojeISO } from '../lib/date'
import { calcularMetaProteina, calcularTotaisDoDia, calcularTotaisRefeicao } from '../lib/calc'
import { obterPerfilCorporal } from '../db/perfisCorporais'
import type { MealEntry, MealLog } from '../types'

const REFEICOES: { id: MealLog['refeicao']; label: string }[] = [
  { id: 'cafe', label: 'Café da manhã' },
  { id: 'lanche_manha', label: 'Lanche da manhã' },
  { id: 'almoco', label: 'Almoço' },
  { id: 'lanche_tarde', label: 'Lanche da tarde' },
  { id: 'jantar', label: 'Jantar' },
  { id: 'ceia', label: 'Ceia' },
]

export function Dieta() {
  const hoje = hojeISO()
  const perfil = useLiveQuery(() => db.profile.toCollection().first())
  const foods = useLiveQuery(() => db.foods.orderBy('nome').toArray()) ?? []
  const meals = useLiveQuery(() => db.meals.where('data').equals(hoje).toArray(), [hoje]) ?? []

  const [refeicaoAberta, setRefeicaoAberta] = useState<MealLog['refeicao'] | null>(null)
  const [alimentoSelecionado, setAlimentoSelecionado] = useState<number | ''>('')
  const [quantidade, setQuantidade] = useState('')

  const totaisDia = calcularTotaisDoDia(meals, foods)
  const metaProteina = perfil ? calcularMetaProteina(perfil.pesoKg, perfil.metaProteinaGKg) : 0
  const perfilCorporal = obterPerfilCorporal(perfil?.perfilCorporalId)

  async function adicionarAlimento(refeicao: MealLog['refeicao']) {
    if (!alimentoSelecionado || !quantidade) return
    const novoItem: MealEntry = {
      foodItemId: Number(alimentoSelecionado),
      quantidadeG: parseFloat(quantidade),
    }

    const mealExistente = meals.find((m) => m.refeicao === refeicao)
    if (mealExistente) {
      await db.meals.update(mealExistente.id!, {
        itens: [...mealExistente.itens, novoItem],
      })
    } else {
      await db.meals.add({ data: hoje, refeicao, itens: [novoItem] })
    }
    setAlimentoSelecionado('')
    setQuantidade('')
  }

  async function removerItem(mealId: number, index: number) {
    const meal = meals.find((m) => m.id === mealId)
    if (!meal) return
    const novosItens = meal.itens.filter((_, i) => i !== index)
    await db.meals.update(mealId, { itens: novosItens })
  }

  return (
    <div className="p-4 pb-24 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Dieta de hoje</h1>

      <Card>
        <ProgressBar valor={totaisDia.proteina} meta={metaProteina} label="Proteína" />
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          {Math.round(totaisDia.calorias)} kcal hoje
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-2">
          {perfilCorporal.emoji} Sugestões pro seu perfil ({perfilCorporal.nome})
        </h2>
        <ul className="flex flex-col gap-1.5 text-slate-600 dark:text-slate-300 text-sm">
          {perfilCorporal.sugestoesRefeicoes.map((s) => (
            <li key={s}>• {s}</li>
          ))}
        </ul>
      </Card>

      {REFEICOES.map((refeicao) => {
        const meal = meals.find((m) => m.refeicao === refeicao.id)
        const totaisRefeicao = meal ? calcularTotaisRefeicao(meal, foods) : { proteina: 0, calorias: 0 }
        const aberta = refeicaoAberta === refeicao.id

        return (
          <Card key={refeicao.id}>
            <button
              className="w-full flex justify-between items-center text-left"
              onClick={() => setRefeicaoAberta(aberta ? null : refeicao.id)}
            >
              <span className="text-lg font-semibold">{refeicao.label}</span>
              <span className="text-slate-500 dark:text-slate-400">
                {Math.round(totaisRefeicao.proteina)}g proteína
              </span>
            </button>

            {meal && meal.itens.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1">
                {meal.itens.map((item, i) => {
                  const food = foods.find((f) => f.id === item.foodItemId)
                  return (
                    <li key={i} className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span>
                        {food?.nome} — {item.quantidadeG}g
                      </span>
                      <button
                        onClick={() => removerItem(meal.id!, i)}
                        className="text-red-600 dark:text-red-400 text-sm px-2"
                        aria-label="Remover"
                      >
                        remover
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            {aberta && (
              <div className="mt-3 flex flex-col gap-2">
                <select
                  value={alimentoSelecionado}
                  onChange={(e) => setAlimentoSelecionado(e.target.value ? Number(e.target.value) : '')}
                  className="min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3"
                >
                  <option value="">Escolha um alimento</option>
                  {foods.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="Quantidade (g)"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    className="flex-1 min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3"
                  />
                  <BigButton onClick={() => adicionarAlimento(refeicao.id)}>Adicionar</BigButton>
                </div>
              </div>
            )}
          </Card>
        )
      })}

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
        <p className="text-blue-800 dark:text-blue-200">💧 Lembre-se de beber água ao longo do dia.</p>
      </Card>
    </div>
  )
}

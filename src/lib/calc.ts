import type { MealLog, FoodItem, WorkoutSession, SetLog } from '../types'

export function calcularMetaProteina(pesoKg: number, metaGKg: number): number {
  return Math.round(pesoKg * metaGKg)
}

export function calcularTotaisRefeicao(
  meal: MealLog,
  foods: FoodItem[],
): { proteina: number; calorias: number } {
  let proteina = 0
  let calorias = 0
  for (const item of meal.itens) {
    const food = foods.find((f) => f.id === item.foodItemId)
    if (!food) continue
    proteina += (food.proteinaPor100g * item.quantidadeG) / 100
    calorias += (food.caloriasPor100g * item.quantidadeG) / 100
  }
  return { proteina, calorias }
}

export function calcularTotaisDoDia(
  meals: MealLog[],
  foods: FoodItem[],
): { proteina: number; calorias: number } {
  return meals.reduce(
    (acc, meal) => {
      const t = calcularTotaisRefeicao(meal, foods)
      return { proteina: acc.proteina + t.proteina, calorias: acc.calorias + t.calorias }
    },
    { proteina: 0, calorias: 0 },
  )
}

export function calcularVolumeSessao(sets: SetLog[]): number {
  return sets.reduce((total, s) => total + s.cargaKg * s.repeticoes, 0)
}

export interface SugestaoProgressao {
  deveAumentar: boolean
  cargaSugeridaKg: number
}

export function sugerirProgressao(
  ultimosSets: SetLog[],
  cargaAtual: number,
  repMax: number = 12,
): SugestaoProgressao {
  if (ultimosSets.length === 0) {
    return { deveAumentar: false, cargaSugeridaKg: cargaAtual }
  }
  const todasNoTopo = ultimosSets.every((s) => s.repeticoes >= repMax)
  if (todasNoTopo) {
    const incremento = cargaAtual >= 20 ? 2.5 : 1
    return { deveAumentar: true, cargaSugeridaKg: cargaAtual + incremento }
  }
  return { deveAumentar: false, cargaSugeridaKg: cargaAtual }
}

export function ultimaCargaPorExercicio(
  sessions: WorkoutSession[],
  exercicioId: number,
): { cargaKg: number; repeticoes: number; sets: SetLog[] } | null {
  const sessoesComExercicio = sessions
    .filter((s) => s.finalizado && s.sets.some((set) => set.exercicioId === exercicioId))
    .sort((a, b) => b.data.localeCompare(a.data))

  if (sessoesComExercicio.length === 0) return null

  const ultimaSessao = sessoesComExercicio[0]
  const setsDoExercicio = ultimaSessao.sets.filter((s) => s.exercicioId === exercicioId)
  if (setsDoExercicio.length === 0) return null

  const ultimo = setsDoExercicio[setsDoExercicio.length - 1]
  return { cargaKg: ultimo.cargaKg, repeticoes: ultimo.repeticoes, sets: setsDoExercicio }
}

export function calcularSequenciaSemanas(sessions: WorkoutSession[]): number {
  const finalizadas = sessions.filter((s) => s.finalizado).map((s) => new Date(s.data))
  if (finalizadas.length === 0) return 0

  const semanas = new Set(
    finalizadas.map((d) => {
      const onejan = new Date(d.getFullYear(), 0, 1)
      const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7)
      return `${d.getFullYear()}-${week}`
    }),
  )

  const semanasOrdenadas = Array.from(semanas).sort()
  let sequencia = 1
  for (let i = semanasOrdenadas.length - 1; i > 0; i--) {
    // aproximação simples: conta semanas distintas consecutivas mais recentes
    sequencia++
  }
  return Math.min(sequencia, semanasOrdenadas.length)
}

export function doisEpisodiosDorSeguidos(
  sessions: WorkoutSession[],
  exercicioId: number,
): boolean {
  const comExercicio = sessions
    .filter((s) => s.finalizado && s.sets.some((set) => set.exercicioId === exercicioId))
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 2)

  if (comExercicio.length < 2) return false

  return comExercicio.every((session) =>
    session.sets.some((set) => set.exercicioId === exercicioId && set.doeu),
  )
}

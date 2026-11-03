import { db } from './db'
import type { FoodItem } from '../types'
import { obterObjetivo, type GoalId } from './goals'

const alimentosSeed: Omit<FoodItem, 'id'>[] = [
  { nome: 'Ovo cozido', proteinaPor100g: 13, caloriasPor100g: 155, porcaoPadraoG: 50, customizado: false },
  { nome: 'Peito de frango grelhado', proteinaPor100g: 31, caloriasPor100g: 165, porcaoPadraoG: 120, customizado: false },
  { nome: 'Carne bovina magra (patinho)', proteinaPor100g: 28, caloriasPor100g: 170, porcaoPadraoG: 120, customizado: false },
  { nome: 'Peixe (tilápia ou similar)', proteinaPor100g: 26, caloriasPor100g: 128, porcaoPadraoG: 130, customizado: false },
  { nome: 'Iogurte natural', proteinaPor100g: 4, caloriasPor100g: 61, porcaoPadraoG: 170, customizado: false },
  { nome: 'Queijo minas', proteinaPor100g: 17, caloriasPor100g: 264, porcaoPadraoG: 30, customizado: false },
  { nome: 'Leite integral', proteinaPor100g: 3.2, caloriasPor100g: 61, porcaoPadraoG: 200, customizado: false },
  { nome: 'Feijão cozido', proteinaPor100g: 5, caloriasPor100g: 76, porcaoPadraoG: 100, customizado: false },
  { nome: 'Arroz branco cozido', proteinaPor100g: 2.5, caloriasPor100g: 128, porcaoPadraoG: 150, customizado: false },
  { nome: 'Whey protein (scoop)', proteinaPor100g: 80, caloriasPor100g: 380, porcaoPadraoG: 30, customizado: false },
  { nome: 'Pão francês', proteinaPor100g: 8, caloriasPor100g: 300, porcaoPadraoG: 50, customizado: false },
  { nome: 'Batata doce cozida', proteinaPor100g: 1.6, caloriasPor100g: 86, porcaoPadraoG: 150, customizado: false },
  { nome: 'Banana', proteinaPor100g: 1.1, caloriasPor100g: 89, porcaoPadraoG: 100, customizado: false },
  { nome: 'Castanha do Pará', proteinaPor100g: 14, caloriasPor100g: 656, porcaoPadraoG: 20, customizado: false },
  { nome: 'Azeite de oliva', proteinaPor100g: 0, caloriasPor100g: 884, porcaoPadraoG: 10, customizado: false },
]

export async function seedIfEmpty() {
  const exerciseCount = await db.exercises.count()
  if (exerciseCount === 0) {
    await db.exercises.bulkAdd(obterObjetivo('ganhar_massa').exercicios)
  }
  const foodCount = await db.foods.count()
  if (foodCount === 0) {
    await db.foods.bulkAdd(alimentosSeed)
  }
}

export async function aplicarObjetivo(objetivoId: GoalId) {
  const objetivo = obterObjetivo(objetivoId)
  await db.exercises.clear()
  await db.exercises.bulkAdd(objetivo.exercicios)
}

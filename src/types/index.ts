export interface Profile {
  id?: number
  nome: string
  idade: number
  pesoKg: number
  alturaCm: number
  pressaoAlta: boolean
  outrasLimitacoes: string
  objetivoId: 'ganhar_massa' | 'perder_peso' | 'manter_forma' | 'autonomia_mobilidade'
  perfilCorporalId: 'baixo_peso' | 'adequado' | 'excesso_peso'
  metaProteinaGKg: number
  metaCaloriasKcal: number
  aceitouAvisoMedico: boolean
  criadoEm: string
}

export interface Exercise {
  id?: number
  nome: string
  grupo: 'perna' | 'quadril' | 'lombar' | 'puxar' | 'empurrar' | 'core'
  descricao: string
  dicaSeguranca: string
  linkVideo?: string
  imagemId?: string
  ordem: number
}

export interface WorkoutDayTemplate {
  diaSemana: number // 0=dom ... 6=sab, usamos 1,3,5 (seg/qua/sex)
  exercicioIds: number[]
}

export type Percepcao = 'facil' | 'bom' | 'dificil' | 'dor'

export interface SetLog {
  exercicioId: number
  numeroSerie: number
  cargaKg: number
  repeticoes: number
  observacao?: string
  percepcao: Percepcao
}

export interface WorkoutSession {
  id?: number
  data: string // ISO date
  diaSemana: number
  sets: SetLog[]
  finalizado: boolean
  duracaoSegundos?: number
}

export interface PainEvent {
  id?: number
  exercicioId: number
  data: string
  sessionId: number
}

export interface FoodItem {
  id?: number
  nome: string
  proteinaPor100g: number
  caloriasPor100g: number
  porcaoPadraoG: number
  customizado: boolean
}

export interface MealEntry {
  foodItemId: number
  quantidadeG: number
}

export interface MealLog {
  id?: number
  data: string // ISO date (dia)
  refeicao: 'cafe' | 'lanche_manha' | 'almoco' | 'lanche_tarde' | 'jantar' | 'ceia'
  itens: MealEntry[]
}

export interface BodyMeasurement {
  id?: number
  data: string
  pesoKg: number
  cinturaCm?: number
  coxaCm?: number
  bracoCm?: number
  panturrilhaCm?: number
  percentualGordura?: number
}

export interface FunctionalTest {
  id?: number
  data: string
  levantarCadeira5xSegundos?: number
  apoioUmaPernaSegundos?: number
  caminhada10mSegundos?: number
  forcaPreensaoKg?: number
}

export interface Badge {
  id?: number
  tipo: 'sequencia' | 'carga' | 'constancia'
  titulo: string
  descricao: string
  conquistadoEm: string
}

export interface FamilyMessage {
  id?: number
  texto: string
  data: string
  lida: boolean
}

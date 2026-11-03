import Dexie, { type EntityTable } from 'dexie'
import type {
  Profile,
  Exercise,
  WorkoutSession,
  PainEvent,
  FoodItem,
  MealLog,
  BodyMeasurement,
  FunctionalTest,
  Badge,
  FamilyMessage,
} from '../types'

export class TreinoDB extends Dexie {
  profile!: EntityTable<Profile, 'id'>
  exercises!: EntityTable<Exercise, 'id'>
  sessions!: EntityTable<WorkoutSession, 'id'>
  painEvents!: EntityTable<PainEvent, 'id'>
  foods!: EntityTable<FoodItem, 'id'>
  meals!: EntityTable<MealLog, 'id'>
  measurements!: EntityTable<BodyMeasurement, 'id'>
  functionalTests!: EntityTable<FunctionalTest, 'id'>
  badges!: EntityTable<Badge, 'id'>
  familyMessages!: EntityTable<FamilyMessage, 'id'>

  constructor() {
    super('treino-pai-db')
    this.version(1).stores({
      profile: '++id',
      exercises: '++id, ordem',
      sessions: '++id, data',
      painEvents: '++id, exercicioId, data',
      foods: '++id, nome',
      meals: '++id, data',
      measurements: '++id, data',
      functionalTests: '++id, data',
      badges: '++id, tipo',
      familyMessages: '++id, data',
    })
  }
}

export const db = new TreinoDB()

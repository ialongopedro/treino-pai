import { Footprints, Activity, RotateCcw, Dumbbell, Flame, Accessibility } from 'lucide-react'
import type { Exercise } from '../types'

const ICONE_POR_GRUPO: Record<Exercise['grupo'], typeof Footprints> = {
  perna: Footprints,
  quadril: Activity,
  lombar: RotateCcw,
  puxar: Dumbbell,
  empurrar: Flame,
  core: Accessibility,
}

const COR_POR_GRUPO: Record<Exercise['grupo'], string> = {
  perna: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  quadril: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  lombar: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  puxar: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  empurrar: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  core: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
}

export function ExerciseIcon({ grupo, className }: { grupo: Exercise['grupo']; className?: string }) {
  const Icone = ICONE_POR_GRUPO[grupo]
  return (
    <div className={`flex items-center justify-center rounded-2xl ${COR_POR_GRUPO[grupo]} ${className ?? ''}`}>
      <Icone className="w-[55%] h-[55%]" strokeWidth={1.75} />
    </div>
  )
}

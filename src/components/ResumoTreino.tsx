import { TrendingUp, TrendingDown, Trophy } from 'lucide-react'
import { Card } from './Card'
import { calcularVolumeSessao } from '../lib/calc'
import type { Exercise, WorkoutSession } from '../types'

export function ResumoTreino({
  sessaoHoje,
  sessions,
  exercises,
}: {
  sessaoHoje: WorkoutSession
  sessions: WorkoutSession[]
  exercises: Exercise[]
}) {
  const volumeHoje = calcularVolumeSessao(sessaoHoje.sets)

  const anteriores = sessions
    .filter((s) => s.finalizado && s.id !== sessaoHoje.id)
    .sort((a, b) => b.data.localeCompare(a.data))

  const volumeAnterior = anteriores.length > 0 ? calcularVolumeSessao(anteriores[0].sets) : null
  const diferenca = volumeAnterior !== null ? volumeHoje - volumeAnterior : null
  const percentual =
    volumeAnterior && volumeAnterior > 0 ? Math.round(((volumeHoje - volumeAnterior) / volumeAnterior) * 100) : null

  const recordes = exercises
    .filter((ex) => {
      const maxAnterior = Math.max(
        0,
        ...anteriores.flatMap((s) => s.sets.filter((se) => se.exercicioId === ex.id).map((se) => se.cargaKg)),
      )
      const maxHoje = Math.max(0, ...sessaoHoje.sets.filter((se) => se.exercicioId === ex.id).map((se) => se.cargaKg))
      return maxAnterior > 0 && maxHoje > maxAnterior
    })
    .map((ex) => ex.nome)

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-slate-900 border-green-200 dark:border-green-900 text-center">
      <p className="text-3xl mb-1">🎉</p>
      <h2 className="text-xl font-bold text-green-800 dark:text-green-300 mb-3">Treino concluído!</h2>

      <p className="text-lg">
        Volume total: <strong>{Math.round(volumeHoje)} kg</strong>
      </p>

      {percentual !== null && diferenca !== null && (
        <p
          className={`mt-1 font-medium flex items-center justify-center gap-1 ${diferenca >= 0 ? 'text-green-700 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`}
        >
          {diferenca >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {diferenca >= 0 ? '+' : ''}
          {percentual}% comparado ao último treino
        </p>
      )}

      {recordes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-900">
          <p className="font-semibold text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1.5">
            <Trophy className="w-4 h-4" /> Novo recorde de carga!
          </p>
          {recordes.map((nome) => (
            <p key={nome} className="text-sm text-slate-600 dark:text-slate-300">
              {nome}
            </p>
          ))}
        </div>
      )}
    </Card>
  )
}

import type { Exercise, WorkoutSession } from '../types'
import { DIAS_DE_TREINO } from './date'
import { doisEpisodiosDorSeguidos, sugerirProgressao, ultimaCargaPorExercicio } from './calc'

export interface DicaTreinador {
  tom: 'alerta' | 'sugestao' | 'elogio' | 'lembrete'
  texto: string
}

function ultimoDiaDeTreinoAntesDeHoje(hoje: Date): Date {
  const d = new Date(hoje)
  do {
    d.setDate(d.getDate() - 1)
  } while (!DIAS_DE_TREINO.includes(d.getDay()))
  return d
}

function paraISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Gera no máximo uma dica por vez, na ordem de prioridade: segurança (dor) >
 * retomar constância > sugestão de progressão. Retorna null quando nenhuma
 * regra se aplica, pra quem chamar usar a mensagem motivacional padrão.
 */
export function gerarDicaTreinador({
  sessions,
  exercises,
  hoje = new Date(),
}: {
  sessions: WorkoutSession[]
  exercises: Exercise[]
  hoje?: Date
}): DicaTreinador | null {
  for (const ex of exercises) {
    if (ex.id && doisEpisodiosDorSeguidos(sessions, ex.id)) {
      return {
        tom: 'alerta',
        texto: `Dor registrada duas vezes seguidas em "${ex.nome}". Converse com o médico ou instrutor antes de continuar esse exercício.`,
      }
    }
  }

  const diaAnterior = ultimoDiaDeTreinoAntesDeHoje(hoje)
  const treinouNoDiaAnterior = sessions.some((s) => s.finalizado && s.data === paraISO(diaAnterior))
  const diasDesdeOAnterior = Math.round((hoje.getTime() - diaAnterior.getTime()) / 86400000)
  if (!treinouNoDiaAnterior && diasDesdeOAnterior <= 4) {
    return {
      tom: 'lembrete',
      texto: 'Você ficou um tempinho sem treinar. Sem culpa — hoje é uma boa chance de voltar, com calma.',
    }
  }

  for (const ex of exercises) {
    if (!ex.id) continue
    const ultimo = ultimaCargaPorExercicio(sessions, ex.id)
    if (!ultimo) continue
    const sugestao = sugerirProgressao(ultimo.sets, ultimo.cargaKg)
    if (sugestao.deveAumentar) {
      return {
        tom: 'sugestao',
        texto: `Nos últimos treinos de "${ex.nome}" você completou tudo com facilidade. Hoje é um bom dia pra tentar ${sugestao.cargaSugeridaKg}kg.`,
      }
    }
  }

  return null
}

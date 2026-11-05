import type { Exercise, WorkoutSession } from '../types'
import { DIAS_DE_TREINO_PADRAO } from './date'
import { doisEpisodiosDorSeguidos, sugerirProgressao, ultimaCargaPorExercicio } from './calc'

export interface DicaTreinador {
  tom: 'alerta' | 'sugestao' | 'elogio' | 'lembrete'
  texto: string
}

function paraISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function ultimoDiaDeTreinoAntesDeHoje(hoje: Date, diasDeTreino: number[]): Date {
  const d = new Date(hoje)
  do {
    d.setDate(d.getDate() - 1)
  } while (!diasDeTreino.includes(d.getDay()))
  return d
}

function diasPlanejadosEntre(inicio: Date, fim: Date, diasDeTreino: number[]): string[] {
  const dias: string[] = []
  const d = new Date(inicio)
  while (d <= fim) {
    if (diasDeTreino.includes(d.getDay())) dias.push(paraISO(d))
    d.setDate(d.getDate() + 1)
  }
  return dias
}

/**
 * Gera no máximo uma dica por vez, na ordem de prioridade: segurança (dor) >
 * frequência real abaixo do planejado > retomar depois de um treino perdido >
 * sugestão de progressão. Retorna null quando nenhuma regra se aplica, pra
 * quem chamar usar a mensagem motivacional padrão.
 */
export function gerarDicaTreinador({
  sessions,
  exercises,
  diasDeTreino = DIAS_DE_TREINO_PADRAO,
  hoje = new Date(),
}: {
  sessions: WorkoutSession[]
  exercises: Exercise[]
  diasDeTreino?: number[]
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

  const quatorzeDiasAtras = new Date(hoje)
  quatorzeDiasAtras.setDate(quatorzeDiasAtras.getDate() - 14)
  const ontem = new Date(hoje)
  ontem.setDate(ontem.getDate() - 1)
  const planejadosUltimasDuasSemanas = diasPlanejadosEntre(quatorzeDiasAtras, ontem, diasDeTreino)
  if (planejadosUltimasDuasSemanas.length >= 4) {
    const concluidos = planejadosUltimasDuasSemanas.filter((iso) =>
      sessions.some((s) => s.finalizado && s.data === iso),
    ).length
    if (concluidos <= planejadosUltimasDuasSemanas.length - 3) {
      return {
        tom: 'lembrete',
        texto: `Nas últimas duas semanas você treinou ${concluidos} de ${planejadosUltimasDuasSemanas.length} dias planejados. Pode ser mais fácil manter a constância com menos dias por semana — você pode ajustar isso no seu perfil.`,
      }
    }
  }

  const diaAnterior = ultimoDiaDeTreinoAntesDeHoje(hoje, diasDeTreino)
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

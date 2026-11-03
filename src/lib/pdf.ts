import jsPDF from 'jspdf'
import type { BodyMeasurement, Exercise, FoodItem, MealLog, Profile, WorkoutSession } from '../types'
import { calcularTotaisDoDia, calcularVolumeSessao } from './calc'
import { formatarDataCurta } from './date'

export function gerarRelatorioPDF({
  perfil,
  sessions,
  measurements,
  meals,
  foods,
  exercises,
}: {
  perfil?: Profile
  sessions: WorkoutSession[]
  measurements: BodyMeasurement[]
  meals: MealLog[]
  foods: FoodItem[]
  exercises: Exercise[]
}) {
  const doc = new jsPDF()
  let y = 20

  doc.setFontSize(18)
  doc.text('Relatório de Treino e Evolução', 14, y)
  y += 8
  doc.setFontSize(11)
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, y)
  y += 10

  if (perfil) {
    doc.setFontSize(14)
    doc.text('Perfil', 14, y)
    y += 7
    doc.setFontSize(11)
    doc.text(`${perfil.nome}, ${perfil.idade} anos, ${perfil.pesoKg}kg`, 14, y)
    y += 6
    if (perfil.pressaoAlta) {
      doc.text('Possui pressão alta.', 14, y)
      y += 6
    }
    if (perfil.outrasLimitacoes) {
      doc.text(`Limitações: ${perfil.outrasLimitacoes}`, 14, y)
      y += 6
    }
    y += 4
  }

  const sessoesFinalizadas = sessions.filter((s) => s.finalizado)
  doc.setFontSize(14)
  doc.text('Treino', 14, y)
  y += 7
  doc.setFontSize(11)
  doc.text(`Total de treinos concluídos: ${sessoesFinalizadas.length}`, 14, y)
  y += 6

  const ultimasSessoes = sessoesFinalizadas.slice(-8)
  for (const sessao of ultimasSessoes) {
    const volume = calcularVolumeSessao(sessao.sets)
    doc.text(`${formatarDataCurta(sessao.data)} — volume: ${Math.round(volume)} kg totais`, 14, y)
    y += 6
    if (y > 270) {
      doc.addPage()
      y = 20
    }
  }
  y += 4

  if (y > 240) {
    doc.addPage()
    y = 20
  }

  doc.setFontSize(14)
  doc.text('Peso e medidas', 14, y)
  y += 7
  doc.setFontSize(11)
  const ultimasMedidas = measurements.slice(-8)
  for (const m of ultimasMedidas) {
    doc.text(
      `${formatarDataCurta(m.data)} — ${m.pesoKg}kg${m.cinturaCm ? `, cintura ${m.cinturaCm}cm` : ''}`,
      14,
      y,
    )
    y += 6
    if (y > 270) {
      doc.addPage()
      y = 20
    }
  }
  y += 4

  if (y > 240) {
    doc.addPage()
    y = 20
  }

  doc.setFontSize(14)
  doc.text('Proteína média (últimos 7 dias com registro)', 14, y)
  y += 7
  doc.setFontSize(11)
  const diasComRegistro = Array.from(new Set(meals.map((m) => m.data))).sort().slice(-7)
  const mediaProteina =
    diasComRegistro.length > 0
      ? diasComRegistro.reduce((soma, dia) => {
          const mealsDoDia = meals.filter((m) => m.data === dia)
          return soma + calcularTotaisDoDia(mealsDoDia, foods).proteina
        }, 0) / diasComRegistro.length
      : 0
  doc.text(`Média: ${Math.round(mediaProteina)}g de proteína por dia`, 14, y)
  y += 10

  doc.setFontSize(9)
  doc.setTextColor(120)
  doc.text(
    'Este relatório é gerado por um aplicativo de acompanhamento pessoal e não substitui',
    14,
    y,
  )
  y += 5
  doc.text('orientação médica ou de profissional de educação física.', 14, y)

  const nomeArquivo = `relatorio-treino-${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(nomeArquivo)

  void exercises
}

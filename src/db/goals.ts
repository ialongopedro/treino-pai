import type { Exercise } from '../types'

export type GoalId = 'ganhar_massa' | 'perder_peso' | 'manter_forma' | 'autonomia_mobilidade'

export interface GoalDefinition {
  id: GoalId
  emoji: string
  nome: string
  descricao: string
  metaProteinaGKg: number
  ajusteCalorico: 'superavit' | 'deficit' | 'manutencao'
  ajusteCaloriasKcal: number
  repMin: number
  repMax: number
  descansoSegundos: number
  exerciciosPadrao: Omit<Exercise, 'id'>[]
  exerciciosAdaptados: Omit<Exercise, 'id'>[]
}

export const OBJETIVOS: GoalDefinition[] = [
  {
    id: 'ganhar_massa',
    emoji: '💪',
    nome: 'Ganhar massa magra',
    descricao:
      'Foco em pernas, quadril e lombar, com progressão de carga e leve superávit calórico.',
    metaProteinaGKg: 1.4,
    ajusteCalorico: 'superavit',
    ajusteCaloriasKcal: 300,
    repMin: 8,
    repMax: 12,
    descansoSegundos: 75,
    exerciciosPadrao: [
      {
        nome: 'Agachamento no banco (ou leg press)',
        grupo: 'perna',
        descricao:
          'Sente e levante de um banco ou cadeira firme, ou use o leg press na academia. Desça controlado, suba empurrando com os calcanhares.',
        dicaSeguranca:
          'Não force o joelho para dentro. Pressão alta: expire ao empurrar o peso, nunca prenda a respiração.',
        ordem: 1,
      },
      {
        nome: 'Levantamento terra romeno leve (ou mesa flexora)',
        grupo: 'lombar',
        descricao:
          'Com halteres leves ou barra, incline o quadril para trás mantendo a coluna reta, ou use a mesa flexora na academia.',
        dicaSeguranca: 'Mantenha a coluna neutra, sem arredondar as costas. Comece com carga bem leve.',
        ordem: 2,
      },
      {
        nome: 'Remada (puxada)',
        grupo: 'puxar',
        descricao: 'Puxada na polia ou remada com halteres, trazendo os cotovelos para trás, apertando as costas.',
        dicaSeguranca: 'Evite balançar o corpo. Movimento controlado na ida e na volta.',
        ordem: 3,
      },
      {
        nome: 'Supino ou flexão inclinada',
        grupo: 'empurrar',
        descricao:
          'Supino na máquina ou com halteres, ou flexão de braço com as mãos apoiadas em uma superfície mais alta.',
        dicaSeguranca: 'Expire ao empurrar. Não trave os cotovelos com força no final do movimento.',
        ordem: 4,
      },
      {
        nome: 'Elevação pélvica + prancha ou extensão lombar leve',
        grupo: 'quadril',
        descricao:
          'Deitado, suba o quadril apertando o glúteo. Depois, prancha curta ou extensão lombar leve para a região baixa das costas.',
        dicaSeguranca: 'Sem pressa, movimento controlado. Pare se sentir dor na lombar.',
        ordem: 5,
      },
    ],
    exerciciosAdaptados: [
      {
        nome: 'Agachamento na cadeira com apoio dos braços',
        grupo: 'perna',
        descricao: 'Sente e levante de uma cadeira firme, apoiando as mãos nos braços da cadeira ou numa mesa.',
        dicaSeguranca: 'Peso bem distribuído nos dois pés. Expire ao levantar, sem pressa.',
        ordem: 1,
      },
      {
        nome: 'Extensão de quadril apoiada (ou mesa flexora leve)',
        grupo: 'lombar',
        descricao: 'Deitado de barriga para cima, eleve o quadril apertando o glúteo, ou use a mesa flexora com carga mínima.',
        dicaSeguranca: 'Evite movimentos de tronco livre (sem hiperextensão da lombar). Carga bem leve.',
        ordem: 2,
      },
      {
        nome: 'Remada sentada (polia ou elástico leve)',
        grupo: 'puxar',
        descricao: 'Sentado, puxe a polia ou elástico trazendo os cotovelos para trás.',
        dicaSeguranca: 'Apoio total das costas no banco. Movimento curto e controlado.',
        ordem: 3,
      },
      {
        nome: 'Flexão de braço na parede',
        grupo: 'empurrar',
        descricao: 'De pé, mãos na parede na altura dos ombros, flexione os braços levando o peito à parede e empurre de volta.',
        dicaSeguranca: 'Pés afastados da parede o suficiente para sentir esforço leve. Expire ao empurrar.',
        ordem: 4,
      },
      {
        nome: 'Elevação pélvica apoiada',
        grupo: 'quadril',
        descricao: 'Deitado, suba o quadril apertando o glúteo, sem prancha nesta versão.',
        dicaSeguranca: 'Movimento curto, sem forçar a lombar.',
        ordem: 5,
      },
    ],
  },
  {
    id: 'perder_peso',
    emoji: '🔥',
    nome: 'Perder peso / definição',
    descricao:
      'Mais repetições e volume, proteína alta para proteger a massa magra durante o déficit calórico.',
    metaProteinaGKg: 1.8,
    ajusteCalorico: 'deficit',
    ajusteCaloriasKcal: -400,
    repMin: 12,
    repMax: 15,
    descansoSegundos: 45,
    exerciciosPadrao: [
      {
        nome: 'Agachamento livre ou no banco',
        grupo: 'perna',
        descricao: 'Agache mantendo o peso nos calcanhares, pode usar apoio de uma cadeira se precisar.',
        dicaSeguranca: 'Joelhos alinhados com os pés. Expire ao subir.',
        ordem: 1,
      },
      {
        nome: 'Afundo alternado (passada curta)',
        grupo: 'perna',
        descricao: 'Dê um passo à frente e flexione os dois joelhos, volte e alterne o lado.',
        dicaSeguranca: 'Use apoio de uma cadeira ao lado se precisar de equilíbrio.',
        ordem: 2,
      },
      {
        nome: 'Remada (puxada)',
        grupo: 'puxar',
        descricao: 'Puxada na polia ou remada com halteres, trazendo os cotovelos para trás.',
        dicaSeguranca: 'Movimento controlado, sem balançar o corpo.',
        ordem: 3,
      },
      {
        nome: 'Flexão de braço inclinada',
        grupo: 'empurrar',
        descricao: 'Mãos apoiadas em uma superfície mais alta (banco, mesa), empurre o corpo para cima.',
        dicaSeguranca: 'Expire ao empurrar. Mantenha o corpo reto.',
        ordem: 4,
      },
      {
        nome: 'Prancha + elevação de joelhos no lugar',
        grupo: 'core',
        descricao: 'Prancha curta seguida de elevação alternada de joelhos em ritmo leve, sem pressa.',
        dicaSeguranca: 'Pare se sentir dor na lombar ou falta de ar excessiva.',
        ordem: 5,
      },
    ],
    exerciciosAdaptados: [
      {
        nome: 'Agachamento na cadeira com apoio',
        grupo: 'perna',
        descricao: 'Sente e levante de uma cadeira firme, apoiando as mãos se precisar.',
        dicaSeguranca: 'Peso nos calcanhares. Sem pressa.',
        ordem: 1,
      },
      {
        nome: 'Marcha estacionária apoiada',
        grupo: 'perna',
        descricao: 'Em pé, apoiado numa cadeira ou parede, suba os joelhos alternados num ritmo leve, como se estivesse marchando.',
        dicaSeguranca: 'Sempre com apoio por perto. Ritmo controlado, sem pressa.',
        ordem: 2,
      },
      {
        nome: 'Remada sentada (polia ou elástico leve)',
        grupo: 'puxar',
        descricao: 'Sentado, puxe a polia ou elástico trazendo os cotovelos para trás.',
        dicaSeguranca: 'Apoio total das costas no banco.',
        ordem: 3,
      },
      {
        nome: 'Flexão de braço na parede',
        grupo: 'empurrar',
        descricao: 'De pé, mãos na parede na altura dos ombros, flexione os braços e empurre de volta.',
        dicaSeguranca: 'Expire ao empurrar.',
        ordem: 4,
      },
      {
        nome: 'Prancha apoiada nos joelhos',
        grupo: 'core',
        descricao: 'Prancha curta com os joelhos no chão, sem elevação de joelhos nesta versão.',
        dicaSeguranca: 'Pare se sentir dor na lombar ou falta de ar.',
        ordem: 5,
      },
    ],
  },
  {
    id: 'manter_forma',
    emoji: '⚖️',
    nome: 'Manter a forma',
    descricao: 'Treino equilibrado e calorias de manutenção, para preservar o que já foi conquistado.',
    metaProteinaGKg: 1.2,
    ajusteCalorico: 'manutencao',
    ajusteCaloriasKcal: 0,
    repMin: 10,
    repMax: 12,
    descansoSegundos: 60,
    exerciciosPadrao: [
      {
        nome: 'Agachamento no banco (ou leg press)',
        grupo: 'perna',
        descricao: 'Sente e levante de um banco firme, ou use o leg press na academia.',
        dicaSeguranca: 'Desça controlado, sem forçar o joelho para dentro.',
        ordem: 1,
      },
      {
        nome: 'Levantamento terra romeno leve',
        grupo: 'lombar',
        descricao: 'Com halteres leves, incline o quadril para trás mantendo a coluna reta.',
        dicaSeguranca: 'Coluna neutra, carga bem leve no início.',
        ordem: 2,
      },
      {
        nome: 'Remada (puxada)',
        grupo: 'puxar',
        descricao: 'Puxada na polia ou remada com halteres.',
        dicaSeguranca: 'Movimento controlado, sem pressa.',
        ordem: 3,
      },
      {
        nome: 'Supino ou flexão inclinada',
        grupo: 'empurrar',
        descricao: 'Supino na máquina, com halteres, ou flexão apoiada em superfície mais alta.',
        dicaSeguranca: 'Expire ao empurrar.',
        ordem: 4,
      },
      {
        nome: 'Elevação de panturrilha em pé',
        grupo: 'quadril',
        descricao: 'Em pé, suba na ponta dos pés e desça controlado. Pode se apoiar em algo.',
        dicaSeguranca: 'Movimento lento, sem saltar.',
        ordem: 5,
      },
    ],
    exerciciosAdaptados: [
      {
        nome: 'Agachamento na cadeira com apoio',
        grupo: 'perna',
        descricao: 'Sente e levante de uma cadeira firme, com apoio dos braços se precisar.',
        dicaSeguranca: 'Sem pressa, peso nos calcanhares.',
        ordem: 1,
      },
      {
        nome: 'Extensão de quadril apoiada',
        grupo: 'lombar',
        descricao: 'Deitado, eleve o quadril apertando o glúteo, com carga bem leve ou sem carga.',
        dicaSeguranca: 'Movimento curto, sem hiperextensão da lombar.',
        ordem: 2,
      },
      {
        nome: 'Remada sentada (polia ou elástico leve)',
        grupo: 'puxar',
        descricao: 'Sentado, puxe a polia ou elástico levando os cotovelos para trás.',
        dicaSeguranca: 'Apoio total das costas no banco.',
        ordem: 3,
      },
      {
        nome: 'Flexão de braço na parede',
        grupo: 'empurrar',
        descricao: 'Mãos na parede na altura dos ombros, flexione os braços e empurre de volta.',
        dicaSeguranca: 'Expire ao empurrar.',
        ordem: 4,
      },
      {
        nome: 'Elevação de panturrilha sentado',
        grupo: 'quadril',
        descricao: 'Sentado numa cadeira, suba e desça a ponta dos pés.',
        dicaSeguranca: 'Movimento lento, sem pressa. Reduz a exigência de equilíbrio.',
        ordem: 5,
      },
    ],
  },
  {
    id: 'autonomia_mobilidade',
    emoji: '🧓',
    nome: 'Autonomia e mobilidade',
    descricao:
      'Foco em equilíbrio, força funcional e prevenção de quedas — menos sobre estética, mais sobre independência no dia a dia.',
    metaProteinaGKg: 1.3,
    ajusteCalorico: 'manutencao',
    ajusteCaloriasKcal: 0,
    repMin: 10,
    repMax: 15,
    descansoSegundos: 90,
    exerciciosPadrao: [
      {
        nome: 'Sentar e levantar da cadeira',
        grupo: 'perna',
        descricao: 'Levante e sente numa cadeira firme, sem usar as mãos se possível.',
        dicaSeguranca: 'Use os braços de apoio se precisar. Expire ao levantar.',
        ordem: 1,
      },
      {
        nome: 'Equilíbrio em uma perna (com apoio)',
        grupo: 'core',
        descricao: 'Apoiado em uma cadeira ou parede, fique em uma perna por alguns segundos e troque.',
        dicaSeguranca: 'Sempre com apoio por perto. Pare se sentir instabilidade.',
        ordem: 2,
      },
      {
        nome: 'Subir degrau (step-up)',
        grupo: 'perna',
        descricao: 'Suba e desça de um degrau ou step baixo, alternando a perna que inicia.',
        dicaSeguranca: 'Use corrimão ou apoio se disponível. Movimento lento.',
        ordem: 3,
      },
      {
        nome: 'Elevação de panturrilha em pé',
        grupo: 'quadril',
        descricao: 'Em pé, suba na ponta dos pés e desça controlado, com apoio se precisar.',
        dicaSeguranca: 'Sem saltar, movimento controlado.',
        ordem: 4,
      },
      {
        nome: 'Mobilidade de quadril e alongamento leve',
        grupo: 'lombar',
        descricao: 'Movimentos leves de rotação de quadril e alongamento da lombar e posterior de coxa.',
        dicaSeguranca: 'Sem dor. Movimento suave, sem forçar.',
        ordem: 5,
      },
    ],
    exerciciosAdaptados: [
      {
        nome: 'Sentar e levantar da cadeira (com apoio dos braços)',
        grupo: 'perna',
        descricao: 'Levante e sente numa cadeira firme, sempre apoiando as mãos nos braços da cadeira.',
        dicaSeguranca: 'Não force sem apoio. Expire ao levantar, sem pressa.',
        ordem: 1,
      },
      {
        nome: 'Equilíbrio em uma perna (apoio com as duas mãos)',
        grupo: 'core',
        descricao: 'Apoiado com as duas mãos numa cadeira ou parede, fique em uma perna por alguns segundos e troque.',
        dicaSeguranca: 'Nunca sem apoio firme por perto. Pare se sentir qualquer instabilidade.',
        ordem: 2,
      },
      {
        nome: 'Marcha estacionária apoiada',
        grupo: 'perna',
        descricao: 'Em pé, apoiado numa cadeira ou parede, suba os joelhos alternados num ritmo leve.',
        dicaSeguranca: 'Sempre com apoio por perto, substitui o degrau para reduzir risco de queda.',
        ordem: 3,
      },
      {
        nome: 'Elevação de panturrilha sentado',
        grupo: 'quadril',
        descricao: 'Sentado numa cadeira, suba e desça a ponta dos pés.',
        dicaSeguranca: 'Movimento lento, sem exigir equilíbrio em pé.',
        ordem: 4,
      },
      {
        nome: 'Mobilidade de quadril e alongamento leve (sentado)',
        grupo: 'lombar',
        descricao: 'Sentado numa cadeira, movimentos leves de rotação de quadril e alongamento da lombar.',
        dicaSeguranca: 'Sem dor. Movimento suave, sem forçar.',
        ordem: 5,
      },
    ],
  },
]

export function obterObjetivo(id: GoalId | undefined): GoalDefinition {
  return OBJETIVOS.find((o) => o.id === id) ?? OBJETIVOS[0]
}

export function calcularMetaCaloriasSugerida(pesoKg: number, objetivo: GoalDefinition): number {
  const manutencao = Math.round(pesoKg * 30)
  return manutencao + objetivo.ajusteCaloriasKcal
}

export type PerfilCorporalId = 'baixo_peso' | 'adequado' | 'excesso_peso'

export interface PerfilCorporalDefinition {
  id: PerfilCorporalId
  emoji: string
  nome: string
  descricao: string
  usaExerciciosAdaptados: boolean
  descansoExtraSegundos: number
  ajusteProteinaGKg: number
  dicasAlimentares: string[]
  sugestoesRefeicoes: string[]
}

export const PERFIS_CORPORAIS: PerfilCorporalDefinition[] = [
  {
    id: 'baixo_peso',
    emoji: '🪶',
    nome: 'Abaixo do peso',
    descricao: 'Risco de perda de massa magra e fragilidade. Foco em comer mais e com densidade nutricional.',
    usaExerciciosAdaptados: true,
    descansoExtraSegundos: 15,
    ajusteProteinaGKg: 0.1,
    dicasAlimentares: [
      'Prefira alimentos calóricos e nutritivos: castanhas, azeite, queijos, abacate, whey.',
      'Faça 5 a 6 refeições pequenas ao longo do dia, em vez de poucas refeições grandes.',
      'Não pule refeições mesmo sem muita fome — coma por horário, não só por apetite.',
      'Adicione uma fonte de proteína em cada refeição, mesmo nos lanches.',
    ],
    sugestoesRefeicoes: [
      'Omelete de 2 ovos com queijo + fatia de pão com manteiga',
      'Vitamina de banana com leite integral, whey e uma colher de pasta de amendoim',
      'Arroz, feijão, carne e uma porção extra de azeite de oliva no prato',
      'Iogurte integral com granola e castanhas',
    ],
  },
  {
    id: 'adequado',
    emoji: '⚖️',
    nome: 'Peso adequado',
    descricao: 'Peso dentro da faixa saudável para a idade. Foco em manter o equilíbrio.',
    usaExerciciosAdaptados: false,
    descansoExtraSegundos: 0,
    ajusteProteinaGKg: 0,
    dicasAlimentares: [
      'Mantenha a variedade entre os grupos alimentares — proteínas, carboidratos, gorduras boas e vegetais.',
      'Priorize alimentos de verdade e evite ultraprocessados no dia a dia.',
      'Hidrate-se bem ao longo do dia, não só durante o treino.',
    ],
    sugestoesRefeicoes: [
      'Peito de frango grelhado, arroz, feijão e salada',
      'Peixe assado com batata doce e legumes',
      'Ovo cozido, pão integral e fruta no café da manhã',
    ],
  },
  {
    id: 'excesso_peso',
    emoji: '🧭',
    nome: 'Excesso de peso',
    descricao: 'Foco em proteger as articulações no treino e priorizar saciedade e proteínas magras na dieta.',
    usaExerciciosAdaptados: true,
    descansoExtraSegundos: 15,
    ajusteProteinaGKg: 0.1,
    dicasAlimentares: [
      'Priorize proteínas magras: frango sem pele, peixe, claras de ovo, iogurte natural.',
      'Encha metade do prato com vegetais antes de servir o carboidrato.',
      'Evite frituras, refrigerante e açúcar refinado no dia a dia.',
      'Coma devagar e preste atenção à saciedade — não precisa terminar o prato todo.',
    ],
    sugestoesRefeicoes: [
      'Peito de frango grelhado com bastante salada e uma porção pequena de arroz',
      'Peixe grelhado com legumes no vapor',
      'Omelete de claras com espinafre',
      'Iogurte natural sem açúcar com uma fruta',
    ],
  },
]

export function obterPerfilCorporal(id: PerfilCorporalId | undefined): PerfilCorporalDefinition {
  return PERFIS_CORPORAIS.find((p) => p.id === id) ?? PERFIS_CORPORAIS[1]
}

export function calcularIMC(pesoKg: number, alturaCm: number): number {
  const alturaM = alturaCm / 100
  return pesoKg / (alturaM * alturaM)
}

// Classificação de IMC para idosos (critério de Lipschitz, usado para 60+ anos)
export function classificarIMC(imc: number): PerfilCorporalId {
  if (imc < 22) return 'baixo_peso'
  if (imc > 27) return 'excesso_peso'
  return 'adequado'
}

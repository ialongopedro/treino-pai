export const DIAS_DE_TREINO = [1, 3, 5] // segunda, quarta, sexta

export function hojeISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function ehDiaDeTreino(data: Date = new Date()): boolean {
  return DIAS_DE_TREINO.includes(data.getDay())
}

export function formatarDataCurta(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano.slice(2)}`
}

export function nomeDoDia(data: Date = new Date()): string {
  const nomes = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  return nomes[data.getDay()]
}

export function inicioDaSemanaISO(data: Date = new Date()): string {
  const d = new Date(data)
  const diff = d.getDate() - d.getDay()
  const inicio = new Date(d.setDate(diff))
  return `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, '0')}-${String(inicio.getDate()).padStart(2, '0')}`
}

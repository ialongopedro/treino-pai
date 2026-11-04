import { DIAS_DE_TREINO } from '../lib/date'

const LETRAS_DIA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function paraISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function CalendarioSequencia({ diasFinalizados }: { diasFinalizados: Set<string> }) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const dias: { iso: string; diaSemana: number; ehHoje: boolean; ehFuturo: boolean }[] = []
  for (let i = 27; i >= 0; i--) {
    const d = new Date(hoje)
    d.setDate(d.getDate() - i)
    dias.push({
      iso: paraISO(d),
      diaSemana: d.getDay(),
      ehHoje: i === 0,
      ehFuturo: false,
    })
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5">
        {LETRAS_DIA.map((letra, i) => (
          <div key={i} className="text-center text-xs text-slate-400">
            {letra}
          </div>
        ))}
        {dias.map((dia) => {
          const diaDeTreinoPlanejado = DIAS_DE_TREINO.includes(dia.diaSemana)
          const concluido = diasFinalizados.has(dia.iso)
          const perdido = diaDeTreinoPlanejado && !concluido && !dia.ehHoje

          return (
            <div
              key={dia.iso}
              title={dia.iso}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs transition-colors ${
                concluido
                  ? 'bg-gradient-to-br from-green-500 to-green-600 text-white font-semibold shadow-sm'
                  : perdido
                    ? 'bg-red-100 dark:bg-red-950 text-red-400'
                    : diaDeTreinoPlanejado
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                      : 'bg-transparent text-slate-300 dark:text-slate-600'
              } ${dia.ehHoje ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-white dark:ring-offset-slate-900' : ''}`}
            >
              {concluido ? '✓' : new Date(dia.iso).getDate()}
            </div>
          )
        })}
      </div>
      <div className="flex gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-600 inline-block" /> treinou
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-100 dark:bg-red-950 inline-block" /> não treinou
        </span>
      </div>
    </div>
  )
}

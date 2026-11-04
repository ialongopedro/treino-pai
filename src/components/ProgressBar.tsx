export function ProgressBar({
  valor,
  meta,
  label,
  unidade = 'g',
}: {
  valor: number
  meta: number
  label: string
  unidade?: string
}) {
  const percentual = meta > 0 ? Math.min(100, Math.round((valor / meta) * 100)) : 0
  const falta = Math.max(0, Math.round(meta - valor))

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="font-semibold text-lg">{label}</span>
        <span className="text-slate-500 dark:text-slate-400">
          {Math.round(valor)} / {Math.round(meta)}
          {unidade}
        </span>
      </div>
      <div className="w-full h-5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all"
          style={{ width: `${percentual}%` }}
        />
      </div>
      {falta > 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Faltam {falta}
          {unidade} para a meta de hoje
        </p>
      ) : (
        <p className="text-sm text-green-700 dark:text-green-400 mt-1 font-medium">
          Meta batida hoje! 🎉
        </p>
      )}
    </div>
  )
}

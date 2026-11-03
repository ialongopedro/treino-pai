import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { db } from '../db/db'
import { Card } from '../components/Card'
import { BigButton } from '../components/BigButton'
import { formatarDataCurta, hojeISO } from '../lib/date'
import { calcularVolumeSessao } from '../lib/calc'
import { gerarRelatorioPDF } from '../lib/pdf'
import type { BodyMeasurement, FunctionalTest } from '../types'

export function Evolucao() {
  const measurements = useLiveQuery(() => db.measurements.orderBy('data').toArray()) ?? []
  const sessions = useLiveQuery(() => db.sessions.orderBy('data').toArray()) ?? []
  const exercises = useLiveQuery(() => db.exercises.orderBy('ordem').toArray()) ?? []
  const functionalTests = useLiveQuery(() => db.functionalTests.orderBy('data').toArray()) ?? []
  const meals = useLiveQuery(() => db.meals.toArray()) ?? []
  const foods = useLiveQuery(() => db.foods.toArray()) ?? []
  const perfil = useLiveQuery(() => db.profile.toCollection().first())

  const [mostrarFormPeso, setMostrarFormPeso] = useState(false)
  const [mostrarFormTeste, setMostrarFormTeste] = useState(false)
  const [peso, setPeso] = useState('')
  const [cintura, setCintura] = useState('')
  const [coxa, setCoxa] = useState('')
  const [braco, setBraco] = useState('')
  const [panturrilha, setPanturrilha] = useState('')

  const [tCadeira, setTCadeira] = useState('')
  const [tApoio, setTApoio] = useState('')
  const [tCaminhada, setTCaminhada] = useState('')

  async function salvarMedidas() {
    if (!peso) return
    const nova: BodyMeasurement = {
      data: hojeISO(),
      pesoKg: parseFloat(peso),
      cinturaCm: cintura ? parseFloat(cintura) : undefined,
      coxaCm: coxa ? parseFloat(coxa) : undefined,
      bracoCm: braco ? parseFloat(braco) : undefined,
      panturrilhaCm: panturrilha ? parseFloat(panturrilha) : undefined,
    }
    await db.measurements.add(nova)
    setPeso('')
    setCintura('')
    setCoxa('')
    setBraco('')
    setPanturrilha('')
    setMostrarFormPeso(false)
  }

  async function salvarTeste() {
    const novo: FunctionalTest = {
      data: hojeISO(),
      levantarCadeira5xSegundos: tCadeira ? parseFloat(tCadeira) : undefined,
      apoioUmaPernaSegundos: tApoio ? parseFloat(tApoio) : undefined,
      caminhada10mSegundos: tCaminhada ? parseFloat(tCaminhada) : undefined,
    }
    await db.functionalTests.add(novo)
    setTCadeira('')
    setTApoio('')
    setTCaminhada('')
    setMostrarFormTeste(false)
  }

  const dadosPeso = measurements.map((m) => ({
    data: formatarDataCurta(m.data),
    peso: m.pesoKg,
  }))

  const volumePorSessao = sessions
    .filter((s) => s.finalizado)
    .map((s) => ({ data: formatarDataCurta(s.data), volume: calcularVolumeSessao(s.sets) }))

  function cargaMaximaPorExercicio(exercicioId: number) {
    return sessions
      .filter((s) => s.finalizado)
      .map((s) => {
        const sets = s.sets.filter((set) => set.exercicioId === exercicioId)
        const max = sets.reduce((m, set) => Math.max(m, set.cargaKg), 0)
        return { data: formatarDataCurta(s.data), carga: max }
      })
      .filter((d) => d.carga > 0)
  }

  function exportarPDF() {
    gerarRelatorioPDF({ perfil, sessions, measurements, meals, foods, exercises })
  }

  return (
    <div className="p-4 pb-24 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Evolução</h1>

      <Card>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Peso ao longo do tempo</h2>
          <BigButton
            variant="secondary"
            className="!min-h-[40px] !py-1 text-sm"
            onClick={() => setMostrarFormPeso((v) => !v)}
          >
            + Registrar
          </BigButton>
        </div>

        {mostrarFormPeso && (
          <div className="flex flex-col gap-2 mb-3">
            <input
              type="number"
              placeholder="Peso (kg)"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              className="min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                placeholder="Cintura cm"
                value={cintura}
                onChange={(e) => setCintura(e.target.value)}
                className="min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 text-sm"
              />
              <input
                type="number"
                placeholder="Coxa cm"
                value={coxa}
                onChange={(e) => setCoxa(e.target.value)}
                className="min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 text-sm"
              />
              <input
                type="number"
                placeholder="Braço cm"
                value={braco}
                onChange={(e) => setBraco(e.target.value)}
                className="min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 text-sm"
              />
            </div>
            <BigButton onClick={salvarMedidas}>Salvar</BigButton>
          </div>
        )}

        {dadosPeso.length > 1 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dadosPeso}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Line type="monotone" dataKey="peso" stroke="#1d4ed8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">Registre o peso por algumas semanas para ver o gráfico.</p>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-2">Volume semanal de treino</h2>
        {volumePorSessao.length > 1 ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={volumePorSessao}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="volume" stroke="#15803d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">Finalize alguns treinos para ver a evolução.</p>
        )}
      </Card>

      {exercises.map((ex) => {
        const dados = cargaMaximaPorExercicio(ex.id!)
        if (dados.length < 2) return null
        return (
          <Card key={ex.id}>
            <h2 className="text-lg font-semibold mb-2">{ex.nome} — carga máxima</h2>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={dados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="carga" stroke="#b45309" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )
      })}

      <Card>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Teste funcional (a cada 4 semanas)</h2>
          <BigButton
            variant="secondary"
            className="!min-h-[40px] !py-1 text-sm"
            onClick={() => setMostrarFormTeste((v) => !v)}
          >
            + Registrar
          </BigButton>
        </div>
        {mostrarFormTeste && (
          <div className="flex flex-col gap-2">
            <input
              type="number"
              placeholder="Levantar da cadeira 5x (segundos)"
              value={tCadeira}
              onChange={(e) => setTCadeira(e.target.value)}
              className="min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3"
            />
            <input
              type="number"
              placeholder="Apoio em uma perna (segundos)"
              value={tApoio}
              onChange={(e) => setTApoio(e.target.value)}
              className="min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3"
            />
            <input
              type="number"
              placeholder="Caminhada de 10m (segundos)"
              value={tCaminhada}
              onChange={(e) => setTCaminhada(e.target.value)}
              className="min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3"
            />
            <BigButton onClick={salvarTeste}>Salvar</BigButton>
          </div>
        )}
        {functionalTests.length > 0 && (
          <ul className="mt-2 text-slate-600 dark:text-slate-300 text-sm flex flex-col gap-1">
            {functionalTests.slice(-3).reverse().map((t) => (
              <li key={t.id}>
                {formatarDataCurta(t.data)}: cadeira {t.levantarCadeira5xSegundos ?? '-'}s · apoio{' '}
                {t.apoioUmaPernaSegundos ?? '-'}s · caminhada {t.caminhada10mSegundos ?? '-'}s
              </li>
            ))}
          </ul>
        )}
      </Card>

      <BigButton variant="secondary" className="w-full" onClick={exportarPDF}>
        📄 Exportar relatório em PDF
      </BigButton>
    </div>
  )
}

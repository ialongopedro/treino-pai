import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Share2 } from 'lucide-react'
import { db } from '../db/db'
import { Card } from '../components/Card'
import { BigButton } from '../components/BigButton'
import { calcularMetaProteina, calcularSequenciaSemanas, calcularTotaisDoDia } from '../lib/calc'
import { OBJETIVOS, obterObjetivo, calcularMetaCaloriasSugerida, type GoalDefinition } from '../db/goals'
import {
  PERFIS_CORPORAIS,
  obterPerfilCorporal,
  calcularIMC,
  classificarIMC,
  type PerfilCorporalDefinition,
} from '../db/perfisCorporais'
import { aplicarObjetivo } from '../db/seed'
import type { Profile } from '../types'

const MARCOS_SEQUENCIA = [1, 4, 8, 12, 24]
const MARCOS_TREINOS = [10, 25, 50, 100]

export function Perfil() {
  const perfil = useLiveQuery(() => db.profile.toCollection().first())
  const sessions = useLiveQuery(() => db.sessions.toArray()) ?? []
  const meals = useLiveQuery(() => db.meals.toArray()) ?? []
  const foods = useLiveQuery(() => db.foods.toArray()) ?? []

  const [editando, setEditando] = useState(!perfil)
  const [compartilharFamilia, setCompartilharFamilia] = useState(
    () => localStorage.getItem('compartilharFamilia') === 'true',
  )
  const [mensagemCopiada, setMensagemCopiada] = useState(false)

  async function salvarPerfil(dados: Profile) {
    const objetivoMudou = perfil && perfil.objetivoId !== dados.objetivoId
    const perfilCorporalMudou = perfil && perfil.perfilCorporalId !== dados.perfilCorporalId
    if (perfil?.id) {
      await db.profile.update(perfil.id, dados)
    } else {
      await db.profile.add({ ...dados, aceitouAvisoMedico: true, criadoEm: new Date().toISOString() })
    }
    if (!perfil || objetivoMudou || perfilCorporalMudou) {
      await aplicarObjetivo(dados.objetivoId, dados.perfilCorporalId)
    }
    setEditando(false)
  }

  function alternarCompartilhamento() {
    const novo = !compartilharFamilia
    setCompartilharFamilia(novo)
    localStorage.setItem('compartilharFamilia', String(novo))
  }

  const treinosFinalizados = sessions.filter((s) => s.finalizado).length
  const sequencia = calcularSequenciaSemanas(sessions)

  const medalhas = [
    ...MARCOS_SEQUENCIA.filter((m) => sequencia >= m).map((m) => `${m} semana${m > 1 ? 's' : ''} seguidas treinando`),
    ...MARCOS_TREINOS.filter((m) => treinosFinalizados >= m).map((m) => `${m} treinos concluídos`),
  ]

  async function compartilharResumo() {
    const diasComRegistro = Array.from(new Set(meals.map((m) => m.data))).sort().slice(-7)
    const mediaProteina =
      diasComRegistro.length > 0
        ? Math.round(
            diasComRegistro.reduce((soma, dia) => {
              const mealsDoDia = meals.filter((m) => m.data === dia)
              return soma + calcularTotaisDoDia(mealsDoDia, foods).proteina
            }, 0) / diasComRegistro.length,
          )
        : 0

    const texto = `Resumo da semana de ${perfil?.nome ?? ''}:\n- Treinos concluídos: ${treinosFinalizados}\n- Semanas seguidas treinando: ${sequencia}\n- Proteína média: ${mediaProteina}g/dia\n\nEnviado pelo app de treino.`

    if (navigator.share) {
      try {
        await navigator.share({ text: texto })
        return
      } catch {
        // usuário cancelou ou share falhou, cai para o clipboard
      }
    }
    await navigator.clipboard.writeText(texto)
    setMensagemCopiada(true)
    setTimeout(() => setMensagemCopiada(false), 2500)
  }

  if (editando || !perfil) {
    return <FormularioPerfil perfilAtual={perfil} onSalvar={salvarPerfil} />
  }

  const perfilCorporal = obterPerfilCorporal(perfil.perfilCorporalId)
  const imc = calcularIMC(perfil.pesoKg, perfil.alturaCm)

  return (
    <div className="p-4 pb-24 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Perfil</h1>

      <Card>
        <h2 className="text-lg font-semibold mb-2">{perfil.nome}</h2>
        <p className="text-slate-600 dark:text-slate-300">
          {perfil.idade} anos · {perfil.pesoKg}kg · {perfil.alturaCm}cm
        </p>
        <p className="text-slate-600 dark:text-slate-300 mt-1">
          Objetivo: {obterObjetivo(perfil.objetivoId).emoji} {obterObjetivo(perfil.objetivoId).nome}
        </p>
        <p className="text-slate-600 dark:text-slate-300 mt-1">
          Perfil corporal: {perfilCorporal.emoji} {perfilCorporal.nome} (IMC {imc.toFixed(1)})
        </p>
        {perfil.pressaoAlta && (
          <p className="text-amber-700 dark:text-amber-400 mt-1">⚠️ Pressão alta registrada</p>
        )}
        {perfil.outrasLimitacoes && (
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            Limitações: {perfil.outrasLimitacoes}
          </p>
        )}
        <p className="text-slate-600 dark:text-slate-300 mt-1">
          Meta de proteína: {perfil.metaProteinaGKg}g/kg (
          {calcularMetaProteina(perfil.pesoKg, perfil.metaProteinaGKg)}g/dia)
        </p>
        <BigButton variant="secondary" className="w-full mt-3" onClick={() => setEditando(true)}>
          Editar perfil
        </BigButton>
      </Card>

      <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900">
        <p className="text-amber-900 dark:text-amber-200 font-semibold mb-1">
          ⚠️ Aviso importante
        </p>
        <p className="text-amber-800 dark:text-amber-300 text-sm">
          Este app não substitui orientação médica nem de profissional de educação física. Consulte
          o médico antes de iniciar ou mudar a rotina de exercícios, principalmente por causa da
          idade e da pressão alta. Durante o esforço, expire — nunca prenda a respiração.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-2">
          {perfilCorporal.emoji} Dicas de alimentação pro seu perfil
        </h2>
        <ul className="flex flex-col gap-1.5 text-slate-600 dark:text-slate-300 text-sm">
          {perfilCorporal.dicasAlimentares.map((dica) => (
            <li key={dica}>• {dica}</li>
          ))}
        </ul>
      </Card>

      {medalhas.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold mb-2">🏅 Medalhas</h2>
          <ul className="flex flex-col gap-1 text-slate-600 dark:text-slate-300">
            {medalhas.map((m) => (
              <li key={m}>🏅 {m}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-semibold mb-2">👨‍👩‍👦 Modo família</h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
          Nesta primeira versão, o compartilhamento é simples: você gera um resumo semanal e envia
          para a família por WhatsApp, mensagem ou e-mail. Sincronização automática entre celulares
          fica para uma próxima versão.
        </p>
        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={compartilharFamilia}
            onChange={alternarCompartilhamento}
            className="w-6 h-6"
          />
          <span>Quero compartilhar meu resumo com a família</span>
        </label>
        {compartilharFamilia && (
          <BigButton variant="secondary" className="w-full" onClick={compartilharResumo}>
            {mensagemCopiada ? (
              'Copiado! Cole no WhatsApp'
            ) : (
              <>
                <Share2 className="w-5 h-5" /> Compartilhar resumo da semana
              </>
            )}
          </BigButton>
        )}
      </Card>
    </div>
  )
}

function FormularioPerfil({
  perfilAtual,
  onSalvar,
}: {
  perfilAtual?: Profile
  onSalvar: (p: Profile) => void
}) {
  const [nome, setNome] = useState(perfilAtual?.nome ?? '')
  const [idade, setIdade] = useState(String(perfilAtual?.idade ?? 70))
  const [pesoKg, setPesoKg] = useState(String(perfilAtual?.pesoKg ?? 70))
  const [alturaCm, setAlturaCm] = useState(String(perfilAtual?.alturaCm ?? 170))
  const [pressaoAlta, setPressaoAlta] = useState(perfilAtual?.pressaoAlta ?? true)
  const [outrasLimitacoes, setOutrasLimitacoes] = useState(perfilAtual?.outrasLimitacoes ?? '')
  const [objetivoId, setObjetivoId] = useState(perfilAtual?.objetivoId ?? 'ganhar_massa')
  const [ajustarPerfilManualmente, setAjustarPerfilManualmente] = useState(false)
  const [perfilCorporalManual, setPerfilCorporalManual] = useState(perfilAtual?.perfilCorporalId ?? null)
  const [metaProteinaGKg, setMetaProteinaGKg] = useState(perfilAtual?.metaProteinaGKg ?? 1.4)
  const [metaCaloriasKcal, setMetaCaloriasKcal] = useState(
    String(perfilAtual?.metaCaloriasKcal ?? 2200),
  )

  const imcAtual = calcularIMC(parseFloat(pesoKg) || 70, parseFloat(alturaCm) || 170)
  const perfilSugerido = classificarIMC(imcAtual)
  const perfilCorporalId = perfilCorporalManual ?? perfilSugerido

  useEffect(() => {
    const objetivo = obterObjetivo(objetivoId)
    const perfilCorporal = obterPerfilCorporal(perfilCorporalId)
    setMetaProteinaGKg(Math.round((objetivo.metaProteinaGKg + perfilCorporal.ajusteProteinaGKg) * 10) / 10)
    setMetaCaloriasKcal(String(calcularMetaCaloriasSugerida(parseFloat(pesoKg) || 70, objetivo)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objetivoId, perfilCorporalId, pesoKg])

  function handleSalvar() {
    onSalvar({
      nome: nome || 'Sem nome',
      idade: parseInt(idade, 10) || 70,
      pesoKg: parseFloat(pesoKg) || 70,
      alturaCm: parseFloat(alturaCm) || 170,
      pressaoAlta,
      outrasLimitacoes,
      objetivoId,
      perfilCorporalId,
      metaProteinaGKg,
      metaCaloriasKcal: parseFloat(metaCaloriasKcal) || 2200,
      aceitouAvisoMedico: true,
      criadoEm: perfilAtual?.criadoEm ?? new Date().toISOString(),
    })
  }

  return (
    <div className="p-4 pb-24 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{perfilAtual ? 'Editar perfil' : 'Vamos começar'}</h1>

      <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900">
        <p className="text-amber-800 dark:text-amber-300 text-sm">
          Este app não substitui orientação médica. Converse com o médico antes de iniciar ou
          mudar a rotina de exercícios.
        </p>
      </Card>

      <Card className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-medium">Nome</span>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3"
          />
        </label>
        <div className="grid grid-cols-3 gap-2">
          <label className="flex flex-col gap-1">
            <span className="font-medium text-sm">Idade</span>
            <input
              type="number"
              value={idade}
              onChange={(e) => setIdade(e.target.value)}
              className="min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-medium text-sm">Peso (kg)</span>
            <input
              type="number"
              value={pesoKg}
              onChange={(e) => setPesoKg(e.target.value)}
              className="min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-medium text-sm">Altura (cm)</span>
            <input
              type="number"
              value={alturaCm}
              onChange={(e) => setAlturaCm(e.target.value)}
              className="min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2"
            />
          </label>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={pressaoAlta}
            onChange={(e) => setPressaoAlta(e.target.checked)}
            className="w-6 h-6"
          />
          <span>Tem pressão alta</span>
        </label>

        <div>
          <span className="font-medium block mb-2">Objetivo principal</span>
          <div className="flex flex-col gap-2">
            {OBJETIVOS.map((obj: GoalDefinition) => (
              <button
                key={obj.id}
                type="button"
                onClick={() => setObjetivoId(obj.id)}
                className={`text-left rounded-xl border-2 p-3 transition-colors ${
                  objetivoId === obj.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                    : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700'
                }`}
              >
                <span className="font-semibold">
                  {obj.emoji} {obj.nome}
                </span>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{obj.descricao}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Com esse peso e altura (IMC {imcAtual.toFixed(1)}), o treino e a dieta sugeridos são pro perfil:
          </p>
          <p className="font-semibold mt-1">
            {obterPerfilCorporal(perfilCorporalId).emoji} {obterPerfilCorporal(perfilCorporalId).nome}
          </p>
          <button
            type="button"
            onClick={() => setAjustarPerfilManualmente((v) => !v)}
            className="text-sm text-blue-700 dark:text-blue-300 font-medium mt-2"
          >
            {ajustarPerfilManualmente ? 'Usar cálculo automático' : 'Ajustar manualmente'}
          </button>

          {ajustarPerfilManualmente && (
            <div className="flex flex-col gap-2 mt-3">
              {PERFIS_CORPORAIS.map((p: PerfilCorporalDefinition) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPerfilCorporalManual(p.id)}
                  className={`text-left rounded-xl border-2 p-3 transition-colors ${
                    perfilCorporalId === p.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                      : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700'
                  }`}
                >
                  <span className="font-semibold">
                    {p.emoji} {p.nome}
                    {perfilSugerido === p.id ? ' (sugerido pelo IMC)' : ''}
                  </span>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{p.descricao}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <label className="flex flex-col gap-1">
          <span className="font-medium">Outras limitações (coluna, joelho, etc.)</span>
          <input
            value={outrasLimitacoes}
            onChange={(e) => setOutrasLimitacoes(e.target.value)}
            className="min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium">Meta de proteína (g por kg de peso): {metaProteinaGKg}</span>
          <input
            type="range"
            min={1.2}
            max={2.0}
            step={0.1}
            value={metaProteinaGKg}
            onChange={(e) => setMetaProteinaGKg(parseFloat(e.target.value))}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium">Meta de calorias por dia</span>
          <input
            type="number"
            value={metaCaloriasKcal}
            onChange={(e) => setMetaCaloriasKcal(e.target.value)}
            className="min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3"
          />
        </label>

        <BigButton className="w-full" onClick={handleSalvar} disabled={!nome}>
          Salvar e continuar
        </BigButton>
      </Card>
    </div>
  )
}

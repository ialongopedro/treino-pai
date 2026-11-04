import type { Exercise } from '../types'

type Linha = [number, number, number, number]

interface Extra {
  tipo: 'rect' | 'tracejada'
  x: number
  y: number
  w?: number
  h?: number
  x2?: number
  y2?: number
}

interface Pose {
  label: string
  cabeca: [number, number]
  linhas: Linha[]
  extras?: Extra[]
}

export const POSES: Record<string, Pose> = {
  agachamento_banco: {
    label: 'Agachamento (livre ou no banco)',
    cabeca: [60, 20],
    linhas: [
      [60, 28, 58, 55],
      [60, 28, 85, 40],
      [58, 55, 42, 75],
      [42, 75, 48, 100],
      [58, 55, 72, 75],
      [72, 75, 78, 100],
    ],
    extras: [{ tipo: 'rect', x: 30, y: 70, w: 30, h: 8 }],
  },
  agachamento_cadeira: {
    label: 'Agachamento na cadeira com apoio',
    cabeca: [60, 20],
    linhas: [
      [60, 28, 58, 55],
      [60, 28, 38, 50],
      [60, 28, 80, 50],
      [58, 55, 42, 75],
      [42, 75, 48, 100],
      [58, 55, 72, 75],
      [72, 75, 78, 100],
    ],
    extras: [
      { tipo: 'rect', x: 25, y: 68, w: 50, h: 6 },
      { tipo: 'tracejada', x: 28, y: 20, x2: 28, y2: 68 },
    ],
  },
  terra_romeno: {
    label: 'Levantamento terra romeno / extensão de quadril com peso',
    cabeca: [75, 25],
    linhas: [
      [72, 32, 50, 55],
      [72, 32, 65, 65],
      [50, 55, 48, 80],
      [48, 80, 50, 100],
      [50, 55, 58, 80],
      [58, 80, 60, 100],
    ],
    extras: [{ tipo: 'rect', x: 61, y: 61, w: 8, h: 8 }],
  },
  extensao_quadril_apoiada: {
    label: 'Extensão de quadril apoiada (elevação pélvica deitado)',
    cabeca: [20, 80],
    linhas: [
      [28, 85, 55, 85],
      [55, 85, 72, 65],
      [72, 65, 92, 78],
      [28, 85, 15, 95],
    ],
    extras: [{ tipo: 'tracejada', x: 10, y: 95, x2: 100, y2: 95 }],
  },
  elevacao_pelvica_apoiada: {
    label: 'Elevação pélvica apoiada',
    cabeca: [20, 80],
    linhas: [
      [28, 85, 55, 85],
      [55, 85, 72, 65],
      [72, 65, 92, 78],
      [28, 85, 15, 95],
    ],
    extras: [{ tipo: 'tracejada', x: 10, y: 95, x2: 100, y2: 95 }],
  },
  remada: {
    label: 'Remada / puxada',
    cabeca: [55, 20],
    linhas: [
      [55, 28, 55, 60],
      [55, 28, 78, 38],
      [78, 38, 60, 42],
      [55, 60, 48, 80],
      [48, 80, 48, 100],
      [55, 60, 62, 80],
      [62, 80, 62, 100],
    ],
    extras: [{ tipo: 'tracejada', x: 60, y: 42, x2: 100, y2: 38 }],
  },
  remada_sentada: {
    label: 'Remada sentada (polia ou elástico)',
    cabeca: [45, 20],
    linhas: [
      [45, 28, 45, 55],
      [45, 55, 65, 58],
      [65, 58, 65, 100],
      [45, 28, 65, 35],
      [65, 35, 50, 40],
    ],
    extras: [
      { tipo: 'rect', x: 30, y: 56, w: 45, h: 6 },
      { tipo: 'tracejada', x: 50, y: 40, x2: 95, y2: 40 },
    ],
  },
  supino_flexao_inclinada: {
    label: 'Supino / flexão de braço inclinada',
    cabeca: [25, 55],
    linhas: [
      [32, 58, 65, 75],
      [65, 75, 100, 88],
      [32, 58, 30, 75],
    ],
    extras: [
      { tipo: 'rect', x: 15, y: 75, w: 25, h: 6 },
      { tipo: 'tracejada', x: 10, y: 95, x2: 110, y2: 95 },
    ],
  },
  flexao_parede: {
    label: 'Flexão de braço na parede',
    cabeca: [75, 25],
    linhas: [
      [70, 32, 55, 62],
      [70, 32, 95, 35],
      [55, 62, 53, 82],
      [53, 82, 55, 100],
      [55, 62, 60, 82],
      [60, 82, 62, 100],
    ],
    extras: [{ tipo: 'tracejada', x: 97, y: 10, x2: 97, y2: 100 }],
  },
  elevacao_pelvica_prancha: {
    label: 'Elevação pélvica + prancha',
    cabeca: [20, 60],
    linhas: [
      [28, 62, 55, 62],
      [55, 62, 95, 66],
      [28, 62, 25, 80],
    ],
    extras: [{ tipo: 'tracejada', x: 10, y: 85, x2: 100, y2: 85 }],
  },
  afundo: {
    label: 'Afundo alternado (passada)',
    cabeca: [55, 20],
    linhas: [
      [55, 28, 55, 55],
      [55, 28, 45, 45],
      [55, 28, 65, 45],
      [55, 55, 40, 75],
      [40, 75, 38, 100],
      [55, 55, 70, 70],
      [70, 70, 80, 100],
    ],
  },
  marcha_estacionaria: {
    label: 'Marcha estacionária apoiada',
    cabeca: [50, 20],
    linhas: [
      [50, 28, 50, 55],
      [50, 28, 85, 45],
      [50, 55, 48, 78],
      [48, 78, 50, 100],
      [50, 55, 65, 60],
      [65, 60, 68, 75],
    ],
    extras: [{ tipo: 'tracejada', x: 88, y: 20, x2: 88, y2: 70 }],
  },
  prancha_joelhos_elevacao: {
    label: 'Prancha com elevação de joelhos',
    cabeca: [20, 60],
    linhas: [
      [28, 62, 58, 65],
      [58, 65, 95, 68],
      [58, 65, 70, 55],
      [70, 55, 80, 60],
      [28, 62, 25, 82],
    ],
    extras: [{ tipo: 'tracejada', x: 10, y: 85, x2: 100, y2: 85 }],
  },
  prancha_joelhos_apoiada: {
    label: 'Prancha apoiada nos joelhos',
    cabeca: [30, 55],
    linhas: [
      [36, 58, 60, 62],
      [60, 62, 80, 78],
      [80, 78, 75, 85],
      [36, 58, 33, 80],
    ],
    extras: [{ tipo: 'tracejada', x: 10, y: 85, x2: 100, y2: 85 }],
  },
  panturrilha_pe: {
    label: 'Elevação de panturrilha em pé',
    cabeca: [55, 18],
    linhas: [
      [55, 26, 55, 55],
      [55, 26, 80, 35],
      [55, 55, 50, 85],
      [50, 85, 55, 95],
      [55, 55, 62, 85],
      [62, 85, 67, 95],
    ],
    extras: [{ tipo: 'tracejada', x: 85, y: 10, x2: 85, y2: 60 }],
  },
  panturrilha_sentado: {
    label: 'Elevação de panturrilha sentado',
    cabeca: [45, 20],
    linhas: [
      [45, 28, 45, 55],
      [45, 55, 65, 58],
      [65, 58, 68, 90],
      [45, 28, 55, 50],
    ],
    extras: [{ tipo: 'rect', x: 30, y: 56, w: 45, h: 6 }],
  },
  sentar_levantar: {
    label: 'Sentar e levantar da cadeira',
    cabeca: [50, 25],
    linhas: [
      [52, 33, 48, 58],
      [52, 33, 75, 45],
      [48, 58, 55, 78],
      [55, 78, 58, 100],
    ],
    extras: [
      { tipo: 'rect', x: 20, y: 65, w: 35, h: 6 },
      { tipo: 'tracejada', x: 20, y: 20, x2: 20, y2: 65 },
    ],
  },
  equilibrio_uma_perna: {
    label: 'Equilíbrio em uma perna (com apoio)',
    cabeca: [55, 18],
    linhas: [
      [55, 26, 55, 52],
      [55, 26, 85, 35],
      [55, 52, 53, 78],
      [53, 78, 55, 100],
      [55, 52, 70, 60],
      [70, 60, 68, 52],
    ],
    extras: [{ tipo: 'tracejada', x: 90, y: 10, x2: 90, y2: 60 }],
  },
  subir_degrau: {
    label: 'Subir degrau (step-up)',
    cabeca: [55, 18],
    linhas: [
      [55, 26, 52, 50],
      [55, 26, 75, 35],
      [52, 50, 65, 55],
      [65, 55, 68, 70],
      [52, 50, 45, 75],
      [45, 75, 48, 100],
    ],
    extras: [{ tipo: 'rect', x: 55, y: 70, w: 30, h: 30 }],
  },
  mobilidade_quadril: {
    label: 'Mobilidade de quadril e alongamento leve',
    cabeca: [55, 20],
    linhas: [
      [55, 28, 55, 55],
      [55, 28, 40, 40],
      [55, 28, 70, 38],
      [55, 55, 53, 80],
      [53, 80, 55, 100],
      [55, 55, 68, 65],
      [68, 65, 70, 80],
    ],
  },
}

export const FALLBACK_POR_GRUPO: Record<Exercise['grupo'], string> = {
  perna: 'agachamento_banco',
  quadril: 'panturrilha_pe',
  lombar: 'terra_romeno',
  puxar: 'remada',
  empurrar: 'supino_flexao_inclinada',
  core: 'prancha_joelhos_elevacao',
}

export function ExerciseIllustration({
  poseId,
  grupo,
  className,
}: {
  poseId?: string
  grupo: Exercise['grupo']
  className?: string
}) {
  const pose = (poseId && POSES[poseId]) || POSES[FALLBACK_POR_GRUPO[grupo]]

  return (
    <svg viewBox="0 0 120 110" className={className} aria-hidden="true">
      {pose.extras?.map((extra, indice) =>
        extra.tipo === 'rect' ? (
          <rect
            key={indice}
            x={extra.x}
            y={extra.y}
            width={extra.w}
            height={extra.h}
            rx={2}
            className="fill-none stroke-slate-300 dark:stroke-slate-500"
            strokeWidth={2}
            strokeDasharray="4 3"
          />
        ) : (
          <line
            key={indice}
            x1={extra.x}
            y1={extra.y}
            x2={extra.x2}
            y2={extra.y2}
            className="stroke-slate-300 dark:stroke-slate-500"
            strokeWidth={2}
            strokeDasharray="4 3"
          />
        ),
      )}
      {pose.linhas.map((linha, indice) => (
        <line
          key={indice}
          x1={linha[0]}
          y1={linha[1]}
          x2={linha[2]}
          y2={linha[3]}
          stroke="currentColor"
          strokeWidth={5}
          strokeLinecap="round"
        />
      ))}
      <circle cx={pose.cabeca[0]} cy={pose.cabeca[1]} r={9} fill="currentColor" />
    </svg>
  )
}

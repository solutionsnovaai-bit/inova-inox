import { useId } from 'react'
import { motion, useTransform, type MotionValue } from 'motion/react'

/*
  Visor de linha tubular (viewBox 0 0 240 440), a peça que a própria Inova vende:
  tubo de borossilicato dentro de uma gaiola de inox, com férulas Tri-Clamp.
  Em cima, o tampão preso pela abraçadeira pode tremer, girar e subir; o líquido ondula dentro do vidro.
  Usado na abertura (desenhado a traço) e na cena dos serviços.
*/
export const VISOR = {
  w: 240,
  h: 440,
  tampao: 'M88 56H152C157 56 160 59 160 64V88H80V64C80 59 83 56 88 56Z',
  abracadeira: 'M62 70H178C184 70 188 74 188 80V94C188 100 184 104 178 104H62C56 104 52 100 52 94V80C52 74 56 70 62 70Z',
  borboleta: 'M188 80H198V94H188ZM198 66L210 60V114L198 108Z',
  dobradica: 'M44 80H52V94H44Z',
  flange: 'M74 88H166V102H74Z',
  pescoco: 'M88 102H152V140H88Z',
  vidro: 'M92 140H148V384H92Z',
  postes: 'M82 140H94V384H82ZM146 140H158V384H146Z',
  aneis: 'M80 200H160V208H80ZM80 262H160V270H80ZM80 324H160V332H80Z',
  base: 'M88 384H152V404H88ZM74 404H166V420H74Z',
  saida: 'M100 420H140V440H100Z',
  /** Altura útil do líquido (topo do vidro até o fundo). */
  topo: 146,
  fundo: 384,
  /** Centro do vidro (fração do viewBox): de onde a cor se espalha na abertura. */
  centro: { x: 120 / 240, y: 262 / 440 },
} as const

/** Contornos desenhados a traço na abertura. */
export const TRACOS_VISOR = [VISOR.abracadeira, VISOR.borboleta, VISOR.tampao, VISOR.flange, VISOR.pescoco, VISOR.vidro, VISOR.postes, VISOR.aneis, VISOR.base, VISOR.saida]

export const ONDA = 'M-240 0Q-210 -9 -180 0T-120 0T-60 0T0 0T60 0T120 0T180 0T240 0T300 0T360 0T420 0T480 0V320H-240Z'

type Valor<T> = T | MotionValue<T>

type Props = {
  cor: Valor<string>
  /** 0 = vazio, 1 = cheio. */
  nivel?: Valor<number>
  tampaX?: MotionValue<number>
  tampaY?: MotionValue<number>
  tampaGiro?: MotionValue<number>
  /** 0 → 1: a gota sai de baixo do tampão e cai. */
  gota?: MotionValue<number>
  className?: string
}

export function Visor({ cor, nivel = 0.78, tampaX, tampaY, tampaGiro, gota, className = '' }: Props) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const fixo = typeof nivel === 'number'
  const nivelY = useTransform(() => {
    const n = fixo ? (nivel as number) : (nivel as MotionValue<number>).get()
    return VISOR.fundo - n * (VISOR.fundo - VISOR.topo)
  })
  const gotaX = useTransform(() => 120 + (tampaX?.get() ?? 0))
  const gotaY = useTransform(() => 92 + (tampaY?.get() ?? 0) + Math.pow(gota?.get() ?? 0, 1.6) * 780)
  const gotaOp = useTransform(() => { const g = gota?.get() ?? 0; return g > 0 && g < 0.98 ? 1 : 0 })
  const gotaEsc = useTransform(() => { const g = gota?.get() ?? 0; return g < 0.12 ? 0.35 + g * 5.4 : 1 + Math.min(g, 0.5) * 0.5 })

  return <svg className={`visor ${className}`} viewBox={`0 0 ${VISOR.w} ${VISOR.h}`} aria-hidden="true" focusable="false" overflow="visible">
    <defs>
      <clipPath id={`${id}c`}><path d={VISOR.vidro} /></clipPath>
      <linearGradient id={`${id}a`} x1="0" x2="1">
        <stop offset="0" stopColor="#5b636c" /><stop offset=".18" stopColor="#e9edf1" /><stop offset=".32" stopColor="#9aa3ad" />
        <stop offset=".55" stopColor="#d7dce1" /><stop offset=".8" stopColor="#6c7580" /><stop offset="1" stopColor="#3b424b" />
      </linearGradient>
      <linearGradient id={`${id}v`} x1="0" x2="1">
        <stop offset="0" stopColor="#fff" stopOpacity=".3" /><stop offset=".3" stopColor="#fff" stopOpacity=".06" />
        <stop offset=".7" stopColor="#fff" stopOpacity=".04" /><stop offset="1" stopColor="#fff" stopOpacity=".22" />
      </linearGradient>
      <radialGradient id={`${id}l`} cx=".3" cy=".2" r=".9">
        <stop offset="0" stopColor="#fff" stopOpacity=".32" /><stop offset=".45" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity=".3" />
      </radialGradient>
    </defs>

    <ellipse cx="120" cy="438" rx="96" ry="7" fill="#000" opacity=".3" />

    {/* líquido no vidro */}
    <g clipPath={`url(#${id}c)`}>
      <rect x="92" y="140" width="56" height="244" fill="rgb(255 255 255 / .04)" />
      <motion.g style={{ y: nivelY }}>
        <motion.path className="visor-onda anima" d={ONDA} style={{ fill: cor }} />
      </motion.g>
      <rect x="92" y="140" width="56" height="244" fill={`url(#${id}l)`} />
      <text x="120" y="262" textAnchor="middle" className="visor-gravacao" transform="rotate(-90 120 262)">INOVA INOX</text>
    </g>
    <path d={VISOR.vidro} fill={`url(#${id}v)`} className="visor-vidro" />
    <rect x="100" y="152" width="6" height="220" rx="3" className="visor-reflexo" />

    {/* gaiola e férulas */}
    <path d={VISOR.postes} fill={`url(#${id}a)`} />
    <path d={VISOR.aneis} fill={`url(#${id}a)`} opacity=".92" />
    <path d={VISOR.pescoco} fill={`url(#${id}a)`} />
    <path d={VISOR.flange} fill={`url(#${id}a)`} />
    <path d={VISOR.base} fill={`url(#${id}a)`} />
    <path d={VISOR.saida} fill={`url(#${id}a)`} opacity=".85" />
    <path d="M74 412H166" className="visor-risco" />

    {/* gota */}
    {gota && <motion.g style={{ x: gotaX, y: gotaY, opacity: gotaOp }}>
      <motion.path d="M0 -2C0 -2 -8 10 -8 16A8 8 0 0 0 8 16C8 10 0 -2 0 -2Z" style={{ fill: cor, scale: gotaEsc, originX: '0px', originY: '0px' }} />
    </motion.g>}

    {/* tampão + abraçadeira (sobem juntos) */}
    <motion.g style={{ x: tampaX, y: tampaY, rotate: tampaGiro, originX: '120px', originY: '88px' }}>
      <path d={VISOR.tampao} fill={`url(#${id}a)`} />
      <path d={VISOR.abracadeira} fill={`url(#${id}a)`} />
      <path d={VISOR.dobradica} fill={`url(#${id}a)`} />
      <path d={VISOR.borboleta} fill={`url(#${id}a)`} />
      <path d="M58 78H182M58 96H182" className="visor-risco" />
    </motion.g>
  </svg>
}

import type { SVGProps } from 'react'

type Props = SVGProps<SVGSVGElement>

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

/** Sacola de compras, usada nos botões que levam à loja. */
export const IconeSacola = (p: Props) => (
  <svg {...base} {...p}>
    <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </svg>
)

/** Balão de conversa com fone, usado nos botões de mensagem. */
export const IconeConversa = (p: Props) => (
  <svg {...base} strokeWidth={1.7} {...p}>
    <path d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.2A8.8 8.8 0 1 0 12 3.2Z" />
    <path d="M9.2 8.9c.2 3.1 2.8 5.7 5.9 5.9" strokeWidth={2.3} />
  </svg>
)

/** Seta diagonal: o link abre fora do site. */
export const IconeSair = (p: Props) => (
  <svg {...base} {...p}>
    <path d="M7 17 17 7" />
    <path d="M9 7h8v8" />
  </svg>
)

export const IconeMenu = (p: Props) => (
  <svg {...base} {...p}>
    <path d="M4 8h16M4 16h16" />
  </svg>
)

export const IconeFechar = (p: Props) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const IconeMais = (p: Props) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconeCheck = (p: Props) => (
  <svg {...base} strokeWidth={2.2} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)

/** Setas de arrastar para os lados, no controle do polimento. */
export const IconeArrastar = (p: Props) => (
  <svg {...base} strokeWidth={2.1} {...p}>
    <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
  </svg>
)

/** Losango chanfrado que separa as palavras da faixa. */
export const IconeLosango = (p: Props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 2 22 12 12 22 2 12Z" />
  </svg>
)

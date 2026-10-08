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

/** Fone de telefone, usado nos botões que ligam para o fixo. */
export const IconeTelefone = (p: Props) => (
  <svg {...base} strokeWidth={1.8} {...p}>
    <path d="M6.6 3.5h2.6l1.4 4.1-2 1.4a11.5 11.5 0 0 0 6.4 6.4l1.4-2 4.1 1.4v2.6a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" />
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

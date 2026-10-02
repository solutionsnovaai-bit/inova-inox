import type { Transition, Variants } from 'framer-motion'

/** Junta nomes de classe ignorando valores vazios. */
export const cn = (...partes: Array<string | false | null | undefined>) => partes.filter(Boolean).join(' ')

export const limitar = (valor: number, min: number, max: number) => Math.min(max, Math.max(min, valor))

export const interpolar = (de: number, para: number, t: number) => de + (para - de) * t

export const aleatorio = (min: number, max: number) => min + Math.random() * (max - min)

/** Curva padrão do site: sai rápido e assenta devagar, como metal pesado parando. */
export const EASE = [0.16, 1, 0.3, 1] as const
export const EASE_CORTE = [0.76, 0, 0.24, 1] as const

export const transicao = (duracao = 0.9, atraso = 0): Transition => ({
  duration: duracao,
  delay: atraso,
  ease: EASE,
})

/** Título que sobe por trás de uma máscara. Usado uma vez por seção. */
export const linhaTitulo: Variants = {
  oculto: { y: '108%' },
  visivel: (i: number = 0) => ({ y: '0%', transition: transicao(1, i * 0.08) }),
}

export const surgir: Variants = {
  oculto: { opacity: 0, y: 18 },
  visivel: (i: number = 0) => ({ opacity: 1, y: 0, transition: transicao(0.8, i * 0.07) }),
}

export const vistaUnica = { once: true, margin: '0px 0px -12% 0px' } as const

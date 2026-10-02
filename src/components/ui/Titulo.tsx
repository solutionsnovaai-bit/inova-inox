import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { linhaTitulo, vistaUnica, cn, surgir } from '../../lib/util'
import { useMovimentoReduzido } from '../../hooks/basicos'

type PropsTitulo = {
  linhas: readonly string[]
  nivel?: 'h1' | 'h2' | 'h3'
  className?: string
  id?: string
  /** Quando informado, o título só anima depois que virar verdadeiro. */
  quando?: boolean
  atraso?: number
}

/**
 * Título em linhas. Cada linha sobe de trás de uma máscara, uma única vez.
 * É o único movimento automático de cada seção.
 */
export function Titulo({ linhas, nivel = 'h2', className, id, quando, atraso = 0 }: PropsTitulo) {
  const reduzido = useMovimentoReduzido()
  const Tag = motion[nivel]

  return (
    <Tag
      id={id}
      className={cn('titulo', className)}
      initial={reduzido ? false : 'oculto'}
      {...(quando === undefined
        ? { whileInView: 'visivel', viewport: vistaUnica }
        : { animate: quando ? 'visivel' : 'oculto' })}
    >
      {linhas.map((linha, i) => (
        <span className="linha-mascara" key={linha}>
          <motion.span variants={linhaTitulo} custom={i + atraso}>
            {linha}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

type PropsSurgir = {
  children: ReactNode
  className?: string
  ordem?: number
}

/** Entrada discreta para o texto que acompanha um título. */
export function Surgir({ children, className, ordem = 0 }: PropsSurgir) {
  const reduzido = useMovimentoReduzido()
  return (
    <motion.div
      className={className}
      variants={surgir}
      custom={ordem}
      initial={reduzido ? false : 'oculto'}
      whileInView="visivel"
      viewport={vistaUnica}
    >
      {children}
    </motion.div>
  )
}

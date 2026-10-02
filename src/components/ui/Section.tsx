import type { ReactNode } from 'react'
import { cn } from '../../lib/util'

type Props = {
  id?: string
  /** Fundo da seção: preto, chapa escura ou inox escovado claro. */
  tom?: 'preto' | 'chapa' | 'claro'
  rotulo: string
  className?: string
  children: ReactNode
}

const tons = {
  preto: 'bg-preto text-aco',
  chapa: 'escovado-escuro text-aco',
  claro: 'escovado-claro',
} as const

export function Section({ id, tom = 'preto', rotulo, className, children }: Props) {
  return (
    <section id={id} aria-label={rotulo} className={cn('secao', tons[tom], className)}>
      <div className="conteudo">{children}</div>
    </section>
  )
}

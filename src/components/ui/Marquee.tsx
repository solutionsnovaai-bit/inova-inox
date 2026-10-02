import type { ReactNode } from 'react'
import { cn } from '../../lib/util'

type Props = {
  children: ReactNode
  /** Segundos para dar uma volta. */
  duracao?: number
  inverso?: boolean
  className?: string
}

/**
 * Faixa em movimento contínuo. O conteúdo é duplicado para emendar sem salto;
 * a cópia fica escondida de leitores de tela.
 */
export function Marquee({ children, duracao = 36, inverso, className }: Props) {
  return (
    <div className={cn('marquee', className)}>
      <div
        className="marquee-trilho"
        style={{ animationDuration: `${duracao}s`, animationDirection: inverso ? 'reverse' : 'normal' }}
      >
        <div className="marquee-grupo">{children}</div>
        <div className="marquee-grupo" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}

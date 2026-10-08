import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '../../lib/util'

type Props = {
  children: ReactNode
  /** Segundos para dar uma volta. */
  duracao?: number
  inverso?: boolean
  /**
   * Repete o conteúdo até o grupo ficar mais largo que a faixa,
   * para não abrir buraco em tela muito larga.
   */
  preencher?: boolean
  className?: string
}

/**
 * Faixa em movimento contínuo. O conteúdo é duplicado para emendar sem salto;
 * a cópia fica escondida de leitores de tela.
 */
export function Marquee({ children, duracao = 36, inverso, preencher, className }: Props) {
  const faixa = useRef<HTMLDivElement>(null)
  const grupo = useRef<HTMLDivElement>(null)
  const [vezes, setVezes] = useState(1)

  useLayoutEffect(() => {
    if (!preencher || !faixa.current || !grupo.current) return
    const medir = () => {
      const largura = faixa.current?.clientWidth ?? 0
      const conteudo = (grupo.current?.scrollWidth ?? 0) / vezes
      if (!largura || !conteudo) return
      const precisa = Math.max(1, Math.ceil(largura / conteudo))
      if (precisa !== vezes) setVezes(precisa)
    }
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(faixa.current)
    return () => ro.disconnect()
  }, [preencher, vezes])

  const repetido = Array.from({ length: vezes }, (_, i) => (
    <div key={i} className="marquee-bloco" aria-hidden={i > 0 || undefined}>
      {children}
    </div>
  ))
  const estilo = {
    '--duracao': `${duracao * vezes}s`,
    animationDuration: `${duracao * vezes}s`,
    '--direcao': inverso ? 'reverse' : 'normal',
    animationDirection: inverso ? 'reverse' : 'normal',
  } as CSSProperties

  return (
    <div ref={faixa} className={cn('marquee', className)}>
      <div className="marquee-trilho" style={estilo}>
        <div ref={grupo} className="marquee-grupo">
          {repetido}
        </div>
        <div className="marquee-grupo" aria-hidden="true">
          {repetido}
        </div>
      </div>
    </div>
  )
}

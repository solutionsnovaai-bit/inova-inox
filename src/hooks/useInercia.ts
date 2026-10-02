import { useEffect, type RefObject } from 'react'
import { limitar } from '../lib/util'

export type AjustesInercia = {
  /** O balão só aparece depois de rolar esta fração da altura da tela. */
  aparecerApos: number
  /** Atraso máximo, em px, que a rolagem consegue impor ao balão. */
  atrasoMaximo: number
  /**
   * Distância mínima, em px, que o balão mantém da borda de baixo da tela.
   * O CSS pode trocar esse valor com a variável --piso (no celular ela é
   * maior, para o balão não invadir a barra de compra).
   */
  pisoSeguro: number
}

export const INERCIA_PADRAO: AjustesInercia = {
  aparecerApos: 0.45,
  atrasoMaximo: 34,
  pisoSeguro: 14,
}

/**
 * Balão com inércia: a rolagem acumula velocidade, o balão atrasa,
 * gira, estica e volta com efeito de mola.
 *
 * Duas travas impedem que ele suma:
 *  1. o atraso nunca passa de `atrasoMaximo`;
 *  2. o deslocamento para baixo é cortado antes de o balão chegar a
 *     `pisoSeguro` px da borda da tela, qualquer que seja a velocidade.
 */
export function useInercia(ref: RefObject<HTMLElement | null>, ajustes: Partial<AjustesInercia> = {}) {
  const { aparecerApos, atrasoMaximo, pisoSeguro } = { ...INERCIA_PADRAO, ...ajustes }

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const mostrar = (visivel: boolean) => {
      el.dataset.visivel = visivel ? 'sim' : 'nao'
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      mostrar(true)
      el.style.transform = 'none'
      return
    }

    let ultimoY = window.scrollY
    let velocidade = 0
    let desvio = 0
    let giro = 0
    let quadro = 0
    let visivel = false
    let folga = 60

    /** Quanto o balão pode descer sem encostar no piso seguro. */
    const medirFolga = () => {
      const estilo = getComputedStyle(el)
      const base = parseFloat(estilo.bottom) || 0
      const piso = parseFloat(estilo.getPropertyValue('--piso')) || pisoSeguro
      folga = Math.max(0, base - piso)
    }

    const aoRolar = () => {
      const y = window.scrollY
      velocidade += y - ultimoY
      ultimoY = y
      const quer = y > window.innerHeight * aparecerApos
      if (quer !== visivel) {
        visivel = quer
        mostrar(quer)
      }
    }

    const girar = () => {
      velocidade *= 0.86
      const alvo = limitar(velocidade * 0.85, -atrasoMaximo, atrasoMaximo)
      desvio += (alvo - desvio) * 0.14
      giro += (desvio * 0.5 - giro) * 0.12

      const entrada = visivel ? 0 : 26
      const y = Math.min(entrada + desvio, folga)
      const aperto = 1 - Math.min(0.12, Math.abs(desvio) / 340)

      el.style.transform =
        `translate3d(0,${y.toFixed(2)}px,0) rotate(${giro.toFixed(2)}deg) ` +
        `scaleY(${(1 / aperto).toFixed(3)}) scaleX(${aperto.toFixed(3)})`
      quadro = requestAnimationFrame(girar)
    }

    medirFolga()
    aoRolar()
    quadro = requestAnimationFrame(girar)
    window.addEventListener('scroll', aoRolar, { passive: true })
    window.addEventListener('resize', medirFolga)

    return () => {
      cancelAnimationFrame(quadro)
      window.removeEventListener('scroll', aoRolar)
      window.removeEventListener('resize', medirFolga)
    }
  }, [ref, aparecerApos, atrasoMaximo, pisoSeguro])
}

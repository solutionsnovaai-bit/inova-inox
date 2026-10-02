import { useEffect } from 'react'
import type Lenis from 'lenis'
import { useMovimentoReduzido, PONTEIRO_FINO } from './basicos'

/**
 * Rolagem suave só no desktop com mouse. No celular a rolagem
 * nativa fica intacta, que é mais rápida e mais familiar.
 */
export function useSmoothScroll(ligado: boolean) {
  const reduzido = useMovimentoReduzido()

  useEffect(() => {
    const ponteiro = window.matchMedia(PONTEIRO_FINO)
    if (!ligado || reduzido || !ponteiro.matches) return

    let encerrado = false
    let lenis: Lenis | undefined
    let quadro = 0

    const girar = (tempo: number) => {
      lenis?.raf(tempo)
      quadro = requestAnimationFrame(girar)
    }

    const aoClicarAncora = (evento: MouseEvent) => {
      const link = (evento.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]')
      const alvo = link ? document.querySelector(link.getAttribute('href')!) : null
      if (!lenis || !link || !(alvo instanceof HTMLElement)) return
      evento.preventDefault()
      lenis.scrollTo(alvo, { offset: -72, duration: 1.1 })
      history.replaceState(null, '', link.getAttribute('href'))
    }

    void import('lenis')
      .then(({ default: Suave }) => {
        if (encerrado) return
        lenis = new Suave({ lerp: 0.1, smoothWheel: true, syncTouch: false })
        quadro = requestAnimationFrame(girar)
        document.addEventListener('click', aoClicarAncora)
      })
      .catch(() => {
        // Se o módulo não carregar, a rolagem nativa continua funcionando.
      })

    return () => {
      encerrado = true
      cancelAnimationFrame(quadro)
      document.removeEventListener('click', aoClicarAncora)
      lenis?.destroy()
    }
  }, [ligado, reduzido])
}

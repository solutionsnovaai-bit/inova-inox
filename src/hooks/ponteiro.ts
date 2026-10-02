import { useEffect, type RefObject } from 'react'
import { PONTEIRO_FINO } from './basicos'

/** O elemento acompanha de leve o ponteiro e volta ao lugar quando ele sai. */
export function useMagnetic(ref: RefObject<HTMLElement | null>, ativo = true, forca = 0.24) {
  useEffect(() => {
    const el = ref.current
    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!el || !ativo || semMovimento || !window.matchMedia(PONTEIRO_FINO).matches) return

    const mover = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) * forca
      const dy = (e.clientY - (r.top + r.height / 2)) * (forca + 0.08)
      el.style.setProperty('--ima-x', `${dx.toFixed(1)}px`)
      el.style.setProperty('--ima-y', `${dy.toFixed(1)}px`)
    }
    const soltar = () => {
      el.style.setProperty('--ima-x', '0px')
      el.style.setProperty('--ima-y', '0px')
    }

    el.addEventListener('pointermove', mover)
    el.addEventListener('pointerleave', soltar)
    return () => {
      el.removeEventListener('pointermove', mover)
      el.removeEventListener('pointerleave', soltar)
    }
  }, [ref, ativo, forca])
}

/**
 * Inclina o cartão na direção do ponteiro e grava a posição da luz
 * em variáveis CSS (--luz-x, --luz-y, --giro-x, --giro-y).
 */
export function useTilt(ref: RefObject<HTMLElement | null>, graus = 7) {
  useEffect(() => {
    const el = ref.current
    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!el || semMovimento || !window.matchMedia(PONTEIRO_FINO).matches) return

    let quadro = 0
    const mover = (e: PointerEvent) => {
      cancelAnimationFrame(quadro)
      quadro = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        el.style.setProperty('--luz-x', `${(px * 100).toFixed(1)}%`)
        el.style.setProperty('--luz-y', `${(py * 100).toFixed(1)}%`)
        el.style.setProperty('--giro-y', `${((px - 0.5) * graus * 2).toFixed(2)}deg`)
        el.style.setProperty('--giro-x', `${((0.5 - py) * graus * 2).toFixed(2)}deg`)
      })
    }
    const soltar = () => {
      cancelAnimationFrame(quadro)
      el.style.setProperty('--giro-x', '0deg')
      el.style.setProperty('--giro-y', '0deg')
    }

    el.addEventListener('pointermove', mover)
    el.addEventListener('pointerleave', soltar)
    return () => {
      cancelAnimationFrame(quadro)
      el.removeEventListener('pointermove', mover)
      el.removeEventListener('pointerleave', soltar)
    }
  }, [ref, graus])
}

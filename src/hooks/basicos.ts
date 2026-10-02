import { useReducedMotion } from 'framer-motion'
import { useEffect, useState, type RefObject } from 'react'

/** Verdadeiro quando o visitante pediu menos animação no sistema. */
export function useMovimentoReduzido() {
  return Boolean(useReducedMotion())
}

export function useMediaQuery(consulta: string) {
  const [bate, setBate] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(consulta).matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia(consulta)
    const aoMudar = () => setBate(mq.matches)
    aoMudar()
    mq.addEventListener('change', aoMudar)
    return () => mq.removeEventListener('change', aoMudar)
  }, [consulta])

  return bate
}

export const PONTEIRO_FINO = '(hover: hover) and (pointer: fine)'

/** Mesma condição que o CSS usa para o hero em duas colunas e a foto horizontal. */
export const TELA_LARGA = '(min-width: 1024px) and (orientation: landscape)'

/**
 * Diz se um trecho da página está na tela. Animações contínuas
 * (faíscas, carrossel) só rodam enquanto isso for verdadeiro.
 */
export function useSceneActivity(ref: RefObject<Element | null>, margem = '120px') {
  const [ativo, setAtivo] = useState(false)

  useEffect(() => {
    const alvo = ref.current
    if (!alvo || !('IntersectionObserver' in window)) {
      setAtivo(true)
      return
    }
    const io = new IntersectionObserver(([entrada]) => setAtivo(entrada.isIntersecting), {
      rootMargin: margem,
    })
    io.observe(alvo)
    return () => io.disconnect()
  }, [ref, margem])

  return ativo
}

/** Verdadeiro depois que a página rolou além de `limite` px. */
export function useRolou(limite = 24) {
  const [rolou, setRolou] = useState(false)

  useEffect(() => {
    const conferir = () => setRolou(window.scrollY > limite)
    conferir()
    window.addEventListener('scroll', conferir, { passive: true })
    return () => window.removeEventListener('scroll', conferir)
  }, [limite])

  return rolou
}

/** Impede a rolagem da página enquanto o loader ou o menu estão abertos. */
export function useTravaRolagem(travado: boolean) {
  useEffect(() => {
    if (!travado) return
    const anterior = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = anterior
    }
  }, [travado])
}

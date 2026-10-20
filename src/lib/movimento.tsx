import { createContext, useContext, useEffect, useState, type ReactNode, type RefObject } from 'react'
import { MotionConfig } from 'motion/react'
import type Lenis from 'lenis'

/* ---------- curvas ---------- */

/** Saídas longas, sem rebote. */
export const ease = {
  expo: [0.16, 1, 0.3, 1],
  quint: [0.83, 0, 0.17, 1],
  out: [0.22, 1, 0.36, 1],
  corte: [0.76, 0, 0.24, 1],
} as const

export const molas = {
  suave: { stiffness: 120, damping: 20, mass: 0.6 },
  ima: { stiffness: 180, damping: 14, mass: 0.4 },
  cursor: { stiffness: 500, damping: 40, mass: 0.5 },
} as const

export const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/* ---------- movimento reduzido (escolha da pessoa, salva no navegador) ---------- */

const CHAVE = 'inova-movimento-reduzido-v1'
const Contexto = createContext({ reduzido: false, alternar: () => {} })

/*
  Os efeitos rodam em qualquer aparelho, inclusive no PC com as animações do sistema desligadas.
  Quem prefere menos movimento usa o botão "Reduzir animações" do rodapé.
*/
export function MovimentoProvider({ children }: { children: ReactNode }) {
  const [reduzido, setReduzido] = useState(() => {
    try { return localStorage.getItem(CHAVE) === '1' } catch { return false }
  })
  useEffect(() => { document.documentElement.dataset.movimento = reduzido ? 'reduzido' : 'pleno' }, [reduzido])
  const alternar = () => setReduzido((atual) => {
    try { localStorage.setItem(CHAVE, atual ? '0' : '1') } catch { /* navegação privada */ }
    return !atual
  })
  return <Contexto.Provider value={{ reduzido, alternar }}>
    <MotionConfig reducedMotion={reduzido ? 'always' : 'never'}>{children}</MotionConfig>
  </Contexto.Provider>
}

export const useMovimento = () => useContext(Contexto)

/* ---------- mídia e visibilidade ---------- */

export function useMidia(consulta: string) {
  const [bate, setBate] = useState(() => typeof window !== 'undefined' && window.matchMedia(consulta).matches)
  useEffect(() => {
    const m = window.matchMedia(consulta)
    const atualiza = () => setBate(m.matches)
    atualiza()
    m.addEventListener('change', atualiza)
    return () => m.removeEventListener('change', atualiza)
  }, [consulta])
  return bate
}

/** Mouse de verdade (não toque). */
export const usePonteiroFino = () => useMidia('(hover: hover) and (pointer: fine)')

/** Animação contínua só roda com a cena na tela e a aba em primeiro plano. */
export function useCenaAtiva(ref: RefObject<HTMLElement | null>, limiar = 0.12) {
  const [ativa, setAtiva] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let naTela = false
    const atualiza = () => setAtiva(naTela && !document.hidden)
    const io = new IntersectionObserver(([e]) => { naTela = e.isIntersecting; atualiza() }, { threshold: limiar })
    io.observe(el)
    document.addEventListener('visibilitychange', atualiza)
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', atualiza) }
  }, [ref, limiar])
  return ativa
}

/* ---------- rolagem com inércia (desktop com mouse) ---------- */

let lenis: Lenis | undefined

/** Rola até uma âncora ou elemento: Lenis quando ativo, navegador nos demais casos. */
export function rolarPara(alvo: string | HTMLElement | number, reduzido = false, imediato = false) {
  if (typeof alvo === 'number') {
    if (lenis) lenis.scrollTo(alvo, imediato || reduzido ? { immediate: true, force: true } : { duration: 1.4, force: true })
    else window.scrollTo({ top: alvo, behavior: imediato || reduzido ? 'auto' : 'smooth' })
    return
  }
  const el = typeof alvo === 'string' ? document.querySelector<HTMLElement>(alvo) : alvo
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: -8, duration: reduzido ? 0 : 1.25 })
  else el.scrollIntoView({ behavior: reduzido ? 'auto' : 'smooth', block: 'start' })
}

export const pausarRolagem = (pausar: boolean) => { if (pausar) lenis?.stop(); else lenis?.start() }

export function useRolagem(ativo: boolean) {
  useEffect(() => {
    const fino = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!ativo || !fino.matches) return
    let descartado = false
    let quadro = 0
    const tick = (t: number) => { lenis?.raf(t); quadro = requestAnimationFrame(tick) }
    const visibilidade = () => {
      if (document.hidden) { cancelAnimationFrame(quadro); quadro = 0 }
      else if (!quadro) quadro = requestAnimationFrame(tick)
    }
    void import('lenis').then(({ default: Rolagem }) => {
      if (descartado) return
      lenis = new Rolagem({
        autoRaf: false,
        lerp: 0.09,
        smoothWheel: true,
        syncTouch: false,
        anchors: false,
        stopInertiaOnNavigate: true,
        prevent: (n) => n.closest('[data-lenis-prevent]') !== null,
      })
      quadro = requestAnimationFrame(tick)
      document.addEventListener('visibilitychange', visibilidade)
    }).catch(() => { /* sem inércia: rolagem nativa */ })
    return () => {
      descartado = true
      cancelAnimationFrame(quadro)
      lenis?.destroy()
      lenis = undefined
      document.removeEventListener('visibilitychange', visibilidade)
    }
  }, [ativo])
}

let travas = 0

/** Trava a rolagem da página (menu, sacola, foto grande). Várias travas ao mesmo tempo se somam. */
export function useTrava(travado: boolean) {
  useEffect(() => {
    if (!travado) return
    travas++
    document.body.classList.add('travado')
    pausarRolagem(true)
    return () => {
      travas = Math.max(0, travas - 1)
      if (travas === 0) { document.body.classList.remove('travado'); pausarRolagem(false) }
    }
  }, [travado])
}

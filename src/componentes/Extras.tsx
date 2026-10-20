import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useScroll, useSpring } from 'motion/react'
import { ShoppingBag } from 'lucide-react'
import { mensagens, waLink } from '../loja/config'
import { useSacola } from '../loja/sacola'
import { useRota } from '../loja/rotas'
import { ease, molas, useMovimento, usePonteiroFino } from '../lib/movimento'
import { BrandIcon } from './ui/Pecas'

/** Botões flutuantes: WhatsApp depois do começo da página e, com peça na sacola, o atalho da sacola. */
export function Flutuantes() {
  const { scrollY } = useScroll()
  const { total, abrir, aberta } = useSacola()
  const { caminho } = useRota()
  const [passou, setPassou] = useState(false)
  const [escondido, setEscondido] = useState(false)
  useMotionValueEvent(scrollY, 'change', (v) => setPassou(v > innerHeight * 0.6))

  useEffect(() => {
    const alvos = ['#orcamento', 'footer'].map((s) => document.querySelector(s)).filter(Boolean) as Element[]
    const vis = new Set<Element>()
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) vis.add(e.target); else vis.delete(e.target) })
      setEscondido(vis.size > 0)
    }, { threshold: 0.15 })
    alvos.forEach((a) => io.observe(a))
    return () => io.disconnect()
  }, [caminho])

  const mostrar = passou && !escondido && !aberta
  return <div className="flutuantes">
    <AnimatePresence>
      {mostrar && total > 0 && <motion.button key="sacola" type="button" className="flutuante flutuante-sacola" onClick={abrir}
        aria-label={`Abrir a sacola (${total})`}
        initial={{ scale: 0, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.6, ease: ease.expo }}>
        <ShoppingBag aria-hidden="true" /><b>{total}</b>
      </motion.button>}
      {mostrar && <motion.a key="zap" className="flutuante flutuante-zap" href={waLink(mensagens.geral)} target="_blank" rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        initial={{ scale: 0, opacity: 0, rotate: -40 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.7, ease: ease.expo }}>
        <span className="flutuante-onda anima" aria-hidden="true" />
        <BrandIcon />
        <span className="flutuante-rotulo">Pedir orçamento</span>
      </motion.a>}
    </AnimatePresence>
  </div>
}

const ROTULOS: Record<string, string> = { ver: 'Ver', arraste: 'Arraste', abrir: 'Abrir', ampliar: 'Ampliar' }

/** Cursor da casa: ponto azul + anel que cresce sobre links e vira "Ver", "Arraste" ou "Abrir". */
export function Cursor() {
  const fino = usePonteiroFino()
  const { reduzido } = useMovimento()
  const x = useMotionValue(-100), y = useMotionValue(-100)
  const ax = useSpring(x, molas.cursor), ay = useSpring(y, { stiffness: 260, damping: 30, mass: 0.6 })
  const [estado, setEstado] = useState('')
  const [oculto, setOculto] = useState(true)
  const atual = useRef('')

  useEffect(() => {
    if (!fino || reduzido) return
    document.documentElement.dataset.cursor = 'ativo'
    const mover = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x.set(e.clientX); y.set(e.clientY)
      setOculto(false)
      const alvo = e.target as Element | null
      const marcado = alvo?.closest?.('[data-cursor]')?.getAttribute('data-cursor')
      const novo = marcado ?? (alvo?.closest?.('a, button, label, input, select, textarea, [role="button"]') ? 'link' : '')
      if (novo !== atual.current) { atual.current = novo; setEstado(novo) }
    }
    const sair = () => setOculto(true)
    window.addEventListener('pointermove', mover, { passive: true })
    document.documentElement.addEventListener('pointerleave', sair)
    return () => {
      delete document.documentElement.dataset.cursor
      window.removeEventListener('pointermove', mover)
      document.documentElement.removeEventListener('pointerleave', sair)
    }
  }, [fino, reduzido, x, y])

  if (!fino || reduzido) return null
  return <div className="cursor" data-estado={estado} data-oculto={oculto ? 'sim' : 'nao'} aria-hidden="true">
    <motion.div className="cursor-ponto" style={{ x, y }} />
    <motion.div className="cursor-anel" style={{ x: ax, y: ay }}><span>{ROTULOS[estado] ?? ''}</span></motion.div>
  </div>
}

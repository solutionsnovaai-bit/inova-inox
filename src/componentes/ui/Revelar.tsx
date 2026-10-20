import { useRef, type ElementType, type PointerEvent, type ReactNode } from 'react'
import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from 'motion/react'
import { ease, useCenaAtiva, useMovimento } from '../../lib/movimento'

type RevelarProps = { children: ReactNode; delay?: number; y?: number; className?: string; as?: 'div' | 'p' | 'li' | 'span' }

/** Entrada suave (sobe e ganha nitidez) quando o bloco chega à tela. */
export function Revelar({ children, delay = 0, y = 26, className, as = 'div' }: RevelarProps) {
  const M = motion[as] as typeof motion.div
  return <M className={className}
    initial={{ opacity: 0, y, filter: 'blur(8px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 1.1, delay, ease: ease.expo }}>
    {children}
  </M>
}

type TituloProps = {
  linhas: readonly string[]
  destaque?: string
  id?: string
  className?: string
  as?: ElementType
  /** Controle manual (ex.: depois da abertura). Sem isso, entra ao aparecer na tela. */
  play?: boolean
  delay?: number
}

/** Título em linhas que sobem por trás de uma máscara. O destaque vem largo, fino e em itálico azul. */
export function Titulo({ linhas, destaque, id, className = 'titulo', as: Tag = 'h2', play, delay = 0 }: TituloProps) {
  const todas = destaque ? [...linhas, destaque] : [...linhas]
  const gatilho = play === undefined
    ? { whileInView: 'dentro', viewport: { once: true, amount: 0.5 } }
    : { animate: play ? 'dentro' : 'fora' }
  return <Tag id={id} className={className}>
    <span className="visualmente-oculto">{todas.join(' ')}</span>
    <motion.span aria-hidden="true" style={{ display: 'block' }} initial="fora" {...gatilho}
      transition={{ staggerChildren: 0.09, delayChildren: delay }}>
      {todas.map((linha, i) => <span key={i} className="mascara titulo-linha">
        <motion.span style={{ display: 'inline-block' }}
          variants={{ fora: { y: '110%', rotate: 2 }, dentro: { y: '0%', rotate: 0, transition: { duration: 1.2, ease: ease.expo } } }}>
          {destaque && i === todas.length - 1 ? <em>{linha}</em> : linha}
        </motion.span>
      </span>)}
    </motion.span>
  </Tag>
}

const COPIAS = 4
const envolver = (min: number, max: number, v: number) => { const r = max - min; return ((((v - min) % r) + r) % r) + min }

/** Faixa infinita que acelera e inverte o sentido conforme a rolagem. */
export function Faixa({ children, velocidade = -3, className = '' }: { children: ReactNode; velocidade?: number; className?: string }) {
  const { reduzido } = useMovimento()
  const ref = useRef<HTMLDivElement>(null)
  const ativa = useCenaAtiva(ref, 0)
  const base = useMotionValue(0)
  const { scrollY } = useScroll()
  const vel = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const fator = useTransform(vel, [0, 1000], [0, 4], { clamp: false })
  const inclina = useTransform(vel, [-2400, 0, 2400], [6, 0, -6])
  const x = useTransform(base, (v) => `${envolver(-100 / COPIAS, 0, v)}%`)
  const sentido = useRef(1)

  useAnimationFrame((_, delta) => {
    if (reduzido || !ativa) return
    let passo = sentido.current * velocidade * (Math.min(delta, 50) / 1000)
    const f = fator.get()
    if (f < 0) sentido.current = -1
    else if (f > 0) sentido.current = 1
    passo += sentido.current * passo * f
    base.set(base.get() + passo)
  })

  return <div ref={ref} className={`faixa ${className}`} aria-hidden="true">
    <motion.div className="faixa-trilho" style={reduzido ? undefined : { x, skewX: inclina }}>
      {Array.from({ length: COPIAS }, (_, i) => <span key={i} className="faixa-grupo">{children}</span>)}
    </motion.div>
  </div>
}

const ZOOM = 2.4

/** Lente redonda que acompanha o mouse e amplia a imagem (só com mouse). */
export function Lupa({ children, className = '', zoom = ZOOM }: { children: ReactNode; className?: string; zoom?: number }) {
  const caixa = useRef<HTMLDivElement>(null)
  const lente = useRef<HTMLSpanElement>(null)
  const esconder = () => { if (caixa.current) caixa.current.dataset.lupa = '' }
  const mover = (e: PointerEvent<HTMLDivElement>) => {
    const c = caixa.current, l = lente.current
    if (!c || !l || e.pointerType !== 'mouse' || e.buttons !== 0) { esconder(); return }
    const img = c.querySelector('img')
    if (!img || !img.complete || !img.naturalWidth) return
    const cr = c.getBoundingClientRect(), r = img.getBoundingClientRect()
    const nw = img.naturalWidth, nh = img.naturalHeight
    const contido = getComputedStyle(img).objectFit === 'contain'
    const escala = contido ? Math.min(r.width / nw, r.height / nh) : Math.max(r.width / nw, r.height / nh)
    const ox = (r.width - nw * escala) / 2, oy = (r.height - nh * escala) / 2
    const raio = l.offsetWidth / 2
    const px = e.clientX - r.left - ox, py = e.clientY - r.top - oy
    l.style.transform = `translate3d(${e.clientX - cr.left - raio}px, ${e.clientY - cr.top - raio}px, 0)`
    const src = `url("${img.currentSrc || img.src}")`
    if (l.dataset.src !== src) { l.style.backgroundImage = src; l.dataset.src = src }
    l.style.backgroundSize = `${nw * escala * zoom}px ${nh * escala * zoom}px`
    l.style.backgroundPosition = `${raio - px * zoom}px ${raio - py * zoom}px`
    c.dataset.lupa = 'ativa'
  }
  return <div ref={caixa} className={`lupa ${className}`} onPointerMove={mover} onPointerLeave={esconder} onPointerDown={esconder}>
    {children}<span ref={lente} className="lupa-lente" aria-hidden="true" />
  </div>
}

import { useEffect, useRef, type PointerEvent, type RefObject } from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { ArrowDown } from 'lucide-react'
import { CENAS, FOTOS, type Foto } from '../../lib/midia'
import { useEstoque } from '../../loja/estoque'
import { Link, linkCatalogo, linkLoja } from '../../loja/rotas'
import { ease, molas, rolarPara, useCenaAtiva, useMovimento } from '../../lib/movimento'
import { Titulo } from '../ui/Revelar'
import { Botao, Faisca, Selo, reflexo } from '../ui/Pecas'

const MINIS: { foto: Foto; classe: string; profundidade: number; giro: number }[] = [
  { foto: FOTOS['curva-tri-clamp'], classe: 'mini-a', profundidade: 34, giro: -8 },
  { foto: CENAS.torno, classe: 'mini-b', profundidade: -26, giro: 6 },
  { foto: FOTOS['te-sanitario'], classe: 'mini-c', profundidade: 18, giro: 10 },
]

function Mini({ foto, classe, profundidade, giro, mx, my, pronto, i }: (typeof MINIS)[number] & { mx: MotionValue<number>; my: MotionValue<number>; pronto: boolean; i: number }) {
  const x = useTransform(mx, (v) => v * profundidade)
  const y = useTransform(my, (v) => v * profundidade)
  return <motion.div className={`hero-mini ${classe}`} style={{ x, y }}
    initial={{ opacity: 0, scale: 0.6, rotate: giro * 2 }}
    animate={pronto ? { opacity: 1, scale: 1, rotate: giro } : undefined}
    transition={{ duration: 1.4, delay: 0.55 + i * 0.12, ease: ease.expo }}>
    <div className="chanfro aco-reflexo" onPointerMove={reflexo}><img src={foto.src} alt="" width={foto.w} height={foto.h} decoding="async" /></div>
  </motion.div>
}

type Brasa = { x: number; y: number; vx: number; vy: number; vida: number; total: number; r: number }

/** Brasas subindo devagar atrás da foto: o ar da oficina. Só roda com o topo na tela. */
function Brasas({ alvo }: { alvo: RefObject<HTMLElement | null> }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const ativa = useCenaAtiva(alvo, 0.05)
  const { reduzido } = useMovimento()
  useEffect(() => {
    const c = ref.current, ctx = c?.getContext('2d')
    if (!c || !ctx || !ativa || reduzido) return
    const dpr = Math.min(devicePixelRatio || 1, 2)
    let w = 0, h = 0, quadro = 0, ant = performance.now()
    const medir = () => { w = c.offsetWidth; h = c.offsetHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) }
    const brasas: Brasa[] = []
    const nova = (): Brasa => { const total = 240 + Math.random() * 260; return { x: w * (0.45 + Math.random() * 0.55), y: h + 10, vx: -0.15 - Math.random() * 0.35, vy: -0.4 - Math.random() * 0.9, vida: total, total, r: 0.6 + Math.random() * 1.6 } }
    const girar = (agora: number) => {
      const p = Math.min(2.5, (agora - ant) / 16.67); ant = agora
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      if (brasas.length < 46 && Math.random() < 0.35 * p) brasas.push(nova())
      for (let i = brasas.length - 1; i >= 0; i--) {
        const b = brasas[i]
        b.vx += Math.sin((agora / 900) + i) * 0.006 * p
        b.x += b.vx * p; b.y += b.vy * p; b.vida -= p
        if (b.vida <= 0 || b.y < -10) { brasas.splice(i, 1); continue }
        const v = b.vida / b.total, a = Math.min(1, v * 2) * Math.min(1, (b.total - b.vida) / 40)
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 5)
        g.addColorStop(0, `rgba(255,${Math.round(150 + 90 * v)},${Math.round(60 * v)},${(0.9 * a).toFixed(2)})`)
        g.addColorStop(1, 'rgba(255,120,20,0)')
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 5, 0, Math.PI * 2); ctx.fill()
      }
      quadro = requestAnimationFrame(girar)
    }
    medir(); quadro = requestAnimationFrame(girar)
    addEventListener('resize', medir)
    return () => { cancelAnimationFrame(quadro); removeEventListener('resize', medir) }
  }, [ativa, reduzido])
  return <canvas ref={ref} className="hero-brasas" aria-hidden="true" />
}

/** Começo do site: título à esquerda, a solda dentro de uma moldura chanfrada à direita. */
export function Hero({ pronto }: { pronto: boolean }) {
  const { reduzido } = useMovimento()
  const { produtos } = useEstoque()
  const secao = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: secao, offset: ['start start', 'end start'] })
  const yTexto = useTransform(scrollYProgress, [0, 1], ['0%', '-22%'])
  const yFoto = useTransform(scrollYProgress, [0, 1], ['0%', '12%'])
  const escalaFoto = useTransform(scrollYProgress, [0, 1], [1, 1.12])
  const mx = useSpring(useMotionValue(0), molas.suave)
  const my = useSpring(useMotionValue(0), molas.suave)
  const principal = CENAS.solda

  const mover = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse' || reduzido) return
    mx.set(e.clientX / innerWidth - 0.5)
    my.set(e.clientY / innerHeight - 0.5)
  }
  const chips = ['Inox 304 e 316', `${produtos.length} peças na loja`, 'Peças sob desenho']

  return <section id="inicio" ref={secao} className="hero escuro" onPointerMove={mover} aria-labelledby="hero-titulo">
    <div className="hero-brilho" aria-hidden="true" />
    <Brasas alvo={secao} />
    <div className="conteiner hero-grade">
      <motion.div className="hero-texto" style={reduzido ? undefined : { y: yTexto }}>
        <motion.p className="selo-texto" initial={{ opacity: 0, y: 12 }} animate={pronto ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1, delay: 0.1, ease: ease.expo }}>Loja Inova Inox · linha sanitária e industrial</motion.p>
        <Titulo id="hero-titulo" as="h1" className="titulo hero-titulo" linhas={['Inox', 'sanitário']} destaque="na sua medida." play={pronto} delay={0.15} />
        <motion.p className="lead hero-lead" initial={{ opacity: 0, y: 18 }} animate={pronto ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1.1, delay: 0.65, ease: ease.expo }}>
          Conexões Tri-Clamp, SMS, RJT, DIN, OD, BSP e NPT em inox 304 e 316. Escolha a peça, a medida e o aço, monte a sacola e feche o pedido pelo WhatsApp.
        </motion.p>
        <motion.div className="hero-acoes" initial={{ opacity: 0, y: 18 }} animate={pronto ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1.1, delay: 0.8, ease: ease.expo }}>
          <Botao href={linkLoja()} variante="azul">Entrar na loja</Botao>
          <Link className="link-seta" href={linkCatalogo()}>Folhear o catálogo técnico<ArrowDown aria-hidden="true" style={{ rotate: '-90deg' }} /></Link>
        </motion.div>
        <motion.ul className="hero-chips" aria-label="Destaques" initial="fora" animate={pronto ? 'dentro' : 'fora'}
          transition={{ staggerChildren: 0.07, delayChildren: 0.95 }}>
          {chips.map((c) => <motion.li key={c} variants={{ fora: { opacity: 0, y: 10 }, dentro: { opacity: 1, y: 0, transition: { duration: 0.9, ease: ease.expo } } }}>
            <Faisca />{c}
          </motion.li>)}
        </motion.ul>
      </motion.div>

      <div className="hero-visual">
        <motion.div className="hero-moldura" style={reduzido ? undefined : { y: yFoto }}
          initial={{ clipPath: 'inset(100% 0% 0% 0%)' }} animate={pronto ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined}
          transition={{ duration: 1.6, delay: 0.1, ease: ease.quint }}>
          <div className="chanfro aco-reflexo hero-foto" onPointerMove={reflexo} data-cursor="">
            <motion.img src={principal.src} alt={principal.alt} width={principal.w} height={principal.h} fetchPriority="high" decoding="async"
              style={reduzido ? undefined : { scale: escalaFoto }}
              initial={{ scale: 1.25 }} animate={pronto ? { scale: 1 } : undefined} transition={{ duration: 2.2, ease: ease.expo }} />
          </div>
          <p className="hero-legenda"><span>Usinagem · Solda · Polimento</span><em>Feito na bancada da Inova.</em></p>
        </motion.div>
        {MINIS.map((m, i) => <Mini key={m.classe} {...m} i={i} mx={mx} my={my} pronto={pronto} />)}
        <motion.div className="hero-selo-pos" initial={{ opacity: 0, scale: 0.5, rotate: -90 }} animate={pronto ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
          transition={{ duration: 1.4, delay: 0.9, ease: ease.expo }}>
          <Selo texto="INOX 304 · 316 · TRI-CLAMP · SMS · RJT · DIN · OD · " className="hero-selo" />
        </motion.div>
      </div>
    </div>
    <motion.a href="#linhas" className="hero-rolar" onClick={(e) => { e.preventDefault(); rolarPara('#linhas', reduzido) }}
      initial={{ opacity: 0 }} animate={pronto ? { opacity: 1 } : undefined} transition={{ delay: 1.4, duration: 1 }}>
      <span>Role</span><i aria-hidden="true" />
    </motion.a>
  </section>
}

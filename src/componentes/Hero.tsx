import { useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { logo } from '../lib/midia'

const FAIXA = ['Inox 304 e 316', 'Tri-Clamp', 'SMS', 'RJT', 'DIN', 'OD', 'BSP e NPT', 'Peças sob desenho', 'Usinagem', 'Polimento', 'Solda']

/** Pontos de luz azul subindo devagar atrás do logotipo (leve, pausa fora da tela). */
function Brasas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current
    const ctx = cv?.getContext('2d')
    if (!cv || !ctx || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const sorte = (a: number, b: number) => a + Math.random() * (b - a)
    let w = 0, h = 0, quadro = 0, visivel = true
    type Brasa = { x: number; y: number; r: number; v: number; o: number; fase: number }
    const nova = (y?: number): Brasa => ({ x: Math.random() * w, y: y ?? h + 12, r: sorte(0.6, 2), v: sorte(0.18, 0.6), o: sorte(0.3, 0.85), fase: Math.random() * 6.28 })
    const medir = () => {
      const r = cv.getBoundingClientRect()
      w = r.width; h = r.height
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    medir()
    const lista = Array.from({ length: innerWidth < 700 ? 16 : 30 }, () => nova(Math.random() * h))
    const girar = (agora: number) => {
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      for (const b of lista) {
        b.y -= b.v
        b.x += Math.sin(agora / 1400 + b.fase) * 0.22
        if (b.y < -12) Object.assign(b, nova())
        const a = b.o * Math.min(1, Math.max(0, b.y / h) * 1.6)
        const raio = b.r * 4.5
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, raio)
        g.addColorStop(0, `rgba(225,240,255,${a})`)
        g.addColorStop(0.3, `rgba(90,169,255,${a * 0.45})`)
        g.addColorStop(1, 'rgba(4,113,229,0)')
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(b.x, b.y, raio, 0, Math.PI * 2); ctx.fill()
      }
      quadro = visivel ? requestAnimationFrame(girar) : 0
    }
    const io = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting
      if (visivel && !quadro) quadro = requestAnimationFrame(girar)
    })
    io.observe(cv)
    addEventListener('resize', medir)
    quadro = requestAnimationFrame(girar)
    return () => { cancelAnimationFrame(quadro); io.disconnect(); removeEventListener('resize', medir) }
  }, [])
  return <canvas ref={ref} className="hero-brasas" aria-hidden="true" />
}

/** Hero: o logotipo da Inova como protagonista, com anéis de luz, reflexo metálico e leve paralaxe. */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !matchMedia('(pointer: fine)').matches) return
    const mover = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
    }
    el.addEventListener('pointermove', mover)
    return () => el.removeEventListener('pointermove', mover)
  }, [])

  return <header ref={ref} id="topo" className="hero">
    <div className="hero-luz" aria-hidden="true" />
    <Brasas />
    <div className="conteiner hero-dentro">
      <div className="hero-logo-par">
        <div className="hero-aneis" aria-hidden="true"><i /><i /><i /></div>
        <div className="hero-logo-caixa" data-alvo-logo>
          <img className="hero-logo" src={logo.completo} alt="Inova Inox: usinagem, polimento e solda" width={1074} height={588} fetchPriority="high" />
          <span className="hero-logo-reflexo" style={{ WebkitMaskImage: `url(${logo.completo})`, maskImage: `url(${logo.completo})` }} aria-hidden="true" />
        </div>
      </div>
      <p className="hero-linha">Conexões sanitárias e industriais em inox 304 e 316, direto da fábrica.</p>
      <div className="hero-acoes">
        <a href="#loja" className="botao botao-claro">Ver a loja <ArrowRight aria-hidden="true" /></a>
        <a href="#catalogo" className="botao botao-vidro">Catálogo técnico</a>
      </div>
    </div>
    <a href="#loja" className="hero-rolar" aria-label="Ir para a loja"><i /></a>
  </header>
}

/** Faixa de palavras correndo (CSS puro). */
export function Faixa() {
  const linha = [...FAIXA, ...FAIXA]
  return <div className="faixa" aria-hidden="true">
    <div className="faixa-trilho">
      {[0, 1].map((k) => <span key={k} className="faixa-grupo">
        {linha.map((p, i) => <span key={`${k}-${i}`} className="faixa-item">{p}<i>●</i></span>)}
      </span>)}
    </div>
  </div>
}

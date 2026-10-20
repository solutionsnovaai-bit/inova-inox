import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { animate, motion, stagger, type Variants } from 'motion/react'
import { CAMADAS, PROPORCAO_LOGO, carregar, logo, type CamadaLogo } from '../lib/midia'
import { Corte } from './ui/Pecas'
import { ONDA, TRACOS_VISOR, VISOR } from './ui/Visor'

/*
  Abertura "a linha de inox" (toda carga da página).
  1. No escuro, um traço desenha o visor de linha (a peça de vidro e inox).
  2. O líquido azul enche o vidro conforme o site carrega de verdade (é a barra de carregamento).
  3. Um reflexo passa pelo vidro e a cor transborda: a chapa escura cobre a tela a partir dele.
  4. Sobre a chapa, o arco de solda monta o logotipo peça por peça, com faíscas.
  5. A chapa sobe com a borda cortada em brasa e o logotipo voa até o topo do site.
  Na segunda carga da mesma sessão a abertura é curta; com movimento reduzido, é só um esmaecer.
*/

export type ModoAbertura = 'completa' | 'curta' | 'calma'

const VISTA = 'inova-abertura-vista'
export function modoAbertura(reduzido: boolean): ModoAbertura {
  if (reduzido) return 'calma'
  try { return sessionStorage.getItem(VISTA) === '1' ? 'curta' : 'completa' } catch { return 'completa' }
}

const espera = (s: number) => new Promise<void>((r) => window.setTimeout(r, s * 1000))
const LIQ_VAZIO = VISOR.fundo + 8
const LIQ_CHEIO = VISOR.topo - 4
const aleatorio = (min: number, max: number) => min + Math.random() * (max - min)

/* ---------- roteiro do arco de solda sobre o logotipo (posições em % da prancha) ---------- */

type Ponto = [number, number]
type Passe = { id: 'arco-superior' | 'arco-inferior' | 'inova' | 'inox' | 'assinatura'; inicio: number; fim: number; ponto: (u: number) => Ponto }
const reta = (a: Ponto, b: Ponto) => (u: number): Ponto => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]
const curva = (a: Ponto, b: Ponto, c: Ponto) => (u: number): Ponto => {
  const v = 1 - u
  return [v * v * a[0] + 2 * v * u * b[0] + u * u * c[0], v * v * a[1] + 2 * v * u * b[1] + u * u * c[1]]
}
const PASSES: Passe[] = [
  { id: 'arco-superior', inicio: 0.1, fim: 0.72, ponto: curva([25, 36], [52, -5], [80, 13]) },
  { id: 'arco-inferior', inicio: 0.26, fim: 0.78, ponto: curva([39, 54], [14, 84], [2, 58]) },
  { id: 'inova', inicio: 0.56, fim: 1.26, ponto: reta([5, 42], [99, 42]) },
  { id: 'inox', inicio: 1.2, fim: 1.72, ponto: reta([37, 75], [92, 75]) },
  { id: 'assinatura', inicio: 1.76, fim: 2.32, ponto: reta([0, 95.2], [100, 95.2]) },
]
const passe = (id: Passe['id']) => PASSES.find((p) => p.id === id)!
const IMPACTO = 2.42

const QUENTE = 'drop-shadow(0px 0px 16px rgba(255, 150, 40, 0.95))'
const FRIO = 'drop-shadow(0px 0px 0px rgba(255, 150, 40, 0))'
const ASSENTA = [0.16, 1, 0.3, 1] as const

/** Cada peça nasce no instante em que o arco passa por ela e esfria até o aço. */
function forja(c: CamadaLogo, k: number): { peca: Variants; esfria: { atraso: number; duracao: number } } {
  if (c.grupo === 'arco' || c.grupo === 'assinatura') {
    const p = passe(c.id as 'arco-superior' | 'arco-inferior' | 'assinatura')
    const daDireita = c.id === 'arco-inferior'
    return {
      peca: {
        oculto: { clipPath: daDireita ? 'inset(-60% 0% -60% 100%)' : 'inset(-60% 100% -60% 0%)', filter: QUENTE },
        visivel: {
          clipPath: 'inset(-60% 0% -60% 0%)', filter: FRIO,
          transition: {
            clipPath: { duration: (p.fim - p.inicio) * k, delay: p.inicio * k, ease: 'linear' },
            filter: { duration: 1.1 * k, delay: (p.inicio + 0.3) * k, ease: 'easeOut' },
          },
        },
      },
      esfria: { atraso: (p.inicio + 0.22) * k, duracao: 1 * k },
    }
  }
  const p = passe(c.grupo)
  const [x0] = p.ponto(0)
  const [x1] = p.ponto(1)
  const chegada = p.inicio + ((c.x + c.w / 2 - x0) / (x1 - x0)) * (p.fim - p.inicio) - 0.06
  return {
    peca: {
      oculto: { opacity: 0, scale: 1.16, y: '-8%', filter: QUENTE },
      visivel: {
        opacity: 1, scale: 1, y: '0%', filter: FRIO,
        transition: {
          opacity: { duration: 0.08 * k, delay: chegada * k },
          scale: { duration: 0.55 * k, delay: chegada * k, ease: ASSENTA },
          y: { duration: 0.55 * k, delay: chegada * k, ease: ASSENTA },
          filter: { duration: 1 * k, delay: (chegada + 0.15) * k, ease: 'easeOut' },
        },
      },
    },
    esfria: { atraso: (chegada + 0.1) * k, duracao: 0.9 * k },
  }
}

function LogoForja({ estado, ritmo }: { estado: 'oculto' | 'visivel'; ritmo: number }) {
  return <div className="logo-camadas" style={{ aspectRatio: PROPORCAO_LOGO }} role="img" aria-label="Inova Inox: usinagem, polimento e solda">
    {CAMADAS.map((c) => {
      const a = forja(c, ritmo)
      return <motion.div key={c.id} className={`logo-camada ${c.grupo === 'assinatura' ? 'is-assinatura' : ''}`}
        style={{ left: `${c.x}%`, top: `${c.y}%`, width: `${c.w}%`, height: `${c.h}%` }}
        variants={a.peca} initial="oculto" animate={estado}>
        <img src={c.src} alt="" draggable={false} decoding="async" />
        <motion.span className="logo-brasa" style={{ WebkitMaskImage: `url(${c.src})`, maskImage: `url(${c.src})` }}
          variants={{ oculto: { opacity: 1 }, visivel: { opacity: 0, transition: { duration: a.esfria.duracao, delay: a.esfria.atraso, ease: 'easeIn' } } }} />
      </motion.div>
    })}
  </div>
}

type Faisca = { x: number; y: number; vx: number; vy: number; vida: number; total: number; grossura: number; quicou: boolean }

/** Canvas do arco de solda: a luz percorre o logotipo, solta faíscas com gravidade e estoura no impacto. */
function Solda({ alvo, ligado, ritmo }: { alvo: RefObject<HTMLElement | null>; ligado: boolean; ritmo: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    const el = alvo.current
    if (!canvas || !ctx || !el || !ligado) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let largura = 0, altura = 0, caixa = el.getBoundingClientRect(), escala = 1
    const medir = () => {
      largura = innerWidth; altura = innerHeight
      canvas.width = Math.round(largura * dpr); canvas.height = Math.round(altura * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      caixa = el.getBoundingClientRect()
      escala = Math.max(0.6, caixa.width / 560)
    }
    const naTela = (px: number, py: number) => [caixa.left + (px / 100) * caixa.width, caixa.top + (py / 100) * caixa.height] as const
    const faiscas: Faisca[] = []
    const soltar = (x: number, y: number, n: number, forcaMax: number, leque = Math.PI) => {
      for (let i = 0; i < n && faiscas.length < 520; i++) {
        const ang = -Math.PI / 2 + aleatorio(-leque, leque)
        const f = aleatorio(1.5, forcaMax) * escala
        const total = aleatorio(26, 78)
        faiscas.push({ x, y, vx: Math.cos(ang) * f, vy: Math.sin(ang) * f, vida: total, total, grossura: aleatorio(0.8, 2.2) * Math.min(1.4, escala), quicou: false })
      }
    }
    const brilho = (x: number, y: number, raio: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, raio)
      g.addColorStop(0, 'rgba(255,255,255,1)')
      g.addColorStop(0.1, 'rgba(205,232,255,0.95)')
      g.addColorStop(0.34, 'rgba(79,163,255,0.42)')
      g.addColorStop(1, 'rgba(4,113,229,0)')
      ctx.fillStyle = g
      ctx.beginPath(); ctx.arc(x, y, raio, 0, Math.PI * 2); ctx.fill()
    }
    const inicio = performance.now()
    let anterior = inicio, quadro = 0, estourou = false
    const girar = (agora: number) => {
      const passo = Math.min(2.2, (agora - anterior) / 16.67)
      anterior = agora
      const t = (agora - inicio) / 1000 / ritmo
      ctx.clearRect(0, 0, largura, altura)
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineCap = 'round'
      for (const p of PASSES) {
        if (t < p.inicio || t > p.fim) continue
        const [x, y] = naTela(...p.ponto((t - p.inicio) / (p.fim - p.inicio)))
        brilho(x, y, aleatorio(46, 86) * escala)
        brilho(x, y, aleatorio(10, 18) * escala)
        soltar(x, y, 5, 8.5, Math.PI * 0.95)
      }
      if (!estourou && t >= IMPACTO) {
        estourou = true
        soltar(...naTela(50, 62), 150, 17, Math.PI * 0.62)
        soltar(...naTela(2, 95), 40, 11, Math.PI * 0.5)
        soltar(...naTela(98, 95), 40, 11, Math.PI * 0.5)
      }
      const piso = caixa.bottom + caixa.height * 0.34
      for (let i = faiscas.length - 1; i >= 0; i--) {
        const f = faiscas[i]
        const ax = f.x, ay = f.y
        f.vy += 0.26 * escala * passo
        f.vx *= 0.99
        f.x += f.vx * passo; f.y += f.vy * passo
        f.vida -= passo
        if (!f.quicou && f.y > piso && f.vy > 0) { f.y = piso; f.vy *= -aleatorio(0.22, 0.42); f.vx *= 0.75; f.quicou = true }
        if (f.vida <= 0) { faiscas.splice(i, 1); continue }
        const vivo = f.vida / f.total
        ctx.strokeStyle = `rgba(255,${Math.round(118 + 137 * vivo)},${Math.round(26 + 210 * vivo * vivo)},${Math.min(1, vivo * 1.7).toFixed(2)})`
        ctx.lineWidth = f.grossura * (0.45 + vivo * 0.8)
        ctx.beginPath(); ctx.moveTo(ax - f.vx * 1.6, ay - f.vy * 1.6); ctx.lineTo(f.x, f.y); ctx.stroke()
      }
      quadro = requestAnimationFrame(girar)
    }
    medir()
    quadro = requestAnimationFrame(girar)
    addEventListener('resize', medir)
    return () => { cancelAnimationFrame(quadro); removeEventListener('resize', medir) }
  }, [alvo, ligado, ritmo])
  return <canvas ref={ref} className="ab-solda" aria-hidden="true" />
}

/* ---------- abertura ---------- */

type Props = { modo: ModoAbertura; onSaida: () => void; onFim: () => void }

export default function Abertura({ modo, onSaida, onFim }: Props) {
  const raiz = useRef<HTMLDivElement>(null)
  const palco = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const liquido = useRef<SVGGElement>(null)
  const reflexo = useRef<SVGRectElement>(null)
  const contador = useRef<HTMLSpanElement>(null)
  const cortina = useRef<HTMLDivElement>(null)
  const voo = useRef<HTMLDivElement>(null)
  const marca = useRef<HTMLDivElement>(null)
  const pular = useRef<() => void>(() => {})
  const [forjando, setForjando] = useState(false)
  const ritmo = modo === 'curta' ? 0.36 : 0.6

  useLayoutEffect(() => {
    let cancelado = false
    let terminou = false
    const E = [0.16, 1, 0.3, 1] as const
    const encerrar = () => {
      if (terminou) return
      terminou = true
      try { sessionStorage.setItem(VISTA, '1') } catch { /* sem armazenamento */ }
      onSaida()
      onFim()
    }
    pular.current = () => { cancelado = true; encerrar() }

    /* Carregamento real: fontes e as peças do logotipo. */
    const tarefas: Promise<unknown>[] = [
      document.fonts?.load('800 64px "Archivo Variable"') ?? Promise.resolve(),
      document.fonts?.load('italic 300 64px "Archivo Variable"') ?? Promise.resolve(),
      ...CAMADAS.map((c) => carregar(c.src)),
      carregar(logo.marca),
    ]
    let feitas = 0, progresso = 0, enchendo = false
    const mostrar = (v: number) => { if (contador.current) contador.current.textContent = String(Math.round(v)).padStart(3, '0') }
    const nivel = (alvo: number, dur = 0.9) => {
      if (!enchendo || !liquido.current) return
      const de = progresso
      progresso = alvo
      animate(liquido.current, { y: LIQ_VAZIO - (LIQ_VAZIO - LIQ_CHEIO) * alvo }, { duration: dur, ease: [0.3, 0, 0.2, 1] })
      animate(de * 100, alvo * 100, { duration: dur, ease: [0.3, 0, 0.2, 1], onUpdate: mostrar })
    }
    const carregado = Promise.race([
      Promise.all(tarefas.map((t) => Promise.resolve(t).catch(() => undefined).then(() => { feitas++; nivel(Math.max(0.18, feitas / tarefas.length) * 0.86) }))),
      espera(6),
    ])

    const medirVoo = () => {
      const v = voo.current, m = marca.current
      const alvo = document.querySelector<HTMLElement>('[data-alvo-marca]')
      if (!v || !m || !alvo) return null
      const W = m.offsetWidth, H = m.offsetHeight
      const R = alvo.getBoundingClientRect()
      const x0 = (innerWidth - W) / 2, y0 = (innerHeight - H) / 2
      v.style.transform = `translate(${x0}px, ${y0}px)`
      return { x0, y0, x1: R.left, y1: R.top, s1: R.width / W }
    }

    const visivel = () => document.hidden
      ? new Promise<void>((r) => { const f = () => { if (!document.hidden) { document.removeEventListener('visibilitychange', f); r() } }; document.addEventListener('visibilitychange', f) })
      : Promise.resolve()

    const roda = async () => {
      await visivel()
      if (cancelado) return

      if (modo === 'completa') {
        /* 1. O traço desenha o visor. */
        animate(svg.current!.querySelectorAll('.ab-traco'), { strokeDashoffset: [1, 0], opacity: [0, 1] }, { duration: 1.2, delay: stagger(0.07), ease: [0.45, 0, 0.15, 1] })
        animate(palco.current!.querySelectorAll('.ab-texto'), { opacity: [0, 1], y: [10, 0] }, { duration: 0.8, delay: stagger(0.1, { startDelay: 0.45 }), ease: E })
        /* 2. O líquido enche conforme o site carrega. */
        await espera(0.45)
        if (cancelado) return
        enchendo = true
        nivel(Math.max(0.18, feitas / tarefas.length) * 0.86, 1.1)
        await Promise.all([espera(1), carregado])
        if (cancelado) return
        nivel(1, 0.5)
        await espera(0.45)
        if (cancelado) return
        /* 3. O reflexo passa e a chapa cobre a tela a partir do vidro. */
        animate(reflexo.current!, { x: [-120, 260] }, { duration: 0.8, ease: [0.6, 0, 0.3, 1] })
        animate(svg.current!, { rotate: [0, -3, 2.5, 0] }, { duration: 0.7, ease: 'easeInOut' })
        await espera(0.4)
        if (cancelado) return
        cortina.current!.style.visibility = 'visible'
        const r = svg.current!.getBoundingClientRect()
        const cx = r.left + r.width * VISOR.centro.x, cy = r.top + r.height * VISOR.centro.y
        const raio = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) + 40
        animate(cortina.current!, { clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${raio}px at ${cx}px ${cy}px)`] }, { duration: 1, ease: [0.7, 0, 0.2, 1] })
        animate(palco.current!, { scale: [1, 0.86], opacity: [1, 0] }, { duration: 0.7, delay: 0.25, ease: [0.5, 0, 0.75, 0] })
        await espera(0.65)
      } else {
        cortina.current!.style.visibility = 'visible'
        palco.current!.style.display = 'none'
        await carregado
      }
      if (cancelado) return

      voo.current!.style.visibility = 'visible'
      medirVoo()

      if (modo === 'calma') {
        await animate(marca.current!, { opacity: [0, 1] }, { duration: 0.6, ease: 'easeOut' }).finished
        await espera(0.5)
        onSaida()
        raiz.current?.classList.add('is-saindo')
        await animate(raiz.current!, { opacity: [1, 0] }, { duration: 0.6, ease: 'easeOut' }).finished
        if (!cancelado) encerrar()
        return
      }

      /* 4. O arco de solda monta o logotipo. */
      setForjando(true)
      await espera(IMPACTO * ritmo + (modo === 'curta' ? 0.15 : 0.25))
      if (cancelado) return
      raiz.current?.classList.add('is-impacto')
      await espera(modo === 'curta' ? 0.2 : 0.3)
      if (cancelado) return

      /* 5. A chapa sobe e o logotipo voa até o topo. */
      const medida = medirVoo()
      onSaida()
      raiz.current?.classList.add('is-saindo')
      const dur = modo === 'curta' ? 0.9 : 1.1
      animate(cortina.current!, { y: ['0%', '-118%'] }, { duration: dur, ease: [0.76, 0, 0.24, 1] })
      if (medida) {
        const { x0, y0, x1, y1, s1 } = medida
        animate(voo.current!, { x: [x0, x1] }, { duration: dur, ease: [0.72, 0, 0.22, 1] })
        animate(voo.current!, { y: [y0, y1] }, { duration: dur, ease: [0.5, 0, 0.18, 1] })
        animate(marca.current!, { scale: [1, s1] }, { duration: dur, ease: [0.62, 0, 0.2, 1] })
        animate(marca.current!.querySelectorAll('.is-assinatura'), { opacity: [1, 0] }, { duration: dur * 0.5, ease: 'easeOut' })
      }
      await espera(dur)
      if (!cancelado) encerrar()
    }

    roda().catch(() => encerrar())
    return () => { cancelado = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={raiz} className={`abertura modo-${modo}`}>
    <div className="ab-fundo" aria-hidden="true" />
    <div ref={palco} className="ab-palco" aria-hidden="true">
      <svg ref={svg} className="ab-visor" viewBox={`0 0 ${VISOR.w} ${VISOR.h}`} overflow="visible">
        <defs>
          <clipPath id="ab-vidro"><path d={VISOR.vidro} /></clipPath>
          <linearGradient id="ab-luz" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".6" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        </defs>
        <g clipPath="url(#ab-vidro)">
          <g ref={liquido} style={{ transform: `translateY(${LIQ_VAZIO}px)` }}>
            <path className="ab-onda anima" d={ONDA} />
          </g>
          <text x="120" y="262" textAnchor="middle" className="ab-gravacao" transform="rotate(-90 120 262)">INOVA INOX</text>
          <g transform="skewX(-14)"><rect ref={reflexo} x="0" y="120" width="40" height="300" fill="url(#ab-luz)" style={{ transform: 'translateX(-120px)' }} /></g>
        </g>
        {TRACOS_VISOR.map((d, i) => <path key={i} className="ab-traco" d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1} opacity={0} />)}
      </svg>
      <p className="ab-texto ab-contador"><span ref={contador}>000</span><small>%</small></p>
      <p className="ab-texto ab-legenda">Preparando a linha</p>
    </div>

    <div ref={cortina} className="ab-cortina" aria-hidden="true" style={{ visibility: 'hidden' }}>
      <span className="ab-cortina-luz" />
      <Corte className="ab-corte" semente={4} />
    </div>

    <div ref={voo} className="ab-voo" aria-hidden="true" style={{ visibility: 'hidden' }}>
      <div ref={marca} className="ab-marca">
        <LogoForja estado={forjando || modo === 'calma' ? 'visivel' : 'oculto'} ritmo={modo === 'calma' ? 0.01 : ritmo} />
      </div>
    </div>
    {forjando && modo !== 'calma' && <Solda alvo={marca} ligado={forjando} ritmo={ritmo} />}

    <button className="ab-pular" type="button" onClick={() => pular.current()}>Pular abertura</button>
  </div>
}

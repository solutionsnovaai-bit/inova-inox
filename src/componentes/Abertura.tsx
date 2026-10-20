import { useEffect, useRef, useState, type RefObject } from 'react'
import { animate, motion } from 'motion/react'
import { CAMADAS, PROPORCAO_LOGO, carregar, logo, type CamadaLogo } from '../lib/midia'

/*
  Abertura: o logotipo da Inova se monta peça por peça.
  1. Um anel se desenha no escuro.
  2. Os dois arcos são traçados por um ponto de luz (com poucas faíscas).
  3. As letras de INOVA e INOX assentam uma a uma, quentes, e esfriam até o aço.
  4. A assinatura abre do centro, um reflexo metálico corre a marca e um pulso de luz sai dela.
  5. O fundo some e o logotipo voa até o lugar dele no topo do site.
  Na segunda visita da sessão tudo corre mais rápido; com movimento reduzido é só um esmaecer.
*/

const VISTA = 'inova-abertura-v3'
const espera = (s: number) => new Promise<void>((r) => window.setTimeout(r, s * 1000))
const sorte = (a: number, b: number) => a + Math.random() * (b - a)
const ASSENTA = [0.16, 1, 0.3, 1] as const

type Ponto = [number, number]
const curva = (a: Ponto, b: Ponto, c: Ponto) => (u: number): Ponto => {
  const v = 1 - u
  return [v * v * a[0] + 2 * v * u * b[0] + u * u * c[0], v * v * a[1] + 2 * v * u * b[1] + u * u * c[1]]
}

/* Roteiro em segundos (multiplicado pelo ritmo). */
const R = { arcoSup: [0.2, 0.78], arcoInf: [0.34, 0.86], inova: 0.6, inox: 1.0, passo: 0.07, assinatura: [1.28, 1.7], brilho: 1.66, saida: 2.3 } as const
const TRILHAS = [
  { ini: R.arcoSup[0], fim: R.arcoSup[1], ponto: curva([25, 36], [52, -5], [80, 13]) },
  { ini: R.arcoInf[0], fim: R.arcoInf[1], ponto: curva([39, 54], [14, 84], [2, 58]) },
]

function ritmoInicial() {
  try { return sessionStorage.getItem(VISTA) === '1' ? 0.6 : 1 } catch { return 1 }
}

/* ---------- peças do logotipo ---------- */

function animacao(c: CamadaLogo, k: number) {
  if (c.grupo === 'arco') {
    const daDireita = c.id === 'arco-inferior'
    const [ini, fim] = c.id === 'arco-superior' ? R.arcoSup : R.arcoInf
    return {
      inicial: { clipPath: daDireita ? 'inset(-30% 0% -30% 100%)' : 'inset(-30% 100% -30% 0%)' },
      final: { clipPath: 'inset(-30% 0% -30% 0%)' },
      transicao: { duration: (fim - ini) * k, delay: ini * k, ease: 'linear' as const },
      esfria: ini + 0.25,
    }
  }
  if (c.grupo === 'assinatura') {
    const [ini, fim] = R.assinatura
    return {
      inicial: { clipPath: 'inset(-40% 50% -40% 50%)' },
      final: { clipPath: 'inset(-40% 0% -40% 0%)' },
      transicao: { duration: (fim - ini) * k, delay: ini * k, ease: [0.65, 0, 0.35, 1] as const },
      esfria: ini + 0.2,
    }
  }
  const grupo = CAMADAS.filter((x) => x.grupo === c.grupo)
  const atraso = (c.grupo === 'inova' ? R.inova : R.inox) + grupo.indexOf(c) * R.passo
  return {
    inicial: { opacity: 0, y: '34%', scale: 0.78, filter: 'blur(10px)' },
    final: { opacity: 1, y: '0%', scale: 1, filter: 'blur(0px)' },
    transicao: {
      delay: atraso * k,
      duration: 0.62 * k,
      ease: ASSENTA,
      opacity: { delay: atraso * k, duration: 0.18 * k },
    },
    esfria: atraso + 0.12,
  }
}

function LogoMontando({ ativo, k, pronto }: { ativo: boolean; k: number; pronto: boolean }) {
  return <div className="logo-camadas" style={{ aspectRatio: PROPORCAO_LOGO }} role="img" aria-label="Inova Inox: usinagem, polimento e solda">
    {CAMADAS.map((c) => {
      const a = animacao(c, k)
      return <motion.div key={c.id} className="logo-camada"
        style={{ left: `${c.x}%`, top: `${c.y}%`, width: `${c.w}%`, height: `${c.h}%` }}
        initial={pronto ? false : a.inicial} animate={ativo || pronto ? a.final : a.inicial} transition={a.transicao}>
        <img src={c.src} alt="" draggable={false} decoding="async" />
        {!pronto && <motion.span className="logo-luz" style={{ WebkitMaskImage: `url(${c.src})`, maskImage: `url(${c.src})` }}
          initial={{ opacity: 1 }} animate={{ opacity: ativo ? 0 : 1 }} transition={{ delay: a.esfria * k, duration: 0.75 * k, ease: 'easeIn' }} />}
      </motion.div>
    })}
  </div>
}

/* ---------- ponto de luz e faíscas (poucas) ---------- */

type Faisca = { x: number; y: number; vx: number; vy: number; vida: number; total: number; grossura: number }

function Luz({ alvo, k }: { alvo: RefObject<HTMLDivElement | null>; k: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current
    const ctx = cv?.getContext('2d')
    const el = alvo.current
    if (!cv || !ctx || !el) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const W = innerWidth, H = innerHeight
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const caixa = el.getBoundingClientRect()
    const esc = Math.max(0.6, caixa.width / 520)
    const tela = (p: Ponto): Ponto => [caixa.left + (p[0] / 100) * caixa.width, caixa.top + (p[1] / 100) * caixa.height]
    const faiscas: Faisca[] = []
    const soltar = ([x, y]: Ponto, n: number, forca: number, leque: number) => {
      for (let i = 0; i < n && faiscas.length < 90; i++) {
        const ang = -Math.PI / 2 + sorte(-leque, leque)
        const f = sorte(1.2, forca) * esc
        const total = sorte(16, 38)
        faiscas.push({ x, y, vx: Math.cos(ang) * f, vy: Math.sin(ang) * f, vida: total, total, grossura: sorte(0.7, 1.6) * Math.min(1.3, esc) })
      }
    }
    const brilho = ([x, y]: Ponto, raio: number, forte = 1) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, raio)
      g.addColorStop(0, `rgba(255,255,255,${forte})`)
      g.addColorStop(0.12, `rgba(210,234,255,${0.9 * forte})`)
      g.addColorStop(0.38, `rgba(79,163,255,${0.35 * forte})`)
      g.addColorStop(1, 'rgba(4,113,229,0)')
      ctx.fillStyle = g
      ctx.beginPath(); ctx.arc(x, y, raio, 0, Math.PI * 2); ctx.fill()
    }
    const t0 = performance.now()
    let anterior = t0, quadro = 0, estourou = false
    const girar = (agora: number) => {
      const passo = Math.min(2, (agora - anterior) / 16.67)
      anterior = agora
      const t = (agora - t0) / 1000 / k
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineCap = 'round'
      for (const tr of TRILHAS) {
        if (t < tr.ini || t > tr.fim) continue
        const p = tela(tr.ponto((t - tr.ini) / (tr.fim - tr.ini)))
        brilho(p, sorte(34, 50) * esc)
        brilho(p, sorte(7, 11) * esc)
        if (Math.random() < 0.55) soltar(p, 1, 5, Math.PI * 0.8)
      }
      const [a0, a1] = R.assinatura
      if (t >= a0 && t <= a1) {
        const u = (t - a0) / (a1 - a0)
        const d = 50 * (1 - Math.pow(1 - u, 2.2))
        brilho(tela([50 - d, 95.2]), 16 * esc, 0.8)
        brilho(tela([50 + d, 95.2]), 16 * esc, 0.8)
      }
      if (!estourou && t >= a1) {
        estourou = true
        soltar(tela([1, 95]), 8, 6, Math.PI * 0.45)
        soltar(tela([99, 95]), 8, 6, Math.PI * 0.45)
      }
      for (let i = faiscas.length - 1; i >= 0; i--) {
        const f = faiscas[i]
        const ax = f.x, ay = f.y
        f.vy += 0.22 * esc * passo
        f.vx *= 0.985
        f.x += f.vx * passo; f.y += f.vy * passo
        f.vida -= passo
        if (f.vida <= 0) { faiscas.splice(i, 1); continue }
        const vivo = f.vida / f.total
        ctx.strokeStyle = `rgba(${Math.round(190 + 65 * vivo)},${Math.round(215 + 40 * vivo)},255,${Math.min(1, vivo * 1.6).toFixed(2)})`
        ctx.lineWidth = f.grossura * (0.4 + vivo * 0.8)
        ctx.beginPath(); ctx.moveTo(ax - f.vx * 1.4, ay - f.vy * 1.4); ctx.lineTo(f.x, f.y); ctx.stroke()
      }
      if (t > R.saida + 0.5 && faiscas.length === 0) { ctx.clearRect(0, 0, W, H); return }
      quadro = requestAnimationFrame(girar)
    }
    quadro = requestAnimationFrame(girar)
    return () => cancelAnimationFrame(quadro)
  }, [alvo, k])
  return <canvas ref={ref} className="ab-luz" aria-hidden="true" />
}

/* ---------- abertura ---------- */

export function Abertura() {
  const [k] = useState(ritmoInicial)
  const [calma] = useState(() => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [ativo, setAtivo] = useState(false)
  const [fim, setFim] = useState(false)
  const raiz = useRef<HTMLDivElement>(null)
  const marca = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelado = false
    const abrir = () => document.documentElement.classList.add('aberto')
    const encerrar = () => { abrir(); if (!cancelado) setFim(true) }
    const seguro = window.setTimeout(encerrar, 9000)

    const roda = async () => {
      await Promise.race([Promise.all([...CAMADAS.map((c) => carregar(c.src)), carregar(logo.completo)]), espera(3)])
      if (cancelado) return
      const el = raiz.current, m = marca.current
      if (!el || !m) return encerrar()

      if (calma) {
        await espera(0.5)
        abrir()
        await animate(el, { opacity: 0 }, { duration: 0.5 }).finished
        return encerrar()
      }

      setAtivo(true)
      await espera(R.brilho * k)
      if (cancelado) return
      el.classList.add('is-brilho')
      await espera((R.saida - R.brilho) * k)
      if (cancelado) return
      try { sessionStorage.setItem(VISTA, '1') } catch { /* sem armazenamento */ }

      el.style.pointerEvents = 'none'
      const fundo = el.querySelector('.ab-fundo'), anel = el.querySelector('.ab-anel')
      if (fundo) animate(fundo, { opacity: 0 }, { duration: 0.85, delay: 0.1, ease: 'easeOut' })
      if (anel) animate(anel, { opacity: 0, scale: 1.3 }, { duration: 0.8, ease: [0.5, 0, 0.2, 1] })

      const alvo = document.querySelector<HTMLElement>('[data-alvo-logo]')?.getBoundingClientRect()
      if (alvo && alvo.bottom > 0 && alvo.top < innerHeight) {
        const b = m.getBoundingClientRect()
        const x = alvo.left + alvo.width / 2 - (b.left + b.width / 2)
        const y = alvo.top + alvo.height / 2 - (b.top + b.height / 2)
        await animate(m, { x, y, scale: alvo.width / b.width }, { duration: 0.95, ease: [0.76, 0, 0.24, 1] }).finished
        abrir()
        await animate(m, { opacity: 0 }, { duration: 0.3, ease: 'easeOut' }).finished
      } else {
        abrir()
        await animate(el, { opacity: 0 }, { duration: 0.5 }).finished
      }
      encerrar()
    }

    roda().catch(encerrar)
    return () => { cancelado = true; window.clearTimeout(seguro) }
  }, [calma, k])

  if (fim) return null
  return <div ref={raiz} className="abertura" aria-hidden="true">
    <div className="ab-fundo" />
    <svg className="ab-anel" viewBox="0 0 100 100">
      <motion.circle className="is-base" cx="50" cy="50" r="49.5" initial={{ pathLength: 0, rotate: -90 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4 * k, ease: [0.65, 0, 0.35, 1] }} />
      <g className="ab-anel-giro"><circle className="is-cometa" cx="50" cy="50" r="49.5" pathLength={1} strokeDasharray="0.14 0.86" /></g>
    </svg>
    <span className="ab-pulso" />
    <div className="ab-centro">
      <div ref={marca} className="ab-marca">
        <LogoMontando ativo={ativo} k={k} pronto={calma} />
        <span className="ab-reflexo" style={{ WebkitMaskImage: `url(${logo.completo})`, maskImage: `url(${logo.completo})` }} />
      </div>
    </div>
    {ativo && <Luz alvo={marca} k={k} />}
  </div>
}

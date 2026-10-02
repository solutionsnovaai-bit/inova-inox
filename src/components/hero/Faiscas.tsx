import { useEffect, useRef } from 'react'
import { aleatorio } from '../../lib/util'
import { temHero } from '../../lib/fotos'
import { TELA_LARGA } from '../../hooks/basicos'

type Props = { ligado: boolean }

type Emissor = {
  x: number
  y: number
  /** Direção central do jato, em radianos, e a abertura do leque. */
  direcao: number
  leque: number
  forca: number
}

type Faisca = {
  x: number
  y: number
  vx: number
  vy: number
  vida: number
  total: number
  quicou: boolean
  grossura: number
}

const MAXIMO = 170
const CIMA = -Math.PI / 2

/**
 * Faíscas de solda em canvas, por cima da foto do hero. Saem em rajadas
 * dos pontos onde a foto já mostra faíscas, caem com gravidade e quicam
 * uma vez. Param fora da tela e não rodam para quem pediu menos animação.
 */
export function Faiscas({ ligado }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const arcoRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const arco = arcoRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !arco || !ligado) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const largo = window.matchMedia(TELA_LARGA)
    let largura = 0
    let altura = 0
    let emissores: Emissor[] = []
    let piso = 0

    const medir = () => {
      const r = canvas.getBoundingClientRect()
      largura = r.width
      altura = r.height
      canvas.width = Math.round(largura * dpr)
      canvas.height = Math.round(altura * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const foto = canvas.closest('.hero')?.querySelector('.hero-foto')?.getBoundingClientRect()
      if (temHero && foto) {
        // Coordenadas relativas à foto, para as faíscas nascerem onde ela mostra faíscas.
        const topo = foto.top - r.top
        const em = (fx: number, fy: number) => ({ x: foto.width * fx, y: topo + foto.height * fy })
        if (largo.matches) {
          emissores = [{ ...em(1.005, 0.2), direcao: Math.PI * 0.78, leque: 0.42, forca: 11 }]
          piso = topo + foto.height * 0.8
        } else {
          emissores = [
            { ...em(0.02, 0.2), direcao: Math.PI * 0.42, leque: 0.4, forca: 5 },
            { ...em(0.98, 0.2), direcao: Math.PI * 0.58, leque: 0.4, forca: 5 },
          ]
          piso = topo + foto.height * 0.452
        }
        arco.style.display = 'none'
      } else {
        const ponto = largo.matches
          ? { x: largura * 0.955, y: altura * 0.6 }
          : { x: largura * 0.9, y: altura * 0.37 }
        emissores = [{ ...ponto, direcao: CIMA - 0.3, leque: 1.25, forca: 9 }]
        piso = largo.matches ? altura * 0.9 : altura * 0.52
        arco.style.left = `${ponto.x}px`
        arco.style.top = `${ponto.y}px`
      }
    }

    const faiscas: Faisca[] = []
    let quadro = 0
    let soldando = false
    let trocaEm = performance.now() + 700
    let anterior = performance.now()

    const soltar = () => {
      const porQuadro = largo.matches ? 4 : 2
      for (const e of emissores) {
        for (let i = 0; i < porQuadro && faiscas.length < MAXIMO; i++) {
          const angulo = e.direcao + aleatorio(-e.leque, e.leque)
          const forca = aleatorio(e.forca * 0.25, e.forca)
          const total = aleatorio(36, 92)
          faiscas.push({
            x: e.x,
            y: e.y,
            vx: Math.cos(angulo) * forca,
            vy: Math.sin(angulo) * forca,
            vida: total,
            total,
            quicou: false,
            grossura: aleatorio(0.8, 2),
          })
        }
      }
    }

    const girar = (agora: number) => {
      const passo = Math.min(2.2, (agora - anterior) / 16.67)
      anterior = agora

      if (agora > trocaEm) {
        soldando = !soldando
        trocaEm = agora + (soldando ? aleatorio(450, 1200) : aleatorio(900, 2600))
      }
      arco.style.opacity = soldando ? aleatorio(0.55, 1).toFixed(2) : '0'
      if (soldando) soltar()

      ctx.clearRect(0, 0, largura, altura)
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineCap = 'round'

      for (let i = faiscas.length - 1; i >= 0; i--) {
        const f = faiscas[i]
        const antesX = f.x
        const antesY = f.y
        f.vy += 0.2 * passo
        f.vx *= 0.992
        f.x += f.vx * passo
        f.y += f.vy * passo
        f.vida -= passo

        if (!f.quicou && f.y > piso && f.vy > 0) {
          f.y = piso
          f.vy *= -aleatorio(0.25, 0.45)
          f.vx *= 0.7
          f.quicou = true
        }
        if (f.vida <= 0 || f.x < -30 || f.x > largura + 30) {
          faiscas.splice(i, 1)
          continue
        }

        const vivo = f.vida / f.total
        // Nasce quase branca e esfria para o laranja.
        const verde = Math.round(120 + 135 * vivo)
        const azul = Math.round(30 + 200 * vivo * vivo)
        ctx.strokeStyle = `rgba(255,${verde},${azul},${Math.min(1, vivo * 1.6).toFixed(2)})`
        ctx.lineWidth = f.grossura * (0.5 + vivo * 0.7)
        ctx.beginPath()
        ctx.moveTo(antesX - f.vx * 1.4, antesY - f.vy * 1.4)
        ctx.lineTo(f.x, f.y)
        ctx.stroke()
      }

      quadro = requestAnimationFrame(girar)
    }

    medir()
    quadro = requestAnimationFrame(girar)
    window.addEventListener('resize', medir)

    return () => {
      cancelAnimationFrame(quadro)
      window.removeEventListener('resize', medir)
      ctx.clearRect(0, 0, largura, altura)
      arco.style.opacity = '0'
    }
  }, [ligado])

  return (
    <div className="hero-faiscas" aria-hidden="true">
      <span ref={arcoRef} className="hero-arco" />
      <canvas ref={canvasRef} />
    </div>
  )
}

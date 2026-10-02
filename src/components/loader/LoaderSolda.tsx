import { useEffect, useRef, type RefObject } from 'react'
import { aleatorio } from '../../lib/util'
import { IMPACTO, passes } from '../../lib/roteiroLoader'

type Props = {
  /** Elemento do logotipo: as posições do roteiro são relativas a ele. */
  alvo: RefObject<HTMLElement | null>
  ligado: boolean
  ritmo: number
}

type Faisca = {
  x: number
  y: number
  vx: number
  vy: number
  vida: number
  total: number
  grossura: number
  quicou: boolean
}

const MAXIMO = 520

/**
 * Canvas da solda. Um arco elétrico percorre o logotipo seguindo o roteiro,
 * solta faíscas com gravidade e, no impacto, estoura uma chuva delas.
 */
export function LoaderSolda({ alvo, ligado, ritmo }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const logo = alvo.current
    if (!canvas || !ctx || !logo || !ligado) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let largura = 0
    let altura = 0
    let caixa = logo.getBoundingClientRect()
    let escala = 1

    const medir = () => {
      largura = window.innerWidth
      altura = window.innerHeight
      canvas.width = Math.round(largura * dpr)
      canvas.height = Math.round(altura * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      caixa = logo.getBoundingClientRect()
      escala = Math.max(0.6, caixa.width / 560)
    }

    const naTela = (px: number, py: number) =>
      [caixa.left + (px / 100) * caixa.width, caixa.top + (py / 100) * caixa.height] as const

    const faiscas: Faisca[] = []
    const soltar = (x: number, y: number, quantas: number, forcaMax: number, leque = Math.PI) => {
      for (let i = 0; i < quantas && faiscas.length < MAXIMO; i++) {
        const angulo = -Math.PI / 2 + aleatorio(-leque, leque)
        const forca = aleatorio(1.5, forcaMax) * escala
        const total = aleatorio(26, 78)
        faiscas.push({
          x,
          y,
          vx: Math.cos(angulo) * forca,
          vy: Math.sin(angulo) * forca,
          vida: total,
          total,
          grossura: aleatorio(0.8, 2.2) * Math.min(1.4, escala),
          quicou: false,
        })
      }
    }

    const brilho = (x: number, y: number, raio: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, raio)
      g.addColorStop(0, 'rgba(255,255,255,1)')
      g.addColorStop(0.1, 'rgba(205,232,255,0.95)')
      g.addColorStop(0.34, 'rgba(79,163,255,0.42)')
      g.addColorStop(1, 'rgba(4,113,229,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, raio, 0, Math.PI * 2)
      ctx.fill()
    }

    const inicio = performance.now()
    let anterior = inicio
    let quadro = 0
    let estourou = false

    const girar = (agora: number) => {
      const passo = Math.min(2.2, (agora - anterior) / 16.67)
      anterior = agora
      const t = (agora - inicio) / 1000 / ritmo

      ctx.clearRect(0, 0, largura, altura)
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineCap = 'round'

      // Arcos ativos: a luz treme como arco de verdade e solta faíscas.
      for (const p of passes) {
        if (t < p.inicio || t > p.fim) continue
        const [px, py] = p.ponto((t - p.inicio) / (p.fim - p.inicio))
        const [x, y] = naTela(px, py)
        brilho(x, y, aleatorio(46, 86) * escala)
        brilho(x, y, aleatorio(10, 18) * escala)
        soltar(x, y, 5, 8.5, Math.PI * 0.95)
      }

      // Impacto: estouro em leque a partir da base do logo.
      if (!estourou && t >= IMPACTO) {
        estourou = true
        const [cx, cy] = naTela(50, 62)
        soltar(cx, cy, 150, 17, Math.PI * 0.62)
        const [ex, ey] = naTela(2, 95)
        const [dx, dy] = naTela(98, 95)
        soltar(ex, ey, 40, 11, Math.PI * 0.5)
        soltar(dx, dy, 40, 11, Math.PI * 0.5)
      }

      const piso = caixa.bottom + caixa.height * 0.34
      for (let i = faiscas.length - 1; i >= 0; i--) {
        const f = faiscas[i]
        const antesX = f.x
        const antesY = f.y
        f.vy += 0.26 * escala * passo
        f.vx *= 0.99
        f.x += f.vx * passo
        f.y += f.vy * passo
        f.vida -= passo

        if (!f.quicou && f.y > piso && f.vy > 0) {
          f.y = piso
          f.vy *= -aleatorio(0.22, 0.42)
          f.vx *= 0.75
          f.quicou = true
        }
        if (f.vida <= 0) {
          faiscas.splice(i, 1)
          continue
        }

        const vivo = f.vida / f.total
        const verde = Math.round(118 + 137 * vivo)
        const azul = Math.round(26 + 210 * vivo * vivo)
        ctx.strokeStyle = `rgba(255,${verde},${azul},${Math.min(1, vivo * 1.7).toFixed(2)})`
        ctx.lineWidth = f.grossura * (0.45 + vivo * 0.8)
        ctx.beginPath()
        ctx.moveTo(antesX - f.vx * 1.6, antesY - f.vy * 1.6)
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
    }
  }, [alvo, ligado, ritmo])

  return <canvas ref={canvasRef} className="loader-solda" aria-hidden="true" />
}

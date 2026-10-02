import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { LogoCamadas } from '../ui/LogoCamadas'
import { LoaderSolda } from './LoaderSolda'
import { logo, precarregarLogo } from '../../lib/logo'
import { FIM, IMPACTO, marcarLoaderVisto, ritmoDaVisita, SAIDA_MS } from '../../lib/roteiroLoader'
import { useMovimentoReduzido } from '../../hooks/basicos'

type PropsReguaProgresso = { valor: number }

/** Progresso desenhado como a régua de um paquímetro: o cursor corre até 100. */
export function ReguaProgresso({ valor }: PropsReguaProgresso) {
  return (
    <div className="regua" aria-hidden="true">
      <div className="regua-escala">
        <span className="regua-preenchida" style={{ transform: `scaleX(${valor / 100})` }} />
        <span className="regua-cursor" style={{ left: `${valor}%` }} />
      </div>
      <span className="regua-valor numero">{String(valor).padStart(3, '0')}</span>
    </div>
  )
}

type PropsLoader = {
  /** Chamado quando as chapas começam a abrir: hora de animar o hero. */
  aoAbrir: () => void
  /** Chamado quando a tela de carregamento saiu por completo. */
  aoTerminar: () => void
}

const ESPERA_MAXIMA = 2200

/**
 * Tela de carregamento: o logotipo é soldado na tela.
 *
 *  1. um arco elétrico desenha os dois arcos do símbolo;
 *  2. o arco corre por INOVA, INOX e pela assinatura, e cada peça nasce
 *     incandescente e esfria até a cor do aço;
 *  3. no impacto, o logo assenta, um anel de luz abre e as faíscas estouram;
 *  4. um fio de arco corta a tela e as duas chapas se abrem para o site.
 *
 * A ordem e os tempos estão em lib/roteiroLoader.ts.
 */
export function Loader({ aoAbrir, aoTerminar }: PropsLoader) {
  const reduzido = useMovimentoReduzido()
  const [ritmo] = useState(ritmoDaVisita)
  const [carregado, setCarregado] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [impacto, setImpacto] = useState(false)
  const [saindo, setSaindo] = useState(false)
  const logoRef = useRef<HTMLDivElement>(null)

  // Espera as peças do logo e a fonte, com teto de tempo para nunca travar.
  useEffect(() => {
    let vivo = true
    const liberar = () => vivo && setCarregado(true)
    const teto = window.setTimeout(liberar, ESPERA_MAXIMA)
    const fontes = document.fonts?.ready ?? Promise.resolve()
    Promise.all([precarregarLogo(), fontes]).then(liberar, liberar)
    return () => {
      vivo = false
      clearTimeout(teto)
    }
  }, [])

  useEffect(() => {
    if (!carregado) return
    const duracao = reduzido ? 600 : FIM * 1000 * ritmo
    const inicio = performance.now()
    let quadro = 0
    const esperas: number[] = []

    const avancar = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / duracao)
      setProgresso(Math.round(t * 100))
      if (t < 1) {
        quadro = requestAnimationFrame(avancar)
        return
      }
      setSaindo(true)
      marcarLoaderVisto()
      esperas.push(window.setTimeout(aoAbrir, reduzido ? 0 : 430))
      esperas.push(window.setTimeout(aoTerminar, reduzido ? 350 : SAIDA_MS))
    }
    quadro = requestAnimationFrame(avancar)
    if (!reduzido) esperas.push(window.setTimeout(() => setImpacto(true), IMPACTO * 1000 * ritmo))

    return () => {
      cancelAnimationFrame(quadro)
      esperas.forEach(clearTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carregado, reduzido, ritmo])

  const mascara = { WebkitMaskImage: `url(${logo.completo})`, maskImage: `url(${logo.completo})` }

  return (
    <div
      className="loader"
      data-saindo={saindo || undefined}
      data-impacto={impacto || undefined}
      style={{ '--p': progresso / 100 } as CSSProperties}
      role="status"
      aria-label="Carregando o site da Inova Inox"
    >
      <div className="loader-chapa loader-chapa--cima" />
      <div className="loader-chapa loader-chapa--baixo" />
      <div className="loader-aura" />

      <div className="loader-centro">
        <div className="loader-logo" ref={logoRef}>
          <span className="loader-anel" />
          <LogoCamadas estado={carregado ? 'visivel' : 'oculto'} ritmo={reduzido ? 0.2 : ritmo} />
          <span className="loader-brilho" style={mascara} />
          <img className="loader-reflexo" src={logo.completo} alt="" draggable={false} />
        </div>
        <ReguaProgresso valor={progresso} />
      </div>

      {!reduzido && <LoaderSolda alvo={logoRef} ligado={carregado} ritmo={ritmo} />}
      <div className="loader-clarao" />
      <div className="loader-corte" />
    </div>
  )
}

import { ArrowRight } from 'lucide-react'
import { logo } from '../lib/midia'

const FAIXA = ['Inox 304 e 316', 'Tri-Clamp', 'SMS', 'RJT', 'DIN', 'OD', 'BSP e NPT', 'Peças sob desenho', 'Usinagem', 'Polimento', 'Solda']

/** Hero: só o logotipo da Inova, com uma linha de apoio e os dois caminhos (loja e catálogo). */
export function Hero() {
  return <header id="topo" className="hero">
    <div className="hero-luz" aria-hidden="true" />
    <div className="conteiner hero-dentro">
      <img className="hero-logo" src={logo.completo} alt="Inova Inox: usinagem, polimento e solda" width={1074} height={588} fetchPriority="high" />
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

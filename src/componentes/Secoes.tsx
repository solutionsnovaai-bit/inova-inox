import { useEffect, useState } from 'react'
import { ArrowRight, Cog, Flame, Plus, Ruler, Sparkles } from 'lucide-react'
import { FOTOS, logo } from '../lib/midia'
import { SITE } from '../loja/ajustes.js'
import { Cabecalho, IconeWhats } from './ui'
import { LINKS, linkWhats } from './Topo'

const SERVICOS = [
  { icone: Ruler, nome: 'Peça sob desenho', texto: 'Fabricamos a partir do seu desenho ou de uma amostra, na medida da sua linha.', msg: 'Olá! Preciso de uma peça em inox sob desenho ou amostra.' },
  { icone: Cog, nome: 'Usinagem', texto: 'Torno para conexões, roscas e peças especiais em inox 304 e 316.', msg: 'Olá! Quero um orçamento de usinagem em inox.' },
  { icone: Flame, nome: 'Soldagem', texto: 'Solda em inox para montar trechos, conjuntos e peças especiais.', msg: 'Olá! Quero um orçamento de soldagem em inox.' },
  { icone: Sparkles, nome: 'Polimento', texto: 'Polimento e acabamento para deixar o inox no brilho que a linha sanitária pede.', msg: 'Olá! Quero um orçamento de polimento em inox.' },
]

const GALERIA = ['curvas-polidas', 'te-sanitario', 'conexoes-tri-clamp', 'uniao-rosca', 'reducao-e-niple', 'curva-tri-clamp']

/** Serviços: o que a Inova fabrica além da loja, com fotos reais das peças. */
export function Servicos() {
  return <section id="servicos" className="secao servicos">
    <div className="conteiner">
      <Cabecalho claro tag="Fábrica" titulo={<>Não achou na loja?<br /><em>A gente fabrica.</em></>}
        texto="Além da linha pronta, a Inova usina, solda e pole peças em inox sob encomenda." />
      <div className="servicos-grade">
        {SERVICOS.map(({ icone: Icone, nome, texto, msg }) => <a key={nome} className="servico revelar" href={linkWhats(msg)} target="_blank" rel="noopener noreferrer">
          <span className="servico-icone"><Icone aria-hidden="true" /></span>
          <h3>{nome}</h3>
          <p>{texto}</p>
          <span className="servico-link">Pedir orçamento <ArrowRight aria-hidden="true" /></span>
        </a>)}
      </div>
      <div className="galeria revelar" aria-label="Peças da Inova">
        {GALERIA.map((k) => <figure key={k}><img src={FOTOS[k].src} alt={FOTOS[k].alt} loading="lazy" decoding="async" /></figure>)}
      </div>
    </div>
  </section>
}

const PERGUNTAS = [
  { p: '304 ou 316: qual escolher?', r: 'O 316 leva molibdênio e resiste melhor a cloretos, ácidos e limpezas agressivas. O 304 atende a maior parte da linha sanitária. Na dúvida, conte o que passa na linha e a gente indica.' },
  { p: 'Como descubro o padrão e a medida da minha conexão?', r: 'Mande uma foto da peça ao lado de uma régua ou paquímetro no WhatsApp. Identificamos se é Tri-Clamp, SMS, RJT, DIN, OD, BSP ou NPT e a medida certa.' },
  { p: 'Vocês enviam para todo o Brasil?', r: 'Sim. O frete é calculado na sacola pelo CEP, com as transportadoras disponíveis e o prazo de cada uma.' },
  { p: 'Quais as formas de pagamento?', r: 'Pix, cartão ou boleto, pelo Mercado Pago. Se preferir, feche o pedido pelo WhatsApp.' },
  { p: 'Por que algumas peças estão sob consulta?', r: 'Algumas peças são cotadas conforme a medida e o aço. Coloque na sacola mesmo assim que respondemos com o valor.' },
  { p: 'A peça que eu preciso não está na loja.', r: 'Fabricamos sob desenho ou a partir de uma amostra, com usinagem, soldagem e polimento. Chame no WhatsApp.' },
]

export function Duvidas() {
  const [aberta, setAberta] = useState<number | null>(0)
  return <section id="duvidas" className="secao duvidas">
    <div className="conteiner duvidas-grade">
      <Cabecalho tag="Dúvidas" titulo={<>Antes de <em>pedir.</em></>} texto={<>Ficou alguma? Chame no WhatsApp <a href={linkWhats()} target="_blank" rel="noopener noreferrer">{SITE.whatsappVisivel}</a>.</>} />
      <div className="duvidas-lista">
        {PERGUNTAS.map((q, i) => <div key={q.p} className={`duvida revelar ${aberta === i ? 'is-aberta' : ''}`}>
          <button type="button" aria-expanded={aberta === i} onClick={() => setAberta(aberta === i ? null : i)}>{q.p}<Plus aria-hidden="true" /></button>
          <div className="duvida-corpo"><p>{q.r}</p></div>
        </div>)}
      </div>
    </div>
  </section>
}

export function Rodape() {
  return <footer className="rodape">
    <div className="conteiner">
      <div className="rodape-cta revelar">
        <h2>Peça fora da tabela?<br /><em>A gente faz.</em></h2>
        <a className="botao botao-whats" href={linkWhats()} target="_blank" rel="noopener noreferrer"><IconeWhats />Falar no WhatsApp</a>
      </div>
      <div className="rodape-colunas">
        <div>
          <img className="rodape-logo" src={logo.completo} alt="Inova Inox" width={1074} height={588} loading="lazy" />
        </div>
        <nav aria-label="Rodapé"><p>Navegue</p><ul>{LINKS.map((l) => <li key={l.href}><a href={l.href}>{l.rotulo}</a></li>)}</ul></nav>
        <div><p>Contato</p><ul>
          <li><a href={linkWhats()} target="_blank" rel="noopener noreferrer">WhatsApp {SITE.whatsappVisivel}</a></li>
          <li><a href={`tel:+${SITE.telefone}`}>Telefone {SITE.telefoneVisivel}</a></li>
        </ul></div>
      </div>
      <div className="rodape-base"><span>© {new Date().getFullYear()} {SITE.nome}</span><span>{SITE.assinatura}</span></div>
    </div>
  </footer>
}

/** Balão flutuante do WhatsApp, com o ícone oficial. */
export function BalaoWhats() {
  const [mostrar, setMostrar] = useState(false)
  useEffect(() => {
    const on = () => setMostrar(window.scrollY > innerHeight * 0.6)
    on()
    addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])
  return <a className={`balao-whats ${mostrar ? 'is-visivel' : ''}`} href={linkWhats()} target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp">
    <IconeWhats />
    <span className="balao-whats-texto">Fale com a gente</span>
  </a>
}

/** Abertura curta: o logotipo aparece com um brilho e a tela se abre. */
export function Loader() {
  const [saindo, setSaindo] = useState(false)
  const [fim, setFim] = useState(false)
  useEffect(() => {
    const t1 = window.setTimeout(() => setSaindo(true), 1400)
    const t2 = window.setTimeout(() => setFim(true), 2100)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])
  if (fim) return null
  return <div className={`loader ${saindo ? 'is-saindo' : ''}`} aria-hidden="true">
    <span className="loader-luz" />
    <img src={logo.completo} alt="" />
    <i className="loader-barra"><b /></i>
  </div>
}

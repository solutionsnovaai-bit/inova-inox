import { useMemo, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Plus } from 'lucide-react'
import { hero } from '../../lib/midia'
import { waLink } from '../../loja/config'
import { ease } from '../../lib/movimento'
import { Revelar, Titulo } from '../ui/Revelar'
import { BrandIcon, Faisca } from '../ui/Pecas'

const SERVICOS = ['Peça sob desenho', 'Peça a partir de amostra', 'Usinagem', 'Soldagem', 'Polimento e acabamento', 'Identificar uma conexão']
const ACOS = [
  { nome: 'Inox 304', tom: 'linear-gradient(135deg, #f1f3f5, #8d96a0 55%, #e4e7ea)' },
  { nome: 'Inox 316', tom: 'linear-gradient(135deg, #e9f2ff, #7c8ea3 55%, #dfe7f0)' },
  { nome: 'Ainda não sei', tom: 'repeating-linear-gradient(45deg, #c8cdd3 0 6px, #8d96a0 6px 12px)' },
]
const juntar = (l: string[]) => (l.length <= 1 ? l.join('') : `${l.slice(0, -1).join(', ')} e ${l[l.length - 1]}`)

/** Orçamento sob desenho: as escolhas viram uma mensagem pronta, mostrada como balão de conversa. */
export function Orcamento() {
  const [nome, setNome] = useState('')
  const [servicos, setServicos] = useState<string[]>([])
  const [aco, setAco] = useState<string | null>(null)
  const [qtd, setQtd] = useState('')
  const [obs, setObs] = useState('')
  const [erro, setErro] = useState(false)
  const grupo = useRef<HTMLFieldSetElement>(null)

  const mensagem = useMemo(() => {
    if (!servicos.length) return ''
    return [
      nome.trim() ? `Olá! Aqui é ${nome.trim()}.` : 'Olá!',
      `Vim pelo site da Inova Inox e quero um orçamento: ${juntar(servicos).toLowerCase()}.`,
      aco ? `Material: ${aco.toLowerCase()}.` : '',
      qtd.trim() ? `Quantidade: ${qtd.trim()}.` : '',
      obs.trim(),
      'Posso mandar foto, desenho ou a amostra por aqui.',
    ].filter(Boolean).join('\n')
  }, [nome, servicos, aco, qtd, obs])

  const alternar = (s: string) => { setErro(false); setServicos((l) => (l.includes(s) ? l.filter((x) => x !== s) : [...l, s])) }
  const enviar = (e: FormEvent) => {
    e.preventDefault()
    if (!mensagem) { setErro(true); grupo.current?.querySelector('input')?.focus(); return }
    window.open(waLink(mensagem), '_blank', 'noopener')
  }

  return <section id="orcamento" className="secao orcamento" aria-labelledby="orcamento-titulo">
    <div className="orcamento-fundo" aria-hidden="true">
      <picture><source media="(max-width: 767px)" srcSet={hero.mobile} /><img src={hero.desktop} alt="" loading="lazy" decoding="async" /></picture>
    </div>
    <div className="conteiner orcamento-grade">
      <div className="orcamento-intro">
        <Revelar><p className="selo-texto">Sob desenho ou amostra</p></Revelar>
        <Titulo id="orcamento-titulo" linhas={['Não achou', 'na loja?']} destaque="A gente fabrica." />
        <Revelar delay={0.1}><p className="lead">Conte o que precisa e mande o desenho, a foto ou a amostra. A Inova usina, solda e pole a peça em inox 304 ou 316.</p></Revelar>
        <Revelar delay={0.2} className="balao-area">
          <p className="balao-rotulo">Sua mensagem</p>
          <motion.div layout className="balao" transition={{ duration: 0.5, ease: ease.expo }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.pre key={mensagem ? 'm' : 'v'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={mensagem ? '' : 'is-vazio'}>
                {mensagem || 'Escolha o que você precisa e a mensagem aparece aqui.'}
              </motion.pre>
            </AnimatePresence>
            <span className="balao-hora" aria-hidden="true">agora <Check /><Check /></span>
          </motion.div>
        </Revelar>
      </div>

      <Revelar delay={0.1} className="orcamento-cartao">
        <form onSubmit={enviar} noValidate>
          <div className="campo">
            <label htmlFor="orc-nome">Seu nome</label>
            <input id="orc-nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como podemos te chamar" autoComplete="name" maxLength={50} />
          </div>
          <fieldset ref={grupo} className="campo" aria-invalid={erro || undefined} aria-describedby={erro ? 'orc-erro' : undefined}>
            <legend>O que você precisa <small>obrigatório</small></legend>
            <div className="fichas">
              {SERVICOS.map((s) => <label key={s} className={`ficha ${servicos.includes(s) ? 'is-marcada' : ''}`}>
                <input type="checkbox" checked={servicos.includes(s)} onChange={() => alternar(s)} />
                <span><Check aria-hidden="true" />{s}</span>
              </label>)}
            </div>
            {erro && <p className="campo-erro" id="orc-erro" role="alert">Escolha pelo menos uma opção.</p>}
          </fieldset>
          <fieldset className="campo">
            <legend>Aço</legend>
            <div className="amostras">
              {ACOS.map((a) => <label key={a.nome} className={`amostra ${aco === a.nome ? 'is-marcada' : ''}`}>
                <input type="radio" name="aco" checked={aco === a.nome} onChange={() => setAco(a.nome)} onClick={() => { if (aco === a.nome) setAco(null) }} />
                <span className="amostra-chapa" style={{ background: a.tom }} aria-hidden="true" />
                <span className="amostra-nome">{a.nome}</span>
              </label>)}
            </div>
          </fieldset>
          <div className="campo">
            <label htmlFor="orc-qtd">Quantidade</label>
            <input id="orc-qtd" value={qtd} onChange={(e) => setQtd(e.target.value)} placeholder="Ex.: 20 peças" maxLength={40} />
          </div>
          <div className="campo">
            <label htmlFor="orc-obs">Detalhes</label>
            <textarea id="orc-obs" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Medidas, padrão da conexão, prazo, o que passa na linha..." rows={3} maxLength={500} data-lenis-prevent />
          </div>
          <button type="submit" className="botao zap orcamento-enviar">
            <span className="botao-texto">Mandar pelo WhatsApp</span>
            <span className="botao-icone" aria-hidden="true"><BrandIcon /></span>
          </button>
          <p className="orcamento-nota">A conversa abre no WhatsApp com a mensagem pronta. Depois é só anexar o desenho ou a foto.</p>
        </form>
      </Revelar>
    </div>
  </section>
}

const PERGUNTAS = [
  { p: '304 ou 316: qual escolher?', r: 'O 316 leva molibdênio e resiste melhor a cloretos, ácidos e limpezas mais agressivas. O 304 atende a maior parte da linha sanitária. Na dúvida, conte o que passa na linha e a Inova indica o aço.' },
  { p: 'Como descubro o padrão e a medida da minha conexão?', r: 'Mande pelo WhatsApp uma foto da peça ao lado de uma régua ou paquímetro. A Inova identifica se é Tri-Clamp, SMS, RJT, DIN, OD, BSP ou NPT e a medida certa.' },
  { p: 'A peça que eu preciso não está na loja.', r: 'A Inova fabrica sob desenho ou a partir de uma amostra, com usinagem, soldagem e polimento. Use o formulário de orçamento ou chame no WhatsApp.' },
  { p: 'Por que algumas peças estão sob consulta?', r: 'Algumas peças são cotadas na hora, conforme medida e aço. Coloque na sacola mesmo assim: o pedido chega completo e a Inova responde com o valor.' },
  { p: 'Como pago e recebo?', r: 'Você fecha o pedido pelo WhatsApp e a Inova confirma estoque, frete e forma de pagamento no atendimento.' },
  { p: 'Os desenhos são das peças da Inova?', r: 'São os desenhos do catálogo técnico da Inova, com as cotas de cada medida. As fotos da oficina mostram as peças na bancada e no estoque.' },
]

export function Duvidas() {
  const [aberta, setAberta] = useState<number | null>(0)
  return <section id="duvidas" className="secao duvidas" aria-labelledby="duvidas-titulo">
    <div className="conteiner duvidas-grade">
      <div>
        <Revelar><p className="selo-texto">Dúvidas</p></Revelar>
        <Titulo id="duvidas-titulo" linhas={['Antes de']} destaque="pedir." />
        <Revelar delay={0.1}><p className="duvidas-faisca"><Faisca /> Ficou alguma? Chame no WhatsApp.</p></Revelar>
      </div>
      <div className="duvidas-lista">
        {PERGUNTAS.map((q, i) => {
          const esta = aberta === i
          return <Revelar key={q.p} delay={i * 0.04} className={`duvida ${esta ? 'is-aberta' : ''}`}>
            <h3><button type="button" aria-expanded={esta} aria-controls={`duvida-${i}`} onClick={() => setAberta(esta ? null : i)}>
              <span>{q.p}</span><Plus aria-hidden="true" />
            </button></h3>
            <AnimatePresence initial={false}>
              {esta && <motion.div id={`duvida-${i}`} role="region" className="duvida-corpo" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.6, ease: ease.expo }}>
                <p>{q.r}</p>
              </motion.div>}
            </AnimatePresence>
          </Revelar>
        })}
      </div>
    </div>
  </section>
}

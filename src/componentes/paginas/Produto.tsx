import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { ArrowUpRight, BookOpen, Check, Minus, Plus, ShoppingBag } from 'lucide-react'
import { FOTOS, recortePagina, TITULOS_PAGINAS } from '../../lib/midia'
import { mensagens, waLink } from '../../loja/config'
import { useEstoque } from '../../loja/estoque'
import { useSacola } from '../../loja/sacola'
import { Link, linkCatalogo, linkLoja } from '../../loja/rotas'
import type { Aco, Produto as TProduto } from '../../loja/tipos'
import { brl, precoDe } from '../../loja/util'
import { ease, rolarPara, useMovimento } from '../../lib/movimento'
import { Lupa, Revelar, Titulo } from '../ui/Revelar'
import { Botao, BrandIcon, Faisca } from '../ui/Pecas'
import { ImagemPeca } from '../ui/Peca'
import { Vitrine } from '../inicio/Vitrine'

type Midia = { id: string; tipo: 'desenho' | 'foto' | 'ficha'; src?: string; alt: string }

function midiasDe(p: TProduto): Midia[] {
  const l: Midia[] = [{ id: 'desenho', tipo: 'desenho', alt: `Desenho técnico: ${p.nome}` }]
  if (p.fotoLink) l.push({ id: 'link', tipo: 'foto', src: p.fotoLink, alt: p.nome })
  p.fotos.forEach((k) => { const f = FOTOS[k]; if (f) l.push({ id: k, tipo: 'foto', src: f.src, alt: f.alt }) })
  if (p.pagina !== null) l.push({ id: 'ficha', tipo: 'ficha', alt: `Catálogo técnico, página ${p.pagina + 1}` })
  return l
}

/** Página do catálogo recortada da folha, com lupa. */
function Ficha({ pagina, lupa = true }: { pagina: number; lupa?: boolean }) {
  const { src, coluna, linha } = recortePagina(pagina)
  const img = <span className="pagina-recorte"><img src={src} alt={`Catálogo técnico, página ${pagina + 1}: ${TITULOS_PAGINAS[pagina]}`} loading="lazy" decoding="async"
    style={{ left: `${-coluna * 100}%`, top: `${-linha * 100}%` }} draggable={false} /></span>
  return lupa ? <Lupa className="ficha-lupa" zoom={1.6}>{img}</Lupa> : img
}

function Seletor({ nome, valores, atual, escolher, id }: { nome: string; valores: string[]; atual: string; escolher: (v: string) => void; id: string }) {
  return <fieldset className="seletor">
    <legend>{nome} <b>{atual || 'Única'}</b></legend>
    <LayoutGroup id={id}>
      <div className={`seletor-opcoes ${valores.length > 8 ? 'is-muitas' : ''}`} data-lenis-prevent>
        {valores.map((v) => <label key={v} className={atual === v ? 'is-marcada' : ''}>
          <input type="radio" name={id} checked={atual === v} onChange={() => escolher(v)} />
          {atual === v && <motion.span layoutId={`${id}-marca`} className="seletor-marca" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
          <span className="seletor-rotulo">{v || 'Única'}</span>
        </label>)}
      </div>
    </LayoutGroup>
  </fieldset>
}

export default function Produto({ slug }: { slug: string }) {
  const { porSlug, produtos, categorias, status } = useEstoque()
  const { adicionar, abrir } = useSacola()
  const { reduzido } = useMovimento()
  const p = porSlug(slug)
  const [medida, setMedida] = useState('')
  const [aco, setAco] = useState<Aco>('304')
  const [opcoes, setOpcoes] = useState<Record<string, string>>({})
  const [qtd, setQtd] = useState(1)
  const [midia, setMidia] = useState('desenho')
  const [aviso, setAviso] = useState(0)
  const [voo, setVoo] = useState<{ x0: number; y0: number; x1: number; y1: number; k: number } | null>(null)
  const botaoAdd = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!p) { document.title = 'Peça não encontrada | Inova Inox'; return }
    document.title = `${p.nome} | Inova Inox`
    setMedida((m) => (p.variantes.some((v) => v.medida === m) ? m : p.variantes[0]?.medida ?? ''))
    setOpcoes((o) => Object.fromEntries(p.opcoes.map((op) => [op.nome, op.valores.includes(o[op.nome]) ? o[op.nome] : op.valores[0]])))
  }, [p])
  useEffect(() => { setMidia('desenho'); setQtd(1) }, [slug])
  useEffect(() => { if (!aviso) return; const t = window.setTimeout(() => setAviso(0), 3800); return () => window.clearTimeout(t) }, [aviso])

  const relacionados = useMemo(() => {
    if (!p) return []
    const mesmo = produtos.filter((x) => x.slug !== p.slug && x.categoria === p.categoria)
    return [...mesmo.filter((x) => x.grupo === p.grupo), ...mesmo.filter((x) => x.grupo !== p.grupo)].slice(0, 10)
  }, [p, produtos])

  if (!p) return <section className="secao produto-nada escuro">
    <div className="conteiner">
      <p className="selo-texto">Loja</p>
      <h1 className="titulo">Peça não <em>encontrada.</em></h1>
      <p className="lead">Ela pode ter saído da loja. Veja as peças disponíveis ou mande a foto da peça no WhatsApp.</p>
      <div className="produto-nada-acoes">
        <Botao href={linkLoja()} variante="azul">Ver a loja</Botao>
        <Botao href={waLink(mensagens.identificar)} variante="contorno" icone={<BrandIcon />}>Mandar foto</Botao>
      </div>
    </div>
  </section>

  const linha = categorias.find((c) => c.id === p.categoria)
  const variante = p.variantes.find((v) => v.medida === medida) ?? p.variantes[0]
  const acoEscolhido: Aco | null = p.material ? aco : null
  const unitario = precoDe(variante, acoEscolhido ?? '304')
  const midias = midiasDe(p)
  const atual = midias.find((m) => m.id === midia) ?? midias[0]
  const descricao = [variante?.medida, acoEscolhido ? `inox ${acoEscolhido}` : '', ...Object.entries(opcoes).map(([k, v]) => `${k.toLowerCase()} ${v}`)].filter(Boolean).join(', ')
  const textoPedido = `Olá! Vim pelo site da Inova Inox e quero pedir: ${p.nome} (${descricao}), ${qtd} ${variante?.unidade || 'un'}.`
  const temTabela = p.variantes.length > 1 || p.material

  const colocar = () => {
    adicionar({ slug: p.slug, medida: variante?.medida ?? '', aco: acoEscolhido, opcoes, qtd })
    setAviso(Date.now())
    const de = botaoAdd.current?.getBoundingClientRect()
    const para = document.querySelector('.topo-sacola')?.getBoundingClientRect()
    if (de && para && !reduzido) setVoo({ x0: de.left + de.width / 2, y0: de.top + de.height / 2, x1: para.left + para.width / 2, y1: para.top + para.height / 2, k: Date.now() })
  }

  return <>
    <section className="produto escuro" aria-labelledby="produto-titulo">
      <div className="produto-luz" aria-hidden="true" />
      <div className="conteiner">
        <nav className="migalhas" aria-label="Caminho">
          <Link href={linkLoja()}>Loja</Link><span aria-hidden="true">/</span>
          {linha && <><Link href={linkLoja(linha.id)}>{linha.nome}</Link><span aria-hidden="true">/</span></>}
          <span aria-current="page">{p.nome}</span>
        </nav>

        <div className="produto-grade">
          <div className="produto-galeria">
            <div className={`produto-palco is-${atual.tipo}`} data-cursor={atual.tipo === 'foto' ? '' : 'ampliar'}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div key={atual.id} className="produto-palco-item" initial={{ opacity: 0, scale: 0.96, clipPath: 'inset(0% 0% 100% 0%)' }}
                  animate={{ opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: ease.quint }}>
                  {atual.tipo === 'desenho' && <Lupa className="produto-desenho" zoom={2}><ImagemPeca produto={p} prioridade /></Lupa>}
                  {atual.tipo === 'foto' && <Lupa className="produto-foto"><img src={atual.src} alt={atual.alt} decoding="async" draggable={false} /></Lupa>}
                  {atual.tipo === 'ficha' && p.pagina !== null && <Ficha pagina={p.pagina} />}
                </motion.div>
              </AnimatePresence>
              <span className="produto-palco-legenda">{atual.tipo === 'desenho' ? 'Desenho do catálogo técnico' : atual.tipo === 'ficha' ? `Ficha técnica · página ${(p.pagina ?? 0) + 1}` : 'Foto da oficina'}</span>
            </div>
            {midias.length > 1 && <div className="produto-miniaturas" role="tablist" aria-label="Imagens da peça">
              {midias.map((m) => <button key={m.id} type="button" role="tab" aria-selected={m.id === atual.id} className={m.id === atual.id ? 'is-ativa' : ''}
                onClick={() => setMidia(m.id)} aria-label={m.alt}>
                {m.tipo === 'desenho' && <ImagemPeca produto={p} />}
                {m.tipo === 'foto' && <img src={m.src} alt="" loading="lazy" />}
                {m.tipo === 'ficha' && p.pagina !== null && <Ficha pagina={p.pagina} lupa={false} />}
              </button>)}
            </div>}
          </div>

          <div className="produto-info">
            <p className="selo-texto">{linha?.nome}{p.grupo ? ` · ${p.grupo}` : ''}</p>
            <Titulo key={p.slug} id="produto-titulo" as="h1" className="titulo produto-titulo" linhas={[p.nome]} play delay={0.05} />
            {p.texto && <Revelar delay={0.1}><p className="produto-texto">{p.texto}</p></Revelar>}

            <div className="produto-escolhas">
              {p.variantes.length > 1 && <Seletor id={`medida-${p.slug}`} nome="Medida" valores={p.variantes.map((v) => v.medida)} atual={variante?.medida ?? ''} escolher={setMedida} />}
              {p.variantes.length === 1 && variante?.medida && <p className="seletor-unica">Medida <b>{variante.medida}</b></p>}
              {p.material && <Seletor id={`aco-${p.slug}`} nome="Aço" valores={['304', '316']} atual={aco} escolher={(v) => setAco(v as Aco)} />}
              {p.opcoes.map((op) => <Seletor key={op.nome} id={`op-${p.slug}-${op.nome}`} nome={op.nome} valores={op.valores} atual={opcoes[op.nome] ?? op.valores[0]}
                escolher={(v) => setOpcoes((o) => ({ ...o, [op.nome]: v }))} />)}
            </div>

            <div className="produto-compra">
              <div className="produto-preco" aria-live="polite">
                {status === 'carregando'
                  ? <span className="preco is-carregando"><i /></span>
                  : <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div key={`${unitario}-${qtd}`} initial={{ y: '60%', opacity: 0 }} animate={{ y: '0%', opacity: 1 }} exit={{ y: '-60%', opacity: 0 }} transition={{ duration: 0.5, ease: ease.expo }}>
                      {unitario !== null
                        ? <><strong>{brl(unitario * qtd)}</strong><small>{qtd > 1 ? `${qtd} × ${brl(unitario)}` : `por ${variante?.unidade || 'un'}`}{acoEscolhido ? ` · inox ${acoEscolhido}` : ''}</small></>
                        : <><strong className="is-consulta">Sob consulta</strong><small>Coloque na sacola: a Inova responde com o valor.</small></>}
                    </motion.div>
                  </AnimatePresence>}
              </div>
              <div className="qtd qtd-grande" role="group" aria-label="Quantidade">
                <button type="button" onClick={() => setQtd((q) => Math.max(1, q - 1))} aria-label="Diminuir" disabled={qtd <= 1}><Minus /></button>
                <input inputMode="numeric" aria-label="Quantidade" value={qtd} onChange={(e) => setQtd(Math.max(1, Math.min(9999, Number(e.target.value.replace(/\D/g, '')) || 1)))} />
                <button type="button" onClick={() => setQtd((q) => Math.min(9999, q + 1))} aria-label="Aumentar"><Plus /></button>
              </div>
            </div>

            <div className="produto-acoes">
              <div ref={botaoAdd} className="produto-adicionar"><Botao variante="azul" onClick={colocar} icone={<ShoppingBag />}>Colocar na sacola</Botao></div>
              <a className="link-seta" href={waLink(textoPedido)} target="_blank" rel="noopener noreferrer">Pedir só esta peça no WhatsApp<ArrowUpRight aria-hidden="true" /></a>
            </div>

            <ul className="produto-notas">
              <li><Check aria-hidden="true" />Estoque, frete e pagamento confirmados no atendimento.</li>
              {p.pagina !== null && <li><BookOpen aria-hidden="true" /><Link href={linkCatalogo(p.pagina)}>Cotas no catálogo técnico, página {p.pagina + 1}</Link></li>}
              <li><Faisca /><Link href="/#orcamento">Outra medida ou peça especial? Sob desenho</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    {temTabela && <section className="produto-tabela-secao" aria-labelledby="tabela-titulo">
      <div className="conteiner">
        <div className="secao-cabeca">
          <div>
            <p className="selo-texto">{p.nome}</p>
            <Titulo id="tabela-titulo" linhas={['Todas as']} destaque="medidas." />
          </div>
          <p className="lead">Toque numa medida para escolher. Os preços vêm direto da tabela da Inova.</p>
        </div>
        <div className="produto-tabela-rolagem" data-lenis-prevent>
          <table className="produto-tabela">
            <thead><tr><th>Medida</th>{p.material ? <><th>Inox 304</th><th>Inox 316</th></> : <th>Preço</th>}<th>Unidade</th><th aria-label="Escolher" /></tr></thead>
            <tbody>
              {p.variantes.map((v) => <tr key={v.medida} className={v.medida === variante?.medida ? 'is-escolhida' : ''}>
                <th scope="row">{v.medida || 'Única'}</th>
                <td>{status === 'carregando' ? '…' : v.preco304 !== null ? brl(v.preco304) : 'Consulta'}</td>
                {p.material && <td>{status === 'carregando' ? '…' : v.preco316 !== null ? brl(v.preco316) : 'Consulta'}</td>}
                <td>{v.unidade || 'un'}</td>
                <td><button type="button" onClick={() => { setMedida(v.medida); rolarPara(0, reduzido) }} aria-label={`Escolher ${v.medida}`}>
                  {v.medida === variante?.medida ? <Check /> : <Plus />}
                </button></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </section>}

    {relacionados.length > 0 && <Vitrine id="relacionados" produtos={relacionados} selo={linha?.nome ?? 'Mesma linha'} titulo={['Da mesma']} destaque="linha." escuro={false} />}

    <AnimatePresence>
      {voo && <motion.div key={voo.k} className="voo-sacola" aria-hidden="true"
        initial={{ x: voo.x0, y: voo.y0, scale: 1, opacity: 1 }}
        animate={{ x: [voo.x0, (voo.x0 + voo.x1) / 2, voo.x1], y: [voo.y0, Math.min(voo.y0, voo.y1) - 140, voo.y1], scale: [1, 1.2, 0.3], opacity: [1, 1, 0.2] }}
        transition={{ duration: 0.9, ease: [0.5, 0, 0.3, 1] }} onAnimationComplete={() => setVoo(null)}>
        <ShoppingBag />
      </motion.div>}
    </AnimatePresence>

    <AnimatePresence>
      {aviso > 0 && <motion.div key="aviso" className="aviso-sacola" role="status" initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.6, ease: ease.expo }}>
        <Check aria-hidden="true" />
        <span><b>{p.nome}</b> foi para a sacola.</span>
        <button type="button" onClick={() => { setAviso(0); abrir() }}>Ver sacola</button>
      </motion.div>}
    </AnimatePresence>
  </>
}

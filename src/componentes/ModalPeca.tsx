import { useEffect, useState } from 'react'
import { BookOpen, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { FOTOS, recortePagina } from '../lib/midia'
import { useEstoque } from '../loja/estoque'
import { useSacola } from '../loja/sacola'
import type { Aco, Produto } from '../loja/tipos'
import { brl, precoDe } from '../loja/util'
import { Desenho, FotoLoja, IconeWhats, ImagemPeca } from './ui'
import { linkWhats } from './Topo'

type Midia = { id: string; tipo: 'loja' | 'desenho' | 'oficina' | 'ficha'; src?: string; alt: string }

function midiasDe(p: Produto): Midia[] {
  const l: Midia[] = p.fotosLoja.map((src, i) => ({ id: `loja-${i}`, tipo: 'loja', src, alt: p.nome }))
  l.push({ id: 'desenho', tipo: 'desenho', alt: `Desenho técnico: ${p.nome}` })
  p.fotos.forEach((k) => { const f = FOTOS[k]; if (f) l.push({ id: k, tipo: 'oficina', src: f.src, alt: f.alt }) })
  if (p.pagina !== null) l.push({ id: 'ficha', tipo: 'ficha', alt: `Catálogo técnico, página ${p.pagina + 1}` })
  return l
}

function Ficha({ pagina }: { pagina: number }) {
  const { src, coluna, linha } = recortePagina(pagina)
  return <span className="pagina-recorte"><img src={src} alt="" loading="lazy" style={{ left: `${-coluna * 100}%`, top: `${-linha * 100}%` }} /></span>
}

function Pilulas({ nome, valores, atual, escolher }: { nome: string; valores: string[]; atual: string; escolher: (v: string) => void }) {
  return <fieldset className="pilulas">
    <legend>{nome} <b>{atual || 'Única'}</b></legend>
    <div className={valores.length > 10 ? 'is-muitas' : ''}>
      {valores.map((v) => <button key={v} type="button" className={atual === v ? 'is-ativa' : ''} aria-pressed={atual === v} onClick={() => escolher(v)}>{v || 'Única'}</button>)}
    </div>
  </fieldset>
}

/** Detalhe da peça (modal): imagens, medida, aço, opções, quantidade e preço. */
export function ModalPeca({ p, fechar, irCatalogo }: { p: Produto | null; fechar: () => void; irCatalogo: (pagina: number) => void }) {
  const { status } = useEstoque()
  const { adicionar } = useSacola()
  const [medida, setMedida] = useState('')
  const [aco, setAco] = useState<Aco>('304')
  const [opcoes, setOpcoes] = useState<Record<string, string>>({})
  const [qtd, setQtd] = useState(1)
  const [midia, setMidia] = useState('')

  useEffect(() => {
    if (!p) return
    setMedida(p.variantes[0]?.medida ?? '')
    setAco('304')
    setOpcoes(Object.fromEntries(p.opcoes.map((o) => [o.nome, o.valores[0]])))
    setQtd(1)
    setMidia('')
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar() }
    document.addEventListener('keydown', esc)
    document.body.classList.add('travado')
    return () => { document.removeEventListener('keydown', esc); document.body.classList.remove('travado') }
  }, [p, fechar])

  if (!p) return null
  const v = p.variantes.find((x) => x.medida === medida) ?? p.variantes[0]
  const acoEscolhido: Aco | null = p.material ? aco : null
  const unitario = precoDe(v, acoEscolhido ?? '304')
  const midias = midiasDe(p)
  const atual = midias.find((m) => m.id === midia) ?? midias[0]
  const escolherMedida = (m: string) => {
    setMedida(m)
    const f = p.variantes.find((x) => x.medida === m)?.fotos[0]
    if (f) setMidia(`loja-${p.fotosLoja.indexOf(f)}`)
  }
  const colocar = () => {
    adicionar({ slug: p.slug, medida: v?.medida ?? '', aco: acoEscolhido, opcoes, qtd })
    fechar()
  }
  const textoWhats = `Olá! Quero cotar: ${p.nome} (${[v?.medida, acoEscolhido && `inox ${acoEscolhido}`, ...Object.entries(opcoes).map(([k, x]) => `${k.toLowerCase()} ${x}`)].filter(Boolean).join(', ')}), ${qtd} ${v?.unidade || 'un'}.`

  return <div className="modal" role="dialog" aria-modal="true" aria-label={p.nome}>
    <button type="button" className="modal-fundo" onClick={fechar} aria-label="Fechar" />
    <div className="modal-caixa">
      <button type="button" className="modal-fechar" onClick={fechar} aria-label="Fechar"><X /></button>
      <div className="modal-grade">
        <div className="modal-galeria">
          <div className={`modal-palco is-${atual.tipo}`}>
            {atual.tipo === 'loja' && <FotoLoja key={atual.src} link={atual.src!} alt={atual.alt} prioridade reserva={<Desenho desenho={p.desenho ?? [0, 0, 0]} />} />}
            {atual.tipo === 'desenho' && (p.desenho ? <Desenho desenho={p.desenho} alt={atual.alt} prioridade /> : <ImagemPeca produto={p} prioridade />)}
            {atual.tipo === 'oficina' && <span className="foto-peca is-cobrir"><img src={atual.src} alt={atual.alt} /></span>}
            {atual.tipo === 'ficha' && p.pagina !== null && <Ficha pagina={p.pagina} />}
          </div>
          {midias.length > 1 && <div className="modal-miniaturas">
            {midias.map((m) => <button key={m.id} type="button" className={m.id === atual.id ? 'is-ativa' : ''} onClick={() => setMidia(m.id)} aria-label={m.alt}>
              {m.tipo === 'loja' && <FotoLoja link={m.src!} alt="" reserva={<Desenho desenho={p.desenho ?? [0, 0, 0]} />} />}
              {m.tipo === 'desenho' && (p.desenho ? <Desenho desenho={p.desenho} /> : <ImagemPeca produto={p} />)}
              {m.tipo === 'oficina' && <img src={m.src} alt="" />}
              {m.tipo === 'ficha' && p.pagina !== null && <Ficha pagina={p.pagina} />}
            </button>)}
          </div>}
        </div>

        <div className="modal-info">
          <span className="etiqueta"><i />{p.grupo}</span>
          <h2>{p.nome}</h2>
          {p.texto && <p className="modal-texto">{p.texto}</p>}

          {p.variantes.length > 1
            ? <Pilulas nome="Medida" valores={p.variantes.map((x) => x.medida)} atual={v?.medida ?? ''} escolher={escolherMedida} />
            : v?.medida ? <p className="modal-unica">Medida <b>{v.medida}</b></p> : null}
          {p.material && <Pilulas nome="Aço" valores={['304', '316']} atual={aco} escolher={(x) => setAco(x as Aco)} />}
          {p.opcoes.map((o) => <Pilulas key={o.nome} nome={o.nome} valores={o.valores} atual={opcoes[o.nome] ?? o.valores[0]} escolher={(x) => setOpcoes((s) => ({ ...s, [o.nome]: x }))} />)}

          <div className="modal-compra">
            <div className="modal-preco">
              {status === 'carregando' ? <span className="card-preco is-carregando"><i /></span>
                : unitario !== null
                  ? <><b>{brl(unitario * qtd)}</b><small>{qtd > 1 ? `${qtd} × ${brl(unitario)}` : `por ${v?.unidade || 'un'}`}{status === 'exemplo' ? ' · preço de exemplo' : ''}</small></>
                  : <><b className="is-consulta">Sob consulta</b><small>Coloque na sacola ou peça a cotação no WhatsApp.</small></>}
            </div>
            <div className="qtd">
              <button type="button" onClick={() => setQtd((q) => Math.max(1, q - 1))} disabled={qtd <= 1} aria-label="Menos um"><Minus /></button>
              <input inputMode="numeric" value={qtd} aria-label="Quantidade" onChange={(e) => setQtd(Math.max(1, Math.min(500, Number(e.target.value.replace(/\D/g, '')) || 1)))} />
              <button type="button" onClick={() => setQtd((q) => Math.min(500, q + 1))} aria-label="Mais um"><Plus /></button>
            </div>
          </div>

          <button type="button" className="botao botao-azul botao-largo" onClick={colocar}><ShoppingBag aria-hidden="true" />Adicionar à sacola</button>
          <div className="modal-links">
            <a href={linkWhats(textoWhats)} target="_blank" rel="noopener noreferrer"><IconeWhats />Cotar no WhatsApp</a>
            {p.pagina !== null && <button type="button" onClick={() => { const pg = p.pagina!; fechar(); irCatalogo(pg) }}><BookOpen aria-hidden="true" />Ver no catálogo técnico</button>}
          </div>
        </div>
      </div>
    </div>
  </div>
}

import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useEstoque } from '../loja/estoque'
import type { Produto } from '../loja/tipos'
import { brl, menorPreco, plural, resumoMedidas } from '../loja/util'
import { normalizar } from '../loja/planilha.js'
import { Cabecalho, ImagemPeca, IconeWhats, useRevelar } from './ui'
import { linkWhats } from './Topo'

const LOTE = 12

function Preco({ p }: { p: Produto }) {
  const { status } = useEstoque()
  if (status === 'carregando') return <span className="card-preco is-carregando"><i /></span>
  const v = menorPreco(p)
  if (v === null) return <span className="card-preco is-consulta">Sob consulta</span>
  const varia = p.variantes.length > 1 || p.material
  return <span className="card-preco">{status === 'exemplo' ? <small>ex.</small> : varia ? <small>a partir de</small> : null}<b>{brl(v)}</b></span>
}

export function CardPeca({ p, abrir, prioridade }: { p: Produto; abrir: (p: Produto) => void; prioridade?: boolean }) {
  const { categorias } = useEstoque()
  const linha = categorias.find((c) => c.id === p.categoria)?.nome
  return <article className="card revelar">
    <button type="button" className="card-imagem" onClick={() => abrir(p)} aria-label={`Ver ${p.nome}`}>
      <ImagemPeca produto={p} prioridade={prioridade} />
      {linha && <span className="selo-pilula">{linha}</span>}
      {p.material && <span className="selo-pilula is-aco">304 · 316</span>}
    </button>
    <div className="card-info">
      <h3>{p.nome}</h3>
      <p>{resumoMedidas(p)}</p>
      <div className="card-base">
        <Preco p={p} />
        <button type="button" className="botao botao-azul botao-p" onClick={() => abrir(p)}>Comprar</button>
      </div>
    </div>
  </article>
}

/** Loja: abas por linha, busca e a grade de peças com foto, preço e botão de compra. */
export function Loja({ abrir }: { abrir: (p: Produto) => void }) {
  const { produtos, categorias, status } = useEstoque()
  const [linha, setLinha] = useState('')
  const [busca, setBusca] = useState('')
  const [limite, setLimite] = useState(LOTE)

  useEffect(() => setLimite(LOTE), [linha, busca])

  const lista = useMemo(() => {
    const termos = normalizar(busca).split(' ').filter(Boolean)
    let l = linha ? produtos.filter((p) => p.categoria === linha) : [...produtos].sort((a, b) => Number(b.destaque) - Number(a.destaque))
    if (termos.length) {
      l = produtos.filter((p) => {
        const alvo = normalizar([p.nome, p.grupo, p.texto, ...p.variantes.map((v) => v.medida), ...p.opcoes.flatMap((o) => o.valores)].join(' '))
        return termos.every((t) => alvo.includes(t)) && (!linha || p.categoria === linha)
      })
    }
    return l
  }, [produtos, linha, busca])
  const visiveis = lista.slice(0, limite)
  useRevelar(`${linha}|${busca}|${limite}`)

  return <section id="loja" className="secao loja">
    <div className="conteiner">
      <div className="loja-cabeca">
        <Cabecalho tag="Loja" titulo={<>Conexões em inox,<br /><em>prontas para a sua linha.</em></>}
          texto={`${plural(produtos.length, 'peça', 'peças')} do catálogo técnico, em inox 304 e 316. Escolha a medida, coloque na sacola e receba em casa.`} />
        <label className="busca revelar">
          <Search aria-hidden="true" />
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder='Buscar: curva 2", abraçadeira, RJT...' aria-label="Buscar peça" />
          {busca && <button type="button" onClick={() => setBusca('')} aria-label="Limpar busca"><X /></button>}
        </label>
      </div>

      <div className="abas" role="tablist" aria-label="Linhas">
        {[{ id: '', nome: 'Todas', total: produtos.length }, ...categorias].map((c) => <button key={c.id || 'todas'} type="button" role="tab"
          aria-selected={linha === c.id} className={linha === c.id ? 'is-ativa' : ''} onClick={() => setLinha(c.id)}>
          {c.nome}<small>{c.total}</small>
        </button>)}
      </div>

      {status === 'exemplo' && <p className="aviso-exemplo">Preços de exemplo para visualizar a loja. Os valores reais entram pelo painel da loja.</p>}

      {lista.length === 0
        ? <div className="loja-vazia">
          <p>Nenhuma peça encontrada.</p>
          <span>Mande a foto da peça no WhatsApp que a gente encontra ou fabrica.</span>
          <a className="botao botao-whats" href={linkWhats('Olá! Não achei uma peça no site da Inova Inox. Vou mandar a foto.')} target="_blank" rel="noopener noreferrer"><IconeWhats />Mandar foto</a>
        </div>
        : <div className="grade">
          {visiveis.map((p, i) => <CardPeca key={`${linha}-${p.slug}`} p={p} abrir={abrir} prioridade={i < 4} />)}
        </div>}

      {lista.length > limite && <div className="loja-mais">
        <button type="button" className="botao botao-contorno" onClick={() => setLimite((l) => l + LOTE)}>
          Ver mais peças <small>{lista.length - limite} restantes</small>
        </button>
      </div>}
    </div>
  </section>
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Aco, Produto } from './tipos'
import { brl, precoDe } from './util'

/*
  Sacola: guarda só a escolha (peça, medida, aço, opções e quantidade).
  O preço é sempre o da planilha naquele momento, nunca um número guardado.
  Fica salva no navegador da pessoa até ela fechar o pedido.
*/

export type ItemSacola = {
  chave: string
  slug: string
  medida: string
  aco: Aco | null
  opcoes: Record<string, string>
  qtd: number
}

export type DadosPedido = { nome: string; empresa: string; cep: string; obs: string }

type Sacola = {
  itens: ItemSacola[]
  total: number
  aberta: boolean
  /** Muda a cada item adicionado: anima o contador do topo. */
  pulso: number
  adicionar: (item: Omit<ItemSacola, 'chave'>) => void
  alterar: (chave: string, qtd: number) => void
  remover: (chave: string) => void
  limpar: () => void
  abrir: () => void
  fechar: () => void
}

const CHAVE = 'inova-sacola-v1'
const Contexto = createContext<Sacola | null>(null)

export const chaveItem = (i: Omit<ItemSacola, 'chave' | 'qtd'>) =>
  [i.slug, i.medida, i.aco ?? '-', ...Object.entries(i.opcoes).sort().map(([k, v]) => `${k}=${v}`)].join('|')

function lerSalva(): ItemSacola[] {
  try {
    const v = JSON.parse(localStorage.getItem(CHAVE) ?? '[]')
    return Array.isArray(v) ? v.filter((i) => i && typeof i.slug === 'string' && i.qtd > 0) : []
  } catch { return [] }
}

export function SacolaProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemSacola[]>(lerSalva)
  const [aberta, setAberta] = useState(false)
  const [pulso, setPulso] = useState(0)

  useEffect(() => {
    try { localStorage.setItem(CHAVE, JSON.stringify(itens)) } catch { /* sem armazenamento: a sacola vale só nesta visita */ }
  }, [itens])

  const adicionar = useCallback((novo: Omit<ItemSacola, 'chave'>) => {
    const chave = chaveItem(novo)
    setItens((l) => {
      const ja = l.find((i) => i.chave === chave)
      return ja ? l.map((i) => (i.chave === chave ? { ...i, qtd: Math.min(9999, i.qtd + novo.qtd) } : i)) : [...l, { ...novo, chave }]
    })
    setPulso((p) => p + 1)
  }, [])
  const alterar = useCallback((chave: string, qtd: number) => {
    setItens((l) => l.map((i) => (i.chave === chave ? { ...i, qtd: Math.max(1, Math.min(9999, Math.round(qtd) || 1)) } : i)))
  }, [])
  const remover = useCallback((chave: string) => setItens((l) => l.filter((i) => i.chave !== chave)), [])
  const limpar = useCallback(() => setItens([]), [])

  const valor = useMemo<Sacola>(() => ({
    itens,
    total: itens.reduce((s, i) => s + i.qtd, 0),
    aberta,
    pulso,
    adicionar,
    alterar,
    remover,
    limpar,
    abrir: () => setAberta(true),
    fechar: () => setAberta(false),
  }), [itens, aberta, pulso, adicionar, alterar, remover, limpar])

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useSacola() {
  const v = useContext(Contexto)
  if (!v) throw new Error('useSacola fora do SacolaProvider')
  return v
}

/* ---------- conta e mensagem do pedido ---------- */

export type LinhaPedido = { item: ItemSacola; produto: Produto | undefined; unitario: number | null; unidade: string }

export function linhasDoPedido(itens: ItemSacola[], porSlug: (s: string) => Produto | undefined): LinhaPedido[] {
  return itens.map((item) => {
    const produto = porSlug(item.slug)
    const v = produto?.variantes.find((x) => x.medida === item.medida)
    return { item, produto, unitario: v ? precoDe(v, item.aco ?? '304') : null, unidade: v?.unidade || 'un' }
  })
}

export function resumoPedido(linhas: LinhaPedido[]) {
  const comPreco = linhas.filter((l) => l.produto && l.unitario !== null)
  return {
    subtotal: comPreco.reduce((s, l) => s + (l.unitario ?? 0) * l.item.qtd, 0),
    sobConsulta: linhas.filter((l) => l.produto && l.unitario === null).length,
    indisponiveis: linhas.filter((l) => !l.produto).length,
    pecas: linhas.reduce((s, l) => s + l.item.qtd, 0),
  }
}

export const descricaoItem = (l: Pick<LinhaPedido, 'item' | 'produto'>) => {
  const partes = [l.item.medida, l.item.aco ? `Inox ${l.item.aco}` : '', ...Object.entries(l.item.opcoes).map(([k, v]) => `${k} ${v}`)]
  return partes.filter(Boolean).join(' · ')
}

export function mensagemPedido(linhas: LinhaPedido[], dados: DadosPedido) {
  const validas = linhas.filter((l) => l.produto)
  const r = resumoPedido(validas)
  const corpo = validas.map((l, i) => {
    const nome = `${i + 1}) ${l.produto!.nome} · ${descricaoItem(l)}`
    const qtd = `${l.item.qtd} ${l.unidade}`
    return l.unitario !== null
      ? `${nome}\n   ${qtd} × ${brl(l.unitario)} = ${brl(l.unitario * l.item.qtd)}`
      : `${nome}\n   ${qtd} (sob consulta)`
  })
  const linhas_ = [
    'Olá! Quero fazer este pedido pelo site da Inova Inox:',
    '',
    ...corpo,
    '',
    r.subtotal > 0 ? `Subtotal das peças com preço: ${brl(r.subtotal)}` : '',
    r.sobConsulta > 0 ? `Peças para cotar: ${r.sobConsulta}` : '',
    '',
    dados.nome.trim() ? `Nome: ${dados.nome.trim()}` : '',
    dados.empresa.trim() ? `Empresa / CNPJ: ${dados.empresa.trim()}` : '',
    dados.cep.trim() ? `CEP de entrega: ${dados.cep.trim()}` : '',
    dados.obs.trim() ? `Observações: ${dados.obs.trim()}` : '',
    '',
    'Fico no aguardo da confirmação de estoque, frete e forma de pagamento.',
  ]
  return linhas_.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

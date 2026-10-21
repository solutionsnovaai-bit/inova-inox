import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { PRECO_EXEMPLO } from './ajustes.js'
import { CACHE_PAINEL } from './cache'
import { CATEGORIAS, DESTAQUES_BASE, PRODUTOS_BASE } from './produtos'
import type { Categoria, DadosPainel, Produto, ProdutoBase } from './tipos'

/*
  Estoque da loja: as peças do catálogo técnico com as fotos e os preços do painel (/painel).
  A última versão fica guardada no navegador: quem volta vê na hora, e quando o painel
  salva algo no mesmo navegador, a loja aberta em outra aba se atualiza sozinha.
*/

type Status = 'exemplo' | 'carregando' | 'pronto'

const deBase = (b: ProdutoBase, preco: number | null): Produto => ({
  slug: b.slug,
  nome: b.nome,
  categoria: b.categoria,
  grupo: b.grupo,
  opcoes: b.opcoes,
  material: b.material,
  pagina: b.pagina,
  desenho: b.desenho,
  fotos: b.fotos,
  fotosLoja: [],
  texto: b.texto,
  variantes: b.medidas.map((medida) => ({ medida, preco304: preco, preco316: preco, unidade: 'un', fotos: [] })),
  destaque: DESTAQUES_BASE.includes(b.slug),
})

const BASE = PRODUTOS_BASE.map((b) => deBase(b, null))
const EXEMPLO = PRODUTOS_BASE.map((b) => deBase(b, PRECO_EXEMPLO))

/** Fotos e preços do painel por cima das peças. */
function aplicarPainel(lista: Produto[], d: DadosPainel | null, comPrecos: boolean): Produto[] {
  if (!d) return lista
  return lista.map((p) => {
    const fotos = d.fotos[p.slug] ?? []
    const precos = comPrecos ? d.precos[p.slug]?.medidas : undefined
    if (!fotos.length && !precos) return p
    return {
      ...p,
      fotosLoja: fotos,
      variantes: precos
        ? p.variantes.map((v) => {
          const x = precos[v.medida]
          return x ? { ...v, preco304: x.p304, preco316: x.p316 } : v
        })
        : p.variantes,
    }
  })
}

const temPrecos = (d: DadosPainel | null) => Boolean(d && Object.values(d.precos).some((x) => Object.keys(x.medidas).length))
const valido = (d: unknown): d is DadosPainel => Boolean(d && typeof (d as DadosPainel).precos === 'object' && typeof (d as DadosPainel).fotos === 'object')
/** Nunca troca uma versão por outra mais antiga (o cache da rede pode atrasar alguns segundos). */
const maisNovo = (novo: DadosPainel, atual: DadosPainel | null) => !atual || String(novo.atualizado ?? '') >= String(atual.atualizado ?? '')

function lerSalvo(): DadosPainel | null {
  try { const d = JSON.parse(localStorage.getItem(CACHE_PAINEL) ?? 'null'); return valido(d) ? d : null } catch { return null }
}

async function baixarPainel(versao: string): Promise<DadosPainel | null> {
  const ctrl = new AbortController()
  const t = window.setTimeout(() => ctrl.abort(), 6000)
  try {
    const r = await fetch(`/api/painel?v=${encodeURIComponent(versao)}`, { signal: ctrl.signal })
    if (!r.ok) return null
    const d: unknown = await r.json()
    return valido(d) ? d : null
  } finally { window.clearTimeout(t) }
}

type Estoque = {
  produtos: Produto[]
  status: Status
  categorias: (Categoria & { total: number })[]
  porSlug: (slug: string) => Produto | undefined
}
const Contexto = createContext<Estoque | null>(null)

export function EstoqueProvider({ children }: { children: ReactNode }) {
  const [painel, setPainel] = useState<DadosPainel | null>(lerSalvo)
  const [lido, setLido] = useState(() => painel !== null)

  useEffect(() => {
    let vivo = true
    const buscar = () => {
      const atual = lerSalvo()
      baixarPainel(atual?.atualizado ?? '0')
        .then((d) => {
          if (!vivo || !d) return
          setPainel((velho) => (maisNovo(d, velho) ? d : velho))
          if (maisNovo(d, lerSalvo())) { try { localStorage.setItem(CACHE_PAINEL, JSON.stringify(d)) } catch { /* sem armazenamento */ } }
        })
        .catch(() => { /* sem rede: segue com o que já tem */ })
        .finally(() => { if (vivo) setLido(true) })
    }
    const aoVoltar = () => { if (document.visibilityState === 'visible') buscar() }
    const aoMudar = (e: StorageEvent) => {
      if (e.key !== CACHE_PAINEL || !e.newValue) return
      try { const d: unknown = JSON.parse(e.newValue); if (valido(d)) setPainel(d) } catch { /* ignora */ }
    }
    buscar()
    document.addEventListener('visibilitychange', aoVoltar)
    addEventListener('storage', aoMudar)
    return () => { vivo = false; document.removeEventListener('visibilitychange', aoVoltar); removeEventListener('storage', aoMudar) }
  }, [])

  const valor = useMemo<Estoque>(() => {
    const comPrecos = temPrecos(painel)
    const produtos = aplicarPainel(comPrecos ? BASE : EXEMPLO, painel, comPrecos)
    const status: Status = comPrecos ? 'pronto' : lido ? 'exemplo' : 'carregando'
    const mapa = new Map(produtos.map((p) => [p.slug, p]))
    const categorias = CATEGORIAS.map((cat) => ({ ...cat, total: produtos.filter((p) => p.categoria === cat.id).length })).filter((cat) => cat.total > 0)
    return { produtos, status, categorias, porSlug: (s) => mapa.get(s) }
  }, [painel, lido])

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useEstoque() {
  const v = useContext(Contexto)
  if (!v) throw new Error('useEstoque fora do EstoqueProvider')
  return v
}

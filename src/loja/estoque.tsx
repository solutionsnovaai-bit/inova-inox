import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { PLANILHA, PRECO_EXEMPLO } from './ajustes.js'
import { fontesPlanilha, linksDeFoto, lerPreco, nao, normalizar, sim, tabela } from './planilha.js'
import { CATEGORIAS, DESTAQUES_BASE, PRODUTOS_BASE } from './produtos'
import type { Categoria, DadosPainel, Produto, ProdutoBase } from './tipos'
import { slugificar } from './util'

/*
  Estoque da loja: começa com as peças do catálogo técnico e aplica, por cima,
  o que vem do painel da loja (fotos e preços) e da planilha, se estiver ligada.
  O painel tem a palavra final. A última leitura fica guardada no navegador
  para quem volta ver os preços na hora.
*/

export const planilhaLink = (PLANILHA || import.meta.env.VITE_PLANILHA_URL || '').trim()

type Status = 'exemplo' | 'carregando' | 'planilha' | 'erro'
const CACHE = 'inova-planilha-v2'
const CACHE_PAINEL = 'inova-painel-v1'
const ESPERA_MS = 9000

const deBase = (b: ProdutoBase, destaque: boolean, preco: number | null): Produto => ({
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
  destaque,
})

const BASE = PRODUTOS_BASE.map((b) => deBase(b, DESTAQUES_BASE.includes(b.slug), null))
const EXEMPLO = PRODUTOS_BASE.map((b) => deBase(b, DESTAQUES_BASE.includes(b.slug), PRECO_EXEMPLO))
const BASE_POR_NOME = new Map(PRODUTOS_BASE.map((b) => [normalizar(b.nome), b]))

function categoriaDe(texto: string) {
  const t = normalizar(texto)
  if (!t) return 'outros'
  const direta = CATEGORIAS.find((c) => normalizar(c.nome) === t || c.id === t.replace(/ /g, '-'))
  if (direta) return direta.id
  if (t.includes('clamp') || /\btc\b/.test(t)) return 'tri-clamp'
  if (t.includes('rjt') || t.includes('sms') || t.includes('din') || t.includes('roscad')) return 'roscadas'
  if (t.includes('bsp') || t.includes('npt') || t.includes('industrial')) return 'industrial'
  if (t.includes('solda') || t.includes('od')) return 'solda'
  if (t.includes('visor') || t.includes('amostra')) return 'visores'
  if (t.includes('acess')) return 'acessorios'
  return 'outros'
}

/** Monta a loja a partir do CSV da aba Produtos. */
function daPlanilha(csv: string): Produto[] | null {
  const t = tabela(csv)
  if (!t) return null
  const { c, linhas, pega } = t
  const grupos = new Map<string, string[][]>()
  for (const l of linhas) {
    const chave = normalizar(pega(l, c.produto))
    if (!grupos.has(chave)) grupos.set(chave, [])
    grupos.get(chave)!.push(l)
  }
  const usados = new Set<string>()
  const produtos: Produto[] = []
  for (const [chave, ls] of grupos) {
    const nome = pega(ls[0], c.produto)
    const base = BASE_POR_NOME.get(chave)
    const visiveis = ls.filter((l) => !nao(pega(l, c.mostrar)))
    const vistas = new Set<string>()
    const variantes = visiveis
      .map((l) => ({
        medida: pega(l, c.medida),
        preco304: lerPreco(pega(l, c.p304)),
        preco316: lerPreco(pega(l, c.p316)),
        unidade: pega(l, c.unidade) || 'un',
        fotos: linksDeFoto(pega(l, c.foto)),
      }))
      .filter((v) => (vistas.has(v.medida) ? false : (vistas.add(v.medida), true)))
    if (!variantes.length) continue
    let slug = base?.slug ?? slugificar(nome)
    while (usados.has(slug)) slug += '-2'
    usados.add(slug)
    const descricao = ls.map((l) => pega(l, c.descricao)).find(Boolean) ?? ''
    produtos.push({
      ...(base ? deBase(base, false, null) : {
        slug, nome, categoria: categoriaDe(pega(ls[0], c.categoria)), grupo: 'Outras peças', opcoes: [], material: true,
        pagina: null, desenho: null, fotos: [], fotosLoja: [], texto: '', variantes: [], destaque: false,
      }),
      slug,
      nome,
      texto: descricao || base?.texto || '',
      fotosLoja: [...new Set(variantes.flatMap((v) => v.fotos))],
      variantes,
      destaque: ls.some((l) => sim(pega(l, c.destaque))),
    })
  }
  if (produtos.length && !produtos.some((p) => p.destaque)) produtos.forEach((p) => { p.destaque = DESTAQUES_BASE.includes(p.slug) })
  return produtos.length ? produtos : null
}

/** Fotos e preços do painel por cima das peças. */
function aplicarPainel(lista: Produto[], d: DadosPainel | null): Produto[] {
  if (!d) return lista
  return lista.map((p) => {
    const fotos = d.fotos[p.slug] ?? []
    const precos = d.precos[p.slug]?.medidas
    if (!fotos.length && !precos) return p
    return {
      ...p,
      fotosLoja: fotos.length ? [...new Set([...fotos, ...p.fotosLoja])] : p.fotosLoja,
      variantes: precos
        ? p.variantes.map((v) => {
          const x = precos[v.medida]
          return x ? { ...v, preco304: x.p304 ?? v.preco304, preco316: x.p316 ?? v.preco316 } : v
        })
        : p.variantes,
    }
  })
}
const temPrecos = (d: DadosPainel | null) => Boolean(d && Object.values(d.precos).some((x) => Object.keys(x.medidas).length))
const lerPainelSalvo = (): DadosPainel | null => {
  try { const t = localStorage.getItem(CACHE_PAINEL); return t ? JSON.parse(t) as DadosPainel : null } catch { return null }
}

async function baixarPainel(): Promise<DadosPainel | null> {
  const ctrl = new AbortController()
  const t = window.setTimeout(() => ctrl.abort(), 5000)
  try {
    const r = await fetch('/api/painel', { signal: ctrl.signal })
    if (!r.ok) return null
    const d = await r.json() as DadosPainel
    return d && typeof d.precos === 'object' && typeof d.fotos === 'object' ? d : null
  } finally { window.clearTimeout(t) }
}

async function baixar(link: string) {
  let erro: unknown = null
  for (const url of fontesPlanilha(link)) {
    try {
      const ctrl = new AbortController()
      const t = window.setTimeout(() => ctrl.abort(), ESPERA_MS)
      const r = await fetch(`${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`, { cache: 'no-store', signal: ctrl.signal })
      window.clearTimeout(t)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const csv = await r.text()
      if (daPlanilha(csv)) return csv
      throw new Error('a aba lida não tem a coluna Produto')
    } catch (e) { erro = e }
  }
  throw erro ?? new Error('link da planilha não reconhecido')
}

type Estoque = {
  produtos: Produto[]
  status: Status
  categorias: (Categoria & { total: number })[]
  porSlug: (slug: string) => Produto | undefined
}
const Contexto = createContext<Estoque | null>(null)
const lerCache = () => { try { return localStorage.getItem(CACHE) ?? '' } catch { return '' } }

export function EstoqueProvider({ children }: { children: ReactNode }) {
  const [csv, setCsv] = useState(() => (planilhaLink ? lerCache() : ''))
  const [status, setStatus] = useState<Status>(() => (!planilhaLink ? 'exemplo' : lerCache() ? 'planilha' : 'carregando'))
  const [painel, setPainel] = useState<DadosPainel | null>(lerPainelSalvo)
  const [painelLido, setPainelLido] = useState(() => painel !== null)

  useEffect(() => {
    let vivo = true
    baixarPainel()
      .then((d) => {
        if (!vivo || !d) return
        setPainel(d)
        try { localStorage.setItem(CACHE_PAINEL, JSON.stringify(d)) } catch { /* sem armazenamento */ }
      })
      .catch(() => { /* sem painel: segue com a planilha ou os preços de exemplo */ })
      .finally(() => { if (vivo) setPainelLido(true) })
    return () => { vivo = false }
  }, [])

  useEffect(() => {
    if (!planilhaLink) return
    let vivo = true
    baixar(planilhaLink)
      .then((novo) => {
        if (!vivo) return
        setCsv(novo)
        setStatus('planilha')
        try { localStorage.setItem(CACHE, novo) } catch { /* sem armazenamento */ }
      })
      .catch((e) => {
        if (!vivo) return
        console.warn('Planilha da loja não lida:', e)
        setStatus((s) => (s === 'carregando' ? 'erro' : s))
      })
    return () => { vivo = false }
  }, [])

  const valor = useMemo<Estoque>(() => {
    const daTabela = csv ? daPlanilha(csv) : null
    const comPainel = temPrecos(painel)
    const produtos = aplicarPainel(daTabela || (planilhaLink || comPainel ? BASE : EXEMPLO), painel)
    const situacao: Status = daTabela || comPainel ? 'planilha' : !painelLido ? 'carregando' : planilhaLink ? status : 'exemplo'
    const mapa = new Map(produtos.map((p) => [p.slug, p]))
    const lista: Categoria[] = [...CATEGORIAS]
    if (produtos.some((p) => p.categoria === 'outros')) lista.push({ id: 'outros', nome: 'Outras peças', texto: 'Peças avulsas da loja.' })
    const categorias = lista.map((cat) => ({ ...cat, total: produtos.filter((p) => p.categoria === cat.id).length })).filter((cat) => cat.total > 0)
    return { produtos, status: situacao, categorias, porSlug: (s) => mapa.get(s) }
  }, [csv, status, painel, painelLido])

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useEstoque() {
  const v = useContext(Contexto)
  if (!v) throw new Error('useEstoque fora do EstoqueProvider')
  return v
}

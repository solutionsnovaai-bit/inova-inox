import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { PLANILHA, PRECO_EXEMPLO } from './ajustes.js'
import { fontesPlanilha, linksDeFoto, lerPreco, nao, normalizar, sim, tabela } from './planilha.js'
import { CATEGORIAS, DESTAQUES_BASE, PRODUTOS_BASE } from './produtos'
import type { Categoria, Produto, ProdutoBase } from './tipos'
import { slugificar } from './util'

/*
  Estoque da loja: começa com as peças do catálogo técnico e, com a planilha ligada,
  passa a mostrar o que a planilha diz (preços, fotos, medidas visíveis, destaques, peças novas).
  A última leitura fica guardada no navegador para quem volta ver os preços na hora.
*/

export const planilhaLink = (PLANILHA || import.meta.env.VITE_PLANILHA_URL || '').trim()

type Status = 'exemplo' | 'carregando' | 'planilha' | 'erro'
const CACHE = 'inova-planilha-v2'
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
    const produtos = (csv && daPlanilha(csv)) || (planilhaLink ? BASE : EXEMPLO)
    const mapa = new Map(produtos.map((p) => [p.slug, p]))
    const lista: Categoria[] = [...CATEGORIAS]
    if (produtos.some((p) => p.categoria === 'outros')) lista.push({ id: 'outros', nome: 'Outras peças', texto: 'Peças avulsas da loja.' })
    const categorias = lista.map((cat) => ({ ...cat, total: produtos.filter((p) => p.categoria === cat.id).length })).filter((cat) => cat.total > 0)
    return { produtos, status, categorias, porSlug: (s) => mapa.get(s) }
  }, [csv, status])

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useEstoque() {
  const v = useContext(Contexto)
  if (!v) throw new Error('useEstoque fora do EstoqueProvider')
  return v
}

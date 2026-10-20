import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { planilhaLink } from './config'
import { CATEGORIAS, DESTAQUES_BASE, PRODUTOS_BASE } from './produtos'
import type { Categoria, Produto, ProdutoBase } from './tipos'
import { lerPreco, linksDeFoto, normalizar, slugificar } from './util'

/*
  Estoque da loja: começa com a base do catálogo técnico (tudo sob consulta) e,
  se houver planilha, troca pelo que a planilha diz. A última leitura fica guardada
  no navegador, então quem volta já vê os preços na hora.
*/

type Status = 'base' | 'carregando' | 'planilha' | 'erro'

const CACHE = 'inova-planilha-v1'
const ESPERA_MS = 9000

const deBase = (b: ProdutoBase, destaque: boolean, exemplo: number | null = null): Produto => ({
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
  variantes: b.medidas.map((medida) => ({ medida, preco304: exemplo, preco316: exemplo, unidade: 'un', fotos: [] })),
  destaque,
})

const BASE: Produto[] = PRODUTOS_BASE.map((b) => deBase(b, DESTAQUES_BASE.includes(b.slug)))
/** Sem planilha ligada: preço de exemplo em tudo, só para visualizar a loja. */
const PRECO_EXEMPLO = 300
const BASE_EXEMPLO: Produto[] = PRODUTOS_BASE.map((b) => deBase(b, DESTAQUES_BASE.includes(b.slug), PRECO_EXEMPLO))
const BASE_POR_NOME = new Map(PRODUTOS_BASE.map((b) => [normalizar(b.nome), b]))

/* ---------- leitura da planilha do Google ---------- */

/** Aceita o link da barra de endereço, o de compartilhar ou um link de CSV publicado. */
function fontes(link: string) {
  if (/output=csv|tqx=out:csv/.test(link)) return [link]
  const id = (/\/spreadsheets\/d\/([a-zA-Z0-9_-]{20,})/.exec(link) || [])[1]
  if (!id) return []
  const gid = (/[#&?]gid=(\d+)/.exec(link) || [])[1]
  const raiz = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&headers=1`
  const aba = `${raiz}&sheet=${encodeURIComponent('Produtos')}`
  /* A aba Produtos tem a faixa com o logotipo nas linhas 1 a 3; a tabela começa na linha 4. */
  return [`${aba}&range=A4:J5000`, aba, ...(gid ? [`${raiz}&gid=${gid}`] : []), raiz]
}

function lerCsv(t: string) {
  const linhas: string[][] = []
  let linha: string[] = []
  let campo = ''
  let aspas = false
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (aspas) {
      if (c === '"') {
        if (t[i + 1] === '"') { campo += '"'; i++ } else aspas = false
      } else campo += c
      continue
    }
    if (c === '"') aspas = true
    else if (c === ',') { linha.push(campo); campo = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++
      linha.push(campo); linhas.push(linha); linha = []; campo = ''
    } else campo += c
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha) }
  return linhas
}

type Colunas = Record<'categoria' | 'produto' | 'medida' | 'p304' | 'p316' | 'unidade' | 'mostrar' | 'destaque' | 'foto' | 'descricao', number>

function colunas(cabeca: string[]): Colunas | null {
  const h = cabeca.map(normalizar)
  const achar = (...testes: ((s: string) => boolean)[]) => h.findIndex((s) => testes.some((t) => t(s)))
  const c: Colunas = {
    categoria: achar((s) => s.startsWith('categoria') || s.startsWith('linha')),
    produto: achar((s) => s.startsWith('produto') || s.startsWith('peca')),
    medida: achar((s) => s.startsWith('medida') || s.startsWith('bitola') || s.startsWith('diametro')),
    p304: achar((s) => s.includes('304') || s.includes('preco unico') || s === 'preco'),
    p316: achar((s) => s.includes('316')),
    unidade: achar((s) => s.startsWith('unidade')),
    mostrar: achar((s) => s.startsWith('mostrar') || s.startsWith('ativo') || s.startsWith('visivel')),
    destaque: achar((s) => s.startsWith('destaque')),
    foto: achar((s) => s.startsWith('foto') || s.startsWith('imagem')),
    descricao: achar((s) => s.startsWith('descri')),
  }
  return c.produto >= 0 ? c : null
}

const nao = (s: string) => /^(nao|n|0|false|oculto|esconder)$/.test(normalizar(s))
const sim = (s: string) => /^(sim|s|x|1|true)$/.test(normalizar(s))

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

/** Monta a loja a partir do CSV da aba Produtos. Devolve null se a aba não tiver a coluna Produto. */
function daPlanilha(csv: string): Produto[] | null {
  const linhas = lerCsv(csv).filter((l) => l.some((c) => c.trim()))
  /* O cabeçalho é a primeira linha com a coluna Produto (pode haver linhas de título acima dela). */
  const ini = linhas.slice(0, 8).findIndex((l) => colunas(l) !== null)
  if (ini < 0 || linhas.length < ini + 2) return null
  const c = colunas(linhas[ini])!
  const pega = (l: string[], i: number) => (i >= 0 ? String(l[i] ?? '').trim() : '')

  const grupos = new Map<string, string[][]>()
  for (const l of linhas.slice(ini + 1)) {
    const nome = pega(l, c.produto)
    if (!nome) continue
    const chave = normalizar(nome)
    if (!grupos.has(chave)) grupos.set(chave, [])
    grupos.get(chave)!.push(l)
  }

  const usados = new Set<string>()
  const produtos: Produto[] = []
  for (const [chave, ls] of grupos) {
    const nome = pega(ls[0], c.produto)
    const base = BASE_POR_NOME.get(chave)
    const vistas = new Set<string>()
    const variantes = ls
      .filter((l) => !nao(pega(l, c.mostrar)))
      .map((l) => ({
        medida: pega(l, c.medida),
        preco304: lerPreco(pega(l, c.p304)),
        preco316: lerPreco(pega(l, c.p316)),
        unidade: pega(l, c.unidade) || 'un',
        fotos: linksDeFoto(pega(l, c.foto)),
      }))
      .filter((v) => (vistas.has(v.medida) ? false : (vistas.add(v.medida), true)))
    if (variantes.length === 0) continue

    let slug = base?.slug ?? slugificar(nome)
    while (usados.has(slug)) slug += '-2'
    usados.add(slug)
    const descricao = ls.map((l) => pega(l, c.descricao)).find(Boolean) ?? ''
    const fotosLoja = [...new Set(ls.filter((l) => !nao(pega(l, c.mostrar))).flatMap((l) => linksDeFoto(pega(l, c.foto))))]
    produtos.push({
      ...(base ? deBase(base, false) : {
        slug, nome, categoria: categoriaDe(pega(ls[0], c.categoria)), grupo: 'Outras peças', opcoes: [], material: true,
        pagina: null, desenho: null, fotos: [], fotosLoja: [], texto: '', variantes: [], destaque: false,
      }),
      slug,
      nome,
      texto: descricao || base?.texto || '',
      fotosLoja,
      variantes,
      destaque: ls.some((l) => sim(pega(l, c.destaque))),
    })
  }
  if (produtos.length && !produtos.some((p) => p.destaque)) {
    produtos.forEach((p) => { p.destaque = DESTAQUES_BASE.includes(p.slug) })
  }
  return produtos.length ? produtos : null
}

async function baixar(link: string) {
  let erro: unknown = null
  for (const url of fontes(link)) {
    try {
      const ctrl = new AbortController()
      const t = window.setTimeout(() => ctrl.abort(), ESPERA_MS)
      const r = await fetch(`${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`, { cache: 'no-store', signal: ctrl.signal })
      window.clearTimeout(t)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const csv = await r.text()
      if (daPlanilha(csv)) return csv
      throw new Error('a aba lida não tem a coluna Produto')
    } catch (e) {
      erro = e
    }
  }
  throw erro ?? new Error('link da planilha não reconhecido')
}

/* ---------- contexto ---------- */

type Estoque = {
  produtos: Produto[]
  status: Status
  categorias: (Categoria & { total: number })[]
  porSlug: (slug: string) => Produto | undefined
}

const Contexto = createContext<Estoque | null>(null)

function lerCache(): string {
  try { return localStorage.getItem(CACHE) ?? '' } catch { return '' }
}

export function EstoqueProvider({ children }: { children: ReactNode }) {
  const [csv, setCsv] = useState(() => (planilhaLink ? lerCache() : ''))
  const [status, setStatus] = useState<Status>(() => (!planilhaLink ? 'base' : lerCache() ? 'planilha' : 'carregando'))

  useEffect(() => {
    if (!planilhaLink) return
    let vivo = true
    let ultima = 0
    const atualizar = () => {
      ultima = Date.now()
      baixar(planilhaLink)
        .then((novo) => {
          if (!vivo) return
          setCsv(novo)
          setStatus('planilha')
          try { localStorage.setItem(CACHE, novo) } catch { /* navegador sem armazenamento */ }
        })
        .catch((e) => {
          if (!vivo) return
          console.warn('Planilha da loja não lida:', e)
          setStatus((s) => (s === 'carregando' ? 'erro' : s))
        })
    }
    atualizar()
    /* Voltou para a aba depois de um tempo: confere a planilha de novo. */
    const visivel = () => { if (!document.hidden && Date.now() - ultima > 120000) atualizar() }
    document.addEventListener('visibilitychange', visivel)
    return () => { vivo = false; document.removeEventListener('visibilitychange', visivel) }
  }, [])

  const valor = useMemo<Estoque>(() => {
    const produtos = (csv && daPlanilha(csv)) || (planilhaLink ? BASE : BASE_EXEMPLO)
    const mapa = new Map(produtos.map((p) => [p.slug, p]))
    const lista: Categoria[] = [...CATEGORIAS]
    if (produtos.some((p) => p.categoria === 'outros')) lista.push({ id: 'outros', nome: 'Outras peças', texto: 'Peças avulsas da loja.' })
    const categorias = lista
      .map((cat) => ({ ...cat, total: produtos.filter((p) => p.categoria === cat.id).length }))
      .filter((cat) => cat.total > 0)
    return { produtos, status, categorias, porSlug: (s) => mapa.get(s) }
  }, [csv, status])

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useEstoque() {
  const v = useContext(Contexto)
  if (!v) throw new Error('useEstoque fora do EstoqueProvider')
  return v
}

import { useMemo, useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react'

/*
  Rotas da loja, sem biblioteca:
    /                    início
    /loja?linha=&q=      loja (linha = categoria, q = busca)
    /produto/:slug       peça
    /catalogo?pagina=    catálogo técnico para folhear
  A Vercel manda todo caminho para o index.html (vercel.json), então todo link funciona direto.
*/

export type Rota =
  | { nome: 'inicio' }
  | { nome: 'loja'; linha: string; busca: string }
  | { nome: 'produto'; slug: string }
  | { nome: 'catalogo'; pagina: number }
  | { nome: 'nada' }

const EVENTO = 'inova-rota'

function ler(caminho: string, busca: string): Rota {
  const p = caminho.replace(/\/+$/, '') || '/'
  const q = new URLSearchParams(busca)
  if (p === '/') return { nome: 'inicio' }
  if (p === '/loja') return { nome: 'loja', linha: q.get('linha') ?? '', busca: q.get('q') ?? '' }
  const m = /^\/produto\/([^/]+)$/.exec(p)
  if (m) return { nome: 'produto', slug: decodeURIComponent(m[1]) }
  if (p === '/catalogo') return { nome: 'catalogo', pagina: Math.max(0, (Number(q.get('pagina')) || 1) - 1) }
  return { nome: 'nada' }
}

const assinar = (avisar: () => void) => {
  window.addEventListener('popstate', avisar)
  window.addEventListener(EVENTO, avisar)
  return () => { window.removeEventListener('popstate', avisar); window.removeEventListener(EVENTO, avisar) }
}
const foto = () => location.pathname + location.search

export function useRota() {
  const atual = useSyncExternalStore(assinar, foto, foto)
  return useMemo(() => {
    const [caminho, busca = ''] = atual.split('?')
    return { rota: ler(caminho, busca ? `?${busca}` : ''), caminho: caminho.replace(/\/+$/, '') || '/' }
  }, [atual])
}

/* ---------- histórico com posição de rolagem ---------- */

const posicoes = new Map<string, number>()
let contador = 0
const chaveAtual = () => (history.state as { k?: string } | null)?.k ?? 'inicio'

/** Como chegamos na página atual: depois que a página troca, o App decide para onde rolar. */
export const chegada = { tipo: 'push' as 'push' | 'pop' | 'replace', hash: '' }

export function posicaoGuardada() {
  return posicoes.get(chaveAtual()) ?? 0
}

if (typeof window !== 'undefined') {
  if (!(history.state as { k?: string } | null)?.k) history.replaceState({ k: 'inicio' }, '')
  window.addEventListener('popstate', () => { chegada.tipo = 'pop'; chegada.hash = location.hash })
}

export function navegar(href: string, { substituir = false } = {}) {
  const url = new URL(href, location.href)
  if (url.origin !== location.origin) { location.href = href; return }
  const mesmo = url.pathname === location.pathname
  posicoes.set(chaveAtual(), window.scrollY)
  const estado = substituir ? history.state : { k: `r${Date.now()}-${++contador}` }
  if (substituir) history.replaceState(estado, '', url.pathname + url.search + url.hash)
  else history.pushState(estado, '', url.pathname + url.search + url.hash)
  chegada.tipo = substituir ? 'replace' : 'push'
  chegada.hash = url.hash
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: { mesmo, hash: url.hash } }))
}

export const ROTA_EVENTO = EVENTO

type PropsLink = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; substituir?: boolean }

/** Link interno: troca a página sem recarregar. Com Ctrl, Cmd ou botão do meio, abre normal. */
export function Link({ href, substituir, onClick, ...resto }: PropsLink) {
  const clicar = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (resto.target === '_blank') return
    e.preventDefault()
    navegar(href, { substituir })
  }
  return <a href={href} onClick={clicar} {...resto} />
}

export const linkProduto = (slug: string) => `/produto/${encodeURIComponent(slug)}`
export const linkLoja = (linha = '', busca = '') => {
  const q = new URLSearchParams()
  if (linha) q.set('linha', linha)
  if (busca) q.set('q', busca)
  const s = q.toString()
  return s ? `/loja?${s}` : '/loja'
}
export const linkCatalogo = (pagina?: number | null) => (pagina ? `/catalogo?pagina=${pagina + 1}` : '/catalogo')

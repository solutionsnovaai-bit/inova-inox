import type { Aco, Produto, Variante } from './tipos'

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
export const brl = (n: number) => moeda.format(n)

export const precoDe = (v: Variante | undefined, aco: Aco | null) => (!v ? null : aco === '316' ? v.preco316 : v.preco304)

/** Menor preço da peça (304 ou 316), para o "a partir de". */
export function menorPreco(p: Produto) {
  let menor: number | null = null
  for (const v of p.variantes) {
    for (const x of [v.preco304, p.material ? v.preco316 : null]) {
      if (x !== null && (menor === null || x < menor)) menor = x
    }
  }
  return menor
}

/** "1" a 6" · 7 medidas" */
export function resumoMedidas(p: Produto) {
  const m = p.variantes.map((v) => v.medida).filter(Boolean)
  if (m.length === 0) return 'Medida única'
  if (m.length === 1) return m[0]
  return `${m[0]} a ${m[m.length - 1]} · ${m.length} medidas`
}

export const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`

export const slugificar = (s: string) =>
  String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'peca'

/**
  Endereços para mostrar uma foto da peça, em ordem de tentativa.
  Link de compartilhar do Google Drive vira link direto de imagem (com uma reserva);
  link do Dropbox vira o arquivo cru; qualquer outro link de imagem passa como está.
*/
export function enderecosImagem(link: string): string[] {
  const t = link.trim()
  if (/(?:drive|docs)\.google\.com/i.test(t)) {
    const id = (/\/d\/([\w-]{20,})/.exec(t) || /[?&]id=([\w-]{20,})/.exec(t) || [])[1]
    if (id) return [`https://drive.google.com/thumbnail?id=${id}&sz=w1600`, `https://lh3.googleusercontent.com/d/${id}=w1600`]
  }
  if (/dropbox\.com/i.test(t)) {
    try { const u = new URL(t); u.searchParams.delete('dl'); u.searchParams.set('raw', '1'); return [u.toString()] } catch { /* link quebrado */ }
  }
  return [t]
}

/** CEP formatado enquanto digita: 00000-000. */
export function formatarCep(v: string) {
  const d = String(v ?? '').replace(/\D/g, '').slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

/** Telefone formatado enquanto digita: (11) 91234-5678. */
export function formatarTelefone(v: string) {
  const d = String(v ?? '').replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

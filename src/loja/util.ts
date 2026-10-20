import type { Aco, Produto, Variante } from './tipos'

/** Minúsculas, sem acento, só letras e números separados por um espaço. */
export const normalizar = (s: string) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

export const slugificar = (s: string) => normalizar(s).replace(/ /g, '-') || 'peca'

/** "38", "38,5", "R$ 1.234,56" e "1234.56" viram número. Vazio ou texto vira null. */
export function lerPreco(valor: string): number | null {
  let t = String(valor ?? '').trim().replace(/r\$|\s| /gi, '').replace(/[^\d.,]/g, '')
  if (!t) return null
  if (t.includes(',') && t.includes('.')) {
    t = t.lastIndexOf(',') > t.lastIndexOf('.') ? t.replace(/\./g, '').replace(',', '.') : t.replace(/,/g, '')
  } else if (t.includes(',')) {
    t = t.replace(',', '.')
  } else if (/^\d{1,3}(\.\d{3})+$/.test(t)) {
    t = t.replace(/\./g, '')
  }
  const n = Number(t)
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null
}

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
export const brl = (n: number) => moeda.format(n)

export const precoDe = (v: Variante | undefined, aco: Aco | null) =>
  !v ? null : aco === '316' ? v.preco316 : v.preco304

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

export const temPreco = (p: Produto) => menorPreco(p) !== null

/** "1" a 6" · 7 medidas" */
export function resumoMedidas(p: Produto) {
  const m = p.variantes.map((v) => v.medida).filter(Boolean)
  if (m.length === 0) return 'Medida única'
  if (m.length === 1) return m[0]
  return `${m[0]} a ${m[m.length - 1]} · ${m.length} medidas`
}

export const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`

/*
  Funções de texto e preço usadas pelo site, pelo painel e pelo servidor.
*/

/** Minúsculas, sem acento, só letras e números separados por um espaço. */
export const normalizar = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/** "38", "38,5", "R$ 1.234,56" e "1234.56" viram número. Vazio ou texto vira null. */
export function lerPreco(valor) {
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

/** Chave de uma medida de uma peça: "nome da peça|medida". */
export const chaveMedida = (nome, medida) => `${normalizar(nome)}|${String(medida ?? '').trim()}`

/** Acréscimo padrão do inox 316 sobre o 304, em %, até a Inova ajustar no painel. */
export const ACRESCIMO_316_PADRAO = 30

/** Preço do inox 316 a partir do 304 e do acréscimo em %. */
export const preco316 = (p304, acrescimo) =>
  p304 == null ? null : Math.round(p304 * (1 + (Number.isFinite(acrescimo) ? acrescimo : ACRESCIMO_316_PADRAO) / 100) * 100) / 100

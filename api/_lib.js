// api/_lib.js
//
// Utilitários das funções do servidor (frete, checkout e webhook).
// Os preços SEMPRE vêm da planilha do Google, lida aqui no servidor:
// nada que o navegador manda sobre preço é aceito.

import { FRETE, PLANILHA } from '../src/loja/ajustes.js'
import { chaveMedida, fontesPlanilha, tabelaDePrecos } from '../src/loja/planilha.js'

export const MAX_QTD_ITEM = 500
const MAX_TEXTO = 120

export function getOrigin(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers['x-forwarded-host'] || req.headers.host
  return `${proto}://${host}`
}

export function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string' && req.body.length) {
    try { return JSON.parse(req.body) } catch { return null }
  }
  return null
}

/** Só dígitos; precisa sobrar exatamente 8. */
export function sanitizeCep(raw) {
  const d = String(raw ?? '').replace(/\D/g, '')
  return d.length === 8 ? d : null
}

export const limpar = (v) => String(v ?? '').trim().slice(0, MAX_TEXTO)

export const linkPlanilha = () => (process.env.PLANILHA_URL || process.env.VITE_PLANILHA_URL || PLANILHA || '').trim()
export const cepOrigem = () => sanitizeCep(process.env.MELHORENVIO_ORIGEM_CEP || FRETE.origemCep)

export class ErroLoja extends Error {
  constructor(status, message) { super(message); this.status = status }
}

/** Lê a planilha do Google e devolve o mapa "peça|medida" → preços, peso e visibilidade. */
export async function carregarPrecos() {
  const link = linkPlanilha()
  if (!link) throw new ErroLoja(503, 'A loja ainda não está com os preços ligados. Finalize pelo WhatsApp.')
  for (const url of fontesPlanilha(link)) {
    try {
      const r = await fetch(`${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`, { cache: 'no-store' })
      if (!r.ok) continue
      const mapa = tabelaDePrecos(await r.text())
      if (mapa && mapa.size) return mapa
    } catch (e) {
      console.error('[planilha] falha ao ler:', e)
    }
  }
  throw new ErroLoja(502, 'Não foi possível conferir os preços agora. Tente de novo em instantes.')
}

/**
  Confere cada item da sacola contra a planilha.
  Cada item: { nome, medida, aco: '304' | '316' | null, opcoes: { [nome]: valor }, qtd }.
  Devolve os itens com preço unitário e peso conferidos.
*/
export function conferirItens(mapa, brutos, { exigirPreco = true } = {}) {
  const lista = Array.isArray(brutos) ? brutos : []
  if (!lista.length) throw new ErroLoja(400, 'Sacola vazia.')
  return lista.map((b) => {
    const linha = mapa.get(chaveMedida(b?.nome, b?.medida))
    if (!linha || !linha.visivel) throw new ErroLoja(400, `Peça indisponível: ${limpar(b?.nome)} ${limpar(b?.medida)}`.trim())
    const aco = b?.aco === '316' ? '316' : b?.aco === '304' ? '304' : null
    const preco = aco === '316' ? linha.p316 : linha.p304
    if (exigirPreco && preco === null) throw new ErroLoja(400, `${linha.nome} ${linha.medida} está sob consulta. Finalize pelo WhatsApp.`)
    const qtd = Math.min(MAX_QTD_ITEM, Math.max(1, Math.round(Number(b?.qtd) || 1)))
    const opcoes = b?.opcoes && typeof b.opcoes === 'object'
      ? Object.entries(b.opcoes).slice(0, 6).map(([k, v]) => `${limpar(k)} ${limpar(v)}`).join(' · ')
      : ''
    const titulo = [linha.nome, linha.medida, aco ? `Inox ${aco}` : '', opcoes].filter(Boolean).join(' · ')
    return { titulo, qtd, preco, pesoKg: (linha.pesoG ?? FRETE.pesoPadraoG) / 1000 }
  })
}

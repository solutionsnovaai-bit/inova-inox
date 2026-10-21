// api/_painel.js
//
// Dados do painel da loja (fotos e preços), guardados no armazenamento Blob da Vercel.
// Um único arquivo (painel/dados.json) com o estado atual. Cada gravação é uma operação
// só no Blob (as fotos, uma cada), para caber folgado na cota gratuita da Vercel.
//
// Na Vercel: Storage → Create → Blob (Public) → Connect ao projeto.
// A variável BLOB_READ_WRITE_TOKEN entra sozinha; não há mais nada para configurar.

import { get, put } from '@vercel/blob'
import { chaveMedida } from '../src/loja/precos.js'

const ARQUIVO = 'painel/dados.json'
const SLUG = /^[a-z0-9-]{1,90}$/
const FOTO = /^https:\/\/[a-z0-9.-]+\.blob\.vercel-storage\.com\/[^\s"'<>]+$/i

export const armazenamentoLigado = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)

/** Só aceita gravação vinda do próprio site (o painel), não de outras páginas. */
export function mesmoSite(req) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '')
  const de = String(req.headers.origin || req.headers.referer || '')
  if (!de) return true
  try { return new URL(de).host === host } catch { return false }
}

export const vazio = () => ({ versao: 1, atualizado: null, precos: {}, fotos: {} })

const preco = (v) => {
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) && n > 0 && n < 10_000_000 ? Math.round(n * 100) / 100 : null
}
const texto = (v, max) => String(v ?? '').trim().slice(0, max)

/** Aceita só o formato esperado: preços por peça e medida, fotos por peça (links do próprio Blob). */
export function normalizarDados(bruto) {
  const saida = vazio()
  saida.atualizado = typeof bruto?.atualizado === 'string' ? bruto.atualizado.slice(0, 40) : null
  const precos = bruto?.precos && typeof bruto.precos === 'object' ? bruto.precos : {}
  for (const [slug, peca] of Object.entries(precos).slice(0, 400)) {
    if (!SLUG.test(slug) || !peca || typeof peca !== 'object') continue
    const nome = texto(peca.nome, 140)
    const medidas = {}
    for (const [medida, v] of Object.entries(peca.medidas && typeof peca.medidas === 'object' ? peca.medidas : {}).slice(0, 80)) {
      const m = texto(medida, 40)
      const p304 = preco(v?.p304)
      const p316 = preco(v?.p316)
      if (m && (p304 !== null || p316 !== null)) medidas[m] = { p304, p316 }
    }
    if (nome && Object.keys(medidas).length) saida.precos[slug] = { nome, medidas }
  }
  const fotos = bruto?.fotos && typeof bruto.fotos === 'object' ? bruto.fotos : {}
  for (const [slug, lista] of Object.entries(fotos).slice(0, 400)) {
    if (!SLUG.test(slug) || !Array.isArray(lista)) continue
    const boas = [...new Set(lista.filter((u) => typeof u === 'string' && FOTO.test(u)))].slice(0, 12)
    if (boas.length) saida.fotos[slug] = boas
  }
  return saida
}

/** Estado atual do painel, ou null se ainda não há nada salvo (ou o armazenamento não está ligado). */
export async function lerPainel() {
  if (!armazenamentoLigado()) return null
  try {
    const r = await get(ARQUIVO, { access: 'public', useCache: false })
    if (!r || r.statusCode !== 200 || !r.stream) return null
    return normalizarDados(JSON.parse(await new Response(r.stream).text()))
  } catch (e) {
    if (e?.name !== 'BlobNotFoundError') console.error('[painel] leitura:', e)
    return null
  }
}

export async function salvarPainel(dados) {
  const corpo = JSON.stringify(dados)
  await put(ARQUIVO, corpo, { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json', cacheControlMaxAge: 60 })
}

export async function salvarFoto(slug, tipo, binario) {
  const ext = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' }[tipo]
  if (!SLUG.test(slug) || !ext) return null
  const r = await put(`fotos/${slug}.${ext}`, binario, { access: 'public', addRandomSuffix: true, contentType: tipo, cacheControlMaxAge: 31536000 })
  return r.url
}

/** Preços do painel como mapa "peça|medida" → linha, para conferir pedido e frete. */
export function precosDoPainel(dados) {
  const mapa = new Map()
  for (const peca of Object.values(dados?.precos ?? {})) {
    for (const [medida, v] of Object.entries(peca.medidas)) {
      mapa.set(chaveMedida(peca.nome, medida), { nome: peca.nome, medida, p304: v.p304, p316: v.p316, unidade: 'un', pesoG: null, visivel: true })
    }
  }
  return mapa
}

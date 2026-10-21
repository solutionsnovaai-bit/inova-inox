// api/painel.js
//
// GET  /api/painel                 fotos e preços do painel (o site lê daqui)
// GET  /api/painel?acao=abrir      estado atual sem cache + se o armazenamento está ligado
// POST /api/painel?acao=salvar     { precos, fotos } → grava uma nova versão
// POST /api/painel?acao=foto       { slug, tipo, base64 } → sobe a foto e devolve o link

import { readJsonBody } from './_lib.js'
import { armazenamentoLigado, lerPainel, mesmoSite, normalizarDados, salvarFoto, salvarPainel, vazio } from './_painel.js'

const MAX_FOTO = 3_000_000

export default async function handler(req, res) {
  const acao = String(req.query?.acao || '')
  try {
    if (req.method === 'GET' && !acao) {
      res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=120')
      return res.status(200).json((await lerPainel()) ?? vazio())
    }

    res.setHeader('Cache-Control', 'no-store')

    if (req.method === 'GET' && acao === 'abrir') {
      const ligado = armazenamentoLigado()
      return res.status(200).json({ autorizado: true, armazenamento: ligado, dados: (ligado && (await lerPainel())) || vazio() })
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST')
      return res.status(405).json({ erro: 'Método não permitido.' })
    }
    if (!mesmoSite(req)) return res.status(403).json({ erro: 'Use o painel do próprio site.' })
    if (!armazenamentoLigado()) return res.status(503).json({ erro: 'Falta ligar o armazenamento na Vercel (Storage → Blob).' })
    const corpo = readJsonBody(req)

    if (acao === 'salvar') {
      const dados = normalizarDados({ precos: corpo?.precos, fotos: corpo?.fotos, atualizado: new Date().toISOString() })
      await salvarPainel(dados)
      return res.status(200).json({ ok: true, dados })
    }

    if (acao === 'foto') {
      const binario = Buffer.from(String(corpo?.base64 || ''), 'base64')
      if (!binario.length) return res.status(400).json({ erro: 'Foto vazia.' })
      if (binario.length > MAX_FOTO) return res.status(413).json({ erro: 'Foto grande demais.' })
      const url = await salvarFoto(String(corpo?.slug || ''), String(corpo?.tipo || ''), binario)
      if (!url) return res.status(400).json({ erro: 'Peça ou formato de foto inválido.' })
      return res.status(200).json({ url })
    }

    return res.status(400).json({ erro: 'Ação desconhecida.' })
  } catch (e) {
    console.error('[painel]', e)
    return res.status(500).json({ erro: 'Não foi possível concluir agora. Tente de novo em instantes.' })
  }
}

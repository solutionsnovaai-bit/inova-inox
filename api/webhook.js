// api/webhook.js
//
// Notificações do Mercado Pago. Busca o pagamento pelo id e registra no log da Vercel
// (status, valor, cliente, endereço e frete). Sem banco de dados: o painel do Mercado Pago
// e este log são a fonte do pedido.

import { readJsonBody } from './_lib.js'

const MP_PAYMENTS_URL = 'https://api.mercadopago.com/v1/payments'

function lerNotificacao(req, body) {
  if (body?.data?.id) return { tipo: body.type ?? body.topic ?? null, id: String(body.data.id) }
  const q = req.query ?? {}
  const id = q['data.id'] ?? q.id ?? null
  return { tipo: q.type ?? q.topic ?? null, id: id ? String(id) : null }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Método não permitido.' })
  }
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) return res.status(500).json({ error: 'Webhook indisponível.' })

  const { tipo, id } = lerNotificacao(req, readJsonBody(req))
  if (tipo && tipo !== 'payment') return res.status(200).json({ received: true, ignored: true })
  if (!id) return res.status(200).json({ received: true })

  try {
    const mp = await fetch(`${MP_PAYMENTS_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    if (mp.status === 404) return res.status(200).json({ received: true, found: false })
    const p = await mp.json().catch(() => null)
    if (!mp.ok || !p) {
      console.error('[webhook] falha ao buscar o pagamento:', mp.status, p)
      return res.status(502).json({ error: 'Falha ao consultar o pagamento.' })
    }
    const m = p.metadata ?? {}
    console.log('[webhook] pagamento:', JSON.stringify({
      id: p.id,
      status: p.status,
      detalhe: p.status_detail,
      valor: p.transaction_amount,
      pedido: p.external_reference,
      cliente: m.cliente_nome,
      telefone: m.cliente_telefone,
      documento: m.cliente_documento,
      endereco: [m.endereco_rua, m.endereco_numero, m.endereco_complemento, m.endereco_bairro, m.endereco_cidade].filter(Boolean).join(', '),
      cep: m.cep_destino,
      frete: [m.frete_transportadora, m.frete_servico].filter(Boolean).join(' '),
      email: p.payer?.email,
      aprovado_em: p.date_approved,
    }))
    return res.status(200).json({ received: true, status: p.status })
  } catch (e) {
    console.error('[webhook] erro inesperado:', e)
    return res.status(502).json({ error: 'Falha ao processar a notificação.' })
  }
}

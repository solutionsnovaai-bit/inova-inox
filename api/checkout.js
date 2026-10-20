// api/checkout.js
//
// GET:  diz ao site o que já está ligado ({ pagamento, frete }), para a sacola
//       mostrar "Finalizar compra" (Mercado Pago) ou "Enviar pedido pelo WhatsApp".
// POST: recebe a sacola, o frete escolhido e os dados de entrega, RECALCULA tudo
//       no servidor (preços na planilha, frete recotado no Melhor Envio) e cria a
//       preferência no Mercado Pago (Checkout Pro). Devolve init_point para o site
//       redirecionar o cliente.
//
// Variáveis de ambiente (Vercel):
//   MERCADOPAGO_ACCESS_TOKEN   Access Token de produção da conta Mercado Pago da Inova
//   (mais as do frete, em api/frete.js, e o link da planilha)
//
// Sem banco de dados: pra quem e pra onde enviar vai no metadata do pagamento,
// visível no painel do Mercado Pago, e no log do webhook.

import { SITE } from '../src/loja/ajustes.js'
import { carregarPrecos, cepOrigem, conferirItens, ErroLoja, getOrigin, limpar, linkPlanilha, readJsonBody, sanitizeCep } from './_lib.js'
import { quoteShipping } from './frete.js'

const MP_PREFERENCES_URL = 'https://api.mercadopago.com/checkout/preferences'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'GET') {
    return res.status(200).json({
      pagamento: Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN && linkPlanilha()),
      frete: Boolean(process.env.MELHORENVIO_TOKEN && cepOrigem() && linkPlanilha()),
    })
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Método não permitido.' })
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) {
    console.error('[checkout] MERCADOPAGO_ACCESS_TOKEN não configurado.')
    return res.status(503).json({ error: 'O pagamento online ainda não está ligado. Finalize pelo WhatsApp.' })
  }

  const body = readJsonBody(req)
  const destino = sanitizeCep(body?.to)
  const opcaoFrete = body?.shippingOptionId
  if (!destino || opcaoFrete === undefined || opcaoFrete === null) {
    return res.status(400).json({ error: 'Calcule e escolha o frete antes de continuar.' })
  }

  const nome = limpar(body?.customerName)
  const telefone = limpar(body?.customerPhone).replace(/\D/g, '')
  const documento = limpar(body?.document).replace(/\D/g, '')
  const rua = limpar(body?.street)
  const numero = limpar(body?.streetNumber)
  const complemento = limpar(body?.complement)
  const bairro = limpar(body?.neighborhood)
  const cidade = limpar(body?.city)
  if (nome.length < 3 || telefone.length < 10 || !rua || !numero || !bairro) {
    return res.status(400).json({ error: 'Preencha os dados de entrega antes de continuar.' })
  }

  try {
    const mapa = await carregarPrecos()
    const itens = conferirItens(mapa, body?.items, { exigirPreco: true })
    const mpItems = itens.map((it, i) => ({
      id: `peca-${i + 1}`,
      title: it.titulo.slice(0, 250),
      quantity: it.qtd,
      unit_price: it.preco,
      currency_id: 'BRL',
    }))

    const { options } = await quoteShipping({ to: destino, items: body?.items, mapa })
    const frete = options.find((o) => String(o.id) === String(opcaoFrete))
    if (!frete) return res.status(409).json({ error: 'Esse frete não está mais disponível. Calcule de novo.' })
    mpItems.push({ id: `frete-${frete.id}`, title: `Frete · ${frete.company} ${frete.service}`.trim(), quantity: 1, unit_price: frete.price, currency_id: 'BRL' })

    const origin = getOrigin(req)
    const pedido = `inova_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const preference = {
      items: mpItems,
      external_reference: pedido,
      statement_descriptor: 'INOVA INOX',
      back_urls: {
        success: `${origin}/?pedido=aprovado`,
        pending: `${origin}/?pedido=pendente`,
        failure: `${origin}/?pedido=recusado`,
      },
      ...(origin.startsWith('https://') ? { auto_return: 'approved' } : {}),
      metadata: {
        cep_destino: destino,
        frete_servico: frete.service,
        frete_transportadora: frete.company,
        cliente_nome: nome,
        cliente_telefone: telefone,
        cliente_documento: documento,
        endereco_rua: rua,
        endereco_numero: numero,
        endereco_complemento: complemento,
        endereco_bairro: bairro,
        endereco_cidade: cidade,
        loja: SITE.nome,
      },
      notification_url: `${origin}/api/webhook`,
    }

    const mp = await fetch(MP_PREFERENCES_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': pedido },
      body: JSON.stringify(preference),
    })
    const data = await mp.json().catch(() => null)
    if (!mp.ok || !data?.init_point) {
      console.error('[checkout] Mercado Pago recusou a preferência:', mp.status, data)
      return res.status(502).json({ error: 'Não foi possível iniciar o pagamento.' })
    }
    return res.status(200).json({ init_point: data.init_point, id: data.id, order_id: pedido })
  } catch (e) {
    if (e instanceof ErroLoja) return res.status(e.status).json({ error: e.message })
    console.error('[checkout] erro inesperado:', e)
    return res.status(502).json({ error: 'Não foi possível iniciar o pagamento.' })
  }
}

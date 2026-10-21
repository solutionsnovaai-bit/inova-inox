// api/frete.js
//
// Cota o frete no Melhor Envio. Recebe o CEP de destino e os itens da sacola,
// confere as peças nos preços do painel (peso padrão de cada peça em ajustes.js)
// vazia, usa o peso padrão de src/loja/ajustes.js) e devolve as opções reais
// (transportadora, serviço, preço e prazo).
//
// Variáveis de ambiente (Vercel):
//   MELHORENVIO_TOKEN        token pessoal do Melhor Envio (escopo shipping-calculate)
//   MELHORENVIO_ORIGEM_CEP   CEP de onde as peças saem (ou FRETE.origemCep em ajustes.js)
//   MELHORENVIO_SANDBOX      "true" para usar o ambiente de testes
//
// A função quoteShipping() também é usada pelo checkout, para recotar antes de cobrar.

import { FRETE } from '../src/loja/ajustes.js'
import { carregarPrecos, cepOrigem, conferirItens, ErroLoja, readJsonBody, sanitizeCep } from './_lib.js'

const arred = (n, casas) => Math.round(n * 10 ** casas) / 10 ** casas

export async function quoteShipping({ to, items, mapa }) {
  const token = process.env.MELHORENVIO_TOKEN
  const origem = cepOrigem()
  if (!token || !origem) {
    console.error('[frete] MELHORENVIO_TOKEN ou CEP de origem não configurado.')
    throw new ErroLoja(503, 'O cálculo de frete ainda não está ligado. O frete é combinado no WhatsApp.')
  }
  const destino = sanitizeCep(to)
  if (!destino) throw new ErroLoja(400, 'CEP de destino inválido.')

  const precos = mapa ?? await carregarPrecos()
  const conferidos = conferirItens(precos, items, { exigirPreco: false })
  const { largura, altura, comprimento } = FRETE.caixa

  const payload = {
    from: { postal_code: origem },
    to: { postal_code: destino },
    products: conferidos.map((it, i) => ({
      id: String(i + 1),
      width: largura,
      height: altura,
      length: comprimento,
      weight: arred(it.pesoKg, 3),
      insurance_value: arred(it.preco ?? 0, 2),
      quantity: it.qtd,
    })),
    options: { receipt: false, own_hand: false },
  }

  const base = process.env.MELHORENVIO_SANDBOX === 'true' ? 'https://sandbox.melhorenvio.com.br' : 'https://www.melhorenvio.com.br'
  let r, data
  try {
    r = await fetch(`${base}/api/v2/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': process.env.MELHORENVIO_USER_AGENT || 'Inova Inox - loja (site oficial)',
      },
      body: JSON.stringify(payload),
    })
    data = await r.json().catch(() => null)
  } catch (e) {
    console.error('[frete] falha ao chamar o Melhor Envio:', e)
    throw new ErroLoja(502, 'Não foi possível calcular o frete agora.')
  }
  if (!r.ok || !Array.isArray(data)) {
    console.error('[frete] Melhor Envio recusou a cotação:', r.status, data)
    throw new ErroLoja(502, 'Não foi possível calcular o frete agora.')
  }

  const options = data
    .filter((q) => !q.error && (q.custom_price ?? q.price))
    .map((q) => ({
      id: q.id,
      service: q.name,
      company: q.company?.name ?? '',
      price: arred(Number(q.custom_price ?? q.price), 2),
      deliveryDays: q.custom_delivery_time ?? q.delivery_time ?? null,
    }))
    .sort((a, b) => a.price - b.price)

  return { options }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método não permitido.' })
  }
  const body = readJsonBody(req)
  try {
    return res.status(200).json(await quoteShipping({ to: body?.to, items: body?.items }))
  } catch (e) {
    if (e instanceof ErroLoja) return res.status(e.status).json({ error: e.message })
    console.error('[frete] erro inesperado:', e)
    return res.status(500).json({ error: 'Não foi possível calcular o frete agora.' })
  }
}

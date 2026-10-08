/**
 * Dados da empresa. Tudo que aparece no site sobre contato e links sai daqui.
 * Para trocar telefone ou textos de SEO, edite só este arquivo.
 */
const limpar = (valor: string | undefined) => (valor ?? '').trim().replace(/\/$/, '')

export const site = {
  nome: 'Inova Inox',
  assinatura: 'Linha sanitária, usinagem, soldagem e polimento',
  descricao:
    'Linha sanitária em inox 304 e 316: conexões Tri-Clamp, SMS, RJT, DIN, OD, BSP e NPT, curvas, tês, reduções, espigões, niples, uniões e abraçadeiras. Peças sob desenho ou amostra, com usinagem, soldagem e polimento.',
  titulo: 'Inova Inox | Linha sanitária e conexões em inox 304 e 316',

  /** WhatsApp. Só dígitos, com DDI 55. */
  whatsapp: '5511981987909',
  whatsappExibicao: '(11) 98198-7909',

  /** Telefone fixo. Só dígitos, com DDI 55. */
  telefone: '551127051775',
  telefoneExibicao: '(11) 2705-1775',

  url: limpar(import.meta.env.VITE_SITE_URL),
} as const

export const cores = {
  azul: '#0471E5',
  azulClaro: '#4FA3FF',
  faisca: '#FF8A1F',
  whatsapp: '#25D366',
} as const

/** Monta o link do WhatsApp já com a mensagem preenchida. */
export function waLink(mensagem?: string) {
  const base = `https://wa.me/${site.whatsapp}`
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base
}

/** Link para ligar no telefone fixo. */
export const telLink = `tel:+${site.telefone}`

export const mensagens = {
  geral: 'Olá! Vim pelo site da Inova Inox e quero um orçamento.',
  linhaSanitaria: 'Olá! Vim pelo site da Inova Inox e quero cotar conexões da linha sanitária em inox.',
  sobDesenho: 'Olá! Vim pelo site da Inova Inox e preciso de uma peça em inox sob desenho ou amostra.',
  identificar:
    'Olá! Vim pelo site da Inova Inox. Vou mandar a foto de uma conexão para vocês identificarem o padrão e o diâmetro.',
  usinagem: 'Olá! Vim pelo site da Inova Inox e quero um orçamento de usinagem em inox.',
  polimento: 'Olá! Vim pelo site da Inova Inox e quero um orçamento de polimento e acabamento em inox.',
  soldagem: 'Olá! Vim pelo site da Inova Inox e quero um orçamento de soldagem em inox.',
} as const

/** Mensagem pronta para cotar uma peça específica da linha sanitária. */
export const mensagemPeca = (peca: string) =>
  `Olá! Vim pelo site da Inova Inox e quero cotar ${peca} em inox (linha sanitária).`

export type DadosOrcamento = {
  nome: string
  servico: string
  quantidade: string
  detalhes: string
}

/** Texto enviado pelo formulário de orçamento. Linhas vazias ficam de fora. */
export function montarOrcamento({ nome, servico, quantidade, detalhes }: DadosOrcamento) {
  const linhas = [
    nome.trim() ? `Olá! Meu nome é ${nome.trim()}.` : 'Olá!',
    `Quero um orçamento de ${servico.toLowerCase()} em inox.`,
    quantidade.trim() ? `Quantidade: ${quantidade.trim()}` : '',
    detalhes.trim() ? `Detalhes: ${detalhes.trim()}` : '',
    'Posso enviar foto, desenho ou amostra por aqui.',
  ]
  return linhas.filter(Boolean).join('\n')
}

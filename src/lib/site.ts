/**
 * Dados da empresa. Tudo que aparece no site sobre contato e links sai daqui.
 * Para trocar telefone, link da loja ou textos de SEO, edite só este arquivo.
 */
const limpar = (valor: string | undefined) => (valor ?? '').trim().replace(/\/$/, '')

export const site = {
  nome: 'Inova Inox',
  assinatura: 'Usinagem, polimento e solda',
  descricao:
    'Fabricante de peças em aço inox. Compre pelo Mercado Livre ou peça orçamento de usinagem, polimento e solda pelo WhatsApp.',
  titulo: 'Inova Inox | Peças em aço inox, usinagem, polimento e solda',

  /** Só dígitos, com DDI 55. */
  whatsapp: '5511988895645',
  whatsappExibicao: '(11) 98889-5645',

  /**
   * Link da loja no Mercado Livre. Defina VITE_ML_URL na Vercel
   * (ou troque o endereço abaixo) pelo link da página do vendedor.
   */
  mercadoLivre: limpar(import.meta.env.VITE_ML_URL) || 'https://lista.mercadolivre.com.br/inova-inox',

  url: limpar(import.meta.env.VITE_SITE_URL),
} as const

export const cores = {
  azul: '#0471E5',
  azulClaro: '#4FA3FF',
  faisca: '#FF8A1F',
  mercadoLivre: '#FFE600',
  whatsapp: '#25D366',
} as const

/** Monta o link do WhatsApp já com a mensagem preenchida. */
export function waLink(mensagem?: string) {
  const base = `https://wa.me/${site.whatsapp}`
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base
}

export const mensagens = {
  geral: 'Olá! Vim pelo site da Inova Inox e quero um orçamento.',
  sobMedida: 'Olá! Vim pelo site da Inova Inox e preciso de uma peça em inox sob medida.',
  usinagem: 'Olá! Vim pelo site da Inova Inox e quero um orçamento de usinagem em inox.',
  polimento: 'Olá! Vim pelo site da Inova Inox e quero um orçamento de polimento em inox.',
  solda: 'Olá! Vim pelo site da Inova Inox e quero um orçamento de solda em inox.',
  duvidaAnuncio: 'Olá! Vi um anúncio da Inova Inox no Mercado Livre e fiquei com uma dúvida.',
} as const

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
    'Posso enviar foto ou desenho por aqui.',
  ]
  return linhas.filter(Boolean).join('\n')
}

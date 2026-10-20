/*
  Configuração da loja. Tudo que muda sem mexer no resto do site fica aqui.

  PLANILHA: cole o link da planilha do Google (o da barra de endereço serve),
  compartilhada como "Qualquer pessoa com o link: Leitor". A loja lê a aba "Produtos".
  Com o campo vazio, a loja mostra o catálogo inteiro com preço sob consulta.
  Também dá para definir VITE_PLANILHA_URL nas variáveis de ambiente da Vercel.
*/
const PLANILHA = ''

export const planilhaLink = (PLANILHA || import.meta.env.VITE_PLANILHA_URL || '').trim()

export const site = {
  nome: 'Inova Inox',
  assinatura: 'Usinagem · Polimento · Solda',
  /** WhatsApp: só dígitos, com 55 na frente. */
  whatsapp: '5511981987909',
  whatsappVisivel: '(11) 98198-7909',
  telefone: '551127051775',
  telefoneVisivel: '(11) 2705-1775',
} as const

export const telLink = `tel:+${site.telefone}`

export function waLink(texto?: string) {
  const base = `https://wa.me/${site.whatsapp}`
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base
}

export const mensagens = {
  geral: 'Olá! Vim pelo site da Inova Inox e quero falar com vocês.',
  cotar: (peca: string) => `Olá! Vim pelo site da Inova Inox e quero cotar: ${peca}.`,
  servico: (servico: string) => `Olá! Vim pelo site da Inova Inox e quero um orçamento de ${servico.toLowerCase()} em inox.`,
  identificar:
    'Olá! Vim pelo site da Inova Inox. Vou mandar a foto de uma conexão para vocês identificarem o padrão e a medida.',
  catalogo: (pagina: number) => `Olá! Vi a página ${pagina} do catálogo técnico no site da Inova Inox e quero cotar uma peça.`,
} as const

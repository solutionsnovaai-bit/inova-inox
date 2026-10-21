/*
  Ajustes da loja Inova Inox. Este arquivo é lido pelo site e pelas funções do servidor (pasta api).

  FRETE: CEP de onde as peças saem e a caixa usada quando a peça não tem medida de embalagem.
  O CEP também pode ir na variável MELHORENVIO_ORIGEM_CEP da Vercel.
*/
export const SITE = {
  nome: 'Inova Inox',
  assinatura: 'Usinagem · Polimento · Solda',
  /** WhatsApp: só dígitos, com 55 na frente. */
  whatsapp: '5511981987909',
  whatsappVisivel: '(11) 98198-7909',
  telefone: '551127051775',
  telefoneVisivel: '(11) 2705-1775',
}

export const FRETE = {
  origemCep: '',
  /** Peso de cada peça usado no cálculo do frete. */
  pesoPadraoG: 300,
  /** Embalagem de cada peça, em cm, para a cotação do Melhor Envio. */
  caixa: { largura: 15, altura: 10, comprimento: 20 },
}

/** Enquanto o painel não tem nenhum preço, as peças mostram este preço de exemplo (só para visualizar a loja). */
export const PRECO_EXEMPLO = 300

/*
  Ajustes da loja Inova Inox. Este arquivo é lido pelo site e pelas funções do servidor (pasta api).

  PLANILHA: link da planilha do Google (o da barra de endereço serve), compartilhada como
  "Qualquer pessoa com o link: Leitor". Também pode ir na variável VITE_PLANILHA_URL da Vercel.

  FRETE: CEP de onde as peças saem e a caixa usada quando a peça não tem medida de embalagem.
  O CEP também pode ir na variável MELHORENVIO_ORIGEM_CEP da Vercel.
*/
export const PLANILHA = ''

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
  /** Peso de cada peça quando a coluna "Peso (g)" da planilha está vazia. */
  pesoPadraoG: 300,
  /** Embalagem de cada peça, em cm, para a cotação do Melhor Envio. */
  caixa: { largura: 15, altura: 10, comprimento: 20 },
}

/** Sem planilha ligada, todas as peças mostram este preço de exemplo (só para visualizar a loja). */
export const PRECO_EXEMPLO = 300

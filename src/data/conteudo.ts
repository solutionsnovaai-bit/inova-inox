import { mensagens } from '../lib/site'

export const navegacao = [
  { rotulo: 'Peças', destino: '#pecas' },
  { rotulo: 'Serviços', destino: '#servicos' },
  { rotulo: 'Polimento', destino: '#polimento' },
  { rotulo: 'Guia do inox', destino: '#guia' },
  { rotulo: 'Dúvidas', destino: '#duvidas' },
] as const

export const passosCompra = [
  {
    titulo: 'Abra a loja',
    texto: 'O botão amarelo leva direto aos anúncios da Inova Inox no Mercado Livre.',
  },
  {
    titulo: 'Escolha a peça',
    texto: 'Confira medidas, material e fotos no anúncio. Ficou em dúvida? Pergunte por lá ou chame no WhatsApp.',
  },
  {
    titulo: 'Pague e acompanhe',
    texto: 'O pagamento e o rastreio da entrega ficam dentro do próprio Mercado Livre.',
  },
] as const

export type Peca = {
  id: 'torneada' | 'fresada' | 'soldada' | 'polida'
  nome: string
  texto: string
  processo: string
}

/**
 * Famílias de peças, descritas pelo processo de fabricação.
 * Quando o catálogo real estiver definido, troque nomes e textos aqui.
 */
export const pecas: Peca[] = [
  {
    id: 'torneada',
    nome: 'Peças torneadas',
    texto: 'Formas cilíndricas feitas no torno, com diâmetros e encaixes na medida.',
    processo: 'Usinagem',
  },
  {
    id: 'fresada',
    nome: 'Peças fresadas',
    texto: 'Faces planas, rasgos e furações abertos no inox maciço.',
    processo: 'Usinagem',
  },
  {
    id: 'soldada',
    nome: 'Conjuntos soldados',
    texto: 'Partes de inox unidas por solda e entregues como uma peça só.',
    processo: 'Solda',
  },
  {
    id: 'polida',
    nome: 'Peças polidas',
    texto: 'Acabamento do escovado ao espelhado, para peça que fica à vista.',
    processo: 'Polimento',
  },
]

export type Servico = {
  id: 'usinagem' | 'polimento' | 'solda'
  nome: string
  chamada: string
  texto: string
  pontos: string[]
  mensagem: string
  legendaDesenho: string
  /** Número da cena do banco de imagens que ilustra o serviço. */
  cena: string
}

export const servicos: Servico[] = [
  {
    id: 'usinagem',
    nome: 'Usinagem',
    chamada: 'O inox maciço vira peça.',
    texto:
      'A usinagem tira material até sobrar exatamente a forma do desenho. É o processo certo quando o encaixe depende de medida.',
    pontos: [
      'Peças a partir de desenho, foto ou amostra',
      'Diâmetros, roscas, rasgos e furações',
      'Uma peça só ou um lote',
    ],
    mensagem: mensagens.usinagem,
    legendaDesenho: 'Perfil de uma peça torneada com as cotas de diâmetro e comprimento',
    cena: '01',
  },
  {
    id: 'polimento',
    nome: 'Polimento',
    chamada: 'Do fosco ao espelho.',
    texto:
      'O polimento vai alisando a superfície, lixa após lixa, até o inox refletir. Peça lisa também junta menos sujeira e limpa mais fácil.',
    pontos: [
      'Acabamento escovado, acetinado ou espelhado',
      'Peças novas ou peças que perderam o brilho',
      'Remoção de riscos e marcas de solda',
    ],
    mensagem: mensagens.polimento,
    legendaDesenho: 'Perfil da superfície antes e depois do polimento',
    cena: '04',
  },
  {
    id: 'solda',
    nome: 'Solda',
    chamada: 'Duas peças viram uma.',
    texto:
      'A solda em inox pede calor controlado para unir sem empenar e sem manchar. Depois, o cordão pode ser lixado e polido até sumir.',
    pontos: [
      'União de tubos, chapas e perfis de inox',
      'Reparo de peças trincadas ou quebradas',
      'Acabamento do cordão no padrão da peça',
    ],
    mensagem: mensagens.solda,
    legendaDesenho: 'Junta soldada com o cordão e o símbolo de solda do desenho técnico',
    cena: '02',
  },
]

export const processo = [
  {
    titulo: 'Mande o que você tem',
    texto: 'Desenho, foto, amostra ou só as medidas. Tudo pelo WhatsApp.',
  },
  {
    titulo: 'Receba o orçamento',
    texto: 'A gente avalia o material, o processo e o acabamento e responde com valor e prazo.',
  },
  {
    titulo: 'Fabricação',
    texto: 'Usinagem, solda e polimento, na ordem que a peça pede.',
  },
  {
    titulo: 'Entrega',
    texto: 'Retirada ou envio, do jeito combinado no fechamento.',
  },
] as const

/** Informações gerais sobre os tipos mais comuns de aço inox. */
export const ligas = [
  {
    nome: '304',
    apelido: 'O mais usado',
    composicao: 'Cerca de 18% de cromo e 8% de níquel',
    ima: 'Em geral não gruda',
    uso: 'Cozinhas, alimentos, corrimãos e uso interno em geral',
  },
  {
    nome: '316',
    apelido: 'Para ambiente agressivo',
    composicao: 'Como o 304, com molibdênio a mais',
    ima: 'Em geral não gruda',
    uso: 'Litoral, piscina, produtos químicos e áreas com sal',
  },
  {
    nome: '430',
    apelido: 'O mais econômico',
    composicao: 'Cromo sem níquel',
    ima: 'Gruda',
    uso: 'Ambientes secos e peças de acabamento',
  },
] as const

export const criterios = [
  { chave: 'composicao', rotulo: 'Do que é feito' },
  { chave: 'ima', rotulo: 'Teste do ímã' },
  { chave: 'uso', rotulo: 'Onde vai bem' },
] as const

export const notas = [
  {
    titulo: 'Por que o inox não enferruja',
    texto:
      'O cromo do aço reage com o ar e forma uma película invisível que protege o metal. Se a peça risca, essa película se refaz sozinha.',
  },
  {
    titulo: 'Por que a solda escurece',
    texto:
      'O calor da solda colore o inox e enfraquece a proteção naquele ponto. Limpeza e polimento devolvem a cor e a resistência.',
  },
  {
    titulo: 'Como limpar',
    texto:
      'Água, sabão neutro e pano macio, no sentido do escovado. Palha de aço comum e água sanitária mancham o inox.',
  },
] as const

export const perguntas = [
  {
    pergunta: 'Como eu compro as peças?',
    resposta:
      'Pelo Mercado Livre. Os botões amarelos do site levam aos anúncios da Inova Inox, e a compra, o pagamento e a entrega acontecem por lá.',
  },
  {
    pergunta: 'Não achei a medida que preciso. E agora?',
    resposta:
      'Mande a medida, uma foto ou o desenho pelo WhatsApp. A gente avalia e responde se dá para fabricar e por quanto.',
  },
  {
    pergunta: 'Vocês fazem só uma peça?',
    resposta: 'Depende da peça. Mande os detalhes pelo WhatsApp que a gente avalia, seja uma unidade ou um lote.',
  },
  {
    pergunta: 'Posso levar uma peça minha para soldar ou polir?',
    resposta:
      'Pode. Solda e polimento são serviços que também fazemos em peças do cliente. Envie fotos pelo WhatsApp para a gente avaliar antes.',
  },
  {
    pergunta: 'Qual é o prazo?',
    resposta:
      'Nas compras pelo Mercado Livre, o prazo de entrega aparece no anúncio. Em serviço e peça sob medida, o prazo vem junto com o orçamento.',
  },
  {
    pergunta: 'O que preciso mandar para pedir um orçamento?',
    resposta:
      'O que você tiver: desenho, foto da peça, medidas principais, quantidade e onde a peça vai ser usada. Quanto mais detalhe, mais rápido sai o orçamento.',
  },
] as const

/** Textos da seção de fotos. As imagens em si são lidas de src/assets/galeria. */
export const textoGaleria = {
  titulo: ['Inox de perto,', 'do cavaco ao brilho.'],
  apoio: 'Torno, fresa, solda e polimento. É assim que uma barra de inox vira peça.',
} as const

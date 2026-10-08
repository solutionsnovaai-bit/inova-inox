import { mensagemPeca, mensagens } from '../lib/site'

export const navegacao = [
  { rotulo: 'Linha sanitária', destino: '#linha-sanitaria' },
  { rotulo: 'Conexões', destino: '#conexoes' },
  { rotulo: 'Serviços', destino: '#servicos' },
  { rotulo: 'Oficina', destino: '#oficina' },
  { rotulo: 'Dúvidas', destino: '#duvidas' },
] as const

/** Ligas de inox em que a linha sanitária é fornecida. */
export const materiais = ['304', '316'] as const

/** Padrões de conexão da linha sanitária, com uma explicação curta de cada um. */
export const normas = [
  { nome: 'Tri-Clamp', texto: 'Engate rápido por abraçadeira, com anel de vedação entre as férulas.' },
  { nome: 'SMS', texto: 'Padrão sueco de união roscada, com porca e anel de vedação.' },
  { nome: 'RJT', texto: 'Padrão inglês de união roscada, com porca e anel de vedação.' },
  { nome: 'DIN', texto: 'Padrão alemão de união roscada, a DIN 11851.' },
  { nome: 'OD', texto: 'Pontas medidas pelo diâmetro externo do tubo, para solda.' },
  { nome: 'BSP', texto: 'Rosca de padrão britânico.' },
  { nome: 'NPT', texto: 'Rosca cônica de padrão americano.' },
] as const

export type IdPeca =
  | 'curva'
  | 'te'
  | 'reducao'
  | 'espigao'
  | 'niple'
  | 'uniao'
  | 'abracadeira'
  | 'sob-desenho'

export type Peca = {
  id: IdPeca
  nome: string
  texto: string
  /** Mensagem que abre no WhatsApp quando o cartão é tocado. */
  mensagem: string
}

/** Peças da linha sanitária. Cada cartão abre o WhatsApp já com a peça na mensagem. */
export const pecas: Peca[] = [
  {
    id: 'curva',
    nome: 'Curvas',
    texto: 'Mudam a direção da linha, com pontas para solda ou já com conexão.',
    mensagem: mensagemPeca('curvas'),
  },
  {
    id: 'te',
    nome: 'Tês',
    texto: 'Abrem uma derivação na linha, com saídas do mesmo diâmetro ou reduzidas.',
    mensagem: mensagemPeca('tês'),
  },
  {
    id: 'reducao',
    nome: 'Reduções',
    texto: 'Ligam tubos e conexões de diâmetros diferentes.',
    mensagem: mensagemPeca('reduções'),
  },
  {
    id: 'espigao',
    nome: 'Espigões',
    texto: 'Ponta serrilhada para prender mangueira na linha.',
    mensagem: mensagemPeca('espigões'),
  },
  {
    id: 'niple',
    nome: 'Niples',
    texto: 'Pontas roscadas para ligar a linha a peças e equipamentos com rosca.',
    mensagem: mensagemPeca('niples'),
  },
  {
    id: 'uniao',
    nome: 'Uniões',
    texto: 'Porca, macho e vedação para montar e desmontar a linha.',
    mensagem: mensagemPeca('uniões'),
  },
  {
    id: 'abracadeira',
    nome: 'Abraçadeiras',
    texto: 'Fecham o engate Tri-Clamp entre duas férulas.',
    mensagem: mensagemPeca('abraçadeiras'),
  },
  {
    id: 'sob-desenho',
    nome: 'Sob desenho ou amostra',
    texto: 'A peça que não é de linha, fabricada pela medida que você mandar.',
    mensagem: mensagens.sobDesenho,
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
  /** Número da foto em src/assets/cenas que ilustra o serviço. */
  cena: string
}

export const servicos: Servico[] = [
  {
    id: 'usinagem',
    nome: 'Usinagem',
    chamada: 'Do tarugo à peça na medida.',
    texto:
      'Torno e fresa tiram material até sobrar exatamente a forma do desenho. É o processo certo quando a vedação e o encaixe dependem de medida.',
    pontos: [
      'Peças a partir de desenho ou amostra',
      'Roscas, férulas, encaixes e furações',
      'Uma peça só ou um lote',
    ],
    mensagem: mensagens.usinagem,
    legendaDesenho: 'Perfil de uma peça torneada com as cotas de diâmetro e comprimento',
    cena: '01',
  },
  {
    id: 'solda',
    nome: 'Soldagem',
    chamada: 'Duas peças viram uma.',
    texto:
      'A solda em inox pede calor controlado para unir sem empenar e sem manchar. Depois, o cordão pode ser lixado e polido até sumir.',
    pontos: [
      'União de tubos, curvas, tês e conexões de inox',
      'Reparo de peças trincadas ou quebradas',
      'Acabamento do cordão no padrão da peça',
    ],
    mensagem: mensagens.soldagem,
    legendaDesenho: 'Junta soldada com o cordão e o símbolo de solda do desenho técnico',
    cena: '02',
  },
  {
    id: 'polimento',
    nome: 'Polimento',
    chamada: 'Acabamento do fosco ao espelho.',
    texto:
      'Lixa após lixa, a superfície vai ficando lisa até o inox refletir. Na linha sanitária isso conta: superfície lisa junta menos resíduo e limpa mais fácil.',
    pontos: [
      'Acabamento escovado, acetinado ou espelhado',
      'Peças novas ou peças que perderam o brilho',
      'Remoção de riscos e marcas de solda',
    ],
    mensagem: mensagens.polimento,
    legendaDesenho: 'Perfil da superfície antes e depois do polimento',
    cena: '04',
  },
]

export const processo = [
  {
    titulo: 'Mande o que você tem',
    texto: 'Desenho, foto com as medidas ou a própria peça como amostra.',
  },
  {
    titulo: 'Receba o orçamento',
    texto: 'A gente avalia material, processo e acabamento e responde com valor e prazo.',
  },
  {
    titulo: 'Fabricação',
    texto: 'Usinagem, soldagem e polimento, na ordem que a peça pede.',
  },
  {
    titulo: 'Entrega',
    texto: 'Retirada ou envio, do jeito combinado no fechamento.',
  },
] as const

/** As duas ligas da linha sanitária, comparadas lado a lado. */
export const ligas = [
  {
    nome: '304',
    apelido: 'O padrão da linha',
    composicao: 'Cerca de 18% de cromo e 8% de níquel',
    uso: 'Alimentos, bebidas, laticínios e uso geral em processo',
  },
  {
    nome: '316',
    apelido: 'Para meio agressivo',
    composicao: 'Como o 304, com molibdênio a mais',
    uso: 'Produtos ácidos ou salinos, químicos, farmacêutico e limpeza pesada',
  },
] as const

export const criterios = [
  { chave: 'composicao', rotulo: 'Do que é feito' },
  { chave: 'uso', rotulo: 'Onde vai bem' },
] as const

export const notas = [
  {
    titulo: 'Por que a linha sanitária é polida',
    texto:
      'Superfície lisa não segura resíduo nas ranhuras e limpa mais fácil. Por isso, na linha sanitária, o acabamento conta tanto quanto a medida.',
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
    pergunta: 'Vocês fornecem linha sanitária?',
    resposta:
      'Sim. Conexões sanitárias em inox 304 e 316 nos padrões Tri-Clamp, SMS, RJT, DIN, OD, BSP e NPT: curvas, tês, reduções, espigões, niples, uniões, abraçadeiras e outras conexões.',
  },
  {
    pergunta: 'Como faço um pedido?',
    resposta:
      'Pelo WhatsApp ou pelo telefone fixo. Diga a peça, o padrão de conexão, o diâmetro, o inox (304 ou 316) e a quantidade.',
  },
  {
    pergunta: 'Vocês fabricam peça que não é de linha?',
    resposta:
      'Sim, sob desenho ou a partir de uma amostra. Mande o desenho ou uma foto com as medidas, ou combine com a gente o envio da peça.',
  },
  {
    pergunta: 'Posso levar uma peça minha para soldar ou polir?',
    resposta:
      'Pode. Usinagem, soldagem e polimento também são feitos em peças do cliente. Envie fotos pelo WhatsApp para a gente avaliar antes.',
  },
  {
    pergunta: 'Qual é o prazo?',
    resposta:
      'Depende da peça, da quantidade e do acabamento. O prazo vem junto com o orçamento.',
  },
  {
    pergunta: 'O que preciso mandar para pedir um orçamento?',
    resposta:
      'O que você tiver: desenho, foto da peça, padrão de conexão, diâmetro, tipo de inox, quantidade e onde a peça vai ser usada. Quanto mais detalhe, mais rápido sai o orçamento.',
  },
] as const

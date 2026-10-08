/**
 * Catálogo de imagens e vídeos. Nada aqui precisa ser editado: basta colocar
 * os arquivos nas pastas certas e o site encontra sozinho.
 *
 *   src/assets/hero/hero-desktop.webp     (16:9)
 *   src/assets/hero/hero-mobile.webp      (9:16)
 *   src/assets/cenas/01-torno.webp        (4:3, fotos dos serviços, casadas pelo número)
 *   src/assets/oficina/01-....mp4|webp    (vídeos e fotos reais do carrossel)
 *
 * No carrossel da oficina, a ordem é a ordem dos nomes. Os vídeos vão para a
 * faixa de cima e as fotos para a de baixo.
 */
const heroArquivos = import.meta.glob<string>('../assets/hero/*.{webp,avif,jpg,jpeg,png}', {
  eager: true,
  import: 'default',
})
const cenaArquivos = import.meta.glob<string>('../assets/cenas/*.{webp,avif,jpg,jpeg,png}', {
  eager: true,
  import: 'default',
})
const oficinaArquivos = import.meta.glob<string>('../assets/oficina/*.{webp,avif,jpg,jpeg,png,mp4,webm}', {
  eager: true,
  import: 'default',
})

/** Primeiro quadro de cada vídeo, mostrado enquanto o vídeo carrega. Mesmo nome do vídeo. */
const capaArquivos = import.meta.glob<string>('../assets/oficina/capas/*.{webp,jpg,jpeg,png}', {
  eager: true,
  import: 'default',
})

const nomeBase = (caminho: string) => caminho.split('/').pop()!.replace(/\.[a-z0-9]+$/i, '')
const extensao = (caminho: string) => caminho.split('.').pop()!.toLowerCase()
const ordenar = ([a]: [string, string], [b]: [string, string]) => a.localeCompare(b, 'pt-BR', { numeric: true })

function achar(arquivos: Record<string, string>, nome: string) {
  const entrada = Object.entries(arquivos).find(([caminho]) => nomeBase(caminho) === nome)
  return entrada?.[1]
}

export const hero = {
  desktop: achar(heroArquivos, 'hero-desktop'),
  mobile: achar(heroArquivos, 'hero-mobile'),
}

export const temHero = Boolean(hero.desktop || hero.mobile)

export type Foto = { id: string; numero: string; src: string; alt: string }

/** Legendas das fotos dos serviços, casadas pelo começo do nome do arquivo. */
const legendasCenas: Record<string, string> = {
  '01': 'Peça de inox girando no torno com cavaco em espiral',
  '02': 'Arco de solda unindo dois tubos de inox',
  '04': 'Roda de pano polindo uma peça de inox',
}

const cenas: Foto[] = Object.entries(cenaArquivos)
  .sort(ordenar)
  .map(([caminho, src]) => {
    const id = nomeBase(caminho)
    const numero = id.match(/^\d+/)?.[0]?.padStart(2, '0') ?? ''
    return { id, numero, src, alt: legendasCenas[numero] ?? 'Trabalho em aço inox' }
  })

/** Busca a foto de um serviço pelo número da cena (ex.: '01'). Devolve undefined se ela não existir. */
export const fotoDaCena = (numero: string) => cenas.find((foto) => foto.numero === numero)

export type Midia = {
  id: string
  tipo: 'video' | 'foto'
  src: string
  /** Só nos vídeos: imagem do primeiro quadro, de src/assets/oficina/capas. */
  capa?: string
  legenda: string
  /** Largura dividida pela altura. */
  proporcao: number
}

/**
 * Legendas e proporções da mídia da oficina, pelo nome do arquivo sem o número.
 * Arquivo novo sem entrada aqui entra com legenda genérica em 3:4.
 */
const fichaOficina: Record<string, { legenda: string; proporcao: number }> = {
  'polimento-curva': { legenda: 'Polimento de curva sanitária na roda de pano', proporcao: 476 / 848 },
  'estoque-tes': { legenda: 'Tês e tubos de linha sanitária no estoque', proporcao: 3 / 4 },
  'lixa-faiscas': { legenda: 'Acabamento de curva de inox na lixadeira de cinta', proporcao: 476 / 848 },
  'estoque-conexoes': { legenda: 'Conexões Tri-Clamp, espigões e reduções no estoque', proporcao: 3 / 4 },
  'bancada-curvas': { legenda: 'Curvas sanitárias presas na morsa para acabamento', proporcao: 476 / 848 },
  'curvas-polidas': { legenda: 'Curvas, uniões e flanges sanitários recém-polidos', proporcao: 3 / 4 },
  'curva-tri-clamp': { legenda: 'Curva Tri-Clamp com espigão', proporcao: 3 / 4 },
  'reducao-e-niple': { legenda: 'Redução concêntrica e niple Tri-Clamp', proporcao: 3 / 4 },
  'uniao-rosca': { legenda: 'Conexão com rosca interna usinada em inox', proporcao: 3 / 4 },
  'curva-e-espigao': { legenda: 'Curva 90° e niples com férula Tri-Clamp', proporcao: 3 / 4 },
  'te-sanitario': { legenda: 'Tê sanitário com pontas Tri-Clamp', proporcao: 3 / 4 },
  'conexoes-tri-clamp': { legenda: 'Férulas e conexões Tri-Clamp de vários diâmetros', proporcao: 3 / 4 },
}

export const oficina: Midia[] = Object.entries(oficinaArquivos)
  .sort(ordenar)
  .map(([caminho, src]) => {
    const id = nomeBase(caminho)
    const chave = id.replace(/^\d+-/, '')
    const ficha = fichaOficina[chave] ?? { legenda: 'Peças em inox da Inova Inox', proporcao: 3 / 4 }
    const tipo = ['mp4', 'webm'].includes(extensao(caminho)) ? 'video' : 'foto'
    const capa = tipo === 'video' ? achar(capaArquivos, id) : undefined
    return { id, tipo, src, capa, ...ficha } as Midia
  })

/** Busca uma mídia da oficina pelo nome do arquivo sem o número (ex.: 'curvas-polidas'). */
export const midiaOficina = (chave: string) => oficina.find((m) => m.id.replace(/^\d+-/, '') === chave)

/**
 * Catálogo de imagens. Nada aqui precisa ser editado: basta colocar os
 * arquivos nas pastas certas e o site encontra sozinho.
 *
 *   src/assets/hero/hero-desktop.webp   (16:9)
 *   src/assets/hero/hero-mobile.webp    (9:16)
 *   src/assets/galeria/01-torno.webp    (4:3, numeradas de 01 a 10)
 *
 * O comando `npm run imagens` gera esses arquivos (ver docs/IMAGENS.md).
 */
const heroArquivos = import.meta.glob<string>('../assets/hero/*.{webp,avif,jpg,jpeg,png}', {
  eager: true,
  import: 'default',
})
const galeriaArquivos = import.meta.glob<string>('../assets/galeria/*.{webp,avif,jpg,jpeg,png}', {
  eager: true,
  import: 'default',
})

const nomeBase = (caminho: string) => caminho.split('/').pop()!.replace(/\.[a-z0-9]+$/i, '')

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

/** Legendas das dez cenas do banco de imagens, casadas pelo começo do nome do arquivo. */
const legendas: Record<string, string> = {
  '01': 'Peça de inox girando no torno com cavaco em espiral',
  '02': 'Arco de solda unindo dois tubos de inox',
  '03': 'Cordão de solda em inox com as cores do calor',
  '04': 'Roda de pano polindo uma peça de inox',
  '05': 'Chapa de inox metade fosca, metade polida espelhada',
  '06': 'Peças de inox usinadas alinhadas na bancada',
  '07': 'Paquímetro medindo uma peça de inox',
  '08': 'Fresa usinando um bloco de inox',
  '09': 'Faíscas no acabamento de uma estrutura de inox',
  '10': 'Peças de inox sendo embaladas para envio',
}

export const galeria: Foto[] = Object.entries(galeriaArquivos)
  .sort(([a], [b]) => a.localeCompare(b, 'pt-BR', { numeric: true }))
  .map(([caminho, src]) => {
    const id = nomeBase(caminho)
    const prefixo = id.match(/^\d+/)?.[0]?.padStart(2, '0') ?? ''
    return {
      id,
      numero: prefixo,
      src,
      alt: legendas[prefixo] ?? 'Trabalho em aço inox da Inova Inox',
    }
  })

/** Busca uma foto pelo número da cena (ex.: '06'). Devolve undefined se ela não existir. */
export const fotoDaCena = (numero: string) => galeria.find((foto) => foto.numero === numero)

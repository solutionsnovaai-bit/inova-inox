/**
 * Prepara as imagens do site.
 *
 * Coloque os arquivos originais (PNG ou JPG) nestas pastas:
 *
 *   imagens-brutas/hero/hero-desktop.png     foto 16:9 do hero
 *   imagens-brutas/hero/hero-mobile.png      foto 9:16 do hero
 *   imagens-brutas/galeria/01-torno.png      fotos 4:3, numeradas de 01 a 10
 *
 * e rode `npm run imagens`. O resultado vai para src/assets/hero e
 * src/assets/galeria em WEBP. Se as pastas não existirem, crie-as.
 */
import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const BRUTAS = 'imagens-brutas'
const SAIDA = 'src/assets'
const ehImagem = (nome) => /\.(png|jpe?g|webp|avif)$/i.test(nome)
const semExtensao = (nome) => nome.replace(/\.[a-z0-9]+$/i, '')

async function listar(pasta) {
  try {
    return (await readdir(pasta)).filter(ehImagem).sort()
  } catch {
    return []
  }
}

async function gravar(imagem, destino, qualidade) {
  await imagem.webp({ quality: qualidade, effort: 6 }).toFile(`${destino}.webp`)
  console.log(`  ${destino}.webp`)
}

/**
 * A foto vertical ganha uma faixa a mais no topo (um espelho borrado e
 * escurecido do próprio começo da foto). Assim a barra do site fica sobre
 * essa faixa e não encosta no logotipo.
 */
async function estenderTopo(arquivo, faixa = 0.138) {
  const base = sharp(arquivo)
  const { width, height } = await base.metadata()
  const altura = Math.round(width * faixa)

  const espelho = await sharp(arquivo)
    .extract({ left: 0, top: 0, width, height: altura })
    .flip()
    .blur(14)
    .composite([
      {
        input: Buffer.from(
          `<svg width="${width}" height="${altura}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">` +
            `<stop offset="0" stop-color="#000" stop-opacity="0.75"/><stop offset="1" stop-color="#000" stop-opacity="0"/>` +
            `</linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`,
        ),
      },
    ])
    .png()
    .toBuffer()

  const montada = await sharp({
    create: { width, height: height + altura, channels: 3, background: '#000' },
  })
    .composite([
      { input: espelho, top: 0, left: 0 },
      { input: await base.png().toBuffer(), top: altura, left: 0 },
    ])
    .png()
    .toBuffer()

  return sharp(montada)
}

async function hero() {
  const pasta = path.join(BRUTAS, 'hero')
  const arquivos = await listar(pasta)
  if (!arquivos.length) return console.log('hero: nenhuma imagem em imagens-brutas/hero')
  await mkdir(path.join(SAIDA, 'hero'), { recursive: true })
  console.log('hero')

  for (const arquivo of arquivos) {
    const nome = semExtensao(arquivo)
    const origem = path.join(pasta, arquivo)
    if (nome === 'hero-desktop') {
      await gravar(sharp(origem), path.join(SAIDA, 'hero', nome), 86)
    } else if (nome === 'hero-mobile') {
      await gravar(await estenderTopo(origem), path.join(SAIDA, 'hero', nome), 86)
    } else {
      console.log(`  ignorado: ${arquivo} (use hero-desktop ou hero-mobile no nome)`)
    }
  }
}

async function galeria() {
  const pasta = path.join(BRUTAS, 'galeria')
  const arquivos = await listar(pasta)
  if (!arquivos.length) return console.log('galeria: nenhuma imagem em imagens-brutas/galeria')
  await mkdir(path.join(SAIDA, 'galeria'), { recursive: true })
  console.log('galeria')

  for (const arquivo of arquivos) {
    const imagem = sharp(path.join(pasta, arquivo)).resize({ width: 1200, withoutEnlargement: true })
    await gravar(imagem, path.join(SAIDA, 'galeria', semExtensao(arquivo)), 80)
  }
}

await hero()
await galeria()
console.log('pronto')

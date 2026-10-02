import arcoSuperior from '../assets/logo/arco-superior.webp'
import arcoInferior from '../assets/logo/arco-inferior.webp'
import inovaI from '../assets/logo/inova-i.webp'
import inovaN from '../assets/logo/inova-n.webp'
import inovaO from '../assets/logo/inova-o.webp'
import inovaV from '../assets/logo/inova-v.webp'
import inovaA from '../assets/logo/inova-a.webp'
import inoxI from '../assets/logo/inox-i.webp'
import inoxN from '../assets/logo/inox-n.webp'
import inoxO from '../assets/logo/inox-o.webp'
import inoxX from '../assets/logo/inox-x.webp'
import assinatura from '../assets/logo/assinatura.webp'
import logoCompleto from '../assets/logo/logo-completo.webp'
import logoMarca from '../assets/logo/logo-marca.webp'

export type GrupoLogo = 'arco' | 'inova' | 'inox' | 'assinatura'

export type CamadaLogo = {
  id: string
  src: string
  grupo: GrupoLogo
  /** Posição e tamanho em % da prancha do logotipo. */
  x: number
  y: number
  w: number
  h: number
}

/** Proporção da prancha completa (símbolo + assinatura). */
export const PROPORCAO_LOGO = 1074 / 588
/** Proporção sem a linha "Usinagem - Polimento - Solda". */
export const PROPORCAO_MARCA = 1074 / 516

/**
 * O logotipo foi separado em 12 peças transparentes para animar cada uma.
 * As medidas vêm do arquivo original e não devem ser alteradas à mão.
 */
export const camadas: CamadaLogo[] = [
  { id: 'arco-superior', src: arcoSuperior, grupo: 'arco', x: 24.209, y: 1.02, w: 56.797, h: 36.735 },
  { id: 'arco-inferior', src: arcoInferior, grupo: 'arco', x: 1.117, y: 51.361, w: 37.803, h: 27.041 },
  { id: 'inova-i', src: inovaI, grupo: 'inova', x: 6.425, y: 12.415, w: 7.728, h: 47.619 },
  { id: 'inova-n', src: inovaN, grupo: 'inova', x: 14.804, y: 25.51, w: 20.764, h: 33.163 },
  { id: 'inova-o', src: inovaO, grupo: 'inova', x: 36.22, y: 25.85, w: 23.371, h: 32.823 },
  { id: 'inova-v', src: inovaV, grupo: 'inova', x: 58.473, y: 25.51, w: 24.115, h: 33.163 },
  { id: 'inova-a', src: inovaA, grupo: 'inova', x: 74.488, y: 24.49, w: 23.836, h: 34.184 },
  { id: 'inox-i', src: inoxI, grupo: 'inox', x: 38.361, y: 64.116, w: 4.655, h: 22.109 },
  { id: 'inox-n', src: inoxN, grupo: 'inox', x: 44.507, y: 64.116, w: 14.432, h: 21.939 },
  { id: 'inox-o', src: inoxO, grupo: 'inox', x: 60.056, y: 64.116, w: 15.177, h: 22.109 },
  { id: 'inox-x', src: inoxX, grupo: 'inox', x: 75.326, y: 64.286, w: 15.549, h: 21.939 },
  { id: 'assinatura', src: assinatura, grupo: 'assinatura', x: 0.279, y: 90.816, w: 99.441, h: 8.844 },
]

export const logo = {
  completo: logoCompleto,
  marca: logoMarca,
}

/** Carrega e decodifica todas as peças antes de o loader começar. */
export function precarregarLogo() {
  return Promise.all(
    camadas.map(
      ({ src }) =>
        new Promise<void>((ok) => {
          const img = new Image()
          img.onload = () => (img.decode ? img.decode().then(ok, ok) : ok())
          img.onerror = () => ok()
          img.src = src
        }),
    ),
  )
}

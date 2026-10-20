/* Imagens do site: só fotos reais das peças, o logotipo e o catálogo técnico. */
import curvaTriClamp from '../assets/fotos/11-curva-tri-clamp.webp'
import curvasPolidas from '../assets/fotos/10-curvas-polidas.webp'
import reducaoENiple from '../assets/fotos/12-reducao-e-niple.webp'
import uniaoRosca from '../assets/fotos/13-uniao-rosca.webp'
import curvaEEspigao from '../assets/fotos/14-curva-e-espigao.webp'
import teSanitario from '../assets/fotos/15-te-sanitario.webp'
import conexoesTriClamp from '../assets/fotos/16-conexoes-tri-clamp.webp'
import teTriClamp from '../assets/fotos/te-tri-clamp.webp'
import adaptadoresRosca from '../assets/fotos/adaptadores-rosca.webp'
import niplesEEspigoes from '../assets/fotos/niples-e-espigoes.webp'
import prancha1 from '../assets/pecas/pecas-1.webp'
import prancha2 from '../assets/pecas/pecas-2.webp'
import prancha3 from '../assets/pecas/pecas-3.webp'
import folha1 from '../assets/catalogo/folha-1.webp'
import folha2 from '../assets/catalogo/folha-2.webp'
import folha3 from '../assets/catalogo/folha-3.webp'
import folha4 from '../assets/catalogo/folha-4.webp'
import folha5 from '../assets/catalogo/folha-5.webp'
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

export type Foto = { id: string; src: string; alt: string }

export const FOTOS: Record<string, Foto> = {
  'curva-tri-clamp': { id: 'curva-tri-clamp', src: curvaTriClamp, alt: 'Curva Tri-Clamp com espigão' },
  'curvas-polidas': { id: 'curvas-polidas', src: curvasPolidas, alt: 'Curvas, uniões e flanges sanitários polidos' },
  'reducao-e-niple': { id: 'reducao-e-niple', src: reducaoENiple, alt: 'Redução concêntrica e niple Tri-Clamp' },
  'uniao-rosca': { id: 'uniao-rosca', src: uniaoRosca, alt: 'Conexão com rosca interna usinada em inox' },
  'curva-e-espigao': { id: 'curva-e-espigao', src: curvaEEspigao, alt: 'Curva 90° e niples com férula Tri-Clamp' },
  'te-sanitario': { id: 'te-sanitario', src: teSanitario, alt: 'Tê sanitário com pontas Tri-Clamp' },
  'conexoes-tri-clamp': { id: 'conexoes-tri-clamp', src: conexoesTriClamp, alt: 'Férulas e conexões Tri-Clamp de vários diâmetros' },
  'te-tri-clamp': { id: 'te-tri-clamp', src: teTriClamp, alt: 'Tê Tri-Clamp polido' },
  'adaptadores-rosca': { id: 'adaptadores-rosca', src: adaptadoresRosca, alt: 'Adaptadores Tri-Clamp com rosca' },
  'niples-e-espigoes': { id: 'niples-e-espigoes', src: niplesEEspigoes, alt: 'Niples, espigões e férulas Tri-Clamp' },
}

export const PRANCHAS = [prancha1, prancha2, prancha3]
export const logo = { completo: logoCompleto, marca: logoMarca }

/** Peças do logotipo (posição em % da prancha 1074×588), para a abertura montar a marca. */
export type CamadaLogo = { id: string; src: string; grupo: 'arco' | 'inova' | 'inox' | 'assinatura'; x: number; y: number; w: number; h: number }
export const PROPORCAO_LOGO = 1074 / 588
export const CAMADAS: CamadaLogo[] = [
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

export function carregar(src: string) {
  return new Promise<void>((ok) => {
    const img = new Image()
    img.onload = () => (img.decode ? img.decode().then(ok, ok) : ok())
    img.onerror = () => ok()
    img.src = src
  })
}

/* Catálogo técnico: quatro páginas por folha, em grade 2 x 2. */
const FOLHAS = [folha1, folha2, folha3, folha4, folha5]
export const TOTAL_PAGINAS = 19
export function recortePagina(indice: number) {
  const pos = indice % 4
  return { src: FOLHAS[Math.floor(indice / 4)], coluna: pos % 2, linha: Math.floor(pos / 2) }
}

export const TITULOS_PAGINAS = [
  'Capa', 'Conexões solda', 'Conexões Tri-Clamp', 'Tri-Clamp: curvas, tês e reduções', 'Uniões, porcas, tampões e anéis',
  'Machos solda e expansão', 'Niples', 'Curvas roscadas', 'Tês e cruzeta roscados', 'Reduções roscadas',
  'Adaptadores para mangueira', 'Visores e torneira de amostra', 'Acessórios', 'Industrial: cotovelos e tês',
  'Industrial: tê de redução, cruzeta e uniões', 'Industrial: uniões e niple de redução', 'Industrial: niples, espigão e bujão',
  'Industrial: conexão Y, tampão, bucha e luva', 'Industrial: luvas',
]

export const INDICE_CATALOGO = [
  {
    grupo: 'Padrão sanitário',
    itens: [
      { rotulo: 'Conexões solda', pagina: 1 }, { rotulo: 'Tri-Clamp (TC)', pagina: 2 }, { rotulo: 'Uniões RJT, SMS e DIN', pagina: 4 },
      { rotulo: 'Machos', pagina: 5 }, { rotulo: 'Niples', pagina: 6 }, { rotulo: 'Curvas roscadas', pagina: 7 },
      { rotulo: 'Tês e cruzeta roscados', pagina: 8 }, { rotulo: 'Reduções roscadas', pagina: 9 },
      { rotulo: 'Adaptadores p/ mangueira', pagina: 10 }, { rotulo: 'Visores', pagina: 11 }, { rotulo: 'Acessórios', pagina: 12 },
    ],
  },
  {
    grupo: 'Industrial 150 lbs · BSP ou NPT',
    itens: [
      { rotulo: 'Cotovelos e tês', pagina: 13 }, { rotulo: 'Cruzeta e uniões', pagina: 14 }, { rotulo: 'Niple de redução', pagina: 15 },
      { rotulo: 'Niples, espigão e bujão', pagina: 16 }, { rotulo: 'Conexão Y, tampão e buchas', pagina: 17 }, { rotulo: 'Luvas', pagina: 18 },
    ],
  },
]

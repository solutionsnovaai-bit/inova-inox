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

import { motion, type SVGMotionProps } from 'framer-motion'
import { EASE } from '../../lib/util'
import type { Servico } from '../../data/conteudo'
import { useMovimentoReduzido } from '../../hooks/basicos'

type PropsTraco = SVGMotionProps<SVGPathElement> & {
  /** Ordem de entrada: cada traço começa um pouco depois do anterior. */
  ordem?: number
  duracao?: number
}

/**
 * Linha de desenho técnico que se traça sozinha.
 * Funciona dentro de um <motion.svg> com os estados "oculto" e "visivel".
 */
export function Traco({ ordem = 0, duracao = 1.1, ...resto }: PropsTraco) {
  return (
    <motion.path
      fill="none"
      vectorEffect="non-scaling-stroke"
      variants={{
        oculto: { pathLength: 0, opacity: 0 },
        visivel: {
          pathLength: 1,
          opacity: 1,
          transition: {
            pathLength: { duration: duracao, delay: ordem * 0.12, ease: EASE },
            opacity: { duration: 0.2, delay: ordem * 0.12 },
          },
        },
      }}
      {...resto}
    />
  )
}

type PropsCotaSvg = {
  x1: number
  y1: number
  x2: number
  y2: number
  texto: string
  /** Afasta o texto da linha. Negativo sobe ou vai para a esquerda. */
  afastar?: number
  ordem?: number
}

/** Linha de cota com setas nas pontas e a medida ao lado, dentro de um SVG. */
export function CotaSvg({ x1, y1, x2, y2, texto, afastar = -8, ordem = 0 }: PropsCotaSvg) {
  const vertical = Math.abs(x2 - x1) < Math.abs(y2 - y1)
  const meioX = (x1 + x2) / 2
  const meioY = (y1 + y2) / 2
  const s = 5

  const setas = vertical
    ? `M${x1 - s} ${y1 + s * 1.6}L${x1} ${y1}L${x1 + s} ${y1 + s * 1.6}M${x2 - s} ${y2 - s * 1.6}L${x2} ${y2}L${x2 + s} ${y2 - s * 1.6}`
    : `M${x1 + s * 1.6} ${y1 - s}L${x1} ${y1}L${x1 + s * 1.6} ${y1 + s}M${x2 - s * 1.6} ${y2 - s}L${x2} ${y2}L${x2 - s * 1.6} ${y2 + s}`

  return (
    <motion.g
      className="desenho-cota"
      variants={{
        oculto: { opacity: 0 },
        visivel: { opacity: 1, transition: { duration: 0.7, delay: 0.5 + ordem * 0.14, ease: EASE } },
      }}
    >
      <path d={`M${x1} ${y1}L${x2} ${y2}${setas}`} fill="none" vectorEffect="non-scaling-stroke" />
      <text
        x={vertical ? meioX + afastar : meioX}
        y={vertical ? meioY : meioY + afastar}
        textAnchor={vertical ? (afastar < 0 ? 'end' : 'start') : 'middle'}
        dominantBaseline={vertical ? 'middle' : 'auto'}
      >
        {texto}
      </text>
    </motion.g>
  )
}

/** Eixo escalonado visto de lado, com a ferramenta de corte encostada. */
export function DesenhoUsinagem() {
  return (
    <>
      {/* linha de centro */}
      <path className="desenho-centro" d="M40 180H440" vectorEffect="non-scaling-stroke" />

      {/* contorno da peça */}
      <Traco
        className="desenho-peca"
        duracao={1.6}
        d="M70 140H170V120H300V98H400V262H300V240H170V220H70Z"
      />
      {/* chanfros e degraus */}
      <Traco className="desenho-fino" ordem={2} d="M170 120V240M300 98V262" />
      <Traco className="desenho-fino" ordem={3} d="M70 140l10 -8M70 220l10 8M400 98l-10 8M400 262l-10 -8" duracao={0.5} />

      {/* seção hachurada */}
      <g className="desenho-hachura">
        <path d="M182 232L290 124M206 240L300 146M230 240L300 170M254 240L300 194M170 220L270 120M170 196L246 120M170 172L222 120M170 148L198 120" vectorEffect="non-scaling-stroke" />
      </g>

      {/* ferramenta de corte */}
      <Traco className="desenho-azul" ordem={5} duracao={0.7} d="M352 98L372 58H332Z" />
      <Traco className="desenho-azul" ordem={6} duracao={0.5} d="M332 58V30H372V58" />

      <CotaSvg x1={70} y1={300} x2={400} y2={300} texto="120" afastar={-9} ordem={0} />
      <CotaSvg x1={46} y1={140} x2={46} y2={220} texto="Ø 28" afastar={-10} ordem={1} />
      <CotaSvg x1={428} y1={98} x2={428} y2={262} texto="Ø 56" afastar={10} ordem={2} />
    </>
  )
}

/** Perfil da superfície: cheio de picos antes, quase reto depois. */
export function DesenhoPolimento() {
  return (
    <>
      <text className="desenho-legenda" x="60" y="70">Antes</text>
      <path className="desenho-centro" d="M60 130H420" vectorEffect="non-scaling-stroke" />
      <Traco
        className="desenho-peca"
        duracao={1.8}
        d="M60 130l14 -30 12 44 10 -52 16 60 12 -38 10 46 14 -62 12 54 14 -34 10 40 16 -56 12 58 12 -42 14 36 12 -50 14 52 12 -30 10 44 14 -58 12 48 14 -36 12 34 14 -44 10 16"
      />

      <text className="desenho-legenda" x="60" y="222">Depois</text>
      <path className="desenho-centro" d="M60 272H420" vectorEffect="non-scaling-stroke" />
      <Traco
        className="desenho-azul"
        ordem={5}
        duracao={1.6}
        d="M60 272c30 -4 50 3 80 0s50 -4 80 0 50 3 80 0 50 -3 80 0 30 2 40 0"
      />

      {/* símbolo de acabamento superficial */}
      <Traco className="desenho-fino" ordem={8} duracao={0.6} d="M352 236l14 24 22 -40h34" />
    </>
  )
}

const escamas = Array.from({ length: 13 }, (_, i) => 92 + i * 22)

/** Duas chapas unidas de topo, com o cordão em escamas e o símbolo de solda. */
export function DesenhoSolda() {
  return (
    <>
      <Traco className="desenho-peca" duracao={1.2} d="M60 110H420V168H60Z" />
      <Traco className="desenho-peca" ordem={1} duracao={1.2} d="M60 196H420V254H60Z" />

      {/* cordão: uma escama por vez, na direção da solda */}
      {escamas.map((x, i) => (
        <motion.path
          key={x}
          className="desenho-azul"
          d={`M${x} 168c14 2 14 26 0 28`}
          fill="none"
          vectorEffect="non-scaling-stroke"
          variants={{
            oculto: { opacity: 0, pathLength: 0 },
            visivel: {
              opacity: 1,
              pathLength: 1,
              transition: { duration: 0.3, delay: 0.7 + i * 0.07, ease: EASE },
            },
          }}
        />
      ))}

      {/* arco aberto na ponta do cordão */}
      <motion.circle
        className="desenho-arco"
        cx="390"
        cy="182"
        r="7"
        variants={{
          oculto: { opacity: 0, scale: 0 },
          visivel: { opacity: 1, scale: 1, transition: { duration: 0.4, delay: 1.7, ease: EASE } },
        }}
      />

      {/* símbolo de solda: seta, linha de referência e triângulo */}
      <Traco className="desenho-fino" ordem={9} duracao={0.8} d="M236 164L286 62H410" />
      <Traco className="desenho-fino" ordem={10} duracao={0.4} d="M236 164l2 -15M236 164l12 -9" />
      <Traco className="desenho-fino" ordem={11} duracao={0.5} d="M326 62l14 -22 14 22" />
    </>
  )
}

type PropsDesenhoServico = { servico: Servico; ativo?: boolean }

const desenhos = {
  usinagem: DesenhoUsinagem,
  polimento: DesenhoPolimento,
  solda: DesenhoSolda,
} as const

/** Folha de desenho técnico de cada serviço. O traçado acontece quando `ativo`. */
export function DesenhoServico({ servico, ativo = true }: PropsDesenhoServico) {
  const reduzido = useMovimentoReduzido()
  const Desenho = desenhos[servico.id]

  return (
    <motion.svg
      className="desenho"
      viewBox="0 0 480 360"
      role="img"
      aria-label={servico.legendaDesenho}
      initial={reduzido ? 'visivel' : 'oculto'}
      animate={ativo || reduzido ? 'visivel' : 'oculto'}
    >
      <Desenho />
    </motion.svg>
  )
}

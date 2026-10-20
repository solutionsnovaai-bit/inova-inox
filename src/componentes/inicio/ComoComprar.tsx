import { useRef } from 'react'
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { recortePagina, TITULOS_PAGINAS } from '../../lib/midia'
import { Link, linkCatalogo } from '../../loja/rotas'
import { useMovimento } from '../../lib/movimento'
import { Revelar, Titulo } from '../ui/Revelar'
import { Botao } from '../ui/Pecas'

const PASSOS = [
  { titulo: 'Escolha a peça', texto: 'Pela linha, pela busca ou direto do catálogo técnico, com o desenho de cada conexão.' },
  { titulo: 'Medida e aço', texto: 'Marque a medida, o inox 304 ou 316 e o padrão. O preço aparece na hora; o que não tem preço é sob consulta.' },
  { titulo: 'Feche no WhatsApp', texto: 'A sacola vira uma mensagem pronta. A Inova confirma estoque, frete e forma de pagamento.' },
]
const TRACO_H = 'M10 70C160 10 250 130 420 72S700 6 860 66S1150 140 1310 58'
const TRACO_V = 'M40 10C80 140 0 240 40 380S90 620 40 760'

function Cordao({ d, viewBox, classe, p, reduzido }: { d: string; viewBox: string; classe: string; p: MotionValue<number>; reduzido: boolean }) {
  const caminho = useRef<SVGPathElement>(null)
  const ponta = useRef<SVGCircleElement>(null)
  useMotionValueEvent(p, 'change', (v) => {
    const c = caminho.current, t = ponta.current
    if (!c || !t) return
    const pt = c.getPointAtLength(Math.max(0, Math.min(1, v)) * c.getTotalLength())
    t.setAttribute('cx', String(pt.x)); t.setAttribute('cy', String(pt.y))
    t.style.opacity = v > 0.01 && v < 0.99 ? '1' : '0'
  })
  return <svg className={`passos-traco ${classe}`} viewBox={viewBox} preserveAspectRatio="none" aria-hidden="true">
    <path d={d} className="passos-traco-fundo" />
    <motion.path ref={caminho} d={d} style={{ pathLength: reduzido ? 1 : p }} />
    <circle ref={ponta} r="9" className="passos-ponta" style={{ opacity: 0 }} />
  </svg>
}

/** Três passos ligados por um cordão de solda que se desenha com a rolagem, com a ponta em brasa. */
export function Passos() {
  const { reduzido } = useMovimento()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start .8', 'end .55'] })
  const desenho = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  return <section className="secao passos" aria-labelledby="passos-titulo">
    <div className="conteiner">
      <div className="secao-cabeca">
        <div>
          <Revelar><p className="selo-texto">Como comprar</p></Revelar>
          <Titulo id="passos-titulo" linhas={['Três passos,']} destaque="sem cadastro." />
        </div>
      </div>
      <div ref={ref} className="passos-trilha">
        <Cordao d={TRACO_H} viewBox="0 0 1320 140" classe="passos-traco-h" p={desenho} reduzido={reduzido} />
        <Cordao d={TRACO_V} viewBox="0 0 80 770" classe="passos-traco-v" p={desenho} reduzido={reduzido} />
        <ol className="passos-lista">
          {PASSOS.map((p, i) => <Revelar as="li" key={p.titulo} delay={i * 0.12}>
            <span className="passos-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <h3>{p.titulo}</h3>
            <p>{p.texto}</p>
          </Revelar>)}
        </ol>
      </div>
    </div>
  </section>
}

const LEQUE = [
  { x: -118, r: -14, y: 34, pagina: 1 },
  { x: -60, r: -7, y: 8, pagina: 2 },
  { x: 0, r: 0, y: -6, pagina: 0 },
  { x: 60, r: 7, y: 8, pagina: 13 },
  { x: 118, r: 14, y: 34, pagina: 11 },
]

function Folha({ i, p }: { i: number; p: MotionValue<number> }) {
  const alvo = LEQUE[i]
  const x = useTransform(p, [0, 1], ['0%', `${alvo.x}%`])
  const y = useTransform(p, [0, 1], [i * -4, alvo.y])
  const rotate = useTransform(p, [0, 1], [(i - 2) * 2, alvo.r])
  const { src, coluna, linha } = recortePagina(alvo.pagina)
  return <motion.li className="leque-folha" style={{ x, y, rotate, zIndex: i === 2 ? 5 : 5 - Math.abs(i - 2) }}>
    <Link href={linkCatalogo(alvo.pagina)} data-cursor="ver" aria-label={`Abrir o catálogo na página ${alvo.pagina + 1}: ${TITULOS_PAGINAS[alvo.pagina]}`}>
      <span className="pagina-recorte">
        <img src={src} alt="" loading="lazy" decoding="async" style={{ left: `${-coluna * 100}%`, top: `${-linha * 100}%` }} />
      </span>
    </Link>
  </motion.li>
}

/** As páginas chegam empilhadas e se abrem em leque conforme a rolagem. */
export function CatalogoChamada() {
  const { reduzido } = useMovimento()
  const ref = useRef<HTMLUListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start .95', 'center .55'] })
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 24 })
  const fixo = useTransform(p, () => 1)
  return <section className="secao catalogo-chamada" aria-labelledby="catalogo-chamada-titulo">
    <div className="conteiner catalogo-chamada-dentro">
      <Revelar><p className="selo-texto">19 páginas · medidas de cada peça</p></Revelar>
      <Titulo id="catalogo-chamada-titulo" className="titulo catalogo-chamada-titulo" linhas={['Catálogo']} destaque="técnico." />
      <ul ref={ref} className="leque">
        {LEQUE.map((_, i) => <Folha key={i} i={i} p={reduzido ? fixo : p} />)}
      </ul>
      <Revelar className="catalogo-chamada-cta">
        <p className="lead">As cotas de cada conexão, tabela por tabela, com o desenho ao lado. Folheie aqui mesmo, sem baixar PDF.</p>
        <Botao href={linkCatalogo()}>Folhear o catálogo</Botao>
      </Revelar>
    </div>
  </section>
}

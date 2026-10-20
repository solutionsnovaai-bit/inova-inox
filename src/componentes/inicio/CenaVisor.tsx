import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { CENAS, FOTOS, type Foto } from '../../lib/midia'
import { mensagens, waLink } from '../../loja/config'
import { Link, linkLoja } from '../../loja/rotas'
import { ease, useMidia, useMovimento } from '../../lib/movimento'
import { Visor } from '../ui/Visor'
import { Faisca, Gotas, reflexo } from '../ui/Pecas'

type Servico = { palavra: string; nome: string; nota: string; foto: Foto; fundo: string; tinta: string; liquido: string; cta: string; href: string }

const SERVICOS: Servico[] = [
  { palavra: 'conectada.', nome: 'Linha sanitária', nota: 'Tri-Clamp, SMS, RJT, DIN, OD, BSP e NPT em inox 304 e 316, prontas na loja.', foto: FOTOS['conexoes-tri-clamp'], fundo: '#0471e5', tinta: '#f4f8ff', liquido: '#7cbcff', cta: 'Ver a loja', href: linkLoja() },
  { palavra: 'usinada.', nome: 'Usinagem', nota: 'Torno para peça sob desenho ou feita a partir da sua amostra.', foto: CENAS.torno, fundo: '#c8cdd3', tinta: '#0a0d11', liquido: '#f1f3f5', cta: 'Orçar usinagem', href: waLink(mensagens.servico('usinagem')) },
  { palavra: 'soldada.', nome: 'Soldagem', nota: 'Solda em inox para montar trechos, conjuntos e peças especiais.', foto: CENAS.solda, fundo: '#ff8a1f', tinta: '#170b02', liquido: '#ffd08a', cta: 'Orçar soldagem', href: waLink(mensagens.servico('soldagem')) },
  { palavra: 'polida.', nome: 'Polimento', nota: 'Polimento e acabamento para deixar o inox no brilho que a linha pede.', foto: CENAS.polimento, fundo: '#10151c', tinta: '#e4e7ea', liquido: '#9aa3ad', cta: 'Orçar polimento', href: waLink(mensagens.servico('polimento')) },
]
const FRASE = ['Sua peça', 'sai daqui']
const TROCA = [[0.58, 0.62], [0.7, 0.74], [0.82, 0.86]] as const
const faixas = [0, TROCA[0][0], TROCA[0][1], TROCA[1][0], TROCA[1][1], TROCA[2][0], TROCA[2][1], 1]
const serie = (k: 'fundo' | 'tinta' | 'liquido') => [0, 0, 1, 1, 2, 2, 3, 3].map((i) => SERVICOS[i][k])

function Cta({ s, foco = true }: { s: Servico; foco?: boolean }) {
  const conteudo = <>{s.cta}<ArrowUpRight aria-hidden="true" /></>
  return s.href.startsWith('/')
    ? <Link className="cena-cta" href={s.href} tabIndex={foco ? 0 : -1}>{conteudo}</Link>
    : <a className="cena-cta" href={s.href} target="_blank" rel="noopener noreferrer" tabIndex={foco ? 0 : -1}>{conteudo}</a>
}

/** Versão sem animação: os quatro serviços lado a lado. */
function Estatica() {
  return <section id="servicos" className="secao cena-estatica escuro" aria-labelledby="servicos-titulo">
    <div className="conteiner">
      <p className="selo-texto">O que a Inova faz</p>
      <h2 id="servicos-titulo" className="titulo">{FRASE.join(' ')}…</h2>
      <ul className="cena-estatica-lista">
        {SERVICOS.map((s) => <li key={s.nome} style={{ background: s.fundo, color: s.tinta }}>
          <img src={s.foto.src} alt={s.foto.alt} width={s.foto.w} height={s.foto.h} loading="lazy" />
          <div><em>{s.palavra}</em><p><strong>{s.nome}.</strong> {s.nota}</p><Cta s={s} /></div>
        </li>)}
      </ul>
    </div>
  </section>
}

/**
  Cena dos serviços (rolagem presa à tela):
  o visor entra, a abraçadeira treme, gira e sobe com o tampão, uma gota cai e o líquido
  escorre e cobre a tela. Depois, quatro serviços trocam a cor da tela, do líquido e da foto.
*/
export function CenaVisor() {
  const { reduzido } = useMovimento()
  const estreito = useMidia('(max-width: 1023px)')
  const cena = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: cena, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 150, damping: 30, mass: 0.4 })

  const yVisor = useTransform(p, [0, 0.12], ['40%', '0%'])
  const giroVisor = useTransform(p, [0, 0.12, 0.3, 0.33, 0.37, 1], [-7, 0, 0, -2, 0, 2])
  const tampaGiro = useTransform(p, [0.12, 0.145, 0.17, 0.195, 0.22, 0.33], [0, -6, 5, -4, 3, estreito ? -10 : -22])
  const tampaY = useTransform(p, [0.22, 0.34], [0, -200])
  const tampaX = useTransform(p, [0.22, 0.34], [0, estreito ? 60 : 18])
  const gota = useTransform(p, [0.33, 0.42], [0, 1])
  const enche = useTransform(p, [0.38, 0.52], [0, 100])
  const clipPath = useTransform(enche, (v) => `inset(0% 0% ${(100 - v).toFixed(2)}% 0%)`)
  const topoGotas = useTransform(enche, (v) => `calc(${v.toFixed(2)}% - 2px)`)
  const yGotas = useTransform(enche, [0, 5], ['-100%', '0%'])
  const fundo = useTransform(p, faixas, serie('fundo'))
  const tinta = useTransform(p, faixas, serie('tinta'))
  const liquido = useTransform(p, faixas, serie('liquido'))
  const dicaOp = useTransform(p, [0, 0.08, 0.2, 0.26], [0, 1, 1, 0])
  const barra = useTransform(p, [0.5, 0.95], [0, 1])

  const [i, setI] = useState(0)
  const [coberta, setCoberta] = useState(false)
  useMotionValueEvent(p, 'change', (v) => {
    setI(v < TROCA[0][0] + 0.02 ? 0 : v < TROCA[1][0] + 0.02 ? 1 : v < TROCA[2][0] + 0.02 ? 2 : 3)
    setCoberta(v > 0.47)
  })

  if (reduzido) return <Estatica />
  const s = SERVICOS[i]

  return <section id="servicos" className="cena escuro" aria-labelledby="servicos-rotulo">
    <h2 id="servicos-rotulo" className="visualmente-oculto">{FRASE.join(' ')}: {SERVICOS.map((x) => x.palavra).join(' ')}</h2>
    <div ref={cena} className="cena-trilho">
      <div className="cena-palco">
        <div className="conteiner cena-grade">
          <div className="cena-letreiro">
            <p className="selo-texto">O que a Inova faz</p>
            <p className="cena-frase" aria-hidden="true"><span>{FRASE[0]}</span><span>{FRASE[1]}</span><span className="cena-palavra-caixa"><em>{SERVICOS[0].palavra}</em></span></p>
          </div>
          <motion.p className="cena-dica" style={{ opacity: dicaOp }}><i aria-hidden="true" />Role para abrir o visor</motion.p>
        </div>

        <motion.div className="cena-enchente" style={{ clipPath, backgroundColor: fundo, color: tinta }}>
          <div className="conteiner cena-grade">
            <div className="cena-letreiro">
              <p className="selo-texto">O que a Inova faz</p>
              <p className="cena-frase" aria-hidden="true">
                <span>{FRASE[0]}</span><span>{FRASE[1]}</span>
                <span className="cena-palavra-caixa">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.em key={s.palavra} initial={{ y: '100%', opacity: 0, rotate: 3 }} animate={{ y: '0%', opacity: 1, rotate: 0 }}
                      exit={{ y: '-100%', opacity: 0, rotate: -3 }} transition={{ duration: 0.8, ease: ease.expo }}>{s.palavra}</motion.em>
                  </AnimatePresence>
                </span>
              </p>
              <motion.div className="cena-detalhe" animate={{ opacity: coberta ? 1 : 0, y: coberta ? 0 : 16 }} transition={{ duration: 0.8, ease: ease.expo }}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p key={s.nome} className="cena-nota" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}>
                    <strong>{s.nome}.</strong> {s.nota}
                  </motion.p>
                </AnimatePresence>
                <Cta s={s} foco={coberta} />
                <div className="cena-marcador" aria-hidden="true">
                  {SERVICOS.map((x, k) => <span key={x.nome} className={k === i ? 'is-ativo' : ''} style={{ background: x.fundo }} />)}
                  <small>{String(i + 1).padStart(2, '0')} / 04</small>
                </div>
              </motion.div>
            </div>

            <motion.div className="cena-foto" animate={{ opacity: coberta ? 1 : 0, scale: coberta ? 1 : 0.85, rotate: coberta ? -3 : -10 }}
              transition={{ duration: 1.1, ease: ease.expo }}>
              <AnimatePresence initial={false}>
                <motion.div key={s.foto.id} className="chanfro aco-reflexo cena-moldura" onPointerMove={reflexo}
                  initial={{ clipPath: 'inset(0% 0% 100% 0%)' }} animate={{ clipPath: 'inset(0% 0% 0% 0%)' }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: ease.quint }}>
                  <img src={s.foto.src} alt={s.foto.alt} width={s.foto.w} height={s.foto.h} decoding="async" />
                </motion.div>
              </AnimatePresence>
              <Faisca className="cena-foto-faisca anima" />
            </motion.div>
          </div>
          <motion.span className="cena-barra" style={{ scaleX: barra, backgroundColor: tinta }} aria-hidden="true" />
        </motion.div>

        <motion.div className="cena-gotas" style={{ top: topoGotas, y: yGotas, color: fundo }} aria-hidden="true"><Gotas semente={7} /></motion.div>

        <motion.div className="cena-visor" style={{ y: yVisor, rotate: giroVisor }} aria-hidden="true">
          <Visor cor={liquido} nivel={0.72} tampaX={tampaX} tampaY={tampaY} tampaGiro={tampaGiro} gota={gota} />
        </motion.div>
      </div>
    </div>
  </section>
}

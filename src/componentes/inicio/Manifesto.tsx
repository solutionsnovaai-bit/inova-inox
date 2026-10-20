import { Fragment, useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { CENAS, FOTOS } from '../../lib/midia'
import { ease, useMovimento } from '../../lib/movimento'
import { Revelar } from '../ui/Revelar'
import { Faisca, reflexo } from '../ui/Pecas'

const TEXTO = 'Cada conexão passa pelo torno, pela solda e pelo polimento antes de chegar na sua linha. Inox 304 ou 316, na medida da tabela ou do seu desenho.'
const DESTAQUES = 2

function Palavra({ p, faixa, children, destaque }: { p: MotionValue<number>; faixa: [number, number]; children: string; destaque: boolean }) {
  const opacity = useTransform(p, faixa, [0.13, 1])
  const y = useTransform(p, faixa, [6, 0])
  return <motion.span className={destaque ? 'palavra is-destaque' : 'palavra'} style={{ opacity, y }}>{children}</motion.span>
}

/** O texto acende palavra por palavra conforme a leitura avança; as fotos andam em profundidades diferentes. */
export function Manifesto() {
  const { reduzido } = useMovimento()
  const texto = useRef<HTMLParagraphElement>(null)
  const fotosRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: texto, offset: ['start .85', 'end .5'] })
  const { scrollYProgress: pf } = useScroll({ target: fotosRef, offset: ['start end', 'end start'] })
  const yA = useTransform(pf, [0, 1], ['10%', '-14%'])
  const yB = useTransform(pf, [0, 1], ['30%', '-30%'])
  const giroB = useTransform(pf, [0, 1], [8, -4])
  const palavras = TEXTO.split(' ')
  const a = CENAS.polimento, b = FOTOS['curvas-polidas']

  return <section id="essencia" className="secao manifesto" aria-labelledby="manifesto-titulo">
    <div className="conteiner manifesto-grade">
      <div className="manifesto-fotos" ref={fotosRef} aria-hidden="true">
        <motion.div className="manifesto-foto-a" style={reduzido ? undefined : { y: yA }} initial="fora" whileInView="dentro" viewport={{ once: true, amount: 0.3 }}>
          <motion.div variants={{ fora: { clipPath: 'inset(100% 0% 0% 0%)' }, dentro: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 1.5, ease: ease.quint } } }}>
            <div className="chanfro aco-reflexo" onPointerMove={reflexo}><img src={a.src} alt="" width={a.w} height={a.h} loading="lazy" decoding="async" /></div>
          </motion.div>
        </motion.div>
        <motion.div className="manifesto-foto-b" style={reduzido ? undefined : { y: yB, rotate: giroB }}
          initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.4, delay: 0.25, ease: ease.expo }}>
          <div className="chanfro aco-reflexo" onPointerMove={reflexo}><img src={b.src} alt="" width={b.w} height={b.h} loading="lazy" decoding="async" /></div>
        </motion.div>
        <Faisca className="manifesto-faisca anima" />
      </div>
      <div className="manifesto-texto">
        <Revelar><p className="selo-texto" id="manifesto-titulo">Feito na Inova</p></Revelar>
        <p ref={texto} className="manifesto-frase">
          {reduzido ? TEXTO : palavras.map((w, i) => <Fragment key={i}>
            <Palavra p={scrollYProgress} faixa={[i / palavras.length, (i + 1) / palavras.length]} destaque={i < DESTAQUES}>{w}</Palavra>{' '}
          </Fragment>)}
        </p>
        <Revelar delay={0.1}><p className="manifesto-assinatura"><Faisca /> Usinagem · Polimento · Solda</p></Revelar>
      </div>
    </div>
  </section>
}

import { Fragment, useRef, useState, type PointerEvent } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useVelocity } from 'motion/react'
import { ArrowUpRight, Plus } from 'lucide-react'
import { FOTOS } from '../../lib/midia'
import { PRODUTOS_BASE } from '../../loja/produtos'
import { useEstoque } from '../../loja/estoque'
import { Link, linkLoja } from '../../loja/rotas'
import { plural } from '../../loja/util'
import { ease, usePonteiroFino } from '../../lib/movimento'
import { Faixa, Revelar, Titulo } from '../ui/Revelar'
import { Faisca } from '../ui/Pecas'
import { Desenho } from '../ui/Peca'

/** Duas faixas cruzadas (chapa e azul) que correm em sentidos opostos e reagem à rolagem. */
export function Faixas() {
  const itens = (lista: string[], italico: boolean) => lista.map((t) => <Fragment key={t}>
    <span className={italico ? 'faixa-texto is-italico' : 'faixa-texto'}>{t}</span><Faisca className="faixa-faisca" />
  </Fragment>)
  return <section className="faixas" aria-label="Tri-Clamp, SMS, RJT, DIN, OD, BSP e NPT. Usinagem, polimento e solda.">
    <Faixa className="faixa-chapa" velocidade={2.2}>{itens(['Tri-Clamp', 'SMS', 'RJT', 'DIN', 'OD', 'BSP', 'NPT'], false)}</Faixa>
    <Faixa className="faixa-azul" velocidade={-3}>{itens(['Usinagem', 'Polimento', 'Solda', 'Inox 304 e 316'], true)}</Faixa>
  </section>
}

const CAPAS: Record<string, string> = { 'tri-clamp': 'conexoes-tri-clamp', solda: 'curvas-polidas', roscadas: 'uniao-rosca' }
const DESENHOS: Record<string, string> = { visores: 'visor-tubular', acessorios: 'spray-ball', industrial: 'cotovelo-90-femea' }

/** Capa da linha: foto real da oficina quando existe; senão, o desenho da peça mais típica. */
export function CapaLinha({ id }: { id: string }) {
  const foto = CAPAS[id] ? FOTOS[CAPAS[id]] : undefined
  if (foto) return <img src={foto.src} alt="" width={foto.w} height={foto.h} loading="lazy" decoding="async" />
  const base = PRODUTOS_BASE.find((b) => b.slug === DESENHOS[id]) ?? PRODUTOS_BASE.find((b) => b.categoria === id) ?? PRODUTOS_BASE[0]
  return <span className="capa-desenho"><Desenho desenho={base.desenho} alt="" /></span>
}

/** As linhas da loja em lista grande: no desktop a capa segue o mouse; abrir mostra os grupos. */
export function Linhas() {
  const fino = usePonteiroFino()
  const { categorias, produtos } = useEstoque()
  const lista = useRef<HTMLDivElement>(null)
  const [aberta, setAberta] = useState<string | null>(null)
  const [sobre, setSobre] = useState<string | null>(null)
  const mx = useMotionValue(0), my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 220, damping: 26, mass: 0.5 })
  const y = useSpring(my, { stiffness: 220, damping: 26, mass: 0.5 })
  const giro = useTransform(useSpring(useVelocity(mx), { stiffness: 120, damping: 20 }), [-2000, 2000], [-12, 12])

  const mover = (e: PointerEvent<HTMLDivElement>) => {
    if (!fino || !lista.current) return
    const r = lista.current.getBoundingClientRect()
    mx.set(e.clientX - r.left)
    my.set(e.clientY - r.top)
  }

  return <section id="linhas" className="secao linhas" aria-labelledby="linhas-titulo">
    <div className="conteiner">
      <div className="secao-cabeca">
        <div>
          <Revelar><p className="selo-texto">A loja · {plural(categorias.length, 'linha', 'linhas')}</p></Revelar>
          <Titulo id="linhas-titulo" linhas={['Escolha']} destaque="a sua linha." />
        </div>
        <Revelar delay={0.1}><p className="lead">As peças do catálogo técnico, medida por medida, em inox 304 e 316. Abra a linha e vá direto ao que a sua instalação usa.</p></Revelar>
      </div>

      <div ref={lista} className="linhas-lista" onPointerMove={mover} onPointerLeave={() => setSobre(null)}>
        {categorias.map((cat, i) => {
          const aqui = produtos.filter((p) => p.categoria === cat.id)
          const grupos = [...new Set(aqui.map((p) => p.grupo))]
          const estaAberta = aberta === cat.id
          return <Revelar key={cat.id} delay={i * 0.05} className={`linha-item ${estaAberta ? 'is-aberta' : ''}`}>
            <h3>
              <button type="button" className="linha-botao" aria-expanded={estaAberta} aria-controls={`linha-${cat.id}`}
                onClick={() => setAberta(estaAberta ? null : cat.id)} onPointerEnter={() => setSobre(cat.id)}>
                <span className="linha-numero">{String(i + 1).padStart(2, '0')}</span>
                <span className="linha-mini chanfro" aria-hidden="true"><CapaLinha id={cat.id} /></span>
                <span className="linha-nome">{cat.nome}</span>
                <span className="linha-tags" aria-hidden="true">{plural(cat.total, 'peça', 'peças')}</span>
                <span className="linha-mais" aria-hidden="true"><Plus /></span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {estaAberta && <motion.div id={`linha-${cat.id}`} className="linha-corpo" role="region"
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.7, ease: ease.expo }}>
                <div className="linha-corpo-dentro">
                  <p>{cat.texto}</p>
                  <ul className="linha-grupos">{grupos.map((g) => <li key={g}>{g}</li>)}</ul>
                  <Link className="link-seta" href={linkLoja(cat.id)}>Ver as {plural(cat.total, 'peça', 'peças')}<ArrowUpRight aria-hidden="true" /></Link>
                </div>
              </motion.div>}
            </AnimatePresence>
          </Revelar>
        })}

        {fino && <motion.div className="linhas-seguidor" aria-hidden="true" style={{ x, y, rotate: giro }}>
          <AnimatePresence>
            {sobre !== null && <motion.div key={sobre} className="chanfro linhas-seguidor-foto"
              initial={{ opacity: 0, scale: 0.6, clipPath: 'inset(100% 0% 0% 0%)' }}
              animate={{ opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
              exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.6, ease: ease.expo }}>
              <CapaLinha id={sobre} />
            </motion.div>}
          </AnimatePresence>
        </motion.div>}
      </div>
    </div>
  </section>
}

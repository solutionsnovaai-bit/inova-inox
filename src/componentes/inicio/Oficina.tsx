import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Minus, Play, Plus, X } from 'lucide-react'
import { OFICINA, type Foto } from '../../lib/midia'
import { mensagens, waLink } from '../../loja/config'
import { ease, useTrava } from '../../lib/movimento'
import { Revelar, Titulo } from '../ui/Revelar'
import { Faisca, inclinar, soltar } from '../ui/Pecas'

const FILTROS: { rotulo: string; teste: (f: Foto) => boolean }[] = [
  { rotulo: 'Tudo', teste: () => true },
  { rotulo: 'Tri-Clamp', teste: (f) => f.categoria === 'Tri-Clamp' },
  { rotulo: 'Curvas e tês', teste: (f) => f.categoria === 'Curvas' || f.categoria === 'Tês' },
  { rotulo: 'Roscadas', teste: (f) => f.categoria === 'Roscadas' },
  { rotulo: 'Serviços', teste: (f) => ['Usinagem', 'Soldagem', 'Polimento'].includes(f.categoria) },
  { rotulo: 'Vídeos', teste: (f) => Boolean(f.video) },
]
const INICIAIS = 8

/** Foto grande: setas, teclado, arrastar para os lados, Esc para fechar e miniaturas. Vídeo toca aqui. */
function Lightbox({ fotos, inicial, fechar }: { fotos: Foto[]; inicial: number; fechar: () => void }) {
  const [i, setI] = useState(inicial)
  const [dir, setDir] = useState(0)
  const caixa = useRef<HTMLDivElement>(null)
  const toque = useRef<{ x: number; id: number } | null>(null)
  const f = fotos[i]
  const ir = (d: number) => { setDir(d); setI((v) => (v + d + fotos.length) % fotos.length) }
  useTrava(true)

  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null
    caixa.current?.querySelector<HTMLElement>('.lb-fechar')?.focus()
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar()
      else if (e.key === 'ArrowRight') ir(1)
      else if (e.key === 'ArrowLeft') ir(-1)
    }
    document.addEventListener('keydown', tecla)
    return () => { document.removeEventListener('keydown', tecla); anterior?.focus?.() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    caixa.current?.querySelector('.lb-miniaturas .is-ativa')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [i])

  const inicio = (e: PointerEvent) => { toque.current = { x: e.clientX, id: e.pointerId } }
  const fim = (e: PointerEvent) => {
    const t = toque.current
    toque.current = null
    if (!t || t.id !== e.pointerId) return
    const dx = e.clientX - t.x
    if (Math.abs(dx) > 50) ir(dx < 0 ? 1 : -1)
  }

  return <motion.div ref={caixa} className="lb" role="dialog" aria-modal="true" aria-label={f.alt}
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} data-lenis-prevent>
    <button type="button" className="lb-fundo" aria-label="Fechar" tabIndex={-1} onClick={fechar} />
    <div className="lb-topo">
      <span className="lb-contador">{String(i + 1).padStart(2, '0')} <i>/</i> {String(fotos.length).padStart(2, '0')}</span>
      <button type="button" className="lb-fechar" onClick={fechar} aria-label="Fechar"><X aria-hidden="true" /></button>
    </div>
    <div className="lb-palco" onPointerDown={inicio} onPointerUp={fim} onPointerCancel={() => { toque.current = null }}>
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.figure key={f.id} className="lb-figura" initial={{ opacity: 0, x: dir * 80, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: dir * -80, scale: 0.96 }} transition={{ duration: 0.6, ease: ease.expo }}>
          {f.video
            ? <video src={f.video} poster={f.src} autoPlay muted loop playsInline controls />
            : <img src={f.src} alt={f.alt} width={f.w} height={f.h} draggable={false} />}
        </motion.figure>
      </AnimatePresence>
      <button type="button" className="lb-seta lb-ant" onClick={() => ir(-1)} aria-label="Anterior"><ArrowLeft aria-hidden="true" /></button>
      <button type="button" className="lb-seta lb-prox" onClick={() => ir(1)} aria-label="Próxima"><ArrowRight aria-hidden="true" /></button>
    </div>
    <div className="lb-base">
      <div className="lb-legenda" aria-live="polite"><small>{f.categoria}</small><strong>{f.alt.replace(/^Vídeo: /, '')}</strong></div>
      <a className="botao azul" href={waLink(mensagens.cotar(f.alt.replace(/^Vídeo: /, '').toLowerCase()))} target="_blank" rel="noopener noreferrer">
        <span className="botao-texto">Cotar peças assim</span><span className="botao-icone" aria-hidden="true"><ArrowUpRight /></span>
      </a>
    </div>
    <div className="lb-miniaturas" aria-hidden="true">
      {fotos.map((m, k) => <button key={m.id} type="button" tabIndex={-1} className={k === i ? 'is-ativa' : ''} onClick={() => { setDir(k > i ? 1 : -1); setI(k) }}>
        <img src={m.src} alt="" loading="lazy" />
      </button>)}
    </div>
  </motion.div>
}

/** A oficina de verdade: filtros com marcador que desliza e cartões que inclinam. Toque abre grande. */
export function Oficina() {
  const [filtro, setFiltro] = useState(0)
  const [todas, setTodas] = useState(false)
  const [aberta, setAberta] = useState<{ fotos: Foto[]; i: number } | null>(null)
  const filtradas = useMemo(() => OFICINA.filter(FILTROS[filtro].teste), [filtro])
  const visiveis = todas || filtro !== 0 ? filtradas : filtradas.slice(0, INICIAIS)

  return <section id="oficina" className="secao oficina escuro" aria-labelledby="oficina-titulo">
    <div className="conteiner">
      <div className="secao-cabeca">
        <div>
          <Revelar><p className="selo-texto">Oficina e estoque</p></Revelar>
          <Titulo id="oficina-titulo" linhas={['Sem foto']} destaque="de banco." />
        </div>
        <Revelar delay={0.1} className="oficina-lado">
          <p className="lead">Peças reais na bancada e no estoque da Inova, e o trabalho de torno, solda e polimento.</p>
          <p className="oficina-contagem"><Faisca /> {OFICINA.length} fotos e vídeos</p>
        </Revelar>
      </div>

      <LayoutGroup>
        <div className="filtros" role="group" aria-label="Filtrar a oficina">
          {FILTROS.map((f, k) => <button key={f.rotulo} type="button" aria-pressed={filtro === k} className={filtro === k ? 'is-ativo' : ''}
            onClick={() => { setFiltro(k); setTodas(false) }}>
            {filtro === k && <motion.span layoutId="oficina-marcador" className="filtro-marcador" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
            <span className="filtro-rotulo">{f.rotulo}</span>
          </button>)}
        </div>

        <motion.ul layout className="oficina-grade">
          <AnimatePresence mode="popLayout">
            {visiveis.map((f, i) => <motion.li key={f.id} layout initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.7, delay: Math.min(i, 8) * 0.04, ease: ease.expo }}>
              <button type="button" className="cartao" data-cursor="ver" onPointerMove={inclinar} onPointerLeave={soltar}
                onClick={() => setAberta({ fotos: filtradas, i: filtradas.indexOf(f) })} aria-label={`Ampliar: ${f.alt}`}>
                <span className="cartao-foto chanfro">
                  <img src={f.src} alt={f.alt} width={f.w} height={f.h} loading="lazy" decoding="async" />
                  {f.video && <span className="cartao-video" aria-hidden="true"><Play /></span>}
                </span>
                <span className="cartao-legenda"><small>{f.categoria}</small><strong>{f.alt.replace(/^Vídeo: /, '')}</strong><ArrowUpRight aria-hidden="true" /></span>
              </button>
            </motion.li>)}
          </AnimatePresence>
        </motion.ul>
      </LayoutGroup>

      {filtro === 0 && filtradas.length > INICIAIS && <div className="oficina-mais">
        <button type="button" className="botao contorno" onClick={() => setTodas((t) => !t)} aria-expanded={todas}>
          <span className="botao-texto">{todas ? 'Mostrar menos' : `Ver tudo (${filtradas.length})`}</span>
          <span className="botao-icone" aria-hidden="true">{todas ? <Minus /> : <Plus />}</span>
        </button>
      </div>}
    </div>
    <AnimatePresence>{aberta && <Lightbox key="lb" fotos={aberta.fotos} inicial={aberta.i} fechar={() => setAberta(null)} />}</AnimatePresence>
  </section>
}

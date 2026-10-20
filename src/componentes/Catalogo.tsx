import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type RefObject } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { INDICE_CATALOGO, recortePagina, TITULOS_PAGINAS, TOTAL_PAGINAS } from '../lib/midia'
import { Cabecalho, IconeWhats } from './ui'
import { linkWhats } from './Topo'

/* Livro: a capa abre sozinha à direita; depois as páginas vêm em pares. */
const aberturaDe = (p: number) => Math.ceil(p / 2)
const ULTIMA = aberturaDe(TOTAL_PAGINAS - 1)
const esquerda = (a: number) => (a === 0 ? 'guarda' : 2 * a - 1)
const direita = (a: number) => (2 * a < TOTAL_PAGINAS ? 2 * a : null)
const primeiraDe = (a: number) => (a === 0 ? 0 : 2 * a - 1)
type Conteudo = number | 'guarda' | null
const msgPagina = (p: number) => `Olá! Vi a página ${p} do catálogo técnico no site da Inova Inox e quero cotar uma peça.`

function useMidia(q: string) {
  const [b, setB] = useState(() => typeof window !== 'undefined' && matchMedia(q).matches)
  useEffect(() => { const m = matchMedia(q); const f = () => setB(m.matches); f(); m.addEventListener('change', f); return () => m.removeEventListener('change', f) }, [q])
  return b
}

function preparar(p: number) {
  if (p < 0 || p >= TOTAL_PAGINAS) return
  const img = new Image()
  img.src = recortePagina(p).src
}

function Pagina({ indice, prioridade }: { indice: number; prioridade?: boolean }) {
  const { src, coluna, linha } = recortePagina(indice)
  return <span className="pagina-recorte">
    <img src={src} alt={`Catálogo técnico, página ${indice + 1}: ${TITULOS_PAGINAS[indice]}`} loading={prioridade ? 'eager' : 'lazy'} decoding="async" draggable={false}
      style={{ left: `${-coluna * 100}%`, top: `${-linha * 100}%` }} />
  </span>
}

function Guarda() {
  return <div className="cat-guarda">
    <span className="etiqueta"><i />Catálogo técnico</span>
    <p>Medida por <em>medida.</em></p>
    <ul>
      <li>Use as setas ou o teclado para folhear.</li>
      <li>Clique numa página para ampliar.</li>
      <li>Ø é o diâmetro da conexão; A, B e C são as cotas do desenho ao lado de cada tabela.</li>
    </ul>
  </div>
}

function Face({ c, ampliar }: { c: Conteudo; ampliar?: (p: number) => void }) {
  if (c === 'guarda') return <Guarda />
  if (c === null) return <span className="pagina-recorte is-vazia" />
  return <button type="button" className="cat-pagina-botao" onClick={() => ampliar?.(c)} aria-label={`Ampliar a página ${c + 1}`}><Pagina indice={c} prioridade /></button>
}

function Livro({ pagina, irPara, ampliar, teclado }: { pagina: number; irPara: (p: number) => void; ampliar: (p: number) => void; teclado: boolean }) {
  const alvo = aberturaDe(pagina)
  const [atual, setAtual] = useState(alvo)
  const [virada, setVirada] = useState<{ para: number; sentido: 1 | -1 } | null>(null)
  useEffect(() => { if (!virada && alvo !== atual) setVirada({ para: alvo, sentido: alvo > atual ? 1 : -1 }) }, [alvo, atual, virada])
  useEffect(() => { [primeiraDe(alvo + 1), primeiraDe(alvo + 1) + 1, primeiraDe(alvo - 1)].forEach(preparar) }, [alvo])
  const passo = useCallback((s: 1 | -1) => {
    const d = Math.max(0, Math.min(ULTIMA, alvo + s))
    if (d !== alvo) irPara(primeiraDe(d))
  }, [alvo, irPara])
  useEffect(() => {
    if (!teclado) return
    const t = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, select')) return
      if (e.key === 'ArrowRight') passo(1)
      if (e.key === 'ArrowLeft') passo(-1)
    }
    addEventListener('keydown', t)
    return () => removeEventListener('keydown', t)
  }, [teclado, passo])

  let bE: Conteudo = esquerda(atual), bD: Conteudo = direita(atual), frente: Conteudo = null, verso: Conteudo = null
  if (virada?.sentido === 1) { bD = direita(virada.para); frente = direita(atual); verso = esquerda(virada.para) }
  else if (virada?.sentido === -1) { bE = esquerda(virada.para); frente = esquerda(atual); verso = direita(virada.para) }

  return <div className="livro-palco">
    <button type="button" className="icone-redondo is-escuro" onClick={() => passo(-1)} disabled={alvo === 0} aria-label="Voltar a página"><ChevronLeft /></button>
    <div className="livro">
      <div className="livro-lado"><Face c={bE} ampliar={ampliar} /></div>
      <div className="livro-lado"><Face c={bD} ampliar={ampliar} /></div>
      <span className="livro-lombada" aria-hidden="true" />
      {virada && <motion.div className={`livro-folha ${virada.sentido === 1 ? 'is-dir' : 'is-esq'}`} initial={{ rotateY: 0 }}
        animate={{ rotateY: virada.sentido === 1 ? -180 : 180 }} transition={{ duration: 0.8, ease: [0.645, 0.045, 0.355, 1] }}
        onAnimationComplete={() => { setAtual(virada.para); setVirada(null) }} aria-hidden="true">
        <div className="livro-face"><Face c={frente} /></div>
        <div className="livro-face is-verso"><Face c={verso} /></div>
      </motion.div>}
    </div>
    <button type="button" className="icone-redondo is-escuro" onClick={() => passo(1)} disabled={alvo === ULTIMA} aria-label="Avançar a página"><ChevronRight /></button>
  </div>
}

function Trilho({ pagina, mudar, ampliar, trilho }: { pagina: number; mudar: (p: number) => void; ampliar: (p: number) => void; trilho: RefObject<HTMLDivElement | null> }) {
  const q = useRef(0)
  const rolar = () => {
    cancelAnimationFrame(q.current)
    q.current = requestAnimationFrame(() => {
      const t = trilho.current
      if (!t) return
      const centro = t.scrollLeft + t.clientWidth / 2
      let perto = 0, menor = Infinity
      Array.from(t.children).forEach((f, i) => { const el = f as HTMLElement; const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - centro); if (d < menor) { menor = d; perto = i } })
      if (perto !== pagina) mudar(perto)
    })
  }
  return <div ref={trilho} className="cat-trilho" onScroll={rolar}>
    {TITULOS_PAGINAS.map((t, i) => <button key={t + i} type="button" className="cat-trilho-item" onClick={() => ampliar(i)} aria-label={`Ampliar a página ${i + 1}`}>
      <Pagina indice={i} prioridade={Math.abs(i - pagina) <= 1} />
    </button>)}
  </div>
}

function Ampliada({ pagina, mudar, fechar }: { pagina: number; mudar: (p: number) => void; fechar: () => void }) {
  const area = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(false)
  const alvo = useRef<{ x: number; y: number } | null>(null)
  useEffect(() => {
    document.body.classList.add('travado')
    const t = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar()
      if (e.key === 'ArrowRight' && pagina < TOTAL_PAGINAS - 1) mudar(pagina + 1)
      if (e.key === 'ArrowLeft' && pagina > 0) mudar(pagina - 1)
    }
    addEventListener('keydown', t)
    return () => { removeEventListener('keydown', t); document.body.classList.remove('travado') }
  }, [pagina, mudar, fechar])
  useEffect(() => { area.current?.scrollTo({ top: 0, left: 0 }); preparar(pagina + 1); preparar(pagina - 1) }, [pagina])
  useLayoutEffect(() => {
    const el = area.current
    if (!el || !alvo.current) return
    const f = el.firstElementChild as HTMLElement
    el.scrollLeft = alvo.current.x * f.offsetWidth - el.clientWidth / 2
    el.scrollTop = alvo.current.y * f.offsetHeight - el.clientHeight / 2
    alvo.current = null
  }, [zoom])
  const alternar = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    alvo.current = zoom ? null : { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
    setZoom((z) => !z)
  }
  return <motion.div className="cat-ampliada" role="dialog" aria-modal="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
    <header>
      <p><b>{pagina + 1} / {TOTAL_PAGINAS}</b> {TITULOS_PAGINAS[pagina]}</p>
      <div>
        <button type="button" className="botao botao-vidro botao-p" onClick={() => setZoom((z) => !z)}>{zoom ? 'Página inteira' : 'Ampliar'}</button>
        <button type="button" className="icone-redondo is-vidro" onClick={fechar} aria-label="Fechar" autoFocus><X /></button>
      </div>
    </header>
    <div ref={area} className="cat-ampliada-area">
      <div className={`cat-ampliada-folha ${zoom ? 'is-zoom' : ''}`} onClick={alternar}><Pagina key={pagina} indice={pagina} prioridade /></div>
    </div>
    <footer>
      <button type="button" className="icone-redondo is-vidro" onClick={() => mudar(pagina - 1)} disabled={pagina === 0} aria-label="Página anterior"><ChevronLeft /></button>
      <a className="botao botao-whats botao-p" href={linkWhats(msgPagina(pagina + 1))} target="_blank" rel="noopener noreferrer"><IconeWhats />Cotar peça desta página</a>
      <button type="button" className="icone-redondo is-vidro" onClick={() => mudar(pagina + 1)} disabled={pagina === TOTAL_PAGINAS - 1} aria-label="Próxima página"><ChevronRight /></button>
    </footer>
  </motion.div>
}

const TODOS = INDICE_CATALOGO.flatMap((g) => g.itens)
const fimDe = (p: number) => { const prox = TODOS.find((i) => i.pagina > p); return prox ? prox.pagina - 1 : TOTAL_PAGINAS - 1 }

/** Catálogo técnico para folhear: livro no computador, uma página por vez no celular. */
export function Catalogo({ pedido }: { pedido: { pagina: number; vez: number } }) {
  const largo = useMidia('(min-width: 1024px) and (orientation: landscape)')
  const [pagina, setPagina] = useState(0)
  const [ampliada, setAmpliada] = useState<number | null>(null)
  const [naTela, setNaTela] = useState(false)
  const trilho = useRef<HTMLDivElement>(null)
  const secao = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = secao.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setNaTela(e.isIntersecting), { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const rolarTrilho = useCallback((p: number, suave = true) => {
    const t = trilho.current, item = t?.children[p] as HTMLElement | undefined
    if (t && item) t.scrollTo({ left: item.offsetLeft - (t.clientWidth - item.offsetWidth) / 2, behavior: suave ? 'smooth' : 'auto' })
  }, [])
  const irPara = useCallback((p: number) => {
    const d = Math.max(0, Math.min(TOTAL_PAGINAS - 1, p))
    setPagina(d)
    if (!largo) rolarTrilho(d)
  }, [largo, rolarTrilho])

  /* Pedido vindo de fora (botão "Ver no catálogo técnico" da peça). */
  useEffect(() => { if (pedido.vez) { irPara(pedido.pagina); secao.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) } }, [pedido, irPara])

  const fechar = () => { if (ampliada !== null) { setPagina(ampliada); if (!largo) rolarTrilho(ampliada, false) } setAmpliada(null) }
  const a = aberturaDe(pagina)
  const visiveis = largo ? [esquerda(a), direita(a)].filter((p): p is number => typeof p === 'number') : [pagina]
  const aceso = (p: number) => visiveis.some((v) => v >= p && v <= fimDe(p))
  const rotulo = largo ? (a === 0 ? `Capa · ${TOTAL_PAGINAS} páginas` : `Páginas ${primeiraDe(a) + 1}–${Math.min(TOTAL_PAGINAS, primeiraDe(a) + 2)} de ${TOTAL_PAGINAS}`) : `${pagina + 1} / ${TOTAL_PAGINAS}`

  return <section id="catalogo" ref={secao} className="secao catalogo">
    <div className="conteiner">
      <Cabecalho claro tag="Catálogo técnico" titulo={<>As medidas de cada peça,<br /><em>página por página.</em></>} texto="Folheie aqui mesmo, sem baixar PDF. Toque na página para ampliar e cotar a peça direto dela." />
      <div className="cat-grade">
        <nav className="cat-indice" aria-label="Índice do catálogo">
          {INDICE_CATALOGO.map((g) => <div key={g.grupo}>
            <h3>{g.grupo}</h3>
            <ul>{g.itens.map((it) => <li key={it.rotulo}>
              <button type="button" data-ativo={aceso(it.pagina) || undefined} onClick={() => irPara(it.pagina)}><span>{it.rotulo}</span><b>{it.pagina + 1}</b></button>
            </li>)}</ul>
          </div>)}
        </nav>
        <div className="cat-visor">
          {largo ? <Livro pagina={pagina} irPara={setPagina} ampliar={setAmpliada} teclado={naTela && ampliada === null} /> : <Trilho pagina={pagina} mudar={setPagina} ampliar={setAmpliada} trilho={trilho} />}
          <div className="cat-controles">
            {!largo && <button type="button" className="icone-redondo is-vidro" onClick={() => irPara(pagina - 1)} disabled={pagina === 0} aria-label="Página anterior"><ChevronLeft /></button>}
            <p><b>{rotulo}</b><span>{[...new Set(visiveis.map((p) => TITULOS_PAGINAS[p]))].join(' · ')}</span></p>
            {!largo && <button type="button" className="icone-redondo is-vidro" onClick={() => irPara(pagina + 1)} disabled={pagina === TOTAL_PAGINAS - 1} aria-label="Próxima página"><ChevronRight /></button>}
          </div>
        </div>
      </div>
    </div>
    <AnimatePresence>{ampliada !== null && <Ampliada pagina={ampliada} mudar={setAmpliada} fechar={fechar} />}</AnimatePresence>
  </section>
}

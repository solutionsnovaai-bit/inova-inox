import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type RefObject } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { INDICE_CATALOGO, recortePagina, TITULOS_PAGINAS, TOTAL_PAGINAS } from '../../lib/midia'
import { mensagens, waLink } from '../../loja/config'
import { linkCatalogo, linkLoja, navegar } from '../../loja/rotas'
import { ease, useCenaAtiva, useMidia, useMovimento, useTrava } from '../../lib/movimento'
import { Revelar, Titulo } from '../ui/Revelar'
import { Botao, BrandIcon } from '../ui/Pecas'

/* Livro: a capa abre sozinha à direita; depois as páginas vêm em pares. */
const aberturaDe = (pagina: number) => Math.ceil(pagina / 2)
const ULTIMA = aberturaDe(TOTAL_PAGINAS - 1)
const esquerda = (a: number) => (a === 0 ? 'guarda' : 2 * a - 1)
const direita = (a: number) => (2 * a < TOTAL_PAGINAS ? 2 * a : null)
const primeiraDe = (a: number) => (a === 0 ? 0 : 2 * a - 1)
type Conteudo = number | 'guarda' | null

function preparar(pagina: number) {
  if (pagina < 0 || pagina >= TOTAL_PAGINAS) return
  const img = new Image()
  img.decoding = 'async'
  img.src = recortePagina(pagina).src
}

function Pagina({ indice, prioridade }: { indice: number; prioridade?: boolean }) {
  const { src, coluna, linha } = recortePagina(indice)
  return <span className="pagina-recorte cat-pagina">
    <img src={src} alt={`Catálogo técnico, página ${indice + 1}: ${TITULOS_PAGINAS[indice]}`} loading={prioridade ? 'eager' : 'lazy'} decoding="async" draggable={false}
      style={{ left: `${-coluna * 100}%`, top: `${-linha * 100}%` }} />
  </span>
}

function Guarda() {
  return <div className="cat-guarda">
    <span className="selo-texto">Catálogo técnico</span>
    <p className="cat-guarda-titulo">Medida por <em>medida.</em></p>
    <ul>
      <li>Use as setas ou o teclado para folhear.</li>
      <li>Clique numa página para ampliar.</li>
      <li>Ø é o diâmetro da conexão; A, B e C são as cotas do desenho ao lado de cada tabela.</li>
    </ul>
    <Botao href={linkLoja()} variante="azul">Comprar na loja</Botao>
  </div>
}

function Face({ conteudo, ampliar }: { conteudo: Conteudo; ampliar?: (p: number) => void }) {
  if (conteudo === 'guarda') return <Guarda />
  if (conteudo === null) return <span className="cat-pagina is-vazia" />
  return <button type="button" className="cat-pagina-botao" onClick={() => ampliar?.(conteudo)} data-cursor="ampliar"
    aria-label={`Ampliar a página ${conteudo + 1}: ${TITULOS_PAGINAS[conteudo]}`}>
    <Pagina indice={conteudo} prioridade />
  </button>
}

/** Desktop: o catálogo aberto como livro; a folha vira em 3D em torno da lombada. */
function Livro({ pagina, irPara, ampliar, teclado }: { pagina: number; irPara: (p: number) => void; ampliar: (p: number) => void; teclado: boolean }) {
  const { reduzido } = useMovimento()
  const alvo = aberturaDe(pagina)
  const [atual, setAtual] = useState(alvo)
  const [virada, setVirada] = useState<{ para: number; sentido: 1 | -1 } | null>(null)

  useEffect(() => {
    if (virada || alvo === atual) return
    if (reduzido) { setAtual(alvo); return }
    setVirada({ para: alvo, sentido: alvo > atual ? 1 : -1 })
  }, [alvo, atual, virada, reduzido])
  useEffect(() => { [primeiraDe(alvo + 1), primeiraDe(alvo + 1) + 1, primeiraDe(alvo - 1)].forEach(preparar) }, [alvo])

  const passo = useCallback((s: 1 | -1) => {
    const destino = Math.max(0, Math.min(ULTIMA, alvo + s))
    if (destino !== alvo) irPara(primeiraDe(destino))
  }, [alvo, irPara])

  useEffect(() => {
    if (!teclado) return
    const tecla = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, select')) return
      if (e.key === 'ArrowRight') passo(1)
      if (e.key === 'ArrowLeft') passo(-1)
    }
    addEventListener('keydown', tecla)
    return () => removeEventListener('keydown', tecla)
  }, [teclado, passo])

  let baseE: Conteudo = esquerda(atual), baseD: Conteudo = direita(atual), frente: Conteudo = null, verso: Conteudo = null
  if (virada?.sentido === 1) { baseD = direita(virada.para); frente = direita(atual); verso = esquerda(virada.para) }
  else if (virada?.sentido === -1) { baseE = esquerda(virada.para); frente = esquerda(atual); verso = direita(virada.para) }

  return <div className="livro-palco">
    <button type="button" className="cat-seta" onClick={() => passo(-1)} disabled={alvo === 0} aria-label="Voltar a página"><ChevronLeft /></button>
    <div className="livro" aria-label="Catálogo técnico aberto">
      <div className="livro-lado"><Face conteudo={baseE} ampliar={ampliar} /></div>
      <div className="livro-lado"><Face conteudo={baseD} ampliar={ampliar} /></div>
      <span className="livro-lombada" aria-hidden="true" />
      {virada && <motion.div className={`livro-folha ${virada.sentido === 1 ? 'is-dir' : 'is-esq'}`} initial={{ rotateY: 0 }}
        animate={{ rotateY: virada.sentido === 1 ? -180 : 180 }} transition={{ duration: 0.8, ease: [0.645, 0.045, 0.355, 1] }}
        onAnimationComplete={() => { setAtual(virada.para); setVirada(null) }} aria-hidden="true">
        <div className="livro-face"><Face conteudo={frente} /><span className="livro-sombra" /></div>
        <div className="livro-face is-verso"><Face conteudo={verso} /><span className="livro-sombra" /></div>
      </motion.div>}
    </div>
    <button type="button" className="cat-seta" onClick={() => passo(1)} disabled={alvo === ULTIMA} aria-label="Avançar a página"><ChevronRight /></button>
  </div>
}

/** Celular: uma página por vez, deslizando com o dedo. */
function Trilho({ pagina, mudar, ampliar, trilho }: { pagina: number; mudar: (p: number) => void; ampliar: (p: number) => void; trilho: RefObject<HTMLDivElement | null> }) {
  const quadro = useRef(0)
  const rolar = () => {
    cancelAnimationFrame(quadro.current)
    quadro.current = requestAnimationFrame(() => {
      const t = trilho.current
      if (!t) return
      const centro = t.scrollLeft + t.clientWidth / 2
      let perto = 0, menor = Infinity
      Array.from(t.children).forEach((f, i) => {
        const el = f as HTMLElement
        const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - centro)
        if (d < menor) { menor = d; perto = i }
      })
      if (perto !== pagina) mudar(perto)
    })
  }
  return <div ref={trilho} className="cat-trilho" onScroll={rolar} aria-label="Páginas do catálogo" data-lenis-prevent>
    {TITULOS_PAGINAS.map((t, i) => <button key={t + i} type="button" className="cat-trilho-item" onClick={() => ampliar(i)} aria-label={`Ampliar a página ${i + 1}: ${t}`}>
      <Pagina indice={i} prioridade={Math.abs(i - pagina) <= 1} />
    </button>)}
  </div>
}

/** Página ampliada em tela cheia. Toque alterna entre a página inteira e o zoom. */
function Ampliada({ pagina, mudar, fechar }: { pagina: number; mudar: (p: number) => void; fechar: () => void }) {
  const area = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(false)
  const alvo = useRef<{ x: number; y: number } | null>(null)
  useTrava(true)
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar()
      if (e.key === 'ArrowRight' && pagina < TOTAL_PAGINAS - 1) mudar(pagina + 1)
      if (e.key === 'ArrowLeft' && pagina > 0) mudar(pagina - 1)
    }
    addEventListener('keydown', tecla)
    return () => removeEventListener('keydown', tecla)
  }, [pagina, mudar, fechar])
  useEffect(() => { area.current?.scrollTo({ top: 0, left: 0 }); preparar(pagina + 1); preparar(pagina - 1) }, [pagina])
  useLayoutEffect(() => {
    const el = area.current
    if (!el || !alvo.current) return
    const folha = el.firstElementChild as HTMLElement
    el.scrollLeft = alvo.current.x * folha.offsetWidth - el.clientWidth / 2
    el.scrollTop = alvo.current.y * folha.offsetHeight - el.clientHeight / 2
    alvo.current = null
  }, [zoom])
  const alternar = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    alvo.current = zoom ? null : { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
    setZoom((z) => !z)
  }
  return <motion.div className="cat-ampliada" role="dialog" aria-modal="true" aria-label={`Página ${pagina + 1} ampliada`} data-lenis-prevent
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
    <header className="cat-ampliada-topo">
      <p><b>{pagina + 1} / {TOTAL_PAGINAS}</b> {TITULOS_PAGINAS[pagina]}</p>
      <div>
        <button type="button" className="cat-ampliada-botao" onClick={() => setZoom((z) => !z)}>{zoom ? 'Página inteira' : 'Ampliar'}</button>
        <button type="button" className="cat-ampliada-fechar" onClick={fechar} aria-label="Fechar" autoFocus><X /></button>
      </div>
    </header>
    <div ref={area} className="cat-ampliada-area" data-lenis-prevent>
      <div className={`cat-ampliada-folha ${zoom ? 'is-zoom' : ''}`} onClick={alternar}><Pagina key={pagina} indice={pagina} prioridade /></div>
    </div>
    <footer className="cat-ampliada-base">
      <button type="button" className="cat-seta" onClick={() => mudar(pagina - 1)} disabled={pagina === 0} aria-label="Página anterior"><ChevronLeft /></button>
      <a className="botao zap" href={waLink(mensagens.catalogo(pagina + 1))} target="_blank" rel="noopener noreferrer">
        <span className="botao-texto">Cotar peça desta página</span><span className="botao-icone" aria-hidden="true"><BrandIcon /></span>
      </a>
      <button type="button" className="cat-seta" onClick={() => mudar(pagina + 1)} disabled={pagina === TOTAL_PAGINAS - 1} aria-label="Próxima página"><ChevronRight /></button>
    </footer>
  </motion.div>
}

const TODOS = INDICE_CATALOGO.flatMap((g) => g.itens)
const fimDe = (pagina: number) => { const prox = TODOS.find((i) => i.pagina > pagina); return prox ? prox.pagina - 1 : TOTAL_PAGINAS - 1 }

export default function Catalogo({ paginaInicial }: { paginaInicial: number }) {
  const largo = useMidia('(min-width: 1024px) and (orientation: landscape)')
  const [pagina, setPagina] = useState(Math.min(TOTAL_PAGINAS - 1, paginaInicial))
  const [ampliada, setAmpliada] = useState<number | null>(null)
  const trilho = useRef<HTMLDivElement>(null)
  const secao = useRef<HTMLDivElement>(null)
  const naTela = useCenaAtiva(secao, 0)

  useEffect(() => { document.title = 'Catálogo técnico | Inova Inox' }, [])
  useEffect(() => { navegar(linkCatalogo(pagina), { substituir: true }) }, [pagina])

  const rolarTrilho = useCallback((p: number, suave = true) => {
    const t = trilho.current, item = t?.children[p] as HTMLElement | undefined
    if (!t || !item) return
    t.scrollTo({ left: item.offsetLeft - (t.clientWidth - item.offsetWidth) / 2, behavior: suave ? 'smooth' : 'auto' })
  }, [])
  useEffect(() => { if (!largo) rolarTrilho(pagina, false) }, [largo, rolarTrilho]) // eslint-disable-line react-hooks/exhaustive-deps
  const irPara = useCallback((p: number) => {
    const d = Math.max(0, Math.min(TOTAL_PAGINAS - 1, p))
    setPagina(d)
    if (!largo) rolarTrilho(d)
  }, [largo, rolarTrilho])
  const fechar = () => { if (ampliada !== null) { setPagina(ampliada); if (!largo) rolarTrilho(ampliada, false) } setAmpliada(null) }

  const a = aberturaDe(pagina)
  const visiveis = largo ? [esquerda(a), direita(a)].filter((p): p is number => typeof p === 'number') : [pagina]
  const aceso = (p: number) => visiveis.some((v) => v >= p && v <= fimDe(p))
  const rotulo = largo ? (a === 0 ? `Capa · ${TOTAL_PAGINAS} páginas` : `Páginas ${primeiraDe(a) + 1}–${Math.min(TOTAL_PAGINAS, primeiraDe(a) + 2)} de ${TOTAL_PAGINAS}`) : `${pagina + 1} / ${TOTAL_PAGINAS}`

  return <section className="catalogo escuro" aria-labelledby="catalogo-titulo">
    <div className="catalogo-luz" aria-hidden="true" />
    <div className="conteiner">
      <div className="secao-cabeca catalogo-cabeca">
        <div>
          <p className="selo-texto">19 páginas · inox 304 e 316</p>
          <Titulo id="catalogo-titulo" as="h1" className="titulo" linhas={['Catálogo']} destaque="técnico." play delay={0.05} />
        </div>
        <Revelar delay={0.1}><p className="lead">As medidas de cada conexão, página por página. Folheie aqui, amplie a página e cote a peça direto dela.</p></Revelar>
      </div>

      <div ref={secao} className="cat-grade">
        <nav className="cat-indice" aria-label="Índice do catálogo">
          {INDICE_CATALOGO.map((g) => <div key={g.grupo} className="cat-indice-grupo">
            <h2 className="cat-indice-titulo">{g.grupo}</h2>
            <ul className="cat-indice-lista">
              {g.itens.map((item) => <li key={item.rotulo}>
                <button type="button" className="cat-indice-item" data-ativo={aceso(item.pagina) || undefined} onClick={() => irPara(item.pagina)}>
                  <span>{item.rotulo}</span><b>{item.pagina + 1}</b>
                </button>
              </li>)}
            </ul>
          </div>)}
        </nav>
        <div className="cat-visor">
          {largo
            ? <Livro pagina={pagina} irPara={setPagina} ampliar={setAmpliada} teclado={naTela && ampliada === null} />
            : <Trilho pagina={pagina} mudar={setPagina} ampliar={setAmpliada} trilho={trilho} />}
          <div className="cat-controles">
            {!largo && <button type="button" className="cat-seta" onClick={() => irPara(pagina - 1)} disabled={pagina === 0} aria-label="Página anterior"><ChevronLeft /></button>}
            <p className="cat-legenda" aria-live="polite"><b>{rotulo}</b><span>{[...new Set(visiveis.map((p) => TITULOS_PAGINAS[p]))].join(' · ')}</span></p>
            {!largo && <button type="button" className="cat-seta" onClick={() => irPara(pagina + 1)} disabled={pagina === TOTAL_PAGINAS - 1} aria-label="Próxima página"><ChevronRight /></button>}
          </div>
        </div>
      </div>
    </div>
    <AnimatePresence>{ampliada !== null && <Ampliada pagina={ampliada} mudar={setAmpliada} fechar={fechar} />}</AnimatePresence>
    <motion.div className="cat-rodape conteiner" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: ease.expo }}>
      <p>Achou a peça? Ela está na loja com medida, aço e preço.</p>
      <Botao href={linkLoja()} variante="azul">Ir para a loja</Botao>
    </motion.div>
  </section>
}

import { AnimatePresence, motion } from 'framer-motion'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as EventoMouse,
  type RefObject,
} from 'react'
import { catalogo } from '../../data/conteudo'
import { useMediaQuery, useMovimentoReduzido, useSceneActivity, useTravaRolagem, TELA_LARGA } from '../../hooks/basicos'
import { recortePagina } from '../../lib/fotos'
import { waLink } from '../../lib/site'
import { cn, EASE } from '../../lib/util'
import { BotaoWhatsApp } from '../ui/Botoes'
import { IconeFechar } from '../ui/icons'
import { Section } from '../ui/Section'
import { Surgir, Titulo } from '../ui/Titulo'

const TOTAL = catalogo.paginas.length
const MENSAGEM = 'Olá! Vi o catálogo técnico no site da Inova Inox e quero cotar uma peça.'

/* ---------- livro: aberturas de duas páginas ---------- */

/** A capa abre sozinha à direita; depois as páginas vêm em pares. */
const aberturaDe = (pagina: number) => Math.ceil(pagina / 2)
const ULTIMA_ABERTURA = aberturaDe(TOTAL - 1)
const esquerda = (abertura: number) => (abertura === 0 ? 'guarda' : 2 * abertura - 1)
const direita = (abertura: number) => (2 * abertura < TOTAL ? 2 * abertura : null)
const primeiraDe = (abertura: number) => (abertura === 0 ? 0 : 2 * abertura - 1)

type Conteudo = number | 'guarda' | null

/** Baixa antes a folha de uma página, para a virada não mostrar papel em branco. */
function preparar(pagina: number) {
  if (pagina < 0 || pagina >= TOTAL) return
  const img = new Image()
  img.decoding = 'async'
  img.src = recortePagina(pagina).src
}

/* ---------- peças ---------- */

type PropsPagina = { indice: number; className?: string; prioridade?: boolean }

/** Uma página do catálogo, recortada da folha 2 x 2 em que ela está. */
export function PaginaCatalogo({ indice, className, prioridade }: PropsPagina) {
  const { src, coluna, linha } = recortePagina(indice)
  return (
    <div className={cn('cat-pagina', className)}>
      <img
        src={src}
        alt={`Catálogo técnico, página ${indice + 1}: ${catalogo.paginas[indice]}`}
        loading={prioridade ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        style={{ left: `${-coluna * 100}%`, top: `${-linha * 100}%` }}
      />
    </div>
  )
}

/** Verso da capa: ensina a ler o catálogo e já oferece a cotação. */
export function Guarda() {
  return (
    <div className="cat-guarda">
      <span className="rotulo cat-guarda-rotulo">Catálogo técnico</span>
      <p className="titulo cat-guarda-titulo">Medida por medida.</p>
      <ul className="cat-guarda-dicas texto-menor">
        <li>Use as setas ou o teclado para folhear.</li>
        <li>Clique numa página para ampliar.</li>
        <li>Ø é o diâmetro da conexão; A, B e C são as cotas do desenho ao lado de cada tabela.</li>
      </ul>
      <BotaoWhatsApp texto="Cotar uma peça" mensagem={MENSAGEM} compacto />
    </div>
  )
}

function Face({ conteudo, aoAmpliar }: { conteudo: Conteudo; aoAmpliar?: (p: number) => void }) {
  if (conteudo === 'guarda') return <Guarda />
  if (conteudo === null) return <div className="cat-pagina cat-pagina--vazia" />
  return (
    <button
      type="button"
      className="cat-pagina-botao"
      onClick={() => aoAmpliar?.(conteudo)}
      aria-label={`Ampliar a página ${conteudo + 1}: ${catalogo.paginas[conteudo]}`}
    >
      <PaginaCatalogo indice={conteudo} prioridade />
    </button>
  )
}

type Virada = { para: number; sentido: 1 | -1 }

type PropsLivro = {
  pagina: number
  irPara: (pagina: number) => void
  aoAmpliar: (pagina: number) => void
  /** Liga as setas do teclado (só enquanto o catálogo está na tela). */
  teclado: boolean
}

/**
 * Desktop: o catálogo aberto como livro, duas páginas por vez.
 * `pagina` é o destino; o livro vira a folha em 3D, em torno da lombada,
 * até chegar nele. Setas, teclado e índice passam todos por aí.
 */
export function Livro({ pagina, irPara, aoAmpliar, teclado }: PropsLivro) {
  const reduzido = useMovimentoReduzido()
  const alvo = aberturaDe(pagina)
  const [atual, setAtual] = useState(alvo)
  const [virada, setVirada] = useState<Virada | null>(null)

  useEffect(() => {
    if (virada || alvo === atual) return
    if (reduzido) {
      setAtual(alvo)
      return
    }
    setVirada({ para: alvo, sentido: alvo > atual ? 1 : -1 })
  }, [alvo, atual, virada, reduzido])

  // A próxima folha e a anterior já ficam baixadas.
  useEffect(() => {
    ;[primeiraDe(alvo + 1), primeiraDe(alvo + 1) + 1, primeiraDe(alvo - 1)].forEach(preparar)
  }, [alvo])

  const passo = useCallback(
    (sentido: 1 | -1) => {
      const destino = Math.max(0, Math.min(ULTIMA_ABERTURA, alvo + sentido))
      if (destino !== alvo) irPara(primeiraDe(destino))
    },
    [alvo, irPara],
  )

  useEffect(() => {
    if (!teclado) return
    const tecla = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, select')) return
      if (e.key === 'ArrowRight') passo(1)
      if (e.key === 'ArrowLeft') passo(-1)
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [teclado, passo])

  const terminar = () => {
    if (!virada) return
    setAtual(virada.para)
    setVirada(null)
  }

  let baseEsquerda: Conteudo = esquerda(atual)
  let baseDireita: Conteudo = direita(atual)
  let frente: Conteudo = null
  let verso: Conteudo = null
  if (virada?.sentido === 1) {
    baseDireita = direita(virada.para)
    frente = direita(atual)
    verso = esquerda(virada.para)
  } else if (virada?.sentido === -1) {
    baseEsquerda = esquerda(virada.para)
    frente = esquerda(atual)
    verso = direita(virada.para)
  }

  return (
    <div className="livro-palco">
      <button
        type="button"
        className="cat-seta cat-seta--livro"
        onClick={() => passo(-1)}
        disabled={alvo === 0}
        aria-label="Voltar a página"
      >
        <SetaEsquerda />
      </button>

      <div className="livro" aria-label="Catálogo técnico aberto" data-virando={virada ? virada.sentido : undefined}>
        <div className="livro-lado livro-lado--esq">
          <Face conteudo={baseEsquerda} aoAmpliar={aoAmpliar} />
        </div>
        <div className="livro-lado livro-lado--dir">
          <Face conteudo={baseDireita} aoAmpliar={aoAmpliar} />
        </div>
        <span className="livro-lombada" aria-hidden="true" />

        {virada && (
          <motion.div
            className={cn('livro-folha', virada.sentido === 1 ? 'livro-folha--dir' : 'livro-folha--esq')}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: virada.sentido === 1 ? -180 : 180 }}
            transition={{ duration: 0.8, ease: [0.645, 0.045, 0.355, 1] }}
            onAnimationComplete={terminar}
            aria-hidden="true"
          >
            <div className="livro-face">
              <Face conteudo={frente} />
              <span className="livro-sombra" />
            </div>
            <div className="livro-face livro-face--verso">
              <Face conteudo={verso} />
              <span className="livro-sombra" />
            </div>
          </motion.div>
        )}
      </div>

      <button
        type="button"
        className="cat-seta cat-seta--livro"
        onClick={() => passo(1)}
        disabled={alvo === ULTIMA_ABERTURA}
        aria-label="Avançar a página"
      >
        <SetaDireita />
      </button>
    </div>
  )
}

type PropsTrilho = {
  pagina: number
  aoMudar: (pagina: number) => void
  aoAmpliar: (pagina: number) => void
  trilhoRef: RefObject<HTMLDivElement>
}

/** Celular e tablet em pé: uma página por vez, passando para o lado com o dedo. */
export function Trilho({ pagina, aoMudar, aoAmpliar, trilhoRef }: PropsTrilho) {
  const quadro = useRef(0)

  const aoRolar = () => {
    cancelAnimationFrame(quadro.current)
    quadro.current = requestAnimationFrame(() => {
      const trilho = trilhoRef.current
      if (!trilho) return
      const centro = trilho.scrollLeft + trilho.clientWidth / 2
      let maisPerto = 0
      let menor = Infinity
      Array.from(trilho.children).forEach((filho, i) => {
        const el = filho as HTMLElement
        const distancia = Math.abs(el.offsetLeft + el.offsetWidth / 2 - centro)
        if (distancia < menor) {
          menor = distancia
          maisPerto = i
        }
      })
      if (maisPerto !== pagina) aoMudar(maisPerto)
    })
  }

  return (
    <div ref={trilhoRef} className="cat-trilho" onScroll={aoRolar} aria-label="Páginas do catálogo">
      {catalogo.paginas.map((titulo, i) => (
        <button
          key={titulo + i}
          type="button"
          className="cat-trilho-item"
          onClick={() => aoAmpliar(i)}
          aria-label={`Ampliar a página ${i + 1}: ${titulo}`}
        >
          <PaginaCatalogo indice={i} prioridade={Math.abs(i - pagina) <= 1} />
        </button>
      ))}
    </div>
  )
}

type PropsLupa = { pagina: number; aoMudar: (p: number) => void; aoFechar: () => void }

/** Página ampliada em tela cheia. Toque ou clique alterna entre a página inteira e o zoom. */
export function Lupa({ pagina, aoMudar, aoFechar }: PropsLupa) {
  const area = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(false)
  const alvo = useRef<{ x: number; y: number } | null>(null)
  useTravaRolagem(true)

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar()
      if (e.key === 'ArrowRight' && pagina < TOTAL - 1) aoMudar(pagina + 1)
      if (e.key === 'ArrowLeft' && pagina > 0) aoMudar(pagina - 1)
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [pagina, aoMudar, aoFechar])

  useEffect(() => {
    area.current?.scrollTo({ top: 0, left: 0 })
    preparar(pagina + 1)
    preparar(pagina - 1)
  }, [pagina])

  // Depois do zoom, leva a rolagem até o ponto que foi tocado.
  useLayoutEffect(() => {
    const el = area.current
    if (!el || !alvo.current) return
    const folha = el.firstElementChild as HTMLElement
    el.scrollLeft = alvo.current.x * folha.offsetWidth - el.clientWidth / 2
    el.scrollTop = alvo.current.y * folha.offsetHeight - el.clientHeight / 2
    alvo.current = null
  }, [zoom])

  const alternar = (e: EventoMouse<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    alvo.current = zoom ? null : { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
    setZoom((z) => !z)
  }

  return (
    <motion.div
      className="cat-lupa"
      role="dialog"
      aria-modal="true"
      aria-label={`Catálogo técnico, página ${pagina + 1} ampliada`}
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <header className="cat-lupa-topo">
        <p className="rotulo">
          <span className="cat-lupa-numero">
            {pagina + 1} / {TOTAL}
          </span>
          {catalogo.paginas[pagina]}
        </p>
        <div className="cat-lupa-acoes">
          <button type="button" className="cat-lupa-botao rotulo" onClick={() => setZoom((z) => !z)}>
            {zoom ? 'Página inteira' : 'Ampliar'}
          </button>
          <button type="button" className="cat-lupa-fechar" onClick={aoFechar} aria-label="Fechar" autoFocus>
            <IconeFechar />
          </button>
        </div>
      </header>

      <div ref={area} className="cat-lupa-area" data-lenis-prevent>
        <div className={cn('cat-lupa-folha', zoom && 'cat-lupa-folha--zoom')} onClick={alternar}>
          <PaginaCatalogo key={pagina} indice={pagina} prioridade />
        </div>
      </div>

      <footer className="cat-lupa-base">
        <button
          type="button"
          className="cat-seta"
          onClick={() => aoMudar(pagina - 1)}
          disabled={pagina === 0}
          aria-label="Página anterior"
        >
          <SetaEsquerda />
        </button>
        <a className="cat-lupa-cotar rotulo" href={waLink(`${MENSAGEM} (página ${pagina + 1} do catálogo)`)} target="_blank" rel="noopener noreferrer">
          Cotar peça desta página
        </a>
        <button
          type="button"
          className="cat-seta"
          onClick={() => aoMudar(pagina + 1)}
          disabled={pagina === TOTAL - 1}
          aria-label="Próxima página"
        >
          <SetaDireita />
        </button>
      </footer>
    </motion.div>
  )
}

type PropsIndice = { visiveis: number[]; aoEscolher: (pagina: number) => void }

const TODOS_ITENS: ReadonlyArray<{ rotulo: string; pagina: number }> = catalogo.indice.flatMap((g) => [...g.itens])

/** Página em que cada item do índice termina (a seguinte começa outro assunto). */
const fimDe = (pagina: number) => {
  const proximo = TODOS_ITENS.find((item) => item.pagina > pagina)
  return proximo ? proximo.pagina - 1 : TOTAL - 1
}

/** Índice do catálogo, no lugar das páginas de índice do PDF. Acende o que está aberto na tela. */
export function IndiceCatalogo({ visiveis, aoEscolher }: PropsIndice) {
  const aceso = (pagina: number) => visiveis.some((v) => v >= pagina && v <= fimDe(pagina))
  const ref = useRef<HTMLElement>(null)
  const chave = visiveis.join(',')

  // No celular as etiquetas correm para o lado: a acesa é trazida para a vista.
  useEffect(() => {
    ref.current?.querySelectorAll<HTMLElement>('.cat-indice-lista').forEach((lista) => {
      if (lista.scrollWidth <= lista.clientWidth) return
      const item = lista.querySelector<HTMLElement>('[data-ativo]')
      if (item) lista.scrollTo({ left: item.offsetLeft - lista.clientWidth / 2 + item.offsetWidth / 2, behavior: 'smooth' })
    })
  }, [chave])

  return (
    <nav ref={ref} className="cat-indice" aria-label="Índice do catálogo">
      {catalogo.indice.map((grupo) => (
        <div key={grupo.grupo} className="cat-indice-grupo">
          <h3 className="rotulo cat-indice-titulo">{grupo.grupo}</h3>
          <ul className="cat-indice-lista">
            {grupo.itens.map((item) => (
              <li key={item.rotulo}>
                <button
                  type="button"
                  className="cat-indice-item"
                  data-ativo={aceso(item.pagina) || undefined}
                  onClick={() => aoEscolher(item.pagina)}
                >
                  <span>{item.rotulo}</span>
                  <span className="cat-indice-pag numero">{item.pagina + 1}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

/* ---------- seção ---------- */

/** Catálogo técnico para folhear no próprio site, sem baixar PDF. */
export function Catalogo() {
  const largo = useMediaQuery(TELA_LARGA)
  const [pagina, setPagina] = useState(0)
  const [ampliada, setAmpliada] = useState<number | null>(null)
  const trilhoRef = useRef<HTMLDivElement>(null)
  const secao = useRef<HTMLDivElement>(null)
  const naTela = useSceneActivity(secao, '0px')

  /** Leva o trilho do celular até a página, sem pular a página inteira do site. */
  const rolarTrilho = useCallback((p: number, suave = true) => {
    const trilho = trilhoRef.current
    const item = trilho?.children[p] as HTMLElement | undefined
    if (!trilho || !item) return
    trilho.scrollTo({
      left: item.offsetLeft - (trilho.clientWidth - item.offsetWidth) / 2,
      behavior: suave ? 'smooth' : 'auto',
    })
  }, [])

  const irPara = useCallback(
    (p: number) => {
      const destino = Math.max(0, Math.min(TOTAL - 1, p))
      setPagina(destino)
      if (!largo) rolarTrilho(destino)
    },
    [largo, rolarTrilho],
  )

  // Ao fechar a página ampliada no celular, o trilho fica na mesma página.
  const fechar = () => {
    if (ampliada !== null) {
      setPagina(ampliada)
      if (!largo) rolarTrilho(ampliada, false)
    }
    setAmpliada(null)
  }

  const abertura = aberturaDe(pagina)
  const visiveis = largo
    ? [esquerda(abertura), direita(abertura)].filter((p): p is number => typeof p === 'number')
    : [pagina]
  const tituloAtual = [...new Set(visiveis.map((p) => catalogo.paginas[p]))].join(' · ')
  const rotuloAtual = largo
    ? aberturaDe(pagina) === 0
      ? `Capa · ${TOTAL} páginas`
      : `Páginas ${primeiraDe(aberturaDe(pagina)) + 1}–${Math.min(TOTAL, primeiraDe(aberturaDe(pagina)) + 2)} de ${TOTAL}`
    : `${pagina + 1} / ${TOTAL}`

  return (
    <Section id="catalogo" tom="claro" rotulo="Catálogo técnico">
      <div className="cabecalho">
        <Titulo className="titulo-secao" linhas={['Catálogo', 'técnico.']} />
        <Surgir ordem={1}>
          <p className="texto-apoio cat-apoio">
            As medidas de cada conexão, página por página. Folheie aqui mesmo, sem baixar nada, e
            toque na página para ampliar.
          </p>
        </Surgir>
      </div>

      <div ref={secao} className="cat-grade">
        <IndiceCatalogo visiveis={visiveis} aoEscolher={irPara} />

        <div className="cat-visor">
          {largo ? (
            <Livro pagina={pagina} irPara={setPagina} aoAmpliar={setAmpliada} teclado={naTela && ampliada === null} />
          ) : (
            <Trilho pagina={pagina} aoMudar={setPagina} aoAmpliar={setAmpliada} trilhoRef={trilhoRef} />
          )}

          <div className="cat-controles">
            {!largo && (
              <button
                type="button"
                className="cat-seta"
                onClick={() => irPara(pagina - 1)}
                disabled={pagina === 0}
                aria-label="Página anterior"
              >
                <SetaEsquerda />
              </button>
            )}
            <p className="cat-legenda" aria-live="polite">
              <span className="rotulo cat-legenda-num">{rotuloAtual}</span>
              <span className="cat-legenda-titulo">{tituloAtual}</span>
            </p>
            {!largo && (
              <button
                type="button"
                className="cat-seta"
                onClick={() => irPara(pagina + 1)}
                disabled={pagina === TOTAL - 1}
                aria-label="Próxima página"
              >
                <SetaDireita />
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {ampliada !== null && <Lupa pagina={ampliada} aoMudar={setAmpliada} aoFechar={fechar} />}
      </AnimatePresence>
    </Section>
  )
}

function SetaEsquerda() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  )
}

function SetaDireita() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}

import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react'
import { ease, MovimentoProvider, rolarPara, useMovimento, useRolagem } from './lib/movimento'
import { EstoqueProvider } from './loja/estoque'
import { SacolaProvider } from './loja/sacola'
import { chegada, posicaoGuardada, ROTA_EVENTO, useRota, linkLoja } from './loja/rotas'
import Abertura, { modoAbertura, type ModoAbertura } from './componentes/Abertura'
import { Topo } from './componentes/Topo'
import { Rodape } from './componentes/Rodape'
import { Cursor, Flutuantes } from './componentes/Extras'
import { SacolaGaveta } from './componentes/SacolaGaveta'
import { Botao } from './componentes/ui/Pecas'
import Inicio from './componentes/paginas/Inicio'
import Loja from './componentes/paginas/Loja'
import Produto from './componentes/paginas/Produto'
import Catalogo from './componentes/paginas/Catalogo'

function NaoEncontrada() {
  useEffect(() => { document.title = 'Página não encontrada | Inova Inox' }, [])
  return <section className="secao produto-nada escuro">
    <div className="conteiner">
      <p className="selo-texto">Erro 404</p>
      <h1 className="titulo">Essa página <em>não existe.</em></h1>
      <p className="lead">O endereço pode ter mudado. As peças estão todas na loja.</p>
      <div className="produto-nada-acoes"><Botao href={linkLoja()} variante="azul">Ver a loja</Botao><Botao href="/" variante="contorno">Início</Botao></div>
    </div>
  </section>
}

function Experiencia() {
  const { reduzido } = useMovimento()
  const [modo] = useState<ModoAbertura>(() => modoAbertura(reduzido))
  const [abertura, setAbertura] = useState(true)
  const [pronto, setPronto] = useState(false)
  const { rota, caminho } = useRota()
  const { scrollYProgress } = useScroll()
  const progresso = useSpring(scrollYProgress, { stiffness: 160, damping: 35 })

  /* Toda carga começa do topo, com a abertura inteira. */
  useLayoutEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])
  useRolagem(!abertura)

  useEffect(() => { if (rota.nome === 'inicio') document.title = 'Inova Inox | Loja de conexões sanitárias em inox 304 e 316' }, [rota.nome])

  /* Link com âncora na mesma página (ex.: /#orcamento estando no início): só rola. */
  useEffect(() => {
    const ouvir = (e: Event) => {
      const d = (e as CustomEvent<{ mesmo: boolean; hash: string }>).detail
      if (d?.mesmo && d.hash) rolarPara(d.hash, reduzido)
    }
    addEventListener(ROTA_EVENTO, ouvir)
    return () => removeEventListener(ROTA_EVENTO, ouvir)
  }, [reduzido])

  /* Página nova: volta ao topo; no voltar do navegador, devolve a posição; com âncora, desce até ela. */
  const aoTrocar = useCallback(() => {
    rolarPara(0, true, true)
    const { tipo, hash } = chegada
    window.setTimeout(() => {
      if (tipo === 'pop') rolarPara(posicaoGuardada(), true, true)
      else if (hash) { try { rolarPara(hash, reduzido) } catch { /* âncora inválida */ } }
    }, 90)
  }, [reduzido])

  const aoSair = useCallback(() => setPronto(true), [])
  const aoFim = useCallback(() => {
    setAbertura(false)
    const ancora = location.hash
    if (ancora.length > 1) window.setTimeout(() => { try { rolarPara(ancora, reduzido) } catch { /* âncora inválida */ } }, 450)
  }, [reduzido])

  let pagina
  switch (rota.nome) {
    case 'inicio': pagina = <Inicio pronto={pronto} />; break
    case 'loja': pagina = <Loja linha={rota.linha} busca={rota.busca} />; break
    case 'produto': pagina = <Produto key={rota.slug} slug={rota.slug} />; break
    case 'catalogo': pagina = <Catalogo paginaInicial={rota.pagina} />; break
    default: pagina = <NaoEncontrada />
  }

  return <>
    {abertura && <Abertura modo={modo} onSaida={aoSair} onFim={aoFim} />}
    <div className={abertura ? 'site is-abrindo' : 'site'}>
      <a className="pular" href="#conteudo">Pular para o conteúdo</a>
      <motion.div className="progresso" style={{ scaleX: progresso }} aria-hidden="true" />
      <Topo marcaVisivel={!abertura} />
      <main id="conteudo">
        <AnimatePresence mode="wait" initial={false} onExitComplete={aoTrocar}>
          <motion.div key={caminho} className="pagina" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.55, ease: ease.expo }}>
            {pagina}
          </motion.div>
        </AnimatePresence>
      </main>
      <Rodape />
      <Flutuantes />
    </div>
    <AnimatePresence>
      <motion.span key={caminho} className="troca-linha" aria-hidden="true" initial={{ scaleX: 0, opacity: 1 }} animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
        transition={{ duration: 1, times: [0, 0.6, 1], ease: ease.corte }} />
    </AnimatePresence>
    <SacolaGaveta />
    <Cursor />
    <div className="grao anima" aria-hidden="true" />
  </>
}

export default function App() {
  return <MovimentoProvider>
    <EstoqueProvider>
      <SacolaProvider>
        <Experiencia />
      </SacolaProvider>
    </EstoqueProvider>
  </MovimentoProvider>
}

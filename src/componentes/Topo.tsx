import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { ArrowUpRight, ShoppingBag } from 'lucide-react'
import { mensagens, site, telLink, waLink } from '../loja/config'
import { useSacola } from '../loja/sacola'
import { Link, linkCatalogo, linkLoja, navegar, useRota } from '../loja/rotas'
import { ease, useMovimento, useTrava } from '../lib/movimento'
import { BrandIcon, Faisca, Magnetico, Marca } from './ui/Pecas'

export const NAVEGACAO = [
  { rotulo: 'Loja', href: linkLoja() },
  { rotulo: 'Tri-Clamp', href: linkLoja('tri-clamp') },
  { rotulo: 'Serviços', href: '/#servicos' },
  { rotulo: 'Catálogo técnico', href: linkCatalogo() },
  { rotulo: 'Sob desenho', href: '/#orcamento' },
]

/** Contador da sacola: pula quando entra peça. */
export function BotaoSacola({ className = '' }: { className?: string }) {
  const { total, pulso, abrir } = useSacola()
  return <button type="button" className={`topo-sacola ${className}`} onClick={abrir} aria-label={`Abrir a sacola (${total} ${total === 1 ? 'peça' : 'peças'})`}>
    <ShoppingBag aria-hidden="true" />
    <span>Sacola</span>
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.b key={`${total}-${pulso}`} className="topo-sacola-num" initial={{ y: -14, scale: 1.6, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 14, opacity: 0 }} transition={{ duration: 0.5, ease: ease.expo }}>{total}</motion.b>
    </AnimatePresence>
  </button>
}

/** Topo fixo: some ao descer, volta ao subir, ganha fundo depois do começo. Menu cheio no celular. */
export function Topo({ marcaVisivel }: { marcaVisivel: boolean }) {
  const { reduzido } = useMovimento()
  const { caminho, rota } = useRota()
  const { scrollY } = useScroll()
  const [rolado, setRolado] = useState(false)
  const [escondido, setEscondido] = useState(false)
  const [aberto, setAberto] = useState(false)
  const botaoMenu = useRef<HTMLButtonElement>(null)
  const painel = useRef<HTMLDivElement>(null)
  useTrava(aberto)

  useMotionValueEvent(scrollY, 'change', (v) => {
    const anterior = scrollY.getPrevious() ?? 0
    setRolado(v > 40)
    if (aberto) return
    if (v > 640 && v > anterior + 4) setEscondido(true)
    else if (v < anterior - 4 || v < 640) setEscondido(false)
  })

  useEffect(() => { setAberto(false); setEscondido(false) }, [caminho])

  useEffect(() => {
    if (!aberto) return
    const foco = painel.current?.querySelectorAll<HTMLElement>('a, button')
    foco?.[0]?.focus()
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false)
      if (e.key === 'Tab' && foco && foco.length) {
        const p = foco[0], u = foco[foco.length - 1]
        if (e.shiftKey && document.activeElement === p) { e.preventDefault(); u.focus() }
        else if (!e.shiftKey && document.activeElement === u) { e.preventDefault(); p.focus() }
      }
    }
    document.addEventListener('keydown', tecla)
    const botao = botaoMenu.current
    return () => { document.removeEventListener('keydown', tecla); botao?.focus() }
  }, [aberto])

  const ir = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setAberto(false)
    window.setTimeout(() => navegar(href), aberto ? 380 : 0)
  }
  const ativo = (href: string) => {
    if (href.startsWith('/#')) return false
    if (href === linkLoja()) return rota.nome === 'loja' && !rota.linha
    if (href.startsWith('/loja?linha=')) return rota.nome === 'loja' && href.endsWith(rota.linha) && !!rota.linha
    return caminho === href
  }

  return <>
    <header className={`topo ${rolado ? 'is-rolado' : ''} ${escondido ? 'is-escondido' : ''} ${aberto ? 'is-aberto' : ''}`}>
      <div className="conteiner topo-grade">
        <Link href="/" className="topo-marca" aria-label="Inova Inox, voltar ao início" onClick={() => setAberto(false)}>
          <span data-alvo-marca style={{ opacity: marcaVisivel ? 1 : 0 }}><Marca /></span>
        </Link>
        <nav className="topo-nav" aria-label="Seções do site">
          {NAVEGACAO.map((item) => <a key={item.href} href={item.href} onClick={(e) => ir(e, item.href)} aria-current={ativo(item.href) ? 'page' : undefined}>
            <span data-texto={item.rotulo}>{item.rotulo}</span>
          </a>)}
        </nav>
        <div className="topo-acoes">
          <Magnetico forca={0.2}>
            <a className="topo-zap" href={waLink(mensagens.geral)} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${site.whatsappVisivel}`}>
              <BrandIcon /><span>WhatsApp</span>
            </a>
          </Magnetico>
          <Magnetico forca={0.2}><BotaoSacola /></Magnetico>
          <button ref={botaoMenu} className="topo-menu" type="button" aria-expanded={aberto} aria-controls="menu-celular"
            aria-label={aberto ? 'Fechar menu' : 'Abrir menu'} onClick={() => setAberto((a) => !a)}>
            <span /><span />
          </button>
        </div>
      </div>
    </header>

    <AnimatePresence>
      {aberto && <motion.div id="menu-celular" ref={painel} className="menu" role="dialog" aria-modal="true" aria-label="Menu"
        initial={{ clipPath: 'circle(0% at calc(100% - 44px) 32px)' }}
        animate={{ clipPath: 'circle(150% at calc(100% - 44px) 32px)' }}
        exit={{ clipPath: 'circle(0% at calc(100% - 44px) 32px)' }}
        transition={{ duration: reduzido ? 0 : 0.7, ease: ease.quint }}>
        <nav className="menu-links" aria-label="Menu principal">
          {[{ rotulo: 'Início', href: '/' }, ...NAVEGACAO].map((item, i) => <span key={item.href} className="mascara">
            <motion.a href={item.href} onClick={(e) => ir(e, item.href)}
              initial={{ y: '110%' }} animate={{ y: '0%' }} transition={{ duration: 0.9, delay: 0.18 + i * 0.06, ease: ease.expo }}>
              <small>{String(i + 1).padStart(2, '0')}</small>{item.rotulo}
            </motion.a>
          </span>)}
        </nav>
        <motion.div className="menu-rodape" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8, ease: ease.expo }}>
          <a className="botao zap" href={waLink(mensagens.geral)} target="_blank" rel="noopener noreferrer">
            <span className="botao-texto">WhatsApp {site.whatsappVisivel}</span><span className="botao-icone" aria-hidden="true"><ArrowUpRight /></span>
          </a>
          <a className="menu-tel" href={telLink}>Telefone {site.telefoneVisivel}</a>
          <Faisca className="menu-faisca" />
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  </>
}

import { motion } from 'framer-motion'
import { useRef, type PointerEvent } from 'react'
import { hero, temHero } from '../../lib/fotos'
import { EASE, cn } from '../../lib/util'
import {
  useMovimentoReduzido,
  useSceneActivity,
  TELA_LARGA,
  useMediaQuery,
} from '../../hooks/basicos'
import { logo } from '../../lib/logo'
import { LogoCamadas } from '../ui/LogoCamadas'
import { mensagens } from '../../lib/site'
import { BotaoLigar, BotaoWhatsApp } from '../ui/Botoes'
import { Titulo } from '../ui/Titulo'
import { Faiscas } from './Faiscas'

type PropsHeroFundo = { pronto: boolean }

/**
 * Fundo do hero. Com as fotos em src/assets/hero, mostra a foto certa
 * para cada formato de tela, sempre com o logotipo inteiro à vista.
 * Sem elas, desenha uma bancada de inox com luz azul, e o logotipo
 * entra por cima (ver HeroLogo).
 */
export function HeroFundo({ pronto }: PropsHeroFundo) {
  const reduzido = useMovimentoReduzido()

  if (!temHero) {
    return (
      <div className="hero-fundo" aria-hidden="true">
        <div className="hero-luz" />
        <div className="hero-riscos" />
        <div className="hero-piso" />
      </div>
    )
  }

  const desktop = hero.desktop ?? hero.mobile!
  const mobile = hero.mobile ?? hero.desktop!

  return (
    <div className="hero-fundo" aria-hidden="true">
      {/* A foto chega um pouco maior e assenta, como a câmera recuando. */}
      <motion.div
        className="hero-quadro"
        initial={reduzido ? false : { scale: 1.14, opacity: 0 }}
        animate={pronto ? { scale: 1, opacity: 1 } : undefined}
        transition={{ duration: 1.7, ease: EASE }}
      >
        <picture>
          <source
            media="(max-width: 1023px), (orientation: portrait)"
            srcSet={mobile}
          />
          <img
            className="hero-foto"
            src={desktop}
            alt=""
            fetchPriority="high"
            decoding="async"
            draggable={false}
          />
        </picture>
      </motion.div>
      <div className="hero-veu" />
    </div>
  )
}

type PropsHeroLogo = { pronto: boolean }

/**
 * Logotipo grande do hero, usado enquanto não há foto.
 * No desktop fica ancorado à direita; no celular, no topo. Nunca é cortado.
 */
export function HeroLogo({ pronto }: PropsHeroLogo) {
  const reduzido = useMovimentoReduzido()

  return (
    <motion.div
      className="hero-logo"
      initial={reduzido ? false : { opacity: 0, scale: 1.12 }}
      animate={pronto ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 1.3, delay: 0.1, ease: EASE }}
    >
      <div className="hero-logo-eixo">
        <LogoCamadas />
        {/* Reflexo no piso de inox polido. */}
        <img className="hero-reflexo" src={logo.completo} alt="" aria-hidden="true" draggable={false} />
      </div>
    </motion.div>
  )
}

type PropsHero = {
  /** Vira verdadeiro quando a tela de carregamento começa a abrir. */
  pronto: boolean
}

/** No desktop o título desce em coluna ao lado do logo; no celular, cabe em duas linhas. */
const TITULO_LARGO = ['Linha', 'sanitária', 'em inox', '304 e 316.']
const TITULO_ESTREITO = ['Linha sanitária', 'em inox 304 e 316.']

export function Hero({ pronto }: PropsHero) {
  const ref = useRef<HTMLElement>(null)
  const naTela = useSceneActivity(ref, '0px')
  const reduzido = useMovimentoReduzido()
  const largo = useMediaQuery(TELA_LARGA)

  // A luz e a foto acompanham de leve o ponteiro.
  const aoMover = (e: PointerEvent<HTMLElement>) => {
    if (reduzido || e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
    ref.current.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
  }

  const entrada = (ordem: number) => ({
    initial: reduzido ? false : ({ opacity: 0, y: 20 } as const),
    animate: pronto ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.9, delay: 0.4 + ordem * 0.1, ease: EASE },
  })

  return (
    <section
      id="topo"
      ref={ref}
      className={cn('hero', temHero && 'hero--foto')}
      aria-label="Inova Inox"
      onPointerMove={aoMover}
    >
      <HeroFundo pronto={pronto} />
      <Faiscas ligado={naTela && pronto} />

      <div className="conteudo hero-grade">
        {!temHero && <HeroLogo pronto={pronto} />}

        <div className="hero-texto">
          <Titulo
            key={largo ? 'largo' : 'estreito'}
            nivel="h1"
            className="titulo-hero text-white"
            linhas={largo ? TITULO_LARGO : TITULO_ESTREITO}
            quando={pronto}
            atraso={2}
          />

          <motion.p className="texto-apoio hero-apoio" {...entrada(2)}>
            Conexões Tri-Clamp, SMS, RJT, DIN, OD, BSP e NPT. Peças sob desenho ou amostra, com
            usinagem, soldagem e polimento na própria oficina.
          </motion.p>

          <motion.div className="hero-acoes" {...entrada(3)}>
            <BotaoWhatsApp magnetico texto="Cotar no WhatsApp" mensagem={mensagens.linhaSanitaria} />
            <BotaoLigar magnetico />
          </motion.div>
        </div>
      </div>

    </section>
  )
}

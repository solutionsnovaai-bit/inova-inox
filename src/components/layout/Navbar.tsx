import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { logo, PROPORCAO_MARCA } from '../../lib/logo'
import { cn, EASE, EASE_CORTE } from '../../lib/util'
import { navegacao } from '../../data/conteudo'
import { site } from '../../lib/site'
import { useTravaRolagem, useRolou } from '../../hooks/basicos'
import { BotaoLigar, BotaoWhatsApp } from '../ui/Botoes'
import { IconeFechar, IconeMenu } from '../ui/icons'

type PropsMarca = { className?: string; altura?: number }

/** Logotipo sem a assinatura, para a barra do topo e o rodapé. */
export function Marca({ className, altura = 40 }: PropsMarca) {
  return (
    <img
      className={cn('marca', className)}
      src={logo.marca}
      width={Math.round(altura * PROPORCAO_MARCA)}
      height={altura}
      alt="Inova Inox"
      decoding="async"
      draggable={false}
    />
  )
}

type PropsMenuMobile = { aberto: boolean; aoFechar: () => void }

export function MenuMobile({ aberto, aoFechar }: PropsMenuMobile) {
  useTravaRolagem(aberto)

  useEffect(() => {
    if (!aberto) return
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar()
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [aberto, aoFechar])

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          id="menu-mobile"
          className="menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.6, ease: EASE_CORTE }}
        >
          <div className="menu-topo">
            <Marca altura={34} />
            <button type="button" className="nav-menu" onClick={aoFechar} aria-label="Fechar menu" autoFocus>
              <IconeFechar />
            </button>
          </div>

          <nav className="menu-links" aria-label="Seções do site">
            {navegacao.map((item, i) => (
              <motion.a
                key={item.destino}
                href={item.destino}
                onClick={aoFechar}
                className="menu-link titulo"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.18 + i * 0.05, ease: EASE }}
              >
                {item.rotulo}
              </motion.a>
            ))}
          </nav>

          <div className="menu-base">
            <BotaoWhatsApp largo texto={`WhatsApp ${site.whatsappExibicao}`} />
            <BotaoLigar largo />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

type PropsNavbar = { visivel: boolean }

export function Navbar({ visivel }: PropsNavbar) {
  const rolou = useRolou(32)
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <header className="nav" data-rolou={rolou || undefined} data-visivel={visivel || undefined}>
        <div className="conteudo nav-linha">
          <a href="#topo" className="nav-marca" aria-label="Inova Inox, voltar ao início">
            <Marca altura={38} />
          </a>

          <nav className="nav-links" aria-label="Seções do site">
            {navegacao.map((item) => (
              <a key={item.destino} href={item.destino} className="nav-link">
                {item.rotulo}
              </a>
            ))}
          </nav>

          <div className="nav-acoes">
            <BotaoWhatsApp texto="Cotar" compacto className="nav-comprar" />
            <button
              type="button"
              className="nav-menu"
              onClick={() => setAberto(true)}
              aria-label="Abrir menu"
              aria-expanded={aberto}
              aria-controls="menu-mobile"
            >
              <IconeMenu />
            </button>
          </div>
        </div>
      </header>

      <MenuMobile aberto={aberto} aoFechar={() => setAberto(false)} />
    </>
  )
}

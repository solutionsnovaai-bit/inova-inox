import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { useInercia } from '../../hooks/useInercia'
import { mensagens, waLink } from '../../lib/site'
import { IconeConversa } from '../ui/icons'
import { BotaoMercadoLivre } from '../ui/Botoes'

/**
 * Balão flutuante do WhatsApp com inércia de rolagem.
 * A física e as travas que impedem o balão de sumir estão em src/hooks/useInercia.ts.
 */
export function WhatsAppFab() {
  const ref = useRef<HTMLAnchorElement>(null)
  useInercia(ref)

  return (
    <a
      ref={ref}
      className="balao"
      data-visivel="nao"
      href={waLink(mensagens.geral)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a Inova Inox no WhatsApp"
    >
      <span className="balao-anel" aria-hidden="true" />
      <span className="balao-miolo">
        <IconeConversa />
      </span>
    </a>
  )
}

/**
 * Barra fixa no rodapé da tela do celular com o botão de compra.
 * Aparece depois do hero e sai de cena quando a chamada final ou o
 * rodapé entram na tela (os trechos marcados com data-esconde-barra),
 * para não repetir o botão que já está ali.
 */
export function BarraCompra() {
  const [passouHero, setPassouHero] = useState(false)
  const [encoberta, setEncoberta] = useState(false)

  useEffect(() => {
    const conferir = () => setPassouHero(window.scrollY > window.innerHeight * 0.6)
    conferir()
    window.addEventListener('scroll', conferir, { passive: true })
    return () => window.removeEventListener('scroll', conferir)
  }, [])

  useEffect(() => {
    const alvos = document.querySelectorAll('[data-esconde-barra]')
    if (!alvos.length || !('IntersectionObserver' in window)) return
    const naTela = new Set<Element>()
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => (e.isIntersecting ? naTela.add(e.target) : naTela.delete(e.target)))
      setEncoberta(naTela.size > 0)
    })
    alvos.forEach((alvo) => io.observe(alvo))
    return () => io.disconnect()
  }, [])

  const visivel = passouHero && !encoberta

  return (
    <div className="barra-compra" data-visivel={visivel || undefined} aria-hidden={!visivel}>
      <BotaoMercadoLivre largo />
    </div>
  )
}

/** Fio azul no topo que mostra quanto da página já foi lido. */
export function ProgressoRolagem() {
  const { scrollYProgress } = useScroll()
  const escala = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 })
  return <motion.div className="progresso" style={{ scaleX: escala }} aria-hidden="true" />
}

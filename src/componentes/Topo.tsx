import { useEffect, useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { SITE } from '../loja/ajustes.js'
import { useSacola } from '../loja/sacola'
import { logo } from '../lib/midia'
import { IconeWhats } from './ui'

export const LINKS = [
  { href: '#loja', rotulo: 'Loja' },
  { href: '#servicos', rotulo: 'Serviços' },
  { href: '#catalogo', rotulo: 'Catálogo técnico' },
  { href: '#duvidas', rotulo: 'Dúvidas' },
]

export const linkWhats = (texto = `Olá! Vim pelo site da ${SITE.nome}.`) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(texto)}`

/** Topo fixo: transparente sobre o hero, vidro claro depois de rolar. Menu cheio no celular. */
export function Topo() {
  const { total, abrir } = useSacola()
  const [rolou, setRolou] = useState(false)
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    const on = () => setRolou(window.scrollY > 40)
    on()
    addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])
  useEffect(() => { document.body.classList.toggle('travado', menu) }, [menu])

  return <>
    <nav className={`topo ${rolou || menu ? 'is-rolado' : ''}`}>
      <div className="conteiner topo-grade">
        <a href="#topo" className="topo-marca" aria-label="Inova Inox, início"><img src={logo.marca} alt="Inova Inox" width={537} height={258} /></a>
        <ul className="topo-links">
          {LINKS.map((l) => <li key={l.href}><a href={l.href}>{l.rotulo}</a></li>)}
        </ul>
        <a className="topo-whats" href={linkWhats()} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${SITE.whatsappVisivel}`}><IconeWhats /></a>
        <button type="button" className="topo-sacola" onClick={abrir} aria-label={`Sacola com ${total} ${total === 1 ? 'item' : 'itens'}`}>
          <ShoppingBag aria-hidden="true" /><span>Sacola</span>
          {total > 0 && <b key={total} className="topo-num">{total}</b>}
        </button>
        <button type="button" className={`topo-menu ${menu ? 'is-aberto' : ''}`} onClick={() => setMenu((m) => !m)} aria-label="Menu" aria-expanded={menu}><i /><i /></button>
      </div>
    </nav>
    <div className={`menu ${menu ? 'is-aberto' : ''}`}>
      {LINKS.map((l) => <a key={l.href} href={l.href} onClick={() => setMenu(false)}>{l.rotulo}</a>)}
      <a className="botao botao-whats" href={linkWhats()} target="_blank" rel="noopener noreferrer"><IconeWhats />{SITE.whatsappVisivel}</a>
    </div>
  </>
}

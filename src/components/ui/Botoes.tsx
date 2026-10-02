import { useRef, type AnchorHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/util'
import { useMagnetic } from '../../hooks/ponteiro'
import { site, mensagens, waLink } from '../../lib/site'
import { IconeSacola, IconeConversa } from './icons'

export type VarianteBotao = 'ml' | 'zap' | 'aco' | 'linha' | 'tinta'

type PropsBotao = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variante?: VarianteBotao
  compacto?: boolean
  largo?: boolean
  /** Liga o efeito de ímã no ponteiro. */
  magnetico?: boolean
  externo?: boolean
  children: ReactNode
}

/** Botão chanfrado do site. Sempre um link, porque todo botão leva a algum lugar. */
export function Botao({
  variante = 'aco',
  compacto,
  largo,
  magnetico,
  externo,
  className,
  children,
  ...resto
}: PropsBotao) {
  const ref = useRef<HTMLAnchorElement>(null)
  useMagnetic(ref, Boolean(magnetico))

  return (
    <a
      ref={ref}
      className={cn(
        'botao',
        `botao--${variante}`,
        compacto && 'botao--compacto',
        largo && 'botao--largo',
        className,
      )}
      {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...resto}
    >
      {children}
    </a>
  )
}

type PropsBotaoMercadoLivre = {
  texto?: string
  compacto?: boolean
  largo?: boolean
  magnetico?: boolean
  className?: string
}

/** Botão amarelo. No site inteiro, amarelo significa "comprar no Mercado Livre". */
export function BotaoMercadoLivre({ texto = 'Comprar no Mercado Livre', ...resto }: PropsBotaoMercadoLivre) {
  return (
    <Botao
      variante="ml"
      href={site.mercadoLivre}
      externo
      aria-label={`${texto} (abre em nova aba)`}
      {...resto}
    >
      <IconeSacola />
      {texto}
    </Botao>
  )
}

type PropsBotaoWhatsApp = {
  texto?: string
  mensagem?: string
  variante?: VarianteBotao
  compacto?: boolean
  largo?: boolean
  magnetico?: boolean
  className?: string
}

export function BotaoWhatsApp({
  texto = 'Pedir orçamento no WhatsApp',
  mensagem = mensagens.geral,
  variante = 'linha',
  ...resto
}: PropsBotaoWhatsApp) {
  return (
    <Botao
      variante={variante}
      href={waLink(mensagem)}
      externo
      aria-label={`${texto} (abre o WhatsApp)`}
      {...resto}
    >
      <IconeConversa />
      {texto}
    </Botao>
  )
}

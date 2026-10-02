import type { Foto } from '../../lib/fotos'
import { cn } from '../../lib/util'

type Props = {
  foto: Foto
  className?: string
  prioridade?: boolean
}

/** Foto do banco de imagens. Carrega só quando chega perto da tela. */
export function Imagem({ foto, className, prioridade }: Props) {
  return (
    <img
      className={cn('imagem', className)}
      src={foto.src}
      width={1200}
      height={900}
      alt={foto.alt}
      loading={prioridade ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
    />
  )
}

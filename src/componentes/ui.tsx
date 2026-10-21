import { useEffect, useState, type ReactNode } from 'react'
import { FOTOS, PRANCHAS } from '../lib/midia'
import { PRANCHA_COLUNAS, PRODUTOS_BASE } from '../loja/produtos'
import type { Produto } from '../loja/tipos'
import { enderecosImagem } from '../loja/util'

/** Ícone oficial do WhatsApp (Simple Icons, CC0). */
export function IconeWhats({ className = '' }: { className?: string }) {
  return <svg className={`ic-whats ${className}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
}

/** Revela na rolagem tudo que tem a classe .revelar (sobe e aparece, uma vez). */
export function useRevelar(dep?: unknown) {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.revelar:not(.in)')
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px' })
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [dep])
}

export function Cabecalho({ tag, titulo, texto, claro = false, centro = false }: { tag: string; titulo: ReactNode; texto?: ReactNode; claro?: boolean; centro?: boolean }) {
  return <div className={`cabecalho ${claro ? 'is-claro' : ''} ${centro ? 'is-centro' : ''}`}>
    <span className="etiqueta revelar"><i />{tag}</span>
    <h2 className="titulo revelar">{titulo}</h2>
    {texto && <p className="cabecalho-texto revelar">{texto}</p>}
  </div>
}

/** Desenho técnico da peça, recortado da prancha (src/assets/pecas). */
export function Desenho({ desenho, alt = '', prioridade = false }: { desenho: [number, number, number]; alt?: string; prioridade?: boolean }) {
  const [g, c, l] = desenho
  return <span className="desenho" role={alt ? 'img' : undefined} aria-label={alt || undefined}>
    <img src={PRANCHAS[g]} alt="" loading={prioridade ? 'eager' : 'lazy'} decoding="async" draggable={false}
      style={{ width: `${PRANCHA_COLUNAS * 100}%`, left: `${-c * 100}%`, top: `${-l * 100}%` }} />
  </span>
}

/** Foto da peça (link direto, Drive ou Dropbox). Se não abrir, mostra a reserva (o desenho). */
export function FotoLoja({ link, alt, prioridade = false, reserva = null }: { link: string; alt: string; prioridade?: boolean; reserva?: ReactNode }) {
  const enderecos = enderecosImagem(link)
  const [t, setT] = useState(0)
  useEffect(() => setT(0), [link])
  if (t >= enderecos.length) return <>{reserva}</>
  return <span className="foto-peca">
    <img key={enderecos[t]} src={enderecos[t]} alt={alt} loading={prioridade ? 'eager' : 'lazy'} decoding="async" referrerPolicy="no-referrer" draggable={false} onError={() => setT((x) => x + 1)} />
  </span>
}

const desenhoDaLinha = (categoria: string) => PRODUTOS_BASE.find((b) => b.categoria === categoria)?.desenho ?? PRODUTOS_BASE[0].desenho

/** Imagem principal: foto do painel; senão foto real da oficina (peça sem desenho); senão o desenho do catálogo. */
export function ImagemPeca({ produto, foto, prioridade = false }: { produto: Produto; foto?: string; prioridade?: boolean }) {
  const desenho = <Desenho desenho={produto.desenho ?? desenhoDaLinha(produto.categoria)} alt={`Desenho técnico: ${produto.nome}`} prioridade={prioridade} />
  const link = foto ?? produto.fotosLoja[0]
  if (link) return <FotoLoja link={link} alt={produto.nome} prioridade={prioridade} reserva={desenho} />
  if (!produto.desenho && produto.fotos[0] && FOTOS[produto.fotos[0]]) {
    const f = FOTOS[produto.fotos[0]]
    return <span className="foto-peca is-cobrir"><img src={f.src} alt={f.alt} loading="lazy" decoding="async" /></span>
  }
  return desenho
}

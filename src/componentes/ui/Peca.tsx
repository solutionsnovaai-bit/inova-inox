import { useState, type PointerEvent, type ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { FOTOS, PRANCHAS } from '../../lib/midia'
import { PRANCHA_COLUNAS, PRODUTOS_BASE } from '../../loja/produtos'
import { useEstoque } from '../../loja/estoque'
import { Link, linkProduto } from '../../loja/rotas'
import type { Produto } from '../../loja/tipos'
import { brl, enderecosImagem, menorPreco, resumoMedidas } from '../../loja/util'
import { inclinar, soltar } from './Pecas'

/** Desenho técnico da peça, recortado da prancha (src/assets/pecas). */
export function Desenho({ desenho, alt, prioridade = false }: { desenho: [number, number, number]; alt: string; prioridade?: boolean }) {
  const [g, c, l] = desenho
  return <span className="desenho" role="img" aria-label={alt}>
    <img src={PRANCHAS[g]} alt="" loading={prioridade ? 'eager' : 'lazy'} decoding="async" draggable={false}
      style={{ width: `${PRANCHA_COLUNAS * 100}%`, left: `${-c * 100}%`, top: `${-l * 100}%` }} />
  </span>
}

/** Desenho de uma peça parecida da mesma linha, para peças novas sem foto. */
const desenhoDaLinha = (categoria: string) => PRODUTOS_BASE.find((b) => b.categoria === categoria)?.desenho ?? PRODUTOS_BASE[0].desenho

/**
  Foto vinda da planilha (Google Drive, Dropbox ou link direto). Se o primeiro endereço falhar,
  tenta a reserva; se nada abrir, mostra o que vier em `reserva` (o desenho da peça).
*/
export function FotoLoja({ link, alt, prioridade = false, reserva = null }: { link: string; alt: string; prioridade?: boolean; reserva?: ReactNode }) {
  const enderecos = enderecosImagem(link)
  const [tentativa, setTentativa] = useState(0)
  if (tentativa >= enderecos.length) return <>{reserva}</>
  return <span className="desenho is-foto-loja">
    <img key={enderecos[tentativa]} src={enderecos[tentativa]} alt={alt} loading={prioridade ? 'eager' : 'lazy'} decoding="async"
      referrerPolicy="no-referrer" draggable={false} onError={() => setTentativa((t) => t + 1)} />
  </span>
}

/** Imagem principal da peça: a foto da planilha quando existe; senão, o desenho do catálogo; peça nova sem nada usa o desenho da linha. */
export function ImagemPeca({ produto, prioridade = false, foto }: { produto: Produto; prioridade?: boolean; foto?: string }) {
  const desenho = produto.desenho
    ? <Desenho desenho={produto.desenho} alt={`Desenho técnico: ${produto.nome}`} prioridade={prioridade} />
    : <Desenho desenho={desenhoDaLinha(produto.categoria)} alt={produto.nome} prioridade={prioridade} />
  const link = foto ?? produto.fotosLoja[0]
  if (link) return <FotoLoja link={link} alt={produto.nome} prioridade={prioridade} reserva={desenho} />
  if (produto.desenho) return desenho
  const oficina = produto.fotos[0] ? FOTOS[produto.fotos[0]] : undefined
  if (oficina) return <span className="desenho is-foto"><img src={oficina.src} alt={oficina.alt} loading="lazy" decoding="async" /></span>
  return desenho
}

/** Preço do cartão: "a partir de", sob consulta ou um traço piscando enquanto a planilha chega. */
export function PrecoResumo({ produto }: { produto: Produto }) {
  const { status } = useEstoque()
  if (status === 'carregando') return <span className="preco is-carregando" aria-label="Carregando preço"><i /></span>
  const p = menorPreco(produto)
  if (p === null) return <span className="preco is-consulta">Sob consulta</span>
  const varia = produto.variantes.length > 1 || (produto.material && produto.variantes.some((v) => v.preco316 !== null && v.preco304 !== null && v.preco316 !== v.preco304))
  return <span className="preco">{varia && <small>a partir de</small>}<strong>{brl(p)}</strong></span>
}

export function CartaoProduto({ produto, indice = 0 }: { produto: Produto; indice?: number }) {
  const { categorias } = useEstoque()
  const linha = categorias.find((c) => c.id === produto.categoria)?.nome ?? ''
  return <Link href={linkProduto(produto.slug)} className="cartao-peca" data-cursor="abrir" draggable={false}
    onPointerMove={(e: PointerEvent<HTMLAnchorElement>) => inclinar(e, 0.8)} onPointerLeave={soltar}>
    <span className="cartao-peca-placa">
      <span className="cartao-peca-topo">
        <small>{linha}</small>
        {produto.material && <small className="cartao-peca-aco">304 · 316</small>}
      </span>
      <ImagemPeca produto={produto} prioridade={indice < 4} />
      <span className="cartao-peca-num" aria-hidden="true">{String(indice + 1).padStart(2, '0')}</span>
    </span>
    <span className="cartao-peca-info">
      <small>{produto.grupo}</small>
      <strong>{produto.nome}</strong>
      <span className="cartao-peca-medidas">{resumoMedidas(produto)}</span>
      <span className="cartao-peca-base">
        <PrecoResumo produto={produto} />
        <span className="cartao-peca-seta" aria-hidden="true"><ArrowUpRight /></span>
      </span>
    </span>
  </Link>
}

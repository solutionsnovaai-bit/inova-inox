import { Surgir, Titulo } from '../ui/Titulo'
import { passosCompra } from '../../data/conteudo'
import { mensagens, waLink } from '../../lib/site'
import { fotoDaCena } from '../../lib/fotos'
import { Imagem } from '../ui/Imagem'
import { BotaoMercadoLivre } from '../ui/Botoes'
import { Section } from '../ui/Section'

type PropsPassoCompra = { numero: number; titulo: string; texto: string }

export function PassoCompra({ numero, titulo, texto }: PropsPassoCompra) {
  return (
    <li className="ml-passo">
      <Surgir ordem={numero} className="ml-passo-linha">
        <span className="ml-passo-numero numero" aria-hidden="true">
          {numero}
        </span>
        <div>
          <h3 className="subtitulo">{titulo}</h3>
          <p className="ml-passo-texto">{texto}</p>
        </div>
      </Surgir>
    </li>
  )
}

/** Primeira seção depois do hero: explica a compra e leva para a loja. */
export function MercadoLivre() {
  const foto = fotoDaCena('10')

  return (
    <Section id="comprar" tom="claro" rotulo="Como comprar pelo Mercado Livre">
      <div className="ml-grade">
        <div className="ml-chamada">
          <Titulo className="titulo-secao" linhas={['Compre pelo', 'Mercado Livre.']} />
          <Surgir ordem={1}>
            <p className="texto-apoio ml-apoio">
              As peças prontas da Inova Inox ficam anunciadas lá. Você escolhe, paga e acompanha a
              entrega pela plataforma que já conhece.
            </p>
          </Surgir>

          <Surgir ordem={2} className="ml-caixa chanfro">
            <BotaoMercadoLivre texto="Abrir a loja" magnetico largo />
            <p className="texto-menor ml-nota">
              Dúvida sobre um anúncio?{' '}
              <a href={waLink(mensagens.duvidaAnuncio)} target="_blank" rel="noopener noreferrer">
                Pergunte no WhatsApp
              </a>
              .
            </p>
          </Surgir>
        </div>

        <div className="ml-lado">
          {foto && (
            <figure className="ml-foto chanfro">
              <Imagem foto={foto} />
            </figure>
          )}
          <ol className="ml-passos">
            {passosCompra.map((passo, i) => (
              <PassoCompra key={passo.titulo} numero={i + 1} {...passo} />
            ))}
          </ol>
        </div>
      </div>
    </Section>
  )
}

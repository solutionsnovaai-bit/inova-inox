import { useRef } from 'react'
import { type Peca, pecas } from '../../data/conteudo'
import { site, mensagens } from '../../lib/site'
import { useTilt } from '../../hooks/ponteiro'
import { DesenhoPeca } from '../desenhos/DesenhoPeca'
import { IconeSair } from '../ui/icons'
import { fotoDaCena } from '../../lib/fotos'
import { Imagem } from '../ui/Imagem'
import { BotaoWhatsApp } from '../ui/Botoes'
import { Section } from '../ui/Section'
import { Surgir, Titulo } from '../ui/Titulo'

type PropsPecaCard = { peca: Peca }

/** Cartão de família de peça. O cartão inteiro leva à loja. */
export function PecaCard({ peca }: PropsPecaCard) {
  const ref = useRef<HTMLAnchorElement>(null)
  useTilt(ref, 6)

  return (
    <a
      ref={ref}
      className="peca chapa"
      href={site.mercadoLivre}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${peca.nome}: ver no Mercado Livre (abre em nova aba)`}
    >
      <div className="chapa-miolo peca-miolo">
        <span className="peca-luz" aria-hidden="true" />
        <div className="peca-desenho">
          <DesenhoPeca id={peca.id} />
        </div>
        <div className="peca-texto">
          <span className="rotulo peca-processo">{peca.processo}</span>
          <h3 className="subtitulo text-white">{peca.nome}</h3>
          <p className="texto-menor">{peca.texto}</p>
        </div>
        <span className="peca-acao rotulo">
          Ver no Mercado Livre <IconeSair />
        </span>
      </div>
    </a>
  )
}

export function Pecas() {
  const foto = fotoDaCena('06')

  return (
    <Section id="pecas" rotulo="Peças em aço inox">
      <div className="cabecalho">
        <Titulo className="titulo-secao text-white" linhas={['O que sai', 'da nossa bancada.']} />
        <Surgir ordem={1}>
          <p className="texto-apoio">
            Quatro famílias de peças, todas em aço inox. Os modelos e as medidas disponíveis estão
            nos anúncios.
          </p>
        </Surgir>
      </div>

      {foto && (
        <figure className="pecas-foto chanfro">
          <Imagem foto={foto} />
        </figure>
      )}

      <ul className="pecas-grade">
        {pecas.map((peca) => (
          <li key={peca.id}>
            <PecaCard peca={peca} />
          </li>
        ))}
      </ul>

      <div className="pecas-medida chapa">
        <div className="chapa-miolo pecas-medida-miolo">
          <div>
            <h3 className="titulo titulo-medio text-white">Não achou a medida?</h3>
            <p className="pecas-medida-texto">
              Mande o desenho, a foto ou as medidas. A gente avalia e responde se dá para fabricar.
            </p>
          </div>
          <BotaoWhatsApp texto="Pedir peça sob medida" mensagem={mensagens.sobMedida} variante="zap" magnetico />
        </div>
      </div>
    </Section>
  )
}

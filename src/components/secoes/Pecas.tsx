import { useRef } from 'react'
import { type Peca, pecas } from '../../data/conteudo'
import { mensagens, waLink } from '../../lib/site'
import { useTilt } from '../../hooks/ponteiro'
import { DesenhoPeca } from '../desenhos/DesenhoPeca'
import { IconeSair } from '../ui/icons'
import { BotaoWhatsApp } from '../ui/Botoes'
import { Section } from '../ui/Section'
import { Surgir, Titulo } from '../ui/Titulo'

type PropsPecaCard = { peca: Peca }

/** Cartão de peça. O cartão inteiro abre o WhatsApp já com o nome da peça na mensagem. */
export function PecaCard({ peca }: PropsPecaCard) {
  const ref = useRef<HTMLAnchorElement>(null)
  useTilt(ref, 6)

  return (
    <a
      ref={ref}
      className="peca chapa"
      href={waLink(peca.mensagem)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${peca.nome}: cotar no WhatsApp (abre em nova aba)`}
    >
      <div className="chapa-miolo peca-miolo">
        <span className="peca-luz" aria-hidden="true" />
        <div className="peca-desenho">
          <DesenhoPeca id={peca.id} />
        </div>
        <div className="peca-texto">
          <h3 className="subtitulo text-white">{peca.nome}</h3>
          <p className="texto-menor">{peca.texto}</p>
        </div>
        <span className="peca-acao rotulo">
          Cotar no WhatsApp <IconeSair />
        </span>
      </div>
    </a>
  )
}

export function Pecas() {
  return (
    <Section id="conexoes" tom="chapa" rotulo="Conexões da linha sanitária">
      <div className="cabecalho">
        <Titulo className="titulo-secao text-white" linhas={['As peças', 'da linha.']} />
        <Surgir ordem={1}>
          <p className="texto-apoio">
            Em inox 304 ou 316, nos padrões Tri-Clamp, SMS, RJT, DIN, OD, BSP e NPT. Toque na peça
            e o pedido de cotação abre no WhatsApp.
          </p>
          <a href="#catalogo" className="link-fio pecas-catalogo">
            Ver as medidas no catálogo técnico
          </a>
        </Surgir>
      </div>

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
            <h3 className="titulo titulo-medio text-white">Não sabe o padrão da sua linha?</h3>
            <p className="pecas-medida-texto">
              Mande uma foto da ponta da conexão e a medida do tubo. A gente identifica o padrão e o
              diâmetro e já responde com a cotação.
            </p>
          </div>
          <BotaoWhatsApp texto="Mandar foto no WhatsApp" mensagem={mensagens.identificar} magnetico />
        </div>
      </div>
    </Section>
  )
}

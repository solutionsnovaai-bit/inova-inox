import { useState, type FormEvent } from 'react'
import { site, montarOrcamento, waLink } from '../../lib/site'
import { IconeConversa } from '../ui/icons'
import { Section } from '../ui/Section'
import { Surgir, Titulo } from '../ui/Titulo'

type PropsPreviaConversa = { mensagem: string }

/** Mostra a mensagem do jeito que ela vai chegar na conversa. */
export function PreviaConversa({ mensagem }: PropsPreviaConversa) {
  return (
    <aside className="previa chapa" aria-label="Prévia da mensagem">
      <div className="chapa-miolo previa-miolo">
        <header className="previa-topo">
          <span className="previa-avatar numero" aria-hidden="true">
            I
          </span>
          <div>
            <p className="subtitulo text-white">{site.nome}</p>
            <p className="texto-menor">{site.whatsappExibicao}</p>
          </div>
        </header>

        <div className="previa-conversa" aria-live="polite">
          <p className="previa-aviso texto-menor">Sua mensagem vai sair assim</p>
          <div className="previa-bolha">
            {mensagem.split('\n').map((linha, i) => (
              <p key={i}>{linha}</p>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

const opcoes = ['Peça sob medida', 'Usinagem', 'Polimento', 'Solda'] as const

/**
 * Formulário de orçamento. Nada é enviado a servidor nenhum: os campos
 * só montam a mensagem que abre no WhatsApp do visitante.
 */
export function Orcamento() {
  const [nome, setNome] = useState('')
  const [servico, setServico] = useState<string>(opcoes[0])
  const [quantidade, setQuantidade] = useState('')
  const [detalhes, setDetalhes] = useState('')

  const mensagem = montarOrcamento({ nome, servico, quantidade, detalhes })

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    window.open(waLink(mensagem), '_blank', 'noopener,noreferrer')
  }

  return (
    <Section id="orcamento" rotulo="Pedir orçamento">
      <div className="orcamento-grade">
        <div>
          <Titulo className="titulo-secao text-white" linhas={['Peça seu', 'orçamento.']} />
          <Surgir ordem={1}>
            <p className="texto-apoio orcamento-apoio">
              Preencha o que souber. A mensagem abre pronta no seu WhatsApp, e por lá você manda a
              foto ou o desenho.
            </p>
          </Surgir>

          <form className="formulario" onSubmit={enviar}>
            <fieldset className="campo">
              <legend className="rotulo">O que você precisa</legend>
              <div className="opcoes">
                {opcoes.map((opcao) => (
                  <label key={opcao} className="opcao">
                    <input
                      type="radio"
                      name="servico"
                      value={opcao}
                      checked={servico === opcao}
                      onChange={() => setServico(opcao)}
                    />
                    <span>{opcao}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="campos-dupla">
              <label className="campo">
                <span className="rotulo">Seu nome</span>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  autoComplete="given-name"
                  placeholder="Como podemos te chamar"
                />
              </label>
              <label className="campo">
                <span className="rotulo">Quantidade</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  placeholder="Ex.: 10 peças"
                />
              </label>
            </div>

            <label className="campo">
              <span className="rotulo">Detalhes da peça ou do serviço</span>
              <textarea
                rows={4}
                value={detalhes}
                onChange={(e) => setDetalhes(e.target.value)}
                placeholder="Medidas, tipo de inox, acabamento, onde a peça vai ser usada"
              />
            </label>

            <button type="submit" className="botao botao--zap botao--largo">
              <IconeConversa />
              Enviar pelo WhatsApp
            </button>
          </form>
        </div>

        <PreviaConversa mensagem={mensagem} />
      </div>
    </Section>
  )
}

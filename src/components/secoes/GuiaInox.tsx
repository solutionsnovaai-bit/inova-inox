import { criterios, ligas, notas } from '../../data/conteudo'
import { Section } from '../ui/Section'
import { Surgir, Titulo } from '../ui/Titulo'

/** Guia rápido: os três tipos de inox mais comuns e como cuidar da peça. */
export function GuiaInox() {
  return (
    <Section id="guia" tom="claro" rotulo="Guia rápido do aço inox">
      <div className="cabecalho">
        <Titulo className="titulo-secao" linhas={['Inox não é', 'tudo igual.']} />
        <Surgir ordem={1}>
          <p className="texto-apoio guia-apoio">
            O número do aço diz onde a peça aguenta. Antes de comprar, vale saber qual é o seu.
          </p>
        </Surgir>
      </div>

      <div className="ligas">
        {ligas.map((liga) => (
          <article key={liga.nome} className="liga">
            <header className="liga-topo">
              <span className="liga-numero numero">{liga.nome}</span>
              <span className="subtitulo">{liga.apelido}</span>
            </header>
            <dl className="liga-dados">
              {criterios.map((criterio) => (
                <div key={criterio.chave} className="liga-linha">
                  <dt className="rotulo">{criterio.rotulo}</dt>
                  <dd>{liga[criterio.chave]}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      <div className="notas">
        {notas.map((nota) => (
          <div key={nota.titulo} className="nota">
            <h3 className="subtitulo">{nota.titulo}</h3>
            <p>{nota.texto}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

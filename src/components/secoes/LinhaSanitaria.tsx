import { materiais, normas } from '../../data/conteudo'
import { midiaOficina } from '../../lib/fotos'
import { mensagens, site, telLink } from '../../lib/site'
import { BotaoWhatsApp } from '../ui/Botoes'
import { IconeTelefone } from '../ui/icons'
import { Section } from '../ui/Section'
import { Surgir, Titulo } from '../ui/Titulo'

/** As quatro frentes da linha, do jeito que a Inova Inox apresenta o que fornece. */
const frentes = [
  {
    titulo: 'Conexões sanitárias em inox 304 e 316',
    destino: '#padroes',
  },
  {
    titulo: 'Curvas, tês, reduções, espigões, niples, uniões, abraçadeiras e outras conexões',
    destino: '#conexoes',
  },
  {
    titulo: 'Fabricação de peças sob desenho ou amostra',
    destino: '#sob-medida',
  },
  {
    titulo: 'Serviços de usinagem, soldagem e polimento/acabamento',
    destino: '#servicos',
  },
] as const

/** Os sete padrões de conexão, mais o quadro do material. */
export function Normas() {
  return (
    <ul id="padroes" className="normas" aria-label="Padrões de conexão">
      {normas.map((norma) => (
        <li key={norma.nome} className="norma">
          <span className="norma-nome numero">{norma.nome}</span>
          <span className="norma-texto">{norma.texto}</span>
        </li>
      ))}
      <li className="norma norma--material">
        <span className="norma-nome numero">{materiais.join(' · ')}</span>
        <span className="norma-texto">Conexões em inox 304 e 316.</span>
      </li>
    </ul>
  )
}

/** Primeira seção depois do hero: diz com todas as letras que a Inova Inox fornece linha sanitária. */
export function LinhaSanitaria() {
  const foto = midiaOficina('curvas-polidas')

  return (
    <Section id="linha-sanitaria" tom="claro" rotulo="Linha sanitária em inox">
      <div className="linha-grade">
        <div className="linha-chamada">
          <Titulo className="titulo-secao" linhas={['Fornecemos', 'linha sanitária.']} />
          <Surgir ordem={1}>
            <p className="texto-apoio linha-apoio">
              Conexões em inox 304 e 316 para processos que pedem higiene: alimentos, bebidas,
              laticínios, farmacêutico e cosmético. Com usinagem, soldagem e polimento na nossa própria
              oficina.
            </p>
          </Surgir>

          {foto && (
            <Surgir ordem={2}>
              <figure className="linha-foto chanfro">
                <img className="imagem" src={foto.src} alt={foto.legenda} loading="lazy" decoding="async" draggable={false} />
                <figcaption className="linha-foto-legenda rotulo">Curvas e conexões recém-polidas</figcaption>
              </figure>
            </Surgir>
          )}
        </div>

        <div className="linha-lado">
          <ol className="frentes">
            {frentes.map((frente, i) => (
              <li key={frente.titulo} className="frente">
                <Surgir ordem={i} className="frente-linha">
                  <span className="frente-numero numero" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <a href={frente.destino} className="frente-titulo subtitulo">
                    {frente.titulo}
                  </a>
                </Surgir>
              </li>
            ))}
          </ol>

          <Surgir ordem={1}>
            <h3 className="rotulo linha-rotulo">Padrões de conexão</h3>
            <Normas />
          </Surgir>

          <Surgir ordem={2} className="linha-caixa chanfro">
            <p className="subtitulo text-white">Diga a peça, o padrão, o diâmetro e o inox.</p>
            <BotaoWhatsApp texto="Cotar linha sanitária" mensagem={mensagens.linhaSanitaria} magnetico largo />
            <a href={telLink} className="linha-tel">
              <IconeTelefone />
              Ou ligue {site.telefoneExibicao}
            </a>
          </Surgir>
        </div>
      </div>
    </Section>
  )
}

import { navegacao } from '../../data/conteudo'
import { site, mensagens, telLink, waLink } from '../../lib/site'
import { IconeSair } from '../ui/icons'
import { Marca } from './Navbar'

export function Footer() {
  const ano = new Date().getFullYear()

  return (
    <footer className="rodape" data-esconde-barra>
      <div className="conteudo rodape-grade">
        <div className="rodape-marca">
          <Marca altura={64} />
          <p className="texto-menor rodape-frase">
            Linha sanitária em inox 304 e 316: conexões, peças sob desenho ou amostra, usinagem,
            soldagem e polimento.
          </p>
        </div>

        <nav className="rodape-coluna" aria-label="Rodapé">
          <h2 className="rotulo rodape-titulo">Site</h2>
          {navegacao.map((item) => (
            <a key={item.destino} href={item.destino} className="rodape-link">
              {item.rotulo}
            </a>
          ))}
        </nav>

        <div className="rodape-coluna">
          <h2 className="rotulo rodape-titulo">Fale com a gente</h2>
          <a href={waLink(mensagens.geral)} target="_blank" rel="noopener noreferrer" className="rodape-link">
            WhatsApp {site.whatsappExibicao} <IconeSair />
          </a>
          <a href={telLink} className="rodape-link">
            Telefone {site.telefoneExibicao}
          </a>
          <a href="#orcamento" className="rodape-link">
            Pedir orçamento
          </a>
        </div>
      </div>

      <div className="rodape-gigante titulo vazado" aria-hidden="true">
        Inova Inox
      </div>

      <div className="conteudo rodape-base texto-menor">
        <span>© {ano} Inova Inox. Todos os direitos reservados.</span>
        <a href="#topo" className="rodape-link">
          Voltar ao topo
        </a>
      </div>
    </footer>
  )
}

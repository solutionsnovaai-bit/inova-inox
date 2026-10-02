import { navegacao } from '../../data/conteudo'
import { site, mensagens, waLink } from '../../lib/site'
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
            Peças em aço inox, usinagem, polimento e solda.
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
          <h2 className="rotulo rodape-titulo">Comprar e falar</h2>
          <a href={site.mercadoLivre} target="_blank" rel="noopener noreferrer" className="rodape-link">
            Loja no Mercado Livre <IconeSair />
          </a>
          <a href={waLink(mensagens.geral)} target="_blank" rel="noopener noreferrer" className="rodape-link">
            WhatsApp {site.whatsappExibicao} <IconeSair />
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

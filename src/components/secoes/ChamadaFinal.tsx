import { mensagens } from '../../lib/site'
import { BotaoMercadoLivre, BotaoWhatsApp } from '../ui/Botoes'
import { Surgir, Titulo } from '../ui/Titulo'

/** Fecho do site: repete os dois caminhos, comprar pronto ou pedir sob medida. */
export function ChamadaFinal() {
  return (
    <section aria-label="Comprar ou pedir orçamento" className="chamada" data-esconde-barra>
      <div className="conteudo chamada-grade">
        <Titulo className="titulo-secao text-white" linhas={['A peça pode', 'já estar pronta.']} />
        <Surgir ordem={1} className="chamada-lado">
          <p className="texto-apoio chamada-apoio">
            Veja os anúncios no Mercado Livre. Se não estiver lá, a gente fabrica.
          </p>
          <div className="chamada-acoes">
            <BotaoMercadoLivre magnetico />
            <BotaoWhatsApp variante="tinta" mensagem={mensagens.sobMedida} magnetico />
          </div>
        </Surgir>
      </div>
    </section>
  )
}

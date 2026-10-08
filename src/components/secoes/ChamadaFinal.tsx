import { mensagens } from '../../lib/site'
import { BotaoLigar, BotaoWhatsApp } from '../ui/Botoes'
import { Surgir, Titulo } from '../ui/Titulo'

/** Fecho do site: repete os dois contatos, WhatsApp e telefone. */
export function ChamadaFinal() {
  return (
    <section aria-label="Comprar ou pedir orçamento" className="chamada" data-esconde-barra>
      <div className="conteudo chamada-grade">
        <Titulo className="titulo-secao text-white" linhas={['Precisa de', 'conexão em inox?']} />
        <Surgir ordem={1} className="chamada-lado">
          <p className="texto-apoio chamada-apoio">
            Diga a peça, o padrão e o diâmetro. Se não for de linha, a gente fabrica pelo desenho
            ou pela amostra.
          </p>
          <div className="chamada-acoes">
            <BotaoWhatsApp texto="Cotar no WhatsApp" mensagem={mensagens.linhaSanitaria} magnetico />
            <BotaoLigar variante="tinta" magnetico />
          </div>
        </Surgir>
      </div>
    </section>
  )
}

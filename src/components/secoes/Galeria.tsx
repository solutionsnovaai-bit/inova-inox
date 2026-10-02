import { type Foto, galeria } from '../../lib/fotos'
import { Imagem } from '../ui/Imagem'
import { textoGaleria } from '../../data/conteudo'
import { Marquee } from '../ui/Marquee'
import { Surgir, Titulo } from '../ui/Titulo'

type PropsFotoGaleria = { foto: Foto }

export function FotoGaleria({ foto }: PropsFotoGaleria) {
  return (
    <figure className="galeria-foto chanfro">
      <Imagem foto={foto} />
    </figure>
  )
}

/**
 * Carrossel duplo de fotos. Lê tudo o que estiver em src/assets/galeria.
 * Enquanto a pasta estiver vazia, a seção não aparece.
 */
export function Galeria() {
  if (galeria.length === 0) return null

  const meio = Math.ceil(galeria.length / 2)
  const cima = galeria.slice(0, meio)
  const baixo = galeria.slice(meio)

  return (
    <section id="galeria" aria-label="Fotos de trabalhos em inox" className="secao secao--sangra bg-preto">
      <div className="conteudo cabecalho">
        <Titulo className="titulo-secao text-white" linhas={textoGaleria.titulo} />
        <Surgir ordem={1}>
          <p className="texto-apoio">{textoGaleria.apoio}</p>
        </Surgir>
      </div>

      <div className="galeria">
        <Marquee duracao={cima.length * 11} className="galeria-faixa">
          {cima.map((foto) => (
            <FotoGaleria key={foto.id} foto={foto} />
          ))}
        </Marquee>
        {baixo.length > 0 && (
          <Marquee duracao={baixo.length * 13} inverso className="galeria-faixa">
            {baixo.map((foto) => (
              <FotoGaleria key={foto.id} foto={foto} />
            ))}
          </Marquee>
        )}
      </div>

      <p className="conteudo texto-menor galeria-nota">Imagens ilustrativas.</p>
    </section>
  )
}

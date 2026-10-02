import { forwardRef, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { type Servico, servicos } from '../../data/conteudo'
import { fotoDaCena } from '../../lib/fotos'
import { Imagem } from '../ui/Imagem'
import { BotaoWhatsApp } from '../ui/Botoes'
import { IconeCheck } from '../ui/icons'
import { EASE } from '../../lib/util'
import { DesenhoServico } from '../desenhos/DesenhoServico'
import { Titulo } from '../ui/Titulo'

type PropsServicoPainel = { servico: Servico; ativo: boolean; indice: number }

export const ServicoPainel = forwardRef<HTMLElement, PropsServicoPainel>(function ServicoPainel(
  { servico, ativo, indice },
  ref,
) {
  const foto = fotoDaCena(servico.cena)

  return (
    <article
      ref={ref}
      id={`servico-${servico.id}`}
      className="servico"
      data-indice={indice}
      data-ativo={ativo || undefined}
    >
      {foto && (
        <figure className="servico-foto chanfro">
          <Imagem foto={foto} />
        </figure>
      )}

      <h3 className="titulo servico-nome">{servico.nome}</h3>
      <p className="subtitulo servico-chamada">{servico.chamada}</p>
      <p className="servico-texto">{servico.texto}</p>

      <ul className="servico-pontos">
        {servico.pontos.map((ponto) => (
          <li key={ponto}>
            <IconeCheck />
            {ponto}
          </li>
        ))}
      </ul>

      <BotaoWhatsApp
        texto={`Orçamento de ${servico.nome.toLowerCase()}`}
        mensagem={servico.mensagem}
        magnetico
      />
    </article>
  )
})

/**
 * Serviços. No desktop a folha de desenho fica parada à esquerda e troca
 * conforme o serviço que está no meio da tela. No celular cada serviço
 * traz o próprio desenho.
 */
export function Servicos() {
  const [ativo, setAtivo] = useState(0)
  const paineis = useRef<Array<HTMLElement | null>>([])

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) setAtivo(Number((e.target as HTMLElement).dataset.indice))
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    paineis.current.forEach((p) => p && io.observe(p))
    return () => io.disconnect()
  }, [])

  const servico = servicos[ativo]

  return (
    <section id="servicos" aria-label="Serviços em aço inox" className="secao escovado-escuro">
      <div className="conteudo">
        <div className="cabecalho">
          <Titulo className="titulo-secao text-white" linhas={['Três serviços,', 'uma oficina só.']} />
        </div>

        <div className="servicos-grade">
          <div className="servicos-folha-coluna">
            <div className="folha chapa">
              <div className="chapa-miolo folha-miolo">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={servico.id}
                    className="folha-desenho"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <DesenhoServico servico={servico} />
                  </motion.div>
                </AnimatePresence>
                <div className="folha-carimbo">
                  <span className="rotulo">Inova Inox</span>
                  <span className="rotulo folha-carimbo-nome">{servico.nome}</span>
                  <span className="rotulo">
                    {ativo + 1}/{servicos.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="servicos-paineis">
            {servicos.map((item, i) => (
              <ServicoPainel
                key={item.id}
                servico={item}
                ativo={i === ativo}
                ref={(el) => {
                  paineis.current[i] = el
                }}
                indice={i}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

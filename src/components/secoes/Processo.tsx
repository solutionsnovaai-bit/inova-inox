import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { processo } from '../../data/conteudo'
import { mensagens } from '../../lib/site'
import { BotaoWhatsApp } from '../ui/Botoes'
import { Surgir, Titulo } from '../ui/Titulo'

/** Os quatro passos da peça sob desenho ou amostra. A linha azul enche conforme a rolagem. */
export function Processo() {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 78%', 'end 55%'] })
  const avanco = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })

  return (
    <section id="sob-medida" aria-label="Peças sob desenho ou amostra" className="secao bg-preto">
      <div className="conteudo">
        <div className="cabecalho">
          <Titulo className="titulo-secao text-white" linhas={['Sob desenho', 'ou amostra.']} />
          <Surgir ordem={1}>
            <p className="texto-apoio">
              Para a peça que não é de linha, o caminho é este. Começa com uma mensagem.
            </p>
          </Surgir>
        </div>

        <ol ref={ref} className="processo">
          <motion.span className="processo-linha" style={{ ['--avanco' as string]: avanco }} aria-hidden="true" />
          {processo.map((passo, i) => (
            <li key={passo.titulo} className="processo-passo">
              <span className="processo-numero numero" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="subtitulo text-white">{passo.titulo}</h3>
              <p className="texto-menor">{passo.texto}</p>
            </li>
          ))}
        </ol>

        <BotaoWhatsApp texto="Mandar desenho no WhatsApp" mensagem={mensagens.sobDesenho} magnetico />
      </div>
    </section>
  )
}

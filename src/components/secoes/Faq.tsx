import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { EASE } from '../../lib/util'
import { IconeMais } from '../ui/icons'
import { perguntas } from '../../data/conteudo'
import { mensagens } from '../../lib/site'
import { BotaoWhatsApp } from '../ui/Botoes'
import { Surgir, Titulo } from '../ui/Titulo'

type PropsFaqItem = {
  indice: number
  pergunta: string
  resposta: string
  aberta: boolean
  aoAlternar: () => void
}

export function FaqItem({ indice, pergunta, resposta, aberta, aoAlternar }: PropsFaqItem) {
  const idResposta = `resposta-${indice}`

  return (
    <div className="faq-item" data-aberta={aberta || undefined}>
      <h3>
        <button
          type="button"
          className="faq-pergunta subtitulo"
          aria-expanded={aberta}
          aria-controls={idResposta}
          onClick={aoAlternar}
        >
          {pergunta}
          <span className="faq-sinal" aria-hidden="true">
            <IconeMais />
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {aberta && (
          <motion.div
            id={idResposta}
            role="region"
            className="faq-resposta"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <p>{resposta}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Faq() {
  const [aberta, setAberta] = useState<number | null>(0)

  return (
    <section id="duvidas" aria-label="Dúvidas frequentes" className="secao escovado-escuro">
      <div className="conteudo faq-grade">
        <div className="faq-lateral">
          <Titulo className="titulo-secao text-white" linhas={['Dúvidas', 'comuns.']} />
          <Surgir ordem={1}>
            <p className="texto-apoio faq-apoio">Não achou a sua? Pergunte direto pra gente.</p>
            <BotaoWhatsApp texto="Perguntar no WhatsApp" mensagem={mensagens.geral} />
          </Surgir>
        </div>

        <div className="faq-lista">
          {perguntas.map((item, i) => (
            <FaqItem
              key={item.pergunta}
              indice={i}
              pergunta={item.pergunta}
              resposta={item.resposta}
              aberta={aberta === i}
              aoAlternar={() => setAberta(aberta === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

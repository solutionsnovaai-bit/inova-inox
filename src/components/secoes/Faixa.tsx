import { Fragment } from 'react'
import { Marquee } from '../ui/Marquee'
import { IconeLosango } from '../ui/icons'

const palavras = ['Usinagem', 'Polimento', 'Solda', 'Peças em inox']

/** Faixa azul em movimento com o que a Inova Inox faz. */
export function Faixa() {
  return (
    <div className="faixa" role="presentation">
      <Marquee duracao={30}>
        {[...palavras, ...palavras].map((palavra, i) => (
          <Fragment key={i}>
            <span className="faixa-palavra titulo">{palavra}</span>
            <IconeLosango className="faixa-marca" />
          </Fragment>
        ))}
      </Marquee>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'
import { logo } from '../../lib/logo'
import { EASE } from '../../lib/util'
import { useSceneActivity, useMovimentoReduzido } from '../../hooks/basicos'
import { IconeArrastar } from '../ui/icons'
import { Section } from '../ui/Section'
import { Surgir, Titulo } from '../ui/Titulo'

const acabamentos = [
  {
    id: 'escovado',
    nome: 'Escovado',
    texto: 'Riscos finos numa direção só. Disfarça marcas de uso.',
  },
  {
    id: 'acetinado',
    nome: 'Acetinado',
    texto: 'Fosco e uniforme, sem reflexo direto.',
  },
  {
    id: 'espelhado',
    nome: 'Espelhado',
    texto: 'Reflete como espelho. É o acabamento mais liso.',
  },
] as const

/** Os três acabamentos mais pedidos, cada um com uma amostra da superfície. */
export function Acabamentos() {
  return (
    <ul className="acabamentos">
      {acabamentos.map((item) => (
        <li key={item.id} className="acabamento">
          <span className={`amostra amostra--${item.id}`} aria-hidden="true" />
          <div>
            <h3 className="subtitulo text-white">{item.nome}</h3>
            <p className="texto-menor">{item.texto}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

/**
 * Comparador de polimento. Um controle deslizante (funciona com mouse,
 * toque e teclado) separa a chapa bruta da chapa espelhada.
 */
export function Polimento() {
  const ref = useRef<HTMLDivElement>(null)
  const naTela = useSceneActivity(ref, '-25% 0px')
  const reduzido = useMovimentoReduzido()
  const [corte, setCorte] = useState(18)
  const demonstrou = useRef(false)

  // Na primeira vez que aparece, o fio corre sozinho para mostrar que dá para arrastar.
  useEffect(() => {
    if (!naTela || demonstrou.current || reduzido) return
    demonstrou.current = true
    const controle = animate(18, 62, {
      duration: 1.6,
      delay: 0.2,
      ease: EASE,
      onUpdate: (v) => setCorte(Math.round(v)),
    })
    return () => controle.stop()
  }, [naTela, reduzido])

  const parar = () => {
    demonstrou.current = true
  }

  return (
    <Section id="polimento" rotulo="Polimento em aço inox">
      <div className="cabecalho">
        <Titulo className="titulo-secao text-white" linhas={['Arraste e veja', 'o polimento.']} />
        <Surgir ordem={1}>
          <p className="texto-apoio">
            De um lado, o inox como sai do corte. Do outro, depois de lixado e polido até virar
            espelho.
          </p>
        </Surgir>
      </div>

      <div ref={ref} className="polir chanfro" style={{ ['--corte' as string]: `${corte}%` }}>
        <div className="polir-face polir-bruto">
          <img src={logo.completo} alt="" draggable={false} />
        </div>
        <div className="polir-face polir-espelho">
          <img src={logo.completo} alt="" draggable={false} />
          <span className="polir-reflexo" />
        </div>

        <span className="polir-nome polir-nome--polido rotulo">Polido</span>
        <span className="polir-nome polir-nome--bruto rotulo">Bruto</span>

        <div className="polir-fio" aria-hidden="true">
          <span className="polir-pega">
            <IconeArrastar />
          </span>
        </div>

        <input
          className="polir-controle"
          type="range"
          min={0}
          max={100}
          value={corte}
          onChange={(e) => setCorte(Number(e.target.value))}
          onPointerDown={parar}
          onKeyDown={parar}
          aria-label="Quanto da chapa está polida"
          aria-valuetext={`${corte}% polido`}
        />
      </div>

      <Acabamentos />
    </Section>
  )
}

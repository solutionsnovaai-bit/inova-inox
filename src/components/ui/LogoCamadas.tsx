import { motion, type Variants } from 'framer-motion'
import { camadas, PROPORCAO_LOGO, type CamadaLogo } from '../../lib/logo'
import { passe } from '../../lib/roteiroLoader'
import { cn } from '../../lib/util'

type Props = {
  className?: string
  /** Estado da forja. Sem ele, o logotipo aparece montado e parado. */
  estado?: 'oculto' | 'visivel'
  /** Multiplicador de tempo: 1 é o normal, menos que 1 acelera. */
  ritmo?: number
  comAssinatura?: boolean
}

const BRILHO_QUENTE = 'drop-shadow(0px 0px 16px rgba(255, 150, 40, 0.95))'
const BRILHO_FRIO = 'drop-shadow(0px 0px 0px rgba(255, 150, 40, 0))'
const ASSENTA = [0.16, 1, 0.3, 1] as const

type Forja = {
  /** Como a peça aparece. */
  peca: Variants
  /** Quando e em quanto tempo a brasa por cima dela esfria. */
  esfria: { atraso: number; duracao: number }
}

/**
 * Cada peça aparece no instante em que o arco de solda passa por ela
 * (os tempos vêm de lib/roteiroLoader.ts) e depois esfria até o aço.
 */
function forja(camada: CamadaLogo, k: number): Forja {
  if (camada.grupo === 'arco' || camada.grupo === 'assinatura') {
    const p = passe(camada.id as 'arco-superior' | 'arco-inferior' | 'assinatura')
    const daDireita = camada.id === 'arco-inferior'
    return {
      peca: {
        oculto: {
          clipPath: daDireita ? 'inset(-60% 0% -60% 100%)' : 'inset(-60% 100% -60% 0%)',
          filter: BRILHO_QUENTE,
        },
        visivel: {
          clipPath: 'inset(-60% 0% -60% 0%)',
          filter: BRILHO_FRIO,
          transition: {
            clipPath: { duration: (p.fim - p.inicio) * k, delay: p.inicio * k, ease: 'linear' },
            filter: { duration: 1.1 * k, delay: (p.inicio + 0.3) * k, ease: 'easeOut' },
          },
        },
      },
      esfria: { atraso: (p.inicio + 0.22) * k, duracao: 1 * k },
    }
  }

  const p = passe(camada.grupo)
  const [x0] = p.ponto(0)
  const [x1] = p.ponto(1)
  const centro = camada.x + camada.w / 2
  const chegada = p.inicio + ((centro - x0) / (x1 - x0)) * (p.fim - p.inicio) - 0.06
  return {
    peca: {
      oculto: { opacity: 0, scale: 1.16, y: '-8%', filter: BRILHO_QUENTE },
      visivel: {
        opacity: 1,
        scale: 1,
        y: '0%',
        filter: BRILHO_FRIO,
        transition: {
          opacity: { duration: 0.08 * k, delay: chegada * k },
          scale: { duration: 0.55 * k, delay: chegada * k, ease: ASSENTA },
          y: { duration: 0.55 * k, delay: chegada * k, ease: ASSENTA },
          filter: { duration: 1 * k, delay: (chegada + 0.15) * k, ease: 'easeOut' },
        },
      },
    },
    esfria: { atraso: (chegada + 0.1) * k, duracao: 0.9 * k },
  }
}

/**
 * Logotipo montado peça por peça. As 12 camadas ficam posicionadas
 * em porcentagem sobre uma prancha com a proporção do logo original.
 */
export function LogoCamadas({ className, estado, ritmo = 1, comAssinatura = true }: Props) {
  const lista = comAssinatura ? camadas : camadas.filter((c) => c.grupo !== 'assinatura')

  return (
    <div
      className={cn('logo-camadas', className)}
      style={{ aspectRatio: PROPORCAO_LOGO }}
      role="img"
      aria-label="Inova Inox: usinagem, polimento e solda"
    >
      {lista.map((camada) => {
        const anima = estado ? forja(camada, ritmo) : undefined
        return (
          <motion.div
            key={camada.id}
            className="logo-camada"
            style={{
              left: `${camada.x}%`,
              top: `${camada.y}%`,
              width: `${camada.w}%`,
              height: `${camada.h}%`,
            }}
            variants={anima?.peca}
            initial={estado ? 'oculto' : false}
            animate={estado}
          >
            <img src={camada.src} alt="" draggable={false} decoding="async" />
            {anima && (
              <motion.span
                className="logo-brasa"
                style={{ WebkitMaskImage: `url(${camada.src})`, maskImage: `url(${camada.src})` }}
                variants={{
                  oculto: { opacity: 1 },
                  visivel: {
                    opacity: 0,
                    transition: { duration: anima.esfria.duracao, delay: anima.esfria.atraso, ease: 'easeIn' },
                  },
                }}
              />
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

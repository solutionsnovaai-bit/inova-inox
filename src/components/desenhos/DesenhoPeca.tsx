import type { Peca } from '../../data/conteudo'

type Props = { id: Peca['id'] }

/** Ilustração em traço de cada família de peça. Decorativa: o nome vem no cartão. */
export function DesenhoPeca({ id }: Props) {
  return (
    <svg className="desenho desenho--peca" viewBox="0 0 240 170" aria-hidden="true">
      {id === 'torneada' && (
        <>
          <path className="desenho-centro" d="M14 85H226" />
          <path className="desenho-peca" d="M30 62H86V46H150V32H206V138H150V124H86V108H30Z" />
          <path className="desenho-fino" d="M86 46V124M150 32V138" />
          <path className="desenho-azul" d="M100 46V124M112 46V124M124 46V124M136 46V124" />
        </>
      )}

      {id === 'fresada' && (
        <>
          <path className="desenho-peca" d="M44 28H196L212 44V126L196 142H44L28 126V44Z" />
          <circle className="desenho-fino" cx="58" cy="56" r="9" />
          <circle className="desenho-fino" cx="182" cy="56" r="9" />
          <circle className="desenho-fino" cx="58" cy="114" r="9" />
          <circle className="desenho-fino" cx="182" cy="114" r="9" />
          <rect className="desenho-azul" x="88" y="70" width="64" height="30" rx="15" />
          <path className="desenho-centro" d="M120 40V130M72 85H168" />
        </>
      )}

      {id === 'soldada' && (
        <>
          <path className="desenho-peca" d="M20 96H220V132H20Z" />
          <path className="desenho-peca" d="M100 22H140V96H100Z" />
          <path className="desenho-centro" d="M120 12V146" />
          <path
            className="desenho-azul"
            d="M86 96c2 -10 10 -10 14 -2M140 94c4 -8 12 -8 14 2M88 96q6 -6 12 0M140 96q6 -6 12 0"
          />
          <path className="desenho-fino" d="M152 90L186 52H220M196 52l8 -12 8 12" />
        </>
      )}

      {id === 'polida' && (
        <>
          <circle className="desenho-peca" cx="120" cy="85" r="58" />
          <circle className="desenho-fino" cx="120" cy="85" r="22" />
          <path className="desenho-centro" d="M120 16V154M50 85H190" />
          <path className="desenho-azul" d="M82 60q14 -22 40 -24M76 76q6 -10 12 -14" />
          <path className="desenho-azul" d="M176 40v20M166 50h20M190 66v10M185 71h10" />
        </>
      )}
    </svg>
  )
}

import type { IdPeca } from '../../data/conteudo'

type Props = { id: IdPeca }

/**
 * Vista técnica, em traço, de cada peça da linha sanitária.
 * Decorativa: o nome vem no cartão. Todas no mesmo quadro de 240 x 170.
 */
export function DesenhoPeca({ id }: Props) {
  return (
    <svg className="desenho desenho--peca" viewBox="0 0 240 170" aria-hidden="true">
      {id === 'curva' && (
        <>
          <path className="desenho-centro" d="M12 125H90A60 60 0 0 0 150 65V8" />
          <path className="desenho-peca" d="M32 141H90A76 76 0 0 0 166 65V27" />
          <path className="desenho-peca" d="M32 109H90A44 44 0 0 0 134 65V27" />
          {/* Férulas Tri-Clamp nas duas pontas. */}
          <path className="desenho-peca" d="M32 109L26 95H20V155H26L32 141" />
          <path className="desenho-peca" d="M134 27L120 21V15H180V21L166 27" />
          <path className="desenho-azul" d="M90 95A30 30 0 0 0 120 65" />
          <text className="desenho-legenda desenho-legenda--azul" x="54" y="82">
            90°
          </text>
        </>
      )}

      {id === 'te' && (
        <>
          <path className="desenho-centro" d="M8 121H232M120 12V150" />
          <path className="desenho-peca" d="M34 137H206M34 105H104V40M136 40V105H206" />
          <path className="desenho-peca" d="M34 105L28 91H22V151H28L34 137" />
          <path className="desenho-peca" d="M206 105L212 91H218V151H212L206 137" />
          <path className="desenho-peca" d="M104 40L90 34V28H150V34L136 40" />
          {/* Sentido do fluxo: entra por um lado e deriva para cima. */}
          <path className="desenho-azul" d="M46 121H84M78 115l6 6-6 6M120 94V58M114 64l6-6 6 6M156 121H194M188 115l6 6-6 6" />
        </>
      )}

      {id === 'reducao' && (
        <>
          <path className="desenho-centro" d="M10 85H230" />
          <path className="desenho-peca" d="M40 59H96L144 71H196M40 111H96L144 99H196" />
          <path className="desenho-peca" d="M40 59L34 45H28V125H34L40 111" />
          <path className="desenho-peca" d="M196 71L202 59H208V111H202L196 99" />
          <path className="desenho-fino" d="M96 59V111M144 71V99" />
          <g className="desenho-cota">
            <path d="M68 63V107M62 63H74M62 107H74M170 75V95M164 75H176M164 95H176" />
          </g>
          <text className="desenho-legenda desenho-legenda--azul" x="76" y="40">
            D
          </text>
          <text className="desenho-legenda desenho-legenda--azul" x="164" y="58">
            d
          </text>
        </>
      )}

      {id === 'espigao' && (
        <>
          <path className="desenho-centro" d="M14 85H228" />
          <path className="desenho-peca" d="M48 71H100V66L120 74V66L140 74V66L160 74V66L180 74V66L200 74H206V96H200L180 104V96L160 104V96L140 104V96L120 104V96L100 104V99H48" />
          <path className="desenho-peca" d="M48 71L40 57H34V113H40L48 99" />
          {/* Mangueira entrando pela ponta. */}
          <path className="desenho-azul" d="M152 60H228M152 110H228M152 60V110" />
        </>
      )}

      {id === 'niple' && (
        <>
          <path className="desenho-centro" d="M14 85H228" />
          <path className="desenho-peca" d="M56 69H104V64H198L204 70V100L198 106H104V101H56" />
          <path className="desenho-peca" d="M56 69L48 55H42V115H48L56 101" />
          <path className="desenho-fino" d="M104 64V106" />
          {/* Filetes da rosca. */}
          <path
            className="desenho-azul"
            d="M120 64L114 106M132 64L126 106M144 64L138 106M156 64L150 106M168 64L162 106M180 64L174 106M192 64L186 106"
          />
        </>
      )}

      {id === 'uniao' && (
        <>
          <path className="desenho-centro" d="M10 85H230" />
          <path className="desenho-peca" d="M22 72H92M22 98H92M92 61V109M92 61H112M92 109H112" />
          <path className="desenho-peca" d="M112 57L118 51H164L170 57V113L164 119H118L112 113Z" />
          <path className="desenho-peca" d="M170 72H218M170 98H218" />
          <path className="desenho-fino" d="M128 51V119M141 51V119M154 51V119" />
          <path className="desenho-azul" d="M98 61L95 109M104 61L101 109M110 61L107 109" />
        </>
      )}

      {id === 'abracadeira' && (
        <>
          <path className="desenho-centro" d="M108 18V152M38 85H204" />
          <path className="desenho-peca" d="M157 67A52 52 0 1 0 157 103" />
          <path className="desenho-peca" d="M146 71A40 40 0 1 0 146 99" />
          <path className="desenho-peca" d="M157 67H192V79H146V71M157 103H192V91H146V99" />
          {/* Dobradiça à esquerda, parafuso e borboleta à direita. */}
          <circle className="desenho-fino" cx="62" cy="85" r="5" />
          <path className="desenho-fino" d="M180 56V118" />
          <path className="desenho-peca" d="M171 56H189M180 56L166 40L172 56M180 56L194 40L188 56" />
          <circle className="desenho-azul" cx="108" cy="85" r="27" />
        </>
      )}

      {id === 'sob-desenho' && (
        <>
          <path className="desenho-centro" d="M14 95H226" />
          <path className="desenho-peca" d="M30 72H86V56H150V42H206V148H150V134H86V118H30Z" />
          <path className="desenho-fino" d="M86 56V134M150 42V148" />
          <g className="desenho-cota">
            <path d="M30 22H206M30 15V29M206 15V29" />
          </g>
          <text className="desenho-legenda desenho-legenda--azul" x="118" y="14" textAnchor="middle">
            na sua medida
          </text>
        </>
      )}
    </svg>
  )
}

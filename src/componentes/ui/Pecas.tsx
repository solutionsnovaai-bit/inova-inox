import { useId, useRef, type CSSProperties, type MouseEvent, type PointerEvent, type ReactNode } from 'react'
import { motion, useSpring } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { molas, usePonteiroFino } from '../../lib/movimento'
import { logo } from '../../lib/midia'
import { Link } from '../../loja/rotas'

/** Faísca de solda: estrela de oito raios (o "brilho" da casa). */
export function Faisca({ className = 'faisca', style }: { className?: string; style?: CSSProperties }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M12 0L13.3 8.7 20.5 3.5 15.3 10.7 24 12 15.3 13.3 20.5 20.5 13.3 15.3 12 24 10.7 15.3 3.5 20.5 8.7 13.3 0 12 8.7 10.7 3.5 3.5 10.7 8.7Z" />
  </svg>
}

/** Logotipo da Inova (sem a linha "Usinagem · Polimento · Solda"). */
export function Marca({ className = '' }: { className?: string }) {
  return <img className={`marca ${className}`} src={logo.marca} alt="Inova Inox" width={537} height={258} decoding="async" draggable={false} />
}

/** Ímã: o elemento é puxado levemente na direção do mouse. */
export function Magnetico({ children, forca = 0.3, className }: { children: ReactNode; forca?: number; className?: string }) {
  const fino = usePonteiroFino()
  const ref = useRef<HTMLDivElement>(null)
  const x = useSpring(0, molas.ima)
  const y = useSpring(0, molas.ima)
  const mover = (e: PointerEvent<HTMLDivElement>) => {
    if (!fino || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * forca)
    y.set((e.clientY - (r.top + r.height / 2)) * forca)
  }
  return <motion.div ref={ref} className={className} style={{ x, y, display: 'inline-flex' }}
    onPointerMove={mover} onPointerLeave={() => { x.set(0); y.set(0) }}>{children}</motion.div>
}

type BotaoProps = {
  href?: string
  children: ReactNode
  variante?: '' | 'azul' | 'claro' | 'contorno' | 'zap'
  icone?: ReactNode
  onClick?: (e: MouseEvent<HTMLElement>) => void
  className?: string
  rotulo?: string
  tipo?: 'button' | 'submit'
  desativado?: boolean
}

/** Botão chanfrado: o preenchimento sobe no hover e o ícone gira. Link interno, externo ou botão. */
export function Botao({ href, children, variante = '', icone, onClick, className = '', rotulo, tipo = 'button', desativado }: BotaoProps) {
  const classe = `botao ${variante} ${className}`
  const miolo = <>
    <span className="botao-texto">{children}</span>
    <span className="botao-icone" aria-hidden="true">{icone ?? <ArrowUpRight />}</span>
  </>
  const el = !href
    ? <button type={tipo} className={classe} onClick={onClick} aria-label={rotulo} disabled={desativado}>{miolo}</button>
    : href.startsWith('/')
      ? <Link href={href} className={classe} onClick={onClick} aria-label={rotulo}>{miolo}</Link>
      : <a href={href} className={classe} onClick={onClick} aria-label={rotulo} target="_blank" rel="noopener noreferrer">{miolo}</a>
  return <Magnetico forca={0.16}>{el}</Magnetico>
}

/** Selo redondo com texto girando em volta. */
export function Selo({ texto, className = '', children }: { texto: string; className?: string; children?: ReactNode }) {
  const id = `selo${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return <div className={`selo ${className}`} aria-hidden="true">
    <svg viewBox="0 0 200 200" className="selo-anel anima">
      <defs><path id={id} d="M100 100m-78 0a78 78 0 1 1 156 0a78 78 0 1 1-156 0" /></defs>
      <text><textPath href={`#${id}`} startOffset="0" textLength="486" lengthAdjust="spacing">{texto}</textPath></text>
    </svg>
    <div className="selo-miolo">{children ?? <Faisca />}</div>
  </div>
}

/** Reflexo de aço escovado: grava a posição do mouse em --bx/--by. */
export function reflexo(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--bx', `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`)
  el.style.setProperty('--by', `${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`)
}

/** Cartão que inclina para o mouse, com reflexo. */
export function inclinar(e: PointerEvent<HTMLElement>, forca = 1) {
  if (e.pointerType !== 'mouse') return
  const el = e.currentTarget, r = el.getBoundingClientRect()
  const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height
  el.style.setProperty('--rx', `${((0.5 - py) * 8 * forca).toFixed(2)}deg`)
  el.style.setProperty('--ry', `${((px - 0.5) * 10 * forca).toFixed(2)}deg`)
  el.style.setProperty('--bx', `${(px * 100).toFixed(1)}%`)
  el.style.setProperty('--by', `${(py * 100).toFixed(1)}%`)
}
export const soltar = (e: PointerEvent<HTMLElement>) => {
  e.currentTarget.style.setProperty('--rx', '0deg')
  e.currentTarget.style.setProperty('--ry', '0deg')
}

const sorteio = (semente: number) => (i: number) => { const a = Math.sin(i * 12.9898 + semente * 78.233) * 43758.5453; return a - Math.floor(a) }

/* Borda de líquido escorrendo: gotas penduradas com a cor do bloco (currentColor). */
const GW = 1440, GH = 150
const cacheGotas = new Map<number, string>()
function gerarGotas(semente: number) {
  const rnd = sorteio(semente)
  let d = `M0 -2H${GW}V16H0Z`
  let x = 18, i = 1
  while (x < GW - 10) {
    const w = 14 + rnd(i) * 26
    const len = 24 + Math.pow(rnd(i + 7), 1.6) * (GH - 40)
    const r = w * 0.46, cx = x + w
    d += `M${(cx - w).toFixed(1)} 15C${(cx - w * 0.5).toFixed(1)} 15 ${(cx - r).toFixed(1)} ${(len * 0.35 + 15).toFixed(1)} ${(cx - r).toFixed(1)} ${(len - r + 15).toFixed(1)}A${r.toFixed(1)} ${r.toFixed(1)} 0 0 0 ${(cx + r).toFixed(1)} ${(len - r + 15).toFixed(1)}C${(cx + r).toFixed(1)} ${(len * 0.35 + 15).toFixed(1)} ${(cx + w * 0.5).toFixed(1)} 15 ${(cx + w).toFixed(1)} 15Z`
    x += w * 2 + 10 + rnd(i + 3) * 70
    i++
  }
  return d
}
export function Gotas({ className = '', semente = 1 }: { className?: string; semente?: number }) {
  if (!cacheGotas.has(semente)) cacheGotas.set(semente, gerarGotas(semente))
  return <svg className={`gotas ${className}`} viewBox={`0 0 ${GW} ${GH}`} preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">
    <path d={cacheGotas.get(semente)} fill="currentColor" />
  </svg>
}

/* Borda de chapa cortada a plasma: serrilhado fino e irregular, com a linha do corte em brasa. */
const CW = 1440, CH = 40
const cacheCorte = new Map<number, { chapa: string; linha: string }>()
function gerarCorte(semente: number) {
  const rnd = sorteio(semente)
  const pontos: [number, number][] = []
  let x = 0, i = 0
  while (x <= CW) {
    pontos.push([x, 10 + rnd(i) * 9 + (rnd(i + 50) > 0.93 ? rnd(i + 9) * 14 : 0)])
    x += 6 + rnd(i + 31) * 22
    i++
  }
  pontos.push([CW, 12])
  const linha = pontos.map(([px, py], k) => `${k ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join('')
  return { chapa: `M0 -2H${CW}V${pontos[pontos.length - 1][1]}${pontos.slice().reverse().map(([px, py]) => `L${px.toFixed(1)} ${py.toFixed(1)}`).join('')}Z`, linha }
}
export function Corte({ className = '', semente = 1 }: { className?: string; semente?: number }) {
  if (!cacheCorte.has(semente)) cacheCorte.set(semente, gerarCorte(semente))
  const c = cacheCorte.get(semente)!
  return <svg className={`corte ${className}`} viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <path d={c.chapa} fill="currentColor" />
    <path d={c.linha} className="corte-brasa" fill="none" vectorEffect="non-scaling-stroke" />
  </svg>
}

/** Ícones de marca: Simple Icons (CC0). */
export function BrandIcon({ className = '' }: { className?: string }) {
  return <svg className={`brand-icon ${className}`} viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
}

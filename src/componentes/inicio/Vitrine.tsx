import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react'
import { motion, useAnimationFrame, useMotionValue, useSpring } from 'motion/react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEstoque } from '../../loja/estoque'
import { linkLoja } from '../../loja/rotas'
import type { Produto } from '../../loja/tipos'
import { useCenaAtiva, useMovimento } from '../../lib/movimento'
import { Revelar, Titulo } from '../ui/Revelar'
import { Botao } from '../ui/Pecas'
import { CartaoProduto } from '../ui/Peca'

type Props = { produtos?: Produto[]; selo?: string; titulo?: string[]; destaque?: string; texto?: string; id?: string; escuro?: boolean }

/** Carrossel infinito de peças: corre sozinho, para no mouse, arrasta com inércia. */
export function Vitrine({ produtos, selo = 'Mais pedidas', titulo = ['Direto'], destaque = 'da bancada.', texto, id = 'vitrine', escuro = true }: Props) {
  const { reduzido } = useMovimento()
  const estoque = useEstoque()
  const lista = (produtos ?? estoque.produtos.filter((p) => p.destaque)).slice(0, 14)
  const area = useRef<HTMLElement>(null)
  const ativa = useCenaAtiva(area, 0.1)
  const grupo = useRef<HTMLDivElement>(null)
  const largura = useRef(0)
  const arrasto = useRef<{ id: number; x0: number; pos: number; t: number; moveu: number; v: number } | null>(null)
  const inercia = useRef(0)
  const arrastou = useRef(false)
  const [pausa, setPausa] = useState(false)
  const x = useMotionValue(0)
  const inclina = useSpring(0, { stiffness: 200, damping: 30 })
  const poucos = lista.length < 4

  const normal = (v: number) => (largura.current ? -largura.current + (((v % largura.current) + largura.current) % largura.current) : 0)

  useEffect(() => {
    if (!grupo.current) return
    const medir = () => { largura.current = grupo.current?.getBoundingClientRect().width ?? 0; x.set(-largura.current) }
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(grupo.current)
    return () => ro.disconnect()
  }, [x, reduzido, lista.length])

  useAnimationFrame((_, delta) => {
    if (reduzido || poucos || !ativa || arrasto.current) return
    const dt = Math.min(delta, 40) / 1000
    if (Math.abs(inercia.current) > 4) {
      x.set(normal(x.get() + inercia.current * dt))
      inercia.current *= Math.pow(0.05, dt)
      inclina.set(Math.max(-6, Math.min(6, inercia.current / 180)))
    } else {
      inercia.current = 0
      inclina.set(0)
      if (!pausa) x.set(normal(x.get() - 30 * dt))
    }
  })

  const inicio = (e: PointerEvent<HTMLDivElement>) => {
    if (reduzido || poucos || e.button !== 0) return
    arrasto.current = { id: e.pointerId, x0: e.clientX, pos: x.get(), t: performance.now(), moveu: 0, v: 0 }
  }
  const mover = (e: PointerEvent<HTMLDivElement>) => {
    const a = arrasto.current
    if (!a || a.id !== e.pointerId) return
    const dx = e.clientX - a.x0
    if (Math.abs(dx) > 6 && !e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.setPointerCapture(e.pointerId)
    const agora = performance.now(), anterior = x.get()
    x.set(normal(a.pos + dx))
    a.v = a.v * 0.6 + ((x.get() - anterior) / Math.max(agora - a.t, 1)) * 1000 * 0.4
    a.t = agora
    a.moveu = Math.max(a.moveu, Math.abs(dx))
    inclina.set(Math.max(-6, Math.min(6, a.v / 180)))
  }
  const fim = () => {
    const a = arrasto.current
    if (!a) return
    inercia.current = Math.abs(a.v) > 200 ? a.v : 0
    window.setTimeout(() => { arrasto.current = null }, 0)
    if (a.moveu > 6) { arrastou.current = true; window.setTimeout(() => { arrastou.current = false }, 80) }
  }
  const passo = (sentido: number) => {
    const card = grupo.current?.querySelector('.vitrine-item')?.getBoundingClientRect().width ?? 300
    if (reduzido || poucos) area.current?.querySelector('.vitrine-janela')?.scrollBy({ left: sentido * (card + 20), behavior: 'auto' })
    else inercia.current = -sentido * (card + 20) * 3.1
  }
  const teclado = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); passo(e.key === 'ArrowRight' ? 1 : -1) }
  }
  const segurarClique = (e: MouseEvent) => { if (arrastou.current) { e.preventDefault(); e.stopPropagation() } }

  if (!lista.length) return null
  const parada = reduzido || poucos
  return <section id={id} className={`secao vitrine ${escuro ? 'escuro' : ''}`} aria-labelledby={`${id}-titulo`} ref={area}>
    <div className="conteiner secao-cabeca">
      <div>
        <Revelar><p className="selo-texto">{selo}</p></Revelar>
        <Titulo id={`${id}-titulo`} linhas={titulo} destaque={destaque} />
      </div>
      <div className="vitrine-lado">
        {texto && <Revelar delay={0.1}><p className="lead">{texto}</p></Revelar>}
        <div className="setas">
          <button type="button" onClick={() => passo(-1)} aria-label="Peças anteriores"><ArrowLeft aria-hidden="true" /></button>
          <button type="button" onClick={() => passo(1)} aria-label="Próximas peças"><ArrowRight aria-hidden="true" /></button>
        </div>
      </div>
    </div>
    <div className={`vitrine-janela ${parada ? 'is-parada' : ''}`} role="region" aria-label={selo} tabIndex={0}
      onKeyDown={teclado} onPointerDown={inicio} onPointerMove={mover} onPointerUp={fim} onPointerCancel={fim} onLostPointerCapture={fim}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setPausa(true) }} onPointerLeave={() => setPausa(false)}
      onClickCapture={segurarClique} data-cursor={parada ? undefined : 'arraste'}>
      <motion.div className="vitrine-trilho" style={parada ? undefined : { x, skewX: inclina }}>
        {Array.from({ length: parada ? 1 : 3 }, (_, g) => <div className="vitrine-grupo" ref={g === 0 ? grupo : undefined} key={g} aria-hidden={g > 0 || undefined}
          inert={g > 0 ? true : undefined}>
          {lista.map((p, i) => <div key={p.slug} className="vitrine-item" draggable={false}><CartaoProduto produto={p} indice={i} /></div>)}
        </div>)}
      </motion.div>
    </div>
    {!produtos && <div className="conteiner vitrine-mais"><Botao href={linkLoja()} variante={escuro ? 'claro' : ''}>Ver todas as {estoque.produtos.length} peças</Botao></div>}
  </section>
}

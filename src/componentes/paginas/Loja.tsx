import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { ArrowUpRight, Search, X } from 'lucide-react'
import { useEstoque } from '../../loja/estoque'
import { linkLoja, navegar } from '../../loja/rotas'
import { mensagens, waLink } from '../../loja/config'
import { menorPreco, normalizar, plural } from '../../loja/util'
import { ease } from '../../lib/movimento'
import { Revelar, Titulo } from '../ui/Revelar'
import { Botao, BrandIcon, Faisca } from '../ui/Pecas'
import { CartaoProduto } from '../ui/Peca'

type Ordem = 'catalogo' | 'az' | 'menor' | 'maior'
const LOTE = 24

/** Loja: linhas, grupos, busca e ordem. A linha e a busca ficam no endereço, para compartilhar. */
export default function Loja({ linha, busca }: { linha: string; busca: string }) {
  const { produtos, categorias, status } = useEstoque()
  const [texto, setTexto] = useState(busca)
  const [grupo, setGrupo] = useState('')
  const [ordem, setOrdem] = useState<Ordem>('catalogo')
  const [soPreco, setSoPreco] = useState(false)
  const [limite, setLimite] = useState(LOTE)
  const topoGrade = useRef<HTMLDivElement>(null)
  const categoria = categorias.find((c) => c.id === linha)

  useEffect(() => { setTexto(busca) }, [busca])
  useEffect(() => { setGrupo(''); setLimite(LOTE) }, [linha])
  useEffect(() => { setLimite(LOTE) }, [texto, grupo, ordem, soPreco])
  useEffect(() => { document.title = `${categoria ? categoria.nome : 'Loja'} | Inova Inox` }, [categoria])

  /* A busca vai para o endereço sem criar histórico a cada letra. */
  useEffect(() => {
    const t = window.setTimeout(() => { if (texto.trim() !== busca) navegar(linkLoja(linha, texto.trim()), { substituir: true }) }, 350)
    return () => window.clearTimeout(t)
  }, [texto, busca, linha])

  const daLinha = useMemo(() => (linha ? produtos.filter((p) => p.categoria === linha) : produtos), [produtos, linha])
  const grupos = useMemo(() => [...new Set(daLinha.map((p) => p.grupo))], [daLinha])
  const comPreco = produtos.some((p) => menorPreco(p) !== null)

  const lista = useMemo(() => {
    const termos = normalizar(texto).split(' ').filter(Boolean)
    const nomeCat = (id: string) => categorias.find((c) => c.id === id)?.nome ?? ''
    let l = daLinha.filter((p) => !grupo || p.grupo === grupo)
    if (termos.length) {
      l = l.filter((p) => {
        const alvo = normalizar([p.nome, p.grupo, nomeCat(p.categoria), p.texto, ...p.variantes.map((v) => v.medida), ...p.opcoes.flatMap((o) => o.valores)].join(' '))
        return termos.every((t) => alvo.includes(t))
      })
    }
    if (soPreco) l = l.filter((p) => menorPreco(p) !== null)
    const preco = (p: (typeof l)[number]) => menorPreco(p)
    if (ordem === 'az') l = [...l].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }))
    if (ordem === 'menor' || ordem === 'maior') {
      l = [...l].sort((a, b) => {
        const pa = preco(a), pb = preco(b)
        if (pa === null) return pb === null ? 0 : 1
        if (pb === null) return -1
        return ordem === 'menor' ? pa - pb : pb - pa
      })
    }
    return l
  }, [daLinha, grupo, texto, soPreco, ordem, categorias])

  const trocarLinha = (id: string) => navegar(linkLoja(id, texto.trim()), { substituir: true })

  return <>
    <section className="loja-topo escuro" aria-labelledby="loja-titulo">
      <div className="loja-topo-luz" aria-hidden="true" />
      <div className="conteiner">
        <div className="loja-cabeca">
          <div>
            <p className="selo-texto">Loja Inova Inox · {plural(produtos.length, 'peça', 'peças')}</p>
            <Titulo key={linha || 'tudo'} id="loja-titulo" as="h1" className="titulo loja-titulo" linhas={[categoria ? categoria.nome : 'Todas as']} destaque={categoria ? 'em inox.' : 'peças.'} play delay={0.05} />
          </div>
          <Revelar delay={0.1} className="loja-cabeca-lado">
            <p className="lead">{categoria?.texto ?? 'Escolha a linha, busque pelo nome ou pela medida e abra a peça para escolher medida, aço e padrão.'}</p>
            {status === 'carregando' && <p className="loja-status"><i /> Atualizando preços</p>}
            {status !== 'carregando' && !comPreco && <p className="loja-status is-consulta"><Faisca /> Preços sob consulta: monte a sacola e a Inova responde no WhatsApp.</p>}
          </Revelar>
        </div>

        <LayoutGroup id="linhas-loja">
          <div className="loja-abas" role="tablist" aria-label="Linhas">
            {[{ id: '', nome: 'Todas', total: produtos.length }, ...categorias].map((c) => <button key={c.id || 'todas'} type="button" role="tab"
              aria-selected={linha === c.id} className={linha === c.id ? 'is-ativo' : ''} onClick={() => trocarLinha(c.id)}>
              {linha === c.id && <motion.span layoutId="loja-aba" className="loja-aba-marcador" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
              <span className="loja-aba-rotulo">{c.nome}<small>{c.total}</small></span>
            </button>)}
          </div>
        </LayoutGroup>
      </div>
    </section>

    <section className="loja-corpo" aria-label="Peças">
      <div className="conteiner">
        <div className="loja-ferramentas">
          <label className="loja-busca">
            <Search aria-hidden="true" />
            <input type="search" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Buscar: curva 2&quot;, abraçadeira, RJT, 316..." aria-label="Buscar peça" />
            {texto && <button type="button" onClick={() => setTexto('')} aria-label="Limpar busca"><X /></button>}
          </label>
          <div className="loja-ordem">
            {comPreco && <label className="loja-so-preco"><input type="checkbox" checked={soPreco} onChange={(e) => setSoPreco(e.target.checked)} /><span className="interruptor" aria-hidden="true"><i /></span>Só com preço</label>}
            <label className="loja-select"><span>Ordem</span>
              <select value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)}>
                <option value="catalogo">Catálogo</option>
                <option value="az">Nome (A–Z)</option>
                {comPreco && <option value="menor">Menor preço</option>}
                {comPreco && <option value="maior">Maior preço</option>}
              </select>
            </label>
          </div>
        </div>

        {linha && grupos.length > 1 && <LayoutGroup id="grupos-loja">
          <div className="filtros loja-grupos" role="group" aria-label="Grupos">
            {['', ...grupos].map((g) => <button key={g || 'todos'} type="button" aria-pressed={grupo === g} className={grupo === g ? 'is-ativo' : ''} onClick={() => setGrupo(g)}>
              {grupo === g && <motion.span layoutId="grupo-marcador" className="filtro-marcador" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              <span className="filtro-rotulo">{g || 'Todos os grupos'}</span>
            </button>)}
          </div>
        </LayoutGroup>}

        <p className="loja-contagem" ref={topoGrade} aria-live="polite">{plural(lista.length, 'peça encontrada', 'peças encontradas')}</p>

        {lista.length === 0
          ? <div className="loja-vazia">
            <Faisca className="anima" />
            <p>Nenhuma peça com essa busca.</p>
            <span>Tente outro nome ou medida, ou mande a foto da peça que a Inova encontra.</span>
            <Botao href={waLink(mensagens.identificar)} variante="zap" icone={<BrandIcon />}>Mandar foto no WhatsApp</Botao>
          </div>
          : <motion.ul layout className="loja-grade">
            <AnimatePresence mode="popLayout" initial={false}>
              {lista.slice(0, limite).map((p, i) => <motion.li key={p.slug} layout initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.7, delay: Math.min(i % LOTE, 10) * 0.035, ease: ease.expo }}>
                <CartaoProduto produto={p} indice={i} />
              </motion.li>)}
            </AnimatePresence>
          </motion.ul>}

        {lista.length > limite && <div className="loja-mais">
          <button type="button" className="botao contorno" onClick={() => setLimite((l) => l + LOTE)}>
            <span className="botao-texto">Mostrar mais {Math.min(LOTE, lista.length - limite)} de {lista.length - limite}</span>
            <span className="botao-icone" aria-hidden="true"><ArrowUpRight style={{ rotate: '135deg' }} /></span>
          </button>
        </div>}

        <div className="loja-sob-desenho chanfro">
          <div>
            <p className="selo-texto">Fora da tabela?</p>
            <p className="loja-sob-desenho-titulo">A Inova fabrica <em>sob desenho ou amostra.</em></p>
          </div>
          <Botao href="/#orcamento" variante="azul">Pedir orçamento</Botao>
        </div>
      </div>
    </section>
  </>
}

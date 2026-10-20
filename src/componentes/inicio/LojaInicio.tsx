import { useState } from 'react'
import { LayoutGroup, motion } from 'motion/react'
import { ShoppingBag } from 'lucide-react'
import { useEstoque } from '../../loja/estoque'
import { useSacola } from '../../loja/sacola'
import { linkLoja, navegar } from '../../loja/rotas'
import type { Produto } from '../../loja/tipos'
import { ease } from '../../lib/movimento'
import { Botao } from '../ui/Pecas'
import { CartaoProduto } from '../ui/Peca'

const QTD = 16

/** Coloca a peça na sacola com a primeira medida, inox 304 e as primeiras opções. */
function BotaoAdicionar({ p }: { p: Produto }) {
  const { adicionar } = useSacola()
  const [ok, setOk] = useState(false)
  const add = () => {
    adicionar({
      slug: p.slug,
      medida: p.variantes[0]?.medida ?? '',
      aco: p.material ? '304' : null,
      opcoes: Object.fromEntries(p.opcoes.map((o) => [o.nome, o.valores[0]])),
      qtd: 1,
    })
    setOk(true)
    window.setTimeout(() => setOk(false), 1600)
  }
  return <button type="button" className={`loja-add ${ok ? 'is-ok' : ''}`} onClick={add}>
    <ShoppingBag aria-hidden="true" />{ok ? 'Na sacola' : 'Adicionar'}
  </button>
}

/** Loja logo depois do topo: abas por linha e a grade de peças com foto, preço e botão de adicionar. */
export function LojaInicio() {
  const { produtos, categorias } = useEstoque()
  const [linha, setLinha] = useState('')
  const destaques = produtos.filter((p) => p.destaque)
  const lista = (linha ? produtos.filter((p) => p.categoria === linha) : destaques.length ? destaques : produtos).slice(0, QTD)

  return <section id="loja" className="loja-inicio" aria-labelledby="loja-inicio-titulo">
    <div className="conteiner">
      <div className="loja-inicio-cabeca">
        <h2 id="loja-inicio-titulo">Loja <em>Inova Inox</em><small>{produtos.length} peças · inox 304 e 316</small></h2>
        <a className="link-seta" href={linkLoja(linha)} onClick={(e) => { e.preventDefault(); navegar(linkLoja(linha)) }}>Ver catálogo completo</a>
      </div>

      <LayoutGroup id="loja-inicio-abas">
        <div className="filtros loja-inicio-abas" role="group" aria-label="Linhas">
          {[{ id: '', nome: 'Mais pedidas' }, ...categorias].map((c) => <button key={c.id || 'top'} type="button" aria-pressed={linha === c.id}
            className={linha === c.id ? 'is-ativo' : ''} onClick={() => setLinha(c.id)}>
            {linha === c.id && <motion.span layoutId="loja-inicio-marcador" className="filtro-marcador" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
            <span className="filtro-rotulo">{c.nome}</span>
          </button>)}
        </div>
      </LayoutGroup>

      <ul className="loja-grade">
        {lista.map((p, i) => <motion.li key={`${linha}-${p.slug}`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: Math.min(i, 8) * 0.04, ease: ease.expo }}>
          <CartaoProduto produto={p} indice={i} />
          <BotaoAdicionar p={p} />
        </motion.li>)}
      </ul>

      <div className="loja-mais"><Botao href={linkLoja(linha)} variante="azul">Ver todas as peças{linha ? ' da linha' : ''}</Botao></div>
    </div>
  </section>
}

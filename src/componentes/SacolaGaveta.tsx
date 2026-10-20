import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, ChevronDown, Minus, Plus, Trash2, X } from 'lucide-react'
import { waLink } from '../loja/config'
import { useEstoque } from '../loja/estoque'
import { Link, linkLoja, linkProduto } from '../loja/rotas'
import { descricaoItem, linhasDoPedido, mensagemPedido, resumoPedido, useSacola, type DadosPedido } from '../loja/sacola'
import { brl, plural } from '../loja/util'
import { ease, useTrava } from '../lib/movimento'
import { BrandIcon, Faisca } from './ui/Pecas'
import { ImagemPeca } from './ui/Peca'

const DADOS = 'inova-dados-pedido-v1'
const vazio: DadosPedido = { nome: '', empresa: '', cep: '', obs: '' }

function lerDados(): DadosPedido {
  try { return { ...vazio, ...JSON.parse(localStorage.getItem(DADOS) ?? '{}') } } catch { return vazio }
}

/** Sacola lateral: peças, quantidades, conta e o pedido montado para o WhatsApp. */
export function SacolaGaveta() {
  const { itens, aberta, fechar, alterar, remover, limpar } = useSacola()
  const { porSlug, status } = useEstoque()
  const [dados, setDados] = useState<DadosPedido>(lerDados)
  const [verDados, setVerDados] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const painel = useRef<HTMLDivElement>(null)
  useTrava(aberta)

  const linhas = useMemo(() => linhasDoPedido(itens, porSlug), [itens, porSlug])
  const r = resumoPedido(linhas)

  useEffect(() => {
    if (!aberta) { setEnviado(false); return }
    const anterior = document.activeElement as HTMLElement | null
    painel.current?.querySelector<HTMLElement>('.sacola-fechar')?.focus()
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar() }
    document.addEventListener('keydown', tecla)
    return () => { document.removeEventListener('keydown', tecla); anterior?.focus?.() }
  }, [aberta, fechar])

  useEffect(() => { try { localStorage.setItem(DADOS, JSON.stringify(dados)) } catch { /* sem armazenamento */ } }, [dados])

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    if (!linhas.some((l) => l.produto)) return
    window.open(waLink(mensagemPedido(linhas, dados)), '_blank', 'noopener')
    setEnviado(true)
  }
  const campo = (k: keyof DadosPedido) => ({ value: dados[k], onChange: (e: { target: { value: string } }) => setDados((d) => ({ ...d, [k]: e.target.value })) })

  return <AnimatePresence>
    {aberta && <motion.div key="sacola" className="sacola" role="dialog" aria-modal="true" aria-labelledby="sacola-titulo"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
      <button type="button" className="sacola-fundo" aria-label="Fechar a sacola" tabIndex={-1} onClick={fechar} />
      <motion.div ref={painel} className="sacola-painel" data-lenis-prevent
        initial={{ x: '104%' }} animate={{ x: '0%' }} exit={{ x: '104%' }} transition={{ duration: 0.7, ease: ease.expo }}>
        <header className="sacola-topo">
          <div>
            <p className="selo-texto">Pedido</p>
            <h2 id="sacola-titulo">Sua sacola <small>{plural(r.pecas, 'peça', 'peças')}</small></h2>
          </div>
          <button type="button" className="sacola-fechar" onClick={fechar} aria-label="Fechar"><X aria-hidden="true" /></button>
        </header>

        {itens.length === 0
          ? <div className="sacola-vazia">
            <Faisca className="sacola-vazia-faisca anima" />
            <p>A sacola está vazia.</p>
            <span>Escolha a peça, a medida e o aço na loja.</span>
            <Link href={linkLoja()} className="botao azul" onClick={fechar}><span className="botao-texto">Ver a loja</span><span className="botao-icone" aria-hidden="true"><ArrowUpRight /></span></Link>
          </div>
          : <>
            <ul className="sacola-lista">
              <AnimatePresence initial={false}>
                {linhas.map((l) => <motion.li key={l.item.chave} layout className={`sacola-item ${l.produto ? '' : 'is-fora'}`}
                  initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60, height: 0, paddingBlock: 0 }}
                  transition={{ duration: 0.5, ease: ease.expo }}>
                  <span className="sacola-item-img">{l.produto && <ImagemPeca produto={l.produto} />}</span>
                  <div className="sacola-item-info">
                    {l.produto
                      ? <Link href={linkProduto(l.produto.slug)} onClick={fechar} className="sacola-item-nome">{l.produto.nome}</Link>
                      : <span className="sacola-item-nome">Peça fora da loja</span>}
                    <small>{l.produto ? descricaoItem(l) : 'Essa peça saiu da loja. Remova para seguir.'}</small>
                    <div className="sacola-item-base">
                      <div className="qtd" role="group" aria-label="Quantidade">
                        <button type="button" onClick={() => alterar(l.item.chave, l.item.qtd - 1)} aria-label="Diminuir" disabled={l.item.qtd <= 1}><Minus /></button>
                        <input inputMode="numeric" aria-label="Quantidade" value={l.item.qtd}
                          onChange={(e) => alterar(l.item.chave, Number(e.target.value.replace(/\D/g, '')) || 1)} />
                        <button type="button" onClick={() => alterar(l.item.chave, l.item.qtd + 1)} aria-label="Aumentar"><Plus /></button>
                      </div>
                      <span className="sacola-item-preco">
                        {status === 'carregando' ? <i className="preco-carregando" /> : l.unitario !== null
                          ? <><small>{l.item.qtd} × {brl(l.unitario)}</small>{brl(l.unitario * l.item.qtd)}</>
                          : <em>Sob consulta</em>}
                      </span>
                    </div>
                  </div>
                  <button type="button" className="sacola-remover" onClick={() => remover(l.item.chave)} aria-label="Remover da sacola"><Trash2 /></button>
                </motion.li>)}
              </AnimatePresence>
            </ul>

            <form className="sacola-base" onSubmit={enviar}>
              <div className="sacola-conta">
                <div><span>Subtotal</span><strong>{r.subtotal > 0 ? brl(r.subtotal) : '—'}</strong></div>
                {r.sobConsulta > 0 && <p>+ {plural(r.sobConsulta, 'peça', 'peças')} sob consulta: a Inova manda o preço no WhatsApp.</p>}
                <p>Frete, estoque e forma de pagamento são confirmados no atendimento.</p>
              </div>

              <button type="button" className="sacola-dados-botao" aria-expanded={verDados} onClick={() => setVerDados((v) => !v)}>
                Seus dados para o pedido <small>opcional</small><ChevronDown aria-hidden="true" />
              </button>
              <AnimatePresence initial={false}>
                {verDados && <motion.div className="sacola-dados" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: ease.expo }}>
                  <div className="sacola-campos">
                    <label><span>Nome</span><input {...campo('nome')} autoComplete="name" maxLength={60} /></label>
                    <label><span>Empresa ou CNPJ</span><input {...campo('empresa')} autoComplete="organization" maxLength={80} /></label>
                    <label><span>CEP de entrega</span><input {...campo('cep')} autoComplete="postal-code" inputMode="numeric" maxLength={12} /></label>
                    <label className="sacola-campo-obs"><span>Observações</span><textarea {...campo('obs')} rows={2} maxLength={400} /></label>
                  </div>
                </motion.div>}
              </AnimatePresence>

              <AnimatePresence mode="wait" initial={false}>
                {enviado
                  ? <motion.div key="ok" className="sacola-enviado" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <p>O pedido abriu no WhatsApp. Já enviou a mensagem?</p>
                    <div>
                      <button type="button" className="botao azul" onClick={() => { limpar(); fechar() }}><span className="botao-texto">Sim, limpar a sacola</span><span className="botao-icone" aria-hidden="true"><Trash2 /></span></button>
                      <button type="submit" className="link-seta">Abrir de novo</button>
                    </div>
                  </motion.div>
                  : <motion.div key="enviar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <button type="submit" className="botao zap sacola-enviar" disabled={!linhas.some((l) => l.produto)}>
                      <span className="botao-texto">Enviar pedido pelo WhatsApp</span>
                      <span className="botao-icone" aria-hidden="true"><BrandIcon /></span>
                    </button>
                  </motion.div>}
              </AnimatePresence>
              <button type="button" className="sacola-limpar" onClick={limpar}>Esvaziar sacola</button>
            </form>
          </>}
      </motion.div>
    </motion.div>}
  </AnimatePresence>
}

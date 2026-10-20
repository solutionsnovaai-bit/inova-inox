import { useEffect, type FormEvent } from 'react'
import { Loader2, Lock, Minus, Plus, Truck, User, X } from 'lucide-react'
import { SITE } from '../loja/ajustes.js'
import { descricaoItem, useSacola } from '../loja/sacola'
import { brl } from '../loja/util'
import { IconeWhats, ImagemPeca } from './ui'
import { linkWhats } from './Topo'

/** Sacola lateral, no molde da loja de velas: itens, frete (Melhor Envio), dados de entrega e pagamento. */
export function SacolaGaveta() {
  const s = useSacola()
  const { aberta, fechar } = s

  useEffect(() => {
    if (!aberta) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar() }
    document.addEventListener('keydown', esc)
    document.body.classList.add('travado')
    return () => { document.removeEventListener('keydown', esc); document.body.classList.remove('travado') }
  }, [aberta, fechar])

  const calcular = (e: FormEvent) => { e.preventDefault(); s.calcularFrete() }
  const online = s.ligado.pagamento && s.sobConsulta === 0
  const podePagar = online && Boolean(s.frete) && s.enderecoCompleto && !s.pagando
  const pedirWhats = () => window.open(linkWhats(s.mensagemWhatsApp()), '_blank', 'noopener')

  return <>
    <button type="button" className={`gaveta-fundo ${aberta ? 'is-aberta' : ''}`} onClick={fechar} aria-label="Fechar sacola" tabIndex={aberta ? 0 : -1} aria-hidden={!aberta} />
    <aside className={`gaveta ${aberta ? 'is-aberta' : ''}`} aria-label="Sacola" aria-hidden={!aberta}>
      <div className="gaveta-topo">
        <h2>Sua sacola</h2>
        <button type="button" className="icone-redondo" onClick={fechar} aria-label="Fechar"><X /></button>
      </div>

      {s.linhas.length === 0
        ? <div className="gaveta-vazia">
          <p>Sua sacola está vazia.</p>
          <a href="#loja" className="botao botao-contorno" onClick={fechar}>Ver as peças</a>
        </div>
        : <>
          <div className="gaveta-corpo">
            <ul className="gaveta-itens">
              {s.linhas.map((l) => <li key={l.item.chave}>
                <span className="gaveta-img">{l.produto && <ImagemPeca produto={l.produto} foto={l.foto} />}</span>
                <div className="gaveta-item">
                  <div className="gaveta-item-topo">
                    <div>
                      <h3>{l.produto?.nome ?? 'Peça fora da loja'}</h3>
                      <small>{l.produto ? descricaoItem(l.item) : 'Remova para continuar.'}</small>
                    </div>
                    <button type="button" className="gaveta-remover" onClick={() => s.remover(l.item.chave)}>remover</button>
                  </div>
                  <div className="gaveta-item-base">
                    <div className="qtd qtd-p">
                      <button type="button" onClick={() => s.alterar(l.item.chave, l.item.qtd - 1)} aria-label="Menos um"><Minus /></button>
                      <span>{l.item.qtd}</span>
                      <button type="button" onClick={() => s.alterar(l.item.chave, l.item.qtd + 1)} aria-label="Mais um"><Plus /></button>
                    </div>
                    <b>{l.unitario !== null ? brl(l.unitario * l.item.qtd) : <em>sob consulta</em>}</b>
                  </div>
                </div>
              </li>)}
            </ul>

            <div className="gaveta-bloco">
              <span className="gaveta-rotulo"><Truck aria-hidden="true" />{s.ligado.frete ? 'Calcular frete' : 'Frete'}</span>
              {!s.ligado.frete && <p className="gaveta-nota is-sem-margem">Enviamos para todo o Brasil. O frete é calculado pelo CEP e confirmado no atendimento.</p>}
              {s.ligado.frete && <form onSubmit={calcular} className="gaveta-cep">
                <input type="text" inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" maxLength={9} value={s.cep} onChange={(e) => s.setCep(e.target.value)} aria-label="CEP de entrega" />
                <button type="submit" className="botao botao-escuro botao-p" disabled={s.calculando}>{s.calculando ? <Loader2 className="girando" /> : 'Calcular'}</button>
              </form>}
              {!s.ligado.frete && <input className="gaveta-cep-solto" type="text" inputMode="numeric" autoComplete="postal-code" placeholder="Seu CEP (00000-000)" maxLength={9} value={s.cep} onChange={(e) => s.setCep(e.target.value)} aria-label="CEP de entrega" />}
              {s.erroFrete && <p className="gaveta-erro">{s.erroFrete}</p>}
              {!!s.opcoesFrete?.length && <fieldset className="gaveta-fretes">
                <legend className="oculto">Escolha o frete</legend>
                {s.opcoesFrete.map((o) => <label key={o.id} className={s.frete?.id === o.id ? 'is-ativa' : ''}>
                  <input type="radio" name="frete" checked={s.frete?.id === o.id} onChange={() => s.setFrete(o)} />
                  <span><b>{o.company} {o.service}</b>{o.deliveryDays && <small>até {o.deliveryDays} {o.deliveryDays === 1 ? 'dia útil' : 'dias úteis'}</small>}</span>
                  <strong>{brl(o.price)}</strong>
                </label>)}
              </fieldset>}
            </div>

            <div className="gaveta-bloco">
              <span className="gaveta-rotulo"><User aria-hidden="true" />Dados de entrega</span>
              <div className="gaveta-campos">
                <input placeholder="Nome completo" autoComplete="name" value={s.nome} onChange={(e) => s.setNome(e.target.value)} aria-label="Nome completo" />
                <input type="tel" inputMode="numeric" placeholder="WhatsApp com DDD" autoComplete="tel" maxLength={16} value={s.telefone} onChange={(e) => s.setTelefone(e.target.value)} aria-label="WhatsApp com DDD" />
                <input placeholder="CPF ou CNPJ (para a nota)" value={s.documento} onChange={(e) => s.setDocumento(e.target.value)} aria-label="CPF ou CNPJ" />
                <div className="gaveta-linha">
                  <input placeholder="Rua" autoComplete="address-line1" value={s.rua} onChange={(e) => s.setRua(e.target.value)} aria-label="Rua" />
                  <input placeholder="Nº" inputMode="numeric" value={s.numero} onChange={(e) => s.setNumero(e.target.value)} aria-label="Número" />
                </div>
                <input placeholder="Complemento (opcional)" autoComplete="address-line2" value={s.complemento} onChange={(e) => s.setComplemento(e.target.value)} aria-label="Complemento" />
                <div className="gaveta-linha is-meio">
                  <input placeholder="Bairro" value={s.bairro} onChange={(e) => s.setBairro(e.target.value)} aria-label="Bairro" />
                  <input placeholder="Cidade" autoComplete="address-level2" value={s.cidade} onChange={(e) => s.setCidade(e.target.value)} aria-label="Cidade" />
                </div>
              </div>
            </div>
          </div>

          <div className="gaveta-base">
            <div className="gaveta-conta">
              <div><span>Subtotal</span><span>{brl(s.subtotal)}</span></div>
              {s.sobConsulta > 0 && <div><span>Sob consulta</span><span>{s.sobConsulta} {s.sobConsulta === 1 ? 'peça' : 'peças'}</span></div>}
              <div><span>Frete</span><span>{s.frete ? brl(s.valorFrete) : s.ligado.frete ? 'calcule o frete' : 'a combinar'}</span></div>
              <div className="gaveta-total"><span>Total</span><b>{brl(s.totalGeral)}</b></div>
            </div>

            {online
              ? <>
                <p className="gaveta-nota">Pagamento seguro pelo Mercado Pago, em Pix, cartão ou boleto.</p>
                {s.erroPagamento && <p className="gaveta-erro is-caixa">{s.erroPagamento}</p>}
                <button type="button" className="botao botao-azul botao-largo" onClick={s.finalizar} disabled={!podePagar}>
                  {s.pagando ? <><Loader2 className="girando" />Preparando pagamento…</> : <><Lock aria-hidden="true" />Finalizar compra</>}
                </button>
                {!podePagar && !s.pagando && <p className="gaveta-dica">{!s.frete ? 'Calcule e escolha o frete para continuar.' : 'Preencha os dados de entrega para continuar.'}</p>}
                <button type="button" className="gaveta-alt" onClick={pedirWhats}>Prefiro fechar pelo WhatsApp</button>
              </>
              : <>
                <p className="gaveta-nota">{s.sobConsulta > 0
                  ? 'Tem peça sob consulta na sacola: a Inova responde com o valor e o frete no WhatsApp.'
                  : 'O pedido vai pronto para o WhatsApp da Inova, que confirma estoque, frete e pagamento.'}</p>
                <button type="button" className="botao botao-whats botao-largo" onClick={pedirWhats}><IconeWhats />Enviar pedido pelo WhatsApp</button>
                <p className="gaveta-dica">{SITE.whatsappVisivel}</p>
              </>}
          </div>
        </>}
    </aside>
  </>
}

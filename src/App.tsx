import { useCallback, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { EstoqueProvider } from './loja/estoque'
import { SacolaProvider, useSacola } from './loja/sacola'
import type { Produto } from './loja/tipos'
import { Topo } from './componentes/Topo'
import { Faixa, Hero } from './componentes/Hero'
import { Loja } from './componentes/Loja'
import { ModalPeca } from './componentes/ModalPeca'
import { SacolaGaveta } from './componentes/SacolaGaveta'
import { Catalogo } from './componentes/Catalogo'
import { BalaoWhats, Duvidas, Rodape, Servicos } from './componentes/Secoes'
import { Abertura } from './componentes/Abertura'
import { useRevelar } from './componentes/ui'

const AVISOS: Record<string, { titulo: string; texto: string }> = {
  aprovado: { titulo: 'Pagamento aprovado!', texto: 'Recebemos seu pedido. A Inova vai falar com você no WhatsApp com o envio.' },
  pendente: { titulo: 'Pagamento em análise', texto: 'Assim que o Mercado Pago confirmar, a Inova separa o seu pedido.' },
  recusado: { titulo: 'Pagamento não concluído', texto: 'Nada foi cobrado. Tente de novo ou feche o pedido pelo WhatsApp.' },
}

/** Volta do Mercado Pago (?pedido=aprovado|pendente|recusado): avisa e, se aprovado, esvazia a sacola. */
function AvisoPedido() {
  const { limpar } = useSacola()
  const [tipo, setTipo] = useState<string | null>(() => new URLSearchParams(location.search).get('pedido'))
  useEffect(() => {
    if (!tipo) return
    if (tipo === 'aprovado') limpar()
    history.replaceState(null, '', location.pathname)
  }, [tipo, limpar])
  const a = tipo ? AVISOS[tipo] : null
  if (!a) return null
  return <div className={`aviso-pedido is-${tipo}`} role="status">
    <div><b>{a.titulo}</b><p>{a.texto}</p></div>
    <button type="button" className="icone-redondo" onClick={() => setTipo(null)} aria-label="Fechar"><X /></button>
  </div>
}

function Site() {
  const [peca, setPeca] = useState<Produto | null>(null)
  const [pedidoCatalogo, setPedidoCatalogo] = useState({ pagina: 0, vez: 0 })
  const fechar = useCallback(() => setPeca(null), [])
  const irCatalogo = useCallback((pagina: number) => setPedidoCatalogo((p) => ({ pagina, vez: p.vez + 1 })), [])
  useRevelar()

  return <>
    <Abertura />
    <Topo />
    <main>
      <Hero />
      <Faixa />
      <Loja abrir={setPeca} />
      <Servicos />
      <Duvidas />
      <Catalogo pedido={pedidoCatalogo} />
    </main>
    <Rodape />
    <BalaoWhats />
    <ModalPeca p={peca} fechar={fechar} irCatalogo={irCatalogo} />
    <SacolaGaveta />
    <AvisoPedido />
  </>
}

export default function App() {
  return <EstoqueProvider><SacolaProvider><Site /></SacolaProvider></EstoqueProvider>
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { SITE } from './ajustes.js'
import { useEstoque } from './estoque'
import type { Aco, Produto } from './tipos'
import { brl, formatarCep, formatarTelefone, precoDe } from './util'

/*
  Sacola, no molde da loja de velas: guarda só a escolha (peça, medida, aço, opções e quantidade)
  e calcula frete e pagamento pelas funções do servidor (pasta api).
  - /api/checkout (GET) diz se o pagamento e o frete já estão ligados.
  - /api/frete cota no Melhor Envio; /api/checkout (POST) cria o pagamento no Mercado Pago.
  Enquanto não estiverem ligados, a sacola fecha o pedido pelo WhatsApp com tudo preenchido.
*/

export type ItemSacola = { chave: string; slug: string; medida: string; aco: Aco | null; opcoes: Record<string, string>; qtd: number }
export type OpcaoFrete = { id: number | string; service: string; company: string; price: number; deliveryDays: number | null }
export type Linha = { item: ItemSacola; produto: Produto | undefined; unitario: number | null; unidade: string; foto?: string }

const CHAVE = 'inova-sacola-v2'
const chaveItem = (i: Omit<ItemSacola, 'chave' | 'qtd'>) =>
  [i.slug, i.medida, i.aco ?? '-', ...Object.entries(i.opcoes).sort().map(([k, v]) => `${k}=${v}`)].join('|')

export const descricaoItem = (i: Pick<ItemSacola, 'medida' | 'aco' | 'opcoes'>) =>
  [i.medida, i.aco ? `Inox ${i.aco}` : '', ...Object.entries(i.opcoes).map(([k, v]) => `${k} ${v}`)].filter(Boolean).join(' · ')

function lerSalva(): ItemSacola[] {
  try {
    const v = JSON.parse(localStorage.getItem(CHAVE) ?? '[]')
    return Array.isArray(v) ? v.filter((i) => i && typeof i.slug === 'string' && i.qtd > 0) : []
  } catch { return [] }
}

function useSacolaInterna() {
  const { porSlug } = useEstoque()
  const [itens, setItens] = useState<ItemSacola[]>(lerSalva)
  const [aberta, setAberta] = useState(false)
  const [ligado, setLigado] = useState({ pagamento: false, frete: false })

  const [cep, setCepCru] = useState('')
  const [opcoesFrete, setOpcoesFrete] = useState<OpcaoFrete[] | null>(null)
  const [frete, setFrete] = useState<OpcaoFrete | null>(null)
  const [calculando, setCalculando] = useState(false)
  const [erroFrete, setErroFrete] = useState<string | null>(null)

  const [nome, setNome] = useState('')
  const [telefone, setTelefoneCru] = useState('')
  const [documento, setDocumento] = useState('')
  const [rua, setRua] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')

  const [pagando, setPagando] = useState(false)
  const [erroPagamento, setErroPagamento] = useState<string | null>(null)

  useEffect(() => { try { localStorage.setItem(CHAVE, JSON.stringify(itens)) } catch { /* sem armazenamento */ } }, [itens])

  /* O que já está ligado no servidor (no dev local não há /api: tudo fica pelo WhatsApp). */
  useEffect(() => {
    fetch('/api/checkout', { cache: 'no-store' })
      .then((r) => (r.ok && (r.headers.get('content-type') ?? '').includes('json') ? r.json() : null))
      .then((d) => { if (d) setLigado({ pagamento: Boolean(d.pagamento), frete: Boolean(d.frete) }) })
      .catch(() => { /* sem servidor */ })
  }, [])

  const linhas = useMemo<Linha[]>(() => itens.map((item) => {
    const produto = porSlug(item.slug)
    const v = produto?.variantes.find((x) => x.medida === item.medida)
    return { item, produto, unitario: v ? precoDe(v, item.aco ?? '304') : null, unidade: v?.unidade || 'un', foto: v?.fotos[0] ?? produto?.fotosLoja[0] }
  }), [itens, porSlug])

  const validas = linhas.filter((l) => l.produto)
  const total = itens.reduce((s, i) => s + i.qtd, 0)
  const subtotal = validas.reduce((s, l) => s + (l.unitario ?? 0) * l.item.qtd, 0)
  const sobConsulta = validas.filter((l) => l.unitario === null).length
  const valorFrete = frete?.price ?? 0

  /* Mudou a sacola, a cotação anterior deixa de valer. */
  const assinatura = itens.map((i) => `${i.chave}:${i.qtd}`).join(',')
  useEffect(() => { setOpcoesFrete(null); setFrete(null); setErroFrete(null) }, [assinatura])

  const adicionar = useCallback((novo: Omit<ItemSacola, 'chave'>, abrir = true) => {
    const chave = chaveItem(novo)
    setItens((l) => {
      const ja = l.find((i) => i.chave === chave)
      return ja ? l.map((i) => (i.chave === chave ? { ...i, qtd: Math.min(500, i.qtd + novo.qtd) } : i)) : [...l, { ...novo, chave }]
    })
    if (abrir) setAberta(true)
  }, [])
  const alterar = useCallback((chave: string, qtd: number) => {
    setItens((l) => (qtd <= 0 ? l.filter((i) => i.chave !== chave) : l.map((i) => (i.chave === chave ? { ...i, qtd: Math.min(500, qtd) } : i))))
  }, [])
  const remover = useCallback((chave: string) => setItens((l) => l.filter((i) => i.chave !== chave)), [])
  const limpar = useCallback(() => setItens([]), [])

  const itensApi = () => validas.map((l) => ({ nome: l.produto!.nome, medida: l.item.medida, aco: l.item.aco, opcoes: l.item.opcoes, qtd: l.item.qtd }))

  const calcularFrete = useCallback(async () => {
    const d = cep.replace(/\D/g, '')
    if (d.length !== 8) { setErroFrete('Digite um CEP válido, com 8 números.'); return }
    if (!validas.length || calculando) return
    setCalculando(true); setErroFrete(null); setOpcoesFrete(null); setFrete(null)
    try {
      const r = await fetch('/api/frete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: d, items: itensApi() }) })
      const data = await r.json().catch(() => null)
      if (!r.ok) throw new Error(data?.error || 'Não foi possível calcular o frete.')
      const op: OpcaoFrete[] = Array.isArray(data?.options) ? data.options : []
      setOpcoesFrete(op)
      if (!op.length) setErroFrete('Nenhuma transportadora disponível para esse CEP agora.')
    } catch (e) {
      setErroFrete(e instanceof Error && e.message ? e.message : 'Não foi possível calcular o frete agora.')
    } finally { setCalculando(false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cep, validas, calculando])

  const enderecoCompleto = nome.trim().length >= 3 && telefone.replace(/\D/g, '').length >= 10 && rua.trim().length >= 2 && numero.trim().length >= 1 && bairro.trim().length >= 2

  const finalizar = useCallback(async () => {
    if (!validas.length || !frete || !enderecoCompleto || pagando) return
    setPagando(true); setErroPagamento(null)
    try {
      const r = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itensApi(), to: cep.replace(/\D/g, ''), shippingOptionId: frete.id,
          customerName: nome.trim(), customerPhone: telefone.replace(/\D/g, ''), document: documento.trim(),
          street: rua.trim(), streetNumber: numero.trim(), complement: complemento.trim(), neighborhood: bairro.trim(), city: cidade.trim(),
        }),
      })
      const data = await r.json().catch(() => null)
      if (!r.ok || !data?.init_point) throw new Error(data?.error || 'Não foi possível iniciar o pagamento.')
      window.location.href = data.init_point
    } catch (e) {
      setErroPagamento(e instanceof Error && e.message ? e.message : 'Não foi possível iniciar o pagamento.')
      setPagando(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validas, frete, enderecoCompleto, pagando, cep, nome, telefone, documento, rua, numero, complemento, bairro, cidade])

  /** Pedido completo em texto, para fechar pelo WhatsApp. */
  const mensagemWhatsApp = () => {
    const corpo = validas.map((l, i) => {
      const t = `${i + 1}) ${l.produto!.nome} · ${descricaoItem(l.item)}`
      return l.unitario !== null ? `${t}\n   ${l.item.qtd} ${l.unidade} × ${brl(l.unitario)} = ${brl(l.unitario * l.item.qtd)}` : `${t}\n   ${l.item.qtd} ${l.unidade} (sob consulta)`
    })
    const endereco = [rua.trim() && `${rua.trim()}, ${numero.trim()}`, complemento.trim(), bairro.trim(), cidade.trim(), cep && `CEP ${cep}`].filter(Boolean).join(' · ')
    return [
      `Olá! Quero fazer este pedido pelo site da ${SITE.nome}:`, '', ...corpo, '',
      subtotal > 0 ? `Subtotal das peças: ${brl(subtotal)}` : '',
      sobConsulta ? `Peças para cotar: ${sobConsulta}` : '',
      frete ? `Frete: ${frete.company} ${frete.service} · ${brl(frete.price)}` : 'Frete: a combinar',
      '',
      nome.trim() ? `Nome: ${nome.trim()}` : '',
      telefone ? `WhatsApp: ${telefone}` : '',
      documento.trim() ? `CPF/CNPJ: ${documento.trim()}` : '',
      endereco ? `Entrega: ${endereco}` : '',
      '', 'Fico no aguardo da confirmação de estoque, frete e pagamento.',
    ].join('\n').replace(/\n{3,}/g, '\n\n').trim()
  }

  return {
    itens, linhas, total, subtotal, sobConsulta, valorFrete, totalGeral: subtotal + valorFrete,
    aberta, abrir: () => setAberta(true), fechar: () => setAberta(false),
    adicionar, alterar, remover, limpar, ligado,
    cep, setCep: (v: string) => setCepCru(formatarCep(v)), opcoesFrete, frete, setFrete, calculando, erroFrete, calcularFrete,
    nome, setNome, telefone, setTelefone: (v: string) => setTelefoneCru(formatarTelefone(v)), documento, setDocumento,
    rua, setRua, numero, setNumero, complemento, setComplemento, bairro, setBairro, cidade, setCidade, enderecoCompleto,
    pagando, erroPagamento, finalizar, mensagemWhatsApp,
  }
}

type Sacola = ReturnType<typeof useSacolaInterna>
const Contexto = createContext<Sacola | null>(null)

export function SacolaProvider({ children }: { children: ReactNode }) {
  const valor = useSacolaInterna()
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useSacola() {
  const v = useContext(Contexto)
  if (!v) throw new Error('useSacola fora do SacolaProvider')
  return v
}

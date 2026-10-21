import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { Check, CloudOff, ExternalLink, ImagePlus, Images, Loader2, Search, Star, Tag, X } from 'lucide-react'
import { Desenho } from '../componentes/ui'
import { logo } from '../lib/midia'
import { ACRESCIMO_316_PADRAO, lerPreco, normalizar, preco316 } from '../loja/precos.js'
import { CACHE_PAINEL } from '../loja/cache'
import { CATEGORIAS, PRODUTOS_BASE } from '../loja/produtos'
import type { DadosPainel, ProdutoBase } from '../loja/tipos'

/*
  Painel da loja: o "controle remoto" do site.
  Aba Imagens: fotos de cada peça (a primeira é a principal no site).
  Aba Preços: preço de cada medida em inox 304 e 316 (vazio = sob consulta).
  Abre direto em /painel (não aparece em nenhum link do site nem no Google).
*/

type Aba = 'imagens' | 'precos'
type Fase = 'abrindo' | 'erro' | 'pronto'
type Aviso = { texto: string; tipo: 'ok' | 'erro' } | null

const vazio = (): DadosPainel => ({ atualizado: null, acrescimo316: ACRESCIMO_316_PADRAO, precos: {}, fotos: {} })

async function chamar<T>(acao: string, corpo?: unknown): Promise<{ status: number; dados: T }> {
  const r = await fetch(`/api/painel?acao=${acao}&t=${Date.now()}`, {
    method: corpo === undefined ? 'GET' : 'POST',
    headers: corpo === undefined ? {} : { 'Content-Type': 'application/json' },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  })
  const dados = await r.json().catch(() => ({})) as T & { erro?: string }
  if (!r.ok) throw Object.assign(new Error(dados?.erro || `Erro ${r.status}`), { status: r.status })
  return { status: r.status, dados }
}

/** Reduz a foto no próprio aparelho (lado maior 1600 px) antes de subir. */
async function prepararFoto(arquivo: File): Promise<{ tipo: string; base64: string }> {
  const bmp = await createImageBitmap(arquivo, { imageOrientation: 'from-image' })
  const escala = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
  const tela = document.createElement('canvas')
  tela.width = Math.round(bmp.width * escala)
  tela.height = Math.round(bmp.height * escala)
  const ctx = tela.getContext('2d')
  if (!ctx) throw new Error('sem canvas')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, tela.width, tela.height)
  ctx.drawImage(bmp, 0, 0, tela.width, tela.height)
  bmp.close?.()
  const gerar = (tipo: string, q: number) => new Promise<Blob | null>((ok) => tela.toBlob(ok, tipo, q))
  let blob = await gerar('image/webp', 0.86)
  if (!blob || blob.type !== 'image/webp') blob = await gerar('image/jpeg', 0.86)
  if (!blob) throw new Error('não deu para converter a foto')
  const url = await new Promise<string>((ok, falha) => {
    const leitor = new FileReader()
    leitor.onload = () => ok(String(leitor.result))
    leitor.onerror = () => falha(leitor.error)
    leitor.readAsDataURL(blob!)
  })
  return { tipo: blob.type, base64: url.slice(url.indexOf(',') + 1) }
}

const paraTexto = (n: number | null | undefined) => (n == null ? '' : n.toFixed(2).replace('.', ','))
const chaveCampo = (slug: string, medida: string) => `${slug}|${medida}`
const lerPct = (t: string) => { const n = Number(t.replace(',', '.').replace(/[^\d.]/g, '')); return t.trim() !== '' && Number.isFinite(n) && n <= 300 ? n : null }
const nomeLinha = (id: string) => CATEGORIAS.find((c) => c.id === id)?.nome ?? 'Outras peças'
const hora = (iso: string | null) => (iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '')

/* ---------- telas de entrada ---------- */

function Entrada({ fase, mensagem }: { fase: Fase; mensagem: string }) {
  return <main className="pn-entrada">
    <div className="pn-entrada-cartao">
      <img src={logo.completo} alt="Inova Inox" className="pn-entrada-logo" />
      {fase === 'abrindo'
        ? <><Loader2 className="girando pn-entrada-roda" aria-label="Carregando" /><h1>Abrindo o painel…</h1></>
        : <><span className="pn-entrada-icone"><CloudOff /></span><h1>Não conseguimos abrir o painel</h1><p>{mensagem || 'Confira a internet e tente de novo.'}</p>
          <button type="button" className="botao botao-claro" onClick={() => location.reload()}>Tentar de novo</button></>}
    </div>
  </main>
}

/* ---------- painel ---------- */

export function Painel() {
  const [fase, setFase] = useState<Fase>('abrindo')
  const [ligado, setLigado] = useState(true)
  const [mensagem, setMensagem] = useState('')
  const [dados, setDados] = useState<DadosPainel>(vazio)
  const [aba, setAba] = useState<Aba>('imagens')
  const [busca, setBusca] = useState('')
  const [linha, setLinha] = useState('todas')
  const [edicoes, setEdicoes] = useState<Record<string, string>>({})
  const [pctTexto, setPctTexto] = useState<string | null>(null)
  const [subindo, setSubindo] = useState<Record<string, number>>({})
  const [emAndamento, setEmAndamento] = useState(0)
  const salvando = emAndamento > 0
  const [aviso, setAviso] = useState<Aviso>(null)
  /** Último estado confirmado pelo servidor e mudanças ainda a caminho (já mostradas na tela). */
  const confirmado = useRef<DadosPainel>(vazio())
  const pendentes = useRef<((d: DadosPainel) => DadosPainel)[]>([])
  const fila = useRef<Promise<unknown>>(Promise.resolve())
  const relogio = useRef(0)

  const redesenhar = useCallback(() => setDados(pendentes.current.reduce((d, f) => f(d), confirmado.current)), [])
  /** Avisa a loja aberta neste aparelho (outra aba) para mostrar a versão nova na hora. */
  const avisarLoja = (d: DadosPainel) => { try { localStorage.setItem(CACHE_PAINEL, JSON.stringify(d)) } catch { /* sem armazenamento */ } }

  const avisar = useCallback((texto: string, tipo: 'ok' | 'erro' = 'ok') => {
    setAviso({ texto, tipo })
    window.clearTimeout(relogio.current)
    relogio.current = window.setTimeout(() => setAviso(null), tipo === 'erro' ? 6000 : 3200)
  }, [])

  useEffect(() => {
    chamar<{ armazenamento: boolean; dados: DadosPainel }>('abrir')
      .then(({ dados: r }) => {
        confirmado.current = r.dados ?? vazio()
        redesenhar()
        setLigado(r.armazenamento)
        setFase('pronto')
      })
      .catch((e: Error) => { setMensagem(e.message); setFase('erro') })
  }, [])

  /**
    Toda mudança aparece na tela na hora e vai para uma fila: uma gravação de cada vez,
    sempre aplicada sobre o último estado confirmado. Se falhar, a tela volta ao que está salvo.
  */
  const gravar = useCallback((mudar: (d: DadosPainel) => DadosPainel) => {
    pendentes.current.push(mudar)
    setEmAndamento((n) => n + 1)
    redesenhar()
    const tarefa = fila.current.then(async () => {
      try {
        const novo = mudar(confirmado.current)
        const { dados: r } = await chamar<{ dados: DadosPainel }>('salvar', { precos: novo.precos, fotos: novo.fotos, acrescimo316: novo.acrescimo316 })
        confirmado.current = r.dados
        avisarLoja(r.dados)
        return true
      } finally {
        pendentes.current = pendentes.current.filter((f) => f !== mudar)
        setEmAndamento((n) => n - 1)
        redesenhar()
      }
    })
    fila.current = tarefa.catch(() => undefined)
    return tarefa
  }, [redesenhar])

  /* ----- fotos ----- */

  const subirFotos = async (peca: ProdutoBase, arquivos: File[]) => {
    if (!arquivos.length) return
    setSubindo((s) => ({ ...s, [peca.slug]: (s[peca.slug] ?? 0) + arquivos.length }))
    let feitas = 0
    for (const arquivo of arquivos) {
      try {
        const foto = await prepararFoto(arquivo)
        const { dados: r } = await chamar<{ url: string }>('foto', { slug: peca.slug, ...foto })
        await gravar((d) => ({ ...d, fotos: { ...d.fotos, [peca.slug]: [...(d.fotos[peca.slug] ?? []), r.url] } }))
        feitas++
      } catch (e) {
        avisar(`Não deu para subir ${arquivo.name}: ${(e as Error).message || 'tente outra foto (JPG ou PNG)'}`, 'erro')
      } finally {
        setSubindo((s) => ({ ...s, [peca.slug]: Math.max(0, (s[peca.slug] ?? 1) - 1) }))
      }
    }
    if (feitas) avisar(feitas === 1 ? 'Foto publicada no site.' : `${feitas} fotos publicadas no site.`)
  }

  const mexerFotos = (slug: string, mudar: (lista: string[]) => string[], texto: string) => {
    gravar((d) => {
      const lista = mudar([...(d.fotos[slug] ?? [])])
      const fotos = { ...d.fotos }
      if (lista.length) fotos[slug] = lista
      else delete fotos[slug]
      return { ...d, fotos }
    }).then(() => avisar(texto)).catch((e: Error) => avisar(e.message, 'erro'))
  }

  /* ----- preços: um campo por medida (inox 304); o 316 sai do acréscimo em %; salva sozinho ----- */

  const salvos = useMemo(() => {
    const m: Record<string, string> = {}
    for (const [slug, peca] of Object.entries(dados.precos)) {
      for (const [medida, v] of Object.entries(peca.medidas)) m[chaveCampo(slug, medida)] = paraTexto(v.p304)
    }
    return m
  }, [dados.precos])
  const pctSalvo = dados.acrescimo316 ?? ACRESCIMO_316_PADRAO
  const pctAtual = pctTexto !== null && lerPct(pctTexto) !== null ? lerPct(pctTexto)! : pctSalvo

  const valor = (k: string) => edicoes[k] ?? salvos[k] ?? ''
  const mudou = (k: string) => k in edicoes && lerPreco(edicoes[k]) !== lerPreco(salvos[k] ?? '')
  const errado = (v: string) => v.trim() !== '' && lerPreco(v) === null
  const prontas = Object.keys(edicoes).filter((k) => mudou(k) && !errado(edicoes[k]))
  const pctMudou = pctTexto !== null && lerPct(pctTexto) !== null && lerPct(pctTexto) !== pctSalvo
  const aguardando = prontas.length > 0 || pctMudou

  useEffect(() => {
    if (!aguardando) return
    const sair = (e: BeforeUnloadEvent) => { e.preventDefault() }
    addEventListener('beforeunload', sair)
    return () => removeEventListener('beforeunload', sair)
  }, [aguardando])

  const salvarPrecos = () => {
    const congeladas = Object.fromEntries(prontas.map((k) => [k, edicoes[k]]))
    const pct = pctMudou ? lerPct(pctTexto!) : null
    const pctEnviado = pctTexto
    gravar((d) => {
      const precos: DadosPainel['precos'] = {}
      for (const peca of PRODUTOS_BASE) {
        const medidas: DadosPainel['precos'][string]['medidas'] = {}
        for (const medida of peca.medidas) {
          const k = chaveCampo(peca.slug, medida)
          const p304 = k in congeladas ? lerPreco(congeladas[k]) : d.precos[peca.slug]?.medidas[medida]?.p304 ?? null
          if (p304 !== null) medidas[medida] = { p304, p316: null }
        }
        if (Object.keys(medidas).length) precos[peca.slug] = { nome: peca.nome, medidas }
      }
      return { ...d, precos, acrescimo316: pct ?? d.acrescimo316 ?? ACRESCIMO_316_PADRAO }
    })
      .then(() => {
        setEdicoes((x) => {
          const resto = { ...x }
          for (const [k, v] of Object.entries(congeladas)) if (resto[k] === v) delete resto[k]
          return resto
        })
        setPctTexto((t) => (t === pctEnviado ? null : t))
      })
      .catch((e: Error) => avisar(e.message, 'erro'))
  }
  const salvarRef = useRef(salvarPrecos)
  salvarRef.current = salvarPrecos

  /* Salva sozinho menos de 1 s depois que a pessoa para de digitar. */
  useEffect(() => {
    if (!aguardando) return
    const t = window.setTimeout(() => salvarRef.current(), 900)
    return () => window.clearTimeout(t)
  }, [edicoes, pctTexto, aguardando])

  const proximoCampo = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const campos = [...document.querySelectorAll<HTMLInputElement>('.pn-preco input')]
    campos[campos.indexOf(e.currentTarget) + 1]?.focus()
  }

  /* ----- filtro ----- */

  const pecas = useMemo(() => {
    const q = normalizar(busca)
    return PRODUTOS_BASE.filter((p) => (linha === 'todas' || p.categoria === linha) && (!q || normalizar(`${p.nome} ${p.medidas.join(' ')}`).includes(q)))
  }, [busca, linha])

  const totalFotos = Object.values(dados.fotos).reduce((s, l) => s + l.length, 0)
  const totalPrecos = Object.values(dados.precos).reduce((s, p) => s + Object.keys(p.medidas).length, 0)
  const enviando = Object.values(subindo).some(Boolean)

  if (fase !== 'pronto') return <Entrada fase={fase} mensagem={mensagem} />

  return <div className="pn">
    <header className="pn-topo">
      <div className="pn-topo-linha">
        <img src={logo.marca} alt="Inova Inox" className="pn-logo" />
        <div className="pn-titulo">
          <b>Painel da loja</b>
          <small className={salvando || enviando || aguardando ? 'is-salvando' : ''}>
            {salvando || enviando || aguardando ? <><Loader2 className="girando" />Salvando…</> : <><Check />Tudo salvo{dados.atualizado ? ` · ${hora(dados.atualizado)}` : ''}</>}
          </small>
        </div>
        <a href="/" target="_blank" rel="noopener" className="botao botao-vidro botao-p pn-ver">Ver o site <ExternalLink /></a>
      </div>
      <nav className="pn-abas" aria-label="Seções do painel">
        <button type="button" aria-pressed={aba === 'imagens'} onClick={() => setAba('imagens')}><Images />Imagens<span>{totalFotos}</span></button>
        <button type="button" aria-pressed={aba === 'precos'} onClick={() => setAba('precos')}><Tag />Preços<span>{totalPrecos}</span></button>
      </nav>
    </header>

    <main className="pn-corpo">
      {!ligado && <div className="pn-alerta" role="alert">
        <CloudOff aria-hidden="true" />
        <div><b>Falta só ligar o armazenamento das fotos e preços.</b>
          <span>Na Vercel, no projeto inova-inox: <b>Storage</b> → <b>Create</b> → <b>Blob</b> → acesso <b>Public</b> → <b>Connect</b>. Depois, em Deployments, <b>Redeploy</b> no último deploy.</span></div>
      </div>}
      <p className="pn-dica">{aba === 'imagens'
        ? <>Toque em <b>Adicionar foto</b> em cada peça. A foto com a estrela é a <b>principal</b> no site. Assim que sobe, já aparece na loja.</>
        : <>Digite o preço de cada medida em <b>inox 304</b>. <b>Salva sozinho.</b> Deixe <b>vazio</b> para aparecer “sob consulta”.</>}</p>

      {aba === 'precos' && <div className="pn-ajuste">
        <div><b>Inox 316</b><span>Calculado sozinho: o preço do 304 mais esta porcentagem.</span></div>
        <label className={`pn-campo is-pct ${pctTexto !== null && lerPct(pctTexto) === null ? 'is-erro' : ''}`}>
          <input inputMode="decimal" value={pctTexto ?? String(pctSalvo).replace('.', ',')} aria-label="Acréscimo do inox 316 em porcentagem"
            onChange={(e) => setPctTexto(e.target.value)} />
          <span>% a mais</span>
        </label>
      </div>}

      <div className="pn-filtros">
        <label className="pn-busca">
          <Search aria-hidden="true" />
          <input type="search" placeholder="Buscar peça ou medida" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar peça" />
          {busca && <button type="button" onClick={() => setBusca('')} aria-label="Limpar busca"><X /></button>}
        </label>
        <div className="pn-linhas" role="group" aria-label="Linha">
          {[{ id: 'todas', nome: 'Todas' }, ...CATEGORIAS].map((c) => <button key={c.id} type="button" aria-pressed={linha === c.id} onClick={() => setLinha(c.id)}>{c.nome}</button>)}
        </div>
      </div>

      {!pecas.length && <p className="pn-nada">Nenhuma peça encontrada.</p>}

      {aba === 'imagens'
        ? <div className="pn-grade">
          {pecas.map((p) => {
            const fotos = dados.fotos[p.slug] ?? []
            const n = subindo[p.slug] ?? 0
            return <article key={p.slug} className="pn-card">
              <div className="pn-capa">
                {fotos[0] ? <img src={fotos[0]} alt={p.nome} loading="lazy" /> : <Desenho desenho={p.desenho} alt={`Desenho: ${p.nome}`} />}
                {!fotos[0] && <span className="pn-selo">sem foto</span>}
                {n > 0 && <span className="pn-carregando"><Loader2 className="girando" />Enviando…</span>}
              </div>
              <div className="pn-card-info">
                <h3>{p.nome}</h3>
                <p>{nomeLinha(p.categoria)} · {fotos.length ? `${fotos.length} ${fotos.length === 1 ? 'foto' : 'fotos'}` : 'sem fotos'}</p>
              </div>
              {fotos.length > 0 && <ul className="pn-minis">
                {fotos.map((u, i) => <li key={u} className={i === 0 ? 'is-principal' : ''}>
                  <img src={u} alt="" loading="lazy" />
                  <button type="button" className="pn-mini-estrela" disabled={i === 0} aria-label={i === 0 ? 'Foto principal' : 'Usar como principal'}
                    onClick={() => mexerFotos(p.slug, (l) => [l[i], ...l.filter((_, j) => j !== i)], 'Foto principal trocada.')}><Star /></button>
                  <button type="button" className="pn-mini-tirar" aria-label="Remover foto"
                    onClick={() => { if (confirm('Remover esta foto do site?')) mexerFotos(p.slug, (l) => l.filter((_, j) => j !== i), 'Foto removida.') }}><X /></button>
                </li>)}
              </ul>}
              <label className={`botao botao-p botao-largo ${fotos.length ? 'botao-contorno' : 'botao-azul'} pn-adicionar`}>
                <input type="file" accept="image/*" multiple className="oculto"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => { const l = [...(e.target.files ?? [])]; e.target.value = ''; subirFotos(p, l) }} />
                <ImagePlus aria-hidden="true" />{fotos.length ? 'Adicionar mais' : 'Adicionar foto'}
              </label>
            </article>
          })}
        </div>
        : <div className="pn-lista">
          {pecas.map((p) => {
            const capa = dados.fotos[p.slug]?.[0]
            return <section key={p.slug} className="pn-tabela">
              <header>
                <span className="pn-tabela-capa">{capa ? <img src={capa} alt="" loading="lazy" /> : <Desenho desenho={p.desenho} />}</span>
                <div><h3>{p.nome}</h3><p>{nomeLinha(p.categoria)} · {p.medidas.length} {p.medidas.length === 1 ? 'medida' : 'medidas'}</p></div>
              </header>
              <div className="pn-precos">
                {p.medidas.map((m) => {
                  const k = chaveCampo(p.slug, m)
                  const v = valor(k)
                  const n = lerPreco(v)
                  return <label key={m} className="pn-preco">
                    <span className="pn-medida">{m}</span>
                    <span className={`pn-campo ${mudou(k) ? 'is-alterado' : ''} ${errado(v) ? 'is-erro' : ''}`}>
                      <span>R$</span>
                      <input inputMode="decimal" enterKeyHint="next" placeholder="sob consulta" value={v} aria-label={`${p.nome} ${m}`}
                        onChange={(e) => setEdicoes((x) => ({ ...x, [k]: e.target.value }))}
                        onKeyDown={proximoCampo}
                        onBlur={() => { if (n !== null) setEdicoes((x) => (k in x ? { ...x, [k]: paraTexto(n) } : x)) }} />
                    </span>
                    {p.material && <small className="pn-316">{n !== null ? <>316: <b>{paraTexto(preco316(n, pctAtual))}</b></> : '—'}</small>}
                  </label>
                })}
              </div>
            </section>
          })}
        </div>}
    </main>

    {aviso && <div className={`pn-aviso is-${aviso.tipo}`} role="status">{aviso.tipo === 'ok' ? <Check /> : <X />}{aviso.texto}</div>}
  </div>
}

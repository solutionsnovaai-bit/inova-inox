import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Check, CloudOff, ExternalLink, ImagePlus, Images, Loader2, Search, Star, Tag, Undo2, X } from 'lucide-react'
import { Desenho } from '../componentes/ui'
import { logo } from '../lib/midia'
import { lerPreco, normalizar } from '../loja/precos.js'
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

const vazio = (): DadosPainel => ({ atualizado: null, precos: {}, fotos: {} })

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
const chaveCampo = (slug: string, medida: string, aco: '304' | '316') => `${slug}|${medida}|${aco}`
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
        const { dados: r } = await chamar<{ dados: DadosPainel }>('salvar', { precos: novo.precos, fotos: novo.fotos })
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

  /* ----- preços ----- */

  const salvos = useMemo(() => {
    const m: Record<string, string> = {}
    for (const [slug, peca] of Object.entries(dados.precos)) {
      for (const [medida, v] of Object.entries(peca.medidas)) {
        m[chaveCampo(slug, medida, '304')] = paraTexto(v.p304)
        m[chaveCampo(slug, medida, '316')] = paraTexto(v.p316)
      }
    }
    return m
  }, [dados.precos])

  const valor = (k: string) => edicoes[k] ?? salvos[k] ?? ''
  const alteradas = Object.keys(edicoes).filter((k) => lerPreco(edicoes[k]) !== lerPreco(salvos[k] ?? ''))
  const invalidas = Object.keys(edicoes).filter((k) => edicoes[k].trim() && lerPreco(edicoes[k]) === null)

  useEffect(() => {
    if (!alteradas.length) return
    const sair = (e: BeforeUnloadEvent) => { e.preventDefault() }
    addEventListener('beforeunload', sair)
    return () => removeEventListener('beforeunload', sair)
  }, [alteradas.length])

  const salvarPrecos = () => {
    if (invalidas.length) return avisar('Tem preço escrito errado (marcado em vermelho). Use só números, ex.: 38,50', 'erro')
    const congeladas = { ...edicoes }
    gravar((d) => {
      const precos: DadosPainel['precos'] = {}
      for (const peca of PRODUTOS_BASE) {
        const medidas: DadosPainel['precos'][string]['medidas'] = {}
        for (const medida of peca.medidas) {
          const ler = (aco: '304' | '316') => {
            const k = chaveCampo(peca.slug, medida, aco)
            return lerPreco(congeladas[k] ?? paraTexto(d.precos[peca.slug]?.medidas[medida]?.[aco === '304' ? 'p304' : 'p316']))
          }
          const p304 = ler('304')
          const p316 = peca.material ? ler('316') : null
          if (p304 !== null || p316 !== null) medidas[medida] = { p304, p316 }
        }
        if (Object.keys(medidas).length) precos[peca.slug] = { nome: peca.nome, medidas }
      }
      return { ...d, precos }
    })
      .then(() => {
        setEdicoes((x) => {
          const resto = { ...x }
          for (const [k, v] of Object.entries(congeladas)) if (resto[k] === v) delete resto[k]
          return resto
        })
        avisar('Preços publicados no site.')
      })
      .catch((e: Error) => avisar(e.message, 'erro'))
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
          <small className={salvando || enviando ? 'is-salvando' : ''}>
            {salvando || enviando ? <><Loader2 className="girando" />Salvando…</> : <><Check />Tudo salvo{dados.atualizado ? ` · ${hora(dados.atualizado)}` : ''}</>}
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
        : <>Digite o preço de cada medida e toque em <b>Salvar e publicar</b>. Deixe <b>vazio</b> para aparecer “sob consulta”.</>}</p>

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
              <div className={`pn-linhas-preco ${p.material ? '' : 'is-unico'}`}>
                <div className="pn-cabeca"><span>Medida</span>{p.material ? <><span>Inox 304</span><span>Inox 316</span></> : <span>Preço</span>}</div>
                {p.medidas.map((m) => <div key={m} className="pn-linha">
                  <span className="pn-medida">{m}</span>
                  {(p.material ? (['304', '316'] as const) : (['304'] as const)).map((aco) => {
                    const k = chaveCampo(p.slug, m, aco)
                    const v = valor(k)
                    const mudou = alteradas.includes(k)
                    const errado = v.trim() !== '' && lerPreco(v) === null
                    return <label key={aco} className={`pn-campo ${mudou ? 'is-alterado' : ''} ${errado ? 'is-erro' : ''}`}>
                      <span>R$</span>
                      <input inputMode="decimal" placeholder="sob consulta" value={v}
                        aria-label={`${p.nome} ${m} ${p.material ? `inox ${aco}` : ''}`}
                        onChange={(e) => setEdicoes((x) => ({ ...x, [k]: e.target.value }))}
                        onBlur={() => { const n = lerPreco(v); if (n !== null) setEdicoes((x) => (k in x ? { ...x, [k]: paraTexto(n) } : x)) }} />
                    </label>
                  })}
                </div>)}
              </div>
            </section>
          })}
        </div>}
    </main>

    {aba === 'precos' && alteradas.length > 0 && <div className="pn-barra" role="region" aria-label="Alterações de preço">
      <span><b>{alteradas.length}</b> {alteradas.length === 1 ? 'preço alterado' : 'preços alterados'}</span>
      <button type="button" className="botao botao-p botao-vidro" onClick={() => setEdicoes({})}><Undo2 />Desfazer</button>
      <button type="button" className="botao botao-p botao-azul" onClick={salvarPrecos}>
        {salvando ? <><Loader2 className="girando" />Publicando…</> : <><Check />Salvar e publicar</>}
      </button>
    </div>}

    {aviso && <div className={`pn-aviso is-${aviso.tipo}`} role="status">{aviso.tipo === 'ok' ? <Check /> : <X />}{aviso.texto}</div>}
  </div>
}

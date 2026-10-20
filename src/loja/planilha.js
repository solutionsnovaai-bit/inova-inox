/*
  Leitura da planilha do Google. Usado pelo site (preços e fotos) e pelo servidor
  (frete e pagamento conferem os preços direto na planilha, nunca no navegador).
*/

/** Minúsculas, sem acento, só letras e números separados por um espaço. */
export const normalizar = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/** "38", "38,5", "R$ 1.234,56" e "1234.56" viram número. Vazio ou texto vira null. */
export function lerPreco(valor) {
  let t = String(valor ?? '').trim().replace(/r\$|\s| /gi, '').replace(/[^\d.,]/g, '')
  if (!t) return null
  if (t.includes(',') && t.includes('.')) {
    t = t.lastIndexOf(',') > t.lastIndexOf('.') ? t.replace(/\./g, '').replace(',', '.') : t.replace(/,/g, '')
  } else if (t.includes(',')) {
    t = t.replace(',', '.')
  } else if (/^\d{1,3}(\.\d{3})+$/.test(t)) {
    t = t.replace(/\./g, '')
  }
  const n = Number(t)
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null
}

/** Uma célula pode ter um ou mais links de foto, separados por espaço, vírgula ou quebra de linha. */
export const linksDeFoto = (celula) => String(celula ?? '').split(/[\s,;]+/).filter((x) => /^https?:\/\//i.test(x))

export const nao = (s) => /^(nao|n|0|false|oculto|esconder)$/.test(normalizar(s))
export const sim = (s) => /^(sim|s|x|1|true)$/.test(normalizar(s))

/** Links de leitura em CSV a partir do link normal da planilha (aba Produtos, tabela a partir da linha 4). */
export function fontesPlanilha(link) {
  if (/output=csv|tqx=out:csv/.test(link)) return [link]
  const id = (/\/spreadsheets\/d\/([a-zA-Z0-9_-]{20,})/.exec(link) || [])[1]
  if (!id) return []
  const gid = (/[#&?]gid=(\d+)/.exec(link) || [])[1]
  const raiz = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&headers=1`
  const aba = `${raiz}&sheet=${encodeURIComponent('Produtos')}`
  return [`${aba}&range=A4:K5000`, aba, ...(gid ? [`${raiz}&gid=${gid}`] : []), raiz]
}

export function lerCsv(t) {
  const linhas = []
  let linha = []
  let campo = ''
  let aspas = false
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (aspas) {
      if (c === '"') {
        if (t[i + 1] === '"') { campo += '"'; i++ } else aspas = false
      } else campo += c
      continue
    }
    if (c === '"') aspas = true
    else if (c === ',') { linha.push(campo); campo = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++
      linha.push(campo); linhas.push(linha); linha = []; campo = ''
    } else campo += c
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha) }
  return linhas
}

/** Onde está cada coluna (pelo nome do cabeçalho). Sem a coluna Produto, devolve null. */
export function colunas(cabeca) {
  const h = cabeca.map(normalizar)
  const achar = (...testes) => h.findIndex((s) => testes.some((t) => t(s)))
  const c = {
    categoria: achar((s) => s.startsWith('categoria') || s.startsWith('linha')),
    produto: achar((s) => s.startsWith('produto') || s.startsWith('peca')),
    medida: achar((s) => s.startsWith('medida') || s.startsWith('bitola') || s.startsWith('diametro')),
    p304: achar((s) => s.includes('304') || s.includes('preco unico') || s === 'preco'),
    p316: achar((s) => s.includes('316')),
    unidade: achar((s) => s.startsWith('unidade')),
    peso: achar((s) => s.startsWith('peso')),
    mostrar: achar((s) => s.startsWith('mostrar') || s.startsWith('ativo') || s.startsWith('visivel')),
    destaque: achar((s) => s.startsWith('destaque')),
    foto: achar((s) => s.startsWith('foto') || s.startsWith('imagem')),
    descricao: achar((s) => s.startsWith('descri')),
  }
  return c.produto >= 0 ? c : null
}

/**
  Linhas da tabela já com as colunas achadas (o cabeçalho pode ter linhas de título acima).
  Devolve { c, linhas, pega } ou null se a aba não tiver a coluna Produto.
*/
/** @param {string} csv */
export function tabela(csv) {
  const todas = lerCsv(csv).filter((l) => l.some((x) => String(x).trim()))
  const ini = todas.slice(0, 8).findIndex((l) => colunas(l) !== null)
  if (ini < 0 || todas.length < ini + 2) return null
  const c = /** @type {NonNullable<ReturnType<typeof colunas>>} */ (colunas(todas[ini]))
  const pega = (l, i) => (i >= 0 ? String(l[i] ?? '').trim() : '')
  return { c, linhas: todas.slice(ini + 1).filter((l) => pega(l, c.produto)), pega }
}

/** Chave de uma medida de uma peça: "nome da peça|medida". */
export const chaveMedida = (nome, medida) => `${normalizar(nome)}|${String(medida ?? '').trim()}`

/** Preços, peso e visibilidade de cada medida, para o servidor conferir pedido e frete. */
export function tabelaDePrecos(csv) {
  const t = tabela(csv)
  if (!t) return null
  const { c, linhas, pega } = t
  const mapa = new Map()
  for (const l of linhas) {
    const nome = pega(l, c.produto)
    const medida = pega(l, c.medida)
    const peso = lerPreco(pega(l, c.peso))
    mapa.set(chaveMedida(nome, medida), {
      nome,
      medida,
      p304: lerPreco(pega(l, c.p304)),
      p316: lerPreco(pega(l, c.p316)),
      unidade: pega(l, c.unidade) || 'un',
      pesoG: peso,
      visivel: !nao(pega(l, c.mostrar)),
    })
  }
  return mapa
}

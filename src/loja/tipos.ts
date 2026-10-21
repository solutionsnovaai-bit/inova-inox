export type Categoria = { id: string; nome: string; texto: string }

export type Opcao = { nome: string; valores: string[] }

/** Peça como vem do catálogo técnico (src/loja/produtos.ts). */
export type ProdutoBase = {
  slug: string
  nome: string
  categoria: string
  grupo: string
  medidas: string[]
  opcoes: Opcao[]
  /** Falso nas peças sem escolha de aço (anéis de vedação). */
  material: boolean
  /** Página do catálogo técnico (0 = capa). */
  pagina: number
  /** Prancha, coluna e linha do desenho em src/assets/pecas. */
  desenho: [number, number, number]
  /** Fotos reais da oficina que mostram a peça (chaves de lib/midia.ts). */
  fotos: string[]
  texto: string
}

export type Variante = {
  medida: string
  preco304: number | null
  preco316: number | null
  unidade: string
  /** Fotos desta medida (links). */
  fotos: string[]
}

/** Peça como a loja mostra: base do catálogo + fotos e preços do painel. */
export type Produto = {
  slug: string
  nome: string
  categoria: string
  grupo: string
  opcoes: Opcao[]
  material: boolean
  pagina: number | null
  desenho: [number, number, number] | null
  fotos: string[]
  /** Fotos da peça vindas do painel (na ordem do painel). A primeira é a imagem principal. */
  fotosLoja: string[]
  texto: string
  variantes: Variante[]
  destaque: boolean
}

export type Aco = '304' | '316'

/** O que o painel da loja guarda (vem de /api/painel). */
export type DadosPainel = {
  atualizado: string | null
  /** Quanto o inox 316 custa a mais que o 304, em %. */
  acrescimo316?: number
  precos: Record<string, { nome: string; medidas: Record<string, { p304: number | null; p316: number | null }> }>
  fotos: Record<string, string[]>
}

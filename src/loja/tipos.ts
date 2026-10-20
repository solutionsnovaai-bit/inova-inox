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
  /** Fotos desta medida, vindas da planilha (links). */
  fotos: string[]
}

/** Peça como a loja mostra: base do catálogo + o que a planilha diz. */
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
  /** Fotos da peça vindas da planilha (links, na ordem da planilha). A primeira vira a imagem principal. */
  fotosLoja: string[]
  texto: string
  variantes: Variante[]
  destaque: boolean
}

export type Aco = '304' | '316'

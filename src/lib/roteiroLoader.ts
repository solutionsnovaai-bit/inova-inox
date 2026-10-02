/**
 * Roteiro da tela de carregamento. Tempos em segundos, posições em % da
 * prancha do logotipo. O canvas de solda e as peças do logo leem daqui,
 * então o ponto de luz e a peça que ele "solda" andam sempre juntos.
 */
export type Ponto = [x: number, y: number]

export type Passe = {
  id: 'arco-superior' | 'arco-inferior' | 'inova' | 'inox' | 'assinatura'
  inicio: number
  fim: number
  /** Posição do arco de solda no instante u (0 a 1) do passe. */
  ponto: (u: number) => Ponto
}

const reta = (de: Ponto, para: Ponto) => (u: number): Ponto => [
  de[0] + (para[0] - de[0]) * u,
  de[1] + (para[1] - de[1]) * u,
]

/** Curva de três pontos para acompanhar o desenho dos arcos. */
const curva = (a: Ponto, b: Ponto, c: Ponto) => (u: number): Ponto => {
  const v = 1 - u
  return [v * v * a[0] + 2 * v * u * b[0] + u * u * c[0], v * v * a[1] + 2 * v * u * b[1] + u * u * c[1]]
}

export const passes: Passe[] = [
  { id: 'arco-superior', inicio: 0.1, fim: 0.72, ponto: curva([25, 36], [52, -5], [80, 13]) },
  { id: 'arco-inferior', inicio: 0.26, fim: 0.78, ponto: curva([39, 54], [14, 84], [2, 58]) },
  { id: 'inova', inicio: 0.56, fim: 1.26, ponto: reta([5, 42], [99, 42]) },
  { id: 'inox', inicio: 1.2, fim: 1.72, ponto: reta([37, 75], [92, 75]) },
  { id: 'assinatura', inicio: 1.76, fim: 2.32, ponto: reta([0, 95.2], [100, 95.2]) },
]

export const passe = (id: Passe['id']) => passes.find((p) => p.id === id)!

/** Instante do impacto: o logo assenta, o anel de luz abre e as faíscas estouram. */
export const IMPACTO = 2.42
/** Fim da montagem, quando as chapas começam a abrir. */
export const FIM = 3
/** Duração da saída, em milissegundos. */
export const SAIDA_MS = 1250

/**
 * Na segunda visita da mesma sessão a montagem roda mais rápido:
 * quem já viu o espetáculo não precisa esperar por ele de novo.
 */
export function ritmoDaVisita() {
  try {
    return sessionStorage.getItem('loader-visto') === '1' ? 0.55 : 1
  } catch {
    return 1
  }
}

export function marcarLoaderVisto() {
  try {
    sessionStorage.setItem('loader-visto', '1')
  } catch {
    // Navegação privada pode bloquear o armazenamento: o loader só roda inteiro de novo.
  }
}

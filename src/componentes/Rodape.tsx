import { useRef, type MouseEvent } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowUp } from 'lucide-react'
import { mensagens, site, telLink, waLink } from '../loja/config'
import { useEstoque } from '../loja/estoque'
import { Link, linkCatalogo, linkLoja } from '../loja/rotas'
import { ease, rolarPara, useMovimento } from '../lib/movimento'
import { Titulo } from './ui/Revelar'
import { Botao, BrandIcon, Corte, Faisca, Marca } from './ui/Pecas'

/** Rodapé: convite final, linhas da loja, contatos, controle de animações e a assinatura gigante "INOX.". */
export function Rodape() {
  const { reduzido, alternar } = useMovimento()
  const { categorias } = useEstoque()
  const assinatura = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: assinatura, offset: ['start end', 'end end'] })
  const yAss = useTransform(scrollYProgress, [0, 1], ['40%', '0%'])
  const topo = (e: MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); rolarPara(0, reduzido) }

  return <footer className="rodape">
    <Corte className="rodape-corte" semente={9} />
    <div className="conteiner">
      <div className="rodape-convite">
        <Titulo linhas={['Peça fora', 'da tabela?']} destaque="A gente faz." className="titulo rodape-titulo" />
        <div className="rodape-acoes">
          <Botao href={waLink(mensagens.geral)} variante="azul" icone={<BrandIcon />}>WhatsApp {site.whatsappVisivel}</Botao>
          <Botao href={telLink} variante="contorno">Ligar {site.telefoneVisivel}</Botao>
        </div>
      </div>

      <div className="rodape-colunas">
        <div className="rodape-marca">
          <Marca />
          <p>{site.assinatura}. Linha sanitária e industrial em inox 304 e 316, peças sob desenho ou amostra.</p>
        </div>
        <nav aria-label="Linhas da loja">
          <p className="rodape-rotulo">Loja</p>
          <ul>
            <li><Link href={linkLoja()}>Todas as peças</Link></li>
            {categorias.map((c) => <li key={c.id}><Link href={linkLoja(c.id)}>{c.nome}</Link></li>)}
          </ul>
        </nav>
        <nav aria-label="Inova Inox">
          <p className="rodape-rotulo">Inova</p>
          <ul>
            <li><Link href="/#servicos">Usinagem, solda e polimento</Link></li>
            <li><Link href="/#orcamento">Peça sob desenho</Link></li>
            <li><Link href={linkCatalogo()}>Catálogo técnico</Link></li>
            <li><Link href="/#duvidas">Dúvidas</Link></li>
          </ul>
        </nav>
        <div>
          <p className="rodape-rotulo">Fale com a gente</p>
          <ul>
            <li><a href={waLink(mensagens.geral)} target="_blank" rel="noopener noreferrer"><BrandIcon /> {site.whatsappVisivel}</a></li>
            <li><a href={telLink}>Telefone {site.telefoneVisivel}</a></li>
          </ul>
          <p className="rodape-rotulo rodape-rotulo-2">Conforto</p>
          <button type="button" className="rodape-movimento" aria-pressed={reduzido} onClick={alternar}>
            <span className="interruptor" aria-hidden="true"><i /></span>
            {reduzido ? 'Animações reduzidas' : 'Reduzir animações'}
          </button>
          <a href="#topo" className="rodape-topo" onClick={topo}><ArrowUp aria-hidden="true" /> Voltar ao topo</a>
        </div>
      </div>
    </div>

    <motion.p ref={assinatura} className="rodape-assinatura" aria-hidden="true" initial="fora" whileInView="dentro" viewport={{ once: true, amount: 0.2 }}>
      <motion.span style={reduzido ? undefined : { y: yAss }} variants={{ fora: {}, dentro: { transition: { staggerChildren: 0.06 } } }}>
        {Array.from('INOX.').map((l, i) => <motion.span key={i} className={l === '.' ? 'is-ponto' : ''}
          variants={{ fora: { y: '60%', opacity: 0 }, dentro: { y: '0%', opacity: 1, transition: { duration: 1.3, ease: ease.expo } } }}>{l}</motion.span>)}
      </motion.span>
      <Faisca className="rodape-faisca anima" />
    </motion.p>

    <div className="conteiner rodape-base">
      <span>© {new Date().getFullYear()} {site.nome}</span>
      <span>Preços e disponibilidade confirmados no atendimento.</span>
    </div>
  </footer>
}

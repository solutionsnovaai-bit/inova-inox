import { useState } from 'react'
import { Loader } from './components/loader/Loader'
import { BarraCompra, ProgressoRolagem, WhatsAppFab } from './components/layout/Flutuantes'
import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import { Seo } from './components/layout/Seo'
import { Hero } from './components/hero/Hero'
import { ChamadaFinal } from './components/secoes/ChamadaFinal'
import { Faixa } from './components/secoes/Faixa'
import { Faq } from './components/secoes/Faq'
import { Galeria } from './components/secoes/Galeria'
import { GuiaInox } from './components/secoes/GuiaInox'
import { MercadoLivre } from './components/secoes/MercadoLivre'
import { Orcamento } from './components/secoes/Orcamento'
import { Pecas } from './components/secoes/Pecas'
import { Polimento } from './components/secoes/Polimento'
import { Processo } from './components/secoes/Processo'
import { Servicos } from './components/secoes/Servicos'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useTravaRolagem } from './hooks/basicos'

export default function App() {
  /** `aberto`: as chapas do loader começaram a abrir. `carregando`: o loader ainda está na tela. */
  const [aberto, setAberto] = useState(false)
  const [carregando, setCarregando] = useState(true)

  useTravaRolagem(carregando)
  useSmoothScroll(!carregando)

  return (
    <>
      <Seo />
      {carregando && <Loader aoAbrir={() => setAberto(true)} aoTerminar={() => setCarregando(false)} />}

      <a href="#conteudo" className="pular-link">
        Pular para o conteúdo
      </a>
      <ProgressoRolagem />
      <Navbar visivel={aberto} />

      <main id="conteudo">
        <Hero pronto={aberto} />
        <Faixa />
        <MercadoLivre />
        <Pecas />
        <Servicos />
        <Polimento />
        <Galeria />
        <Processo />
        <GuiaInox />
        <Orcamento />
        <Faq />
        <ChamadaFinal />
      </main>

      <Footer />
      <WhatsAppFab />
      <BarraCompra />
    </>
  )
}

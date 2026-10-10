import { useEffect, useRef, type CSSProperties } from 'react'
import { type Midia, oficina } from '../../lib/fotos'
import { Marquee } from '../ui/Marquee'
import { Surgir, Titulo } from '../ui/Titulo'

type PropsVideo = { midia: Midia }

/**
 * Vídeo da oficina, sem som e em loop. Só baixa e toca quando está perto
 * da tela; fora dela, pausa. Assim o carrossel não pesa no celular.
 */
export function VideoOficina({ midia }: PropsVideo) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    video.muted = true
    if (!('IntersectionObserver' in window)) {
      video.play().catch(() => {})
      return
    }
    const io = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { rootMargin: '120px 240px' },
    )
    io.observe(video)
    return () => io.disconnect()
  }, [])

  return (
    <video
      ref={ref}
      className="imagem"
      src={midia.src}
      poster={midia.capa}
      muted
      loop
      playsInline
      preload="none"
      aria-label={midia.legenda}
      disablePictureInPicture
    />
  )
}

type PropsItem = { midia: Midia }

export function ItemOficina({ midia }: PropsItem) {
  return (
    <figure className="galeria-item chanfro" style={{ '--proporcao': midia.proporcao } as CSSProperties}>
      {midia.tipo === 'video' ? (
        <VideoOficina midia={midia} />
      ) : (
        <img className="imagem" src={midia.src} alt={midia.legenda} loading="lazy" decoding="async" draggable={false} />
      )}
      <figcaption className="galeria-legenda rotulo">{midia.legenda}</figcaption>
    </figure>
  )
}

/**
 * Carrossel da oficina: vídeos e fotos reais, rodando sozinhos.
 * Lê tudo o que estiver em src/assets/oficina. Vídeos na faixa de cima
 * (intercalados com fotos quando são poucos), fotos na de baixo, cada faixa para um lado.
 */
export function Galeria() {
  if (oficina.length === 0) return null

  const videos = oficina.filter((m) => m.tipo === 'video')
  const fotos = oficina.filter((m) => m.tipo === 'foto')

  // Com poucos vídeos, a faixa de cima intercala vídeo e foto para não ficar repetitiva.
  let cima: Midia[] = videos
  let baixo: Midia[] = fotos
  if (videos.length > 0 && videos.length < 4) {
    const fotosCima = fotos.slice(0, Math.floor(fotos.length / 2))
    baixo = fotos.slice(fotosCima.length)
    cima = []
    for (let i = 0; i < Math.max(videos.length, fotosCima.length); i++) {
      if (videos[i]) cima.push(videos[i])
      if (fotosCima[i]) cima.push(fotosCima[i])
    }
  }
  const faixas = [cima, baixo].filter((lista) => lista.length > 0)

  return (
    <section id="oficina" aria-label="Vídeos e fotos da oficina" className="secao secao--sangra bg-preto">
      <div className="conteudo cabecalho">
        <Titulo className="titulo-secao text-white" linhas={['Direto da', 'nossa oficina.']} />
        <Surgir ordem={1}>
          <p className="texto-apoio">
            O estoque de conexões da linha sanitária e as peças recém-polidas. Tudo gravado aqui, na
            oficina da Inova Inox.
          </p>
        </Surgir>
      </div>

      <div className="galeria">
        {faixas.map((lista, i) => (
          <Marquee
            key={i}
            duracao={lista.length * (i === 0 ? 8 : 7)}
            inverso={i % 2 === 1}
            preencher
            className={`galeria-faixa galeria-faixa--${i === 0 && videos.length ? 'videos' : 'fotos'}`}
          >
            {lista.map((midia) => (
              <ItemOficina key={midia.id} midia={midia} />
            ))}
          </Marquee>
        ))}
      </div>
    </section>
  )
}

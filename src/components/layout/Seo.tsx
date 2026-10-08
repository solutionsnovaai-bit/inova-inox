import { Helmet } from 'react-helmet-async'
import { site } from '../../lib/site'
import { perguntas } from '../../data/conteudo'

/** Dados estruturados para o Google: a empresa e as perguntas frequentes. */
export function dadosEstruturados() {
  const empresa = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.nome,
    description: site.descricao,
    ...(site.url ? { url: site.url, logo: `${site.url}/icon-512.png`, image: `${site.url}/og.jpg` } : {}),
    telephone: `+${site.telefone}`,
    contactPoint: [site.telefone, site.whatsapp].map((numero) => ({
      '@type': 'ContactPoint',
      telephone: `+${numero}`,
      contactType: 'sales',
      areaServed: 'BR',
      availableLanguage: 'Portuguese',
    })),
  }

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: perguntas.map(({ pergunta, resposta }) => ({
      '@type': 'Question',
      name: pergunta,
      acceptedAnswer: { '@type': 'Answer', text: resposta },
    })),
  }

  return [empresa, faq]
}

/**
 * Título, descrição e dados estruturados. As tags de compartilhamento
 * (og:image e afins) ficam fixas no index.html, que é o que os robôs leem.
 */
export function Seo() {
  return (
    <Helmet>
      <html lang="pt-BR" />
      <title>{site.titulo}</title>
      <meta name="description" content={site.descricao} />
      {site.url && <link rel="canonical" href={`${site.url}/`} />}
      {dadosEstruturados().map((bloco, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(bloco)}
        </script>
      ))}
    </Helmet>
  )
}

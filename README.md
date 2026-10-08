# Inova Inox

Site da Inova Inox: linha sanitária e conexões em inox 304 e 316, peças sob desenho ou amostra
e serviços de usinagem, soldagem e polimento/acabamento.
O objetivo do site é levar o visitante a pedir cotação pelo WhatsApp ou ligar para o telefone fixo.

## Contatos usados no site

| Canal | Número | Onde trocar |
| --- | --- | --- |
| WhatsApp | (11) 98198-7909 | `src/lib/site.ts` (`whatsapp` e `whatsappExibicao`) |
| Telefone fixo | (11) 2705-1775 | `src/lib/site.ts` (`telefone` e `telefoneExibicao`) |

O número também aparece no `index.html` (descrição e texto sem JavaScript).

## Tecnologia

- Vite 6, React 18 e TypeScript
- Tailwind CSS v4 (plugin `@tailwindcss/vite`, tokens no bloco `@theme` de `src/styles/index.css`)
- Framer Motion para as animações
- Lenis para a rolagem suave no desktop
- Fonte Archivo servida junto com o site (`@fontsource-variable/archivo`)

## Rodar no computador

```bash
npm install
npm run dev
```

O site abre em `http://localhost:5173`.

Para gerar a versão final:

```bash
npm run build
npm run preview
```

## Publicação

O repositório está ligado à Vercel: cada envio para a branch `main` publica o site sozinho.
O `vercel.json` já define o build.

Variável opcional em **Settings > Environment Variables**:

| Variável | Para que serve | Exemplo |
| --- | --- | --- |
| `VITE_SITE_URL` | Endereço final do site, sem barra no fim. Usado na imagem de compartilhamento. | `https://www.inovainox.com.br` |

## Ordem da página

1. Hero: linha sanitária em inox 304 e 316, WhatsApp e telefone
2. Linha sanitária: as quatro frentes e os sete padrões de conexão
3. Conexões: curvas, tês, reduções, espigões, niples, uniões, abraçadeiras e peça sob desenho
4. Oficina: carrossel com vídeos e fotos reais
5. Serviços: usinagem, soldagem e polimento
6. Sob desenho ou amostra: os quatro passos
7. Guia 304 ou 316
8. Orçamento (monta a mensagem do WhatsApp)
9. Dúvidas
10. Chamada final e rodapé

## Onde mexer

| O que | Arquivo |
| --- | --- |
| WhatsApp, telefone, textos de SEO, mensagens prontas | `src/lib/site.ts` |
| Padrões de conexão, peças, serviços, passos, guia e dúvidas | `src/data/conteudo.ts` |
| Desenho técnico de cada peça | `src/components/desenhos/DesenhoPeca.tsx` |
| Legendas dos vídeos e fotos da oficina | `src/lib/fotos.ts` |
| Cores, fontes e botões | `src/styles/index.css` |
| Tempos da tela de carregamento | `src/lib/roteiroLoader.ts` |
| Física do balão do WhatsApp | `src/hooks/useInercia.ts` |

## Imagens e vídeos

O site lê as pastas de `src/assets` sozinho: para trocar uma foto, basta substituir o arquivo
mantendo o nome. Para acrescentar vídeo ou foto ao carrossel, veja `docs/IMAGENS.md`.
Os prompts usados para gerar as fotos do hero e dos serviços estão em `docs/PROMPTS.md`.

## Estrutura

```
public/                 favicon, ícones, imagem de compartilhamento
scripts/                preparo das imagens
docs/                   prompts e guia de imagens
src/
  assets/               logotipo em camadas, hero, fotos dos serviços, vídeos e fotos da oficina
  components/
    loader/             tela de carregamento
    layout/             barra do topo, menu, rodapé, balão do WhatsApp, barra de ligar
    hero/               primeira tela
    secoes/             demais seções da página
    desenhos/           desenhos técnicos em SVG
    ui/                 botões, títulos e peças reutilizáveis
  data/                 textos e listas do site
  hooks/                comportamentos (rolagem, inércia, inclinação)
  lib/                  dados da empresa, links e utilitários
  styles/               index (tokens e base), loader, layout e seções
```

## Pendências

- [ ] **Domínio do site.** Cadastrar em `VITE_SITE_URL` para a imagem de compartilhamento
      aparecer no WhatsApp e nas redes.
- [ ] **Endereço e horário.** O site não mostra endereço. Se a empresa atende no local,
      incluir no rodapé (`src/components/layout/Footer.tsx`).
- [ ] **Instagram ou outras redes.** Não há links de redes no rodapé.
- [ ] **Fotos dos serviços.** Os painéis de usinagem, soldagem e polimento ainda usam imagens
      ilustrativas (`src/assets/cenas`). Com fotos reais da oficina, basta trocar os arquivos.

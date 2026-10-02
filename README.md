# Inova Inox

Site da Inova Inox: fabricante de peças em aço inox, com serviços de usinagem, polimento e solda.
O objetivo do site é levar o visitante a comprar pelo Mercado Livre e a pedir orçamento pelo WhatsApp.

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

## Publicar na Vercel

1. Suba esta pasta para um repositório no GitHub.
2. Na Vercel, importe o repositório. O `vercel.json` já define o build.
3. Em **Settings > Environment Variables**, cadastre:

| Variável | Para que serve | Exemplo |
| --- | --- | --- |
| `VITE_SITE_URL` | Endereço final do site, sem barra no fim. Usado na imagem de compartilhamento. | `https://www.inovainox.com.br` |
| `VITE_ML_URL` | Link da loja no Mercado Livre. Todos os botões amarelos usam este link. | `https://www.mercadolivre.com.br/pagina/sualoja` |

Sem `VITE_ML_URL`, os botões levam a uma busca por "inova inox" no Mercado Livre.
Troque pelo link da página do vendedor antes de divulgar o site.

## Onde mexer

| O que | Arquivo |
| --- | --- |
| WhatsApp, link da loja, textos de SEO, mensagens prontas | `src/lib/site.ts` |
| Todos os textos e listas (peças, serviços, passos, guia, dúvidas) | `src/data/conteudo.ts` |
| Cores, fontes e botões | `src/styles/index.css` |
| Tempos da tela de carregamento | `src/lib/roteiroLoader.ts` |
| Física do balão do WhatsApp | `src/hooks/useInercia.ts` |

## Imagens

As fotos ficam em `src/assets/hero` e `src/assets/galeria`. O site lê essas pastas sozinho:
para trocar uma foto, basta substituir o arquivo mantendo o nome.

Para preparar fotos novas a partir dos originais, veja `docs/IMAGENS.md`.
Os prompts usados para gerar as fotos estão em `docs/PROMPTS.md`.

## Estrutura

```
public/                 favicon, ícones, imagem de compartilhamento
scripts/                preparo das imagens
docs/                   prompts e guia de imagens
src/
  assets/               logotipo em camadas, fotos do hero e da galeria
  components/
    loader/             tela de carregamento
    layout/             barra do topo, menu, rodapé, balão do WhatsApp
    hero/               primeira tela
    secoes/             demais seções da página
    desenhos/           desenhos técnicos em SVG
    ui/                 botões, títulos e peças reutilizáveis
  data/                 textos e listas do site
  hooks/                comportamentos (rolagem, inércia, inclinação)
  lib/                  dados da empresa, links e utilitários
  styles/               index (tokens e base), loader, layout e seções
```

## Pendências antes de divulgar

Itens que dependem de informação da Inova Inox. O site funciona sem eles,
mas cada um melhora o resultado.

### Obrigatórias

- [ ] **Link da loja no Mercado Livre.** Cadastrar em `VITE_ML_URL` na Vercel
      (ou trocar em `src/lib/site.ts`). Hoje os botões amarelos levam a uma busca por
      "inova inox", que pode mostrar anúncios de outros vendedores.
- [ ] **Domínio do site.** Cadastrar em `VITE_SITE_URL` para a imagem de compartilhamento
      aparecer no WhatsApp e nas redes.

### Conferir com o cliente

- [ ] **Famílias de peças** (`src/data/conteudo.ts`). Estão descritas pelo processo
      (torneadas, fresadas, soldadas, polidas). Se houver linha de produto definida,
      trocar pelos nomes reais.
- [ ] **Textos dos serviços** (`src/data/conteudo.ts`). Conferir se a lista de cada serviço
      bate com o que a oficina faz: reparo de peça trincada, lote unitário, acabamento do cordão.
- [ ] **Dúvidas frequentes** (`src/data/conteudo.ts`). As respostas não prometem prazo, garantia
      nem preço. Se houver política definida, vale escrever.
- [ ] **Endereço e horário.** O site não mostra endereço. Se a oficina atende no local,
      incluir no rodapé (`src/components/layout/Footer.tsx`).
- [ ] **Instagram ou outras redes.** Não há links de redes no rodapé.

### Sobre as fotos

As fotos do hero e da galeria são imagens ilustrativas geradas por IA, e a galeria avisa isso.
Quando houver fotos reais das peças e da oficina, basta substituir os arquivos em
`src/assets/galeria` (ver `docs/IMAGENS.md`).

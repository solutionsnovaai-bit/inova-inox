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
4. Catálogo técnico para folhear no site (livro no computador, deslizar no celular)
5. Oficina: carrossel com vídeos e fotos reais
6. Serviços: usinagem, soldagem e polimento
7. Sob desenho ou amostra: os quatro passos
8. Guia 304 ou 316
9. Orçamento (monta a mensagem do WhatsApp)
10. Dúvidas
11. Chamada final e rodapé

## Onde mexer

| O que | Arquivo |
| --- | --- |
| WhatsApp, telefone, textos de SEO, mensagens prontas | `src/lib/site.ts` |
| Padrões de conexão, peças, serviços, passos, guia e dúvidas | `src/data/conteudo.ts` |
| Desenho técnico de cada peça | `src/components/desenhos/DesenhoPeca.tsx` |
| Legendas dos vídeos e fotos da oficina | `src/lib/fotos.ts` |
| Títulos das páginas e índice do catálogo | `src/data/conteudo.ts` (`catalogo`) |
| Cores, fontes e botões | `src/styles/index.css` |
| Tempos da tela de carregamento | `src/lib/roteiroLoader.ts` |
| Física do balão do WhatsApp | `src/hooks/useInercia.ts` |

## Imagens e vídeos

O site lê as pastas de `src/assets` sozinho: para trocar uma foto, basta substituir o arquivo
mantendo o nome. Para acrescentar vídeo ou foto ao carrossel, veja **Imagens e vídeos (guia completo)**
mais abaixo. Os prompts usados para gerar as fotos do hero e dos serviços estão em **Prompts das imagens**.

## Estrutura

```
public/                 favicon, ícones, imagem de compartilhamento
scripts/                preparo das imagens
src/
  assets/               logotipo em camadas, hero, fotos dos serviços, oficina e catálogo
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

## Catálogo técnico

As páginas do catálogo ficam em `src/assets/catalogo`, quatro por imagem, numa grade 2 x 2
(`folha-1.webp` tem as páginas 1 a 4, `folha-2.webp` as páginas 5 a 8, e assim por diante).
Cada página tem 1400 x 1980 pixels, então cada folha tem 2800 x 3960.
Juntar as páginas assim mantém o projeto com menos de 100 arquivos.

O que foi feito a partir do PDF original:

- As marcações em vermelho saíram, junto com o que elas riscavam: adaptador para aspersor,
  painel de distribuição de fluxo, manômetro, termômetro e chave para porca.
- As páginas 12 e 13 de acessórios viraram uma só (spray-ball, abraçadeiras e luva).
- As três páginas de índice viraram o índice clicável ao lado do livro.

Os títulos de cada página e o índice estão em `src/data/conteudo.ts` (`catalogo`).
Para trocar uma página, refaça a folha dela mantendo a mesma grade e o mesmo tamanho.

## Imagens e vídeos (guia completo)

### Onde ficam

| Pasta | O que tem | Formato |
| --- | --- | --- |
| `src/assets/logo` | Logotipo separado em 12 peças transparentes, mais as versões montadas | WEBP |
| `src/assets/hero` | Foto do hero para desktop (16:9) e para celular (9:16) | WEBP |
| `src/assets/oficina` | Vídeos e fotos reais do carrossel da oficina | MP4 e WEBP |
| `src/assets/oficina/capas` | Primeiro quadro de cada vídeo, com o mesmo nome do vídeo | WEBP |
| `src/assets/cenas` | Fotos dos painéis de serviço (01 usinagem, 02 solda, 04 polimento) | WEBP |
| `public` | Favicon, ícones e a imagem de compartilhamento (`og.jpg`) | PNG, ICO, JPG |

### Carrossel da oficina

O carrossel lê a pasta `src/assets/oficina` sozinho e roda sem parar.
Os vídeos vão para a faixa de cima e as fotos para a de baixo, cada faixa para um lado.
A ordem é a ordem dos nomes, então comece cada arquivo por um número (`06-...`).

Os vídeos tocam sem som e em loop, e só baixam quando chegam perto da tela.
A legenda de cada item fica em `src/lib/fotos.ts` (`fichaOficina`), pelo nome do arquivo sem o número.
Arquivo novo sem legenda entra com um texto genérico.

#### Preparar um vídeo novo

Vídeo curto (5 a 8 segundos), sem som, em MP4 H.264, com a capa ao lado:

```bash
ffmpeg -i original.mp4 -an -c:v libx264 -preset slow -crf 29 -profile:v main \
  -pix_fmt yuv420p -movflags +faststart -r 30 src/assets/oficina/06-nome.mp4

ffmpeg -ss 0.4 -i src/assets/oficina/06-nome.mp4 -frames:v 1 -vf "scale=iw*0.75:-2" \
  -c:v libwebp -quality 62 src/assets/oficina/capas/06-nome.webp
```

Para tirar um trecho de um vídeo longo, acrescente `-ss 40 -t 6` antes do `-i`
(começa no segundo 40 e pega 6 segundos).

Depois, cadastre a legenda e a proporção (largura ÷ altura) em `fichaOficina`.

### Trocar uma foto

1. Crie as pastas `imagens-brutas/hero`, `imagens-brutas/cenas` e `imagens-brutas/oficina`
   (elas não vão para o GitHub) e salve os originais nelas.
   - Hero: o nome precisa ser `hero-desktop` ou `hero-mobile`.
   - Cenas: comece o nome pelo número do serviço (`01`, `02` ou `04`).
   - Oficina: comece o nome pelo número da posição no carrossel.
2. Rode `npm run imagens`.
3. Rode `npm run build` para conferir.

O script converte para WEBP e, na foto vertical do hero,
acrescenta uma faixa no topo para a barra do site não encostar no logotipo.

### Regras do hero

O logotipo dentro da foto nunca pode ser cortado. Para isso:

- **Desktop (16:9):** a foto ocupa a largura toda. O logotipo deve ficar na metade direita
  e a metade esquerda precisa ser escura e vazia, porque o texto entra ali.
- **Celular (9:16):** a foto ocupa a largura toda, presa ao topo. O logotipo deve ficar no
  terço de cima e a metade de baixo precisa ser escura, porque o texto entra ali.

Se a posição do logotipo mudar muito numa foto nova, ajuste em `src/styles/layout.css`:
`padding-top` de `.hero--foto .hero-grade` (celular) e `max-width` de `.hero--foto .hero-texto` (desktop).

### Fotos fora do carrossel

| Arquivo | Onde aparece |
| --- | --- |
| `cenas/01` torno | Serviço de usinagem |
| `cenas/02` arco de solda | Serviço de soldagem |
| `cenas/04` polimento | Serviço de polimento |
| `oficina/10-curvas-polidas` | Seção da linha sanitária (e também no carrossel) |

Se uma dessas fotos não existir, a seção simplesmente aparece sem ela.

## Prompts das imagens

### Hero

Nos dois prompts, anexe o logotipo da Inova Inox junto.

#### Hero desktop (16:9)

```
Use o logotipo anexado como referência exata de forma, letras e proporções. Recrie esse logotipo como um emblema físico tridimensional, usinado em aço inoxidável maciço: as letras "INOVA" e "INOX" em inox escovado com chanfros polidos espelhados nas bordas, os dois arcos em inox polido com o preenchimento azul em esmalte azul elétrico (#0471E5) levemente retroiluminado. Mantenha a linha "USINAGEM - POLIMENTO - SOLDA" gravada abaixo, em relevo baixo. REMOVA completamente o ícone verde e o número de telefone: eles não devem aparecer.

COMPOSIÇÃO (Aspect Ratio 16:9, horizontal, 4K):
- O emblema fica ancorado na metade DIREITA do quadro, grande, ocupando cerca de 42% da largura, centralizado na vertical.
- O logotipo precisa aparecer INTEIRO, sem nenhum corte: deixe pelo menos 8% de margem livre entre o emblema e as bordas direita, superior e inferior.
- A metade ESQUERDA do quadro fica escura, limpa e quase vazia (preto profundo com leve textura de aço escovado fora de foco), reservada para texto. Nada de objetos, brilho forte ou faíscas nessa área.
- Deixe uma faixa de 12% no topo do quadro sem elementos importantes.

CENA: bancada de oficina de usinagem em preto fosco. O emblema está apoiado em pé sobre uma chapa de inox escovado que reflete o azul. Atrás e à direita dele, fora de foco, uma chuva fina de faíscas de solda em laranja quente caindo na diagonal, e duas ou três peças torneadas de inox (flange, bucha, eixo) desfocadas no fundo. Fumaça leve atravessada por um feixe de luz azul vindo de trás.

LUZ E CÂMERA: fotografia de produto cinematográfica, ARRI Alexa 35 com lente Zeiss Master Prime 65mm em f/2.8, luz de recorte azul fria por trás, luz principal branca e dura em 45 graus riscando o escovado do metal, contraste alto, pretos profundos, reflexos especulares nítidos, profundidade de campo rasa. Paleta restrita: preto, cinza aço, azul elétrico e apenas o laranja das faíscas.

PROIBIDO: qualquer texto além do logotipo, número de telefone, ícone de aplicativo, pessoas, mãos, marca d'água, letras distorcidas ou inventadas, aparência de render plástico.
```

#### Hero mobile (9:16)

```
Use o logotipo anexado como referência exata de forma, letras e proporções. Recrie esse logotipo como um emblema físico tridimensional, usinado em aço inoxidável maciço: as letras "INOVA" e "INOX" em inox escovado com chanfros polidos espelhados nas bordas, os dois arcos em inox polido com o preenchimento azul em esmalte azul elétrico (#0471E5) levemente retroiluminado. Mantenha a linha "USINAGEM - POLIMENTO - SOLDA" gravada abaixo, em relevo baixo. REMOVA completamente o ícone verde e o número de telefone: eles não devem aparecer.

COMPOSIÇÃO (Aspect Ratio 9:16, formato de tela de celular, 4K):
- O emblema fica no terço SUPERIOR do quadro, centralizado na horizontal, ocupando cerca de 78% da largura.
- O logotipo precisa aparecer INTEIRO, sem nenhum corte: deixe pelo menos 14% de margem livre acima dele e 9% em cada lateral.
- Os 55% INFERIORES do quadro ficam escuros, limpos e quase vazios (preto profundo dissolvendo em textura de aço escovado fora de foco), reservados para texto e botões. Nada de objetos, brilho forte ou faíscas nessa área.

CENA: o emblema flutua levemente à frente de uma parede de inox escovado escurecida. Atrás dele, fora de foco, faíscas de solda em laranja quente caindo na vertical pelos dois lados, e fumaça leve atravessada por um feixe de luz azul vindo de cima. Um reflexo azul suave escorre para baixo do emblema e some no preto.

LUZ E CÂMERA: fotografia de produto cinematográfica, ARRI Alexa 35 com lente Zeiss Master Prime 50mm em f/2.8, luz de recorte azul fria por trás, luz principal branca e dura vinda de cima riscando o escovado do metal, contraste alto, pretos profundos, reflexos especulares nítidos, profundidade de campo rasa. Paleta restrita: preto, cinza aço, azul elétrico e apenas o laranja das faíscas.

PROIBIDO: qualquer texto além do logotipo, número de telefone, ícone de aplicativo, pessoas, mãos, marca d'água, letras distorcidas ou inventadas, aparência de render plástico.
```

### Fotos dos serviços (banco original de 10 cenas)

Hoje o site usa só as cenas 01 (usinagem), 02 (solda) e 04 (polimento), nos painéis de serviço.
O carrossel passou a mostrar vídeos e fotos reais da oficina (`src/assets/oficina`).

Cole no gerador de imagens, sem anexo. Salve cada resultado com o número da cena
no começo do nome (`01-torno.png`, `02-arco-de-solda.png` e assim por diante).

```
Você é diretor de fotografia industrial e vai gerar o banco de imagens do site de uma fabricante de peças em aço inoxidável que também presta serviços de usinagem, polimento e solda. O clima é de precisão, metal de verdade e acabamento impecável: oficina séria, escura, com o inox como protagonista. Realista e cinematográfico, nunca com cara de banco de imagem genérico e nunca com cara de render 3D.

REGRAS OBRIGATÓRIAS PARA TODAS AS IMAGENS
- Gere exatamente 1 imagem por cena, na ordem da lista, uma de cada vez, até completar as 10.
- Formato 4:3 (Aspect Ratio 4:3), orientação horizontal.
- Nenhum texto legível, nenhum logotipo, nenhuma marca de máquina ou ferramenta, nenhuma etiqueta, nenhuma marca d'água. Painéis e displays sempre desfocados.
- Pessoas: no máximo mãos com luva de raspa ou luva nitrílica preta, em close. Nenhum rosto, nenhum corpo inteiro, nenhum uniforme em destaque.
- Paleta coerente com a marca: preto profundo, cinza aço, prata escovada e azul elétrico (#0471E5) como luz de recorte. O laranja só aparece em faísca e metal incandescente.
- Padrão fotográfico: ARRI Alexa 35, lente macro 100mm para closes e 35mm para planos de bancada, f/2.8, luz dura lateral que revela o escovado do metal, fundo escuro, contraste alto, pretos profundos, grão fino de cinema.
- O inox tem que parecer inox: reflexo frio, riscos de escovado na direção certa, espelho real nas áreas polidas. Nada de metal amarelado, cromado de plástico ou ferrugem.

CENAS
1. TORNO: macro de uma peça cilíndrica de inox girando no torno, ferramenta de corte encostada, cavaco em espiral longa e brilhante se soltando, gotas de fluido de corte congeladas no ar, luz azul por trás.
2. ARCO DE SOLDA: close extremo de uma tocha soldando a junta de dois tubos de inox, arco branco-azulado intenso, poça de fusão incandescente, mão com luva de raspa segurando a tocha, fundo totalmente preto.
3. CORDÃO: macro de um cordão de solda pronto em inox, escamas regulares e uniformes, com as cores de revenimento (dourado, roxo e azul) ao longo da junta, luz rasante.
4. POLIMENTO: roda de polimento de pano girando contra uma peça de inox, rastro de movimento na roda, a área já polida refletindo como espelho ao lado da área ainda fosca, poeira fina iluminada por contraluz azul.
5. ANTES E DEPOIS: uma única chapa de inox vista de cima, metade esquerda em acabamento bruto fosco com riscos, metade direita polida espelhada refletindo uma luz azul, divisão em linha reta bem nítida no centro.
6. FAMÍLIA DE PEÇAS: bancada preta fosca com oito peças de inox usinadas alinhadas com rigor (flanges, buchas, eixos, conexões roscadas, pinos), todas polidas, reflexos azuis nas bordas, vista em três quartos.
7. MEDIÇÃO: paquímetro de aço medindo o diâmetro de uma bucha de inox recém usinada, mãos com luva nitrílica preta, display do paquímetro desfocado e ilegível, fundo escuro com bokeh azul.
8. FRESA: fresa de topo usinando um bloco de inox, jato de fluido refrigerante espirrando em leque, cavacos curtos voando, tudo congelado em alta velocidade, luz dura lateral.
9. FAÍSCAS: esmerilhadeira dando acabamento em uma estrutura de inox, leque largo de faíscas laranja cruzando o quadro inteiro na diagonal sobre fundo preto, apenas a mão com luva aparece.
10. PRONTO PARA ENVIO: peças de inox polidas sendo acomodadas em uma caixa de papelão pardo sem nenhuma marca, protegidas com papel kraft e espuma preta, mão com luva nitrílica ajeitando a última peça, luz quente suave de cima e recorte azul ao fundo.

Ao terminar as 10, pare. Não gere variações nem colagens.
```

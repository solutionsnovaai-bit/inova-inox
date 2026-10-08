# Imagens e vídeos do site

## Onde ficam

| Pasta | O que tem | Formato |
| --- | --- | --- |
| `src/assets/logo` | Logotipo separado em 12 peças transparentes, mais as versões montadas | WEBP |
| `src/assets/hero` | Foto do hero para desktop (16:9) e para celular (9:16) | WEBP |
| `src/assets/oficina` | Vídeos e fotos reais do carrossel da oficina | MP4 e WEBP |
| `src/assets/oficina/capas` | Primeiro quadro de cada vídeo, com o mesmo nome do vídeo | WEBP |
| `src/assets/cenas` | Fotos dos painéis de serviço (01 usinagem, 02 solda, 04 polimento) | WEBP |
| `public` | Favicon, ícones e a imagem de compartilhamento (`og.jpg`) | PNG, ICO, JPG |

## Carrossel da oficina

O carrossel lê a pasta `src/assets/oficina` sozinho e roda sem parar.
Os vídeos vão para a faixa de cima e as fotos para a de baixo, cada faixa para um lado.
A ordem é a ordem dos nomes, então comece cada arquivo por um número (`06-...`).

Os vídeos tocam sem som e em loop, e só baixam quando chegam perto da tela.
A legenda de cada item fica em `src/lib/fotos.ts` (`fichaOficina`), pelo nome do arquivo sem o número.
Arquivo novo sem legenda entra com um texto genérico.

### Preparar um vídeo novo

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

## Trocar uma foto

1. Crie as pastas `imagens-brutas/hero`, `imagens-brutas/cenas` e `imagens-brutas/oficina`
   (elas não vão para o GitHub) e salve os originais nelas.
   - Hero: o nome precisa ser `hero-desktop` ou `hero-mobile`.
   - Cenas: comece o nome pelo número do serviço (`01`, `02` ou `04`).
   - Oficina: comece o nome pelo número da posição no carrossel.
2. Rode `npm run imagens`.
3. Rode `npm run build` para conferir.

O script converte para WEBP e, na foto vertical do hero,
acrescenta uma faixa no topo para a barra do site não encostar no logotipo.

## Regras do hero

O logotipo dentro da foto nunca pode ser cortado. Para isso:

- **Desktop (16:9):** a foto ocupa a largura toda. O logotipo deve ficar na metade direita
  e a metade esquerda precisa ser escura e vazia, porque o texto entra ali.
- **Celular (9:16):** a foto ocupa a largura toda, presa ao topo. O logotipo deve ficar no
  terço de cima e a metade de baixo precisa ser escura, porque o texto entra ali.

Se a posição do logotipo mudar muito numa foto nova, ajuste em `src/styles/layout.css`:
`padding-top` de `.hero--foto .hero-grade` (celular) e `max-width` de `.hero--foto .hero-texto` (desktop).

## Fotos fora do carrossel

| Arquivo | Onde aparece |
| --- | --- |
| `cenas/01` torno | Serviço de usinagem |
| `cenas/02` arco de solda | Serviço de soldagem |
| `cenas/04` polimento | Serviço de polimento |
| `oficina/10-curvas-polidas` | Seção da linha sanitária (e também no carrossel) |

Se uma dessas fotos não existir, a seção simplesmente aparece sem ela.

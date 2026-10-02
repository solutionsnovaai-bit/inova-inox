# Imagens do site

## Onde ficam

| Pasta | O que tem | Formato |
| --- | --- | --- |
| `src/assets/logo` | Logotipo separado em 12 peças transparentes, mais as versões montadas | WEBP |
| `src/assets/hero` | Foto do hero para desktop (16:9) e para celular (9:16) | WEBP |
| `src/assets/galeria` | Dez fotos do carrossel (4:3) | WEBP |
| `public` | Favicon, ícones e a imagem de compartilhamento (`og.jpg`) | PNG, ICO, JPG |

## Trocar uma foto

1. Crie as pastas `imagens-brutas/hero` e `imagens-brutas/galeria` (elas não vão para o GitHub) e salve os originais nelas.
   - Hero: o nome precisa ser `hero-desktop` ou `hero-mobile`.
   - Galeria: comece o nome pelo número da cena, de `01` a `10`. A ordem do carrossel é a ordem dos nomes.
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

## Fotos usadas fora do carrossel

Algumas cenas aparecem também em outras seções, escolhidas pelo número:

| Cena | Onde aparece |
| --- | --- |
| `01` torno | Serviço de usinagem |
| `02` arco de solda | Serviço de solda |
| `04` polimento | Serviço de polimento |
| `06` família de peças | Abertura da seção de peças |
| `10` pronto para envio | Seção do Mercado Livre |

Se uma dessas cenas não existir, a seção simplesmente aparece sem a foto.

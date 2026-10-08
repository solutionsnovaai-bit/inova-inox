# Prompts das imagens

## Hero

Nos dois prompts, anexe o logotipo da Inova Inox junto.

### Hero desktop (16:9)

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

### Hero mobile (9:16)

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

## Fotos dos serviços (banco original de 10 cenas)

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

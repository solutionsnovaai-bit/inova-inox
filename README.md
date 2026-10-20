# Inova Inox · Loja

Loja da Inova Inox: conexões sanitárias e industriais em inox 304 e 316 (Tri-Clamp, SMS, RJT, DIN, OD, BSP e NPT), com sacola e pedido fechado pelo WhatsApp. Os preços vêm de uma planilha do Google.

Vite 6, React 19, TypeScript, Motion 12 e Lenis. Fonte Archivo servida junto com o site.

## Rodar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # versão final em dist/
```

Na Vercel: framework Vite, comando `npm run build`, pasta `dist`. O `vercel.json` manda todos os endereços para o `index.html`, então `/loja`, `/produto/...` e `/catalogo` abrem direto.

## Páginas

| Endereço | O que é |
| --- | --- |
| `/` | Início: abertura, linhas da loja, peças em destaque, serviços, oficina, como comprar, catálogo, orçamento sob desenho e dúvidas |
| `/loja` | Todas as peças, com busca, linhas (`?linha=tri-clamp`), grupos e ordem |
| `/produto/<peça>` | Peça: desenho, fotos, ficha do catálogo, medida, aço, padrão, quantidade e preço |
| `/catalogo` | Catálogo técnico para folhear (`?pagina=5` abre na página 5) |

## Preços e fotos pela planilha do Google

A planilha modelo está em `planilha/inova-inox-loja.xlsx`, com o logotipo no topo e as 96 peças do catálogo técnico, uma linha por medida. A tabela começa na linha 4.

1. No Google Drive, **Novo > Upload de arquivo** com o `.xlsx`. Abra com o Google Planilhas e use **Arquivo > Salvar como Planilhas Google**.
2. Em **Arquivo > Configurações**, deixe a localidade como **Brasil**.
3. Em **Compartilhar**, "Acesso geral": **Qualquer pessoa com o link: Leitor**. Quem vai mexer nos preços entra como **Editor** pelo e-mail.
4. Copie o link da planilha e cole em `src/loja/config.ts`, no campo `PLANILHA` (ou crie a variável `VITE_PLANILHA_URL` na Vercel). Publique.

Como a planilha funciona (está explicado também na aba **Como usar**):

- **Preço 304 (ou preço único)** e **Preço 316**: em branco, a peça aparece como "sob consulta". Aceita `38`, `38,50` ou `R$ 38,50`.
- **Mostrar no site**: `Não` esconde aquela medida. Peça sem nenhuma medida visível sai da loja.
- **Destaque**: `Sim` em qualquer linha coloca a peça na vitrine do início.
- **Unidade**: como a peça é vendida (un, m, barra...).
- **Foto (link do Google Drive)**: link de compartilhar de uma foto numa pasta do Drive aberta para "Qualquer pessoa com o link". A primeira foto da peça vira a imagem principal na loja (no lugar do desenho); foto na linha de uma medida troca quando o cliente escolhe aquela medida; vários links na mesma célula, separados por espaço, viram várias fotos. Também aceita link direto de imagem e link do Dropbox. Se o link não abrir, o site mostra o desenho do catálogo.
- **Peça nova**: linhas com um nome de produto novo viram uma peça nova, na categoria escrita na coluna Categoria. **Descrição** é opcional (em peça existente, troca o texto do site).
- Não apague a faixa do logotipo (linhas 1 a 3) nem mude os nomes das colunas da linha 4.

A loja lê a planilha toda vez que a página abre e guarda a última leitura no navegador. Sem planilha ligada, mostra o catálogo inteiro sob consulta.

## Pedido

A sacola fica salva no navegador da pessoa. Ao enviar, abre o WhatsApp da Inova com a lista das peças (medida, aço, opções, quantidade, preço) e os dados que a pessoa preencheu. Estoque, frete e pagamento são combinados no atendimento.

## Onde mexer

- Contatos e link da planilha: `src/loja/config.ts`
- Base das peças (nome, medidas, opções, desenho, página do catálogo, texto): `src/loja/produtos.ts`
- Fotos e vídeos: `src/assets` (lista em `src/lib/midia.ts`)
- Desenhos das peças: pranchas em `src/assets/pecas`, recortadas do catálogo técnico
- Estilos: `src/estilos`

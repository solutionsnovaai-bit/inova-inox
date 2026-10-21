# Inova Inox · loja

Site e loja da Inova Inox: conexões sanitárias e industriais em inox 304 e 316, serviços de usinagem, solda e polimento, e o catálogo técnico para folhear.

Página única: abertura com o logo, faixa, loja (busca, linhas, cards, janela da peça), serviços, dúvidas, catálogo técnico e rodapé. Sacola lateral com frete pelo Melhor Envio e pagamento pelo Mercado Pago.

Painel da loja em `/painel` (link com chave): fotos e preços de cada peça, publicados na hora.

## Rodar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # gera dist/
```

As funções em `api/` (frete, pagamento e aviso de pagamento) rodam na Vercel.

## Painel da loja (fotos e preços)

O painel fica em `https://SEU-SITE/painel?chave=SUA_CHAVE`. Não tem login: quem tem o link entra.

- **Imagens:** "Adicionar foto" em cada peça (do celular ou do computador). A foto com a estrela é a principal no site. A foto é reduzida no aparelho antes de subir.
- **Preços:** preço de cada medida em inox 304 e 316. Vazio = "sob consulta". "Salvar e publicar" grava e o site atualiza em segundos.

Para ligar na Vercel (uma vez só):

1. Projeto → **Storage** → **Create** → **Blob** (acesso **Public**) → conectar ao projeto. A variável `BLOB_READ_WRITE_TOKEN` entra sozinha.
2. **Settings → Environment Variables** → `PAINEL_CHAVE` com uma chave longa (é a senha que vai no link).
3. **Deployments → Redeploy**.

Os dados ficam em `painel/dados.json` no Blob, com uma cópia de cada versão em `painel/historico/`. O checkout confere os preços do painel no servidor. Se a planilha também estiver ligada, o painel tem a palavra final.

## Preços pela planilha (opcional)

A planilha modelo está em `planilha/inova-inox-loja.xlsx`.

1. Suba o arquivo no Google Drive e abra como Planilhas Google.
2. Compartilhar → "Qualquer pessoa com o link" → Leitor.
3. Cole o link em `PLANILHA` no arquivo `src/loja/ajustes.js` (ou na variável `PLANILHA_URL` da Vercel).

Colunas da aba **Produtos** (a tabela começa na linha 4):

| Coluna | Para que serve |
| --- | --- |
| Categoria, Produto, Medida | Identificam a peça. O nome do produto liga a linha à peça do catálogo. |
| Preço 304 (ou preço único) / Preço 316 | Vazio = "sob consulta". |
| Unidade | un, m, kg… |
| Peso (g) | Usado no cálculo do frete. Vazio = 300 g. |
| Mostrar no site | "não" esconde a medida. |
| Destaque | "sim" puxa a peça para o começo da loja. |
| Foto (link do Google Drive) | Link de imagem compartilhada; pode ter mais de um. |
| Descrição (opcional) | Substitui o texto padrão da peça. |

Enquanto nem o painel nem a planilha tiverem preços, a loja mostra preços de exemplo (R$ 300, com a marca "ex.").

## Frete e pagamento

Variáveis de ambiente na Vercel (Settings → Environment Variables):

| Variável | O que é |
| --- | --- |
| `MERCADOPAGO_ACCESS_TOKEN` | Access Token de produção do Mercado Pago. |
| `MELHORENVIO_TOKEN` | Token da conta do Melhor Envio. |
| `MELHORENVIO_ORIGEM_CEP` | CEP de onde as peças saem (também pode ir em `FRETE.origemCep`, em `ajustes.js`). |
| `MELHORENVIO_SANDBOX` | `true` para testar no ambiente de testes do Melhor Envio. |
| `PLANILHA_URL` | Link da planilha (opcional, se não estiver em `ajustes.js`). |
| `PAINEL_CHAVE` | Chave do link do painel da loja. |
| `BLOB_READ_WRITE_TOKEN` | Criada sozinha ao conectar o Blob ao projeto. |

O servidor sempre confere preço e frete direto no painel (ou na planilha) e no Melhor Envio; nada que vem do navegador é usado como valor.

Sem essas chaves o site continua funcionando: a sacola monta o pedido completo e envia para o WhatsApp da Inova. Peças sob consulta também fecham pelo WhatsApp.

Dimensões da caixa padrão e peso padrão ficam em `FRETE`, no `src/loja/ajustes.js`.

## Contato

WhatsApp (11) 98198-7909 · Telefone (11) 2705-1775

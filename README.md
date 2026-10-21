# Inova Inox · loja

Site e loja da Inova Inox: conexões sanitárias e industriais em inox 304 e 316, serviços de usinagem, solda e polimento, e o catálogo técnico para folhear.

Página única: abertura com o logo, faixa, loja (busca, linhas, cards, janela da peça), serviços, dúvidas, catálogo técnico e rodapé. Sacola lateral com frete pelo Melhor Envio e pagamento pelo Mercado Pago.

## Rodar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # gera dist/
```

As funções em `api/` (painel, frete, pagamento e aviso de pagamento) rodam na Vercel.

## Painel da loja (fotos e preços)

Tudo o que muda na loja é feito em `https://SEU-SITE/painel`. Não tem login, não aparece em nenhum link do site e não entra no Google.

- **Imagens:** "Adicionar foto" em cada peça (do celular ou do computador). A foto com a estrela é a principal no site. A foto é reduzida no aparelho antes de subir.
- **Preços:** um campo por medida, com o preço do inox 304. O 316 é calculado sozinho (304 + a porcentagem do topo da aba, 30% de partida). Vazio = "sob consulta". Salva sozinho ao parar de digitar.

Cada mudança aparece no painel na hora. A loja aberta no mesmo aparelho se atualiza sozinha; para os outros visitantes, em até alguns segundos.

Enquanto o painel não tiver nenhum preço, a loja mostra preços de exemplo (R$ 300, com a marca "ex."). Assim que o primeiro preço é salvo, a loja passa a usar só os preços do painel, e as medidas sem preço aparecem como "sob consulta".

Para ligar na Vercel (uma vez só):

1. Projeto → **Storage** → **Create** → **Blob** (acesso **Public**) → **Connect** ao projeto. A variável `BLOB_READ_WRITE_TOKEN` entra sozinha.
2. Publicar de novo (Redeploy ou um novo commit).

Os dados ficam em `painel/dados.json` no Blob e as fotos em `fotos/`. O checkout confere os preços do painel no servidor.

## Frete e pagamento

Variáveis de ambiente na Vercel (Settings → Environment Variables):

| Variável | O que é |
| --- | --- |
| `MERCADOPAGO_ACCESS_TOKEN` | Access Token de produção do Mercado Pago. |
| `MELHORENVIO_TOKEN` | Token da conta do Melhor Envio. |
| `MELHORENVIO_ORIGEM_CEP` | CEP de onde as peças saem (também pode ir em `FRETE.origemCep`, em `ajustes.js`). |
| `MELHORENVIO_SANDBOX` | `true` para testar no ambiente de testes do Melhor Envio. |
| `BLOB_READ_WRITE_TOKEN` | Criada sozinha ao conectar o Blob ao projeto. |

O servidor sempre confere preço e frete direto no painel e no Melhor Envio; nada que vem do navegador é usado como valor.

Sem as chaves do Mercado Pago e do Melhor Envio o site continua funcionando: a sacola monta o pedido completo e envia para o WhatsApp da Inova. Peças sob consulta também fecham pelo WhatsApp.

Peso padrão de cada peça e dimensões da caixa ficam em `FRETE`, no `src/loja/ajustes.js`.

## Contato

WhatsApp (11) 98198-7909 · Telefone (11) 2705-1775

# Site RadCom Rádio Comunicação

Site estático em duas páginas: **Início** (`index.html`) e **RadCom Hidro** (`hidro/index.html`).
É feito só com HTML, CSS e JS, sem etapa de compilação.

## Como abrir

- **No computador:** dê duplo clique em `index.html`. O site funciona direto do disco, sem servidor.
- **Publicado:** envie a pasta inteira para qualquer hospedagem estática (GitHub Pages, Netlify etc.). Todos os caminhos são relativos.

## Estrutura

```
index.html              Início: apresentação + seletor de linhas + institucional
hidro/index.html        Página da linha Hidro
assets/css/style.css    Estilos compartilhados (cores, cabeçalho, rodapé, componentes)
assets/js/config.js     Contato e dados pendentes
assets/js/data.js       Linhas e produtos (textos, imagens, conexões)
assets/js/site.js       Cartões, vitrine, filtros, detalhe "Como usar?", menu ativo
assets/js/simulacao.js  Demonstração ilustrativa de nível e bomba
img_radcom/             Imagens
```

## Trocar imagens

Substitua o arquivo em `img_radcom/` por outro **com o mesmo nome**. As fotos grandes têm versões otimizadas, e o site usa essas versões:

| No site                       | Gerado a partir de |
|-------------------------------|--------------------|
| `fundo.jpg` (abertura Hidro)  | `fundo.PNG`        |
| `instalacao.jpg`              | `instalacao.png`   |
| `painel2.jpg`                 | `painel2.png`      |

Ao trocar uma delas, salve direto como `.jpg` (cerca de 1920 px de largura para o fundo e 1000 a 1200 px para as outras).

As imagens dos produtos são definidas em `assets/js/data.js`, no campo `imagem` de cada produto.
O **Reservatório (LoRa)** usa por enquanto a foto do Reservatório Wi-Fi e mostra a etiqueta "Foto ilustrativa".
Quando a foto certa chegar, salve-a como `img_radcom/reservatorio_lora.png`, troque o caminho e mude `provisoria` para `false`.

## Contato

O contato ainda não foi confirmado, então o site não mostra nenhum.
Preencha `telefone`, `whatsapp` ou `email` em **`assets/js/config.js`**. Com isso aparecem sozinhos:
o link "Contato" no cabeçalho, os botões na seção "Sobre a RadCom" e a faixa "Converse com a RadCom" no fim da Hidro.

## Ativar uma nova linha (Usina, Irrigação)

1. Crie a página, por exemplo `usina/index.html`. Copie `hidro/index.html` como base e mantenha `data-root="../"` no `<body>`.
2. Em `assets/js/data.js`, na linha correspondente, preencha `descricao`, defina `url: "usina/index.html"` e troque `ativa` para `true`.

O cartão da página inicial passa a mostrar a descrição e o botão "Explorar linha". A entrada não precisa ser redesenhada.

## Pendências a validar antes de publicar

- Texto institucional da seção "Sobre a RadCom" (está marcado como provisório no HTML).
- Modelo e foto do Reservatório (LoRa).
- Etiquetas de conectividade: o adesivo do Poço mostra os selos LoRa e Wi-Fi, mas o site lista só LoRa, como na referência da Jóia.
- Telas da plataforma e da configuração local (`plataforma*.jpg`, `web*.jpeg`): confirmar se podem ser publicadas.
- Canal comercial: telefone, WhatsApp, e-mail ou indicação de distribuidores.

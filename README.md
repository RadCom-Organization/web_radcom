# Site RadCom Rádio Comunicação

Site estático em duas páginas: **Início** (`index.html`) e **RadCom Hidro** (`hidro/index.html`).
É feito só com HTML, CSS e JS, sem etapa de compilação.

## Como abrir

- **No computador:** dê duplo clique em `index.html`. O site funciona direto do disco, sem servidor.
- **Publicado:** **não envie a pasta inteira.** Siga "Publicar em radcom.ind.br" abaixo.

## Publicar em radcom.ind.br

No servidor, o site fica na pasta `WEBSITE/`, mas aparece na raiz do domínio (`radcom.ind.br/`, `radcom.ind.br/hidro/`). Quem faz essa ligação é o `.htaccess` da raiz. O WordPress pode continuar onde está, como plano B.

```
raiz do servidor/
├── .htaccess     ← o deste projeto (substitui o do WordPress)
├── WEBSITE/      ← o site
├── wp-…, index.php   ← WordPress antigo, intocado
└── outros projetos
```

**Preparar**

1. Se mudou algo em `assets/js/data.js`, rode `python ferramentas/prerender.py`. O script grava no HTML os cartões e a vitrine, para que o Google leia esse conteúdo.
2. Rode `python ferramentas/gerar_publicacao.py`. Ele monta `publicacao/.htaccess` e `publicacao/WEBSITE/`, só com o que deve ir ao ar: sem README, ferramentas, página de teste, `.git` nem imagens originais pesadas.

**Primeira publicação** (use FTPS ou SFTP sempre que a hospedagem oferecer)

3. Envie a pasta `publicacao/WEBSITE/` para a raiz. O WordPress continua no ar.
4. Teste o site novo em `https://radcom.ind.br/WEBSITE/`. Até aqui, nada mudou para os visitantes.
5. Baixe o `.htaccess` atual da raiz e guarde-o como `htaccess-wordpress.txt`. Leia o aviso no topo do nosso `.htaccess`.
6. Envie `publicacao/.htaccess` para a raiz. **Neste momento o site novo entra no ar.**
7. Teste: `https://radcom.ind.br/`, `/hidro/`, `/hidro` (sem barra, deve ganhar a barra), `/quem-somos/` (deve ir para a home), `/WEBSITE/` (deve ir para `/`), `/qualquer-coisa` (página 404) e os outros projetos da raiz.

**Voltar ao WordPress (rollback):** reenvie `htaccess-wordpress.txt` para a raiz com o nome `.htaccess`. A pasta `WEBSITE/` pode ficar onde está.

**Atualizar o site:** rode os passos 1 e 2 e envie só a pasta `WEBSITE/`. O `.htaccess` só precisa ser reenviado se mudar.

**Depois de algumas semanas estável:** remova o WordPress do servidor ou mova-o para fora da pasta pública. Enquanto ele estiver lá, `/wp-login.php` continua acessível, e WordPress sem atualização é alvo comum de ataques.

## SEO

- Cada página tem título, descrição, `canonical`, Open Graph e dados estruturados (JSON-LD) no `<head>`. O domínio `https://radcom.ind.br/` está escrito nesses pontos, em `robots.txt` e em `sitemap.xml`.
- O `.htaccess` redireciona (301) as páginas do WordPress antigo para as novas, para manter o histórico de busca.
- Ao criar uma página nova (ex.: `usina/`), copie e adapte o bloco SEO do `<head>` da Hidro, acrescente a página em `sitemap.xml` e adicione um `RewriteRule` se ela substituir algum endereço antigo.
- Depois de publicar, no [Google Search Console](https://search.google.com/search-console): envie `https://radcom.ind.br/sitemap.xml` e peça a indexação de `/` e `/hidro/`.

## Página de teste: propostas de chamada final

`actioncall/index.html` mostra três opções para a faixa de contato do fim da Hidro. É só para escolha: tem `noindex` e fica fora da publicação.

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
| `fundo.webp` (abertura Hidro) | `fundo.PNG`        |
| `instalacao.webp`             | `instalacao.png`   |
| `painel2.webp`                | `painel2.png`      |

Ao trocar uma delas, salve direto como `.webp` (cerca de 1920 px de largura para o fundo e 1000 a 1200 px para as outras).

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

/* =====================================================================
   DADOS DAS LINHAS E DOS PRODUTOS
   Para editar textos, imagens ou ativar uma linha, mexa só neste arquivo.
   Caminhos de imagem são relativos à raiz do site (pasta Radcom_Projeto_Website).
   ===================================================================== */

/* -------- LINHAS (cartões da página inicial) --------
   ativa: true  -> o cartão ganha descrição e o botão "Explorar linha" para `url`.
   ativa: false -> o cartão mostra só o nome, sem botão e sem link.
   Para lançar Usina ou Irrigação: crie a pasta (ex.: usina/index.html),
   preencha `descricao` e `url` e troque `ativa` para true. */
window.RADCOM_LINHAS = [
  {
    id: "hidro",
    nome: "RadCom Hidro",
    icone: "gota",
    ativa: true,
    descricao: "Monitoramento e controle de reservatórios.",
    url: "hidro/index.html"   /* "index.html" explícito: funciona abrindo do disco e publicado */
  },
  {
    id: "usina",
    nome: "Usina",
    icone: "usina",
    ativa: false,
    descricao: "",
    url: ""
  },
  {
    id: "irrigacao",
    nome: "Irrigação",
    icone: "irrigacao",
    ativa: false,
    descricao: "",
    url: ""
  }
];

/* -------- PRODUTOS DA LINHA HIDRO --------
   categoria:  "poco" | "reservatorio" | "gateway"   (usada nos filtros)
   conexao:    "integrada" -> sobe dados sozinho; "gateway" -> precisa de gateway;
               "nenhuma"   -> não sobe dados por conta própria.
   provisoria: true mostra a etiqueta "Foto ilustrativa" no cartão.
   relacionados: ids dos produtos com que ele se conecta.
   fluxos: diagramas do detalhe "Como usar?". Cada etapa é um nó;
           `via` é o rótulo da seta que leva ao nó seguinte. */
window.RADCOM_PRODUTOS = [
  {
    id: "poco",
    nome: "Poço",
    modelo: "RD-2E2S/WI-FI-PÇ",
    categoria: "poco",
    imagem: "img_radcom/poco.webp",
    chips: ["LoRa"],
    conexao: "nenhuma",
    resumo: "Fica junto à bomba e liga ou desliga conforme o nível enviado pelo reservatório.",
    lead: "Trabalha sempre vinculado a um reservatório: recebe por rádio LoRa o nível transmitido e decide quando ligar ou desligar a bomba.",
    fluxos: [
      { titulo: "Reservatório → Poço → Bomba",
        nos: [
          { produto: "reservatorio", via: "radio", rotulo: "Nível por rádio" },
          { produto: "poco", via: "comando", rotulo: "Liga / desliga" },
          { icone: "bomba", nome: "Bomba" }
        ] }
    ],
    texto: "A cada transmissão do reservatório, o poço compara o nível recebido com os limites configurados nele: o nível para ligar e o nível para desligar. Esse cruzamento faz o controle acontecer de forma automática.",
    nota: { titulo: "Cadastrado no reservatório:", texto: "depois de vinculado, o estado do poço (ligado ou desligado) também aparece na página de configuração do reservatório." },
    relacionados: ["reservatorio", "reservatorio-wifi", "reservatorio-4g", "gateway-wifi", "gateway-4g"]
  },
  {
    id: "reservatorio",
    nome: "Reservatório",
    modelo: "",          /* modelo a confirmar */
    categoria: "reservatorio",
    /* FOTO PROVISÓRIA: ainda não há foto do Reservatório LoRa.
       Quando chegar, salve como img_radcom/reservatorio_lora.png,
       troque o caminho abaixo e mude provisoria para false. */
    imagem: "img_radcom/reservatorio_comum.webp",
    provisoria: true,
    chips: ["LoRa", "Sonda hidrostática"],
    conexao: "gateway",
    resumo: "Mede o nível e aciona a bomba. Envia os dados à plataforma por um gateway Wi-Fi ou 4G.",
    lead: "Funciona sozinho: pode acionar a bomba pela própria saída. O poço é opcional, e para levar os dados à plataforma ele precisa de um gateway por perto.",
    fluxos: [
      { titulo: "Saída própria → Bomba",
        nos: [
          { produto: "reservatorio", via: "comando", rotulo: "Saída própria" },
          { icone: "bomba", nome: "Bomba" }
        ] },
      { titulo: "A cada transmissão, todos recebem",
        nos: [
          { produto: "reservatorio", via: "radio", rotulo: "Nível por rádio" },
          { produto: "poco", nome: "Poço (opcional)", via: "radio", rotulo: "Nível por rádio" },
          { icone: "gateway", nome: "Gateway" }
        ] }
    ],
    texto: "Quando o reservatório transmite o nível, o gateway (Wi-Fi ou 4G) e o poço, se houver, recebem a mesma mensagem. O gateway publica o dado na plataforma e o poço decide sobre a bomba.",
    nota: { titulo: "Sem gateway, os dados não sobem:", texto: "o controle da bomba continua normal, mas a leitura não chega à plataforma." },
    relacionados: ["poco", "gateway-wifi", "gateway-4g"]
  },
  {
    id: "reservatorio-wifi",
    nome: "Reservatório Wi-Fi",
    modelo: "RD-2E2S/WI-FI-RS",
    categoria: "reservatorio",
    imagem: "img_radcom/reservatorio_comum.webp",
    chips: ["LoRa", "Wi-Fi", "Sonda hidrostática"],
    conexao: "integrada",
    resumo: "Mede o nível e se conecta à plataforma pelo Wi-Fi local, sem gateway.",
    lead: "Segue a lógica do Reservatório, mas leva os dados à plataforma pela rede Wi-Fi do local.",
    fluxos: [
      { titulo: "Saída própria → Bomba",
        nos: [
          { produto: "reservatorio-wifi", via: "comando", rotulo: "Saída própria" },
          { icone: "bomba", nome: "Bomba" }
        ] },
      { titulo: "Poço à parte (opcional)",
        nos: [
          { produto: "reservatorio-wifi", via: "radio", rotulo: "Nível por rádio" },
          { produto: "poco", nome: "Poço (opcional)" }
        ] },
      { titulo: "Conexão direta com a plataforma",
        nos: [
          { produto: "reservatorio-wifi", via: "wifi", rotulo: "Wi-Fi local" },
          { icone: "plataforma", nome: "Plataforma" }
        ] }
    ],
    texto: "Pode acionar a bomba pela própria saída ou comandar um poço à parte por rádio. Não depende de gateway: conecta-se à internet pelo Wi-Fi do local e envia os dados direto para a plataforma.",
    nota: { titulo: "Onde instalar:", texto: "em qualquer ponto com rede Wi-Fi disponível." },
    relacionados: ["poco"]
  },
  {
    id: "reservatorio-4g",
    nome: "Reservatório 4G",
    modelo: "RD-2E2S/4G-RS",
    categoria: "reservatorio",
    imagem: "img_radcom/reservatorio_4g.webp",
    chips: ["LoRa", "4G", "Sonda hidrostática"],
    conexao: "integrada",
    resumo: "Mede o nível e se conecta à plataforma pela rede celular, sem gateway.",
    lead: "Segue a lógica do Reservatório, mas ele mesmo se conecta à plataforma por modem 4G.",
    fluxos: [
      { titulo: "Saída própria → Bomba",
        nos: [
          { produto: "reservatorio-4g", via: "comando", rotulo: "Saída própria" },
          { icone: "bomba", nome: "Bomba" }
        ] },
      { titulo: "Poço à parte (opcional)",
        nos: [
          { produto: "reservatorio-4g", via: "radio", rotulo: "Nível por rádio" },
          { produto: "poco", nome: "Poço (opcional)" }
        ] },
      { titulo: "Conexão direta com a plataforma",
        nos: [
          { produto: "reservatorio-4g", via: "4g", rotulo: "Modem 4G" },
          { icone: "plataforma", nome: "Plataforma" }
        ] }
    ],
    texto: "Pode acionar a bomba pela própria saída ou comandar um poço à parte por rádio. Em vez de depender de um gateway, conecta-se à plataforma pela rede celular.",
    nota: { titulo: "Onde instalar:", texto: "por não depender de Wi-Fi, atende locais remotos, sem internet no ponto." },
    relacionados: ["poco"]
  },
  {
    id: "gateway-wifi",
    nome: "Gateway Wi-Fi",
    modelo: "RD-GT/WI-FI",
    categoria: "gateway",
    imagem: "img_radcom/gateway_wifi.webp",
    chips: ["LoRa", "Wi-Fi"],
    conexao: "integrada",
    resumo: "Leva os módulos LoRa à internet pelo Wi-Fi local.",
    lead: "Nele você cadastra grupos de equipamentos, com quantos reservatórios e poços forem necessários, e acompanha o estado de todos em um só lugar.",
    fluxos: [
      { titulo: "Consulta o estado periodicamente",
        nos: [
          { produto: "gateway-wifi", via: "relogio", rotulo: "Intervalo configurável" },
          { icone: "grupo", nome: "Reservatórios e poços cadastrados" }
        ] },
      { titulo: "Envia os dados",
        nos: [
          { produto: "gateway-wifi", via: "wifi", rotulo: "Wi-Fi local" },
          { icone: "plataforma", nome: "Plataforma" }
        ] }
    ],
    texto: "Depois de cadastrado o grupo, o gateway consulta por rádio o estado de cada reservatório e poço vinculado, no intervalo configurado, e envia as respostas à plataforma pelo Wi-Fi do local.",
    nota: null,
    relacionados: ["reservatorio", "poco"]
  },
  {
    id: "gateway-4g",
    nome: "Gateway 4G",
    modelo: "RD-GT/4G",
    categoria: "gateway",
    imagem: "img_radcom/gateway_4g.webp",
    chips: ["LoRa", "4G"],
    conexao: "integrada",
    resumo: "Leva os módulos LoRa à internet pela rede celular.",
    lead: "Funciona como o Gateway Wi-Fi, mas envia os dados pela rede celular, sem depender de Wi-Fi local.",
    fluxos: [
      { titulo: "Consulta o estado periodicamente",
        nos: [
          { produto: "gateway-4g", via: "relogio", rotulo: "Intervalo configurável" },
          { icone: "grupo", nome: "Reservatórios e poços cadastrados" }
        ] },
      { titulo: "Envia os dados",
        nos: [
          { produto: "gateway-4g", via: "4g", rotulo: "Modem 4G" },
          { icone: "plataforma", nome: "Plataforma" }
        ] }
    ],
    texto: "Depois de cadastrado o grupo, o gateway consulta por rádio o estado de cada reservatório e poço vinculado e envia as respostas à plataforma pela rede celular. Indicado onde não há Wi-Fi.",
    nota: null,
    relacionados: ["reservatorio", "poco"]
  }
];

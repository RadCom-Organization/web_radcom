/* =====================================================================
   RADCOM — comportamento compartilhado
   Usa os dados de config.js e data.js (carregados antes deste arquivo).
   Funciona abrindo o index.html direto do disco: não usa fetch nem módulos.
   ===================================================================== */
(function () {
  "use strict";

  var ROOT = document.body.getAttribute("data-root") || "";
  var CONFIG = window.RADCOM_CONFIG || { contato: {} };
  var LINHAS = window.RADCOM_LINHAS || [];
  var PRODUTOS = window.RADCOM_PRODUTOS || [];

  /* ---------------- Ícones (SVG em linha) ---------------- */
  var S = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var ICONS = {
    gota: `${S}<path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11Z"/><path d="M9.5 15a2.6 2.6 0 0 0 2.5 2.4"/></svg>`,
    usina: `${S}<path d="M3 20h18"/><path d="M4 20V11l5 3v-3l5 3v-3l5 3v6"/><path d="M17 8V4h2v6"/><path d="M8 17h1M12 17h1M16 17h1"/></svg>`,
    irrigacao: `${S}<path d="M12 21v-9"/><path d="M12 12c0-4-3-6.5-7-7"/><path d="M12 12c0-4 3-6.5 7-7"/><path d="M4 9.5v1M7 7.5v1M17 7.5v1M20 9.5v1"/><path d="M8 21h8"/></svg>`,
    seta: `${S}<path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
    externo: `${S}<path d="M7 17 17 7M9 7h8v8"/></svg>`,
    radio: `${S}<circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><path d="M8.8 15.2a4.5 4.5 0 0 1 0-6.4M15.2 15.2a4.5 4.5 0 0 0 0-6.4M6 18a8.5 8.5 0 0 1 0-12M18 18a8.5 8.5 0 0 0 0-12"/></svg>`,
    comando: `${S}<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>`,
    wifi: `${S}<path d="M4 8.5a12 12 0 0 1 16 0M7 12a8 8 0 0 1 10 0M10 15.5a4 4 0 0 1 4 0"/><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none"/></svg>`,
    "4g": `${S}<path d="M4 18v-4M9.3 18v-8M14.6 18V6M20 18V3"/></svg>`,
    relogio: `${S}<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`,
    gateway: `${S}<rect x="4" y="9" width="16" height="7" rx="1.5"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/><circle cx="9" cy="12.5" r=".8" fill="currentColor" stroke="none"/><circle cx="12" cy="12.5" r=".8" fill="currentColor" stroke="none"/></svg>`,
    plataforma: `${S}<rect x="4" y="4" width="16" height="6" rx="1.5"/><rect x="4" y="14" width="16" height="6" rx="1.5"/><circle cx="7.5" cy="7" r=".8" fill="currentColor" stroke="none"/><circle cx="7.5" cy="17" r=".8" fill="currentColor" stroke="none"/></svg>`,
    grupo: `${S}<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/></svg>`,
    fechar: `${S}<path d="M6 6l12 12M18 6 6 18"/></svg>`
  };

  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function byId(id) {
    for (var i = 0; i < PRODUTOS.length; i++) if (PRODUTOS[i].id === id) return PRODUTOS[i];
    return null;
  }

  /* ---------------- Contato (configurável) ---------------- */
  function contactLinks() {
    var c = CONFIG.contato || {};
    var out = [];
    if (c.whatsapp) out.push({ href: `https://wa.me/${String(c.whatsapp).replace(/\D/g, "")}`, label: "WhatsApp", externo: true });
    if (c.telefone) out.push({ href: `tel:${String(c.telefone).replace(/[^\d+]/g, "")}`, label: c.telefone });
    if (c.email) out.push({ href: `mailto:${c.email}`, label: c.email });
    return out;
  }
  function setupContact() {
    var links = contactLinks();
    var slots = document.querySelectorAll("[data-contact-slot]");
    // botão flutuante e botão "Contato": sempre visíveis; recebem o número quando preenchido
    var wa = String((CONFIG.contato || {}).whatsapp || "").replace(/\D/g, "");
    if (wa) document.querySelectorAll("[data-whatsapp]").forEach(function (a) { a.href = `https://wa.me/${wa}`; });
    if (!links.length) return; // sem contato confirmado: tudo continua escondido
    slots.forEach(function (el) { el.hidden = false; });
    document.querySelectorAll("[data-contact-primary]").forEach(function (a) {
      a.href = links[0].href;
      if (links[0].externo) { a.target = "_blank"; a.rel = "noopener"; }
    });
    document.querySelectorAll("[data-contact-list]").forEach(function (wrap) {
      wrap.innerHTML = links.map(function (l, i) {
        return `<a class="btn ${i === 0 ? "btn-dark" : "btn-ghost-dark"}" href="${esc(l.href)}"${l.externo ? ' target="_blank" rel="noopener"' : ""}>${esc(l.label)}</a>`;
      }).join("");
    });
  }

  /* ---------------- Início: cartões das linhas ---------------- */
  function renderLines() {
    var list = document.getElementById("lines-list");
    if (!list) return;
    list.innerHTML = LINHAS.map(function (l, i) {
      var n = String(i + 1).padStart(2, "0");
      var body = l.ativa
        ? `<p>${esc(l.descricao)}</p><a class="btn btn-dark" href="${esc(`${ROOT}${l.url}`)}">Explorar linha ${ICONS.seta}</a>`
        : '<p class="line-meta">Linha RadCom</p>';
      return `<li><article class="line-card${l.ativa ? " is-active" : ""}" aria-labelledby="linha-${esc(l.id)}"><div class="line-top"><span class="line-icon">${ICONS[l.icone] || ""}</span><span class="line-num">LINHA ${n}</span></div><h3 id="linha-${esc(l.id)}">${esc(l.nome)}</h3>${body}</article></li>`;
    }).join("");
  }

  /* ---------------- Hidro: vitrine ---------------- */
  var CONEXAO = {
    integrada: { cls: "", txt: "Conexão integrada à plataforma" },
    gateway: { cls: "needs-gateway", txt: "Usa gateway para a plataforma" },
    nenhuma: { cls: "no-upload", txt: "Vinculado a um reservatório" }
  };
  function renderCatalog() {
    var list = document.getElementById("products-list");
    if (!list) return;
    list.innerHTML = PRODUTOS.map(function (p) {
      var con = CONEXAO[p.conexao] || CONEXAO.integrada;
      return `<li data-categoria="${esc(p.categoria)}"><article class="product-card" aria-labelledby="prod-${esc(p.id)}"><div class="product-media"><img src="${esc(`${ROOT}${p.imagem}`)}" alt="Módulo ${esc(p.nome)} RadCom" width="1409" height="2659" loading="lazy">${p.provisoria ? '<span class="photo-tag">Foto ilustrativa</span>' : ""}</div><div class="product-body"><div class="chip-row">${p.chips.map(function (c) { return `<span class="chip">${esc(c)}</span>`; }).join("")}</div><h3 id="prod-${esc(p.id)}">${esc(p.nome)}</h3>${p.modelo ? `<p class="model">${esc(p.modelo)}</p>` : ""}<p>${esc(p.resumo)}</p><span class="conn-badge ${con.cls}">${con.txt}</span><button class="btn-usecase" type="button" data-produto="${esc(p.id)}" aria-haspopup="dialog">Como usar? ${ICONS.seta}</button></div></article></li>`;
    }).join("");
  }

  function setupFilters() {
    var bar = document.getElementById("filters");
    var list = document.getElementById("products-list");
    var status = document.getElementById("filter-status");
    if (!bar || !list) return;
    bar.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      var f = btn.getAttribute("data-filter");
      bar.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      var shown = 0;
      list.querySelectorAll("li").forEach(function (li) {
        var ok = f === "todos" || li.getAttribute("data-categoria") === f;
        li.hidden = !ok;
        if (ok) shown++;
      });
      if (status) status.textContent = `${shown}${shown === 1 ? " equipamento exibido" : " equipamentos exibidos"}`;
    });
  }

  /* ---------------- Hidro: detalhe "Como usar?" ---------------- */
  function nodeHtml(n) {
    var media, nome;
    if (n.produto) {
      var p = byId(n.produto);
      media = `<img src="${esc(`${ROOT}${p.imagem}`)}" alt="">`;
      nome = n.nome || p.nome;
    } else if (n.icone === "bomba") {
      media = `<span class="node-icon"><img src="${esc(`${ROOT}img_radcom/electric-motor.png`)}" alt=""></span>`;
      nome = n.nome;
    } else {
      media = `<span class="node-icon">${ICONS[n.icone] || ""}</span>`;
      nome = n.nome;
    }
    return `<li class="mini-node">${media}<span>${esc(nome)}</span></li>${n.via ? `<li class="mini-link">${ICONS[n.via] || ""}<span class="arrow">${ICONS.seta}</span><small>${esc(n.rotulo)}</small></li>` : ""}`;
  }
  function dialogHtml(p) {
    var con = CONEXAO[p.conexao] || CONEXAO.integrada;
    var flows = p.fluxos.map(function (f) {
      return `<div class="flow-block"><p class="flow-label">${esc(f.titulo)}</p><ol class="mini-flow">${f.nos.map(nodeHtml).join("")}</ol></div>`;
    }).join("");
    var rel = (p.relacionados || []).map(byId).filter(Boolean);
    return `<div class="dialog-inner"><p class="dialog-eyebrow">RadCom Hidro${p.modelo ? ` · ${esc(p.modelo)}` : ""}</p><h2 id="dialog-title">${esc(p.nome)}: como funciona na prática</h2><p class="lead">${esc(p.lead)}</p><div class="dialog-tags">${p.chips.map(function (c) { return `<span class="chip">${esc(c)}</span>`; }).join("")}<span class="conn-badge ${con.cls}">${con.txt}</span></div>${flows}<p class="dialog-text">${esc(p.texto)}</p>${p.nota ? `<div class="dialog-note"><strong>${esc(p.nota.titulo)}</strong> ${esc(p.nota.texto)}</div>` : ""}${rel.length ? `<div class="related"><h3>Conecta-se com</h3><ul>${rel.map(function (r) {
        return `<li><button type="button" data-produto="${esc(r.id)}">${esc(r.nome)}</button></li>`;
      }).join("")}</ul></div>` : ""}</div>`;
  }
  function setupDialog() {
    var dlg = document.getElementById("product-dialog");
    if (!dlg) return;
    var content = document.getElementById("dialog-content");
    var opener = null;

    function open(id, trigger) {
      var p = byId(id);
      if (!p) return;
      content.innerHTML = dialogHtml(p);
      if (!dlg.open) {
        opener = trigger || document.activeElement;
        if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
        document.body.classList.add("dialog-open");
      }
      dlg.scrollTop = 0;
      var close = dlg.querySelector(".dialog-close");
      if (close) close.focus();
    }
    function close() {
      if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open");
    }
    dlg.addEventListener("close", function () {
      document.body.classList.remove("dialog-open");
      if (opener && opener.focus) opener.focus();
    });
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-produto]");
      if (btn) { open(btn.getAttribute("data-produto"), dlg.open ? opener : btn); return; }
      if (e.target.closest(".dialog-close")) close();
    });
    // clique fora do conteúdo (no fundo escurecido) fecha
    dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });
  }

  /* ---------------- Hidro: navegação local ativa ---------------- */
  function setupSubnav() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".subnav-links a[href^='#']"));
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
      var current = null;
      links.forEach(function (a) { var id = a.getAttribute("href").slice(1); if (visible[id] && !current) current = id; });
      links.forEach(function (a) {
        var on = a.getAttribute("href").slice(1) === current;
        a.classList.toggle("active", on);
        if (on) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------------- Ano no rodapé ---------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  setupContact();
  renderLines();
  renderCatalog();
  setupFilters();
  setupDialog();
  setupSubnav();
})();

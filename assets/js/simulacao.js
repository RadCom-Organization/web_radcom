/* =====================================================================
   DEMONSTRAÇÃO ILUSTRATIVA — nível do reservatório e acionamento da bomba
   Reaproveitada do projeto Jóia. Valores fictícios, só para explicar a lógica.
   ===================================================================== */
(function () {
  "use strict";
  var svg = document.getElementById("svg");
  if (!svg) return;

  /* ---------------- Geometria ---------------- */
  var TOP_PAD = 46;
  var VB_H = 400 + TOP_PAD;
  var groundY = 260 + TOP_PAD;
  const VB_W  = 420, HOUSE_X = 70, WELL_X = 160;
  var cx = 334, tankW = 128, tankX = cx - tankW / 2, tankY = 42 + TOP_PAD;
  var tankH = groundY - tankY, tankBottom = tankY + tankH, rx = tankW / 2, ry = 12;
  var gwAnt = { x: HOUSE_X -5, y: 130 + TOP_PAD }, wellAnt = { x: WELL_X + 10, y: 125 + TOP_PAD };
  var resAnt = { x: cx + rx - 8, y: 8 + TOP_PAD };
  var riserX = tankX - 20;
  var pipeEntryY = groundY - 30;
  var bodyH = tankH - 6;
  var pipePath = `M ${WELL_X} ${groundY + 30} L ${WELL_X} ${groundY - 12} L ${riserX} ${groundY - 12} L ${riserX} ${pipeEntryY} L ${tankX} ${pipeEntryY}`;
  var hopGw = `M ${resAnt.x} ${resAnt.y} Q ${(resAnt.x + gwAnt.x) / 2} ${resAnt.y - 30} ${gwAnt.x} ${gwAnt.y}`;
  var hopWell = `M ${resAnt.x} ${resAnt.y} Q ${(resAnt.x + wellAnt.x) / 2} ${resAnt.y + 10} ${wellAnt.x} ${wellAnt.y}`;
  var HOP_SECONDS = 1.4;
  var PUBLISH_SECONDS = 3.5;

  /* ---------------- Estado ---------------- */
  var cfg = { liga: 30, desliga: 90, consumo: 3, vazao: 7 };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var running = !reduce;
  var s;
  function initialState() {
    return { time: 0, level: 55, pumpOn: false, phase: "idle", signalType: null, phaseStart: 0, txValue: 0, cloudUntil: 0 };
  }
  s = initialState();

  function tick(dt) {
    s.time += dt;
    var rate = (s.pumpOn ? cfg.vazao : 0) - cfg.consumo;
    s.level = Math.min(100, Math.max(0, s.level + rate * dt));
    var elapsed = s.time - s.phaseStart;
    if (s.phase === "tx" && elapsed >= HOP_SECONDS) {
      s.pumpOn = s.signalType === "liga";
      s.phase = "idle";
      s.signalType = null;
      s.cloudUntil = s.time + PUBLISH_SECONDS;
    } else if (s.phase === "idle") {
      if (!s.pumpOn && s.level <= cfg.liga) startTx("liga");
      else if (s.pumpOn && s.level >= cfg.desliga) startTx("desliga");
    }
  }
  function startTx(type) {
    s.phase = "tx"; s.signalType = type; s.phaseStart = s.time; s.txValue = s.level;
  }

  /* ---------------- Render ---------------- */
  function ring(x, y, color) {
    return `<g class="ping-ring" style="transform-origin:${x}px ${y}px"><circle cx="${x}" cy="${y}" r="14" fill="none" stroke="${color}" stroke-width="2"/></g>`;
  }
  function packet(path, color, label) {
    return `<g><path d="${path}" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.7"/><g><circle r="6" fill="${color}"/><circle r="10" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.6"/><text y="-16" text-anchor="middle" font-size="10" font-weight="600" fill="${color}" font-family="var(--font-mono)">${label}</text><animateMotion dur="${HOP_SECONDS}s" path="${path}" fill="freeze"/></g></g>`;
  }
  
  function platformScreen(x, y) {
      return `<g transform="translate(${x} ${y})"><g class="cloud-publish">
    <text y="-8" text-anchor="middle" font-size="10" font-weight="700" font-family="var(--font-mono)" fill="var(--primary)" letter-spacing=".04em">✓ DADOS ENVIADOS À PLATAFORMA</text>
    <rect x="-82" y="0" width="164" height="104" rx="6" fill="var(--steel-dark)" stroke="var(--primary)" stroke-width="2"/>
    <image href="../img_radcom/plataforma-mini.jpg" x="-77" y="5" width="154" height="94" preserveAspectRatio="xMidYMid slice"/>
    <rect x="-12" y="104" width="24" height="8" fill="var(--steel-dark)"/>
    <rect x="-28" y="112" width="56" height="4" rx="2" fill="var(--steel-dark)"/></g></g>`;
  }

  // seta tracejada da antena do gateway até a tela da plataforma
    function uploadArrow(x, y1, y2) {
      return `<g class="cloud-publish">
    <line x1="${x}" y1="${y1}" x2="${x}" y2="${y2 + 6}" stroke="var(--primary)" stroke-width="2" stroke-dasharray="4 3"/>
    <path d="M ${x - 5} ${y2 + 8} L ${x} ${y2} L ${x + 5} ${y2 + 8}" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
    }

  function render() {
    var level = s.level, pumpOn = s.pumpOn, tx = s.phase === "tx";
    var publishing = s.time < s.cloudUntil;
    var waterH = bodyH * (level / 100);
    var waterY = tankBottom - 3 - waterH;
    var ligaY = tankBottom - 3 - bodyH * (cfg.liga / 100);
    var desligaY = tankBottom - 3 - bodyH * (cfg.desliga / 100);
    var sig = s.signalType === "liga" ? "var(--pump-on)" : "var(--destructive)";
    var txLabel = `${s.txValue.toFixed(0)}%`;
    var txPackets = tx ? [packet(hopGw, sig, txLabel), packet(hopWell, sig, txLabel)].join("") : "";
    var i, y, x;

    var ladder = [];
    for (i = 0; i < 14; i++) {
      y = tankY + 14 + i * ((groundY - 24 - tankY) / 14);
      ladder.push(`<line x1="${cx - 7}" y1="${y}" x2="${cx + 7}" y2="${y}" stroke="var(--steel)" stroke-width="1" opacity="0.7"/>`);
    }
    var rail = [];
    for (i = 0; i < 5; i++) {
      x = tankX + 6 + (i * (tankW - 12)) / 4;
      rail.push(`<line x1="${x}" y1="${tankY - 14}" x2="${x}" y2="${tankY - 2}" stroke="var(--steel)" stroke-width="1.5"/>`);
    }

    /* casa de bomba (gateway) */
    /* poço */
    /* reservatório */
    svg.innerHTML = `
      <defs>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--water)"/><stop offset="100%" stop-color="var(--water-deep)"/></linearGradient>
        <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--ground)"/><stop offset="100%" stop-color="var(--ground-deep)"/></linearGradient>
        <clipPath id="cupClip"><rect x="${tankX + 3}" y="${tankY + 3}" width="${tankW - 6}" height="${tankH - 6}"/></clipPath>
      </defs>
      <rect width="${VB_H}" height="${VB_H}" fill="var(--sky)"/>
      <rect y="${groundY}" width="${VB_H}" height="${VB_H - groundY}" fill="url(#groundGrad)"/>
      <line x1="0" y1="${groundY}" x2="${VB_H}" y2="${groundY}" stroke="var(--steel)" stroke-width="1.5"/>
      <path d="${pipePath}" fill="none" stroke="var(--steel-dark)" stroke-width="10" stroke-linejoin="round"/>
      <path d="${pipePath}" fill="none" stroke="${pumpOn ? "var(--water)" : "var(--steel)"}" stroke-width="4" stroke-linejoin="round" stroke-dasharray="${pumpOn ? "12 12" : "0"}" class="${pumpOn ? "flow" : ""}"/>

      <g>
        <polygon points="${HOUSE_X - 50},${groundY - 60} ${HOUSE_X},${groundY - 95} ${HOUSE_X + 50},${groundY - 60}" fill="var(--steel-dark)" stroke="var(--steel)"/>
        <rect x="${HOUSE_X - 45}" y="${groundY - 60}" width="90" height="60" fill="var(--card)" stroke="var(--steel)" stroke-width="1.5"/>
        <rect x="${HOUSE_X - 12}" y="${groundY - 35}" width="24" height="35" fill="var(--sky)" stroke="var(--steel)"/>
        <rect x="${HOUSE_X - 35}" y="${groundY - 50}" width="14" height="12" fill="${tx ? "var(--signal)" : "var(--sky)"}" stroke="var(--steel)"/>
        <line x1="${gwAnt.x}" y1="${gwAnt.y}" x2="${gwAnt.x}" y2="${groundY - 95}" stroke="var(--steel)" stroke-width="2.5"/>
        <line x1="${gwAnt.x - 12}" y1="${gwAnt.y + 14}" x2="${gwAnt.x + 12}" y2="${gwAnt.y + 14}" stroke="var(--steel)" stroke-width="2"/>
        <line x1="${gwAnt.x - 8}" y1="${gwAnt.y + 28}" x2="${gwAnt.x + 8}" y2="${gwAnt.y + 28}" stroke="var(--steel)" stroke-width="2"/>
        <circle cx="${gwAnt.x}" cy="${gwAnt.y}" r="4" fill="var(--signal)" class="${tx ? "blink" : ""}"/>
        ${tx ? ring(gwAnt.x, gwAnt.y, sig) : ""}
        ${publishing ? platformScreen(HOUSE_X + 22, 26) + uploadArrow(gwAnt.x, gwAnt.y - 8, 146) : ""}
        <text class="lbl-title" x="${HOUSE_X}" y="${groundY + 22}" text-anchor="middle" font-size="13" fill="var(--foreground)">CASA DE BOMBA</text>
        <text class="lbl-sub" x="${HOUSE_X}" y="${groundY + 39}" text-anchor="middle" font-size="11" fill="var(--signal-deep)">GATEWAY WI-FI OU 4G</text>
      </g>

      <g>
        <rect x="${WELL_X - 20}" y="${groundY}" width="40" height="90" fill="var(--sky)" stroke="var(--steel)" stroke-width="2"/>
        <rect x="${WELL_X - 18}" y="${groundY + 40}" width="36" height="48" fill="url(#waterGrad)" opacity="0.8"/>
        <rect x="${WELL_X - 12}" y="${groundY + 45}" width="24" height="38" rx="3" fill="${pumpOn ? "var(--pump-on)" : "var(--pump-off)"}" stroke="var(--steel)"/>
        <circle cx="${WELL_X}" cy="${groundY + 64}" r="6" fill="var(--sky)" class="${pumpOn ? "blink" : ""}"/>
        <rect x="${WELL_X - 30}" y="${groundY - 18}" width="60" height="18" rx="2" fill="var(--steel-dark)" stroke="var(--steel)"/>
        <rect x="${WELL_X - 18}" y="${groundY - 78}" width="36" height="60" rx="2" fill="var(--card)" stroke="var(--steel)"/>
        <circle cx="${WELL_X}" cy="${groundY - 58}" r="5" fill="${pumpOn ? "var(--pump-on)" : "var(--destructive)"}"/>
        <line x1="${wellAnt.x}" y1="${wellAnt.y}" x2="${wellAnt.x}" y2="${groundY - 78}" stroke="var(--steel)" stroke-width="2"/>
        <circle cx="${wellAnt.x}" cy="${wellAnt.y}" r="3" fill="var(--signal)"/>
        ${tx ? ring(wellAnt.x, wellAnt.y, sig) : ""}
        <text class="lbl-title" x="${WELL_X}" y="${groundY + 112}" text-anchor="middle" font-size="13" fill="var(--foreground)">POÇO</text>
        <text class="lbl-sub" x="${WELL_X}" y="${groundY + 129}" text-anchor="middle" font-size="11" fill="${pumpOn ? "var(--pump-on-deep)" : "var(--muted-foreground)"}">${pumpOn ? "● BOMBA LIGADA" : "○ BOMBA DESLIGADA"}</text>
      </g>

      <g>
        <ellipse cx="${cx}" cy="${tankBottom}" rx="${rx}" ry="${ry}" fill="var(--steel-dark)" stroke="var(--steel)" stroke-width="1.5"/>
        <rect x="${tankX}" y="${tankY}" width="${tankW}" height="${tankH}" fill="var(--sky)" stroke="var(--steel)" stroke-width="2.5"/>
        <g clip-path="url(#cupClip)">
          <rect x="${tankX + 3}" y="${waterY}" width="${tankW - 6}" height="${waterH + 20}" fill="url(#waterGrad)"/>
          <line x1="${tankX + 3}" y1="${waterY}" x2="${tankX + tankW - 3}" y2="${waterY}" stroke="var(--water)" stroke-width="2" opacity="0.9"/>
          <line x1="${tankX}" y1="${ligaY}" x2="${tankX + tankW}" y2="${ligaY}" stroke="var(--destructive)" stroke-width="1.5" stroke-dasharray="5 4"/>
          <line x1="${tankX}" y1="${desligaY}" x2="${tankX + tankW}" y2="${desligaY}" stroke="var(--pump-on)" stroke-width="1.5" stroke-dasharray="5 4"/>
        </g>
        <ellipse cx="${cx}" cy="${tankY}" rx="${rx}" ry="${ry}" fill="var(--card)" stroke="var(--steel)" stroke-width="2.5"/>
        <line x1="${tankX + 6}" y1="${tankY - 14}" x2="${tankX + tankW - 6}" y2="${tankY - 14}" stroke="var(--steel)" stroke-width="1.5"/>
        ${rail.join("")}
        <line x1="${cx - 7}" y1="${tankY + 6}" x2="${cx - 7}" y2="${groundY - 12}" stroke="var(--steel)" stroke-width="1.2" opacity="0.8"/>
        <line x1="${cx + 7}" y1="${tankY + 6}" x2="${cx + 7}" y2="${groundY - 12}" stroke="var(--steel)" stroke-width="1.2" opacity="0.8"/>
        ${ladder.join("")}
        <text class="lbl-sub" x="${tankX - 8}" y="${ligaY + 4}" text-anchor="end" font-size="10" fill="var(--destructive-deep)">LIGA ${cfg.liga}%</text>
        <text class="lbl-sub" x="${tankX - 8}" y="${desligaY + 4}" text-anchor="end" font-size="10" fill="var(--pump-on-deep)">DESL. ${cfg.desliga}%</text>
        <text id="level-label" class="lbl-title" x="${cx}" y="${resAnt.y - 24}" text-anchor="middle" font-size="18" fill="var(--foreground)">Nível: ${level.toFixed(0)}%</text>
        <line x1="${resAnt.x}" y1="${resAnt.y}" x2="${resAnt.x}" y2="${tankY}" stroke="var(--steel)" stroke-width="2"/>
        <circle cx="${resAnt.x}" cy="${resAnt.y}" r="3" fill="var(--signal)"/>
        ${tx ? ring(resAnt.x, resAnt.y, sig) : ""}
        <text class="lbl-title" x="${cx}" y="${groundY + 34}" text-anchor="middle" font-size="13" fill="var(--foreground)">RESERVATÓRIO</text>
        <text class="lbl-sub" x="${cx}" y="${groundY + 51}" text-anchor="middle" font-size="11" fill="var(--water-deep)">SONDA DE NÍVEL</text>
      </g>
      ${txPackets}
    `;
  }

  /* ---------------- Controles ---------------- */
  var inputs = {
    liga: document.getElementById("liga"),
    desliga: document.getElementById("desliga"),
    consumo: document.getElementById("consumo"),
    vazao: document.getElementById("vazao")
  };
  function syncLabels() {
    for (var k in inputs) {
      inputs[k].value = cfg[k];
      inputs[k].setAttribute("aria-valuetext", `${cfg[k]}${k === "liga" || k === "desliga" ? "%" : "% por segundo"}`);
      document.getElementById(`v-${k}`).textContent = cfg[k];
    }
  }
  inputs.liga.addEventListener("input", function (e) { cfg.liga = Math.min(+e.target.value, cfg.desliga - 5); syncLabels(); render(); });
  inputs.desliga.addEventListener("input", function (e) { cfg.desliga = Math.max(+e.target.value, cfg.liga + 5); syncLabels(); render(); });
  inputs.consumo.addEventListener("input", function (e) { cfg.consumo = +e.target.value; syncLabels(); });
  inputs.vazao.addEventListener("input", function (e) { cfg.vazao = +e.target.value; syncLabels(); });

  var toggleBtn = document.getElementById("toggle");
  function syncToggle() {
    toggleBtn.textContent = running ? "Pausar" : "Iniciar";
    toggleBtn.setAttribute("aria-pressed", running ? "false" : "true");
  }
  toggleBtn.addEventListener("click", function () { running = !running; syncToggle(); });
  document.getElementById("reset").addEventListener("click", function () { s = initialState(); render(); });

  /* ---------------- Loop ---------------- */
  var lastPhaseStart = -1;
  setInterval(function () {
    if (!running) return;
    var before = s.phase;
    tick(0.1);
    if (s.phase === "tx" && (before !== "tx" || s.phaseStart !== lastPhaseStart)) {
      lastPhaseStart = s.phaseStart;
      render();
    } else if (before === "tx" && s.phase !== "tx") {
      render();
    } else {
      updateDynamic();
    }
  }, 100);

  function updateDynamic() {
    var txt = document.getElementById("level-label");
    if (!txt) return render();
    txt.textContent = `Nível: ${s.level.toFixed(0)}%`;
    var waterH = bodyH * (s.level / 100);
    var waterY = tankBottom - 3 - waterH;
    var waterRect = svg.querySelector("g[clip-path] rect");
    if (waterRect) { waterRect.setAttribute("y", waterY); waterRect.setAttribute("height", waterH + 20); }
    var waterLine = svg.querySelector("g[clip-path] line");
    if (waterLine) { waterLine.setAttribute("y1", waterY); waterLine.setAttribute("y2", waterY); }
    if (s.phase === "idle" && svg.querySelector("animateMotion")) render();
  }

  syncLabels();
  syncToggle();
  render();
})();

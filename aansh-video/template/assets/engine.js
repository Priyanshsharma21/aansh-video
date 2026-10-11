/* aansh-video starter engine — a canvas video is a pure function of time t.
   Never use Math.random() or Date.now(): use hash()/noise() so every render is identical. */
(function () {
  const W = 1920, H = 1080;

  // ---------- math ----------
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const prog = (t, a, b) => clamp((t - a) / (b - a));             // 0→1 between a and b
  const easeOut = (u) => 1 - Math.pow(1 - u, 3);
  const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
  const backOut = (u) => { const c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const noise = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u); };

  // ---------- drawing ----------
  function rr(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  // text(ctx, "hello", x, y, {size, weight, font, color, align, max})
  function text(ctx, s, x, y, o = {}) {
    const size = o.size || 48;
    ctx.font = `${o.weight || 700} ${size}px ${o.font || "Inter, system-ui, sans-serif"}`;
    ctx.fillStyle = o.color || "#1B1B22"; ctx.textAlign = o.align || "center"; ctx.textBaseline = "middle";
    if (!o.max) { ctx.fillText(s, x, y); return; }
    const words = String(s).split(" "), lines = []; let cur = "";   // simple word wrap
    for (const w of words) { const t2 = cur ? cur + " " + w : w; if (ctx.measureText(t2).width > o.max && cur) { lines.push(cur); cur = w; } else cur = t2; }
    lines.push(cur);
    const lh = size * 1.2, y0 = y - ((lines.length - 1) * lh) / 2;
    lines.forEach((l, i) => ctx.fillText(l, x, y0 + i * lh));
  }
  // pop-in scale around (x,y): call inside save/restore
  function pop(ctx, t, start, x, y, dur = 0.45) {
    const u = prog(t, start, start + dur), s = u <= 0 ? 0.001 : backOut(u);
    ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-x, -y);
    ctx.globalAlpha *= clamp(u * 3);
  }
  // card with shadow
  function card(ctx, x, y, w, h, fill = "#FFFFFF", r = 28) {
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.18)"; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    ctx.fillStyle = fill; rr(ctx, x, y, w, h, r); ctx.fill(); ctx.restore();
  }
  function paperBg(ctx, t, top = "#FBF4E8", bottom = "#F1E6D3") {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bottom);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(0,0,0,0.035)";
    for (let i = 0; i < 160; i++) ctx.fillRect(hash(i) * W, hash(i + 99) * H, 3, 3);   // fixed paper specks
  }

  // ---------- audio-driven data (optional files: words.js, mouth.js) ----------
  const WORDS = () => window.WORDS || [];
  function mouthAt(t) {
    const M = window.MOUTH, fps = window.MOUTH_FPS || 30;
    if (!M || !M.length) return 0;
    const f = t * fps, i = Math.floor(f);
    return lerp(M[clamp(i, 0, M.length - 1)] || 0, M[clamp(i + 1, 0, M.length - 1)] || 0, f - i);
  }

  // ---------- a simple generic host (replace with your own character) ----------
  function host(ctx, t, x, y, s = 1, o = {}) {
    const skin = o.skin || "#C98E64", shirt = o.shirt || "#2E5BBA", hair = o.hair || "#1C1716";
    const m = mouthAt(t), blink = (t % 4.1) < 0.12 ? 0.1 : 1, bob = Math.sin(t * 1.6) * 3;
    ctx.save(); ctx.translate(x, y + bob); ctx.scale(s, s);
    ctx.fillStyle = shirt; rr(ctx, -170, 150, 340, 260, 120); ctx.fill();                    // body
    ctx.fillStyle = skin; rr(ctx, -34, 100, 68, 70, 20); ctx.fill();                         // neck
    ctx.beginPath(); ctx.ellipse(0, 0, 110, 135, 0, 0, Math.PI * 2); ctx.fill();               // head
    ctx.fillStyle = hair; ctx.beginPath(); ctx.ellipse(0, -80, 112, 70, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";                                                                    // eyes
    for (const d of [-40, 40]) { ctx.beginPath(); ctx.ellipse(d, -10, 17, 13 * blink, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = "#222";
    for (const d of [-40, 40]) { ctx.beginPath(); ctx.arc(d + 2, -9, 7 * blink + 0.5, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = hair; ctx.lineWidth = 8; ctx.lineCap = "round";                          // brows
    for (const d of [-40, 40]) { ctx.beginPath(); ctx.moveTo(d - 20, -40 - m * 6); ctx.lineTo(d + 20, -42 - m * 6); ctx.stroke(); }
    ctx.fillStyle = "#6B2A2A";                                                                 // mouth opens with the voice
    ctx.beginPath(); ctx.ellipse(0, 62, 34, 6 + m * 22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // ---------- word-by-word captions ----------
  function captions(ctx, t, o = {}) {
    const ws = WORDS(); if (!ws.length) return;
    let k = ws.findIndex((w) => t >= w.s && t < w.e + 0.25);
    if (k < 0) return;
    const per = o.per || 4, g0 = Math.floor(k / per) * per, group = ws.slice(g0, g0 + per);
    const size = o.size || 60, y = o.y || 985;
    ctx.font = `800 ${size}px ${o.font || "Inter, system-ui, sans-serif"}`;
    const gap = size * 0.3, widths = group.map((w) => ctx.measureText(w.w).width);
    let x = W / 2 - (widths.reduce((a, b) => a + b, 0) + gap * (group.length - 1)) / 2;
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    group.forEach((w, i) => {
      const on = g0 + i === k;
      if (on) { ctx.fillStyle = o.hi || "#FFC531"; rr(ctx, x - 12, y - size * 0.62, widths[i] + 24, size * 1.24, 14); ctx.fill(); }
      ctx.lineWidth = 10; ctx.strokeStyle = on ? "rgba(0,0,0,0)" : "#111"; ctx.strokeText(w.w, x, y);
      ctx.fillStyle = on ? "#111" : "#fff"; ctx.fillText(w.w, x, y);
      x += widths[i] + gap;
    });
  }

  // ---------- film runner: SHOTS = [[start, end, sceneFn], ...] ----------
  function makeFilm(DUR, SHOTS, overlay) {
    return {
      DUR,
      init() {},
      render(ctx, t) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, W, H);
        const shot = SHOTS.find((s) => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];
        ctx.save(); shot[2](ctx, t - shot[0], t, shot[1] - shot[0]); ctx.restore();
        const fade = 0.25, into = t - shot[0];                     // quick dip between shots
        if (into < fade && shot[0] > 0) { ctx.fillStyle = `rgba(0,0,0,${0.6 * (1 - into / fade)})`; ctx.fillRect(0, 0, W, H); }
        if (overlay) { ctx.save(); overlay(ctx, t); ctx.restore(); }
      },
    };
  }

  window.K = { W, H, clamp, lerp, prog, easeOut, easeInOut, backOut, hash, noise, rr, text, pop, card, paperBg, mouthAt, host, captions, makeFilm };
})();

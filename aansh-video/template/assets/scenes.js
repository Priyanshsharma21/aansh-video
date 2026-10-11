/* Demo film (12 s). Replace these scenes with your own story.
   Each scene gets (ctx, local time since the shot started, global time, shot length). */
(function () {
  const { W, H, prog, easeOut, lerp, text, pop, card, paperBg, host, captions, makeFilm } = window.K;

  function sIntro(ctx, lt, t) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#1E2A44"); g.addColorStop(1, "#0F1626");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    host(ctx, t, W / 2, 470, 1.1);
    ctx.save(); pop(ctx, lt, 0.4, 420, 300);
    card(ctx, 140, 230, 560, 140, "#FFC531"); text(ctx, "Your Show · Ep. 1", 420, 300, { size: 52, weight: 800 });
    ctx.restore();
  }

  function sStat(ctx, lt) {
    paperBg(ctx);
    text(ctx, "One number that matters", W / 2, 180, { size: 64, weight: 800 });
    ctx.save(); pop(ctx, lt, 0.3, W / 2, 520);
    card(ctx, W / 2 - 360, 360, 720, 320);
    const v = Math.round(lerp(0, 72, easeOut(prog(lt, 0.5, 2.2))));
    text(ctx, v + "%", W / 2, 490, { size: 160, weight: 900, color: "#2E5BBA" });
    text(ctx, "of viewers decide in 3 seconds", W / 2, 610, { size: 40, weight: 600, color: "#555" });
    ctx.restore();
  }

  function sList(ctx, lt) {
    paperBg(ctx, lt, "#EAF4EE", "#D7EBDF");
    text(ctx, "3 rules", W / 2, 170, { size: 72, weight: 900 });
    ["Hook in the first line", "One idea per scene", "Captions on every word"].forEach((s, i) => {
      const y = 330 + i * 170;
      ctx.save(); pop(ctx, lt, 0.4 + i * 0.6, W / 2, y + 60);
      card(ctx, W / 2 - 520, y, 1040, 120);
      ctx.fillStyle = "#2BA36A"; ctx.beginPath(); ctx.arc(W / 2 - 440, y + 60, 34, 0, Math.PI * 2); ctx.fill();
      text(ctx, "✓", W / 2 - 440, y + 62, { size: 44, color: "#fff" });
      text(ctx, s, W / 2 - 380, y + 60, { size: 48, align: "left" });
      ctx.restore();
    });
  }

  const SHOTS = [[0, 4, sIntro], [4, 8, sStat], [8, 12, sList]];
  window.FILM = makeFilm(12, SHOTS, (ctx, t) => captions(ctx, t));
})();

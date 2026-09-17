/* The sigil workshop: three methods of turning a sentence into a figure. */
(function () {
  "use strict";
  var L = window.L488;
  if (!L) return;
  var intent = document.getElementById("intent");
  if (!intent) return;

  var method = document.getElementById("method"),
      planet = document.getElementById("planet"),
      forge = document.getElementById("forge"),
      dl = document.getElementById("dlsigil"),
      steps = document.getElementById("steps"),
      out = document.getElementById("sigilout"),
      planetWrap = document.getElementById("planetwrap");

  var HI = window.HIERARCHIES || [];
  if (planet && HI.length) {
    planet.innerHTML = HI.map(function (h) {
      return '<option value="' + h.planet + '">' + h.glyph + "  " + h.planet +
        " (" + h.number + " x " + h.number + ")</option>";
    }).join("");
    planet.value = "Venus";
  }

  var VOWELS = "AEIOU";

  function reduce(text) {
    var up = String(text).toUpperCase().replace(/[^A-Z]/g, "");
    var noVowel = up.replace(/[AEIOU]/g, "");
    var seen = {}, kept = "";
    for (var i = 0; i < noVowel.length; i++) {
      if (!seen[noVowel[i]]) { seen[noVowel[i]] = 1; kept += noVowel[i]; }
    }
    if (kept.length < 3) {           /* a very short statement keeps its vowels */
      seen = {}; kept = "";
      for (i = 0; i < up.length; i++) if (!seen[up[i]]) { seen[up[i]] = 1; kept += up[i]; }
    }
    return { up: up, noVowel: noVowel, kept: kept };
  }

  function n(v) { return Math.round(v * 100) / 100; }
  function poly(pts) { return "M" + pts.map(function (p) { return n(p[0]) + " " + n(p[1]); }).join(" L"); }

  /* ---------- method one: the rose wheel of letters ---------- */
  function roseWheel(letters, seed) {
    var S = 480, c = S / 2, R = 186, rand = L.rng(seed);
    var o = '<svg viewBox="0 0 ' + S + ' ' + S + '" width="' + S + '" height="' + S +
      '" role="img" aria-label="Sigil drawn on the rose wheel">';
    o += '<circle cx="' + c + '" cy="' + c + '" r="' + (R + 42) + '" fill="none" stroke="' + L.GOLD + '" stroke-width="1.1" opacity=".7"/>';
    o += '<circle cx="' + c + '" cy="' + c + '" r="' + (R + 32) + '" fill="none" stroke="' + L.GOLD + '" stroke-width=".6" opacity=".4"/>';
    for (var i = 0; i < 26; i++) {
      var a = i * 360 / 26, p = L.pol(c, c, R + 12, a);
      var ch = String.fromCharCode(65 + i);
      var used = letters.indexOf(ch) >= 0;
      o += '<text x="' + n(p[0]) + '" y="' + n(p[1] + 6) + '" text-anchor="middle" font-family="serif" font-size="17" fill="' +
        (used ? L.GOLD_LIT : L.GOLD) + '" opacity="' + (used ? ".95" : ".38") + '">' + ch + "</text>";
      var t1 = L.pol(c, c, R - 4, a), t2 = L.pol(c, c, R - 12, a);
      o += '<line x1="' + n(t1[0]) + '" y1="' + n(t1[1]) + '" x2="' + n(t2[0]) + '" y2="' + n(t2[1]) +
        '" stroke="' + L.GOLD + '" stroke-width=".6" opacity=".3"/>';
    }
    [R - 12, (R - 12) * 0.76, (R - 12) * 0.52].forEach(function (r) {
      o += '<circle cx="' + c + '" cy="' + c + '" r="' + n(r) + '" fill="none" stroke="' + L.GOLD +
        '" stroke-width=".6" opacity=".3" stroke-dasharray="3 7"/>';
    });
    var pts = [];
    for (i = 0; i < letters.length; i++) {
      var idx = letters.charCodeAt(i) - 65;
      var ring = (R - 12) * [1, 0.76, 0.52][idx % 3];
      pts.push(L.pol(c, c, ring, idx * 360 / 26 + (rand() - 0.5) * 5));
    }
    if (pts.length === 1) pts.push([c, c]);
    o += '<path d="' + poly(pts) + '" fill="none" stroke="' + L.GOLD_LIT +
      '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>';
    o += '<circle cx="' + n(pts[0][0]) + '" cy="' + n(pts[0][1]) + '" r="7" fill="none" stroke="' + L.GOLD_LIT + '" stroke-width="1.8"/>';
    var e = pts[pts.length - 1];
    o += '<line x1="' + n(e[0] - 9) + '" y1="' + n(e[1] - 9) + '" x2="' + n(e[0] + 9) + '" y2="' + n(e[1] + 9) +
      '" stroke="' + L.GOLD_LIT + '" stroke-width="2.2"/>';
    o += '<line x1="' + n(e[0] - 9) + '" y1="' + n(e[1] + 9) + '" x2="' + n(e[0] + 9) + '" y2="' + n(e[1] - 9) +
      '" stroke="' + L.GOLD_LIT + '" stroke-width="2.2"/>';
    return o + "</svg>";
  }

  /* ---------- method two: tracing the letters on a planetary kamea ---------- */
  function kamea(letters, planetName) {
    var h = null;
    HI.forEach(function (x) { if (x.planet === planetName) h = x; });
    if (!h) h = HI[4] || null;
    if (!h) return "<p class='dim'>The squares are not loaded.</p>";
    var sq = h.kamea, N = sq.length, S = 480, pad = 46, cell = (S - pad * 2) / N;
    var pos = {};
    for (var r = 0; r < N; r++) for (var col = 0; col < N; col++) pos[sq[r][col]] = [col, r];
    var o = '<svg viewBox="0 0 ' + S + ' ' + S + '" width="' + S + '" height="' + S +
      '" role="img" aria-label="Sigil traced on the magic square of ' + L.esc(h.planet) + '">';
    o += '<text x="' + S / 2 + '" y="26" text-anchor="middle" font-family="serif" font-size="15" fill="' + L.GOLD +
      '" letter-spacing="4">' + h.glyph + "  " + L.esc(h.planet.toUpperCase()) + "</text>";
    for (r = 0; r <= N; r++) {
      o += '<line x1="' + pad + '" y1="' + n(pad + r * cell) + '" x2="' + (S - pad) + '" y2="' + n(pad + r * cell) +
        '" stroke="' + L.GOLD + '" stroke-width=".6" opacity=".38"/>';
      o += '<line x1="' + n(pad + r * cell) + '" y1="' + pad + '" x2="' + n(pad + r * cell) + '" y2="' + (S - pad) +
        '" stroke="' + L.GOLD + '" stroke-width=".6" opacity=".38"/>';
    }
    var nums = [], size = N * N;
    for (var i = 0; i < letters.length; i++) {
      nums.push(((letters.charCodeAt(i) - 65) % size) + 1);
    }
    var pts = nums.map(function (num) {
      var p = pos[num];
      return [pad + (p[0] + 0.5) * cell, pad + (p[1] + 0.5) * cell];
    });
    for (r = 0; r < N; r++) for (col = 0; col < N; col++) {
      var v = sq[r][col], hit = nums.indexOf(v) >= 0;
      o += '<text x="' + n(pad + (col + 0.5) * cell) + '" y="' + n(pad + (r + 0.62) * cell) +
        '" text-anchor="middle" font-family="serif" font-size="' + n(Math.min(18, cell * 0.46)) +
        '" fill="' + (hit ? L.GOLD_LIT : L.GOLD) + '" opacity="' + (hit ? ".95" : ".42") + '">' + v + "</text>";
    }
    if (pts.length === 1) pts.push([S / 2, S / 2]);
    o += '<path d="' + poly(pts) + '" fill="none" stroke="' + L.GOLD_LIT +
      '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>';
    o += '<circle cx="' + n(pts[0][0]) + '" cy="' + n(pts[0][1]) + '" r="7" fill="none" stroke="' + L.GOLD_LIT + '" stroke-width="1.8"/>';
    var e = pts[pts.length - 1];
    o += '<path d="M' + n(e[0] - 8) + " " + n(e[1] - 8) + " L" + n(e[0] + 8) + " " + n(e[1] + 8) +
      " M" + n(e[0] - 8) + " " + n(e[1] + 8) + " L" + n(e[0] + 8) + " " + n(e[1] - 8) +
      '" stroke="' + L.GOLD_LIT + '" stroke-width="2.2"/>';
    o += '<text x="' + S / 2 + '" y="' + (S - 18) + '" text-anchor="middle" font-family="serif" font-size="12" fill="' +
      L.GOLD + '" opacity=".7" letter-spacing="3">SUM ' + (N * (N * N + 1) / 2) +
      "  &#183;  " + L.esc(h.intelligence) + " &#183; " + L.esc(h.spirit) + "</text>";
    return o + "</svg>";
  }

  /* ---------- method three: the monogram, letters fused ---------- */
  function monogram(letters, seed) {
    var S = 480, c = S / 2, rand = L.rng(seed);
    var o = '<svg viewBox="0 0 ' + S + ' ' + S + '" width="' + S + '" height="' + S +
      '" role="img" aria-label="Sigil fused from the letters of the statement">';
    o += '<circle cx="' + c + '" cy="' + c + '" r="212" fill="none" stroke="' + L.GOLD + '" stroke-width="1.1" opacity=".65"/>';
    o += '<circle cx="' + c + '" cy="' + c + '" r="202" fill="none" stroke="' + L.GOLD + '" stroke-width=".6" opacity=".35"/>';
    var i, k = 0, sp = [];
    for (i = 0; i < 7; i++) { sp.push(L.pol(c, c, 196, k * 360 / 7)); k = (k + 3) % 7; }
    o += '<path d="' + poly(sp) + ' Z" fill="none" stroke="' + L.GOLD + '" stroke-width=".7" opacity=".26"/>';
    for (i = 0; i < letters.length; i++) {
      var size = 96 + rand() * 96;
      var rot = (rand() - 0.5) * 150;
      var rr = rand() * 62;
      var p = L.pol(c, c, rr, rand() * 360);
      o += '<text x="' + n(p[0]) + '" y="' + n(p[1] + size * 0.34) + '" text-anchor="middle" font-family="serif" font-size="' +
        n(size) + '" fill="none" stroke="' + L.GOLD_LIT + '" stroke-width="1.6" opacity="' +
        n(0.34 + 0.5 * (i / Math.max(1, letters.length - 1))) + '" transform="rotate(' + n(rot) + " " + n(p[0]) + " " + n(p[1]) + ')">' +
        letters[i] + "</text>";
    }
    o += '<circle cx="' + c + '" cy="' + c + '" r="4" fill="' + L.GOLD_LIT + '" opacity=".85"/>';
    return o + "</svg>";
  }

  function render() {
    var text = intent.value || "IT IS MY WILL TO SEE CLEARLY";
    var r = reduce(text);
    if (!r.kept) {
      steps.innerHTML = '<p class="dim small">Write a statement in letters and the work can begin.</p>';
      out.innerHTML = "";
      return;
    }
    var seed = L.hash(r.kept + "|" + method.value + "|" + (planet ? planet.value : ""));
    var svg;
    if (method.value === "kamea") svg = kamea(r.kept, planet ? planet.value : "Venus");
    else if (method.value === "monogram") svg = monogram(r.kept, seed);
    else svg = roseWheel(r.kept, seed);

    steps.innerHTML =
      '<div class="small"><span class="kicker" style="margin-bottom:.5em">The reduction</span>' +
      '<p style="margin:0 0 .3em"><span class="dim">Stated:</span> ' + L.esc(text.toUpperCase()) + "</p>" +
      '<p style="margin:0 0 .3em"><span class="dim">Letters only:</span> ' + L.esc(r.up) + "</p>" +
      '<p style="margin:0 0 .3em"><span class="dim">Vowels struck out:</span> ' + L.esc(r.noVowel || "(none left)") + "</p>" +
      '<p style="margin:0"><span class="dim">Repetitions struck out:</span> <b style="color:var(--gold-lit);letter-spacing:.3em">' +
      L.esc(r.kept) + "</b></p></div>";
    out.innerHTML = svg;
    out.setAttribute("data-svg", "1");
    if (planetWrap) planetWrap.style.display = method.value === "kamea" ? "" : "none";
  }

  if (forge) forge.addEventListener("click", render);
  intent.addEventListener("keydown", function (e) { if (e.key === "Enter") render(); });
  if (method) method.addEventListener("change", render);
  if (planet) planet.addEventListener("change", render);
  if (dl) dl.addEventListener("click", function () {
    var svg = out.querySelector("svg");
    if (!svg) return;
    L.download(svg.outerHTML, "sigil-liber488.svg");
  });
  render();
})();

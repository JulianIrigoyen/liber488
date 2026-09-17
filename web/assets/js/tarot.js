/* The Atu: twenty two trumps, drawn as plates, and a three card reading. */
(function () {
  "use strict";
  var L = window.L488, T = window.TAROT;
  if (!L || !T) return;

  var ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI",
    "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];

  function n(v) { return Math.round(v * 100) / 100; }

  function cardArt(c, w) {
    w = w || 190;
    var h = Math.round(w * 1.58), cx = w / 2, cy = h * 0.48;
    var rand = L.rng(L.hash(c.name + c.n));
    var R = w * 0.33;
    var o = '<svg viewBox="0 0 ' + w + " " + h + '" width="' + w + '" height="' + h +
      '" role="img" aria-label="Plate for ' + L.esc(c.name) + '">';
    o += '<rect x="3" y="3" width="' + (w - 6) + '" height="' + (h - 6) +
      '" fill="rgba(11,9,18,.75)" stroke="#c9a44c" stroke-width="1.1" opacity=".95"/>';
    o += '<rect x="9" y="9" width="' + (w - 18) + '" height="' + (h - 18) +
      '" fill="none" stroke="#c9a44c" stroke-width=".5" opacity=".45"/>';
    /* seeded figure: a star polygon whose points follow the trump number */
    var pts = 3 + (c.n % 9), step = 1 + (c.n % Math.max(2, Math.floor(pts / 2)));
    var sp = [], k = 0, i;
    for (i = 0; i < pts; i++) { sp.push(L.pol(cx, cy, R, k * 360 / pts)); k = (k + step) % pts; }
    o += '<circle cx="' + cx + '" cy="' + n(cy) + '" r="' + n(R + 12) + '" fill="none" stroke="#c9a44c" stroke-width=".6" opacity=".4"/>';
    o += '<circle cx="' + cx + '" cy="' + n(cy) + '" r="' + n(R + 4) + '" fill="none" stroke="#c9a44c" stroke-width=".4" opacity=".3" stroke-dasharray="2 5"/>';
    o += '<path d="M' + sp.map(function (p) { return n(p[0]) + " " + n(p[1]); }).join(" L") +
      ' Z" fill="none" stroke="#efd79a" stroke-width="1.1" opacity=".85"/>';
    for (i = 0; i < 12; i++) {
      var a = i * 30, p1 = L.pol(cx, cy, R + 12, a), p2 = L.pol(cx, cy, R + 19, a);
      o += '<line x1="' + n(p1[0]) + '" y1="' + n(p1[1]) + '" x2="' + n(p2[0]) + '" y2="' + n(p2[1]) +
        '" stroke="#c9a44c" stroke-width=".5" opacity=".35"/>';
    }
    o += '<circle cx="' + cx + '" cy="' + n(cy) + '" r="' + n(R * 0.42) + '" fill="rgba(7,6,10,.85)" stroke="#efd79a" stroke-width=".8" opacity=".9"/>';
    o += '<text x="' + cx + '" y="' + n(cy + R * 0.2) + '" text-anchor="middle" font-family="serif" font-size="' +
      n(R * 0.56) + '" fill="#efd79a">' + c.letter + "</text>";
    o += '<text x="' + cx + '" y="28" text-anchor="middle" font-family="serif" font-size="11" fill="#c9a44c" letter-spacing="3">' +
      ROMAN[c.n] + "</text>";
    o += '<text x="' + cx + '" y="' + (h - 34) + '" text-anchor="middle" font-family="serif" font-size="' +
      (c.name.length > 13 ? 11 : 13) + '" fill="#e9e1cf" letter-spacing="1.5">' + L.esc(c.name.toUpperCase()) + "</text>";
    o += '<text x="' + cx + '" y="' + (h - 18) + '" text-anchor="middle" font-family="serif" font-size="9.5" fill="#a79fb4" letter-spacing="2">' +
      L.esc(c.hebrew.toUpperCase()) + " &#183; " + L.esc(c.attribution.toUpperCase()) + "</text>";
    return o + "</svg>";
  }

  /* ---------- the gallery of trumps ---------- */
  var gal = document.getElementById("atugrid"), det = document.getElementById("atudetail");
  function detailCard(c) {
    return '<div class="plate"><div style="display:flex;gap:1.4rem;flex-wrap:wrap;align-items:flex-start">' +
      '<div style="flex:0 0 auto;margin:auto">' + cardArt(c, 190) + "</div>" +
      '<div style="flex:1 1 250px;min-width:230px">' +
      '<span class="kicker">Atu ' + ROMAN[c.n] + " &#183; path " + c.path + "</span><h3>" + L.esc(c.name) + "</h3>" +
      '<div class="tags"><span class="tag">' + L.esc(c.hebrew) + " " + c.letter +
      '</span><span class="tag">' + L.esc(c.attribution) + "</span></div>" +
      '<p class="small" style="margin-top:.9em">' + L.esc(c.trumps) + "</p>" +
      '<p class="small dim" style="margin-bottom:0"><b style="color:var(--gold-lit);font-weight:400">As a stage of the work:</b> ' +
      L.esc(c.jung) + "</p></div></div></div>";
  }
  if (gal) {
    gal.innerHTML = T.map(function (c) {
      return '<button type="button" data-n="' + c.n + '" style="background:none;border:0;padding:0;cursor:pointer;display:block">' +
        cardArt(c, 128) + "</button>";
    }).join("");
    gal.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-n]");
      if (!b) return;
      var c = T[parseInt(b.getAttribute("data-n"), 10)];
      det.innerHTML = detailCard(c);
      det.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    det.innerHTML = detailCard(T[0]);
  }

  /* ---------- the three card reading ---------- */
  var drawBtn = document.getElementById("draw"), spread = document.getElementById("spread");
  var HEADS = ["The Will", "The Obstacle", "The Way"];
  var GLOSS = ["what is actually wanted, under the wanting",
    "what stands in the road, usually oneself",
    "the next honest move, not the wished for one"];
  if (drawBtn && spread) {
    drawBtn.addEventListener("click", function () {
      var pool = T.slice(), picked = [];
      while (picked.length < 3) picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
      spread.innerHTML = picked.map(function (c, i) {
        return '<div class="card" style="text-align:center">' +
          '<span class="num">' + HEADS[i].toUpperCase() + "</span>" +
          '<div style="margin:0 auto .8rem;max-width:160px">' + cardArt(c, 160) + "</div>" +
          "<h4 style=\"margin-bottom:.3em\">" + L.esc(c.name) + "</h4>" +
          '<p class="small dim" style="margin-bottom:.6em">' + L.esc(GLOSS[i]) + "</p>" +
          '<p class="small" style="margin:0">' + L.esc(c.jung) + "</p></div>";
      }).join("");
    });
  }
})();

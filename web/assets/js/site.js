/* Liber 488 : shared behaviour and the drawing helpers the pages borrow. */
(function () {
  "use strict";

  /* ---------- navigation ---------- */
  var toggle = document.querySelector(".navtoggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add("seen"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("seen"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  }

  /* ---------- helpers published for the page scripts ---------- */
  var GOLD = "#c9a44c", GOLD_LIT = "#efd79a";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* deterministic 32 bit hash of a string */
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /* seeded generator: same name always yields the same seal */
  function rng(seed) {
    var s = seed >>> 0 || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }

  function pol(cx, cy, r, deg) {
    var a = (deg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }

  function n(v) { return Math.round(v * 100) / 100; }

  /* --- a hexagram, drawn as six bars; code reads bottom line first --- */
  function hexSVG(code, opts) {
    opts = opts || {};
    var w = opts.w || 46, th = opts.th || 5, gap = opts.gap || 6;
    var changing = opts.changing || [];   /* 0 based indexes, bottom first */
    var h = 6 * th + 5 * gap;
    var out = '<svg class="hexglyph" viewBox="0 0 ' + (w + 24) + ' ' + h +
      '" width="' + (opts.width || w + 24) + '" height="' + (opts.height || h) +
      '" aria-hidden="true">';
    for (var i = 0; i < code.length; i++) {
      var y = (5 - i) * (th + gap);
      var col = changing.indexOf(i) >= 0 ? "#d2564f" : (opts.color || GOLD_LIT);
      if (code[i] === "1") {
        out += '<rect x="12" y="' + y + '" width="' + w + '" height="' + th + '" fill="' + col + '"/>';
      } else {
        var seg = (w - gap * 1.6) / 2;
        out += '<rect x="12" y="' + y + '" width="' + n(seg) + '" height="' + th + '" fill="' + col + '"/>';
        out += '<rect x="' + n(12 + w - seg) + '" y="' + y + '" width="' + n(seg) + '" height="' + th + '" fill="' + col + '"/>';
      }
      if (changing.indexOf(i) >= 0) {
        out += '<circle cx="6" cy="' + n(y + th / 2) + '" r="2.6" fill="#d2564f"/>';
      }
    }
    return out + "</svg>";
  }

  /* --- a procedural seal for a name: letters walk three concentric rings --- */
  function sealSVG(name, opts) {
    opts = opts || {};
    var S = opts.size || 220, c = S / 2, R = c * 0.72;
    var key = String(name).toUpperCase().replace(/[^A-Z]/g, "");
    var rand = rng(hash(key) || 7);
    var seen = {}, pts = [], i, ch, idx, ring, p;
    for (i = 0; i < key.length; i++) {
      ch = key[i];
      if (seen[ch]) continue;
      seen[ch] = 1;
      idx = key.charCodeAt(i) - 65;
      ring = R * (1 - (idx % 3) * 0.24);
      pts.push(pol(c, c, ring, idx * (360 / 26) + (rand() - 0.5) * 8));
    }
    if (pts.length < 3) pts.push(pol(c, c, R * 0.5, 200), pol(c, c, R * 0.8, 40));

    var o = '<svg viewBox="0 0 ' + S + ' ' + S + '" width="' + S + '" height="' + S +
      '" role="img" aria-label="Seal of ' + esc(name) + '">';
    o += '<circle cx="' + c + '" cy="' + c + '" r="' + n(c - 3) + '" fill="none" stroke="' + GOLD + '" stroke-width="1.2" opacity=".75"/>';
    o += '<circle cx="' + c + '" cy="' + c + '" r="' + n(c - 10) + '" fill="none" stroke="' + GOLD + '" stroke-width=".6" opacity=".4"/>';
    /* seeded tick ring */
    var tk = 16 + Math.floor(rand() * 20);
    for (i = 0; i < tk; i++) {
      var a = i * 360 / tk;
      var p1 = pol(c, c, c - 10, a), p2 = pol(c, c, c - 3, a);
      o += '<line x1="' + n(p1[0]) + '" y1="' + n(p1[1]) + '" x2="' + n(p2[0]) + '" y2="' + n(p2[1]) +
        '" stroke="' + GOLD + '" stroke-width=".6" opacity=".35"/>';
    }
    /* a seeded inner figure: pentagram, hexagram, heptagram or octagram */
    var pointsN = [5, 6, 7, 8][Math.floor(rand() * 4)];
    var step = pointsN === 6 ? 2 : (pointsN === 8 ? 3 : 2);
    var sp = [], k = 0;
    for (i = 0; i < pointsN; i++) { sp.push(pol(c, c, R * 0.98, k * 360 / pointsN)); k = (k + step) % pointsN; }
    o += '<path d="M' + sp.map(function (q) { return n(q[0]) + " " + n(q[1]); }).join(" L") +
      ' Z" fill="none" stroke="' + GOLD + '" stroke-width=".7" opacity=".28"/>';
    /* the sigil line itself */
    o += '<path d="M' + pts.map(function (q) { return n(q[0]) + " " + n(q[1]); }).join(" L") +
      '" fill="none" stroke="' + GOLD_LIT + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    /* opening circle, closing bar */
    p = pts[0];
    o += '<circle cx="' + n(p[0]) + '" cy="' + n(p[1]) + '" r="6" fill="none" stroke="' + GOLD_LIT + '" stroke-width="1.6"/>';
    p = pts[pts.length - 1];
    var t = pol(p[0], p[1], 9, (rand() * 360));
    o += '<line x1="' + n(p[0] * 2 - t[0]) + '" y1="' + n(p[1] * 2 - t[1]) + '" x2="' + n(t[0]) + '" y2="' + n(t[1]) +
      '" stroke="' + GOLD_LIT + '" stroke-width="2"/>';
    o += '<circle cx="' + c + '" cy="' + c + '" r="3" fill="' + GOLD_LIT + '" opacity=".8"/>';
    return o + "</svg>";
  }

  /* --- offer an svg element's markup as a download --- */
  function download(svgMarkup, filename) {
    var blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n' + svgMarkup], { type: "image/svg+xml" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  window.L488 = {
    esc: esc, hash: hash, rng: rng, pol: pol, hexSVG: hexSVG, sealSVG: sealSVG,
    download: download, GOLD: GOLD, GOLD_LIT: GOLD_LIT
  };
})();

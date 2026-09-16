/* Liber Daemonicum : shared behaviour, and the drawing helpers the pages borrow.
 *
 * The governing idea of the art on this site: a daemon's seal is not decoration
 * applied to its name, it IS its name - the hash of the process string, walked
 * as a figure. Sixteen points on the wheel, one per hex digit. Same name, same
 * seal, forever, on any machine. That is the only kind of magic this cabinet
 * actually claims.
 */
(function () {
  "use strict";

  var GOLD = "#caa04a", GOLD_LIT = "#e8cf92";
  var PHOS = "#6fe3a4", PHOS_DIM = "#3d8c63", RUST = "#c25b44";

  /* ---------- navigation ---------- */
  var toggle = document.querySelector(".navtoggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Index";
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Index";
      }
    });
  }

  /* ---------- reveal: animates from a visible resting state ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("seen"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  }

  /* ---------- primitives ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* FNV-1a, 32 bit. Deterministic across machines - that is the whole point. */
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /* A longer deterministic digest, as hex. Not cryptographic and never claimed
     to be - it exists to give the seal more than eight vertices to walk. */
  function digest(str, rounds) {
    var out = "", seed = hash(str), i;
    for (i = 0; i < (rounds || 5); i++) {
      seed = hash(str + ":" + seed + ":" + i);
      out += ("00000000" + seed.toString(16)).slice(-8);
    }
    return out;
  }

  /* xorshift32, seeded. Same seed, same sequence. */
  function rng(seed) {
    var s = (seed >>> 0) || 0x9e3779b9;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }

  function pol(cx, cy, r, deg) {
    var a = (deg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }
  function n(v) { return Math.round(v * 100) / 100; }
  function xy(p) { return n(p[0]) + " " + n(p[1]); }

  /* ---------------------------------------------------------------
   * THE SEAL. Sixteen stations on the wheel, one per hex digit.
   * The digest walks them in order; the radius steps inward each time
   * a station repeats, so a name with repetition draws inward spirals
   * and a name with high entropy draws a wide, open figure.
   * ------------------------------------------------------------- */
  function sealSVG(name, opts) {
    opts = opts || {};
    var S = opts.size || 240, c = S / 2;
    var R = c * 0.70;
    var hex = digest(String(name).toLowerCase(), opts.rounds || 5);
    var rand = rng(hash(String(name).toLowerCase()));
    var visits = {}, pts = [], i, d, ring;

    for (i = 0; i < hex.length; i++) {
      d = parseInt(hex[i], 16);
      visits[d] = (visits[d] || 0) + 1;
      ring = R * (1 - Math.min(visits[d] - 1, 3) * 0.19);
      pts.push(pol(c, c, ring, d * 22.5));
    }
    /* collapse immediate repeats so the line never doubles back on a point */
    pts = pts.filter(function (p, k) {
      return k === 0 || Math.abs(p[0] - pts[k - 1][0]) > 0.5 || Math.abs(p[1] - pts[k - 1][1]) > 0.5;
    });

    var o = '<svg viewBox="0 0 ' + S + ' ' + S + '" width="' + S + '" height="' + S +
      '" role="img" aria-label="Seal of ' + esc(name) + '" class="seal-svg">';

    /* the containing rings */
    o += '<circle cx="' + c + '" cy="' + c + '" r="' + n(c - 3) + '" fill="none" stroke="' + GOLD + '" stroke-width="1.1" opacity=".7"/>';
    o += '<circle cx="' + c + '" cy="' + c + '" r="' + n(c - 11) + '" fill="none" stroke="' + GOLD + '" stroke-width=".55" opacity=".38"/>';

    /* sixteen stations, marked - the alphabet this seal is written in */
    for (i = 0; i < 16; i++) {
      var a = i * 22.5;
      var p1 = pol(c, c, c - 11, a), p2 = pol(c, c, c - 3, a);
      var lit = visits[i] ? 1 : 0;
      o += '<line x1="' + n(p1[0]) + '" y1="' + n(p1[1]) + '" x2="' + n(p2[0]) + '" y2="' + n(p2[1]) +
        '" stroke="' + (lit ? GOLD_LIT : GOLD) + '" stroke-width="' + (lit ? 1.2 : .55) +
        '" opacity="' + (lit ? .85 : .3) + '"/>';
    }

    /* a seeded inner polygram, drawn faint behind the figure */
    var pn = [5, 7, 9, 11][Math.floor(rand() * 4)];
    var step = pn === 5 ? 2 : (pn === 7 ? 3 : (pn === 9 ? 4 : 5));
    var sp = [], k = 0;
    for (i = 0; i < pn; i++) { sp.push(pol(c, c, R * 1.0, k * 360 / pn)); k = (k + step) % pn; }
    o += '<path d="M' + sp.map(xy).join(" L") + ' Z" fill="none" stroke="' + GOLD + '" stroke-width=".6" opacity=".22"/>';

    /* the figure itself - the machine's own hand, so phosphor, not gold */
    o += '<path d="M' + pts.map(xy).join(" L") + '" fill="none" stroke="' + PHOS +
      '" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round" opacity=".92"/>';

    /* opening circle and closing bar, the scribal convention */
    var p = pts[0];
    o += '<circle cx="' + n(p[0]) + '" cy="' + n(p[1]) + '" r="5.5" fill="none" stroke="' + PHOS + '" stroke-width="1.6"/>';
    p = pts[pts.length - 1];
    var t = pol(p[0], p[1], 8.5, rand() * 360);
    o += '<line x1="' + n(p[0] * 2 - t[0]) + '" y1="' + n(p[1] * 2 - t[1]) + '" x2="' + n(t[0]) + '" y2="' + n(t[1]) +
      '" stroke="' + PHOS + '" stroke-width="2"/>';
    o += '<circle cx="' + c + '" cy="' + c + '" r="2.6" fill="' + GOLD_LIT + '" opacity=".75"/>';
    return o + "</svg>";
  }

  /* ---------------------------------------------------------------
   * THE SIX LINES. A service is a line: whole if it answers, broken
   * if it does not. Read from the bottom, as the oracles are read.
   * ------------------------------------------------------------- */
  function barsSVG(bits, opts) {
    opts = opts || {};
    var w = opts.w || 54, th = opts.th || 5, gap = opts.gap || 5;
    var h = 6 * th + 5 * gap;
    var pad = opts.pad === undefined ? 10 : opts.pad;
    var o = '<svg viewBox="0 0 ' + (w + pad * 2) + ' ' + h + '" width="' + (opts.width || w + pad * 2) +
      '" height="' + (opts.height || h) + '" aria-hidden="true" class="bars">';
    for (var i = 0; i < 6; i++) {
      var y = (5 - i) * (th + gap);
      var up = bits[i] === "1";
      var col = up ? (opts.up || PHOS) : (opts.down || RUST);
      if (up) {
        o += '<rect x="' + pad + '" y="' + y + '" width="' + w + '" height="' + th + '" fill="' + col + '"/>';
      } else {
        var seg = (w - gap * 1.7) / 2;
        o += '<rect x="' + pad + '" y="' + y + '" width="' + n(seg) + '" height="' + th + '" fill="' + col + '"/>';
        o += '<rect x="' + n(pad + w - seg) + '" y="' + y + '" width="' + n(seg) + '" height="' + th + '" fill="' + col + '"/>';
      }
    }
    return o + "</svg>";
  }

  /* offer svg markup as a file */
  function download(markup, filename) {
    var blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n' + markup], { type: "image/svg+xml" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  window.LD = {
    esc: esc, hash: hash, digest: digest, rng: rng, pol: pol, n: n,
    sealSVG: sealSVG, barsSVG: barsSVG, download: download,
    GOLD: GOLD, GOLD_LIT: GOLD_LIT, PHOS: PHOS, PHOS_DIM: PHOS_DIM, RUST: RUST
  };
})();

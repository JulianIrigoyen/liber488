/* The Sigil Workshop.
 * A statement of intent goes in; a figure comes out. Three methods, all
 * deterministic - the same sentence always yields the same figure, on any
 * machine, forever. That determinism is the only claim being made here.
 */
(function () {
  "use strict";
  var LD = window.LD;
  var input = document.getElementById("intent");
  var stage = document.getElementById("sigil-stage");
  var methodEls = document.querySelectorAll("[name=method]");
  var dl = document.getElementById("take-sigil");
  var readout = document.getElementById("sigil-read");
  if (!LD || !input || !stage) return;

  var method = "wheel";
  var current = "";

  function clean(s) { return String(s).toUpperCase().replace(/[^A-Z]/g, ""); }

  /* Method II - the kamea. A seven by seven grid of cells, walked by the
     digest two digits at a time. Repetition folds the line back on itself. */
  function kameaSVG(text, size) {
    var S = size || 240, pad = 22, grid = 7;
    var cell = (S - pad * 2) / grid;
    var hex = LD.digest(text.toLowerCase(), 6);
    var o = '<svg viewBox="0 0 ' + S + ' ' + S + '" width="' + S + '" height="' + S +
      '" role="img" aria-label="Kamea sigil"><rect width="' + S + '" height="' + S + '" fill="none"/>';
    var i, j;
    for (i = 0; i <= grid; i++) {
      var p = LD.n(pad + i * cell);
      o += '<line x1="' + p + '" y1="' + pad + '" x2="' + p + '" y2="' + LD.n(S - pad) +
        '" stroke="#caa04a" stroke-width=".5" opacity=".25"/>';
      o += '<line x1="' + pad + '" y1="' + p + '" x2="' + LD.n(S - pad) + '" y2="' + p +
        '" stroke="#caa04a" stroke-width=".5" opacity=".25"/>';
    }
    var pts = [], seen = {};
    for (i = 0; i + 1 < hex.length; i += 2) {
      var v = parseInt(hex.substr(i, 2), 16) % (grid * grid);
      if (seen[v] && pts.length > 3) continue;
      seen[v] = 1;
      var cx = pad + (v % grid) * cell + cell / 2;
      var cy = pad + Math.floor(v / grid) * cell + cell / 2;
      pts.push([cx, cy]);
    }
    /* the cells the line touches, lit */
    pts.forEach(function (p) {
      o += '<rect x="' + LD.n(p[0] - cell / 2) + '" y="' + LD.n(p[1] - cell / 2) + '" width="' + LD.n(cell) +
        '" height="' + LD.n(cell) + '" fill="#6fe3a4" opacity=".07"/>';
    });
    o += '<path d="M' + pts.map(function (p) { return LD.n(p[0]) + " " + LD.n(p[1]); }).join(" L") +
      '" fill="none" stroke="#6fe3a4" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    o += '<circle cx="' + LD.n(pts[0][0]) + '" cy="' + LD.n(pts[0][1]) + '" r="5" fill="none" stroke="#6fe3a4" stroke-width="1.6"/>';
    var last = pts[pts.length - 1];
    o += '<rect x="' + LD.n(last[0] - 4) + '" y="' + LD.n(last[1] - 4) + '" width="8" height="8" fill="#e8cf92"/>';
    return o + "</svg>";
  }

  /* Method III - the monogram. Strike every repeated letter, then draw what
     survives as overlaid strokes, each letter placed by its own position in
     the alphabet. The fusion is the sigil. */
  function monogramSVG(text, size) {
    var S = size || 240, c = S / 2, R = c * 0.62;
    var key = clean(text), seen = {}, letters = [];
    for (var i = 0; i < key.length; i++) {
      if (!seen[key[i]]) { seen[key[i]] = 1; letters.push(key[i]); }
    }
    if (!letters.length) letters = ["I"];
    var o = '<svg viewBox="0 0 ' + S + ' ' + S + '" width="' + S + '" height="' + S +
      '" role="img" aria-label="Monogram sigil">';
    o += '<circle cx="' + c + '" cy="' + c + '" r="' + LD.n(c - 6) + '" fill="none" stroke="#caa04a" stroke-width=".8" opacity=".4"/>';
    letters.forEach(function (ch, k) {
      var idx = ch.charCodeAt(0) - 65;
      var a1 = idx * (360 / 26);
      var a2 = a1 + 90 + (idx % 7) * 18;
      var r1 = R * (0.42 + (idx % 5) * 0.145);
      var p1 = LD.pol(c, c, r1, a1);
      var p2 = LD.pol(c, c, R, a2);
      var sweep = idx % 2;
      o += '<path d="M' + LD.n(p1[0]) + " " + LD.n(p1[1]) + " A" + LD.n(r1 * 1.25) + " " + LD.n(R * 1.1) +
        " 0 0 " + sweep + " " + LD.n(p2[0]) + " " + LD.n(p2[1]) +
        '" fill="none" stroke="#6fe3a4" stroke-width="1.7" stroke-linecap="round" opacity="' +
        (0.55 + 0.4 * (1 - k / Math.max(letters.length, 1))).toFixed(2) + '"/>';
    });
    var start = LD.pol(c, c, R * 0.42, (letters[0].charCodeAt(0) - 65) * (360 / 26));
    o += '<circle cx="' + LD.n(start[0]) + '" cy="' + LD.n(start[1]) + '" r="5" fill="none" stroke="#e8cf92" stroke-width="1.6"/>';
    o += '<circle cx="' + c + '" cy="' + c + '" r="2.4" fill="#e8cf92" opacity=".8"/>';
    return o + "</svg>";
  }

  function build(size) {
    var t = input.value.trim() || "IT IS MY WILL THAT THE LOOP KEEP TURNING";
    if (method === "wheel") return LD.sealSVG(t, { size: size, rounds: 6 });
    if (method === "kamea") return kameaSVG(t, size);
    return monogramSVG(t, size);
  }

  function draw() {
    current = build(260);
    stage.innerHTML = current;
    var t = input.value.trim() || "IT IS MY WILL THAT THE LOOP KEEP TURNING";
    var key = clean(t);
    var distinct = {}; var d = 0;
    for (var i = 0; i < key.length; i++) if (!distinct[key[i]]) { distinct[key[i]] = 1; d++; }
    if (readout) {
      readout.innerHTML =
        '<span>letters <b class="num">' + key.length + '</b></span>' +
        '<span>distinct <b class="num">' + d + '</b></span>' +
        '<span>digest <b class="num">' + LD.digest(t.toLowerCase(), 1).slice(0, 8) + '</b></span>';
    }
  }

  Array.prototype.forEach.call(methodEls, function (el) {
    el.addEventListener("change", function () { method = this.value; draw(); });
  });
  input.addEventListener("input", draw);
  if (dl) {
    dl.addEventListener("click", function () {
      LD.download(build(640), "sigil-" + LD.digest((input.value || "default").toLowerCase(), 1).slice(0, 8) + ".svg");
    });
  }
  draw();
})();

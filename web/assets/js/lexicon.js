/* The lexicon of symbols and the Tree of Life. */
(function () {
  "use strict";
  var L = window.L488, S = window.SYMBOLS, SEF = window.SEPHIROTH, T = window.TAROT;
  if (!L) return;

  /* Some marks have no dependable unicode character. Those are drawn. */
  function mark(name, size) {
    var d = {
      "Fire":        "M50 12 L88 82 L12 82 Z",
      "Water":       "M12 18 L88 18 L50 88 Z",
      "Air":         "M50 12 L88 82 L12 82 Z M28 62 L72 62",
      "Earth":       "M12 18 L88 18 L50 88 Z M28 44 L72 44",
      "Sulphur":     "M50 8 L80 58 L20 58 Z M50 58 L50 94 M32 76 L68 76",
      "Sal (Salt)":  "M50 12 A38 38 0 1 1 49.9 12 M12 50 L88 50",
      "Prima Materia": "M50 10 A40 40 0 1 1 49.9 10 M26 26 L74 26 L74 74 L26 74 Z",
      "Vitriol":     "M20 16 L50 84 L80 16 M14 92 L86 92",
      "Quintessence": "M50 10 A40 40 0 1 1 49.9 10 M50 18 L79 71 L21 71 Z M50 82 L21 29 L79 29 Z"
    }[name];
    if (!d) return null;
    size = size || 34;
    return '<svg viewBox="0 0 100 100" width="' + size + '" height="' + size +
      '" aria-hidden="true" style="display:inline-block;vertical-align:middle"><path d="' + d +
      '" fill="none" stroke="#efd79a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  }

  function face(x, size) { return mark(x.name, size) || x.glyph; }

  /* ---------- the lexicon ---------- */
  var grid = document.getElementById("symgrid"),
      detail = document.getElementById("symdetail"),
      cats = document.getElementById("symcats");
  var active = "";

  if (cats && S) {
    var all = S.map(function (x) { return x.cat; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
    cats.innerHTML = ['<button class="btn ghost on" type="button" data-cat="">All</button>']
      .concat(all.map(function (c) {
        return '<button class="btn ghost" type="button" data-cat="' + L.esc(c) + '">' + L.esc(c) + "</button>";
      })).join("");
    cats.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-cat]");
      if (!b) return;
      active = b.getAttribute("data-cat");
      Array.prototype.forEach.call(cats.querySelectorAll("button"), function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      paintSym();
    });
  }

  function paintSym() {
    if (!grid || !S) return;
    var shown = S.filter(function (x) { return !active || x.cat === active; });
    grid.innerHTML = shown.map(function (x) {
      return '<button class="glyphtile" type="button" data-name="' + L.esc(x.name) + '">' +
        '<span class="g">' + face(x, 34) + "</span>" +
        '<span class="n">' + L.esc(x.name) + "</span></button>";
    }).join("");
  }

  if (grid && S) {
    paintSym();
    grid.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-name]");
      if (!b) return;
      var nm = b.getAttribute("data-name");
      var x = null;
      S.forEach(function (s) { if (s.name === nm) x = s; });
      if (!x) return;
      Array.prototype.forEach.call(grid.querySelectorAll(".glyphtile"), function (el) { el.classList.remove("on"); });
      b.classList.add("on");
      detail.innerHTML = '<div class="plate"><div style="display:flex;gap:1.2rem;align-items:flex-start">' +
        '<span style="font-size:3.4rem;line-height:1;color:var(--gold-lit)">' + face(x, 58) + "</span>" +
        "<div><h3 style=\"margin-bottom:.2em\">" + L.esc(x.name) + '</h3><div class="tags"><span class="tag">' +
        L.esc(x.cat) + "</span></div>" +
        '<p class="small" style="margin-top:.8em">' + L.esc(x.meaning) + "</p>" +
        '<p class="small dim" style="margin-bottom:0"><b style="color:var(--gold-lit);font-weight:400">Read psychologically:</b> ' +
        L.esc(x.jung) + "</p></div></div></div>";
    });
  }

  /* ---------- the Tree of Life ---------- */
  var tree = document.getElementById("tree"), tdetail = document.getElementById("treedetail");
  if (!tree || !SEF) return;

  var PATHS = [
    [11, 1, 2], [12, 1, 3], [13, 1, 6], [14, 2, 3], [15, 2, 6], [16, 2, 4],
    [17, 3, 6], [18, 3, 5], [19, 4, 5], [20, 4, 6], [21, 4, 7], [22, 5, 6],
    [23, 5, 8], [24, 6, 7], [25, 6, 9], [26, 6, 8], [27, 7, 8], [28, 7, 9],
    [29, 7, 10], [30, 8, 9], [31, 8, 10], [32, 9, 10]
  ];
  var trumpByPath = {};
  (T || []).forEach(function (c) { trumpByPath[c.path] = c; });
  var at = {};
  SEF.forEach(function (s) { at[s.n] = s; });

  var svg = '<svg viewBox="0 0 100 104" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto" role="img" aria-label="The Tree of Life, ten spheres and twenty two paths">';
  svg += '<g id="tpaths">';
  PATHS.forEach(function (p) {
    var a = at[p[1]], b = at[p[2]], t = trumpByPath[p[0]];
    var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    svg += '<g class="tpath" data-path="' + p[0] + '" style="cursor:pointer">';
    svg += '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y +
      '" stroke="#c9a44c" stroke-width="2.6" opacity="0"/>';
    svg += '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y +
      '" stroke="#c9a44c" stroke-width=".45" opacity=".55"/>';
    svg += '<text x="' + mx + '" y="' + (my + 1.1) + '" text-anchor="middle" font-family="serif" font-size="2.6" fill="#efd79a" opacity=".8">' +
      (t ? t.letter : "") + "</text>";
    svg += "</g>";
  });
  svg += "</g>";
  SEF.forEach(function (s) {
    svg += '<g class="tsef" data-sef="' + s.n + '" style="cursor:pointer">';
    svg += '<circle cx="' + s.x + '" cy="' + s.y + '" r="6.4" fill="#0b0912" stroke="#c9a44c" stroke-width=".5" opacity=".95"/>';
    svg += '<circle cx="' + s.x + '" cy="' + s.y + '" r="5.2" fill="none" stroke="#efd79a" stroke-width=".35" opacity=".7"/>';
    svg += '<text x="' + s.x + '" y="' + (s.y + 1.1) + '" text-anchor="middle" font-family="serif" font-size="3" fill="#efd79a">' + s.n + "</text>";
    svg += '<text x="' + s.x + '" y="' + (s.y + 9.6) + '" text-anchor="middle" font-family="serif" font-size="2.5" fill="#a79fb4">' +
      L.esc(s.name) + "</text>";
    svg += "</g>";
  });
  svg += "</svg>";
  tree.innerHTML = svg;

  function sefCard(s) {
    return '<div class="plate"><span class="kicker">Sphere ' + s.n + "</span><h3>" + L.esc(s.name) +
      ", " + L.esc(s.title) + "</h3>" +
      '<div class="tags"><span class="tag">' + L.esc(s.planet) + '</span><span class="tag">Virtue: ' +
      L.esc(s.virtue) + "</span>" + (s.vice ? '<span class="tag">Vice: ' + L.esc(s.vice) + "</span>" : "") + "</div>" +
      '<p class="small" style="margin:.9em 0 0">' + L.esc(s.jung) + "</p></div>";
  }

  function pathCard(num) {
    var t = trumpByPath[num];
    var pair = null;
    PATHS.forEach(function (p) { if (p[0] === num) pair = p; });
    var ends = pair ? at[pair[1]].name + " to " + at[pair[2]].name : "";
    if (!t) return '<div class="plate"><h3>Path ' + num + "</h3><p class=\"small\">" + L.esc(ends) + "</p></div>";
    return '<div class="plate"><span class="kicker">Path ' + num + " &#183; " + L.esc(ends) + "</span>" +
      '<div style="display:flex;gap:1rem;align-items:baseline"><span style="font-size:2.6rem;color:var(--gold-lit);line-height:1">' +
      t.letter + "</span><h3 style=\"margin:0\">" + t.n + ". " + L.esc(t.name) + "</h3></div>" +
      '<div class="tags" style="margin-top:.7em"><span class="tag">' + L.esc(t.hebrew) +
      '</span><span class="tag">' + L.esc(t.attribution) + "</span></div>" +
      '<p class="small" style="margin:.9em 0 .4em">' + L.esc(t.trumps) + "</p>" +
      '<p class="small dim" style="margin:0">' + L.esc(t.jung) + "</p></div>";
  }

  tree.addEventListener("click", function (e) {
    var s = e.target.closest(".tsef"), p = e.target.closest(".tpath");
    if (s) tdetail.innerHTML = sefCard(at[parseInt(s.getAttribute("data-sef"), 10)]);
    else if (p) tdetail.innerHTML = pathCard(parseInt(p.getAttribute("data-path"), 10));
  });
  tdetail.innerHTML = sefCard(at[6]);
})();

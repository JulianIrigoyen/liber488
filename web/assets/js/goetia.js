/* The spirits: the seventy two of the Ars Goetia and the planetary hierarchies. */
(function () {
  "use strict";
  var L = window.L488, G = window.GOETIA, HI = window.HIERARCHIES;
  if (!L || !G) return;

  var grid = document.getElementById("spiritgrid"),
      detail = document.getElementById("spiritdetail"),
      search = document.getElementById("spiritsearch"),
      rankSel = document.getElementById("rankfilter"),
      planSel = document.getElementById("planetfilter"),
      count = document.getElementById("spiritcount");

  function uniq(list) { return list.filter(function (v, i) { return list.indexOf(v) === i; }).sort(); }

  if (rankSel) {
    rankSel.innerHTML = '<option value="">Every rank</option>' +
      uniq(G.map(function (s) { return s.rank; })).map(function (r) {
        return '<option value="' + L.esc(r) + '">' + L.esc(r) + "</option>";
      }).join("");
  }
  if (planSel) {
    planSel.innerHTML = '<option value="">Every planet</option>' +
      ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"].map(function (p) {
        return '<option value="' + p + '">' + p + "</option>";
      }).join("");
  }

  function show(s) {
    if (!detail) return;
    detail.innerHTML = '<div class="plate">' +
      '<div style="display:flex;gap:1.4rem;flex-wrap:wrap;align-items:flex-start">' +
      '<div style="flex:0 0 auto;width:220px;margin:auto">' + L.sealSVG(s.name, { size: 220 }) + "</div>" +
      '<div style="flex:1 1 260px;min-width:240px">' +
      '<span class="kicker">Spirit ' + s.n + " of seventy two</span>" +
      "<h3>" + L.esc(s.name) + "</h3>" +
      '<div class="tags"><span class="tag">' + L.esc(s.rank) + '</span><span class="tag">' +
      s.legions + " legions</span><span class=\"tag\">" + L.esc(s.planet) + "</span></div>" +
      '<p class="small" style="margin-top:.9em">' + L.esc(s.office) + "</p>" +
      '<p class="small dim" style="margin-bottom:0"><b style="color:var(--gold-lit);font-weight:400">Appearance in the manuscripts:</b> ' +
      L.esc(s.form) + "</p>" +
      "</div></div></div>";
    detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function paint() {
    if (!grid) return;
    var q = (search && search.value || "").trim().toLowerCase();
    var rk = rankSel && rankSel.value, pl = planSel && planSel.value;
    var shown = G.filter(function (s) {
      if (rk && s.rank !== rk) return false;
      if (pl && s.planet !== pl) return false;
      if (!q) return true;
      return (s.n + " " + s.name + " " + s.office + " " + s.form + " " + s.rank).toLowerCase().indexOf(q) >= 0;
    });
    grid.innerHTML = shown.map(function (s) {
      return '<button class="glyphtile" type="button" data-n="' + s.n + '" style="padding:.6rem .4rem">' +
        '<span style="display:block;max-width:76px;margin:0 auto">' + L.sealSVG(s.name, { size: 76 }) + "</span>" +
        '<span class="g" style="font-size:.92rem;letter-spacing:.06em;margin-top:.3rem">' + L.esc(s.name) + "</span>" +
        '<span class="n">' + s.n + " &#183; " + L.esc(s.rank) + "</span></button>";
    }).join("");
    if (!shown.length) grid.innerHTML = '<p class="dim small">No spirit of that description answers.</p>';
    if (count) count.textContent = shown.length + (shown.length === 1 ? " spirit" : " spirits") + " listed";
  }

  if (grid) {
    paint();
    grid.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-n]");
      if (!b) return;
      Array.prototype.forEach.call(grid.querySelectorAll(".glyphtile"), function (el) { el.classList.remove("on"); });
      b.classList.add("on");
      show(G[parseInt(b.getAttribute("data-n"), 10) - 1]);
    });
  }
  [search, rankSel, planSel].forEach(function (el) {
    if (el) el.addEventListener(el.tagName === "SELECT" ? "change" : "input", paint);
  });

  var rnd = document.getElementById("spiritrandom");
  if (rnd) rnd.addEventListener("click", function () { show(G[Math.floor(Math.random() * G.length)]); });

  /* ---------- the seven planetary hierarchies ---------- */
  var host = document.getElementById("hierarchygrid");
  if (host && HI) {
    host.innerHTML = HI.map(function (h) {
      var N = h.kamea.length, sum = N * (N * N + 1) / 2;
      var rows = h.kamea.map(function (row) {
        return "<tr>" + row.map(function (v) {
          return '<td style="text-align:center;padding:.22rem .3rem;font-family:var(--mono);font-size:' +
            (N > 6 ? ".6rem" : ".72rem") + ';border:1px solid rgba(42,36,54,.9)">' + v + "</td>";
        }).join("") + "</tr>";
      }).join("");
      return '<article class="plate reveal">' +
        '<div style="display:flex;gap:.9rem;align-items:baseline">' +
        '<span style="font-size:2.1rem;color:var(--gold-lit);line-height:1">' + h.glyph + "</span>" +
        "<div><h3 style=\"margin-bottom:.1em\">" + L.esc(h.planet) + "</h3>" +
        '<p class="small dim" style="margin:0">' + L.esc(h.day) + " &#183; " + L.esc(h.metal) +
        " &#183; " + L.esc(h.sephira) + "</p></div></div>" +
        '<p class="small" style="margin-top:.9em">' + L.esc(h.virtues) + "</p>" +
        '<p class="small" style="color:#c4a0a6">' + L.esc(h.warning) + "</p>" +
        '<div style="display:flex;gap:1.1rem;flex-wrap:wrap;align-items:flex-start;margin-top:.5rem">' +
        '<table style="border-collapse:collapse;flex:0 0 auto">' + rows + "</table>" +
        '<dl class="defs small" style="flex:1 1 180px;min-width:170px;margin:0">' +
        "<dt>Angel</dt><dd>" + L.esc(h.angel) + "</dd>" +
        "<dt>Intelligence</dt><dd>" + L.esc(h.intelligence) + "</dd>" +
        "<dt>Spirit</dt><dd>" + L.esc(h.spirit) + "</dd>" +
        "<dt>Square</dt><dd>" + N + " by " + N + ", every line summing to " + sum + "</dd>" +
        "</dl></div></article>";
    }).join("");
  }
})();

/* The Tree of the Stack: ten stations, twenty-two paths, drawn to scale. */
(function () {
  "use strict";
  var T = window.TREE, LD = window.LD;
  var host = document.getElementById("tree");
  var panel = document.getElementById("station");
  if (!T || !LD || !host) return;

  var W = 620, H = 880, PAD = 54;
  function px(nd) { return PAD + nd.x * (W - PAD * 2); }
  function py(nd) { return PAD + nd.y * (H - PAD * 2); }
  var byN = {};
  T.nodes.forEach(function (nd) { byN[nd.n] = nd; });

  var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" ' +
    'aria-label="The Tree of the Stack: ten stations from intent to metal, joined by twenty-two dependencies.">';

  /* the three pillars, named */
  s += '<g font-family="JetBrains Mono, monospace" font-size="10.5" fill="#3d8c63" letter-spacing="1.6">';
  s += '<text x="' + px({ x: .24 }) + '" y="26" text-anchor="middle">WHAT IS PERMITTED</text>';
  s += '<text x="' + px({ x: .50 }) + '" y="26" text-anchor="middle">WHAT HAPPENS</text>';
  s += '<text x="' + px({ x: .76 }) + '" y="26" text-anchor="middle">WHAT WE WANT</text>';
  s += "</g>";

  /* paths first, behind the stations */
  T.paths.forEach(function (p, i) {
    var a = byN[p.a], b = byN[p.b];
    s += '<line class="tpath" data-i="' + i + '" x1="' + LD.n(px(a)) + '" y1="' + LD.n(py(a)) +
      '" x2="' + LD.n(px(b)) + '" y2="' + LD.n(py(b)) +
      '" stroke="#caa04a" stroke-width="1" opacity=".26"><title>' + LD.esc(p.note) + '</title></line>';
  });

  /* stations */
  T.nodes.forEach(function (nd) {
    var x = LD.n(px(nd)), y = LD.n(py(nd));
    s += '<g class="tnode" data-key="' + nd.key + '" tabindex="0" role="button" ' +
      'aria-label="' + LD.esc(nd.title) + '">';
    s += '<circle cx="' + x + '" cy="' + y + '" r="30" fill="#0b100e" stroke="#caa04a" stroke-width="1.3"/>';
    s += '<circle class="halo" cx="' + x + '" cy="' + y + '" r="30" fill="none" stroke="#6fe3a4" stroke-width="2" opacity="0"/>';
    s += '<text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-family="JetBrains Mono, monospace" ' +
      'font-size="15" fill="#e8cf92">' + nd.n + "</text>";
    s += '<text x="' + x + '" y="' + (y + 48) + '" text-anchor="middle" font-family="Spectral, Georgia, serif" ' +
      'font-size="13.5" fill="#e6e2d3">' + LD.esc(nd.title) + "</text>";
    s += "</g>";
  });
  s += "</svg>";
  host.innerHTML = s;

  function show(key) {
    var nd = T.nodes.filter(function (x) { return x.key === key; })[0];
    if (!nd || !panel) return;
    var links = T.paths.filter(function (p) { return p.a === nd.n || p.b === nd.n; });
    panel.innerHTML =
      '<span class="kicker">Station ' + nd.n + ' of 10</span>' +
      "<h3>" + LD.esc(nd.title) + "</h3>" +
      "<p>" + LD.esc(nd.gloss) + "</p>" +
      '<h4 style="margin-top:1.4rem">Depends on, and is depended on by</h4>' +
      "<ul class='orn small'>" + links.map(function (p) {
        var other = byN[p.a === nd.n ? p.b : p.a];
        return "<li><b>" + LD.esc(other.title) + "</b> &mdash; " + LD.esc(p.note) + "</li>";
      }).join("") + "</ul>";

    host.querySelectorAll(".tnode").forEach(function (g) {
      var on = g.dataset.key === key;
      g.classList.toggle("on", on);
      g.querySelector(".halo").setAttribute("opacity", on ? ".85" : "0");
    });
    host.querySelectorAll(".tpath").forEach(function (l) {
      var p = T.paths[+l.dataset.i];
      var on = p.a === nd.n || p.b === nd.n;
      l.setAttribute("opacity", on ? ".85" : ".13");
      l.setAttribute("stroke", on ? "#6fe3a4" : "#caa04a");
      l.setAttribute("stroke-width", on ? "1.8" : "1");
    });
  }

  host.addEventListener("click", function (e) {
    var g = e.target.closest(".tnode");
    if (g) show(g.dataset.key);
  });
  host.addEventListener("keydown", function (e) {
    var g = e.target.closest(".tnode");
    if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); show(g.dataset.key); }
  });

  show("model");
})();

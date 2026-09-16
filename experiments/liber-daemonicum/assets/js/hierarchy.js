/* The Hierarchy: the roster, each seal drawn on the spot from the daemon's own name. */
(function () {
  "use strict";
  var D = window.DAEMONS, LD = window.LD;
  var host = document.getElementById("roster");
  if (!D || !LD || !host) return;

  var html = "";
  D.forEach(function (d, i) {
    html +=
      '<article class="daemon reveal">' +
        '<div class="daemon-seal">' + LD.sealSVG(d.id, { size: 168 }) + '</div>' +
        '<div class="daemon-body">' +
          '<span class="kicker">' + roman(i + 1) + ' &middot; ' + LD.esc(d.rank) +
            ' &middot; legions <span class="num">' + LD.esc(d.legions) + '</span></span>' +
          '<h3 class="mono daemon-id">' + LD.esc(d.id) + '</h3>' +
          '<p class="daemon-office">' + LD.esc(d.office) + '</p>' +
          '<dl class="attrs">' +
            '<dt>Form</dt><dd>' + LD.esc(d.form) + '</dd>' +
            '<dt>Governs</dt><dd>' + LD.esc(d.governs) + '</dd>' +
            '<dt class="warn">Caution</dt><dd class="warn">' + LD.esc(d.caution) + '</dd>' +
          '</dl>' +
          '<button class="lnk" type="button" data-seal="' + LD.esc(d.id) + '">Take the seal &darr;</button>' +
        '</div>' +
      '</article>';
  });
  host.innerHTML = html;

  host.addEventListener("click", function (e) {
    var b = e.target.closest("[data-seal]");
    if (!b) return;
    var name = b.dataset.seal;
    LD.download(LD.sealSVG(name, { size: 512 }), "seal-" + name + ".svg");
  });

  function roman(n) {
    var m = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return m[n] || String(n);
  }
})();

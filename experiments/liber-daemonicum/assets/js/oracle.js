/* The Oracle of Six Lines.
 * Two ways to consult it, and the second is the honest one:
 *   CAST  - let the lines fall, the way an oracle is traditionally read.
 *   SET   - tell it which services are actually answering, and read the entry.
 * The second turns the book into a lookup table, which is what it always was.
 */
(function () {
  "use strict";
  var STATES = window.STATES, NAMES = window.LINE_NAMES, LD = window.LD;
  if (!STATES || !LD) return;

  var byLines = {};
  STATES.forEach(function (s) { byLines[s.lines] = s; });

  var bits = "111111".split("");
  var out = document.getElementById("reading");
  var toggles = document.getElementById("toggles");
  if (!out || !toggles) return;

  /* --- the six switches --- */
  NAMES.forEach(function (ln, i) {
    var id = "line-" + ln.key;
    var row = document.createElement("div");
    row.className = "switch";
    row.innerHTML =
      '<input type="checkbox" id="' + id + '" checked>' +
      '<label for="' + id + '">' +
      '<span class="sw-title">L' + (i + 1) + ' &middot; ' + LD.esc(ln.title) + '</span>' +
      '<span class="sw-note">' + LD.esc(ln.glyph) + ' &mdash; ' + LD.esc(ln.note) + '</span>' +
      '</label><span class="sw-state" data-for="' + id + '"></span>';
    toggles.appendChild(row);
    row.querySelector("input").addEventListener("change", function () {
      bits[i] = this.checked ? "1" : "0";
      render();
    });
  });

  function syncSwitches() {
    NAMES.forEach(function (ln, i) {
      var box = document.getElementById("line-" + ln.key);
      if (box) box.checked = bits[i] === "1";
    });
  }

  function render() {
    var key = bits.join("");
    var s = byLines[key];
    var up = bits.filter(function (b) { return b === "1"; }).length;

    /* the state pills on each switch */
    NAMES.forEach(function (ln, i) {
      var el = toggles.querySelector('[data-for="line-' + ln.key + '"]');
      if (el) {
        el.innerHTML = '<span class="pill ' + (bits[i] === "1" ? "up" : "down") + '">' +
          (bits[i] === "1" ? "answers" : "silent") + "</span>";
      }
    });

    var idx = STATES.indexOf(s) + 1;
    out.innerHTML =
      '<div class="reading-head">' +
        '<div class="reading-fig">' + LD.barsSVG(key, { w: 76, th: 7, gap: 7, width: 96, height: 79 }) + '</div>' +
        '<div>' +
          '<span class="kicker">State ' + idx + ' of 64 &middot; <span class="mono">' + key + '</span> &middot; ' +
            up + ' of 6 answering</span>' +
          '<h3 class="reading-name">' + LD.esc(s.name) + '</h3>' +
          '<p class="reading-state">' + LD.esc(s.state) + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="reading-body">' +
        '<div><h4>The judgment</h4><p>' + LD.esc(s.judgment) + '</p></div>' +
        '<div><h4>The counsel</h4><p>' + LD.esc(s.counsel) + '</p></div>' +
      '</div>';
  }

  /* --- cast: six independent falls --- */
  var castBtn = document.getElementById("cast");
  if (castBtn) {
    castBtn.addEventListener("click", function () {
      var i = 0;
      castBtn.disabled = true;
      var iv = setInterval(function () {
        bits[i] = Math.random() < 0.72 ? "1" : "0";
        i++;
        syncSwitches(); render();
        if (i >= 6) { clearInterval(iv); castBtn.disabled = false; }
      }, 130);
    });
  }
  var allBtn = document.getElementById("allwell");
  if (allBtn) {
    allBtn.addEventListener("click", function () {
      bits = "111111".split(""); syncSwitches(); render();
    });
  }

  /* --- the full index of sixty-four --- */
  var idxEl = document.getElementById("index64");
  if (idxEl) {
    var html = "";
    STATES.forEach(function (s, i) {
      html += '<button class="s64" data-lines="' + s.lines + '" type="button">' +
        LD.barsSVG(s.lines, { w: 30, th: 3, gap: 3, pad: 6, width: 42, height: 33 }) +
        '<span class="s64-n mono">' + (i + 1) + '</span>' +
        '<span class="s64-name">' + LD.esc(s.name) + '</span>' +
        '</button>';
    });
    idxEl.innerHTML = html;
    idxEl.addEventListener("click", function (e) {
      var b = e.target.closest(".s64");
      if (!b) return;
      bits = b.dataset.lines.split("");
      syncSwitches(); render();
      document.getElementById("consult").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  render();
})();

/* The Book of Changes: the coin oracle and the table of the sixty-four.
 *
 * 2026-09-16 — the cast was rewritten. Three things changed:
 *
 *   1. The coins are no longer Math.random(). Every line is decided by the
 *      querent's own gesture: the sub-millisecond timing and path of the hand
 *      during the shake, plus accelerometer samples on a device that has one.
 *      In the rite the deciding act runs through the querent's body; a button
 *      wired to a generator removes them from the causal chain entirely.
 *      Raw motion is biased, so it passes through SHA-256 as a randomness
 *      extractor — the entropy is the querent's, the distribution stays the
 *      traditional 1/8, 3/8, 3/8, 1/8.
 *
 *   2. The question is written first and locks when the first line falls.
 *
 *   3. Six separate throws, one per line, bottom upward — as it is done.
 *
 * The moving-line texts come from hexagrams.js (`lines6`). The table of
 * sixty-four and its search are unchanged.
 */
(function () {
  "use strict";
  var H = window.HEXAGRAMS, L = window.L488;
  if (!H || !L) return;

  var byLines = {};
  H.forEach(function (h) { byLines[h.lines] = h; });

  var CHG = "#d2564f";
  var NAMES = { 6: "old yin, changing", 7: "young yang", 8: "young yin", 9: "old yang, changing" };
  var ORD = ["first", "second", "third", "fourth", "fifth", "sixth"];

  /* ── which lines actually govern ─────────────────────────────────────── */
  function rubric(n, into) {
    if (n === 0) return "No line moved. Read the judgment alone; the situation is not turning into anything else.";
    if (n === 1) return "One line moved, and it governs the reading. Its text is the answer; the hexagram around it is the setting.";
    if (n === 2) return "Two lines moved. Read both — by most accounts the upper of the two carries more weight.";
    if (n === 3) return "Three lines moved. Read all three; the middle one is usually taken as central.";
    if (n === 4) return "Four lines moved. Read the two that did <em>not</em> move; the lower of them governs.";
    if (n === 5) return "Five lines moved. Read the single line that did not.";
    return "Every line moved. Read the judgment of " + L.esc(into) + " as the answer.";
  }

  /* ── the card, in the house style ────────────────────────────────────── */
  function card(h, changing, title, values) {
    var ch = changing || [];
    var s = '<div class="plate reveal seen" style="height:100%">' +
      (title ? '<span class="kicker">' + L.esc(title) + "</span>" : "") +
      '<div style="display:flex;gap:1.2rem;align-items:flex-start;flex-wrap:wrap">' +
      '<div style="flex:0 0 auto">' + L.hexSVG(h.lines, { w: 64, th: 7, gap: 8, changing: ch, width: 88, height: 78 }) + "</div>" +
      '<div style="flex:1 1 220px;min-width:200px">' +
      '<h3 style="margin-bottom:.15em">' + h.n + ". " + L.esc(h.name) + "</h3>" +
      '<p class="small dim" style="margin-bottom:.7em">' + L.esc(h.cn) + " &middot; above " +
      L.esc(h.above) + ", below " + L.esc(h.below) + "</p>" +
      "</div></div>" +
      '<h4 style="margin-top:.9rem">The Judgment</h4><p class="small">' + L.esc(h.judgment) + "</p>" +
      '<h4>The Image</h4><p class="small">' + L.esc(h.image) + "</p>" +
      '<h4>Counsel</h4><p class="small">' + L.esc(h.counsel) + "</p>";

    if (ch.length && h.lines6) {
      s += '<h4 style="margin-top:1.2rem">The moving lines</h4>';
      ch.forEach(function (i) {
        var v = values ? values[i] : null;
        s += '<div class="moveline">' +
          '<span class="mk">' + ORD[i] + " line" + (v ? " &middot; " + v : "") + "</span>" +
          '<p class="small">' + L.esc(h.lines6[i]) + "</p></div>";
      });
    }
    return s + "</div>";
  }

  /* ══ the cast ════════════════════════════════════════════════════════ */

  var castBtn = document.getElementById("cast");
  var shake = document.getElementById("shake");
  var shakeLbl = document.getElementById("shakelabel");
  var qField = document.getElementById("question");
  var out = document.getElementById("castout");
  var log = document.getElementById("castlog");
  var note = document.getElementById("castnote");

  var REQUIRED = 90;
  var pool = [], carry = null, holding = false, busy = false;
  var values = [], question = "";

  function sample(a, b, c) {
    if (!holding) return;
    pool.push(performance.now(), a || 0, b || 0, c || 0);
    if (pool.length > 4000) pool.splice(0, 2000);
    paint();
  }
  function charge() { return Math.min(1, (pool.length / 4) / REQUIRED); }

  function paint() {
    if (!shake) return;
    var c = charge();
    shake.style.setProperty("--charge", (c * 100).toFixed(1) + "%");
    shake.classList.toggle("ready", c >= 1);
    if (!shakeLbl) return;
    if (busy) shakeLbl.textContent = "…";
    else if (!question) shakeLbl.textContent = "Write your question first";
    else if (values.length >= 6) shakeLbl.textContent = "Six lines thrown";
    else if (!holding) shakeLbl.textContent = values.length ? "Hold and shake for line " + (values.length + 1) : "Hold, and shake";
    else if (c < 1) shakeLbl.textContent = "Keep shaking…";
    else shakeLbl.textContent = "Let go to throw";
  }

  /* SHA-256 over the gesture pool: the querent's entropy, uniform bits out. */
  function draw(nBits) {
    var buf = new Float64Array(pool), head = new Uint8Array(buf.buffer);
    var mix = new Uint8Array(head.length + 36);
    mix.set(head, 0);
    if (carry) mix.set(carry, head.length);
    mix.set([values.length & 255, nBits & 255], head.length + 32);
    return crypto.subtle.digest("SHA-256", mix).then(function (d) {
      carry = new Uint8Array(d);
      var bits = [];
      for (var i = 0; i < nBits; i++) bits.push((carry[i >> 3] >> (i & 7)) & 1);
      return bits;
    });
  }

  function throwLine() {
    busy = true;
    return draw(3).then(function (b) {
      var coins = b.map(function (x) { return x ? 3 : 2; });   /* yang 3 / yin 2 */
      var v = coins[0] + coins[1] + coins[2];
      values.push(v);
      pool = [];
      var moving = (v === 6 || v === 9);

      var row = document.createElement("div");
      row.className = "small";
      row.style.cssText = "display:flex;gap:.8rem;align-items:center;opacity:0;transition:opacity .5s";
      row.innerHTML = '<span class="dim" style="font-family:var(--mono);font-size:.62rem;letter-spacing:.18em">' +
        "LINE " + values.length + "</span>" +
        L.hexSVG(v === 7 || v === 9 ? "1" : "0", { w: 40, th: 5, gap: 0, width: 58, height: 12, color: moving ? CHG : L.GOLD_LIT }) +
        '<span class="dim">' + coins.join(" + ") + " = " + v + ", " + NAMES[v] + "</span>";
      log.appendChild(row);
      requestAnimationFrame(function () { row.style.opacity = "1"; });

      busy = false;
      paint();
      if (values.length === 6) setTimeout(finish, 420);
    });
  }

  function finish() {
    var primary = values.map(function (v) { return (v === 7 || v === 9) ? "1" : "0"; }).join("");
    var changing = [];
    values.forEach(function (v, ix) { if (v === 6 || v === 9) changing.push(ix); });
    var moved = primary.split("");
    changing.forEach(function (ix) { moved[ix] = moved[ix] === "1" ? "0" : "1"; });
    moved = moved.join("");

    var html = '<div class="qrecall"><span class="kicker">The question asked</span>' + L.esc(question) + "</div>";
    html += card(byLines[primary], changing, "The hexagram cast", values);
    html += '<p class="note small" style="margin:1.2rem 0">' + rubric(changing.length, changing.length === 6 ? byLines[moved].name : "") +
      ' <span class="dim">Schools differ; this is a convention, not a rule.</span></p>';
    if (changing.length) {
      html += "<div>" + card(byLines[moved], [], "Into which it changes") + "</div>" +
        '<p class="small dim" style="margin-top:.9rem">Not a prediction. The same situation read a ' +
        "second time with the moving lines settled.</p>";
    }
    html += '<div id="aiwrap" style="margin-top:1.6rem"></div>';
    html += '<p style="margin-top:1.4rem"><button class="btn ghost" id="again" type="button">Ask something else</button></p>';
    out.innerHTML = html;

    var again = document.getElementById("again");
    if (again) again.addEventListener("click", reset);
    mountAI(primary, changing);
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function reset() {
    values = []; pool = []; carry = null; question = "";
    if (qField) { qField.value = ""; qField.disabled = false; }
    log.innerHTML = ""; out.innerHTML = "";
    if (note) note.hidden = true;
    paint();
    if (qField) qField.focus();
  }

  if (qField) {
    qField.addEventListener("input", function () { question = this.value.trim(); paint(); });
  }

  if (shake) {
    shake.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      if (busy || !question || values.length >= 6) return;
      try { shake.setPointerCapture(e.pointerId); } catch (err) {}
      holding = true; pool = [];
      if (qField) qField.disabled = true;
      sample(1, 1, 1);
    });
    shake.addEventListener("pointermove", function (e) {
      sample(e.movementX || e.clientX, e.movementY || e.clientY, (e.pressure || 0) * 100);
    });
    function release() {
      if (!holding) return;
      holding = false;
      if (charge() < 1 || busy || values.length >= 6) {
        if (charge() < 1 && note) { note.hidden = false; note.textContent = "Not shaken enough. The coins have to move."; }
        pool = []; paint(); return;
      }
      if (note) note.hidden = true;
      throwLine();
    }
    shake.addEventListener("pointerup", release);
    shake.addEventListener("pointercancel", release);
    shake.addEventListener("keydown", function (e) {
      if (e.key !== " " && e.key !== "Enter") return;
      e.preventDefault();
      if (!holding) { if (busy || !question || values.length >= 6) return; holding = true; pool = []; if (qField) qField.disabled = true; }
      sample(e.timeStamp % 97, performance.now() % 89, 3);
    });
    shake.addEventListener("keyup", function (e) {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); release(); }
    });
  }

  var motionBtn = document.getElementById("motionbtn");
  if (motionBtn) {
    if (typeof DeviceMotionEvent === "undefined") motionBtn.hidden = true;
    else motionBtn.addEventListener("click", function () {
      function on() {
        window.addEventListener("devicemotion", function (e) {
          var a = e.accelerationIncludingGravity;
          if (a) sample(a.x, a.y, a.z);
        });
        motionBtn.textContent = "Shaking the device counts"; motionBtn.disabled = true;
      }
      if (typeof DeviceMotionEvent.requestPermission === "function") {
        DeviceMotionEvent.requestPermission().then(function (r) {
          if (r === "granted") on(); else motionBtn.textContent = "Motion not allowed";
        }).catch(function () { motionBtn.textContent = "Motion unavailable"; });
      } else on();
    });
  }

  /* legacy button, if the markup still carries it */
  if (castBtn) castBtn.addEventListener("click", function () {
    if (qField) qField.focus();
  });

  paint();

    /* ══ Interpret with AI ═══════════════════════════════════════════════
   * DEV STOPGAP. Routes through dev/djinn-bridge.mjs, which shells out to the
   * droplet. Not the real path: that is the Hono API calling Anthropic
   * directly, pending an API key. The button only appears on localhost.
   * Expect 30-120s, because each call is a real Slack round trip. */
  var AI_ENDPOINT = "http://127.0.0.1:8788/interpret";
  function aiAvailable() {
    return location.hostname === "127.0.0.1" || location.hostname === "localhost";
  }

  /* DJINN answers in Slack markup: *bold*, and _italic_. */
  function slackish(t) {
    return L.esc(t)
      .replace(/\*([^*\n]+)\*/g, "<b>$1</b>")
      .replace(/_([^_\n]+)_/g, "<em>$1</em>")
      .split(/\n{2,}/)
      .map(function (p) { return "<p class=\"small\">" + p.replace(/\n/g, "<br>") + "</p>"; })
      .join("");
  }

  function mountAI(primary, changing) {
    var host = document.getElementById("aiwrap");
    if (!host || !aiAvailable()) return;
    host.innerHTML = '<button class="btn" id="askai" type="button">Interpret with AI</button>' +
      '<p class="small dim" style="margin-top:.6rem">Reads this cast against the situation you described. ' +
      'Takes a minute or two.</p>';

    document.getElementById("askai").addEventListener("click", function () {
      var btn = this;
      btn.disabled = true;
      host.innerHTML = '<div class="plate"><span class="kicker">Consulting</span>' +
        '<p class="small dim" id="aiwait">Working. This takes 30 to 120 seconds.</p></div>';
      var t0 = Date.now();
      var tick = setInterval(function () {
        var el = document.getElementById("aiwait");
        if (el) el.textContent = "Working. " + Math.round((Date.now() - t0) / 1000) + "s elapsed.";
      }, 1000);

      fetch(AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question, cast: values })
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          clearInterval(tick);
          if (d.error) throw new Error(d.error);
          host.innerHTML = '<div class="plate"><span class="kicker">Read against your situation &middot; ' +
            (d.seconds || "?") + 's</span>' + slackish(d.text) +
            '<p class="small dim" style="margin-top:1rem;margin-bottom:0">A reflection, not advice. ' +
            'Anything with real money, health or legal weight still needs its own reasoning.</p></div>';
        })
        .catch(function (e) {
          clearInterval(tick);
          host.innerHTML = '<p class="note small">Could not reach the interpreter. ' +
            'Is <span class="mono">dev/djinn-bridge.mjs</span> running? <span class="dim">' +
            L.esc(e.message) + "</span></p>";
        });
    });
  }

/* ══ the table of sixty-four — unchanged ═════════════════════════════ */
  var grid = document.getElementById("hexlist");
  var detail = document.getElementById("hexdetail");
  var search = document.getElementById("hexsearch");

  function paintGrid(filter) {
    if (!grid) return;
    var q = (filter || "").trim().toLowerCase();
    var shown = H.filter(function (h) {
      if (!q) return true;
      return (h.n + " " + h.name + " " + h.cn + " " + h.above + " " + h.below).toLowerCase().indexOf(q) >= 0;
    });
    grid.innerHTML = shown.map(function (h) {
      return '<button class="hexcell" type="button" data-n="' + h.n + '">' +
        L.hexSVG(h.lines, { w: 30, th: 3.4, gap: 3.6, width: 46, height: 40 }) +
        '<span class="k">' + h.n + "</span>" +
        '<span class="nm">' + L.esc(h.name) + "</span></button>";
    }).join("");
    if (!shown.length) grid.innerHTML = '<p class="dim small">Nothing in the Book answers to that.</p>';
  }

  if (grid) {
    paintGrid("");
    grid.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-n]");
      if (!b) return;
      Array.prototype.forEach.call(grid.querySelectorAll(".hexcell"), function (el) { el.classList.remove("on"); });
      b.classList.add("on");
      var h = H[parseInt(b.getAttribute("data-n"), 10) - 1];
      detail.innerHTML = card(h, [], "Hexagram " + h.n);
      detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }
  if (search) search.addEventListener("input", function () { paintGrid(search.value); });
})();

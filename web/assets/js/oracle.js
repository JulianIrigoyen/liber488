/* The Oracle of Changes.
 *
 * ── On where the randomness comes from ────────────────────────────────────
 *
 * The objection to a digital I Ching is not that computers cannot produce
 * random numbers. It is that in the physical rite the deciding act is YOURS:
 * your hand, holding your question, at that particular moment. A button that
 * calls a random number generator while you watch has removed you from the
 * causal chain entirely. It is a vending machine with a book attached.
 *
 * So this tool does not call a generator. Every line is decided by the
 * querent's own gesture — the micro-timing and path of the hand during the
 * shake, sampled at sub-millisecond resolution, together with accelerometer
 * data if the device has one and you shake it. Those samples are the entropy.
 * You shake once per line, six times, as you would throw coins six times.
 *
 * What that claims: the determining act is yours, it runs through your body,
 * it is not repeatable, and no part of the outcome existed before you moved.
 * What it does NOT claim: that this makes the oracle work. That question is
 * not one a web page gets to settle.
 *
 * The raw gesture is not used directly — human motion is biased and would
 * skew the line probabilities. It is fed through SHA-256 as a randomness
 * extractor, which preserves the entropy you supplied while giving uniform
 * bits, so the traditional distributions come out exactly right:
 *
 *   COIN METHOD (三錢法) — three coins, six throws, built from the bottom up
 *     6 old yin    broken, changing → becomes yang   1/8
 *     7 young yang whole,  stable                    3/8
 *     8 young yin  broken, stable                    3/8
 *     9 old yang   whole,  changing → becomes yin    1/8
 *
 *   YARROW METHOD (蓍草法) — fifty stalks, three divisions per line
 *     6 = 1/16,  7 = 5/16,  8 = 7/16,  9 = 3/16
 *
 * These are NOT the same oracle. Yarrow makes moving yang three times likelier
 * than moving yin and stable yin the commonest line; coins flatten that. Both
 * are offered and neither is called the real one.
 */
(function () {
  "use strict";

  var HEX = [].concat(window.HEX_1, window.HEX_2, window.HEX_3, window.HEX_4);
  var TRI = window.TRIGRAMS, LV = window.LINE_VALUES;
  var byPattern = {};
  HEX.forEach(function (h) { byPattern[h.lines] = h; });

  var $ = function (id) { return document.getElementById(id); };
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ═══════════ the gesture as entropy ═══════════ */

  var REQUIRED = 90;          /* samples before the coins are considered shaken */
  var pool = [];              /* this line's raw gesture samples */
  var energy = 0;             /* accumulated motion, for the fill indicator */
  var carry = null;           /* chained digest, so lines cannot repeat */
  var shaking = false;
  var motionOn = false;

  function sample(a, b, c) {
    if (!shaking) return;
    var t = performance.now();
    pool.push(t, a || 0, b || 0, c || 0);
    energy += Math.abs(a || 0) + Math.abs(b || 0) + Math.abs(c || 0) + (t % 1);
    if (pool.length > 4000) pool.splice(0, 2000);
    paintCharge();
  }

  function charge() { return Math.min(1, (pool.length / 4) / REQUIRED); }

  function paintCharge() {
    var c = charge();
    $("shake").style.setProperty("--charge", (c * 100).toFixed(1) + "%");
    var lbl = $("shakelabel");
    if (!shaking && c === 0) lbl.textContent = casts.length === 0 ? "Hold, and shake" : "Hold, and shake again";
    else if (c < 1) lbl.textContent = "Keep shaking…";
    else lbl.textContent = "Let go to throw";
    $("shake").classList.toggle("ready", c >= 1);
  }

  /* SHA-256 as a randomness extractor over the gesture pool. */
  function draw(nBits) {
    var buf = new Float64Array(pool);
    var head = new Uint8Array(buf.buffer);
    var mix = new Uint8Array(head.length + 32 + 4);
    mix.set(head, 0);
    if (carry) mix.set(carry, head.length);
    var n = casts.length;
    mix.set([n & 255, (n >> 8) & 255, nBits & 255, 0], head.length + 32);
    return crypto.subtle.digest("SHA-256", mix).then(function (d) {
      carry = new Uint8Array(d);
      var bits = [], i;
      for (i = 0; i < nBits; i++) bits.push((carry[i >> 3] >> (i & 7)) & 1);
      return bits;
    });
  }

  /* ═══════════ the two methods ═══════════ */

  function castCoinLine() {
    return draw(3).then(function (b) {
      var coins = b.map(function (bit) { return bit ? 3 : 2; });   /* yang 3 / yin 2 */
      return { coins: coins, value: coins[0] + coins[1] + coins[2] };
    });
  }

  function castYarrowLine() {
    return draw(4).then(function (b) {
      var r = b[0] | (b[1] << 1) | (b[2] << 2) | (b[3] << 3);      /* 0-15, uniform */
      return { coins: null, value: r < 1 ? 6 : r < 6 ? 7 : r < 13 ? 8 : 9 };
    });
  }

  /* ═══════════ state ═══════════ */

  var method = "coins";
  var casts = [];
  var question = "";
  var journal = [];
  var busy = false;

  var KEY = "oracle.journal.v1";
  function loadJournal() {
    try {
      var raw = localStorage.getItem(KEY);
      journal = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(journal)) journal = [];
    } catch (e) { journal = []; }
  }
  function saveJournal() {
    try { localStorage.setItem(KEY, JSON.stringify(journal.slice(0, 40))); } catch (e) {}
  }

  /* ═══════════ figures ═══════════ */

  function primaryPattern(v) { return v.map(function (x) { return (x === 7 || x === 9) ? "1" : "0"; }).join(""); }
  function relatingPattern(v) {
    return v.map(function (x) {
      if (x === 6) return "1";
      if (x === 9) return "0";
      return x === 7 ? "1" : "0";
    }).join("");
  }
  function movingIndexes(v) {
    var o = []; v.forEach(function (x, i) { if (x === 6 || x === 9) o.push(i); }); return o;
  }
  function ordinal(i) { return ["first", "second", "third", "fourth", "fifth", "sixth"][i]; }

  function figure(pattern, chg) {
    chg = chg || [];
    var out = '<div class="hexfig">';
    for (var i = 5; i >= 0; i--) {
      var mark = chg.indexOf(i) >= 0 ? " chg" : "";
      out += '<div class="hb' + mark + '">' + (pattern[i] === "1" ? "<i></i>" : "<i></i><i></i>") + "</div>";
    }
    return out + "</div>";
  }

  function trigrams(pattern) {
    var lower = TRI[pattern.slice(0, 3)], upper = TRI[pattern.slice(3, 6)];
    return '<div class="trig">' +
      '<span><span class="g">' + upper.glyph + '</span><b>' + upper.en + "</b> above</span>" +
      '<span><span class="g">' + lower.glyph + '</span><b>' + lower.en + "</b> below</span>" +
      "</div>";
  }

  function hexCard(h, pattern, chg, cls, label) {
    return '<div class="hexcard ' + (cls || "") + '">' +
      '<div class="hexhead">' + figure(pattern, chg) +
        "<div>" +
          '<span class="hexnum">' + label + " &middot; Hexagram " + h.n + "</span>" +
          '<div class="hexname">' + esc(h.en) + "</div>" +
          '<div><span class="hexzh">' + esc(h.zh) + '</span><span class="hexpy">' + esc(h.py) + "</span></div>" +
        "</div>" +
      "</div>" + trigrams(pattern) + "</div>";
  }

  function rubric(n, primary, relating) {
    var t;
    if (n === 0) t = "No lines are changing, so nothing is in motion. Read the judgment of <b>" + esc(primary.en) + "</b> alone. There is no second hexagram: the situation is not turning into anything else.";
    else if (n === 1) t = "One line is changing, and it governs the reading. Its text is the specific answer; the hexagram around it is the setting.";
    else if (n === 2) t = "Two lines are changing. Read both &mdash; by most accounts the <b>upper</b> of the two carries more weight.";
    else if (n === 3) t = "Three lines are changing. Read all three; the <b>middle</b> one is usually treated as central.";
    else if (n === 4) t = "Four lines are changing, which is enough motion that the lines stop being the point. Read the <b>two lines that are not changing</b> &mdash; the lower of them governs.";
    else if (n === 5) t = "Five lines are changing. Read the <b>single line that is not</b>: the still point in a situation where everything else is moving.";
    else t = "All six lines are changing. Nothing here stays. Read the judgment of the second hexagram, <b>" + esc(relating.en) + "</b>, as the answer.";
    return '<div class="rubric">' + t + ' <span class="dim">Schools differ on this; it is a convention, not a rule.</span></div>';
  }

  /* ═══════════ rendering ═══════════ */

  function renderBuild(justCast) {
    var out = "";
    for (var i = 5; i >= 0; i--) {
      var c = casts[i];
      if (!c) {
        out += '<div class="lrow empty"><span class="lnum">' + (i + 1) + "</span>" +
          '<span class="lbars"><i></i><i></i></span><span class="lval"></span></div>';
      } else {
        var v = LV[c.value];
        var cls = "lrow" + (v.moving ? " changing" : "") + (justCast === i ? " justcast" : "");
        out += '<div class="' + cls + '"><span class="lnum">' + (i + 1) + "</span>" +
          '<span class="lbars">' + (v.yang ? "<i></i>" : "<i></i><i></i>") + "</span>" +
          '<span class="lval">' + c.value + (v.moving ? " &times;" : "") + "</span></div>";
      }
    }
    $("build").innerHTML = out;
  }

  function renderCoins(c, animate) {
    var host = $("coins");
    if (!c) {
      host.innerHTML = method === "coins"
        ? '<div class="coin"></div><div class="coin"></div><div class="coin"></div>'
        : '<div class="yarrowrest">fifty stalks, three divisions</div>';
      return;
    }
    if (method === "yarrow") {
      host.innerHTML = '<div class="yarrowrest">stalks divided &middot; <b>' + c.value + "</b></div>";
      return;
    }
    host.innerHTML = c.coins.map(function (v, i) {
      return '<div class="coin landed' + (animate ? " tossing" : "") + '" style="animation-delay:' + (i * 80) + 'ms">' +
        '<span class="face">' + (v === 3 ? "陽" : "陰") + "</span>" +
        '<span class="val">' + v + "</span></div>";
    }).join("");
  }

  /* ═══════════ the throw ═══════════ */

  function release() {
    if (!shaking) return;
    shaking = false;
    $("shake").classList.remove("held");
    if (charge() < 1 || busy || casts.length >= 6) {
      if (charge() < 1) {
        pool = []; energy = 0; paintCharge();
        $("castsum").textContent = "Not shaken enough. The coins have to move.";
      }
      return;
    }
    busy = true;
    (method === "coins" ? castCoinLine() : castYarrowLine()).then(function (c) {
      casts.push(c);
      var i = casts.length - 1;
      pool = []; energy = 0;
      renderCoins(c, true);
      renderBuild(i);
      var v = LV[c.value];
      $("castsum").innerHTML = "Line " + (i + 1) + " &middot; <b>" + c.value + "</b> &middot; " + v.name +
        (v.moving ? ' &middot; <span class="chg">changing</span>' : "");
      busy = false;
      paintCharge();
      updateControls();
      if (casts.length === 6) setTimeout(renderReading, 520);
    });
  }

  function beginShake() {
    if (busy || casts.length >= 6 || !question) return;
    shaking = true;
    pool = []; energy = 0;
    $("shake").classList.add("held");
    sample(1, 1, 1);
    paintCharge();
  }

  function updateControls() {
    var n = casts.length, ready = !!question;
    $("shake").disabled = n >= 6 || !ready;
    $("reset").disabled = n === 0 && !question;
    document.querySelectorAll("[name=method]").forEach(function (el) { el.disabled = n > 0; });
    $("question").disabled = n > 0;
    $("qhint").innerHTML = n > 0
      ? "The question is fixed for this consultation. Six throws, and no line may be thrown twice."
      : "Ask about a situation you are in, not for a yes or no. <em>What should I understand about…</em> works better than <em>Will…</em>";
    $("progress").textContent = n === 0 ? "" : n + " of 6 lines thrown";
    paintCharge();
  }

  /* ═══════════ the reading ═══════════ */

  function renderReading(saved) {
    var vals = casts.map(function (c) { return c.value; });
    var pPat = primaryPattern(vals), rPat = relatingPattern(vals);
    var primary = byPattern[pPat], relating = byPattern[rPat];
    var moving = movingIndexes(vals);
    var changed = pPat !== rPat;

    var html = '<div class="qrecall"><span class="qlabel">The question asked</span>' + esc(question) + "</div>";

    html += '<div class="hexpair">' + hexCard(primary, pPat, moving, "", "The situation");
    if (changed) html += hexCard(relating, rPat, [], "relating", "Turning toward");
    html += "</div>";

    html += '<div class="section"><h3>The judgment</h3><p class="oracle-voice">' + esc(primary.judgment) + "</p></div>";
    html += '<div class="section"><h3>The image</h3><p class="oracle-voice">' + esc(primary.image) + "</p></div>";
    html += '<div class="section"><h3>Counsel</h3><p class="oracle-voice">' + esc(primary.counsel) + "</p></div>";
    html += '<div class="section"><h3>How to read this cast</h3>' + rubric(moving.length, primary, relating) + "</div>";

    if (moving.length) {
      html += '<div class="section"><h3>The changing lines</h3>';
      moving.forEach(function (i) {
        var v = LV[vals[i]];
        html += '<div class="lineread"><span class="badge">' + ordinal(i) + " line &middot; " + vals[i] + "</span>" +
          '<div><div class="txt">' + esc(primary.lines6[i]) + "</div>" +
          '<span class="become">' + v.name + " &mdash; " + esc(v.note) + "</span></div></div>";
      });
      html += "</div>";
    } else {
      html += '<div class="section"><h3>The changing lines</h3><p class="dim">None. The figure is stable; read the judgment above and stop there.</p></div>';
    }

    if (changed) {
      html += '<div class="section"><h3>Where it is going &mdash; Hexagram ' + relating.n + ", " + esc(relating.en) + "</h3>" +
        '<p class="oracle-voice">' + esc(relating.judgment) + "</p>" +
        '<p class="small dim" style="margin-top:.8rem">Not a prediction of the outcome. It is the same situation read a second time with the moving lines settled &mdash; what the present turns into if it runs its course.</p></div>';
    }

    html += '<div class="section"><p><button class="btn quiet" id="save-txt" type="button">Save this reading</button> ' +
      '<button class="btn quiet" id="again" type="button">Ask something else</button></p></div>';

    var el = $("reading");
    el.innerHTML = html;
    el.hidden = false;
    $("again").addEventListener("click", resetAll);
    $("save-txt").addEventListener("click", function () { exportReading(primary, relating, vals, moving, changed); });

    if (!saved) {
      journal.unshift({ q: question, vals: vals, m: method, t: Date.now(), n: primary.n, en: primary.en });
      saveJournal();
      renderJournal();
    }
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ═══════════ export ═══════════ */

  function readingText(primary, relating, vals, moving, changed) {
    var L = ["THE ORACLE OF CHANGES", new Date().toLocaleString(), "", "QUESTION", question, "",
      "METHOD: " + (method === "coins" ? "three coins" : "yarrow stalks"),
      "CAST (bottom line first): " + vals.join(" "), "",
      "HEXAGRAM " + primary.n + " — " + primary.en + " (" + primary.zh + " " + primary.py + ")", "",
      "Judgment: " + primary.judgment, "", "Image: " + primary.image, "", "Counsel: " + primary.counsel];
    if (moving.length) {
      L.push("", "CHANGING LINES");
      moving.forEach(function (i) {
        L.push("", "  Line " + (i + 1) + " (" + vals[i] + ", " + LV[vals[i]].name + "): " + primary.lines6[i]);
      });
    }
    if (changed) L.push("", "TURNING TOWARD — HEXAGRAM " + relating.n + " — " + relating.en, "", relating.judgment);
    L.push("", "--", "Interpretive text original to this tool; not a translation.");
    return L.join("\n");
  }

  function exportReading(primary, relating, vals, moving, changed) {
    var text = readingText(primary, relating, vals, moving, changed);
    var name = "reading-" + primary.n + "-" + new Date().toISOString().slice(0, 10) + ".txt";
    var p = (window.claude && window.claude.use) ? window.claude.use("downloads") : Promise.resolve(null);
    p.then(function (d) {
      if (d && d.save) return d.save({ filename: name, data: text });
      return fallbackCopy(text);
    }).catch(function () { fallbackCopy(text); });
  }

  function fallbackCopy(text) {
    var btn = $("save-txt");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        if (btn) { btn.textContent = "Copied to clipboard"; setTimeout(function () { btn.textContent = "Save this reading"; }, 2200); }
      });
    }
  }

  /* ═══════════ journal ═══════════ */

  function renderJournal() {
    var host = $("journal");
    if (!journal.length) {
      host.innerHTML = '<p class="small dim">Readings you cast are kept here, in this browser only. Nothing is sent anywhere.</p>';
      return;
    }
    host.innerHTML = journal.slice(0, 12).map(function (r, i) {
      var d = new Date(r.t);
      return '<button class="jitem" data-i="' + i + '" type="button">' +
        '<span class="jq">' + esc(r.q) + "</span>" +
        '<span class="jm">' + r.n + " &middot; " + esc(r.en) + " &middot; " +
        d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + "</span></button>";
    }).join("") + '<button class="ghostbtn" id="clearj" type="button" style="margin-top:.5rem">Clear the journal</button>';

    host.querySelectorAll(".jitem").forEach(function (b) {
      b.addEventListener("click", function () {
        var r = journal[+b.dataset.i];
        question = r.q; method = r.m || "coins";
        casts = r.vals.map(function (v) { return { coins: null, value: v }; });
        $("question").value = question;
        var mEl = document.querySelector('[name=method][value="' + method + '"]');
        if (mEl) mEl.checked = true;
        renderBuild(); renderCoins(null); updateControls();
        $("castsum").textContent = "Recalled from the journal — not re-thrown.";
        renderReading(true);
      });
    });
    var cj = $("clearj");
    if (cj) cj.addEventListener("click", function () { journal = []; saveJournal(); renderJournal(); });
  }

  /* Asking the same thing again is, traditionally, not asking. */
  function repeatWarning(q) {
    var norm = q.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
    var since = Date.now() - 1000 * 60 * 60 * 24;
    var prior = journal.filter(function (r) {
      return r.t > since && r.q.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim() === norm;
    });
    var el = $("repeat");
    if (prior.length) {
      el.hidden = false;
      el.innerHTML = "You asked this within the last day, and drew Hexagram " + prior[0].n +
        ". <b>Ask once and receive an answer; ask the same question three times and you are not asking, you are avoiding.</b> " +
        "You may throw again — nothing here will stop you — but the tradition would say the second answer is about the asking.";
    } else el.hidden = true;
  }

  function resetAll() {
    casts = []; pool = []; energy = 0; carry = null; shaking = false;
    $("reading").hidden = true;
    $("reading").innerHTML = "";
    $("castsum").textContent = "";
    renderBuild(); renderCoins(null); updateControls();
    $("question").focus();
    document.querySelector(".console").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ═══════════ wiring ═══════════ */

  function init() {
    loadJournal();
    renderJournal();
    renderBuild();
    renderCoins(null);

    var q = $("question");
    question = q.value.trim();          /* the browser may restore this on reload */
    q.addEventListener("input", function () {
      question = this.value.trim();
      updateControls();
      repeatWarning(question);
    });

    document.querySelectorAll("[name=method]").forEach(function (el) {
      el.addEventListener("change", function () { method = this.value; renderCoins(null); });
    });

    var sh = $("shake");
    sh.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      try { sh.setPointerCapture(e.pointerId); } catch (err) { /* capture is an optimisation, not a requirement */ }
      beginShake();
    });
    sh.addEventListener("pointermove", function (e) { sample(e.movementX || e.clientX, e.movementY || e.clientY, e.pressure || 0); });
    sh.addEventListener("pointerup", release);
    sh.addEventListener("pointercancel", release);
    sh.addEventListener("pointerleave", function () { if (shaking) sample(7, 7, 7); });
    /* keyboard: hold the key, the hold's timing is the entropy */
    sh.addEventListener("keydown", function (e) {
      if (e.key !== " " && e.key !== "Enter") return;
      e.preventDefault();
      if (!shaking) beginShake(); else sample(e.timeStamp % 97, performance.now() % 89, 3);
    });
    sh.addEventListener("keyup", function (e) {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); release(); }
    });

    /* accelerometer, where the device has one and the user allows it */
    var mb = $("motionbtn");
    function enableMotion() {
      window.addEventListener("devicemotion", function (e) {
        var a = e.accelerationIncludingGravity;
        if (a) sample(a.x, a.y, a.z);
      });
      motionOn = true;
      if (mb) { mb.textContent = "Shaking the device counts"; mb.disabled = true; }
    }
    if (mb) {
      if (typeof DeviceMotionEvent === "undefined") mb.hidden = true;
      else if (typeof DeviceMotionEvent.requestPermission === "function") {
        mb.addEventListener("click", function () {
          DeviceMotionEvent.requestPermission().then(function (r) {
            if (r === "granted") enableMotion(); else mb.textContent = "Motion not allowed";
          }).catch(function () { mb.textContent = "Motion unavailable"; });
        });
      } else { enableMotion(); }
    }

    $("reset").addEventListener("click", resetAll);

    var t = $("theme");
    if (t) t.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme");
      var next = cur === "dark" ? "light" : cur === "light" ? "dark"
        : (matchMedia("(prefers-color-scheme: dark)").matches ? "light" : "dark");
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("oracle.theme", next); } catch (e) {}
    });
    try {
      var saved = localStorage.getItem("oracle.theme");
      if (saved) document.documentElement.setAttribute("data-theme", saved);
    } catch (e) {}

    updateControls();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

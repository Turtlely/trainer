(function () {
  "use strict";

  const ALL_PROBLEMS = window.PROBLEMS.slice().sort((a, b) => a.id - b.id);
  const ALL_BY_ID = new Map(ALL_PROBLEMS.map((p) => [p.id, p]));
  const DIFFS = ["Easy", "Medium", "Hard"];
  const DIFF_COLOR = { Easy: "var(--easy)", Medium: "var(--medium)", Hard: "var(--hard)" };
  const STORE_KEY = "probtrainer.v1";
  const UI_KEY = "probtrainer.ui.v1";

  // ---------------------------------------------------------------- storage
  function safeGet(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
  function safeSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ } }

  const store = Object.assign({ problems: {}, theme: "dark" }, safeGet(STORE_KEY) || {});
  const ui = Object.assign(
    { q: "", diff: "", status: "", topics: [], sort: "id", dir: 1, starredOnly: false, lec: "" },
    safeGet(UI_KEY) || {}
  );
  const save = () => safeSet(STORE_KEY, store);
  const saveUi = () => safeSet(UI_KEY, ui);

  // The active course decides which problems, lectures, and exams every view shows.
  // A link to a problem of another course switches to that course.
  const linked = location.hash.match(/^#\/problem\/(\d+)/);
  if (linked && ALL_BY_ID.has(+linked[1])) ui.course = courseOf(ALL_BY_ID.get(+linked[1]));
  if (!COURSES[ui.course]) ui.course = DEFAULT_COURSE;
  const COURSE = COURSES[ui.course];
  const PROBLEMS = ALL_PROBLEMS.filter((p) => courseOf(p) === COURSE.code);
  const BY_ID = new Map(PROBLEMS.map((p) => [p.id, p]));
  saveUi();

  function switchCourse(code, hash = "#/") {
    if (code === ui.course) return;
    Object.assign(ui, { course: code, lec: "", topics: [], q: "" });
    saveUi();
    location.hash = hash;
    location.reload();
  }

  function rec(id) {
    if (!store.problems[id]) store.problems[id] = { submissions: [] };
    return store.problems[id];
  }
  const peek = (id) => store.problems[id] || null;
  // The first solve records the active time spent until then (r.time, counted by the problem timer).
  function markSolved(r) {
    if (r.status !== "solved") { r.solvedAt = Date.now(); r.solveTime = r.time || 0; }
    r.status = "solved";
  }
  const statusOf = (id) => (peek(id) && peek(id).status) || "todo";

  // ---------------------------------------------------------------- helpers
  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // Paragraphs split on blank lines. A paragraph that starts with ~~~ is a code block, and
  // [[text]] inside a paragraph is inline code. (Problem text lives in template literals,
  // so backtick markers are not usable.) KaTeX skips both.
  // The lookahead lets code end in "]", as in [[Mem[0x324]]].
  // Other block forms (used by the official problems):
  //   "@fig name"        a figure from js/fig.js (window.FIGS); one name per line
  //   "| a | b |" lines  a table; a "|---|" second row makes the first row a header.
  //                      A first line "{plain}" drops the bold first column.
  //   "- item" lines     a bullet list
  // and **text** is bold. Write \$ for a literal dollar sign.
  const inlineCode = (s) => esc(s).replace(/\[\[(.+?)\]\](?!\])/g, "<code>$1</code>").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    // "\$" is a literal dollar sign: alone in its own text node, KaTeX does not pair it.
    .replace(/\\\$/g, "<span>$$</span>");
  function table(p) {
    const lines = p.split("\n");
    const plain = lines[0].trim() === "{plain}";
    if (plain) lines.shift();
    const rows = lines.map((l) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim()));
    const head = rows.length > 1 && rows[1].every((c) => /^:?-{3,}:?$/.test(c));
    const cell = (tag, c) => (c ? `<${tag}>${inlineCode(c)}</${tag}>` : `<${tag} class="blank"></${tag}>`);
    const body = (head ? rows.slice(2) : rows).map((r) => `<tr>${r.map((c) => cell("td", c)).join("")}</tr>`).join("");
    return `<div class="tbl-wrap"><table class="tbl${plain ? " plain" : ""}">${head
      ? `<thead><tr>${rows[0].map((c) => cell("th", c)).join("")}</tr></thead>` : ""}<tbody>${body}</tbody></table></div>`;
  }
  const block = (p) => {
    if (p.startsWith("~~~")) return `<pre class="code">${esc(p.replace(/^~~~[^\n]*\n?/, "").replace(/\n?~~~\s*$/, ""))}</pre>`;
    if (p.startsWith("@fig ")) return p.trim().split("\n").map((l) => (window.FIGS || {})[l.slice(5).trim()]
      || `<p class="muted">[missing figure ${esc(l)}]</p>`).join("");
    if (p.startsWith("|") || p.startsWith("{plain}")) return table(p);
    if (p.startsWith("- ")) return `<ul>${p.split(/\n(?=- )/).map((li) => `<li>${inlineCode(li.slice(2))}</li>`).join("")}</ul>`;
    return `<p>${inlineCode(p)}</p>`;
  };
  // A code block may hold blank lines: it runs from "~~~" to the next line that is "~~~".
  const paras = (text) => {
    const out = [];
    let code = null;
    const closes = (c) => /\n~~~\s*$/.test(c) || c.trim() === "~~~";
    for (const chunk of text.trim().split(/\n\s*\n/)) {
      if (code !== null) {
        code += "\n\n" + chunk;
        if (closes(chunk)) { out.push(block(code)); code = null; }
      } else if (chunk.startsWith("~~~") && !closes(chunk)) code = chunk;
      else out.push(block(chunk));
    }
    if (code !== null) out.push(block(code));
    return out.join("");
  };

  function typeset(el) {
    if (window.renderMathInElement) {
      window.renderMathInElement(el, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
      });
    } else {
      window.addEventListener("load", () => typeset(el), { once: true });
    }
  }

  function toast(msg) {
    document.querySelectorAll(".toast").forEach((t) => t.remove());
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  }

  function timeAgo(ts) {
    const s = Math.round((Date.now() - ts) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
    return new Date(ts).toLocaleDateString();
  }

  const ICONS = {
    solved: `<svg class="status-icon st-solved" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
    attempted: `<svg class="status-icon st-attempted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2" stroke-linecap="round"/></svg>`,
    todo: "",
  };

  const answerValue = (p) => {
    if (p._value === undefined) p._value = Expr.evaluate(p.answer);
    return p._value;
  };

  // A real (official) problem can have several graded parts. Submissions to a part carry its
  // index; a submission without a part (a single answer, or "mark solved") solves the problem.
  const solvedBy = (p, subs) => subs.some((s) => s.result === "correct" && s.part === undefined)
    || !!(p && p.parts && p.parts.length && p.parts.every((_, i) => subs.some((s) => s.part === i && s.result === "correct")));
  const SOURCES = { quiz: "Past quiz", worksheet: "Worksheet", practice: "Written practice" };
  const srcOf = (p) => p.real || "practice";
  const HAS_REAL = PROBLEMS.some((p) => p.real);
  const srcPill = (p) => (p.real ? `<span class="pill src-pill src-${p.real}">${SOURCES[p.real]}</span>` : "");

  const tolText = (p) => (p.tol === 0 ? "exact" : `${+((p.tol || 5e-4) * 100).toPrecision(3)}%`);

  const lecLabel = (n) => {
    const l = COURSE.lecture(n);
    return l ? `L${n}. ${l.title}` : "";
  };

  function formatNumber(v) {
    if (Number.isInteger(v)) return String(v);
    const a = Math.abs(v);
    if (a >= 1e6 || a < 1e-4) return v.toExponential(6);
    return String(+v.toPrecision(8));
  }

  function dailyProblem() {
    const d = new Date();
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    let h = seed;
    h = ((h >>> 16) ^ h) * 0x45d9f3b;
    h = ((h >>> 16) ^ h) * 0x45d9f3b;
    h = (h >>> 16) ^ h;
    return PROBLEMS[Math.abs(h) % PROBLEMS.length];
  }

  function randomProblem(pool) {
    const unsolved = pool.filter((p) => statusOf(p.id) !== "solved");
    const from = unsolved.length ? unsolved : pool;
    return from[Math.floor(Math.random() * from.length)];
  }

  // ---------------------------------------------------------------- theme
  function applyTheme() { document.documentElement.dataset.theme = store.theme; }
  $("#themeBtn").addEventListener("click", () => {
    store.theme = store.theme === "dark" ? "light" : "dark";
    applyTheme();
    save();
  });
  applyTheme();

  const courseSel = $("#courseSel");
  courseSel.innerHTML = Object.values(COURSES).map((c) =>
    `<option value="${esc(c.code)}">${esc(c.code)} ${esc(c.name)}</option>`).join("");
  courseSel.value = COURSE.code;
  courseSel.onchange = () => switchCourse(courseSel.value);
  $('[data-nav="course"]').textContent = COURSE.code;

  $("#randomBtn").addEventListener("click", () => {
    location.hash = `#/problem/${randomProblem(filtered()).id}`;
  });

  // ---------------------------------------------------------------- list view
  const ALL_TOPICS = (() => {
    const m = new Map();
    PROBLEMS.forEach((p) => p.topics.forEach((t) => m.set(t, (m.get(t) || 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  })();

  // Lecture filter values: "5" (one lecture), "extra" (no lecture), or an exam id ("quiz2").
  function inLecFilter(p, v) {
    if (v === "extra") return !p.lec;
    const exam = COURSE.exams[v];
    if (exam) return exam.ids ? exam.ids.includes(p.id) : p.lec >= exam.from && p.lec <= exam.to;
    return p.lec === +v;
  }

  function filtered() {
    const q = ui.q.trim().toLowerCase();
    let list = PROBLEMS.filter((p) => {
      if (ui.diff && p.diff !== ui.diff) return false;
      if (ui.lec && !inLecFilter(p, ui.lec)) return false;
      if (HAS_REAL && ui.src && srcOf(p) !== ui.src) return false;
      if (ui.status && statusOf(p.id) !== ui.status) return false;
      if (ui.starredOnly && !(peek(p.id) && peek(p.id).starred)) return false;
      if (ui.topics.length && !ui.topics.every((t) => p.topics.includes(t))) return false;
      if (q && !(`${p.id}. ${p.title}`.toLowerCase().includes(q) || p.topics.some((t) => t.toLowerCase().includes(q)))) return false;
      return true;
    });
    const key = {
      id: (p) => p.id,
      title: (p) => p.title.toLowerCase(),
      diff: (p) => DIFFS.indexOf(p.diff),
      status: (p) => ["solved", "attempted", "todo"].indexOf(statusOf(p.id)),
    }[ui.sort] || ((p) => p.id);
    list.sort((a, b) => {
      const ka = key(a), kb = key(b);
      return (ka < kb ? -1 : ka > kb ? 1 : a.id - b.id) * ui.dir;
    });
    return list;
  }

  function counts() {
    const c = { total: PROBLEMS.length, solved: 0 };
    DIFFS.forEach((d) => (c[d] = { total: 0, solved: 0 }));
    PROBLEMS.forEach((p) => {
      c[p.diff].total++;
      if (statusOf(p.id) === "solved") { c.solved++; c[p.diff].solved++; }
    });
    return c;
  }

  function ringSvg(c) {
    const R = 48, C = 2 * Math.PI * R;
    let offset = 0;
    const arcs = DIFFS.map((d) => {
      const len = (c[d].solved / c.total) * C;
      const s = `<circle cx="55" cy="55" r="${R}" fill="none" stroke="${DIFF_COLOR[d]}" stroke-width="7"
        stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-offset}" stroke-linecap="butt"/>`;
      offset += len;
      return s;
    }).join("");
    return `<svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r="${R}" fill="none" stroke="var(--chip)" stroke-width="7"/>${arcs}</svg>`;
  }

  function sidePanel() {
    const c = counts();
    const daily = dailyProblem();
    const bars = DIFFS.map((d) => `
      <div class="bar-row">
        <div class="lbl"><span class="diff-${d}">${d}</span><span>${c[d].solved}/${c[d].total}</span></div>
        <div class="bar"><div style="width:${(100 * c[d].solved) / c[d].total}%;background:${DIFF_COLOR[d]}"></div></div>
      </div>`).join("");
    return `
      <div class="card">
        <h3>Progress</h3>
        <div class="ring-wrap">
          <div class="ring">${ringSvg(c)}
            <div class="center"><div><div class="big">${c.solved}</div><div class="small">/ ${c.total} solved</div></div></div>
          </div>
          <div class="bars">${bars}</div>
        </div>
      </div>
      <div class="card">
        <h3>Problem of the Day</h3>
        <a href="#/problem/${daily.id}" class="daily">
          <div>${daily.id}. ${esc(daily.title)} ${statusOf(daily.id) === "solved" ? ICONS.solved : ""}</div>
          <div class="diff-${daily.diff}" style="font-size:12px">${daily.diff}</div>
        </a>
      </div>
      <div class="card">
        <h3>Data</h3>
        <div class="row-btns">
          <button class="btn ghost" data-act="export">Export</button>
          <button class="btn ghost" data-act="import">Import</button>
          <button class="btn ghost" data-act="reset">Reset</button>
        </div>
        <div class="meta">Progress is saved in this browser only. Use Export to back it up or move it to another device.</div>
      </div>`;
  }

  function renderList() {
    const app = $("#app");
    app.innerHTML = `
      <div class="page">
        <section>
          <div class="topics" id="topics"></div>
          <div class="filters">
            <select id="fDiff"><option value="">Difficulty</option>${DIFFS.map((d) => `<option>${d}</option>`).join("")}</select>
            <select id="fStatus">
              <option value="">Status</option><option value="todo">Todo</option>
              <option value="attempted">Attempted</option><option value="solved">Solved</option>
            </select>
            <select id="fStar"><option value="">All problems</option><option value="1">Starred</option></select>
            <select id="fLec" title="${esc(COURSE.code)} lecture">
              <option value="">All lectures</option>
              <optgroup label="Exam scope">${Object.entries(COURSE.exams).map(([id, e]) =>
                `<option value="${id}">${esc(e.name)}${e.ids ? "" : ` (L${e.from}-L${e.to})`}</option>`).join("")}</optgroup>
              ${COURSE.units.map((u) => `<optgroup label="${esc(u.name)}">${u.lectures.map((l) =>
                `<option value="${l.n}">L${l.n}. ${esc(l.title)}</option>`).join("")}</optgroup>`).join("")}
              ${COURSE.extras ? `<option value="extra">${esc(COURSE.extras.option)}</option>` : ""}
            </select>
            ${HAS_REAL ? `<select id="fSrc" title="Where the problem comes from"><option value="">All sources</option>
              ${Object.entries(SOURCES).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select>` : ""}
            <input id="fQ" type="search" placeholder="Search questions   ( / )" />
            <button class="btn ghost" id="fClear">Clear</button>
            <span class="count" id="fCount"></span>
          </div>
          <table class="table">
            <thead><tr>
              <th class="col-status" data-sort="status">Status</th>
              <th data-sort="title">Title</th>
              <th class="col-tags">Topics</th>
              <th class="col-diff" data-sort="diff">Difficulty</th>
              <th class="col-star"></th>
            </tr></thead>
            <tbody id="rows"></tbody>
          </table>
        </section>
        <aside class="side">${sidePanel()}</aside>
      </div>`;

    $("#fDiff").value = ui.diff;
    $("#fStatus").value = ui.status;
    $("#fStar").value = ui.starredOnly ? "1" : "";
    $("#fQ").value = ui.q;
    $("#fLec").value = ui.lec || "";
    $("#fLec").onchange = (e) => { ui.lec = e.target.value; refresh(); };
    if (HAS_REAL) {
      $("#fSrc").value = ui.src || "";
      $("#fSrc").onchange = (e) => { ui.src = e.target.value; refresh(); };
    }

    const refresh = () => { saveUi(); drawTopics(); drawRows(); };
    $("#fDiff").onchange = (e) => { ui.diff = e.target.value; refresh(); };
    $("#fStatus").onchange = (e) => { ui.status = e.target.value; refresh(); };
    $("#fStar").onchange = (e) => { ui.starredOnly = !!e.target.value; refresh(); };
    $("#fQ").oninput = (e) => { ui.q = e.target.value; refresh(); };
    $("#fClear").onclick = () => {
      Object.assign(ui, { q: "", diff: "", status: "", topics: [], starredOnly: false, lec: "", src: "" });
      renderList(); saveUi();
    };
    app.querySelectorAll("th[data-sort]").forEach((th) => {
      th.onclick = () => {
        const k = th.dataset.sort;
        if (ui.sort === k) ui.dir = -ui.dir; else { ui.sort = k; ui.dir = 1; }
        refresh();
      };
    });
    app.querySelector(".side").addEventListener("click", onDataAction);

    drawTopics();
    drawRows();
  }

  function drawTopics() {
    const el = $("#topics");
    const SHOWN = 12;
    const shown = ui.allTopics ? ALL_TOPICS : ALL_TOPICS.filter(([t], i) => i < SHOWN || ui.topics.includes(t));
    el.innerHTML = shown.map(([t, n]) =>
      `<span class="topic-chip ${ui.topics.includes(t) ? "on" : ""}" data-topic="${esc(t)}">${esc(t)}<span class="n">${n}</span></span>`
    ).join("") + `<span class="topic-chip more" data-more="1">${ui.allTopics ? "Fewer ▴" : `+${ALL_TOPICS.length - SHOWN} more ▾`}</span>`;
    el.onclick = (e) => {
      if (e.target.closest("[data-more]")) { ui.allTopics = !ui.allTopics; saveUi(); drawTopics(); return; }
      const chip = e.target.closest(".topic-chip");
      if (!chip) return;
      const t = chip.dataset.topic;
      ui.topics = ui.topics.includes(t) ? ui.topics.filter((x) => x !== t) : [...ui.topics, t];
      saveUi(); drawTopics(); drawRows();
    };
  }

  function drawRows() {
    const list = filtered();
    document.querySelectorAll("th[data-sort]").forEach((th) => {
      const on = th.dataset.sort === ui.sort;
      th.classList.toggle("sorted", on);
      th.textContent = th.textContent.replace(/ [↑↓]$/, "") + (on ? (ui.dir > 0 ? " ↑" : " ↓") : "");
    });
    $("#fCount").textContent = `${list.length} of ${PROBLEMS.length}`;
    const body = $("#rows");
    if (!list.length) {
      body.innerHTML = `<tr><td colspan="5" class="empty">No problems match these filters.</td></tr>`;
      return;
    }
    body.innerHTML = list.map((p) => {
      const r = peek(p.id);
      return `<tr data-id="${p.id}">
        <td class="col-status" title="${statusOf(p.id)}">${ICONS[statusOf(p.id)]}</td>
        <td class="title"><a href="#/problem/${p.id}">${p.id}. ${esc(p.title)}</a> ${srcPill(p)}</td>
        <td class="tags-cell">${p.topics.map(esc).join(" · ")}</td>
        <td class="col-diff diff-${p.diff}">${p.diff}</td>
        <td class="col-star"><button class="star ${r && r.starred ? "on" : ""}" data-star="${p.id}" title="Star">${r && r.starred ? "★" : "☆"}</button></td>
      </tr>`;
    }).join("");
    body.onclick = (e) => {
      const star = e.target.closest("[data-star]");
      if (star) {
        e.stopPropagation();
        const r = rec(+star.dataset.star);
        r.starred = !r.starred;
        save(); drawRows();
        return;
      }
      const tr = e.target.closest("tr[data-id]");
      if (tr && !e.target.closest("a")) location.hash = `#/problem/${tr.dataset.id}`;
    };
  }

  function onDataAction(e) {
    const act = e.target.dataset && e.target.dataset.act;
    if (!act) return;
    if (act === "export") {
      const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `probtrainer-progress-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    } else if (act === "import") {
      const inp = document.createElement("input");
      inp.type = "file";
      inp.accept = "application/json,.json";
      inp.onchange = async () => {
        try {
          const data = JSON.parse(await inp.files[0].text());
          if (!data || typeof data.problems !== "object") throw new Error("bad file");
          store.problems = data.problems;
          save(); route(); toast("Progress imported");
        } catch { toast("Could not read that file"); }
      };
      inp.click();
    } else if (act === "reset") {
      if (confirm("Delete all progress, notes, and submissions?")) {
        store.problems = {};
        save(); route(); toast("Progress reset");
      }
    }
  }

  // ---------------------------------------------------------------- problem view
  let timerHandle = null;
  const IDLE_MS = 5 * 60 * 1000;
  let lastInput = Date.now();
  for (const ev of ["keydown", "pointerdown", "pointermove", "wheel", "scroll"]) {
    addEventListener(ev, () => { lastInput = Date.now(); }, { passive: true, capture: true });
  }
  // Keep the last few seconds of timer counts when the tab closes or hides.
  addEventListener("pagehide", () => save());
  document.addEventListener("visibilitychange", () => { if (document.hidden) save(); });

  const partDone = (r, i) => r.submissions.some((s) => s.part === i && s.result === "correct");

  function realAnswerBox(p) {
    const r = rec(p.id);
    const rows = p.parts.map((q, i) => `
      <div class="part-row ${partDone(r, i) ? "ok" : ""}" data-part="${i}">
        <label for="part${i}">${inlineCode(q.q)}</label>
        <input id="part${i}" class="answer-input part-input" autocomplete="off" spellcheck="false"
          placeholder="${partDone(r, i) ? "Correct ✓" : q.tol === 0 ? "exact" : "number or fraction"}" />
        <span class="part-mark">${partDone(r, i) ? "✓" : ""}</span>
      </div>`).join("");
    return `<div class="answer-box">
      ${p.parts.length ? `<label>Graded parts. Work on paper first, then enter each value.</label>
        <div class="parts">${rows}</div>` : ""}
      <p class="muted self-note">${p.parts.length
        ? "Diagrams, code, and tables are self-checked: compare them with the official solution."
        : "This problem has no single-number parts. Work it on paper, compare with the official solution, then mark it solved."}</p>
      <div class="answer-actions">
        ${p.parts.length ? `<button class="btn primary" id="submit">Check answers</button>` : ""}
        <span class="spacer"></span>
        <button class="btn ghost" id="markBtn"></button>
      </div>
      <div id="verdict"></div>
      <div class="syntax-help">Accepted: numbers, fractions like <code>1/27</code>, hex <code>0x1D</code>, binary <code>0b101</code>.
        Integer parts must match exactly.</div>
    </div>`;
  }

  // Grades every filled part box. The problem is solved when all parts have a correct answer.
  function wireParts(p, r, redraw) {
    const btn = $("#submit");
    if (!btn) return;
    const check = () => {
      let graded = 0, right = 0, bad = "";
      p.parts.forEach((q, i) => {
        const inp = $(`#part${i}`);
        const s = inp.value.trim();
        if (!s) return;
        let v;
        try { v = Expr.evaluate(s); } catch (err) { bad = `${q.q}: ${err.message}`; return; }
        const result = Expr.compare(v, Expr.evaluate(q.answer), q.tol);
        r.submissions.unshift({ t: Date.now(), input: `${q.q.replace(/\$/g, "")} = ${s}`, value: v, result, part: i });
        graded++;
        if (result === "correct") { right++; inp.value = ""; }
        const row = inp.closest(".part-row");
        row.classList.toggle("ok", result === "correct" || partDone(r, i));
        row.classList.toggle("bad", result !== "correct");
        row.querySelector(".part-mark").textContent = result === "correct" ? "✓" : result === "close" ? "≈" : "✗";
      });
      if (!graded) {
        if (bad) $("#verdict").innerHTML = `<div class="verdict wrong">Cannot read that<span class="sub">${esc(bad)}</span></div>`;
        return;
      }
      const all = solvedBy(p, r.submissions);
      if (all) markSolved(r);
      else if (r.status !== "solved") r.status = "attempted";
      save();
      const left = p.parts.filter((_, i) => !partDone(r, i)).length;
      $("#verdict").innerHTML = all
        ? `<div class="verdict correct">Accepted<span class="sub">Every graded part is correct.</span></div>`
        : `<div class="verdict ${right ? "close" : "wrong"}">${right} of ${graded} correct<span class="sub">${left} part${left === 1 ? "" : "s"} still open.${bad ? " " + esc(bad) : ""}</span></div>`;
      redraw();
    };
    btn.onclick = check;
    document.querySelectorAll(".part-input").forEach((inp) => {
      inp.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); check(); } };
    });
    typeset($(".parts"));
  }

  function renderProblem(id, tab) {
    const p = BY_ID.get(id);
    if (!p) {
      if (ALL_BY_ID.has(id)) switchCourse(courseOf(ALL_BY_ID.get(id)), location.hash);
      else location.hash = "#/";
      return;
    }
    const r = rec(id);
    tab = tab || "description";
    const idx = PROBLEMS.indexOf(p);
    const prev = PROBLEMS[(idx - 1 + PROBLEMS.length) % PROBLEMS.length];
    const next = PROBLEMS[(idx + 1) % PROBLEMS.length];

    $("#app").innerHTML = `
      <div class="workspace" id="ws">
        <section class="pane">
          <div class="tabs" id="ltabs">
            <button class="tab" data-tab="description">Description</button>
            <button class="tab" data-tab="hints">Hints (${p.hints.length})</button>
            <button class="tab" data-tab="solution">Solution</button>
            <button class="tab" data-tab="notes">Notes</button>
          </div>
          <div class="pane-body" id="lbody"></div>
          <div class="pbar">
            <a class="btn ghost" href="#/" title="Problem list">☰ List</a>
            <a class="btn ghost icon" href="#/problem/${prev.id}" title="Previous (Alt+←)">‹</a>
            <a class="btn ghost icon" href="#/problem/${next.id}" title="Next (Alt+→)">›</a>
            <span class="spacer"></span>
            <span class="timer" id="timer" title="Active time on this problem, all visits (pauses after 5 idle minutes)">00:00</span>
            <button class="btn ghost icon star ${r.starred ? "on" : ""}" id="pStar" title="Star">${r.starred ? "★" : "☆"}</button>
          </div>
        </section>
        <div class="gutter" id="gutter"></div>
        <section class="pane">
          <div class="tabs"><button class="tab on">Answer</button></div>
          ${p.real ? realAnswerBox(p) : `<div class="answer-box">
            <label for="ans">Your answer: a number or exact expression</label>
            <input id="ans" class="answer-input" autocomplete="off" spellcheck="false" placeholder="${esc(COURSE.answerPlaceholder)}" />
            <div class="preview" id="preview">&nbsp;</div>
            <div class="answer-actions">
              <button class="btn primary" id="submit">Submit</button>
              <span class="spacer"></span>
              <button class="btn ghost" id="markBtn"></button>
            </div>
            <div id="verdict"></div>
            <div class="syntax-help">Accepted: <code>+ - * / ^ !</code> <code>( )</code> <code>pi</code> <code>e</code>
              <code>sqrt()</code> <code>ln()</code> <code>exp()</code> <code>C(n,k)</code> <code>50%</code> <code>0x1F</code> <code>0b101</code>.
              ${p.tol === 0 ? "This answer must match exactly." : `Answers within ${tolText(p)} relative error are accepted.`}</div>
          </div>`}
          <div class="subs" id="subs"></div>
        </section>
      </div>`;

    // left tabs
    const drawTab = (name) => {
      tab = name;
      document.querySelectorAll("#ltabs .tab").forEach((b) => b.classList.toggle("on", b.dataset.tab === name));
      const body = $("#lbody");
      if (name === "description") {
        body.innerHTML = `
          <h1>${p.id}. ${esc(p.title)}</h1>
          <div class="pmeta">
            <span class="pill diff-${p.diff}">${p.diff}</span>
            ${p.lec ? `<a class="pill lec-pill" href="#/course/${p.lec}" title="${esc(COURSE.code)} lecture">${COURSE.code} · ${esc(lecLabel(p.lec))}</a>`
              : `<span class="pill" title="Outside the ${esc(COURSE.code)} syllabus">Interview extra</span>`}
            ${p.real ? `<span class="pill src-pill src-${p.real}">${esc(p.source)}</span>` : ""}
            ${statusOf(id) === "solved" ? `<span class="pill solved-pill">Solved ✓</span>` : ""}
            ${r.viewedSolution ? `<span class="pill" title="You opened the solution">Solution viewed</span>` : ""}
          </div>
          <div class="statement">${paras(p.statement)}</div>
          ${p.text && /^@fig /m.test(p.statement) ? `<p class="muted">Click a figure to see it at full size.</p>` : ""}
          <div class="topic-links">${p.topics.map((t) => `<span class="pill" data-topic="${esc(t)}">${esc(t)}</span>`).join("")}</div>`;
        body.querySelector(".topic-links").onclick = (e) => {
          const t = e.target.dataset.topic;
          if (!t) return;
          Object.assign(ui, { topics: [t], q: "", diff: "", status: "", starredOnly: false, lec: "" });
          saveUi(); location.hash = "#/";
        };
      } else if (name === "hints") {
        if (!p.hints.length) {
          body.innerHTML = `<p class="muted">Official problems have no hints. Review the lecture for this topic, or open the solution.</p>`;
          return;
        }
        body.innerHTML = p.hints.map((h, i) =>
          `<details class="hint"><summary>Hint ${i + 1}</summary><div class="hint-body">${paras(h)}</div></details>`).join("");
        body.querySelectorAll("details").forEach((d, i) => d.addEventListener("toggle", () => {
          if (d.open) { r.hintsOpened = Math.max(r.hintsOpened || 0, i + 1); save(); }
        }));
      } else if (name === "solution") {
        const show = () => {
          body.innerHTML = p.real
            ? `${p.parts.length ? `<table class="part-key"><tbody>${p.parts.map((q) =>
                `<tr><td>${inlineCode(q.q)}</td><td><code>${esc(q.answer)}</code></td></tr>`).join("")}</tbody></table>` : ""}
              <div class="solution">${paras(p.solution)}</div><p class="muted">Official solution: ${esc(p.source)}.</p>`
            : `<div class="solution">${paras(p.solution)}</div>
            <p class="muted">Answer: <code>${esc(p.answer)}</code> ≈ ${formatNumber(answerValue(p))}</p>`;
          typeset(body);
        };
        if (r.viewedSolution || statusOf(id) === "solved") show();
        else {
          body.innerHTML = `<div class="reveal"><p>Try the hints first. Opening the solution is recorded on this problem.</p>
            <button class="btn accent" id="revealBtn">Show solution</button></div>`;
          $("#revealBtn").onclick = () => { r.viewedSolution = true; save(); show(); };
          return;
        }
      } else if (name === "notes") {
        body.innerHTML = `<textarea class="notes" id="notes" placeholder="Scratch work and notes. Saved automatically.">${esc(r.notes || "")}</textarea>
          <p class="muted">Notes are saved in this browser.</p>`;
        $("#notes").oninput = (e) => { r.notes = e.target.value; save(); };
        return;
      }
      typeset(body);
    };
    $("#ltabs").onclick = (e) => {
      const b = e.target.closest(".tab");
      if (b) { history.replaceState(null, "", `#/problem/${id}/${b.dataset.tab}`); drawTab(b.dataset.tab); }
    };
    drawTab(tab);

    // star
    $("#pStar").onclick = (e) => {
      r.starred = !r.starred; save();
      e.currentTarget.classList.toggle("on", r.starred);
      e.currentTarget.textContent = r.starred ? "★" : "☆";
    };

    // mark solved toggle
    const drawMark = () => {
      $("#markBtn").textContent = statusOf(id) === "solved" ? "Mark as unsolved" : "Mark as solved";
    };
    $("#markBtn").onclick = () => {
      if (statusOf(id) === "solved") {
        r.submissions = r.submissions.filter((s) => !s.self);
        r.status = r.submissions.length ? "attempted" : undefined;
        delete r.solvedAt;
      } else {
        markSolved(r);
        r.manual = true;
        // Self-checked parts of an official problem count toward a running practice quiz.
        if (p.real) r.submissions.unshift({ t: Date.now(), input: "Marked solved (self-check)", result: "correct", self: true });
      }
      save(); drawMark(); drawTab(tab); drawSubs();
    };
    drawMark();

    if (p.real) wireParts(p, r, () => { drawSubs(); drawMark(); drawTab(tab); });
    else wireAnswer();

    function wireAnswer() {
    const inp = $("#ans");
    const prevEl = $("#preview");
    inp.oninput = () => {
      const s = inp.value.trim();
      if (!s) { prevEl.innerHTML = "&nbsp;"; prevEl.classList.remove("err"); return; }
      try {
        prevEl.textContent = `= ${formatNumber(Expr.evaluate(s))}`;
        prevEl.classList.remove("err");
      } catch (err) {
        prevEl.textContent = err.message;
        prevEl.classList.add("err");
      }
    };
    const submit = () => {
      const s = inp.value.trim();
      if (!s) return;
      let v;
      try { v = Expr.evaluate(s); } catch (err) { prevEl.textContent = err.message; prevEl.classList.add("err"); return; }
      const result = Expr.compare(v, answerValue(p), p.tol);
      r.submissions.unshift({ t: Date.now(), input: s, value: v, result });
      if (result === "correct") {
        markSolved(r);
      } else if (r.status !== "solved") r.status = "attempted";
      save();
      const msg = {
        correct: [`Accepted`, `Correct. Exact answer: ${p.answer}`],
        close: [`Close`, `Near the answer but outside the ${tolText(p)} tolerance. Enter more digits or an exact expression.`],
        wrong: [`Wrong Answer`, `Your value: ${formatNumber(v)}`],
      }[result];
      $("#verdict").innerHTML = `<div class="verdict ${result}">${msg[0]}<span class="sub">${esc(msg[1])}</span></div>`;
      drawSubs(); drawMark();
      if (result === "correct") drawTab(tab);
    };
    $("#submit").onclick = submit;
    inp.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } };
    }

    function drawSubs() {
      const subs = r.submissions;
      $("#subs").innerHTML = `<h4>Submissions (${subs.length})</h4>` + (subs.length
        ? subs.slice(0, 50).map((s) => `<div class="sub-row">
            <span class="${s.result === "correct" ? "ok" : s.result === "close" ? "cl" : "bad"}">${s.result === "correct" ? "Accepted" : s.result === "close" ? "Close" : "Wrong Answer"}</span>
            <code title="${esc(s.input)}">${esc(s.input)}</code>
            <time>${timeAgo(s.t)}</time></div>`).join("")
        : `<p class="muted">No submissions yet.</p>`);
    }
    drawSubs();

    // timer: r.time is the active time over all visits. A second counts while the page is
    // visible and the user typed, clicked, scrolled, or moved the mouse in the last IDLE_MS.
    clearInterval(timerHandle);
    const showTime = () => {
      const s = Math.floor((r.time || 0) / 1000);
      $("#timer").textContent = s >= 3600 ? `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`
        : `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    };
    showTime();
    lastInput = Date.now();
    let ticks = 0;
    timerHandle = setInterval(() => {
      if (!$("#timer")) { clearInterval(timerHandle); return; }
      if (document.hidden || Date.now() - lastInput > IDLE_MS) return;
      r.time = (r.time || 0) + 1000;
      showTime();
      if (++ticks % 10 === 0) save();
    }, 1000);

    // resizable split
    const ws = $("#ws");
    $("#gutter").onmousedown = (e) => {
      e.preventDefault();
      const rect = ws.getBoundingClientRect();
      const move = (ev) => {
        const right = Math.min(Math.max(rect.right - ev.clientX, 320), rect.width - 360);
        ws.style.gridTemplateColumns = `minmax(0,1fr) 6px ${right}px`;
      };
      const up = () => { removeEventListener("mousemove", move); removeEventListener("mouseup", up); };
      addEventListener("mousemove", move);
      addEventListener("mouseup", up);
    };

    if (tab === "description" && window.innerWidth > 900 && $("#ans")) $("#ans").focus();
  }

  // ---------------------------------------------------------------- course view
  const lecProblems = (n) => PROBLEMS.filter((p) => (n === "extra" ? !p.lec : p.lec === n));
  const solvedCount = (list) => list.filter((p) => statusOf(p.id) === "solved").length;

  function progressBar(done, total, color = "var(--accent)") {
    return `<div class="bar"><div style="width:${total ? (100 * done) / total : 0}%;background:${color}"></div></div>`;
  }

  function problemRows(list) {
    return list.map((p) => `<a class="mini-row" href="#/problem/${p.id}">
        <span class="col-status">${ICONS[statusOf(p.id)]}</span>
        <span class="mini-title">${p.id}. ${esc(p.title)}</span>
        <span class="diff-${p.diff}">${p.diff}</span></a>`).join("");
  }

  function renderCourse(openLec) {
    ui.openLecs = ui.openLecs || [];
    if (openLec && !ui.openLecs.includes(openLec)) ui.openLecs.push(openLec);
    const inSyllabus = PROBLEMS.filter((p) => p.lec);
    const lecRow = (key, label, reading, list) => {
      const open = ui.openLecs.includes(key);
      const done = solvedCount(list);
      return `<div class="lec ${open ? "open" : ""}" id="lec-${key}">
        <button class="lec-head" data-lec="${key}">
          <span class="lec-caret">${open ? "▾" : "▸"}</span>
          <span class="lec-title">${label}</span>
          ${reading && COURSE.reading ? `<span class="lec-reading" title="${esc(COURSE.reading.title)}">${esc(COURSE.reading.prefix)} ${reading}</span>` : ""}
          <span class="lec-count">${done}/${list.length}</span>
          <span class="lec-bar">${progressBar(done, list.length, done === list.length && list.length ? "var(--ok)" : "var(--accent)")}</span>
        </button>
        ${open ? `<div class="lec-body">${problemRows(list) || `<p class="muted">No problems yet.</p>`}
          <div class="lec-actions"><a class="btn ghost" href="#/" data-filter-lec="${key}">Open in problem list</a></div></div>` : ""}
      </div>`;
    };

    const units = COURSE.units.map((u) => {
      const list = u.lectures.flatMap((l) => lecProblems(l.n));
      const done = solvedCount(list);
      return `<section class="card unit">
        <div class="unit-head"><h3>${esc(u.name)}</h3><span class="muted">${done}/${list.length} solved</span></div>
        ${u.lectures.map((l) => lecRow(l.n, `L${l.n}. ${esc(l.title)}`, l.reading, lecProblems(l.n))).join("")}
        ${u.exam ? `<div class="unit-exam"><a class="btn accent" href="#/exam/${u.exam.id}">Practice ${esc(u.exam.name)}</a>
          <span class="muted">${examScope(u.exam.id)}</span></div>` : ""}
      </section>`;
    }).join("");

    const extras = lecProblems("extra");
    const done = solvedCount(inSyllabus);
    $("#app").innerHTML = `
      <div class="course">
        <section class="card course-hero">
          <div>
            <div class="muted">MIT ${COURSE.code} · ${esc(COURSE.term)}</div>
            <h2>${esc(COURSE.name)}</h2>
            <p class="muted">${COURSE.blurb}</p>
          </div>
          <div class="hero-stats">
            <div class="kpi"><div class="v">${done}<span class="muted"> / ${inSyllabus.length}</span></div><div class="l">Syllabus problems solved</div></div>
            ${progressBar(done, inSyllabus.length)}
            <div class="row-btns">
              ${Object.entries(COURSE.exams).map(([id, e]) => `<a class="btn ghost" href="#/exam/${id}">${esc(e.name)}</a>`).join("")}
            </div>
          </div>
        </section>
        ${units}
        ${COURSE.extras ? `<section class="card unit">
          <div class="unit-head"><h3>${esc(COURSE.extras.title)}</h3><span class="muted">${solvedCount(extras)}/${extras.length} solved</span></div>
          <p class="muted">${esc(COURSE.extras.blurb)}</p>
          ${lecRow("extra", "All extras", "", extras)}
        </section>` : ""}
      </div>`;

    const app = $("#app");
    app.onclick = (e) => {
      const head = e.target.closest(".lec-head");
      if (head) {
        const key = head.dataset.lec === "extra" ? "extra" : +head.dataset.lec;
        ui.openLecs = ui.openLecs.includes(key) ? ui.openLecs.filter((k) => k !== key) : [...ui.openLecs, key];
        saveUi();
        const y = scrollY;
        renderCourse();
        scrollTo(0, y);
        return;
      }
      const f = e.target.closest("[data-filter-lec]");
      if (f) {
        e.preventDefault();
        Object.assign(ui, { topics: [], q: "", diff: "", status: "", starredOnly: false, lec: f.dataset.filterLec });
        saveUi();
        location.hash = "#/";
      }
    };
    saveUi();
    if (openLec) {
      const el = document.getElementById(`lec-${openLec}`);
      if (el) requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
    }
  }

  // ---------------------------------------------------------------- practice exams
  function examScope(id) {
    const e = COURSE.exams[id];
    if (e.ids) return `The ${e.ids.length} problems of the real ${e.name}, ${e.minutes} min`;
    return `${e.count} problems from L${e.from}-L${e.to}, ${e.minutes} min`;
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // A past-quiz exam has a fixed list of ids. A drawn exam spreads across lectures: shuffle each
  // lecture's pool of single-answer problems, then take one per lecture in turn.
  function drawExam(id) {
    const e = COURSE.exams[id];
    const ids = [];
    if (e.ids) ids.push(...e.ids);
    else {
      const pools = [];
      for (let n = e.from; n <= e.to; n++) {
        const pool = shuffle(lecProblems(n).filter((p) => !p.real));
        if (pool.length) pools.push(pool);
      }
      shuffle(pools);
      while (ids.length < e.count && pools.some((p) => p.length)) {
        for (const pool of pools) {
          if (ids.length >= e.count) break;
          if (pool.length) ids.push(pool.pop().id);
        }
      }
      ids.sort((a, b) => (BY_ID.get(a).lec - BY_ID.get(b).lec) || a - b);
    }
    store.exams = store.exams || {};
    store.exams[examKey(id)] = { ids, startedAt: Date.now() };
    save();
    return store.exams[examKey(id)];
  }

  // Exam ids repeat across courses ("quiz2"), so saved draws are keyed by course.
  // 6.3700 keeps the bare id so that draws saved before multi-course support still load.
  const examKey = (id) => (COURSE.code === DEFAULT_COURSE ? id : `${COURSE.code}:${id}`);
  function savedExam(id) {
    const ex = (store.exams || {})[examKey(id)];
    return ex && ex.ids.every((pid) => BY_ID.has(pid)) ? ex : null;
  }

  function examStatus(pid, since) {
    const subs = (peek(pid) && peek(pid).submissions) || [];
    const recent = subs.filter((s) => s.t >= since);
    if (solvedBy(BY_ID.get(pid), recent)) return "solved";
    if (recent.length) return "attempted";
    return "todo";
  }

  function renderExam(id) {
    const e = COURSE.exams[id];
    if (!e) { location.hash = "#/course"; return; }
    const ex = savedExam(id) || drawExam(id);
    const results = ex.ids.map((pid) => examStatus(pid, ex.startedAt));
    const score = results.filter((r) => r === "solved").length;
    const end = ex.startedAt + e.minutes * 60000;

    $("#app").innerHTML = `
      <div class="course">
        <section class="card course-hero">
          <div>
            <div class="muted"><a class="link" href="#/course">${COURSE.code}</a> · Practice exam</div>
            <h2>${esc(e.name)}</h2>
            <p class="muted">${examScope(id)}. ${e.ids
              ? "A problem counts when all its graded parts are correct, or when you mark it solved after you check your work against the official solution."
              : "A problem counts when you submit a correct answer after the exam starts."}
              Earlier solves do not count. Hints and solutions stay available, so hold yourself to exam rules.</p>
          </div>
          <div class="hero-stats">
            <div class="kpi"><div class="v">${score}<span class="muted"> / ${ex.ids.length}</span></div><div class="l">Correct in this attempt</div></div>
            <div class="kpi"><div class="v exam-clock" id="examClock">--:--</div><div class="l" id="examClockLbl">Time left</div></div>
            <div class="row-btns"><button class="btn ghost" id="newExam">${e.ids ? "Restart" : "New exam"}</button></div>
          </div>
        </section>
        <section class="card">
          ${ex.ids.map((pid, i) => {
            const p = BY_ID.get(pid);
            return `<a class="mini-row" href="#/problem/${pid}">
              <span class="col-status">${ICONS[results[i]]}</span>
              <span class="mini-title">Q${i + 1}. ${esc(p.title)} <span class="muted">· ${esc(lecLabel(p.lec))}</span></span>
              <span class="diff-${p.diff}">${p.diff}</span></a>`;
          }).join("")}
        </section>
      </div>`;

    $("#newExam").onclick = () => {
      if (confirm(e.ids ? "Restart this quiz? The timer and score start again." : "Start a new exam? The current draw and timer are replaced.")) { drawExam(id); renderExam(id); }
    };

    const tick = () => {
      const el = $("#examClock");
      if (!el) { clearInterval(timerHandle); return; }
      const left = Math.round((end - Date.now()) / 1000);
      const s = Math.abs(left);
      el.textContent = `${left < 0 ? "+" : ""}${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
      el.classList.toggle("over", left < 0);
      $("#examClockLbl").textContent = left < 0 ? "Over time" : "Time left";
    };
    clearInterval(timerHandle);
    tick();
    timerHandle = setInterval(tick, 1000);
  }

  // ---------------------------------------------------------------- stats view
  function fmtDur(ms) {
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
    return `${Math.floor(s / 3600)}h ${String(Math.floor(s / 60) % 60).padStart(2, "0")}m`;
  }
  const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

  // A try is one submit: one answer, or one "Check answers" press on an official problem
  // (its part entries share a timestamp), or one self-check mark.
  // Returns the number of tries, the wrong tries, and the tries up to the first solve.
  function tryStats(p, r) {
    const subs = (r.submissions || []).slice().reverse();
    const batches = [];
    subs.forEach((s) => {
      const b = batches[batches.length - 1];
      if (b && b.t === s.t) b.list.push(s); else batches.push({ t: s.t, list: [s] });
    });
    let toSolve = null;
    for (let i = 0; i < batches.length && toSolve === null; i++) {
      if (solvedBy(p, batches.slice(0, i + 1).flatMap((b) => b.list))) toSolve = i + 1;
    }
    const wrong = batches.filter((b) => b.list.some((s) => s.result !== "correct")).length;
    return { tries: batches.length, wrong, toSolve };
  }

  // Difficulty score for the problems you tried. Each wrong try, opened hint, and 5 minutes
  // adds 1; an opened solution adds 3; a problem that is still open adds 2.
  function struggle(p, r, t) {
    return t.wrong + (r.hintsOpened || 0) + (r.viewedSolution ? 3 : 0)
      + (statusOf(p.id) === "solved" ? 0 : 2) + (r.time || 0) / 300000;
  }

  function renderStats() {
    const c = counts();
    const all = Object.entries(store.problems).filter(([id]) => BY_ID.has(+id));
    const subs = all.flatMap(([id, r]) => (r.submissions || []).map((s) => ({ ...s, id: +id })));
    const accepted = subs.filter((s) => s.result === "correct").length;
    const viewed = all.filter(([, r]) => r.viewedSolution).length;
    const firstTry = all.filter(([, r]) => r.submissions && r.submissions.length && r.submissions[r.submissions.length - 1].result === "correct").length;

    // activity for last 16 weeks
    const dayKey = (ts) => new Date(ts).toISOString().slice(0, 10);
    const perDay = new Map();
    all.forEach(([, r]) => { if (r.solvedAt) perDay.set(dayKey(r.solvedAt), (perDay.get(dayKey(r.solvedAt)) || 0) + 1); });
    const days = [];
    for (let i = 111; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const n = perDay.get(dayKey(d)) || 0;
      days.push(`<div title="${dayKey(d)}: ${n} solved" style="${n ? `background:var(--ok);opacity:${Math.min(0.35 + n * 0.2, 1)}` : ""}"></div>`);
    }

    const topicRows = ALL_TOPICS.map(([t, n]) => {
      const solved = PROBLEMS.filter((p) => p.topics.includes(t) && statusOf(p.id) === "solved").length;
      return `<tr><td><a href="#/" data-topic="${esc(t)}">${esc(t)}</a></td><td>${solved}/${n}</td>
        <td><div class="bar"><div style="width:${(100 * solved) / n}%;background:var(--accent)"></div></div></td></tr>`;
    }).join("");

    const recent = subs.sort((a, b) => b.t - a.t).slice(0, 15).map((s) => {
      const p = BY_ID.get(s.id);
      return `<div class="sub-row"><span class="${s.result === "correct" ? "ok" : s.result === "close" ? "cl" : "bad"}">${s.result === "correct" ? "Accepted" : s.result === "close" ? "Close" : "Wrong Answer"}</span>
        <a href="#/problem/${p.id}">${p.id}. ${esc(p.title)}</a><time>${timeAgo(s.t)}</time></div>`;
    }).join("") || `<p class="muted">No submissions yet.</p>`;

    // Per-problem tries and time. Problems solved before time tracking have no solveTime.
    const tried = all.map(([id, r]) => {
      const p = BY_ID.get(+id), t = tryStats(p, r);
      return { p, r, t, score: struggle(p, r, t) };
    }).filter((x) => x.t.tries || x.r.time >= 30000 || x.r.viewedSolution || x.r.hintsOpened);
    const solvedX = tried.filter((x) => statusOf(x.p.id) === "solved");
    const triesSolve = solvedX.map((x) => x.t.toSolve).filter((n) => n);
    const timeSolve = solvedX.map((x) => x.r.solveTime).filter((ms) => ms > 0);
    const totalTime = all.reduce((a, [, r]) => a + (r.time || 0), 0);
    const avgTries = mean(triesSolve);
    const avgTime = mean(timeSolve);

    const diffRows = DIFFS.map((d) => {
      const xs = solvedX.filter((x) => x.p.diff === d);
      const tr = mean(xs.map((x) => x.t.toSolve).filter((n) => n));
      const tm = mean(xs.map((x) => x.r.solveTime).filter((ms) => ms > 0));
      return `<tr><td><span class="diff-${d}">${d}</span></td><td>${xs.length}</td>
        <td>${tr === null ? "—" : tr.toFixed(1)}</td><td>${tm === null ? "—" : fmtDur(tm)}</td></tr>`;
    }).join("");

    const hardest = tried.slice().sort((a, b) => b.score - a.score).slice(0, 12).map((x) => {
      const st = statusOf(x.p.id);
      return `<tr><td><a href="#/problem/${x.p.id}">${x.p.id}. ${esc(x.p.title)}</a></td>
        <td><span class="diff-${x.p.diff}">${x.p.diff}</span></td>
        <td>${st === "solved" ? `<span class="ok">Solved</span>` : `<span class="cl">Open</span>`}</td>
        <td>${x.t.tries}${x.t.wrong ? ` <span class="muted">(${x.t.wrong} wrong)</span>` : ""}</td>
        <td>${x.r.time ? fmtDur(x.r.time) : "—"}</td>
        <td>${x.r.hintsOpened || 0}</td><td>${x.r.viewedSolution ? "Yes" : ""}</td></tr>`;
    }).join("");

    $("#app").innerHTML = `
      <div class="stats">
        <div class="stats-grid">
          <div class="card kpi"><div class="v">${c.solved}<span class="muted"> / ${c.total}</span></div><div class="l">Problems solved</div></div>
          <div class="card kpi"><div class="v">${subs.length ? Math.round((100 * accepted) / subs.length) : 0}%</div><div class="l">Acceptance rate (${accepted}/${subs.length} submissions)</div></div>
          <div class="card kpi"><div class="v">${avgTries === null ? "—" : avgTries.toFixed(1)}</div><div class="l">Average tries to solve (${triesSolve.length} problems, ${firstTry} on the first try)</div></div>
          <div class="card kpi"><div class="v">${avgTime === null ? "—" : fmtDur(avgTime)}</div><div class="l">Average time to solve (${timeSolve.length} timed problems)</div></div>
          <div class="card kpi"><div class="v">${fmtDur(totalTime)}</div><div class="l">Total practice time</div></div>
          <div class="card kpi"><div class="v">${viewed}</div><div class="l">Solutions viewed</div></div>
        </div>
        <div class="card"><h3>Hardest problems you tried</h3>${hardest
          ? `<div class="table-wrap"><table class="topic-table hard-table"><thead><tr><th>Problem</th><th>Level</th><th>Status</th><th>Tries</th><th>Time</th><th>Hints</th><th>Solution</th></tr></thead><tbody>${hardest}</tbody></table></div>
            <p class="muted small">Ranked by a score: 1 for each wrong try, opened hint, and 5 minutes of active time; 3 for an opened solution; 2 if the problem is still open.</p>`
          : `<p class="muted">No tried problems yet.</p>`}</div>
        <div class="stats-grid two-col">
          <div class="card"><h3>By difficulty (solved problems)</h3><table class="topic-table diff-table"><thead><tr><th>Level</th><th>Solved</th><th>Avg tries</th><th>Avg time</th></tr></thead><tbody>${diffRows}</tbody></table>
            <p class="muted small">Time counts while the problem page is open and you are active. It pauses after 5 idle minutes. Problems solved before time tracking have no time.</p></div>
          <div class="card"><h3>Activity (last 16 weeks)</h3><div class="heat">${days.join("")}</div></div>
        </div>
        <div class="stats-grid two-col">
          <div class="card"><h3>By topic</h3><table class="topic-table" style="width:100%;border-collapse:collapse">${topicRows}</table></div>
          <div class="card"><h3>Recent submissions</h3>${recent}</div>
        </div>
      </div>`;
    $("#app").querySelector(".topic-table").onclick = (e) => {
      const t = e.target.dataset.topic;
      if (!t) return;
      e.preventDefault();
      Object.assign(ui, { topics: [t], q: "", diff: "", status: "", starredOnly: false, lec: "" });
      saveUi(); location.hash = "#/";
    };
  }

  // ---------------------------------------------------------------- router
  function route() {
    clearInterval(timerHandle);
    save();
    const h = location.hash.replace(/^#\/?/, "");
    const parts = h.split("/");
    document.querySelectorAll("[data-nav]").forEach((a) => a.classList.remove("active"));
    if (parts[0] === "problem" && parts[1]) {
      renderProblem(+parts[1], parts[2]);
      document.title = `${parts[1]}. ${(BY_ID.get(+parts[1]) || {}).title || ""} - ProbTrainer`;
    } else if (parts[0] === "course") {
      $('[data-nav="course"]').classList.add("active");
      renderCourse(parts[1] === "extra" ? "extra" : +parts[1] || null);
      document.title = `${COURSE.code} - ProbTrainer`;
      if (parts[1]) return;
    } else if (parts[0] === "exam" && parts[1]) {
      $('[data-nav="course"]').classList.add("active");
      renderExam(parts[1]);
      document.title = `${(COURSE.exams[parts[1]] || {}).name || "Exam"} - ProbTrainer`;
    } else if (parts[0] === "stats") {
      $('[data-nav="stats"]').classList.add("active");
      renderStats();
      document.title = "Progress - ProbTrainer";
    } else {
      $('[data-nav="list"]').classList.add("active");
      renderList();
      document.title = "ProbTrainer";
    }
    window.scrollTo(0, 0);
  }

  addEventListener("hashchange", route);
  // Click a figure to see it at full size; click again or press Escape to close.
  document.addEventListener("click", (e) => {
    const zoom = $(".fig-zoom");
    if (zoom) { zoom.remove(); return; }
    const fig = e.target.closest && e.target.closest("svg.fig");
    if (!fig) return;
    const el = document.createElement("div");
    el.className = "fig-zoom";
    el.innerHTML = fig.outerHTML;
    el.firstChild.removeAttribute("width");
    document.body.appendChild(el);
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && $(".fig-zoom")) $(".fig-zoom").remove(); });
  addEventListener("keydown", (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if (e.key === "/" && !typing && $("#fQ")) { e.preventDefault(); $("#fQ").focus(); }
    if (e.altKey && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      const m = location.hash.match(/^#\/problem\/(\d+)/);
      if (!m) return;
      const idx = PROBLEMS.indexOf(BY_ID.get(+m[1]));
      const n = PROBLEMS[(idx + (e.key === "ArrowRight" ? 1 : -1) + PROBLEMS.length) % PROBLEMS.length];
      location.hash = `#/problem/${n.id}`;
    }
    if ((e.key === "r" || e.key === "R") && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) $("#randomBtn").click();
  });
  route();
})();

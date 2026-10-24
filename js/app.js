(function () {
  "use strict";

  const PROBLEMS = window.PROBLEMS.slice().sort((a, b) => a.id - b.id);
  const BY_ID = new Map(PROBLEMS.map((p) => [p.id, p]));
  const DIFFS = ["Easy", "Medium", "Hard"];
  const DIFF_COLOR = { Easy: "var(--easy)", Medium: "var(--medium)", Hard: "var(--hard)" };
  const STORE_KEY = "probtrainer.v1";
  const UI_KEY = "probtrainer.ui.v1";

  // ---------------------------------------------------------------- storage
  function safeGet(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
  function safeSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ } }

  const store = Object.assign({ problems: {}, theme: "dark" }, safeGet(STORE_KEY) || {});
  const ui = Object.assign(
    { q: "", diff: "", status: "", topics: [], sort: "id", dir: 1, starredOnly: false },
    safeGet(UI_KEY) || {}
  );
  const save = () => safeSet(STORE_KEY, store);
  const saveUi = () => safeSet(UI_KEY, ui);

  function rec(id) {
    if (!store.problems[id]) store.problems[id] = { submissions: [] };
    return store.problems[id];
  }
  const peek = (id) => store.problems[id] || null;
  const statusOf = (id) => (peek(id) && peek(id).status) || "todo";

  // ---------------------------------------------------------------- helpers
  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const paras = (text) => text.trim().split(/\n\s*\n/).map((p) => `<p>${esc(p)}</p>`).join("");

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

  $("#randomBtn").addEventListener("click", () => {
    location.hash = `#/problem/${randomProblem(filtered()).id}`;
  });

  // ---------------------------------------------------------------- list view
  const ALL_TOPICS = (() => {
    const m = new Map();
    PROBLEMS.forEach((p) => p.topics.forEach((t) => m.set(t, (m.get(t) || 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  })();

  function filtered() {
    const q = ui.q.trim().toLowerCase();
    let list = PROBLEMS.filter((p) => {
      if (ui.diff && p.diff !== ui.diff) return false;
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

    const refresh = () => { saveUi(); drawTopics(); drawRows(); };
    $("#fDiff").onchange = (e) => { ui.diff = e.target.value; refresh(); };
    $("#fStatus").onchange = (e) => { ui.status = e.target.value; refresh(); };
    $("#fStar").onchange = (e) => { ui.starredOnly = !!e.target.value; refresh(); };
    $("#fQ").oninput = (e) => { ui.q = e.target.value; refresh(); };
    $("#fClear").onclick = () => {
      Object.assign(ui, { q: "", diff: "", status: "", topics: [], starredOnly: false });
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
        <td class="title"><a href="#/problem/${p.id}">${p.id}. ${esc(p.title)}</a></td>
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

  function renderProblem(id, tab) {
    const p = BY_ID.get(id);
    if (!p) { location.hash = "#/"; return; }
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
            <span class="timer" id="timer" title="Time on this problem (this visit)">00:00</span>
            <button class="btn ghost icon star ${r.starred ? "on" : ""}" id="pStar" title="Star">${r.starred ? "★" : "☆"}</button>
          </div>
        </section>
        <div class="gutter" id="gutter"></div>
        <section class="pane">
          <div class="tabs"><button class="tab on">Answer</button></div>
          <div class="answer-box">
            <label for="ans">Your answer: a number or exact expression</label>
            <input id="ans" class="answer-input" autocomplete="off" spellcheck="false" placeholder="e.g. 3/8, 1-(5/6)^4, sqrt(2)/2, 1/e" />
            <div class="preview" id="preview">&nbsp;</div>
            <div class="answer-actions">
              <button class="btn primary" id="submit">Submit</button>
              <span class="spacer"></span>
              <button class="btn ghost" id="markBtn"></button>
            </div>
            <div id="verdict"></div>
            <div class="syntax-help">Accepted: <code>+ - * / ^ !</code> <code>( )</code> <code>pi</code> <code>e</code>
              <code>sqrt()</code> <code>ln()</code> <code>exp()</code> <code>C(n,k)</code> <code>50%</code>.
              Answers within 0.05% relative error are accepted.</div>
          </div>
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
            ${statusOf(id) === "solved" ? `<span class="pill solved-pill">Solved ✓</span>` : ""}
            ${r.viewedSolution ? `<span class="pill" title="You opened the solution">Solution viewed</span>` : ""}
          </div>
          <div class="statement">${paras(p.statement)}</div>
          <div class="topic-links">${p.topics.map((t) => `<span class="pill" data-topic="${esc(t)}">${esc(t)}</span>`).join("")}</div>`;
        body.querySelector(".topic-links").onclick = (e) => {
          const t = e.target.dataset.topic;
          if (!t) return;
          Object.assign(ui, { topics: [t], q: "", diff: "", status: "", starredOnly: false });
          saveUi(); location.hash = "#/";
        };
      } else if (name === "hints") {
        body.innerHTML = p.hints.map((h, i) =>
          `<details class="hint"><summary>Hint ${i + 1}</summary><div class="hint-body">${paras(h)}</div></details>`).join("");
        body.querySelectorAll("details").forEach((d, i) => d.addEventListener("toggle", () => {
          if (d.open) { r.hintsOpened = Math.max(r.hintsOpened || 0, i + 1); save(); }
        }));
      } else if (name === "solution") {
        const show = () => {
          body.innerHTML = `<div class="solution">${paras(p.solution)}</div>
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
        r.status = r.submissions.length ? "attempted" : undefined;
        delete r.solvedAt;
      } else {
        r.status = "solved";
        r.solvedAt = Date.now();
        r.manual = true;
      }
      save(); drawMark(); drawTab(tab);
    };
    drawMark();

    // answer input
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
      const result = Expr.compare(v, answerValue(p));
      r.submissions.unshift({ t: Date.now(), input: s, value: v, result });
      if (result === "correct") {
        if (r.status !== "solved") r.solvedAt = Date.now();
        r.status = "solved";
      } else if (r.status !== "solved") r.status = "attempted";
      save();
      const msg = {
        correct: [`Accepted`, `Correct. Exact answer: ${p.answer}`],
        close: [`Close`, `Within 1% but not within 0.05%. Enter more digits or an exact expression.`],
        wrong: [`Wrong Answer`, `Your value: ${formatNumber(v)}`],
      }[result];
      $("#verdict").innerHTML = `<div class="verdict ${result}">${msg[0]}<span class="sub">${esc(msg[1])}</span></div>`;
      drawSubs(); drawMark();
      if (result === "correct") drawTab(tab);
    };
    $("#submit").onclick = submit;
    inp.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } };

    const drawSubs = () => {
      const subs = r.submissions;
      $("#subs").innerHTML = `<h4>Submissions (${subs.length})</h4>` + (subs.length
        ? subs.slice(0, 50).map((s) => `<div class="sub-row">
            <span class="${s.result === "correct" ? "ok" : s.result === "close" ? "cl" : "bad"}">${s.result === "correct" ? "Accepted" : s.result === "close" ? "Close" : "Wrong Answer"}</span>
            <code title="${esc(s.input)}">${esc(s.input)}</code>
            <time>${timeAgo(s.t)}</time></div>`).join("")
        : `<p class="muted">No submissions yet.</p>`);
    };
    drawSubs();

    // timer
    clearInterval(timerHandle);
    const start = Date.now();
    timerHandle = setInterval(() => {
      const el = $("#timer");
      if (!el) { clearInterval(timerHandle); return; }
      const s = Math.floor((Date.now() - start) / 1000);
      el.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
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

    if (tab === "description" && window.innerWidth > 900) inp.focus();
  }

  // ---------------------------------------------------------------- stats view
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

    $("#app").innerHTML = `
      <div class="stats">
        <div class="stats-grid">
          <div class="card kpi"><div class="v">${c.solved}<span class="muted"> / ${c.total}</span></div><div class="l">Problems solved</div></div>
          <div class="card kpi"><div class="v">${subs.length ? Math.round((100 * accepted) / subs.length) : 0}%</div><div class="l">Acceptance rate (${accepted}/${subs.length} submissions)</div></div>
          <div class="card kpi"><div class="v">${firstTry}</div><div class="l">Solved on the first submission</div></div>
          <div class="card kpi"><div class="v">${viewed}</div><div class="l">Solutions viewed</div></div>
        </div>
        <div class="card"><h3>Activity (last 16 weeks)</h3><div class="heat">${days.join("")}</div></div>
        <div class="stats-grid two-col">
          <div class="card"><h3>By topic</h3><table class="topic-table" style="width:100%;border-collapse:collapse">${topicRows}</table></div>
          <div class="card"><h3>Recent submissions</h3>${recent}</div>
        </div>
      </div>`;
    $("#app").querySelector(".topic-table").onclick = (e) => {
      const t = e.target.dataset.topic;
      if (!t) return;
      e.preventDefault();
      Object.assign(ui, { topics: [t], q: "", diff: "", status: "", starredOnly: false });
      saveUi(); location.hash = "#/";
    };
  }

  // ---------------------------------------------------------------- router
  function route() {
    clearInterval(timerHandle);
    const h = location.hash.replace(/^#\/?/, "");
    const parts = h.split("/");
    document.querySelectorAll("[data-nav]").forEach((a) => a.classList.remove("active"));
    if (parts[0] === "problem" && parts[1]) {
      renderProblem(+parts[1], parts[2]);
      document.title = `${parts[1]}. ${(BY_ID.get(+parts[1]) || {}).title || ""} - ProbTrainer`;
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

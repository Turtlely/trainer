// Diagram helpers for problem figures. Each helper returns SVG markup. The markup uses
// currentColor and the site color variables (css/style.css, ".fig"), so a figure follows the
// light and dark themes. Problem text inserts a figure with a paragraph "@fig <name>".
(function (root) {
  const FIGS = (root.FIGS = root.FIGS || {});
  const r1 = (v) => Math.round(v * 10) / 10;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // "x,y x,y" or [[x,y],...] -> [[x,y],...]
  const pts = (p) => (typeof p === "string" ? p.trim().split(/\s+/).map((xy) => xy.split(",").map(Number)) : p);

  // Text. o.a: "start" | "middle" | "end"; o.s: font size; o.b: bold; o.i: italic;
  // o.m: monospace; o.c: class (mut = muted, acc = accent, ok, bad); o.rot: rotate (degrees).
  // A "\n" in s starts a new line.
  function t(x, y, s, o = {}) {
    const lines = String(s).split("\n");
    const size = o.s || 13;
    const cls = [o.m && "m", o.c].filter(Boolean).join(" ");
    const y0 = y - ((lines.length - 1) * size * 1.25) / 2;
    return `<text x="${r1(x)}" y="${r1(y0)}" text-anchor="${o.a || "middle"}" dominant-baseline="central"`
      + `${size !== 13 ? ` font-size="${size}"` : ""}${o.b ? ` font-weight="700"` : ""}${o.i ? ` font-style="italic"` : ""}`
      + `${cls ? ` class="${cls}"` : ""}${o.rot ? ` transform="rotate(${o.rot} ${r1(x)} ${r1(y)})"` : ""}>`
      + lines.map((l, i) => (i ? `<tspan x="${r1(x)}" dy="${r1(size * 1.25)}">${esc(l)}</tspan>` : esc(l))).join("") + `</text>`;
  }

  // Arrowhead at (x, y) that points along the direction (dx, dy).
  function head(x, y, dx, dy, size = 7) {
    const L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    const bx = x - ux * size, by = y - uy * size;
    return `<polygon class="fill" points="${r1(x)},${r1(y)} ${r1(bx - uy * size * 0.45)},${r1(by + ux * size * 0.45)} ${r1(bx + uy * size * 0.45)},${r1(by - ux * size * 0.45)}"/>`;
  }

  // Wire through points. o.arrow: "end" (default), "start", "both", or "none";
  // o.dash: dashed; o.w: stroke width; o.c: class (acc, mut, ok, bad).
  function w(p, o = {}) {
    p = pts(p);
    const arrow = o.arrow || "end";
    let s = `<polyline class="ln${o.c ? " " + o.c : ""}" points="${p.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" ")}"`
      + `${o.dash ? ` stroke-dasharray="5 4"` : ""}${o.w ? ` stroke-width="${o.w}"` : ""}/>`;
    const n = p.length;
    const g = (q) => (o.c ? `<g class="${o.c}">${q}</g>` : q);
    if (arrow === "end" || arrow === "both") s += g(head(p[n - 1][0], p[n - 1][1], p[n - 1][0] - p[n - 2][0], p[n - 1][1] - p[n - 2][1]));
    if (arrow === "start" || arrow === "both") s += g(head(p[0][0], p[0][1], p[0][0] - p[1][0], p[0][1] - p[1][1]));
    return s;
  }
  const line = (p, o = {}) => w(p, Object.assign({ arrow: "none" }, o));

  // Box with a centered label. o.r: corner radius; o.fill: false for no fill;
  // o.c: class for the outline (acc, mut); o.s, o.b, o.m: label font (see t).
  function box(x, y, wd, ht, label = "", o = {}) {
    return `<rect class="bx${o.fill === false ? " nofill" : ""}${o.c ? " " + o.c : ""}" x="${r1(x)}" y="${r1(y)}" width="${r1(wd)}" height="${r1(ht)}" rx="${o.r ?? 4}"${o.dash ? ` stroke-dasharray="5 4"` : ""}/>`
      + (label !== "" ? t(x + wd / 2, y + ht / 2, label, o) : "");
  }

  // Register: a box with a clock triangle on the left edge.
  function reg(x, y, wd, ht, label = "", o = {}) {
    const cy = y + ht / 2;
    return box(x, y, wd, ht, label, Object.assign({ r: 2 }, o))
      + `<polyline class="ln" points="${r1(x)},${r1(cy - 5)} ${r1(x + 7)},${r1(cy)} ${r1(x)},${r1(cy + 5)}"/>`;
  }

  // Multiplexer: a trapezoid whose long side faces the inputs. o.labels: input labels
  // from top to bottom; o.dir: "right" (default, inputs on the left) or "down" (inputs on top).
  function mux(x, y, wd, ht, o = {}) {
    const k = o.k ?? 0.22;
    const labels = o.labels || [];
    if (o.dir === "down") {
      const d = wd * k;
      return `<polygon class="bx" points="${x},${y} ${x + wd},${y} ${x + wd - d},${y + ht} ${x + d},${y + ht}"/>`
        + labels.map((l, i) => t(x + (wd * (i + 0.5)) / labels.length, y + 8, l, { s: 10 })).join("");
    }
    const d = ht * k;
    return `<polygon class="bx" points="${x},${y} ${x + wd},${y + d} ${x + wd},${y + ht - d} ${x},${y + ht}"/>`
      + labels.map((l, i) => t(x + 7, y + (ht * (i + 0.5)) / labels.length, l, { s: 10 })).join("");
  }

  const dot = (x, y, rad = 3.5, c = "") => `<circle class="fill${c ? " " + c : ""}" cx="${r1(x)}" cy="${r1(y)}" r="${rad}"/>`;
  const circle = (x, y, rad, label = "", o = {}) =>
    `<circle class="bx" cx="${r1(x)}" cy="${r1(y)}" r="${rad}"/>` + (label !== "" ? t(x, y, label, o) : "");

  // Logic gates, inputs on the left, output on the right. (x, y) is the top-left corner.
  function gate(type, x, y, wd = 40, ht = 30) {
    const ym = y + ht / 2, xr = x + wd;
    let s;
    if (type === "and" || type === "nand") {
      s = `<path class="bx" d="M${x},${y} H${x + wd / 2} A${wd / 2},${ht / 2} 0 0 1 ${x + wd / 2},${y + ht} H${x} Z"/>`;
    } else if (type === "or" || type === "nor" || type === "xor") {
      const x0 = type === "xor" ? x + 5 : x;
      s = `<path class="bx" d="M${x0},${y} Q${x0 + wd * 0.6},${y} ${xr},${ym} Q${x0 + wd * 0.6},${y + ht} ${x0},${y + ht} Q${x0 + wd * 0.25},${ym} ${x0},${y} Z"/>`;
      if (type === "xor") s += `<path class="ln" d="M${x},${y} Q${x + wd * 0.25},${ym} ${x},${y + ht}"/>`;
    } else {
      s = `<polygon class="bx" points="${x},${y} ${xr - 6},${ym} ${x},${y + ht}"/>`;
    }
    if (type === "nand" || type === "nor" || type === "not") s += `<circle class="bx" cx="${xr - (type === "not" ? 3 : -3)}" cy="${ym}" r="3"/>`;
    return s;
  }

  // Point at fraction f of the length of polyline p.
  function along(p, f) {
    const seg = p.slice(1).map((q, i) => Math.hypot(q[0] - p[i][0], q[1] - p[i][1]));
    let d = f * seg.reduce((a, b) => a + b, 0);
    for (let i = 0; i < seg.length; i++) {
      if (d <= seg[i] || i === seg.length - 1) {
        const k = seg[i] ? Math.min(d / seg[i], 1) : 0;
        return [p[i][0] + (p[i + 1][0] - p[i][0]) * k, p[i][1] + (p[i + 1][1] - p[i][1]) * k];
      }
      d -= seg[i];
    }
  }

  // Dataflow graph for pipelining problems. nodes: { id: [cx, cy, label, {w, h}] } draws boxes
  // of size o.bw x o.bh; an id that starts with "@" is a bare text terminal (an input or output).
  // edges: "A>B" strings, or [from, to, opts] where opts.via bends the edge through points,
  // opts.c colors it, and opts.reg puts pipeline-register dots on it: a count (spread evenly)
  // or a list of fractions along the edge. Register dots use class o.rc ("acc" in solutions),
  // or opts.rc for one edge ("" for registers that the problem gives). opts.arrow as in w().
  // A map o.regs { "A>B": reg } adds register dots without restating the edges.
  // Each edge is clipped at the box borders.
  function graph(nodes, edges, o = {}) {
    const bw = o.bw || 50, bh = o.bh || 30;
    const size = (id) => { const no = nodes[id][3] || {}; return id[0] === "@" ? [no.w || 14, no.h || 14] : [no.w || bw, no.h || bh]; };
    const clip = (id, fx, fy) => {
      const [cx, cy] = nodes[id];
      const [hw, hh] = size(id).map((v) => v / 2);
      const dx = fx - cx, dy = fy - cy;
      if (!dx && !dy) return [cx, cy];
      const s = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
      return [cx + dx * s, cy + dy * s];
    };
    let s = "";
    for (const e of edges) {
      const [a, b, eo = {}] = typeof e === "string" ? e.split(">").concat([{}]) : e;
      const via = eo.via || [];
      const first = via[0] || nodes[b], last = via[via.length - 1] || nodes[a];
      const p0 = clip(a, first[0], first[1]);
      const p1 = clip(b, last[0], last[1]);
      s += w([p0, ...via, p1], { c: eo.c, dash: eo.dash, arrow: eo.arrow });
      const reg = eo.reg ?? (o.regs || {})[`${a}>${b}`];
      if (reg) {
        const fs = Array.isArray(reg) ? reg : Array.from({ length: reg }, (_, i) => (i + 1) / (reg + 1));
        for (const f of fs) { const [x, y] = along([p0, ...via, p1], f); s += dot(x, y, 4.5, eo.rc ?? o.rc ?? ""); }
      }
    }
    for (const [id, [cx, cy, label, no = {}]] of Object.entries(nodes)) {
      if (id[0] === "@") s += t(cx, cy, label ?? id.slice(1), { s: no.s || 16 });
      else {
        const [bw2, bh2] = size(id);
        s += box(cx - bw2 / 2, cy - bh2 / 2, bw2, bh2, label, Object.assign({ s: 14 }, o.font, no));
      }
    }
    return s;
  }

  // The 6.191 single-cycle RISC-V processor (lecture L11). Options:
  //   ra3: true adds a third read port (RA3 in, RD3 out); ra3In / rd3Out label its open arrows.
  //   wd: WDSEL input labels, left to right (default 0 pc+4, 1 aluRes, 2 memory); extra inputs
  //       get an open arrow from above, labeled by wdIn[i].
  //   sigs: extra decoder outputs, [name, class] pairs.
  //   extra: more parts drawn on top. w, h: drawing size (extra room on the right or top).
  //   dy: moves the processor down to leave room at the top.
  //   bsel3: a 3-input BSEL (0 rVal2, 1 imm, 2 open input Y; yIn labels it). werfsel: a mux on the
  //       register-file write enable (0, 1, open input X; xIn labels it).
  //   bselSwap: BSEL input 0 is rVal2 and input 1 is imm (the L11 worksheet numbering).
  //   pc4: a 4-input PCSEL with the branch and jump logic omitted (lecture L11 worksheet).
  //   repclear (Spring 2026 Q2 P3): a 4-input PCSEL whose input 0 comes from a pc / pc+4 mux
  //       with select Z; WASEL mux (rd or rs1); MDSEL mux (rVal2 or 0) before the memory data
  //       input; an offset register. masel adds an X + Y adder and a MASEL mux for the memory
  //       address. zIn, xIn, yIn label Z, X, Y (solutions).
  // Labels that a solution adds use class "acc".
  function rvsc(o = {}) {
    const dy = o.dy || 0;
    const Y = (y) => y + dy;
    const P = (s) => s.replace(/(\d+),(\d+)/g, (_, x, y) => `${x},${+y + dy}`);
    const wd = o.wd || ["0", "1", "2"];
    const wdIn = o.wdIn || [];
    const s = [];
    // next-PC mux, PC, +4, brTarget adder
    const rc = o.repclear, pc4 = rc || o.pc4;
    if (pc4) {
      s.push(mux(130, Y(66), 110, 16, { dir: "down", labels: ["3", "2", "1", "0"] }));
      s.push(t(84, Y(30), "(branching logic omitted)", { s: 10 }), w(P("144,40 144,66")), w(P("171,40 171,66")), w(P("199,40 199,66")));
    }
    if (rc) {
      s.push(mux(205, Y(22), 52, 14, { dir: "down", labels: ["1", "0"] }), w(P("231,36 231,52 226,52 226,66")));
      s.push(w(P("218,4 218,22")), w(P("244,4 244,22")), t(214, Y(4), "pc", { a: "end", s: 10 }), t(248, Y(4), "pc+4", { a: "start", s: 10 }));
      s.push(w(P("290,29 254,29")), t(296, Y(29), "Z", { a: "start", s: 14 }));
      if (o.zIn) s.push(t(312, Y(29), o.zIn, { a: "start", s: 12, c: "acc" }));
    } else if (pc4) s.push(w(P("226,40 226,66")), t(226, Y(30), "pc+4", { s: 10 }));
    else {
      s.push(mux(130, Y(66), 110, 16, { dir: "down", labels: ["2", "1", "0"] }));
      s.push(t(148, Y(10), "JT[31:1],1'b0", { s: 11 }), w(P("148,18 148,66")));
      s.push(t(222, Y(10), "branch ? brTarget : pc+4", { a: "start", s: 11 }));
    }
    s.push(w(P("80,74 134,74")), t(76, Y(74), "PCSEL", { a: "end", s: 11 }));
    s.push(w(P("185,82 185,96")), reg(130, Y(96), 110, 20, "PC"));
    s.push(line(P("185,116 185,128 300,128")), w(P("292,128 300,128")), dot(185, Y(128), 2.5), w(P("185,128 185,140")));
    s.push(box(168, Y(140), 34, 20, "+4", { s: 12, r: 2 }));
    s.push(line(P("185,160 185,172")), dot(185, Y(172), 2.5));
    if (pc4) s.push(w(P("185,172 230,172")), t(236, Y(172), "pc+4", { a: "start", s: 10 }));
    else {
      s.push(w(P("185,172 252,172 252,30 222,30 222,66")));
      s.push(dot(262, Y(128), 2.5), w(P("262,128 262,236")), box(250, Y(236), 24, 20, "+", { s: 14, r: 2 }));
      s.push(w(P("250,246 120,246 120,40 185,40 185,66")), t(170, Y(258), "brTarget", { s: 11 }));
    }
    // instruction memory and decoder
    s.push(box(300, Y(104), 110, 48, "Instruction\nMemory", { s: 12, b: true }));
    s.push(w(P("355,152 355,205")), t(362, Y(180), "Inst[31:0]", { a: "start", s: 11 }));
    s.push(box(290, Y(205), 130, 30, "Decoder", { s: 14, b: true }));
    if (!pc4) s.push(w(P("300,235 300,246 274,246")), t(296, Y(258), "imm", { a: "end", s: 11 }));
    // register file
    s.push(box(450, Y(262), 190, 60, "Register File", { s: 14, b: true, r: 2 }));
    s.push(line(P("420,214 530,214")), dot(470, Y(214), 2.5), w(P("470,214 470,262")), w(P("530,214 530,262")));
    s.push(t(476, Y(240), "rs1", { a: "start", s: 12 }), t(536, Y(240), "rs2", { a: "start", s: 12 }));
    if (rc) {
      s.push(w(P("400,235 400,282 424,282")), t(412, Y(274), "rd", { s: 12 }), w(P("400,300 424,300")), t(396, Y(300), "rs1", { a: "end", s: 12 }));
      s.push(mux(424, Y(272), 16, 38, { labels: ["1", "0"], k: 0.15 }), w(P("440,291 450,291")));
      s.push(w(P("432,330 432,305")), t(428, Y(338), "WASEL", { a: "end", s: 10 }));
    } else s.push(w(P("400,235 400,290 450,290")), t(424, Y(282), "rd", { s: 12 }));
    for (const [x, l] of [[470, "RA1"], [530, "RA2"]]) s.push(t(x, Y(270), l, { s: 9 }));
    for (const [x, l] of [[470, "RD1"], [530, "RD2"]]) s.push(t(x, Y(314), l, { s: 9 }));
    s.push(t(456, Y(290), "WA", { a: "start", s: 9 }), t(634, Y(280), "WD", { a: "end", s: 9 }), t(634, Y(302), "WE", { a: "end", s: 9 }));
    if (o.werfsel) {
      // WERFSEL mux on the write enable: 0, 1, or open input X
      s.push(`<polygon class="bx" points="${P("644,296 658,288 658,330 644,322")}"/>`, w(P("644,309 640,309")));
      [["0", 296], ["1", 309], ["X", 322]].forEach(([l, y], i) => s.push(t(652, Y(y), String(i), { s: 8 }), w(P(`690,${y} 658,${y}`)), t(694, Y(y), l, { a: "start", s: 11 })));
      s.push(w(P("651,350 651,327")), t(651, Y(358), "WERFSEL", { s: 10 }));
      if (o.xIn) s.push(t(706, Y(322), o.xIn, { a: "start", s: 11, c: "acc" }));
    } else s.push(w(P("680,302 640,302")), t(684, Y(302), "WERF", { a: "start", s: 11 }));
    if (o.ra3) {
      s.push(t(590, Y(270), "RA3", { s: 9, b: true }), t(590, Y(314), "RD3", { s: 9, b: true }));
      s.push(w(P("590,236 590,262")), w(P("590,322 590,344")));
      if (o.ra3In) s.push(t(584, Y(240), o.ra3In, { a: "end", s: 12, c: "acc" }));
      if (o.rd3Out) s.push(t(598, Y(338), o.rd3Out, { a: "start", s: 12, c: "acc" }));
    }
    // BSEL, ALU, data memory
    s.push(w(P("470,322 470,420")), t(464, Y(336), "rVal1", { a: "end", s: 12 }));
    if (o.bsel3) {
      // BSEL: 2 = open input Y, 1 = imm, 0 = rVal2
      s.push(line(P("530,322 530,340")), dot(530, Y(340), 2.5), w(P("530,340 563,340 563,368")), t(526, Y(334), "rVal2", { a: "end", s: 12 }));
      s.push(w(P("340,235 340,352 530,352 530,368")), t(380, Y(346), "imm", { s: 11 }), w(P("476,360 497,360 497,368")));
      s.push(t(465, Y(362), o.yIn ? "Y = " + o.yIn : "Y", { a: "end", s: 12, c: o.yIn ? "acc" : "" }));
      s.push(mux(480, Y(368), 100, 16, { dir: "down", labels: ["2", "1", "0"] }), w(P("620,376 576,376")), t(624, Y(376), "BSEL", { a: "start", s: 11 }));
    } else {
      s.push(line(P("530,322 530,340")), dot(530, Y(340), 2.5), w(P("530,340 555,340 555,368")), t(526, Y(334), "rVal2", { a: "end", s: 12 }));
      s.push(w(P("340,235 340,352 505,352 505,368")), t(380, Y(346), "imm", { s: 11 }));
      s.push(mux(480, Y(368), 100, 16, { dir: "down", labels: o.bselSwap ? ["1", "0"] : ["0", "1"] }), w(P("620,376 576,376")), t(624, Y(376), "BSEL", { a: "start", s: 11 }));
    }
    s.push(w(P("530,384 530,400 550,400 550,420")));
    s.push(`<polygon class="bx" points="${P("440,420 498,420 510,434 522,420 580,420 552,462 468,462")}"/>`);
    s.push(t(510, Y(446), "ALU", { s: 15, b: true }), t(470, Y(428), "A", { s: 9 }), t(550, Y(428), "B", { s: 9 }));
    s.push(w(P("400,436 452,436")), t(396, Y(436), "AluFunc", { a: "end", s: 11 }));
    s.push(w(P("400,452 462,452")), t(396, Y(452), "BrFunc", { a: "end", s: 11 }));
    s.push(w(P("566,446 602,446")), t(606, Y(446), "branch", { a: "start", s: 11 }));
    s.push(box(612, Y(462), 96, 56, "Data Memory", { s: 12, b: true }));
    s.push(t(628, Y(472), "En", { s: 9 }), t(660, Y(472), "WD", { s: 9 }), t(692, Y(472), "Op", { s: 9 }), t(o.masel ? 692 : 628, Y(o.masel ? 498 : 510), "Adr", { s: 9 }), t(692, Y(510), "RD", { s: 9 }));
    s.push(w(P("628,430 628,462")), t(628, Y(422), "MemEnable", { s: 10 }));
    s.push(w(P("692,430 692,462")), t(700, Y(410), "MemFunc", { s: 10 }));
    if (rc) {
      s.push(w(P("555,340 658,340 658,372")), w(P("686,352 686,372")), t(686, Y(345), "0", { s: 11 }));
      s.push(mux(644, Y(372), 56, 14, { dir: "down", labels: ["1", "0"] }), w(P("672,386 672,400 660,400 660,462")));
      s.push(w(P("716,356 716,379 698,379")), t(716, Y(349), "MDSEL", { s: 10 }));
      s.push(box(560, Y(14), 30, 22, "+4", { s: 11, r: 2 }), box(600, Y(48), 110, 28, "Offset Register", { s: 11, b: true, r: 2 }));
      s.push(w(P("590,25 630,25 630,48")), w(P("600,62 575,62 575,36")), w(P("690,14 690,48")), t(690, Y(6), "offsetReset", { s: 10 }));
      s.push(w(P("655,76 655,94")), t(655, Y(102), "offsetVal", { s: 10 }));
    } else s.push(w(P("555,340 660,340 660,462")));
    if (o.masel) {
      s.push(line(P("510,462 510,560")), t(502, Y(530), "aluResult", { a: "end", s: 11 }));
      s.push(box(752, Y(410), 40, 26, "+", { s: 15, r: 2 }), w(P("762,388 762,410")), w(P("782,388 782,410")));
      s.push(t(762, Y(380), "X", { s: 14 }), t(782, Y(380), "Y", { s: 14 }));
      if (o.xIn) s.push(t(756, Y(364), o.xIn, { a: "end", s: 11, c: "acc" }));
      if (o.yIn) s.push(t(788, Y(364), o.yIn, { a: "start", s: 11, c: "acc" }));
      s.push(mux(744, Y(456), 76, 14, { dir: "down", labels: ["1", "0"] }), w(P("772,436 772,456")));
      s.push(w(P("806,444 806,456")), t(810, Y(440), "aluResult", { a: "start", s: 10 }));
      s.push(w(P("850,463 816,463")), t(852, Y(476), "MASEL", { a: "start", s: 10 }));
      s.push(w(P("782,470 782,500 708,500")));
    } else s.push(line(P("510,462 510,560")), dot(510, Y(492), 2.5), w(P("510,492 612,492")), t(502, Y(500), "JT", { a: "end", s: 11 }), t(502, Y(530), "aluRes", { a: "end", s: 11 }));
    // WDSEL mux and write-back
    const n = wd.length, mx = 330, mw = 60 * n + 20;
    const ix = (i) => mx + (mw * (i + 0.5)) / n;
    s.push(mux(mx, Y(574), mw, 16, { dir: "down", labels: wd }));
    s.push(w(P(`185,172 100,172 100,556 ${Math.round(ix(0))},556 ${Math.round(ix(0))},574`)), t(140, Y(548), "PC+4", { s: 11 }));
    s.push(w(P(`510,560 ${Math.round(ix(1))},560 ${Math.round(ix(1))},574`).replace(/^/, "")));
    s.push(w(P(`692,518 692,540 ${Math.round(ix(2))},540 ${Math.round(ix(2))},574`)));
    for (let i = 3; i < n; i++) {
      s.push(w(P(`${Math.round(ix(i))},548 ${Math.round(ix(i))},574`)));
      if (wdIn[i]) s.push(t(ix(i) + 6, Y(548), wdIn[i], { a: "start", s: 12, c: "acc" }));
    }
    s.push(w(P(`${mx + mw + 50},582 ${mx + mw - 4},582`)), t(mx + mw + 54, Y(582), "WDSEL", { a: "start", s: 11 }));
    s.push(w(P(`${mx + mw / 2},590 ${mx + mw / 2},604 724,604 724,280 640,280`)));
    // decoder control outputs
    const sigs = [["BrFunc"], ["PCSEL"], ["BSEL"], ["WDSEL"], ["AluFunc"], ["WERF"], ["MemFunc"], ["MemEnable"]].concat(o.sigs || []);
    s.push(w(P(`316,235 316,290 250,290 250,${312 + sigs.length * 17}`)));
    sigs.forEach(([name, c], i) => s.push(w(P(`250,${310 + i * 17} 266,${310 + i * 17}`), { c }), t(270, Y(310 + i * 17), name, { a: "start", s: 11, c })));
    s.push(t(236, Y(196), "branch", { a: "end", s: 11 }), w(P("240,196 290,214")));
    if (o.extra) s.push(...[].concat(o.extra));
    return svg(o.w || 760, (o.h || 612) + dy, s);
  }

  // The "simplified single-cycle RISC-V processor" drawing used in the Spring quizzes. Options:
  //   pc: pcSel input labels (default 0 JT, 1 branchTarget, 2 pc+4); inputs past 2 get an open arrow.
  //   pcIn: labels for those extra pcSel inputs. wd: wdSel input labels (default 0..2); wdIn
  //   labels extra wdSel inputs. sigs: extra decoder outputs, [name, class] pairs.
  //   decIn: label of an extra input into the decoder from the right (for example "interrupt").
  //   extra: more parts, in the same coordinates. w, h: drawing size.
  function rvsimple(o = {}) {
    const s = [];
    const pcN = (o.pc || ["0", "1", "2"]).length, wdN = (o.wd || ["0", "1", "2"]).length;
    const wy0 = 592, wh = 32 * wdN; // wdSel input i is at y = 608 + 32 i
    // next PC
    s.push(t(245, 137, "brTaken ? pc + imm : pc + 4", { s: 11, m: true }), t(245, 152, "(branchTarget)", { s: 11, m: true }));
    s.push(t(180, 180, "{JT[31:1],", { s: 11, m: true }), t(180, 194, "1'b0}", { s: 11, m: true }));
    const px0 = 195, pxw = 110 + 25 * (pcN - 3);
    const pxi = (i) => px0 + (pxw * (i + 0.5)) / pcN;
    s.push(mux(px0, 217, pxw, 26, { dir: "down", labels: o.pc || ["0", "1", "2"], k: 0.18 }), t(px0 + pxw / 2, 236, "pcSel", { s: 10, m: true }));
    s.push(w(`212,182 ${r1(pxi(0))},182 ${r1(pxi(0))},217`), w(`${r1(pxi(1))},160 ${r1(pxi(1))},217`));
    s.push(w(`${r1(pxi(2))},200 ${r1(pxi(2))},217`), t(pxi(2) + 4, 192, "pc + 4", { a: "start", s: 11, m: true }));
    for (let i = 3; i < pcN; i++) {
      const x = r1(pxi(i)), y = 204 - 8 * (i - 3);
      s.push(line(`${x + 60},${y} ${x},${y}`), w(`${x},${y} ${x},217`));
      if ((o.pcIn || [])[i]) s.push(t(x + 64, y, o.pcIn[i], { a: "start", s: 11, m: true, c: "acc" }));
    }
    s.push(box(447, 153, 42, 33, "+", { s: 18, r: 6 }), w("447,169 410,169"), t(406, 169, "pc + imm", { a: "end", s: 11, m: true }));
    s.push(w("520,161 489,161"), w("520,177 489,177"), t(524, 161, "pc", { a: "start", s: 11, m: true }), t(524, 177, "imm", { a: "start", s: 11, m: true }));
    // PC, +4, instruction memory, decoder
    s.push(w(`${r1(px0 + pxw / 2)},243 ${r1(px0 + pxw / 2)},280`), box(177, 280, 135, 35, "PC", { s: 18, m: true, r: 6 }));
    s.push(line("245,315 245,331"), dot(245, 331, 2.5), w("245,331 346,331"), t(328, 341, "pc", { s: 11, m: true }), w("245,331 245,349"));
    s.push(box(211, 349, 68, 33, "+4", { s: 16, m: true, r: 6 }));
    s.push(w("245,382 245,608 345,608"), t(270, 396, "pc + 4", { a: "start", s: 11, m: true }), t(310, 598, "pc + 4", { s: 11, m: true }));
    s.push(box(346, 297, 179, 68, "Instruction\nMemory", { s: 17, m: true, r: 8 }));
    s.push(w("435,365 435,400"), t(441, 382, "inst", { a: "start", s: 11, m: true }));
    s.push(box(346, 400, 179, 68, "Instruction\nDecoder", { s: 17, m: true, r: 8 }));
    const sigs = [["aluFunc"], ["brFunc"], ["bSel"], ["memFunc"], ["wdSel"], ["rfWen"], ["pcSel"]].concat(o.sigs || []);
    s.push(w("346,435 290,435 290,448"));
    sigs.forEach(([name, c], i) => s.push(t(290, 466 + i * 17, name, { s: 11, m: true, c })));
    if (o.decIn) s.push(w("740,388 500,388 500,400"), t(650, 378, o.decIn, { s: 11, m: true }));
    // register file and operands
    s.push(line("525,435 728,435"), dot(555, 435, 2.5), dot(648, 435, 2.5));
    s.push(w("555,435 555,503"), w("648,435 648,503"), t(562, 488, "rs1", { a: "start", s: 11, m: true }), t(655, 488, "rs2", { a: "start", s: 11, m: true }));
    s.push(w("728,435 728,580 681,580 681,593"), t(722, 446, "imm", { a: "end", s: 11, m: true }));
    s.push(w("435,468 435,515 487,515"), t(450, 506, "rd", { s: 11, m: true }));
    s.push(w("440,533 487,533"), t(456, 525, "rfWen", { s: 11, m: true }), w(`372,${wy0 + wh / 2} 430,${wy0 + wh / 2} 430,562 487,562`), t(462, 553, "wd", { s: 11, m: true }));
    s.push(box(487, 503, 225, 80, "Register File", { s: 19, m: true, r: 10 }));
    s.push(w("555,583 555,640"), t(528, 594, "rVal1", { s: 11, m: true }), t(588, 628, "aluVal1", { s: 11, m: true }));
    s.push(w("643,583 643,593"), t(637, 592, "rVal2", { a: "end", s: 11, m: true }));
    s.push(mux(620, 593, 125, 25, { dir: "down", labels: ["0", "1"], k: 0.15 }), t(682, 610, "bSel", { s: 10, m: true }));
    s.push(w("665,618 665,640"), t(706, 628, "aluVal2", { s: 11, m: true }));
    s.push(`<polygon class="bx" points="487,640 597,640 603,648 627,648 633,640 745,640 700,705 530,705"/>`, t(617, 675, "ALU/Br", { s: 19, m: true }));
    s.push(w("478,672 508,672"), t(470, 664, "aluFunc", { a: "end", s: 11, m: true }), t(470, 682, "brFunc", { a: "end", s: 11, m: true }));
    s.push(w("704,697 750,697"), t(712, 688, "brTaken", { a: "start", s: 11, m: true }));
    // data memory and write-back select
    s.push(box(346, 728, 179, 69, "Data\nMemory", { s: 17, m: true, r: 8 }));
    s.push(w("436,710 436,728"), t(436, 702, "memFunc", { s: 11, m: true }), w("515,710 515,728"), t(515, 702, "memEn", { s: 11, m: true }));
    s.push(line("597,705 597,825 245,825 245,672"), w("245,672 345,672"), t(310, 662, "aluRes", { s: 11, m: true }));
    s.push(dot(597, 750, 2.5), w("597,750 525,750"), t(548, 742, "addr", { s: 11, m: true }));
    s.push(w("750,775 525,775", { dash: true }), t(548, 767, "dataIn", { s: 11, m: true }), t(720, 767, "rVal2", { s: 11, m: true }));
    s.push(w("346,763 270,763 270,640 345,640", { dash: true }), t(305, 754, "dataOut", { s: 11, m: true }), t(310, 630, "dataOut", { s: 11, m: true }));
    s.push(dot(245, 805, 2.5), w("245,805 212,805"), t(206, 805, "JT", { a: "end", s: 11, m: true }));
        s.push(mux(345, wy0, 27, wh, { labels: o.wd || ["0", "1", "2"], k: 0.12 }), t(361, wy0 + wh / 2, "wdSel", { s: 10, m: true, rot: 90 }));
    for (let i = 3; i < wdN; i++) {
      const y = 608 + 32 * i;
      s.push(w(`314,${r1(y)} 345,${r1(y)}`));
      if ((o.wdIn || [])[i]) s.push(t(310, y, o.wdIn[i], { a: "end", s: 11, m: true, c: "acc" }));
    }
    if (o.extra) s.push(...[].concat(o.extra));
    return svg(o.w || 650, o.h || 712, `<g transform="translate(-130 -125)">${s.join("")}</g>`);
  }

  // Instruction format: fields [label, hiBit, loBit] from bit 31 down; o.c: class per field label.
  function fields(fs, o = {}) {
    const unit = o.unit || 17, x0 = 6, y = 18, h = 30, out = [];
    let x = x0;
    for (const [label, hi, lo, c] of fs) {
      const wd = (hi - lo + 1) * unit;
      out.push(box(x, y, wd, h, label, { r: 0, s: 14, m: true, c }));
      out.push(t(x + 3, y - 8, String(hi), { a: "start", s: 9 }));
      if (hi !== lo) out.push(t(x + wd - 3, y - 8, String(lo), { a: "end", s: 9 }));
      x += wd;
    }
    return svg(x + 6, y + h + 4, out);
  }

  // State-transition diagram. states: { id: [cx, cy, label, sub] } draws circles (sub is a
  // second line, such as "U=0"). edges: [from, to, label, opts]: opts.bend curves the edge
  // (pixels to the left of the direction of travel; negative bends right); a self-loop
  // (from === to) sits on side opts.loop ("top", "bottom", "left", "right"). o.r: radius.
  function fsm(states, edges, o = {}) {
    const R = o.r || 24, s = [];
    for (const [a, b, label, eo = {}] of edges) {
      const [x1, y1] = states[a], [x2, y2] = states[b];
      if (a === b) {
        const dir = { top: [0, -1], bottom: [0, 1], left: [-1, 0], right: [1, 0] }[eo.loop || "top"];
        const cx = x1 + dir[0] * (R + 10), cy = y1 + dir[1] * (R + 10);
        const px = -dir[1], py = dir[0];
        const p0 = [x1 + dir[0] * R + px * 9, y1 + dir[1] * R + py * 9], p1 = [x1 + dir[0] * R - px * 9, y1 + dir[1] * R - py * 9];
        s.push(`<path class="ln" d="M${r1(p0[0])},${r1(p0[1])} C${r1(p0[0] + dir[0] * 30 + px * 14)},${r1(p0[1] + dir[1] * 30 + py * 14)} ${r1(p1[0] + dir[0] * 30 - px * 14)},${r1(p1[1] + dir[1] * 30 - py * 14)} ${r1(p1[0])},${r1(p1[1])}"/>`);
        s.push(head(p1[0], p1[1], -dir[0] * 0.3 + px * -1, -dir[1] * 0.3 + py * -1));
        s.push(t(cx + dir[0] * 26, cy + dir[1] * 26, label, { s: 12 }));
        continue;
      }
      const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
      const nx = dy / L, ny = -dx / L, bend = eo.bend || 0;
      const qx = (x1 + x2) / 2 + nx * bend, qy = (y1 + y2) / 2 + ny * bend;
      const u = (px, py, x, y) => { const l = Math.hypot(x - px, y - py); return [px + ((x - px) / l) * R, py + ((y - py) / l) * R]; };
      const p0 = u(x1, y1, qx, qy), p1 = u(x2, y2, qx, qy);
      s.push(`<path class="ln" d="M${r1(p0[0])},${r1(p0[1])} Q${r1(qx)},${r1(qy)} ${r1(p1[0])},${r1(p1[1])}"/>`, head(p1[0], p1[1], p1[0] - qx, p1[1] - qy));
      const mx = 0.25 * p0[0] + 0.5 * qx + 0.25 * p1[0], my = 0.25 * p0[1] + 0.5 * qy + 0.25 * p1[1];
      const off = eo.lo ?? 10;
      s.push(t(mx + nx * off * Math.sign(bend || 1), my + ny * off * Math.sign(bend || 1), label, { s: 12 }));
    }
    for (const [, [x, y, label, sub]] of Object.entries(states)) {
      s.push(`<circle class="bx${o.acc && o.acc.includes(label) ? " acc" : ""}" cx="${x}" cy="${y}" r="${R}"/>`);
      s.push(sub ? t(x, y - 6, label, { s: 14 }) + t(x, y + 9, sub, { s: 10 }) : t(x, y, label, { s: 14 }));
    }
    return s.join("");
  }

  // Pipeline diagram. o.rows: { stage: [cell, ...] } in stage order, one cell per cycle from
  // o.start. A cell "#" is shaded (no instruction yet); "" is empty. o.arrows: bypass arrows,
  // [fromStage, toStage, cycle], drawn up the right side of that cycle's column.
  // o.cw, o.rh: cell size. o.hl: { "stage@cycle": class } colors single cells (acc, ok, bad).
  function pipe(o) {
    const stages = Object.keys(o.rows);
    const n = Math.max(...stages.map((s) => o.rows[s].length), o.n || 0);
    const cw = o.cw || 46, rh = o.rh || 26, lw = o.lw || 52, start = o.start ?? 1;
    const W = lw + n * cw, H = rh * (stages.length + 1);
    const out = [];
    for (let i = 0; i < n; i++) out.push(t(lw + i * cw + cw / 2, rh / 2, String(start + i), { s: 12, b: true }));
    stages.forEach((st, r) => {
      const y = rh * (r + 1);
      out.push(t(lw / 2, y + rh / 2, st, { s: 12, b: true }));
      o.rows[st].forEach((c, i) => {
        const x = lw + i * cw;
        if (c === "#") out.push(`<rect class="shade" x="${x}" y="${y}" width="${cw}" height="${rh}"/>`);
        else if (c) out.push(t(x + cw / 2, y + rh / 2, c, { s: c.length > 5 ? 10 : 12, m: true, c: (o.hl || {})[`${st}@${start + i}`] }));
      });
    });
    for (let r = 0; r <= stages.length + 1; r++) out.push(`<line class="grid" x1="0" y1="${r * rh}" x2="${W}" y2="${r * rh}"/>`);
    for (let i = 0; i <= n; i++) out.push(`<line class="grid" x1="${i ? lw + i * cw : 0}" y1="0" x2="${i ? lw + i * cw : 0}" y2="${H}"/>`);
    out.push(`<line class="grid" x1="${lw}" y1="0" x2="${lw}" y2="${H}"/>`);
    for (const [from, to, cyc] of o.arrows || []) {
      const x = lw + (cyc - start) * cw + cw - 5;
      const y0 = rh * (stages.indexOf(from) + 1) + rh * 0.75, y1 = rh * (stages.indexOf(to) + 1) + rh * 0.25;
      out.push(w([[x, y0], [x, y1]], { c: "acc", w: 2 }));
    }
    return svg(W + 1, H + 1, out);
  }

  // Wraps parts into an <svg>. wd and ht set the drawing size in pixels; the figure
  // shrinks to the pane width.
  const svg = (wd, ht, ...parts) =>
    `<svg class="fig" viewBox="0 0 ${wd} ${ht}" width="${wd}" role="img">${parts.flat().join("")}</svg>`;

  // Registers a named figure for "@fig <name>".
  const def = (name, markup) => { FIGS[name] = markup; };

  root.Fig = { t, w, line, head, box, reg, mux, dot, circle, gate, graph, along, rvsc, rvsimple, fsm, fields, pipe, svg, def, FIGS };
})(typeof window !== "undefined" ? window : globalThis);

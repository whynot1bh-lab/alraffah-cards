import React, { useState, useEffect, useMemo, useRef } from "react";

/* ==========================================================
   RACECARD — Al Rifah race analyst
   Why Not Production · Rashid Equestrian & Horse Racing Club
   ========================================================== */

const FONTS =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Instrument+Sans:wght@400;500;600&display=swap";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const API_TIMEOUT_MS = 20000;

const CSS = `
:root{
  --bg:#0E1A19; --card:#162523; --card2:#1E332F; --line:#2A4340;
  --text:#EADFC9; --dim:#8FA29D; --faint:#5E7571;
  --silk:#C2453F; --gold:#C9A227; --good:#5FA37A;
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
.app{
  background:var(--bg); color:var(--text); min-height:100vh;
  font-family:"Instrument Sans",system-ui,sans-serif; font-size:15px;
  padding-bottom:78px; max-width:520px; margin:0 auto; position:relative;
}
.top{
  position:sticky; top:0; z-index:20; background:rgba(14,26,25,.94);
  backdrop-filter:blur(8px); border-bottom:1px solid var(--line);
  padding:16px 18px 13px;
}
.top h1{
  font-family:"Bricolage Grotesque",sans-serif; font-weight:700;
  font-size:25px; margin:0; letter-spacing:-.6px;
}
.top p{margin:2px 0 0; font-size:12.5px; color:var(--dim)}
.body{padding:16px 16px 8px}

.card{background:var(--card); border:1px solid var(--line); border-radius:13px; margin-bottom:10px}
.pad{padding:14px}

.lbl{font-size:11.5px; color:var(--dim); margin-bottom:5px; display:block; font-weight:500}
.in,.sel,.ta{
  width:100%; background:var(--card2); border:1px solid var(--line);
  border-radius:9px; color:var(--text); padding:11px 12px;
  font-family:inherit; font-size:15px; outline:none; appearance:none;
}
.in:focus,.sel:focus,.ta:focus{border-color:var(--gold)}
.in::placeholder{color:var(--faint)}
.row2{display:grid; grid-template-columns:1fr 1fr; gap:9px}
.row3{display:grid; grid-template-columns:1fr 1fr 1fr; gap:9px}
.stack{display:grid; gap:11px}

.chips{display:flex; gap:7px; flex-wrap:wrap}
.chip{
  background:var(--card2); border:1px solid var(--line); color:var(--dim);
  border-radius:999px; padding:7px 13px; font-size:13px; font-family:inherit;
  cursor:pointer;
}
.chip.on{background:var(--text); color:var(--bg); border-color:var(--text); font-weight:600}

.sechd{
  display:flex; align-items:center; justify-content:space-between;
  margin:20px 2px 9px;
}
.sechd h2{font-size:13px; font-weight:600; margin:0; letter-spacing:.2px}
.sechd span{font-size:12px; color:var(--dim)}

.rw{
  display:flex; align-items:center; gap:11px; padding:13px 14px;
  border-bottom:1px solid var(--line); cursor:pointer;
}
.rw:last-child{border-bottom:none}
.av{
  width:30px; height:30px; border-radius:8px; background:var(--card2);
  border:1px solid var(--line); display:flex; align-items:center;
  justify-content:center; font-size:13px; font-weight:600; color:var(--dim);
  flex:0 0 auto;
}
.rw-main{flex:1; min-width:0}
.rw-t{font-weight:600; font-size:15px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
.rw-s{font-size:12px; color:var(--dim); margin-top:2px}
.rw-r{font-size:12px; color:var(--dim); text-align:right; flex:0 0 auto}

.tag{
  display:inline-block; font-size:10.5px; padding:2px 7px; border-radius:5px;
  background:var(--card2); border:1px solid var(--line); color:var(--dim);
  margin-left:6px; vertical-align:1px;
}
.tag.imp{border-color:#6B5320; color:var(--gold)}
.tag.new{border-color:#2F5A47; color:var(--good)}

.btn{
  background:var(--card2); border:1px solid var(--line); color:var(--text);
  border-radius:10px; padding:12px 16px; font-family:inherit; font-size:15px;
  cursor:pointer; width:100%; font-weight:500;
}
.btn:active{background:var(--card)}
.btn.dash{border-style:dashed; color:var(--dim)}
.btn.go{
  background:var(--silk); border-color:var(--silk); color:#FFF1EE;
  font-weight:600; font-size:16.5px; padding:16px;
}
.btn.go:disabled{opacity:.42}
.btn.mini{width:auto; padding:9px 14px; font-size:13.5px}
.btn.danger{color:#D2807F; border-color:#4A2B2C}
.btnrow{display:flex; gap:8px}

.sheet{
  position:fixed; inset:0; z-index:60; background:rgba(6,12,11,.72);
  display:flex; align-items:flex-end; justify-content:center;
}
.sheet-in{
  background:var(--bg); width:100%; max-width:520px; max-height:88vh;
  overflow-y:auto; border-radius:18px 18px 0 0; border-top:1px solid var(--line);
  padding:8px 16px 28px;
}
.grab{width:38px; height:4px; background:var(--line); border-radius:2px; margin:8px auto 14px}
.sheet-t{font-family:"Bricolage Grotesque",sans-serif; font-weight:700; font-size:20px; margin:0 0 14px; letter-spacing:-.4px}

.tabs{
  position:fixed; bottom:0; left:0; right:0; z-index:50;
  background:rgba(14,26,25,.96); backdrop-filter:blur(10px);
  border-top:1px solid var(--line); display:flex; max-width:520px; margin:0 auto;
}
.tab{
  flex:1; background:none; border:none; color:var(--faint); font-family:inherit;
  font-size:11.5px; padding:11px 0 16px; cursor:pointer; display:grid;
  gap:3px; justify-items:center; font-weight:500;
}
.tab.on{color:var(--text)}
.tab i{font-style:normal; font-size:17px; line-height:1}

.pick{background:var(--card); border:1px solid var(--line); border-radius:13px; padding:14px; margin-bottom:9px}
.pick.top{border-color:var(--silk); background:linear-gradient(175deg,#25292B,var(--card) 62%)}
.pick-hd{display:flex; align-items:center; gap:12px}
.pk-n{font-family:"Bricolage Grotesque",sans-serif; font-size:27px; font-weight:700; color:var(--gold); min-width:24px; line-height:1}
.pick.top .pk-n{color:var(--silk)}
.pk-t{flex:1; font-size:16.5px; font-weight:600}
.pk-sc{font-size:25px; font-weight:700; font-variant-numeric:tabular-nums; text-align:right; line-height:1.1}
.pk-p{font-size:11.5px; color:var(--dim); text-align:right; margin-top:2px}

.bars{margin-top:12px; display:grid; gap:6px}
.bar{display:flex; align-items:center; gap:9px; font-size:11.5px}
.bar b{flex:0 0 66px; font-weight:400; color:var(--dim)}
.bar u{flex:1; height:5px; background:var(--card2); border-radius:3px; text-decoration:none; overflow:hidden}
.bar u i{display:block; height:100%; font-style:normal}
.bar s{flex:0 0 24px; text-align:right; color:var(--dim); text-decoration:none; font-variant-numeric:tabular-nums}

.note{
  border-left:3px solid var(--gold); background:var(--card); padding:12px 14px;
  border-radius:0 9px 9px 0; font-size:13px; color:var(--dim); margin:12px 0;
}
.err{
  background:#241618; border:1px solid #5E2A2E; color:#DFA3A6;
  padding:11px 13px; border-radius:9px; font-size:13px; margin:12px 0;
}
.narr{
  background:var(--card); border:1px solid var(--line); border-radius:13px;
  padding:16px; margin-top:12px; white-space:pre-wrap; line-height:1.78; font-size:15px;
}
.narr h3{margin:0 0 9px; font-size:11.5px; color:var(--gold); font-weight:600; letter-spacing:.3px}
.hint{font-size:11.5px; color:var(--faint); margin-top:5px; line-height:1.5}
.empty{text-align:center; padding:44px 20px; color:var(--dim)}
.empty h3{font-family:"Bricolage Grotesque",sans-serif; font-size:19px; margin:0 0 7px; color:var(--text); font-weight:700}
.empty p{margin:0; font-size:13.5px; line-height:1.6}
.ar{direction:rtl; unicode-bidi:isolate; color:var(--dim)}
.ar.block{display:block; color:var(--text); line-height:1.8; text-align:right}
.load{text-align:center; padding:20px; color:var(--dim); font-size:14px}
.sug{border-bottom:1px solid var(--line); padding:12px 2px; cursor:pointer}
.sug:last-child{border-bottom:none}
`;

/* ---------- constants ---------- */

const SURFACES = ["Dirt", "Dirt straight", "Turf"];
const CATEGORIES = ["Bahrain Bred", "Imported", "WAHO Arabian", "Handicap"];
const FITS = ["Proven", "Untested", "Unsuited"];
const ORIGINS = [
  "Bahrain Bred",
  "Imported — GB",
  "Imported — IRE",
  "Imported — FR",
  "Imported — UAE",
  "Imported — USA",
  "Imported — other",
];

const FACTORS = {
  form: "Form",
  rating: "Rating",
  jockey: "Jockey",
  trainer: "Trainer",
  distance: "Distance",
  freshness: "Freshness",
  draw: "Draw",
  weight: "Weight",
};

const W = {
  form: 0.3, rating: 0.26, jockey: 0.12, trainer: 0.09,
  distance: 0.1, freshness: 0.08, draw: 0.03, weight: 0.02,
};

const uid = () => Math.random().toString(36).slice(2, 10);

const TITLES = { race: "Racecard", stable: "Stable", record: "Record", setup: "Setup" };
const SUBS = {
  race: "Al Rifah · Rashid Equestrian & Horse Racing Club",
  stable: "Saved horses, reused every race",
  record: "How the selections actually did",
  setup: "Calibration and output",
};

/* profile = travels with the horse. entry = this race only. */
const newHorse = () => ({
  id: uid(), name: "", age: "", origin: "Bahrain Bred", rating: "",
  form: "", trainer: "", trainerWin: "", fit: "Proven", runs: 0,
});
const newEntry = (h) => ({
  key: uid(), horseId: h ? h.id : null, ...(h || newHorse()),
  jockey: "", jockeyWin: "", weight: "", draw: "", daysOff: "",
});

/* ---------- scoring ---------- */

const PTS = { 1: 100, 2: 78, 3: 60, 4: 45, 5: 34, 6: 26, 7: 20 };
const FW = [0.34, 0.25, 0.19, 0.13, 0.09];
const cl = (v, a, b) => Math.max(a, Math.min(b, v));
const nm = (v) => {
  const n = parseFloat(String(v).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
};

function formScore(form) {
  const p = String(form).split(/[^0-9]+/).filter(Boolean).slice(0, 5);
  if (!p.length) return { s: 42, runs: 0 };
  let t = 0, w = 0;
  p.forEach((x, i) => {
    const v = PTS[parseInt(x, 10)] != null ? PTS[parseInt(x, 10)] : 12;
    t += v * (FW[i] || 0.05); w += FW[i] || 0.05;
  });
  return { s: t / w, runs: p.length };
}

function fresh(d) {
  if (d == null) return 60;
  if (d < 10) return 68;
  if (d <= 45) return 100;
  if (d <= 90) return 80;
  if (d <= 180) return 55;
  return 34;
}

function analyse(race, list, cfg) {
  const n = list.length;
  const imp = (r) => r.origin !== "Bahrain Bred";

  const adj = list.map((r) => {
    const v = nm(r.rating);
    return v == null ? null : imp(r) ? v + cfg.offset : v;
  });
  const known = adj.filter((x) => x != null);
  const lo = known.length ? Math.min(...known) : 0;
  const hi = known.length ? Math.max(...known) : 0;

  const wts = list.map((r) => nm(r.weight)).filter((x) => x != null);
  const wAvg = wts.length ? wts.reduce((a, b) => a + b, 0) / wts.length : null;

  const rows = list.map((r, i) => {
    const fs = formScore(r.form);
    const jw = nm(r.jockeyWin), tw = nm(r.trainerWin), wv = nm(r.weight);
    const dr = nm(r.draw);

    const f = {
      form: fs.s,
      rating: adj[i] == null || hi === lo ? 50 : ((adj[i] - lo) / (hi - lo)) * 100,
      jockey: jw == null ? 50 : cl((jw / 25) * 100, 10, 100),
      trainer: tw == null ? 50 : cl((tw / 25) * 100, 10, 100),
      distance: r.fit === "Proven" ? 100 : r.fit === "Untested" ? 55 : 30,
      freshness: fresh(nm(r.daysOff)),
      draw: dr == null || n < 2 || race.surface === "Dirt straight"
        ? 50 : cl(90 - ((dr - 1) / Math.max(1, n - 1)) * 40, 45, 90),
      weight: wv == null || wAvg == null ? 50 : cl(50 + (wAvg - wv) * 3, 20, 80),
    };

    let score = 0;
    Object.keys(W).forEach((k) => { score += f[k] * W[k]; });

    let c = 95;
    const warn = [];
    if (imp(r)) { c -= cfg.penalty; warn.push("Imported — foreign form"); }
    if (r.fit !== "Proven") { c -= 10; warn.push("Distance unproven"); }
    const d = nm(r.daysOff);
    if (d != null && d > 180) { c -= 12; warn.push("Long layoff"); }
    if (fs.runs < 3) { c -= 15; warn.push("Thin record"); }
    if (nm(r.rating) == null) { c -= 8; warn.push("No rating"); }

    return { ...r, f, score, conf: cl(c, 20, 95), warn, imp: imp(r) };
  });

  const e = rows.map((r) => Math.exp(r.score / 11));
  const sum = e.reduce((a, b) => a + b, 0) || 1;
  rows.forEach((r, i) => { r.prob = (e[i] / sum) * 100; });
  rows.sort((a, b) => b.score - a.score);
  return rows;
}

/* ---------- narrative ---------- */

async function narrate(race, rows, lang) {
  const table = rows.map((r, i) =>
    `${i + 1}. ${r.name} — score ${r.score.toFixed(1)}, win chance ${r.prob.toFixed(1)}%, confidence ${r.conf}%
   form ${r.f.form.toFixed(0)} | rating ${r.f.rating.toFixed(0)} | jockey ${r.jockey || "n/a"} ${r.f.jockey.toFixed(0)} | trainer ${r.trainer || "n/a"} ${r.f.trainer.toFixed(0)} | distance ${r.f.distance.toFixed(0)} | freshness ${r.f.freshness.toFixed(0)}
   origin ${r.origin} | last runs ${r.form || "none"} | flags: ${r.warn.join(", ") || "none"}`
  ).join("\n");

  const ar = lang === "ar";
  const prompt = `You are the form analyst for "Al Rifah", a Bahraini TV programme covering racing at the Rashid Equestrian & Horse Racing Club.

Race: no. ${race.number || "—"}, ${race.date || ""}
${race.distance}m, ${race.surface}, ${race.category}, ${race.klass || "class n/a"}
${rows.length} runners.

Ranking from the rating engine:
${table}

Write broadcast-ready analysis ${ar ? "in simple Modern Standard Arabic with a neutral Gulf tone" : "in English"}. Rules:
- Exactly three short paragraphs. No headings, no markdown, no bullet points.
- Paragraph 1: the selection and why, in racing language (form, rating, distance suitability, jockey and trainer).
- Paragraph 2: the main danger and where the threat lies.
- Paragraph 3: the each-way or surprise runner, then one plain sentence of caution if any runner is imported making a local debut or is missing data.
- Never mention scores, percentages, models or algorithms. Write like someone who reads horses.
- Invent nothing that is not in the data above.
- 140 to 190 words total.`;

  const res = await postAnthropic({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });
  if (!res.ok) throw new Error("api");
  const d = await res.json();
  return (d.content || []).map((b) => (b.type === "text" ? b.text : "")).join("").trim();
}

/* ---------- research agent ---------- */

function grabJSON(s) {
  const clean = s.replace(/```json/gi, "").replace(/```/g, "");
  const starts = [];
  for (let i = 0; i < clean.length; i++) if (clean[i] === "{") starts.push(i);
  for (let si = starts.length - 1; si >= 0; si--) {
    let depth = 0, str = false, esc = false;
    for (let i = starts[si]; i < clean.length; i++) {
      const ch = clean[i];
      if (esc) { esc = false; continue; }
      if (ch === "\\") { esc = true; continue; }
      if (ch === '"') { str = !str; continue; }
      if (str) continue;
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          try {
            const o = JSON.parse(clean.slice(starts[si], i + 1));
            if (o && typeof o === "object") return o;
          } catch { /* try an earlier start */ }
          break;
        }
      }
    }
  }
  throw new Error("The search came back, but its answer could not be read.");
}

async function researchHorse(name, race) {
  const prompt = `Find racing form for a horse named "${name}" running at the Rashid Equestrian & Horse Racing Club in Bahrain.

Search in this order and do not stop at the first attempt:
1. "${name}" Bahrain Turf Club
2. "${name}" bahrainturfclub horse
3. "${name}" horse rating form

The club keeps a page per horse at bahrainturfclub.com/horses/H-xxxx showing: the country suffix in brackets after the name, Wins / Runs, Age, Sex, Owner, Trainer, Breeder, Sire, Dam, and "Horse Rate" which is the official rating. That page is the most reliable source — find it and read it before anything else. Searching the bare name on its own usually returns nothing, so always include the club name in the query.

Then make a second pass for its race record. Look at the club's racecards and results pages, and for an imported horse its record abroad, to work out where it finished in its last five starts and the date of its most recent run. Report finishes most recent first. Use the digit for a placing; if it was worse than ninth or did not complete, use 0.

Also find how the trainer is going this season. The club publishes trainer standings with wins and runs — turn that into a win percentage, rounded to a whole number.

Read the country suffix to set origin: (BHR) means Bahrain Bred, (GB) (IRE) (FR) (USA) mean imported from there, any other suffix means imported from elsewhere.

This race is ${race.category} over ${race.distance}m. If the horse is imported, its foreign record from Britain, Ireland, France, the UAE or the USA also counts — look for it.

Horse names repeat across countries. If you cannot confirm a field for this particular horse, leave it empty. Never guess a number.

Reply with JSON only. No prose, no markdown fences.

{
  "found": true or false,
  "confidence": "high" or "medium" or "low",
  "fields": {
    "age": "number as text, or empty",
    "origin": one of ${JSON.stringify(ORIGINS)}, or empty,
    "rating": "the Horse Rate or official rating as a number, or empty",
    "form": "last five finishing positions, most recent first, like 1-3-2-6-4, or empty",
    "trainer": "trainer name, or empty",
    "trainerWin": "trainer win percentage as a number, or empty"
  },
  "matched": "the horse name exactly as it appears on the page you used, with its country suffix, or empty",
  "pageUrl": "the club horse page url you read, or empty",
  "lastRun": "date of its most recent race as YYYY-MM-DD, or empty",
  "notes": "one short sentence: what you found, plus wins and runs if shown, plus any doubt about identity",
  "sources": ["site names you actually used"]
}`;

  const res = await postAnthropic({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
    tools: [{ type: "web_search_20250305", name: "web_search" }],
  });
  if (!res.ok) throw new Error("api");
  const d = await res.json();
  const text = (d.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  return grabJSON(text);
}

async function researchRider(name) {
  const prompt = `Find the current strike rate of a jockey named "${name}" riding at the Rashid Equestrian & Horse Racing Club in Bahrain.

Search "${name}" Bahrain Turf Club jockey, and the club's jockey standings page. The club publishes wins and rides per jockey for the season — turn that into a win percentage.

If you cannot find this jockey's figures, say so rather than guessing.

Reply with JSON only, no prose, no markdown fences:
{ "found": true or false, "winPct": "number as text, or empty", "note": "one short sentence with wins and rides if shown" }`;

  const res = await postAnthropic({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
    tools: [{ type: "web_search_20250305", name: "web_search" }],
  });
  if (!res.ok) throw new Error("api");
  const d = await res.json();
  return grabJSON((d.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n"));
}

async function translateNames(items) {
  const prompt = `These are names from a horse racing card in Bahrain. Give the Arabic form used by Bahraini racing media.

${items.map((i) => `${i.kind}: ${i.name}`).join("\n")}

Rules:
- Transliterate phonetically into Arabic. Do not translate the meaning of a horse name — SIGNALMAN becomes سيجنالمان, not رجل الإشارة.
- For people, use the spelling Gulf sports media would use. An Arab name goes back to its real Arabic spelling, so Adel Abdulla becomes عادل عبدالله, not عادل عبدللا.
- No diacritics. No explanation.

Reply with JSON only, no markdown fences:
{ "names": [ { "name": "the English name exactly as given", "ar": "the Arabic form" } ] }`;

  const res = await postAnthropic({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });
  if (!res.ok) throw new Error("api");
  const d = await res.json();
  return grabJSON((d.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n"));
}

async function storyAngles(race, rows, names) {
  const ar = (n) => (names[n] ? ` (${names[n]})` : "");
  const lines = rows.slice(0, 5).map((r, i) =>
    `${i + 1}. ${r.name}${ar(r.name)} — ${r.origin}, age ${r.age || "?"}, rating ${r.rating || "?"}, last runs ${r.form || "unknown"}, trainer ${r.trainer || "?"}${ar(r.trainer)}, jockey ${r.jockey || "?"}${ar(r.jockey)}, ${r.daysOff ? r.daysOff + " days since last run" : "layoff unknown"}`
  ).join("\n");

  const prompt = `You produce "Al Rifah", a Bahraini TV programme covering racing at the Rashid Equestrian & Horse Racing Club.

Race ${race.number || "—"}, ${race.date || ""}: ${race.distance}m, ${race.surface}, ${race.category}.
Top runners by the rating engine:
${lines}

Search for anything newsworthy about these horses, trainers, jockeys and owners at this club this season — a trainer without a win yet, a horse on a winning run, a jockey returning, a stable in form, a first runner for an owner, a rivalry.

Give the production team something to build the segment around. Reply with JSON only, no markdown fences:
{
  "angles": [
    { "hook": "one line in Arabic a presenter could say on air", "why": "one line in English explaining the basis", "solid": true or false }
  ],
  "questions": [ "three interview questions in Arabic for the trainer or jockey of the leading runner" ],
  "caption": "a short Instagram caption in Arabic for this race, under 30 words, no hashtags"
}

Give three angles. Set solid to false for any angle you could not actually verify by searching — the team must know which ones to check before airing. Never invent a statistic.`;

  const res = await postAnthropic({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
    tools: [{ type: "web_search_20250305", name: "web_search" }],
  });
  if (!res.ok) throw new Error("api");
  const d = await res.json();
  return grabJSON((d.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n"));
}

async function postAnthropic(payload) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    return await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (e) {
    if (e && e.name === "AbortError") throw new Error("The request timed out. Try again.");
    throw e;
  } finally {
    clearTimeout(t);
  }
}

function daysSince(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const then = new Date(iso + "T00:00:00");
  if (isNaN(then)) return null;
  const d = Math.round((Date.now() - then.getTime()) / 86400000);
  return d > 0 && d < 3000 ? String(d) : null;
}

/* ---------- storage ---------- */

const STABLE_KEY = "stable:horses";
const NAMES_KEY = "names:arabic";
const LOG_KEY = "log:races";

async function loadKey(key, fallback) {
  try {
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : fallback;
  } catch { return fallback; }
}
async function saveKey(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); return true; }
  catch { return false; }
}

async function loadStable() {
  try {
    const r = await window.storage.get(STABLE_KEY);
    return r ? JSON.parse(r.value) : [];
  } catch { return []; }
}
async function saveStable(list) {
  try { await window.storage.set(STABLE_KEY, JSON.stringify(list)); return true; }
  catch { return false; }
}

/* ---------- small ui ---------- */

function F({ label, hint, children }) {
  return (
    <div>
      <span className="lbl">{label}</span>
      {children}
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

function Sheet({ title, onClose, children }) {
  return (
    <div className="sheet" onClick={onClose}>
      <div className="sheet-in" onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        <h2 className="sheet-t">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function Chips({ options, value, onChange }) {
  return (
    <div className="chips">
      {options.map((o) => (
        <button
          key={o}
          className={"chip" + (value === o ? " on" : "")}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/* ---------- app ---------- */

export default function Racecard() {
  const [tab, setTab] = useState("race");
  const [stable, setStable] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const [race, setRace] = useState({
    number: "", date: "", distance: "1400",
    surface: "Dirt", category: "Imported", klass: "",
  });
  const [entries, setEntries] = useState([]);
  const [cfg, setCfg] = useState({ offset: -7, penalty: 25 });
  const [lang, setLang] = useState("en");

  const [editKey, setEditKey] = useState(null);
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [editHorseId, setEditHorseId] = useState(null);

  const [rows, setRows] = useState(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [recording, setRecording] = useState(false);
  const [finishes, setFinishes] = useState({});
  const [research, setResearch] = useState(null);
  const [names, setNames] = useState({});
  const [log, setLog] = useState([]);
  const [story, setStory] = useState(null);
  const [storyBusy, setStoryBusy] = useState(false);
  const [researchKey, setResearchKey] = useState(null);
  const [digging, setDigging] = useState("");
  const [status, setStatus] = useState(null);
  const [accepted, setAccepted] = useState({});
  const endRef = useRef(null);
  const scrollTimerRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById("rc-fonts")) {
      const l = document.createElement("link");
      l.id = "rc-fonts"; l.rel = "stylesheet"; l.href = FONTS;
      document.head.appendChild(l);
    }
    loadStable().then((s) => { setStable(s); setLoaded(true); });
    loadKey(NAMES_KEY, {}).then(setNames);
    loadKey(LOG_KEY, []).then(setLog);
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  const setRaceField = (k) => (e) => setRace((prev) => ({ ...prev, [k]: e.target.value }));
  const patch = (key, k, v) =>
    setEntries((es) => es.map((x) => (x.key === key ? { ...x, [k]: v } : x)));

  const editing = entries.find((x) => x.key === editKey);
  const profileEditing = stable.find((h) => h.id === editHorseId);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stable.slice(0, 8);
    return stable.filter((h) => h.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, stable]);

  const ready = entries.filter((e) => e.name.trim()).length >= 2;

  function addFromStable(h) {
    setEntries((es) => [...es, newEntry(h)]);
    setAdding(false); setQuery("");
  }
  function addNew() {
    const h = newHorse();
    h.name = query.trim();
    const e = newEntry(h);
    setEntries((es) => [...es, e]);
    setAdding(false); setQuery(""); setEditKey(e.key);
  }
  const removeEntry = (key) => {
    setEntries((es) => es.filter((x) => x.key !== key));
    setEditKey(null);
  };

  /* every horse entered gets written to the stable */
  async function syncStable(list) {
    const next = [...stable];
    list.forEach((e) => {
      const prof = {
        id: e.horseId || e.id, name: e.name.trim(), age: e.age,
        origin: e.origin, rating: e.rating, form: e.form,
        trainer: e.trainer, trainerWin: e.trainerWin, fit: e.fit,
      };
      const i = next.findIndex(
        (h) => h.id === prof.id ||
          h.name.toLowerCase() === prof.name.toLowerCase()
      );
      if (i >= 0) next[i] = { ...next[i], ...prof, runs: (next[i].runs || 0) + 1 };
      else next.push({ ...prof, runs: 1 });
    });
    setStable(next);
    await saveStable(next);
    return next;
  }

  async function fillAll(entry) {
    setErr(""); setMsg("");
    setStatus({ kind: "busy", text: `Searching for ${entry.name}\u2026` });
    const got = [];
    setDigging(entry.name);
    let out;
    try {
      out = await researchHorse(entry.name, race);
    } catch (e) {
      setDigging("");
      setStatus({ kind: "fail", text: e.message || "The lookup failed. Try again." });
      return;
    }
    if (!out.found) {
      setDigging("");
      setStatus({
        kind: "fail",
        text: out.notes || "No record found under that name. Check the spelling against the club site, or fill it in by hand.",
      });
      return;
    }
    {
      const f = out.fields || {};
      ["age", "origin", "rating", "form", "trainer", "trainerWin"].forEach((k) => {
        if (f[k] && String(f[k]).trim()) {
          const val = k === "origin" && !ORIGINS.includes(f[k]) ? "Imported — other" : f[k];
          patch(entry.key, k, String(val));
          got.push(k);
        }
      });
      const off = daysSince(out.lastRun);
      if (off) { patch(entry.key, "daysOff", off); got.push("days off"); }
    }

    if (entry.jockey.trim()) {
      setStatus({ kind: "busy", text: `Checking ${entry.jockey}\u2026` });
      setDigging(entry.jockey);
      try {
        const r = await researchRider(entry.jockey);
        if (r.found && r.winPct) { patch(entry.key, "jockeyWin", String(r.winPct)); got.push("jockey %"); }
      } catch { /* jockey lookup is optional */ }
    }

    setDigging("");
    setStatus({
      kind: got.length ? "ok" : "fail",
      text: got.length
        ? `Filled ${got.join(", ")}.`
        : "The page was found but no usable fields came back.",
      matched: out.matched || "",
      confidence: out.confidence || "",
      notes: out.notes || "",
      sources: out.sources || [],
    });
  }

  async function dig(entry) {
    setErr(""); setMsg("");
    setStatus({ kind: "busy", text: `Searching for ${entry.name}\u2026` });
    setDigging(entry.name);
    try {
      const out = await researchHorse(entry.name, race);
      setStatus(null);
      setResearch(out);
      setResearchKey(entry.key);
      const pre = {};
      Object.entries(out.fields || {}).forEach(([k, v]) => {
        if (v && String(v).trim()) pre[k] = true;
      });
      setAccepted(pre);
    } catch (e) {
      setStatus({ kind: "fail", text: e.message || `Could not look up ${entry.name}.` });
    }
    setDigging("");
  }

  function applyResearch() {
    const f = research.fields || {};
    Object.entries(f).forEach(([k, v]) => {
      if (accepted[k] && v && String(v).trim()) {
        const val = k === "origin" && !ORIGINS.includes(v) ? "Imported — other" : v;
        patch(researchKey, k, String(val));
      }
    });
    setResearch(null); setResearchKey(null);
    setMsg("Applied. Check the values against what you know before analysing.");
  }

  async function digAll() {
    const targets = entries.filter((e) => e.name.trim() && (!e.rating || !e.form));
    if (!targets.length) { setMsg("Every runner already has a rating and form."); return; }
    setErr(""); setMsg("");
    let filled = 0, blank = 0;
    for (const e of targets) {
      setDigging(e.name);
      try {
        const out = await researchHorse(e.name, race);
        const f = out.fields || {};
        let touched = false;
        ["age", "origin", "rating", "form", "trainer", "trainerWin"].forEach((k) => {
          if (!e[k] && f[k] && String(f[k]).trim()) {
            const val = k === "origin" && !ORIGINS.includes(f[k]) ? "Imported — other" : f[k];
            patch(e.key, k, String(val));
            touched = true;
          }
        });
        const off = daysSince(out.lastRun);
        if (off && !e.daysOff) { patch(e.key, "daysOff", off); touched = true; }
        patch(e.key, "checked", touched ? false : e.checked);
        if (touched) filled++; else blank++;
      } catch { blank++; }
    }
    setDigging("");
    setMsg(
      `Filled gaps on ${filled} horse${filled === 1 ? "" : "s"}` +
      (blank ? `, nothing found for ${blank}.` : ".") +
      " Everything found from the web is unverified — open each runner and check it."
    );
  }

  async function autoNames(list) {
    const want = [];
    list.forEach((e) => {
      if (e.name.trim() && !names[e.name]) want.push({ kind: "horse", name: e.name.trim() });
      if (e.jockey.trim() && !names[e.jockey]) want.push({ kind: "jockey", name: e.jockey.trim() });
      if (e.trainer.trim() && !names[e.trainer]) want.push({ kind: "trainer", name: e.trainer.trim() });
    });
    if (!want.length) return names;
    try {
      const out = await translateNames(want);
      const next = { ...names };
      (out.names || []).forEach((n) => { if (n.name && n.ar) next[n.name] = n.ar; });
      setNames(next);
      await saveKey(NAMES_KEY, next);
      return next;
    } catch { return names; }
  }

  async function getStory() {
    if (!rows) return;
    setStoryBusy(true); setErr("");
    try { setStory(await storyAngles(race, rows, names)); }
    catch { setErr("Could not pull story angles. Try again."); }
    setStoryBusy(false);
  }

  async function run() {
    setErr(""); setMsg(""); setBusy(true); setText("");
    const list = entries.filter((e) => e.name.trim());
    const computed = analyse(race, list, cfg);
    setRows(computed);
    setFinishes({});
    setStory(null);
    autoNames(list);
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
    }, 90);

    const before = stable.length;
    const after = await syncStable(list);
    const added = after.length - before;
    if (added > 0) setMsg(`${added} new horse${added > 1 ? "s" : ""} saved to your stable.`);

    try { setText(await narrate(race, computed, lang)); }
    catch { setErr("Ranking is ready, but the written analysis failed. Try again."); }
    setBusy(false);
  }

  async function saveFinishes() {
    const next = [...stable];
    let count = 0;
    rows.forEach((r) => {
    const p = String(finishes[r.key] || "").replace(/\D/g, "");
      if (!p) return;
    const i = next.findIndex(
      (h) => (r.horseId && h.id === r.horseId) || h.name.toLowerCase() === r.name.toLowerCase()
    );
    if (i < 0) return;
    const prev = (next[i].form || "").split("-").filter(Boolean);
    next[i] = { ...next[i], form: [p, ...prev].slice(0, 5).join("-") };
    count++;
    });
    setStable(next);
    await saveStable(next);

    const winnerRow = rows.find((r) => String(finishes[r.key] || "").replace(/\D/g, "") === "1");
    if (winnerRow && rows) {
      const winner = winnerRow.name;
      const predictedIdx = rows.findIndex(
        (r) => r.key === winnerRow.key
      );
      const entry = {
        id: uid(),
        date: race.date || new Date().toISOString().slice(0, 10),
        number: race.number || "—",
        distance: race.distance,
        category: race.category,
        runners: rows.length,
        pick: rows[0].name,
        pickConf: rows[0].conf,
        winner,
        pickWon: predictedIdx === 0,
        pickPlaced: predictedIdx >= 0 && predictedIdx <= 2,
        winnerRank: predictedIdx >= 0 ? predictedIdx + 1 : null,
      };
      const nextLog = [entry, ...log].slice(0, 200);
      setLog(nextLog);
      await saveKey(LOG_KEY, nextLog);
    }

    setRecording(false);
    setMsg(`Form updated for ${count} horse${count === 1 ? "" : "s"}.`);
  }

  async function deleteHorse(id) {
    const next = stable.filter((h) => h.id !== id);
    setStable(next); await saveStable(next); setEditHorseId(null);
  }
  async function saveProfile(h) {
    const next = stable.map((x) => (x.id === h.id ? h : x));
    setStable(next); await saveStable(next); setEditHorseId(null);
  }

  /* ---------- screens ---------- */

  const raceScreen = (
    <div className="body">
      <div className="card pad stack">
        <div className="row2">
          <F label="Race no."><input className="in" value={race.number} onChange={setRaceField("number")} placeholder="7" inputMode="numeric" /></F>
          <F label="Date"><input className="in" value={race.date} onChange={setRaceField("date")} placeholder="30 Oct" /></F>
        </div>
        <div className="row2">
          <F label="Distance (m)"><input className="in" value={race.distance} onChange={setRaceField("distance")} inputMode="numeric" /></F>
          <F label="Class"><input className="in" value={race.klass} onChange={setRaceField("klass")} placeholder="Class 1" /></F>
        </div>
        <F label="Surface">
          <Chips options={SURFACES} value={race.surface} onChange={(v) => setRace((prev) => ({ ...prev, surface: v }))} />
        </F>
        <F label="Category">
          <Chips options={CATEGORIES} value={race.category} onChange={(v) => setRace((prev) => ({ ...prev, category: v }))} />
        </F>
      </div>

      <div className="sechd">
        <h2>Runners</h2>
        <span>{entries.length}</span>
      </div>

      {entries.length === 0 ? (
        <div className="card">
          <div className="empty">
            <h3>No runners yet</h3>
            <p>Add a horse and it is saved automatically.<br />Next time you only fill in weight, draw and jockey.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          {entries.map((e, i) => (
            <div className="rw" key={e.key} onClick={() => { setStatus(null); setEditKey(e.key); }}>
              <div className="av">{i + 1}</div>
              <div className="rw-main">
                <div className="rw-t">
                  {e.name || "Unnamed"}
                  {e.origin !== "Bahrain Bred" && <span className="tag imp">IMP</span>}
                </div>
                <div className="rw-s">
                  {names[e.name] ? <span className="ar">{names[e.name]}</span> : null}
                  {e.form || "no form"}
                  {e.rating ? ` · OR ${e.rating}` : ""}
                  {e.jockey ? ` · ${e.jockey}` : ""}
                </div>
              </div>
              <div className="rw-r">
                {e.weight ? `${e.weight}kg` : "—"}
                <br />
                {e.draw ? `draw ${e.draw}` : ""}
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="btn dash" onClick={() => { setAdding(true); setQuery(""); }}>
        Add runner
      </button>

      {entries.length > 0 && (
        <>
          <button className="btn" style={{ marginTop: 8 }} onClick={digAll} disabled={!!digging}>
            {digging ? `Looking up ${digging}…` : "Look up missing data"}
          </button>
          <div className="hint">
            Searches the web for each runner that has no rating or form, and fills only the
            empty fields. Always check what comes back.
          </div>
        </>
      )}

      <button className="btn go" style={{ marginTop: 18 }} onClick={run} disabled={!ready || busy}>
        {busy ? "Analysing…" : "Analyse race"}
      </button>
      {!ready && <div className="hint" style={{ textAlign: "center" }}>Add at least two named runners.</div>}

      {msg && <div className="note">{msg}</div>}
      {err && <div className="err">{err}</div>}
      <div ref={endRef} />

      {rows && (
        <>
          <div className="sechd">
            <h2>Selections</h2>
            <span>by rating score</span>
          </div>
          {rows.map((r, i) => (
            <div className={"pick" + (i === 0 ? " top" : "")} key={r.key}>
              <div className="pick-hd">
                <div className="pk-n">{i + 1}</div>
                <div className="pk-t">
                  {r.name}
                  {r.imp && <span className="tag imp">IMP</span>}
                  {names[r.name] && <div className="ar block">{names[r.name]}</div>}
                </div>
                <div>
                  <div className="pk-sc" style={{ color: i === 0 ? "#C2453F" : "#EADFC9" }}>
                    {r.score.toFixed(0)}
                  </div>
                  <div className="pk-p">{r.prob.toFixed(0)}% · conf {r.conf}%</div>
                </div>
              </div>
              {i === 0 && (
                <div className="bars">
                  {Object.keys(FACTORS).map((k) => (
                    <div className="bar" key={k}>
                      <b>{FACTORS[k]}</b>
                      <u><i style={{
                        width: Math.round(r.f[k]) + "%",
                        background: r.f[k] > 70 ? "#C9A227" : "#4E6B65",
                      }} /></u>
                      <s>{r.f[k].toFixed(0)}</s>
                    </div>
                  ))}
                </div>
              )}
              {r.warn.length > 0 && (
                <div className="hint" style={{ marginTop: 9 }}>{r.warn.join(" · ")}</div>
              )}
            </div>
          ))}

          {rows.some((r) => r.imp) && (
            <div className="note">
              This race includes imported runners judged on foreign form. Present them
              on screen as a possibility, not a firm selection.
            </div>
          )}

          {busy && !text && <div className="load">Writing the analysis…</div>}
          {text && (
            <div className="narr">
              <h3>FOR THE BROADCAST</h3>
              {text}
            </div>
          )}

          <div className="btnrow" style={{ marginTop: 12 }}>
            <button className="btn mini" onClick={() => setRecording(true)}>Record result</button>
            {text && (
              <button className="btn mini" onClick={() => navigator.clipboard.writeText(text)}>
                Copy analysis
              </button>
            )}
          </div>

          <button className="btn" style={{ marginTop: 10 }} onClick={getStory} disabled={storyBusy}>
            {storyBusy ? "Digging for angles…" : "Story angles & interview questions"}
          </button>

          {story && (
            <>
              <div className="sechd"><h2>Segment material</h2></div>
              {(story.angles || []).map((a, i) => (
                <div className="card pad" key={i} style={{ marginBottom: 8 }}>
                  <div className="ar block" style={{ fontSize: 16, marginBottom: 6 }}>{a.hook}</div>
                  <div className="hint">{a.why}</div>
                  <span className={"tag " + (a.solid ? "new" : "imp")} style={{ marginLeft: 0, marginTop: 8, display: "inline-block" }}>
                    {a.solid ? "verified" : "check before airing"}
                  </span>
                </div>
              ))}

              {(story.questions || []).length > 0 && (
                <div className="card pad" style={{ marginBottom: 8 }}>
                  <div className="lbl">Interview questions</div>
                  {story.questions.map((q, i) => (
                    <div className="ar block" key={i} style={{ marginTop: 8, fontSize: 15 }}>
                      {i + 1}. {q}
                    </div>
                  ))}
                </div>
              )}

              {story.caption && (
                <div className="card pad">
                  <div className="lbl">Instagram caption</div>
                  <div className="ar block" style={{ marginTop: 6, fontSize: 15 }}>{story.caption}</div>
                  <button className="btn mini" style={{ marginTop: 12 }}
                    onClick={() => navigator.clipboard.writeText(story.caption)}>
                    Copy caption
                  </button>
                </div>
              )}
            </>
          )}
          <div className="hint">
            Recording the finishing positions pushes each result into that horse's form,
            so the next race starts from better data.
          </div>
        </>
      )}
    </div>
  );

  const stableScreen = (
    <div className="body">
      <div className="sechd">
        <h2>Your stable</h2>
        <span>{stable.length} horses</span>
      </div>
      {!loaded ? (
        <div className="load">Loading…</div>
      ) : stable.length === 0 ? (
        <div className="card">
          <div className="empty">
            <h3>Empty for now</h3>
            <p>Every horse you enter on a racecard lands here with its age,<br />origin, rating, trainer and form.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          {stable
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((h) => (
              <div className="rw" key={h.id} onClick={() => setEditHorseId(h.id)}>
                <div className="av">{h.name.slice(0, 1).toUpperCase()}</div>
                <div className="rw-main">
                  <div className="rw-t">
                    {h.name}
                    {h.origin !== "Bahrain Bred" && <span className="tag imp">IMP</span>}
                  </div>
                  <div className="rw-s">
                    {h.form || "no form"}
                    {h.rating ? ` · OR ${h.rating}` : ""}
                    {h.trainer ? ` · ${h.trainer}` : ""}
                  </div>
                </div>
                <div className="rw-r">{h.runs || 1} run{(h.runs || 1) === 1 ? "" : "s"}</div>
              </div>
            ))}
        </div>
      )}
      <div className="hint" style={{ marginTop: 10 }}>
        Tap a horse to correct its details. Changes apply the next time you add it to a race.
      </div>
    </div>
  );

  const stats = useMemo(() => {
    if (!log.length) return null;
    const won = log.filter((l) => l.pickWon).length;
    const placed = log.filter((l) => l.pickPlaced).length;
    const ranks = log.filter((l) => l.winnerRank).map((l) => l.winnerRank);
    return {
      n: log.length,
      won, placed,
      winPct: Math.round((won / log.length) * 100),
      placePct: Math.round((placed / log.length) * 100),
      avgRank: ranks.length ? (ranks.reduce((a, b) => a + b, 0) / ranks.length).toFixed(1) : "—",
    };
  }, [log]);

  const recordScreen = (
    <div className="body">
      {!stats ? (
        <div className="card">
          <div className="empty">
            <h3>Nothing logged yet</h3>
            <p>Analyse a race, then tap Record result and enter<br />the finishing positions. Your hit rate builds from there.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="card pad">
            <div className="row3">
              <div>
                <div className="pk-sc" style={{ textAlign: "left", color: "#C2453F" }}>{stats.winPct}%</div>
                <div className="hint">top pick won</div>
              </div>
              <div>
                <div className="pk-sc" style={{ textAlign: "left" }}>{stats.placePct}%</div>
                <div className="hint">top pick in first three</div>
              </div>
              <div>
                <div className="pk-sc" style={{ textAlign: "left" }}>{stats.avgRank}</div>
                <div className="hint">avg rank of winner</div>
              </div>
            </div>
          </div>

          <div className="note">
            A top-pick strike rate around 30 to 35 percent is what good form analysis
            achieves. Below 20 percent over twenty races means the engine needs its
            weights changed, not more data.
          </div>

          <div className="sechd">
            <h2>Races logged</h2>
            <span>{stats.n}</span>
          </div>
          <div className="card">
            {log.map((l) => (
              <div className="rw" key={l.id} style={{ cursor: "default" }}>
                <div className="av" style={{ color: l.pickWon ? "#5FA37A" : l.pickPlaced ? "#C9A227" : "#8FA29D" }}>
                  {l.pickWon ? "✓" : l.winnerRank || "·"}
                </div>
                <div className="rw-main">
                  <div className="rw-t">{l.pick}</div>
                  <div className="rw-s">
                    {l.pickWon ? "won" : `beaten by ${l.winner}`} · {l.runners} runners
                  </div>
                </div>
                <div className="rw-r">{l.date}<br />{l.distance}m</div>
              </div>
            ))}
          </div>
          <div className="hint" style={{ marginTop: 10 }}>
            Only races where you entered a winner are counted.
          </div>
        </>
      )}
    </div>
  );

  const setupScreen = (
    <div className="body">
      <div className="sechd"><h2>Imported runners</h2></div>
      <div className="card pad stack">
        <F label="Rating adjustment" hint="Points taken off a foreign official rating before it is compared with local horses.">
          <input className="in" value={cfg.offset} inputMode="numeric"
            onChange={(e) => setCfg({ ...cfg, offset: nm(e.target.value) || 0 })} />
        </F>
        <F label="Confidence penalty" hint="How much certainty an imported runner loses. Higher means more cautious selections.">
          <input className="in" value={cfg.penalty} inputMode="numeric"
            onChange={(e) => setCfg({ ...cfg, penalty: nm(e.target.value) || 25 })} />
        </F>
      </div>
      <div className="note">
        These two numbers are yours to calibrate. Go back through imported horses from
        past seasons, compare the rating they carried abroad against what they actually
        did at Sakhir, and move the numbers until the engine matches reality.
      </div>

      <div className="sechd"><h2>Analysis language</h2></div>
      <div className="card pad">
        <Chips
          options={["en", "ar"]}
          value={lang}
          onChange={setLang}
        />
        <div className="hint">The interface stays in English. This sets the language of the written analysis only.</div>
      </div>
    </div>
  );

  return (
    <div className="app">
      <style>{CSS}</style>

      <div className="top">
        <h1>{TITLES[tab]}</h1>
        <p>{SUBS[tab]}</p>
      </div>

      {tab === "race" ? raceScreen
        : tab === "stable" ? stableScreen
        : tab === "record" ? recordScreen
        : setupScreen}

      {/* add runner */}
      {adding && (
        <Sheet title="Add runner" onClose={() => setAdding(false)}>
          <input
            className="in" autoFocus value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a horse name"
          />
          <div style={{ marginTop: 14 }}>
            {matches.length > 0 && (
              <div className="lbl">
                {query.trim() ? "From your stable" : "Recently used"}
              </div>
            )}
            {matches.map((h) => (
              <div className="sug" key={h.id} onClick={() => addFromStable(h)}>
                <div style={{ fontWeight: 600 }}>
                  {h.name}
                  {h.origin !== "Bahrain Bred" && <span className="tag imp">IMP</span>}
                </div>
                <div className="hint" style={{ marginTop: 3 }}>
                  {h.form || "no form"}
                  {h.rating ? ` · OR ${h.rating}` : ""}
                  {h.trainer ? ` · ${h.trainer}` : ""}
                </div>
              </div>
            ))}
          </div>
          {query.trim() && (
            <button className="btn" style={{ marginTop: 16 }} onClick={addNew}>
              Add “{query.trim()}” as a new horse
            </button>
          )}
          {!query.trim() && stable.length === 0 && (
            <div className="hint" style={{ marginTop: 10 }}>
              Type a name to create your first horse.
            </div>
          )}
        </Sheet>
      )}

      {/* edit entry */}
      {editing && (
        <Sheet title={editing.name || "Runner"} onClose={() => { setEditKey(null); setStatus(null); }}>
          <div className="stack">
            <F label="Horse"><input className="in" value={editing.name}
              onChange={(e) => patch(editing.key, "name", e.target.value)} /></F>

            <div className="btnrow">
              <button className="btn go" onClick={() => fillAll(editing)}
                disabled={!editing.name.trim() || !!digging}>
                {digging ? `Searching ${digging}…` : "Fill everything"}
              </button>
              <button className="btn" onClick={() => dig(editing)}
                disabled={!editing.name.trim() || !!digging}>
                Review first
              </button>
            </div>
            <div className="hint">
              Fill everything writes straight into the fields. Review first shows you what
              was found and lets you pick. Neither can get weight or draw — those appear
              only on race-day declarations.
            </div>

            {status && (
              <div className={status.kind === "fail" ? "err" : "note"} style={{ margin: "4px 0 0" }}>
                <div style={{ color: status.kind === "ok" ? "#5FA37A" : undefined }}>{status.text}</div>
                {status.matched && (
                  <div className="hint" style={{ marginTop: 7 }}>
                    Matched on the club site as <b>{status.matched}</b>
                    {status.confidence ? ` · ${status.confidence} confidence` : ""}
                  </div>
                )}
                {status.notes && <div className="hint" style={{ marginTop: 5 }}>{status.notes}</div>}
                {status.sources && status.sources.length > 0 && (
                  <div className="hint" style={{ marginTop: 5 }}>Sources: {status.sources.join(", ")}</div>
                )}
                {status.matched && (
                  <div className="hint" style={{ marginTop: 7 }}>
                    If that is not the horse you mean, clear the fields and enter them yourself.
                  </div>
                )}
              </div>
            )}

            <div className="lbl" style={{ marginTop: 6 }}>This race</div>
            <div className="row3">
              <F label="Weight kg"><input className="in" value={editing.weight} inputMode="decimal"
                onChange={(e) => patch(editing.key, "weight", e.target.value)} /></F>
              <F label="Draw"><input className="in" value={editing.draw} inputMode="numeric"
                onChange={(e) => patch(editing.key, "draw", e.target.value)} /></F>
              <F label="Days off"><input className="in" value={editing.daysOff} inputMode="numeric"
                onChange={(e) => patch(editing.key, "daysOff", e.target.value)} /></F>
            </div>
            <div className="row2">
              <F label="Jockey"><input className="in" value={editing.jockey}
                onChange={(e) => patch(editing.key, "jockey", e.target.value)} /></F>
              <F label="Jockey win %"><input className="in" value={editing.jockeyWin} inputMode="decimal"
                onChange={(e) => patch(editing.key, "jockeyWin", e.target.value)} /></F>
            </div>

            <div className="lbl" style={{ marginTop: 6 }}>Saved with the horse</div>
            <div className="row2">
              <F label="Age"><input className="in" value={editing.age} inputMode="numeric"
                onChange={(e) => patch(editing.key, "age", e.target.value)} /></F>
              <F label="Official rating"><input className="in" value={editing.rating} inputMode="numeric"
                onChange={(e) => patch(editing.key, "rating", e.target.value)} /></F>
            </div>
            <F label="Last five finishes" hint="Most recent first, e.g. 1-3-2-6-4">
              <input className="in" value={editing.form} placeholder="1-3-2-6-4"
                onChange={(e) => patch(editing.key, "form", e.target.value)} />
            </F>
            <div className="row2">
              <F label="Trainer"><input className="in" value={editing.trainer}
                onChange={(e) => patch(editing.key, "trainer", e.target.value)} /></F>
              <F label="Trainer win %"><input className="in" value={editing.trainerWin} inputMode="decimal"
                onChange={(e) => patch(editing.key, "trainerWin", e.target.value)} /></F>
            </div>
            <F label="Origin">
              <select className="sel" value={editing.origin}
                onChange={(e) => patch(editing.key, "origin", e.target.value)}>
                {ORIGINS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </F>
            <F label="At this distance">
              <Chips options={FITS} value={editing.fit}
                onChange={(v) => patch(editing.key, "fit", v)} />
            </F>

            <div className="btnrow" style={{ marginTop: 6 }}>
              <button className="btn" onClick={() => setEditKey(null)}>Done</button>
              <button className="btn danger" onClick={() => removeEntry(editing.key)}>Remove</button>
            </div>
          </div>
        </Sheet>
      )}

      {/* edit saved profile */}
      {profileEditing && (
        <Sheet title={profileEditing.name} onClose={() => setEditHorseId(null)}>
          <ProfileEditor
            horse={profileEditing}
            onSave={saveProfile}
            onDelete={deleteHorse}
          />
        </Sheet>
      )}

      {/* research review */}
      {research && (
        <Sheet title="What the search found" onClose={() => setResearch(null)}>
          {!research.found ? (
            <>
              <div className="hint" style={{ marginBottom: 16 }}>
                Nothing reliable came back for this horse. That is common for
                Bahrain-bred runners — their record is thin online. Fill it in by hand.
              </div>
              <button className="btn" onClick={() => setResearch(null)}>Close</button>
            </>
          ) : (
            <>
              <div className="chips" style={{ marginBottom: 12 }}>
                <span className={"chip" + (research.confidence === "high" ? " on" : "")}>
                  {research.confidence} confidence
                </span>
              </div>
              {research.matched && (
                <div className="hint" style={{ marginBottom: 10 }}>
                  Matched as <b>{research.matched}</b>
                </div>
              )}
              {research.notes && <div className="note">{research.notes}</div>}

              <div className="lbl" style={{ marginTop: 10 }}>Tap a field to include it</div>
              <div className="card" style={{ marginTop: 6 }}>
                {Object.entries(research.fields || {})
                  .filter(([, v]) => v && String(v).trim())
                  .map(([k, v]) => (
                    <div className="rw" key={k}
                      onClick={() => setAccepted((prev) => ({ ...prev, [k]: !prev[k] }))}>
                      <div className="av">{accepted[k] ? "✓" : ""}</div>
                      <div className="rw-main">
                        <div className="rw-t">{String(v)}</div>
                        <div className="rw-s">{k}</div>
                      </div>
                    </div>
                  ))}
              </div>

              {Array.isArray(research.sources) && research.sources.length > 0 && (
                <div className="hint" style={{ marginTop: 10 }}>
                  Sources: {research.sources.join(", ")}
                </div>
              )}

              <div className="btnrow" style={{ marginTop: 16 }}>
                <button className="btn go" onClick={applyResearch}>Use selected</button>
                <button className="btn" onClick={() => setResearch(null)}>Discard</button>
              </div>
              <div className="hint" style={{ marginTop: 10 }}>
                Horse names repeat across countries. If any of this looks wrong for the
                horse you mean, discard it — a wrong number is worse than a blank field.
              </div>
            </>
          )}
        </Sheet>
      )}

      {/* record result */}
      {recording && rows && (
        <Sheet title="Record the result" onClose={() => setRecording(false)}>
          <div className="hint" style={{ marginBottom: 14 }}>
            Enter finishing positions. Each one is added to that horse's form.
          </div>
          <div className="stack">
            {rows.map((r) => (
              <div className="row2" key={r.key} style={{ alignItems: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{r.name}</div>
                <input className="in" inputMode="numeric" placeholder="finished"
                  value={finishes[r.key] || ""}
                  onChange={(e) => setFinishes((prev) => ({ ...prev, [r.key]: e.target.value }))} />
              </div>
            ))}
          </div>
          <button className="btn go" style={{ marginTop: 18 }} onClick={saveFinishes}>
            Save to stable
          </button>
        </Sheet>
      )}

      <div className="tabs">
        <button className={"tab" + (tab === "race" ? " on" : "")} onClick={() => setTab("race")}>
          <i>▤</i>Race
        </button>
        <button className={"tab" + (tab === "stable" ? " on" : "")} onClick={() => setTab("stable")}>
          <i>◈</i>Stable
        </button>
        <button className={"tab" + (tab === "record" ? " on" : "")} onClick={() => setTab("record")}>
          <i>◎</i>Record
        </button>
        <button className={"tab" + (tab === "setup" ? " on" : "")} onClick={() => setTab("setup")}>
          <i>◐</i>Setup
        </button>
      </div>
    </div>
  );
}

function ProfileEditor({ horse, onSave, onDelete }) {
  const [h, setH] = useState(horse);
  const set = (k) => (e) => setH({ ...h, [k]: e.target.value });
  return (
    <div className="stack">
      <F label="Horse"><input className="in" value={h.name} onChange={set("name")} /></F>
      <div className="row2">
        <F label="Age"><input className="in" value={h.age} onChange={set("age")} inputMode="numeric" /></F>
        <F label="Official rating"><input className="in" value={h.rating} onChange={set("rating")} inputMode="numeric" /></F>
      </div>
      <F label="Last five finishes" hint="Most recent first">
        <input className="in" value={h.form} onChange={set("form")} placeholder="1-3-2-6-4" />
      </F>
      <div className="row2">
        <F label="Trainer"><input className="in" value={h.trainer} onChange={set("trainer")} /></F>
        <F label="Trainer win %"><input className="in" value={h.trainerWin} onChange={set("trainerWin")} inputMode="decimal" /></F>
      </div>
      <F label="Origin">
        <select className="sel" value={h.origin} onChange={set("origin")}>
          {ORIGINS.map((o) => <option key={o}>{o}</option>)}
        </select>
      </F>
      <F label="Distance suitability">
        <Chips options={FITS} value={h.fit} onChange={(v) => setH({ ...h, fit: v })} />
      </F>
      <div className="btnrow" style={{ marginTop: 6 }}>
        <button className="btn" onClick={() => onSave(h)}>Save</button>
        <button className="btn danger" onClick={() => onDelete(h.id)}>Delete</button>
      </div>
    </div>
  );
}

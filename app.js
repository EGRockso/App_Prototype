// =======================
// Rockso prototype — app.js (cohérence S0→S1→S2, quotidien, tendance, récup, sync)
// =======================

/* -------------------------------------------------------------------- *
 * 1) Storage helpers
 * -------------------------------------------------------------------- */
const STORE_KEY = "rocksoState";

function getStore() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
  catch { return {}; }
}
function saveStore(st) {
  localStorage.setItem(STORE_KEY, JSON.stringify(st));
  window.dispatchEvent(new CustomEvent("rockso:storeUpdated"));
}

/* -------------------------------------------------------------------- *
 * 2) Données démo : Baseline S-0 (cohérente avec S-1 et S-2)
 * -------------------------------------------------------------------- */
const BASELINE_S0 = {
  week_index: 0,
  start_iso: "2025-09-15",
  end_iso:   "2025-09-21",
  summary: { total_km: 44.0, km_z5t: 3.5, load_spike_rel_w1_w2: 1.00, sessions: 4, duration_min: 230 },
  activities: [
    { datetime_iso:"2025-09-16T07:00:00", type:"run", distance_km:10.0, duration_min:51, avg_hr:148 },
    { datetime_iso:"2025-09-18T18:10:00", type:"run", distance_km:8.5,  duration_min:43, avg_hr:150 },
    { datetime_iso:"2025-09-19T07:05:00", type:"run", distance_km:9.5,  duration_min:48, avg_hr:146 },
    { datetime_iso:"2025-09-21T09:00:00", type:"run", distance_km:16.0, duration_min:88, avg_hr:152 }
  ],
  daily: [
    { date:"2025-09-15", steps:9800, active_cal:650, act_min:42, rhr_bpm:54, hrv_ms:74, sleep_min:430, resp_rpm:14, spo2_pct:97, rpe:3 },
    { date:"2025-09-16", steps:12100,active_cal:760, act_min:58, rhr_bpm:55, hrv_ms:72, sleep_min:445, resp_rpm:14, spo2_pct:97, rpe:4 },
    { date:"2025-09-17", steps:10300,active_cal:640, act_min:40, rhr_bpm:54, hrv_ms:75, sleep_min:452, resp_rpm:14, spo2_pct:98, rpe:3 },
    { date:"2025-09-18", steps:11600,active_cal:720, act_min:54, rhr_bpm:55, hrv_ms:73, sleep_min:432, resp_rpm:14, spo2_pct:97, rpe:4 },
    { date:"2025-09-19", steps:10800,active_cal:690, act_min:46, rhr_bpm:54, hrv_ms:74, sleep_min:438, resp_rpm:14, spo2_pct:98, rpe:4 },
    { date:"2025-09-20", steps:9200, active_cal:560, act_min:32, rhr_bpm:53, hrv_ms:76, sleep_min:455, resp_rpm:13, spo2_pct:98, rpe:2 },
    { date:"2025-09-21", steps:14000,active_cal:880, act_min:70, rhr_bpm:55, hrv_ms:72, sleep_min:420, resp_rpm:14, spo2_pct:97, rpe:5 }
  ],
  ml: { predicted_label: 0, predicted_probability: 0.09, model: "global_sgd_tuned.joblib (simulé)" },
  analysis_text: `
  <strong>Semaine de référence, fluide et maîtrisée</strong><br>
  <ul>
    <li><strong>Charge :</strong> 44 km en 3h50 (4 séances), intensité mesurée (~3,5 km rapides).</li>
    <li><strong>Récupération :</strong> sommeil ≈ <strong>7h19</strong>, HRV ~<strong>74 ms</strong>, RPE moyen 3–4 → bonne tolérance.</li>
  </ul>
  <strong>Ce que ça raconte</strong><br>
  <ul>
    <li>Distribution d’intensité “80/20” cohérente : la base aérobie progresse sans dérive cardiaque.</li>
    <li>Variations naturelles : volume ~<strong>-4%</strong> vs semaine précédente estimée, intensité ~<strong>+8%</strong> → signal normal, sans surcharge.</li>
  </ul>
  <strong>Suggestion pour S+1</strong><br>
  <ul>
    <li>Garder le volume dans une fourchette <strong>±0–5%</strong> (≈ 42–46 km) et <strong>1 seule</strong> séance de qualité.</li>
    <li>Mercredi : <em>10×400 m</em> à SL2 (récup 200 m trot), échauffement 15’ + retour au calme 10’.</li>
    <li>1 jour de repos total + 1 jour de récup active (vélo Z2 40–60’) pour consolider les adaptations.</li>
  </ul>
  <small class="muted">Analyse basée sur la progression graduelle de la charge, la distribution d’intensité et les marqueurs de récupération (HRV, RPE, sommeil).</small>
  `.trim()
};

const DEMO_INLINE = [
  { // S1 — semaine maîtrisée
    week_index: 1, start_iso: "2025-09-22", end_iso: "2025-09-28",
    activities: [
      { datetime_iso:"2025-09-22T07:10:00", type:"run",  distance_km:12.6, duration_min:63, avg_hr:148 },
      { datetime_iso:"2025-09-24T18:00:00", type:"run",  distance_km:8.0,  duration_min:42, avg_hr:151 },
      { datetime_iso:"2025-09-26T07:20:00", type:"run",  distance_km:10.2, duration_min:54, avg_hr:146 },
      { datetime_iso:"2025-09-28T09:00:00", type:"run",  distance_km:18.5, duration_min:95, avg_hr:152 }
    ],
    summary: { total_km: 49.3, km_z5t: 4.2, load_spike_rel_w1_w2: 1.12, sessions: 4, duration_min: 314 },
    daily: [
      { date:"2025-09-22", steps:11000,active_cal:700, act_min:48, rhr_bpm:55, hrv_ms:73, sleep_min:440, resp_rpm:14, spo2_pct:97, rpe:4 },
      { date:"2025-09-23", steps:9800, active_cal:610, act_min:38, rhr_bpm:54, hrv_ms:74, sleep_min:448, resp_rpm:14, spo2_pct:98, rpe:3 },
      { date:"2025-09-24", steps:12500,active_cal:820, act_min:64, rhr_bpm:56, hrv_ms:72, sleep_min:430, resp_rpm:14, spo2_pct:97, rpe:5 },
      { date:"2025-09-25", steps:10200,active_cal:630, act_min:40, rhr_bpm:55, hrv_ms:73, sleep_min:445, resp_rpm:14, spo2_pct:98, rpe:3 },
      { date:"2025-09-26", steps:11300,active_cal:720, act_min:52, rhr_bpm:55, hrv_ms:73, sleep_min:435, resp_rpm:14, spo2_pct:98, rpe:4 },
      { date:"2025-09-27", steps:9000, active_cal:540, act_min:28, rhr_bpm:53, hrv_ms:76, sleep_min:470, resp_rpm:13, spo2_pct:98, rpe:2 },
      { date:"2025-09-28", steps:15000,active_cal:940, act_min:76, rhr_bpm:56, hrv_ms:71, sleep_min:420, resp_rpm:14, spo2_pct:97, rpe:6 }
    ],
    ml: { predicted_label: 0, predicted_probability: 0.12, model:"global_sgd_tuned.joblib (simulé)" },
    analysis_text: "Semaine maîtrisée : 49 km (+12% vs réf), intensité contrôlée (~4 km Z5/T1/T2). Sommeil stable, HRV ~73 ms, RPE moyen 4 → risque faible."
  },
  { // S2 — surcharge
    week_index: 2, start_iso: "2025-09-29", end_iso: "2025-10-05",
    activities: [
      { datetime_iso:"2025-09-29T06:55:00", type:"run",  distance_km:15.0, duration_min:74, avg_hr:154 },
      { datetime_iso:"2025-10-01T19:05:00", type:"run",  distance_km:10.2, duration_min:50, avg_hr:158 },
      { datetime_iso:"2025-10-03T07:00:00", type:"run",  distance_km:12.0, duration_min:56, avg_hr:160 },
      { datetime_iso:"2025-10-05T09:10:00", type:"run",  distance_km:24.0, duration_min:118, avg_hr:156 }
    ],
    summary: { total_km: 61.2, km_z5t: 10.0, load_spike_rel_w1_w2: 1.39, sessions: 4, duration_min: 298 },
    daily: [
      { date:"2025-09-29", steps:13200,active_cal:820, act_min:60, rhr_bpm:57, hrv_ms:69, sleep_min:415, resp_rpm:15, spo2_pct:97, rpe:6 },
      { date:"2025-09-30", steps:9600, active_cal:590, act_min:36, rhr_bpm:56, hrv_ms:68, sleep_min:410, resp_rpm:15, spo2_pct:97, rpe:4 },
      { date:"2025-10-01", steps:14000,active_cal:900, act_min:72, rhr_bpm:58, hrv_ms:66, sleep_min:405, resp_rpm:15, spo2_pct:97, rpe:7 },
      { date:"2025-10-02", steps:10100,active_cal:620, act_min:40, rhr_bpm:57, hrv_ms:67, sleep_min:420, resp_rpm:15, spo2_pct:97, rpe:5 },
      { date:"2025-10-03", steps:12800,active_cal:840, act_min:62, rhr_bpm:59, hrv_ms:65, sleep_min:400, resp_rpm:15, spo2_pct:97, rpe:7 },
      { date:"2025-10-04", steps:8700, active_cal:520, act_min:26, rhr_bpm:56, hrv_ms:70, sleep_min:455, resp_rpm:14, spo2_pct:98, rpe:3 },
      { date:"2025-10-05", steps:18000,active_cal:1150,act_min:88, rhr_bpm:60, hrv_ms:63, sleep_min:395, resp_rpm:16, spo2_pct:97, rpe:8 }
    ],
    ml: { predicted_label: 1, predicted_probability: 0.74, model:"global_sgd_tuned.joblib (simulé)" },
    analysis_text: "Surcharge (+39% vs réf) et intensité élevée (~10 km Z5/T1/T2). HRV en baisse (~66 ms), sommeil en retrait, RPE élevé → risque accru. Conseils : réduire le volume 20-30 %, maintenir l’intensité technique courte, 2 nuits ≥ 7h30."
  }
];

const DEMO_WEEKS = ["week_demo_1.json","week_demo_2.json"];
const DEMO_ALT_PREFIXES = ["./","./assets/","./data/","./assets/data/"];

function resolveUrl(rel) {
  const base = (document.querySelector('base')?.href) ||
               (location.origin + location.pathname.replace(/[^/]+$/, ''));
  return new URL(rel, base).toString();
}
async function tryFetch(url) {
  const res = await fetch(url, { cache:"no-cache" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
async function loadWeek(idx){
  const file = DEMO_WEEKS[idx];
  for (const p of DEMO_ALT_PREFIXES) {
    try { return await tryFetch(resolveUrl(p + file)); }
    catch(_) { /* continue */ }
  }
  return DEMO_INLINE[idx];
}

/* -------------------------------------------------------------------- *
 * 3) Init S-0 une seule fois (si store vide)
 * -------------------------------------------------------------------- */
function ensureBaselineS0() {
  const st = getStore();
  if (!st.weeks || !st.weeks.length) {
    const init = {
      synced: 0,
      weeks: [ BASELINE_S0 ],
      activities: BASELINE_S0.activities.slice(),
      daily: BASELINE_S0.daily.slice(),
      lastActivity: BASELINE_S0.activities[BASELINE_S0.activities.length-1],
      lastWeekAnalysis: { text: BASELINE_S0.analysis_text, ml: BASELINE_S0.ml }
    };
    saveStore(init);
  }
}

/* -------------------------------------------------------------------- *
 * 4) Sélecteurs & formatage
 * -------------------------------------------------------------------- */
const $  = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function fmtDurSec(sec){
  const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s = Math.round(sec%60);
  return (h? h+":" : "") + String(m).padStart(2,'0') + ":" + String(s).padStart(2,'0');
}
function fmtMinutesToHM(min){
  const h = Math.floor(min/60), m = Math.round(min%60);
  return `${h}h ${String(m).padStart(2,'0')}`;
}
function fmtDate(iso){
  const d = new Date(iso);
  return d.toLocaleString('fr-FR',{ weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
}
function formatKm(n){
  const v = Number(n||0);
  return `${v.toLocaleString('fr-FR',{ maximumFractionDigits:1 })} km`;
}
function paceSecPerKm(distanceKm, durationMin){ if (!distanceKm || distanceKm<=0) return 0; return Math.round((durationMin*60)/distanceKm); }
function fmtPace(secPerKm){
  if (!secPerKm) return '—';
  const m = Math.floor(secPerKm/60), s = String(Math.round(secPerKm%60)).padStart(2,'0');
  return `${m}:${s}/km`;
}
function avg(arr, key){ const n=arr.length||0; if(!n) return 0; return arr.reduce((a,x)=>a+(x[key]||0),0)/n; }
function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }

/* -------------------------------------------------------------------- *
 * 5) Live state (depuis store)
 * -------------------------------------------------------------------- */
function getLiveState(){
  const st = getStore();
  if (st.weeks && st.weeks.length){
    const lastW = st.weeks[st.weeks.length-1];
    const acts = (st.activities||[]).slice()
      .sort((a,b)=> new Date(a.datetime_iso||a.dateISO) - new Date(b.datetime_iso||b.dateISO));
    const uiActs = acts.map((a,i)=>({
      id: `wk${(a.week_index ?? lastW.week_index)}-a${i+1}`,
      type: 'Course',
      dateISO: a.datetime_iso,
      distanceKm: Number(a.distance_km ?? a.distanceKm ?? 0),
      durationSec: Math.round((a.duration_min||0)*60),
      paceSecPerKm: paceSecPerKm(a.distance_km || 0, a.duration_min || 0),
      hrAvg: a.avg_hr || null,
      elevPos: 0, calories: 0
    }));
    const lastRaw = acts[acts.length-1];
    const lastActivity = lastRaw ? uiActs[uiActs.length-1] : null;

    return {
      weekly: {
        load: lastW.summary?.total_km || 0,
        hours: (lastW.summary?.duration_min || 0)/60,
        sessions: lastW.summary?.sessions || acts.length,
        durationMin: lastW.summary?.duration_min || 0
      },
      lastActivity,
      activities: uiActs,
      sports: [
        { name:"Course", color:"#EB6E9A" },
        { name:"Cyclisme", color:"#00B37A" },
        { name:"Padel", color:"#F2A65A" },
        { name:"Renfo", color:"#E9DDC9" }
      ],
      daily: st.daily || [],
      lastWeekAnalysis: st.lastWeekAnalysis || null,
      weeks: st.weeks
    };
  }
  return {
    weekly: { load: 0, hours: 0, sessions: 0, durationMin: 0 },
    lastActivity: null, activities: [], sports: [], daily: [], lastWeekAnalysis: null, weeks:[]
  };
}

/* -------------------------------------------------------------------- *
 * 6) Hydratations (pages)
 * -------------------------------------------------------------------- */
const Icons = {
  Course:'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 12h3l3 4 3-8 3 4h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
const EVOL_THRESH = { ok:10, warn:20 };
function setEvolution(baseId, valuePct=0){
  const valEl = document.getElementById(baseId);
  const dotEl = document.getElementById(`${baseId}-dot`);
  if (!valEl || !dotEl) return;
  const sign = valuePct > 0 ? '+' : '';
  valEl.textContent = `${sign}${Math.round(valuePct)}%`;
  const a = Math.abs(valuePct);
  dotEl.classList.remove('dot--ok','dot--warn','dot--risk');
  if (a <= EVOL_THRESH.ok) dotEl.classList.add('dot--ok');
  else if (a <= EVOL_THRESH.warn) dotEl.classList.add('dot--warn');
  else dotEl.classList.add('dot--risk');
}

function hydrateHome(){
  const loadEl = $('#metric-load');
  if (!loadEl) return;
  const live = getLiveState();

  loadEl.textContent = formatKm(live.weekly.load);
  const hoursEl = $('#metric-hours');
  if (hoursEl) hoursEl.textContent = fmtMinutesToHM(live.weekly.durationMin);

  // Évolution (si 2+ semaines), sinon 0%
  const st = getStore();
  if (st.weeks && st.weeks.length >= 2){
    const prev = st.weeks[st.weeks.length-2].summary?.total_km || live.weekly.load;
    const evol = prev ? ((live.weekly.load - prev)/prev)*100 : 0;
    setEvolution('evol-vol', evol);
    const prevInt = (st.weeks[st.weeks.length-2].summary?.km_z5t || 0)/(prev||1);
    const curInt  = (st.weeks[st.weeks.length-1].summary?.km_z5t || 0)/(live.weekly.load||1);
    setEvolution('evol-int', Math.round((curInt - prevInt)*100));
  } else {
    setEvolution('evol-vol', -4);
    setEvolution('evol-int', +8);
  }

  // Sports chips
  const chips = $('#sport-chips');
  if (chips && chips.children.length === 0){
    live.sports.forEach(sp=>{
      const el = document.createElement('span');
      el.className = 'chip';
      el.innerHTML = `<span class="dot" style="background:${sp.color}"></span>${sp.name}`;
      chips.appendChild(el);
    });
  }

  // Dernière activité
  const last = live.lastActivity;
  if (last){
    const t = $('#last-type'); if (t) t.textContent = last.type;
    $('#last-date')      && ($('#last-date').textContent = fmtDate(last.dateISO));
    $('#last-distance')  && ($('#last-distance').textContent = `${(last.distanceKm||0).toFixed(2)} km`);
    $('#last-duration')  && ($('#last-duration').textContent = fmtDurSec(last.durationSec||0));
    $('#last-pace')      && ($('#last-pace').textContent = fmtPace(last.paceSecPerKm));
    $('#last-activity')  && ($('#last-activity').href = `./activity.html?id=${last.id}`);
  }

  renderAnalysisPanelFromStore();
}

const SHOW_SPARK = true; // passe à false pour masquer la sparkline

// ─────────────────────────────────────────────────────────────────────────────
//  ANALYSE — GLANCE → REASON → PLAN
// ─────────────────────────────────────────────────────────────────────────────
function renderAnalysisPanelFromStore(){
  const mount = document.getElementById("analysis-panel");
  if (!mount) return;

  const st = getStore();
  const weeks = st.weeks || [];
  const cur = weeks[weeks.length - 1];
  const prev = weeks[weeks.length - 2];

  if (!cur){
    mount.innerHTML = `<div class="card"><div class="card-body"><p>Pas d'analyse disponible.</p></div></div>`;
    return;
  }

  // --- basic numbers ---
  const km         = Number(cur.summary?.total_km || 0);
  const durMin     = Number(cur.summary?.duration_min || 0);
  const sessions   = Number(cur.summary?.sessions || (cur.activities?.length || 0));
  const kmInt      = Number(cur.summary?.km_z5t || 0);
  const shareInt   = km > 0 ? (kmInt / km) : 0;         // 0..1

  const prevKm       = Number(prev?.summary?.total_km || 0);
  const prevShareInt = prevKm > 0 ? (Number(prev?.summary?.km_z5t || 0) / prevKm) : null;

  // deltas (+ default S0: -4% vol / +8% intensité)
  const deltaVol = prevKm > 0 ? ((km - prevKm) / prevKm) * 100 : -4;
  const deltaInt = (prevShareInt != null) ? ((shareInt - prevShareInt) * 100) : +8;

  // daily avgs for “Reason”
  const days = cur.daily || st.daily || [];
  const avgLocal = (arr, k) => (arr.length ? arr.reduce((a,x)=>a+(x[k]||0),0)/arr.length : 0);
  const slpMin = avgLocal(days,'sleep_min'); // minutes
  const hrvMs  = avgLocal(days,'hrv_ms');
  const rpe    = avgLocal(days,'rpe');

  // verdict
  const spike = Number(cur.summary?.load_spike_rel_w1_w2 || 1.0);
  const ml    = cur.ml || {};
  let tone = 'ok', pill = 'Risque faible', oneLiner = 'Semaine maîtrisée';
  if (ml.predicted_label === 1 || spike >= 1.25 || shareInt >= 0.18){
    tone = 'risk'; pill = 'Risque accru'; oneLiner = 'Surcharge et intensité élevée';
  } else if (Math.abs(deltaVol) > 15 || shareInt >= 0.12){
    tone = 'warn'; pill = 'A surveiller'; oneLiner = 'Hausse sensible à contrôler';
  } else {
    tone = 'ok'; pill = 'Risque faible'; oneLiner = prev ? 'Progression sans excès' : 'Semaine de référence';
  }

  // tiny helpers
  const pct = (n, d=0) => `${(n>=0?'+':'')}${n.toFixed(d)}%`;
  const hm  = (m) => {
    const h = Math.floor((m||0)/60), mm = Math.round((m||0)%60);
    return `${h}h ${String(mm).padStart(2,'0')}`;
  };

  // PLAN slots (generated from tone)
  let plan = {
    vol: tone==='risk' ? '−20 à −30 %' : 'Stabiliser (≤ +6 %)',
    int: tone==='risk' ? '1 séance courte' : '1 séance qualité',
    sub: "1 sortie → vélo 60–75’ Z2"
  };

  // long form (coach sheet)
  const longText = (cur.analysis_text?.trim())
    ? cur.analysis_text
    : (tone==='risk'
       ? "Semaine en surcharge : volume et/ou intensité élevés. Réduis le volume de 20–30 %, conserve une seule séance technique courte et dors ≥7h30 2 nuits."
       : "Semaine maîtrisée : progression dans la zone sûre. Conserve 1 séance de qualité, stabilise le volume et ajoute du vélo Z2 si jambes lourdes.");

  // One-liners
  const iaBrief = extractBriefText(cur.analysis_text || '', 220);
  const briefDefault = `${km.toLocaleString('fr-FR',{maximumFractionDigits:1})} km • ${hm(durMin)} • ${Math.round(shareInt*100)}% int. • ${pct(deltaVol,0)} vs ${prev ? 'S-1' : 'réf.'}`;
  const briefTxt = extractAiOneLiner(cur, briefDefault);

  const glance = `
    <div class="ap-card ap-hero ap-${tone}">
      <div class="ap-row">
        <span class="ap-pill">${pill}</span>
        <span class="ap-oneliner clamp-1">${oneLiner}</span>
      </div>

      <div class="ap-kpis">
        <div class="ap-kpi">
          <div class="ap-kpi-label">Distance</div>
          <div class="ap-kpi-val kpi-num">${km.toLocaleString('fr-FR',{maximumFractionDigits:1})} km</div>
          <div class="ap-kpi-sub">${pct(deltaVol,0)} vs sem. préc.</div>
        </div>
        <div class="ap-kpi">
          <div class="ap-kpi-label">Durée</div>
          <div class="ap-kpi-val kpi-num">${hm(durMin)}</div>
          <div class="ap-kpi-sub">${prev ? (Math.abs((durMin-(prev.summary?.duration_min||0))/(prev.summary?.duration_min||1)*100)<3 ? '≈' : '') : '—'}</div>
        </div>
        <div class="ap-kpi">
          <div class="ap-kpi-label">% Intensité</div>
          <div class="ap-kpi-val kpi-num">${Math.round(shareInt*100)}%</div>
          <div class="ap-kpi-sub">${prevShareInt!=null ? pct((shareInt-prevShareInt)*100,0) : '+8%'}</div>
        </div>
      </div>

      <!-- Résumé IA qui doit remplir l'espace jusqu'aux points -->
      <p class="ap-brief">${briefTxt}</p>
    </div>
  `;

  // --- REASON (chips courts + sparkline optionnelle)
  const sleepHM = hm(slpMin).replace(' ', '');
  const rpeTxt  = (rpe || 0).toFixed(1);
  const reason = `
    <div class="ap-card ap-reason">
      <div class="ap-reason-row">
        <span class="chip chip-soft" title="Sommeil moyen">😴 ~${sleepHM}</span>
        <span class="chip chip-soft" title="Variabilité cardiaque">🫀 ${Math.round(hrvMs)||'—'} ms</span>
        <span class="chip chip-soft" title="Effort perçu">🧭 RPE&nbsp;${rpeTxt}</span>
      </div>
      ${SHOW_SPARK ? `
      <div class="ap-sparkwrap">
        <div class="ap-spark-title muted">Volume (6 sem.)</div>
        ${buildMiniSparkline((st.weeks||[]).slice(-6).map(w => Number(w.summary?.total_km||0)), km, prevKm)}
      </div>` : ``}
    </div>
  `;

  // build PLAN (3 slots + CTA)
  const planCard = `
    <div class="ap-card ap-plan">
      <div class="ap-plan-title">Conseil pour S+1</div>
      <div class="ap-plan-slots">
        <button class="ap-slot" data-plan="vol">📈 <strong>Volume</strong><br><span>${plan.vol}</span></button>
        <button class="ap-slot" data-plan="int">⚡ <strong>Intensité</strong><br><span>${plan.int}</span></button>
        <button class="ap-slot" data-plan="sub">🚲 <strong>Substitution</strong><br><span>${plan.sub}</span></button>
      </div>
      <button class="ap-plan-cta link-cta" data-open-sheet>Appliquer au plan</button>
    </div>
  `;

  const isTrainingPage = document.body.dataset.page === 'training';

  if (isTrainingPage){
    // STACKED (no carousel)
    mount.innerHTML = `<div class="ap-stack">${glance}${reason}${planCard}</div>`;
    wireCoachSheet(longText, cur);
  } else {
    // 2-SLIDE CAROUSEL (GLANCE first)
    mount.innerHTML = `
      <div class="ap-carousel" data-auto="9000">
        <div class="ap-track">
          <div class="ap-slide">${glance}</div>
          <div class="ap-slide">
            ${reason}
            ${planCard}
          </div>
        </div>
        <div class="ap-dots" aria-label="Navigation">
          <button class="dot active" aria-selected="true"><span class="fill"></span></button>
          <button class="dot" aria-selected="false"><span class="fill"></span></button>
        </div>
      </div>
    `;

    initApCarousel(mount.querySelector('.ap-carousel'));
    wireCoachSheet(longText, cur);

    // ---- égalisation hauteur + ajustement du brief (bindings uniques) ----
    const carHome = mount.querySelector('.ap-carousel');
    if (carHome && !carHome.dataset.eqBound) {
      const doEqualizeHome = () => equalizeCarouselHeight(carHome);
      const doFitHome      = () => fitGlanceToDots(mount);

      const schedule = () => {
        requestAnimationFrame(() => { doEqualizeHome(); doFitHome(); });
        setTimeout(() => { doEqualizeHome(); doFitHome(); }, 120);
      };

      schedule();                                // au montage
      window.addEventListener('resize', schedule, { passive:true });

      const roHome = new ResizeObserver(schedule);
      roHome.observe(carHome);

      carHome.dataset.eqBound = '1';            // évite multiples bindings
    }
  }
}

function synthesizeTrend(cur, prev){
  const start = prev > 0 ? prev : cur * 0.9;
  return Array.from({length:6}, (_,i)=> start + (cur - start) * (i/5));
}

function stripHtmlToText(html){
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').replace(/\s+/g,' ').trim();
}
function extractAiOneLiner(cur, fallback){
  try{
    const raw = stripHtmlToText(cur.analysis_text);
    if (!raw) return fallback;
    const cutIdx = raw.toLowerCase().indexOf('suggestion');
    let s = (cutIdx > 0 ? raw.slice(0, cutIdx) : raw).trim();
    const dot = s.indexOf('.');
    if (dot > 40 && dot < 140) s = s.slice(0, dot + 1);
    if (s.length > 140) s = s.slice(0, 137).trimEnd() + '…';
    return s;
  } catch(_) { return fallback; }
}

// Série mini bar chart (S-5 → S0)
function buildMiniSparkline(values, current, prev){
  let v = (values || []).map(n => Number(n)||0).filter(n => n>0);
  if (v.length < 6) {
    const need = 6 - v.length;
    const base = v.length ? v[0] : (current || 44);
    let gen = [];
    let x = base * 0.92;
    for (let i=0;i<need;i++){ gen.unshift(Math.max(1, Number(x.toFixed(1)))); x *= 0.97; }
    v = gen.concat(v);
  } else {
    v = v.slice(-6);
  }

  let deltaPct = -4;
  if (typeof prev === 'number' && prev > 0 && typeof current === 'number') {
    deltaPct = ((current - prev) / prev) * 100;
  }
  const abs = Math.abs(deltaPct);
  let lastFill = '#3F8C6A'; // ok (vert)
  if (abs > EVOL_THRESH.ok && abs <= EVOL_THRESH.warn) lastFill = '#F2A65A'; // warn (orangé)
  else if (abs > EVOL_THRESH.warn) lastFill = '#D64545'; // risk (rouge)

  const max = Math.max(...v, 1);
  const w = 120, h = 56;
  const padX = 10, padY = 6;
  const chartW = w - padX*2;
  const chartH = h - padY*2 - 10;
  const bw = Math.floor(chartW / 6) - 2;
  const baseY = padY + chartH;

  const bars = v.map((val, i) => {
    const x = padX + i * (chartW / 6) + 1;
    const hBar = Math.max(2, Math.round((val / max) * (chartH - 2)));
    const y = baseY - hBar;
    const isLast = (i === v.length - 1);
    const fill = isLast ? lastFill : 'rgba(0,0,0,.18)';
    return `<rect x="${x}" y="${y}" width="${bw}" height="${hBar}" rx="2" fill="${fill}"/>`;
  }).join('');

  return `
    <svg class="ap-spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">
      <line x1="${padX}" y1="${baseY}" x2="${w-padX}" y2="${baseY}" stroke="rgba(0,0,0,.12)" stroke-width="1"/>
      ${bars}
      <text x="${padX-4}" y="${h-2}" font-size="8" text-anchor="start" fill="rgba(0,0,0,.45)">S-5</text>
      <text x="${w-padX-4}" y="${h-2}" font-size="8" text-anchor="end" fill="rgba(0,0,0,.45)">S0</text>
    </svg>
  `;
}

function extractBriefText(html, maxChars = 220){
  if (!html) return "";
  const div = document.createElement('div');
  div.innerHTML = html;
  const text = (div.textContent || '').replace(/\s+/g,' ').trim();
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf(' • '), cut.lastIndexOf('; '));
  return (lastStop > 120 ? cut.slice(0, lastStop+1) : cut.slice(0, maxChars-1) + '…');
}

function equalizeCarouselHeight(car){
  if (!car) return;
  const slides = Array.from(car.querySelectorAll('.ap-track .ap-slide'));
  if (!slides.length) return;
  slides.forEach(s => s.style.minHeight = 'auto');
  const maxH = Math.max(...slides.map(s => s.scrollHeight || s.offsetHeight || 0));
  car.style.setProperty('--ap-slide-h', `${maxH}px`);
  slides.forEach(s => s.style.minHeight = `var(--ap-slide-h)`);
}

// Remplit la phrase IA exactement jusqu'aux points du carrousel
function fitGlanceToDots(mount){
  const car   = mount.querySelector('.ap-carousel');
  if (!car) return;
  const brief = car.querySelector('.ap-slide:first-child .ap-brief');
  const dots  = car.querySelector('.ap-dots');
  if (!brief || !dots) return;

  const br = brief.getBoundingClientRect();
  const dr = dots.getBoundingClientRect();
  const cap = Math.max(0, Math.floor(dr.top - br.top - 12));

  const cs = window.getComputedStyle(brief);
  let lh = parseFloat(cs.lineHeight);
  if (isNaN(lh)) {
    const fs = parseFloat(cs.fontSize) || 12;
    lh = Math.round(fs * 1.3);
  }

  const maxLines = Math.max(1, Math.floor(cap / lh));

  brief.style.display = '-webkit-box';
  brief.style.webkitBoxOrient = 'vertical';
  brief.style.overflow = 'hidden';
  brief.style.setProperty('-webkit-line-clamp', String(maxLines));
  brief.style.setProperty('line-clamp',        String(maxLines));
  brief.style.maxHeight = `${maxLines * lh}px`;
}

function ensureApDotsStyles(){
  if (document.getElementById('ap-dots-style')) return;
  const s = document.createElement('style');
  s.id = 'ap-dots-style';
  s.textContent = `
    .ap-dots{display:flex;justify-content:center;gap:12px;margin-top:8px}
    .ap-dots .dot{position:relative; width:8px; height:8px; border:0; padding:0; border-radius:999px; background:var(--dot-inactive,rgba(0,0,0,.15))}
    .ap-dots .dot .fill{position:absolute; inset:0; width:0%; border-radius:inherit; background:var(--dot-fill,#3F8C6A)}
    .ap-dots .dot.active{ width:36px; height:8px; border-radius:999px; background:var(--dot-track,rgba(63,140,106,.18))}
    .ap-dots .dot.active .fill{ width:calc(var(--p,0)*100%); transition:width .12s linear }
    .ap-dots .dot:focus-visible{outline:2px solid rgba(0,0,0,.25); outline-offset:2px}
  `;
  document.head.appendChild(s);
}

function ensureAnalysisTypo(){
  if (document.getElementById('ap-typography-style')) return;
  const s = document.createElement('style');
  s.id = 'ap-typography-style';
  s.textContent = `
    .ap-hero .ap-brief{
      margin-top:8px;
      font-size:13px;
      line-height:1.25;
      color: var(--text-muted, rgba(0,0,0,.6));
      display:block;
      overflow:hidden;
    }
    .link-cta, .btn.link-cta, .ap-plan-cta{
      background:transparent !important;
      border:none !important;
      box-shadow:none !important;
      padding:0 !important;
      color:#3F8C6A !important;
      font-weight:600;
      cursor:pointer;
    }
    .link-cta:hover{ text-decoration:underline; }
    #sync-btn, #reset-demo{
      background:transparent !important;
      border:none !important;
      box-shadow:none !important;
      color:#3F8C6A !important;
      font-weight:600;
      padding:0 !important;
      cursor:pointer;
    }
  `;
  document.head.appendChild(s);
}

// Carrousel avec remplissage progressif du tiret actif
function initApCarousel(node){
  if (!node) return;
  ensureApDotsStyles();

  const track  = node.querySelector('.ap-track');
  const slides = Array.from(node.querySelectorAll('.ap-slide'));
  const dots   = Array.from(node.querySelectorAll('.ap-dots .dot'));
  let idx = 0;
  let raf = null;
  const dur = Number(node.dataset.auto || 9000);

  function seedForDot(d){
    const w = d.offsetWidth || 36, h = d.offsetHeight || 8;
    return Math.min(0.40, Math.max(0.15, h / w));
  }

  function apply(){
    track.style.transform = `translateX(${-idx*100}%)`;
    dots.forEach((d,i)=>{
      d.classList.toggle('active', i===idx);
      d.setAttribute('aria-selected', i===idx ? 'true' : 'false');
      d.style.removeProperty('--p');
    });
  }

  let t0 = 0;
  let paused = false;

  function loop(now){
    if (paused) { t0 = now; raf = requestAnimationFrame(loop); return; }
    const d = dots[idx];
    if (d){
      const seed = seedForDot(d);
      const p = Math.min(1, seed + ((now - t0) / dur) * (1 - seed));
      d.style.setProperty('--p', p.toFixed(3));
      if (p >= 1){ go(idx + 1); }
    }
    raf = requestAnimationFrame(loop);
  }

  function start(){ cancelAnimationFrame(raf); t0 = performance.now(); paused=false; raf = requestAnimationFrame(loop); }
  function stop(){  cancelAnimationFrame(raf); raf=null; paused=true; }

  function go(i){
    idx = (i + slides.length) % slides.length;
    apply();
    start();
  }

  dots.forEach((d,i)=>{
    d.addEventListener('click', ()=>{
      stop();
      go(i);
      dots[i].style.setProperty('--p', '1');
      setTimeout(()=>{ start(); }, 1200);
    });
  });

  node.addEventListener('pointerdown', stop);
  node.addEventListener('pointerup',   start);
  node.addEventListener('pointerleave',start);

  apply();
  start();
}

// ── Bottom-sheet (coach)
function wireCoachSheet(longText, curWeek){
  ensureCoachSheet();
  const openers = document.querySelectorAll('[data-open-sheet], .ap-slot');
  openers.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const detail = buildCoachDetail(longText, curWeek);
      openCoachSheet(detail);
    }, { once:false });
  });
}
function ensureCoachSheet(){
  if (document.getElementById('coach-sheet')) return;
  const el = document.createElement('div');
  el.innerHTML = `
    <div id="coach-sheet">
      <div class="coach-backdrop" data-close-sheet></div>
      <div class="coach-panel" role="dialog" aria-modal="true" aria-label="Conseil Rockso">
        <div class="coach-grabber" aria-hidden="true"></div>
        <div class="coach-content"></div>
        <div class="coach-actions">
          <button class="btn" data-close-sheet>Fermer</button>
          <button class="btn btn-primary">Ajouter au plan</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(el.firstElementChild);
  document.querySelectorAll('[data-close-sheet]').forEach(x=>{
    x.addEventListener('click', closeCoachSheet);
  });
}

function ensureCoachFrameStyles(){
  if (document.getElementById('coach-frame-style')) return;
  const s = document.createElement('style');
  s.id = 'coach-frame-style';
  s.textContent = `
    :root{
      --coach-w: 430px;
      --coach-top: 56px;
      --coach-bottom: 56px;
    }
    #coach-sheet .coach-backdrop{
      position:fixed; inset:0;
      background:rgba(0,0,0,.35);
      opacity:0; transition:opacity .2s ease;
    }
    #coach-sheet.open .coach-backdrop{ opacity:1; }

    #coach-sheet .coach-panel{
      position:fixed;
      left:50%;
      width:min(var(--coach-w, 430px), 100vw);
      top: calc(var(--coach-top) + env(safe-area-inset-top));
      bottom: calc(var(--coach-bottom) + env(safe-area-inset-bottom));
      transform: translate(-50%, calc(100% + 12px));
      transition: transform .35s cubic-bezier(.2,.8,.2,1);
      background: var(--card, #fff);
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,.2);
      overflow:hidden;
    }
    #coach-sheet.open .coach-panel{ transform: translate(-50%, 0); }
  `;
  document.head.appendChild(s);
}
function computeCoachFrame(){
  const header = document.querySelector('.app-header, header, .topbar, .navbar, #header');
  let topPx = 56;
  if (header){
    const r = header.getBoundingClientRect();
    topPx = Math.max(0, Math.round(r.bottom));
  }
  const tabbar = document.querySelector('.tabbar, .app-tabbar, .bottom-nav, footer.tabbar, nav.tabbar, #tabbar');
  let bottomPx = 56;
  if (tabbar){
    const rr = tabbar.getBoundingClientRect();
    bottomPx = Math.max(0, Math.round(window.innerHeight - rr.top));
  }
  document.documentElement.style.setProperty('--coach-top', `${topPx}px`);
  document.documentElement.style.setProperty('--coach-bottom', `${bottomPx}px`);
}

function openCoachSheet(innerHTML){
  ensureCoachFrameStyles();
  const sheet = document.getElementById('coach-sheet');
  if (!sheet) return;

  const host = document.getElementById('analysis-panel');
  const w = host ? host.getBoundingClientRect().width : Math.min(window.innerWidth, 430);
  document.documentElement.style.setProperty('--coach-w', `${Math.round(w)}px`);

  computeCoachFrame();

  sheet.querySelector('.coach-content').innerHTML = innerHTML;
  sheet.classList.add('open');

  const onRsz = ()=> computeCoachFrame();
  window.addEventListener('resize', onRsz, { passive:true });
  const watcher = new MutationObserver(()=>{
    if (!sheet.classList.contains('open')){
      window.removeEventListener('resize', onRsz);
      watcher.disconnect();
    }
  });
  watcher.observe(sheet, { attributes:true, attributeFilter:['class'] });
}

function closeCoachSheet(){
  document.getElementById('coach-sheet')?.classList.remove('open');
}
function buildCoachDetail(longText, curWeek){
  const km   = Number(curWeek.summary?.total_km || 0);
  const ses  = Number(curWeek.summary?.sessions || (curWeek.activities?.length||0));
  const intK = Number(curWeek.summary?.km_z5t || 0);
  return `
    <div class="coach-head">
      <div class="coach-title">Plan S+1 — ajustements</div>
      <div class="coach-meta muted">${km.toLocaleString('fr-FR',{maximumFractionDigits:1})} km • ${ses} séances • ~${intK.toFixed(1)} km int.</div>
    </div>
    <div class="coach-body">
      ${longText}
    </div>
  `;
}

function trendTag(delta, unit, upIsGoodTxt='↑ mieux'){
  const d = Math.round(delta);
  if (!d) return '—';
  if (d>0) return `↑ +${d} ${unit}`;
  if (d<0) return `↓ ${d} ${unit}`.replace(' -',' -');
  return '—';
}

function buildCoachTips(ctx){
  const { highRisk, volCur, intDelta, sesCur, sleepAvg, hrvAvg } = ctx;

  const incSafe   = Math.min(.08, Math.max(0, .06 - Math.max(0,intDelta)));
  const targetVol = highRisk ? volCur * 0.75 : volCur * (1 + incSafe);

  const volLabel  = highRisk
    ? `Réduis ${Math.round((1 - targetVol/volCur)*100)}%`
    : `+${Math.round((targetVol/volCur - 1)*100)}% max`;

  const intensiteLabel = highRisk ? 'Courte < seuil' : 'Stable (1 pic)';
  const replaceLabel   = '1 sortie → vélo';

  const detailTitle = highRisk ? 'Mercredi (15×400m SL2)' : 'Mercredi (SL2)';
  const detailBody  = highRisk
    ? 'Passe à 10×400m, récup identique. Ajoute +5′ jog easy au retour au calme.'
    : 'Garde 12×400m. Si jambes lourdes : 10×400m et +1 km d’échauffement.';

  return `
    <div class="coach-tiles">
      <div class="tile">
        <div class="t">Volume</div>
        <div class="v">${volLabel}</div>
        <p class="hint">cible ~${targetVol.toFixed(1)} km</p>
      </div>
      <div class="tile">
        <div class="t">Intensité</div>
        <div class="v">${intensiteLabel}</div>
        <p class="hint">${highRisk ? '8×200m léger' : 'Qualité unique'}</p>
      </div>
      <div class="tile">
        <div class="t">Remplacement</div>
        <div class="v">${replaceLabel}</div>
        <p class="hint">60–75′ Z2</p>
      </div>
    </div>

    <details class="coach-details">
      <summary>Plan séance — détails</summary>
      <div class="tip-card ${highRisk ? '' : 'ok'}">
        <div class="t">${detailTitle}</div>
        <div class="b"><span>${highRisk ? '⚠︎' : '✓'}</span> ${detailBody}</div>
      </div>
    </details>

    <div class="micro-hint">Sommeil ~${fmtMinutesToHM(sleepAvg||0)} · HRV ~${Math.round(hrvAvg||0)} ms</div>
  `;
}

// Carrousel minimal (non utilisé ici mais conservé)
function mountAnalysisCarousel(root, slides, { autoMs=8000 } = {}){
  const track = root.querySelector('.ac-track');
  const dots  = root.querySelector('.ac-dots');

  track.innerHTML = slides.map((s,i)=>`
    <article class="ac-slide" data-i="${i}">
      <header class="ac-head">
        <span class="accent">${s.accent||''}</span>
        <h3>${s.title}</h3>
      </header>
      <div class="ac-body">${s.html}</div>
    </article>
  `).join('');

  dots.innerHTML = slides.map((_,i)=>`
    <button class="ac-dot" role="tab" aria-selected="${i===0?'true':'false'}" data-i="${i}">
      <span class="fill"></span>
    </button>
  `).join('');

  const N = slides.length;
  let i = 0, hold=false, raf=null, t0=0, prog=0;

  function apply(){
    track.style.setProperty('--i', i);
    dots.querySelectorAll('.ac-dot').forEach((d,k)=>{
      d.classList.toggle('active', k===i);
      d.style.setProperty('--p', k===i ? prog : 0);
      d.setAttribute('aria-selected', k===i?'true':'false');
    });
  }
  function next(){ i = (i+1)%N; prog = 0; t0 = performance.now(); apply(); }
  function prev(){ i = (i-1+N)%N; prog = 0; t0 = performance.now(); apply(); }

  function tick(now){
    if (hold){ t0 = now - prog*(autoMs); }
    else{
      prog = Math.min(1, (now - t0) / autoMs);
      dots.querySelectorAll('.ac-dot')[i]?.style.setProperty('--p', prog);
      if (prog >= 1){ next(); }
    }
    raf = requestAnimationFrame(tick);
  }

  dots.addEventListener('click', e=>{
    const btn = e.target.closest('.ac-dot');
    if (!btn) return;
    i = Number(btn.dataset.i||0); prog=0; t0=performance.now(); apply();
  });

  let sx=0, dx=0;
  track.addEventListener('pointerdown', e=>{ hold=true; sx=e.clientX; dx=0; track.setPointerCapture(e.pointerId); });
  track.addEventListener('pointermove', e=>{ if(!hold)return; dx=e.clientX - sx; track.style.setProperty('--drag', dx); });
  track.addEventListener('pointerup',   e=>{
    track.releasePointerCapture(e.pointerId);
    track.style.removeProperty('--drag');
    if (Math.abs(dx) > 40){ dx<0 ? next() : prev(); }
    hold=false;
  });

  const io = new IntersectionObserver(([ent])=>{
    const visible = ent?.isIntersecting;
    hold = !visible;
  }, { threshold: .5 });
  io.observe(root);

  document.addEventListener('visibilitychange', ()=>{
    hold = (document.visibilityState !== 'visible');
  });

  apply(); t0 = performance.now(); raf = requestAnimationFrame(tick);
}

/* -------------------------------------------------------------------- *
 * 7) Synchronisation (UI + merge + IA)
 * -------------------------------------------------------------------- */
function setupSyncAnimation(){
  const btn     = document.getElementById('sync-btn') || document.getElementById('btn-sync');
  const bar     = document.getElementById('sync-progress-bar');
  const gProg   = document.getElementById('sync-progress') || document.getElementById('sync-watch-layer');
  const gCheck  = document.getElementById('sync-check');
  const status  = document.getElementById('sync-status');
  const textProgress = document.getElementById('sync-progress-text');
  const iaGear  = document.getElementById('ia-gear');
  const doneEl  = document.getElementById('sync-done');
  const resetBtn= document.getElementById('reset-demo');
  const gPulsar = document.getElementById('sync-pulsar');

  if(!btn || !bar || !gProg || !gCheck) return;

  const persisted = getStore();
  if ((persisted.synced || 0) > 0) {
    gCheck.style.display = 'block';
    gProg.style.display  = 'none';
    if (doneEl){
      doneEl.classList.remove('hidden');
      doneEl.innerHTML = `✅ Rockso a déjà analysé l'entraînement. Consulte l'analyse sur la page <a class="link-cta" href="./index.html">d’Accueil</a> ou <a class="link-cta" href="./training-entrainement.html">Training</a>.`;
    }
    const last = document.querySelector('[data-sync-last]') || document.getElementById('sync-last') || document.querySelector('.sync-row .sync-label + .sync-val');
    if(last){
      const d = new Date();
      last.textContent = `aujourd’hui ${d.toLocaleString('fr-FR', { hour:'2-digit', minute:'2-digit' })}`;
    }
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', ()=>{
      localStorage.removeItem(STORE_KEY);
      ensureBaselineS0();
      window.location.reload();
    });
  }

  const CIRC = 2*Math.PI*60;
  function setProgress(pct){ bar.style.strokeDashoffset = (CIRC*(1-pct/100)).toFixed(1); }

  function startSyncUI(){
    gCheck.style.display = 'none';
    gProg.style.display  = 'block';
    btn.disabled = true;
    bar.style.strokeDasharray = String(CIRC);
    bar.style.strokeDashoffset = String(CIRC);
    setProgress(0);
    textProgress && (textProgress.textContent = '');
    doneEl && (doneEl.classList.add('hidden'), doneEl.innerHTML = '');
    iaGear && iaGear.classList.add('hidden');
    if (gPulsar){ gPulsar.style.display=''; gPulsar.classList.add('animate'); }
  }
  function endSyncUI(){
    gProg.style.display  = 'none';
    gCheck.style.display = 'block';
    status && (status.textContent = "Synchronisation terminée");
    if (gPulsar){ gPulsar.classList.remove('animate'); gPulsar.style.display='none'; }
    const last = document.querySelector('[data-sync-last]') || document.getElementById('sync-last') || document.querySelector('.sync-row .sync-label + .sync-val');
    if(last){
      const d = new Date();
      last.textContent = `aujourd’hui ${d.toLocaleString('fr-FR', { hour:'2-digit', minute:'2-digit' })}`;
    }
    btn.disabled = false;
  }
  function animTo(targetPct, dur=800){
    const t0 = performance.now();
    const start = parseFloat(bar.style.strokeDashoffset || (CIRC));
    const currentPct = 100 - (start/CIRC*100);
    const delta = targetPct - currentPct;
    return new Promise(res=>{
      function tick(now){
        const k = Math.min(1,(now-t0)/dur);
        const pct = currentPct + delta*k;
        setProgress(pct);
        if (k<1) requestAnimationFrame(tick); else res();
      }
      requestAnimationFrame(tick);
    });
  }
  async function runDemoUpload(payload){
    const N = (payload.activities||[]).length;
    status && (status.textContent = "Connexion…");
    await animTo(10, 600);
    status && (status.textContent = "Préparation de la synchronisation…");
    await animTo(20, 700);
    for (let i=0;i<N;i++){
      textProgress && (textProgress.textContent = `Synchronisation des activités ${i+1}/${N}…`);
      await animTo(20 + ((i+1)/N)*75, 600);
      await new Promise(r=>setTimeout(r, 120));
    }
    await animTo(98, 500);
  }

  function mergePayloadIntoStore(payload){
    const st = getStore();
    st.weeks = (st.weeks||[]).concat(payload);
    st.activities = (st.activities||[]).concat(payload.activities||[]);
    if (payload.daily && payload.daily.length) st.daily = payload.daily.slice();
    st.lastActivity = st.activities[st.activities.length-1];
    st.lastWeekAnalysis = { text: payload.analysis_text, ml: payload.ml };
    st.synced = (st.synced||0) + 1;
    saveStore(st);
  }

  async function startSync(){
    startSyncUI();
    try {
      const st = getStore();
      const idx = st.synced || 0;
      if (idx >= 2) {
        status && (status.textContent = "Aucune nouvelle donnée démo à synchroniser.");
        textProgress && (textProgress.textContent = "Démo : toutes les données ont déjà été synchronisées.");
        await animTo(100, 400);
        endSyncUI();
        return;
      }

      const payload = await loadWeek(idx);
      await runDemoUpload(payload);
      mergePayloadIntoStore(payload);
      await animTo(100, 400);
      endSyncUI();

      // IA (2 s)
      iaGear && iaGear.classList.remove('hidden');
      status && (status.textContent = "Analyse IA en cours…");
      await new Promise(r=>setTimeout(r, 2000));
      iaGear && iaGear.classList.add('hidden');

      // Message final
      if (doneEl){
        doneEl.classList.remove('hidden');
        doneEl.innerHTML = `✅ Rockso a analysé l'entraînement. Consulte l'analyse sur la page <a class="link-cta" href="./index.html">d’Accueil</a> ou <a class="link-cta" href="./training-entrainement.html">Training</a>.`;
      }

    } catch(e){
      console.error(e);
      status && (status.textContent = "Erreur de synchronisation.");
      textProgress && (textProgress.textContent = "La démo a un fallback intégré, recharge la page si le problème persiste.");
      if (gPulsar){ gPulsar.classList.remove('animate'); gPulsar.style.display='none'; }
      btn.disabled = false;
    }
  }

  gCheck.style.display = 'block';
  gProg.style.display  = 'none';
  if (gPulsar){ gPulsar.classList.remove('animate'); gPulsar.style.display='none'; }

  btn.addEventListener('click', startSync);
}

/* -------------------------------------------------------------------- *
 * PROFILE — 1 stat fun + 1 article court (seulement pour la semaine courante)
 * -------------------------------------------------------------------- */

const ROCKSO_SOURCES = {
  kipchogeWeek: {
    label: "Kipchoge ~130 miles/sem (~209 km)",
    url: "https://www.gq.com/story/inside-eliud-kipchoge-kenya-training-compound"
  },
  chepngetichWR: {
    label: "Ruth Chepngetich — 2:09:56 (Chicago 2024)",
    url: "https://www.theguardian.com/sport/2024/oct/13/chicago-marathon-2024-usa-womens-world-record"
  },
  polarized: {
    label: "Polarized vs autres répartitions (Stöggl & Sperlich, 2015)",
    url: "https://www.frontiersin.org/articles/10.3389/fphys.2015.00295/full"
  },
  hrvMeta: {
    label: "Entraînement guidé par la HRV — synthèse 2020",
    url: "https://www.mdpi.com/2076-3417/10/21/7791"
  },
  gabbett: {
    label: "Training-injury paradox (Gabbett, 2016)",
    url: "https://bjsm.bmj.com/content/50/5/273"
  }
};

function ensureProfileInspoStyles(){
  if (document.getElementById('profile-inspo-style')) return;
  const s = document.createElement('style');
  s.id = 'profile-inspo-style';
  s.textContent = `
    .inspo-card{padding:12px 14px;border-radius:12px;border:1px solid var(--line,#e6e6e6);background:#fff}
    .inspo-row{display:grid;gap:12px}
    .inspo-item .k{font-size:12px;color:rgba(0,0,0,.55);margin-bottom:2px}
    .inspo-item .v{font-size:14px;line-height:1.35}
    .inspo-item .v .link-cta{font-weight:600;color:#3F8C6A;cursor:pointer;background:none;border:0;padding:0;margin-left:6px}
    .inspo-item .v .link-cta:hover{text-decoration:underline}
  `;
  document.head.appendChild(s);
}
function pctStr(x){ const s = Math.round(x); return `${s>0?'+':''}${s}%`; }
function kmStr(x){ return `${Number(x||0).toLocaleString('fr-FR',{maximumFractionDigits:1})} km`; }
function safe(a){ return a==null?0:Number(a); }

function pickWeeklyInspo(curWeek, prevWeek){
  const km     = safe(curWeek?.summary?.total_km);
  const kmInt  = safe(curWeek?.summary?.km_z5t);
  const share  = km>0 ? kmInt/km : 0;
  const prevKm = safe(prevWeek?.summary?.total_km);
  const deltaV = prevKm>0 ? ((km - prevKm)/prevKm)*100 : -4;
  const spike  = safe(curWeek?.summary?.load_spike_rel_w1_w2)|| (prevKm>0? km/prevKm : 1);

  const isRisk = (spike >= 1.30) || (share >= 0.18);
  const isWarn = !isRisk && (Math.abs(deltaV) > 15 || share >= 0.12);

  let fun, paper;

  if (isRisk){
    fun = {
      title: "Ouh là, charge relevée",
      line: `Tu as bouclé ${kmStr(km)} cette semaine (∆ ${pctStr(deltaV)}) — belle énergie, mais garde un œil sur la récupération.`,
      detail: `
        <p><strong>Pourquoi on te le dit :</strong> les hausses rapides de charge sont associées à davantage de pépins chez les athlètes.</p>
        <p>Astuce pratique : réduis le volume de 20–30% la semaine suivante, garde une seule séance “qualité” courte et vise ≥2 nuits de ≥7h30.</p>
      `
    };
    paper = {
      title: "Charge & risque de blessure",
      teaser: `Des hausses rapides de charge sont liées à plus de blessures — mieux vaut “intelligent ET dur”.`,
      detail: `
        <p>Résumé express : le paradoxe “<em>training-injury prevention</em>” montre qu’un <strong>travail soutenu mais progressif</strong> protège mieux qu’un “yoyo” de charge.</p>
        <p><a href="${ROCKSO_SOURCES.gabbett.url}" target="_blank" rel="noopener">Gabbett 2016 (Br J Sports Med)</a></p>
      `
    };
  } else if (isWarn){
    fun = {
      title: "Tu te rapproches d’un mix “pro”",
      line: `Part d’intensité ≈ ${Math.round(share*100)}% — on se rapproche du fameux 80/20 (sans dépasser !).`,
      detail: `
        <p>Garde 1 séance de qualité + 1 long facile. Tu capitalises sans brûler d’étapes.</p>
        <p><a href="${ROCKSO_SOURCES.polarized.url}" target="_blank" rel="noopener">Voir l’évidence “polarized”</a></p>
      `
    };
    paper = {
      title: "Répartition d’intensité (80/20)",
      teaser: `Chez les élites, beaucoup de volume facile et un petit bloc d’intensité bien placé.`,
      detail: `
        <p>Synthèse : les études comparent les répartitions (seuil, polarisée, etc.). La <strong>polarisée</strong> donne souvent de meilleurs gains sur le long terme pour les sports d’endurance.</p>
        <p><a href="${ROCKSO_SOURCES.polarized.url}" target="_blank" rel="noopener">Stöggl & Sperlich 2015 (Frontiers in Physiology)</a></p>
      `
    };
  } else {
    const refKm = 209;
    const part  = Math.round((km/refKm)*100);
    fun = {
      title: "Comparo fun",
      line: `${kmStr(km)} cette semaine — soit ~${part}% d’une semaine type d’<strong>Eliud Kipchoge</strong>. Solide 💪`,
      detail: `
        <p>Repère : les semaines “camp” d’Eliud tournent ~130 miles (≈209 km).</p>
        <p><a href="${ROCKSO_SOURCES.kipchogeWeek.url}" target="_blank" rel="noopener">Source (GQ – inside training camp)</a></p>
      `
    };
    paper = {
      title: "HRV pour piloter l’entraînement",
      teaser: `Ta HRV & ton sommeil sont stables : la littérature montre l’intérêt d’<strong>ajuster la charge</strong> avec ces marqueurs.`,
      detail: `
        <p>Idée : garder la semaine “verte” quand la HRV est bonne et lever un peu le pied quand elle chute.</p>
        <p><a href="${ROCKSO_SOURCES.hrvMeta.url}" target="_blank" rel="noopener">Revue 2020 (HRV-guided training)</a></p>
      `
    };
  }

  return { fun, paper };
}

function renderProfileInspoLatest(){
  const host = document.querySelector('.section.future');
  if (!host) return;
  ensureProfileInspoStyles();

  const st = getStore();
  const weeks = st.weeks || [];
  const cur = weeks[weeks.length-1];
  const prev = weeks[weeks.length-2];
  if (!cur){ return; }

  const { fun, paper } = pickWeeklyInspo(cur, prev);

  host.innerHTML = `
    <h2 class="section-title">Inspiration de la semaine</h2>
    <div class="inspo-card">
      <div class="inspo-row">
        <div class="inspo-item">
          <div class="k">Stat marrante</div>
          <div class="v">${fun.line}<button class="link-cta" data-inspo="fun">En savoir plus</button></div>
        </div>
        <div class="inspo-item">
          <div class="k">Lecture rapide</div>
          <div class="v">${paper.teaser}<button class="link-cta" data-inspo="paper">Résumé</button></div>
        </div>
      </div>
    </div>
  `;

  // >>> Assure l'existence du bottom-sheet avant d'ouvrir
  ensureCoachSheet();

  host.querySelector('[data-inspo="fun"]')?.addEventListener('click', ()=>{
    openCoachSheet(`
      <div class="coach-head"><div class="coach-title">${fun.title}</div></div>
      <div class="coach-body">${fun.detail}</div>
    `);
  });
  host.querySelector('[data-inspo="paper"]')?.addEventListener('click', ()=>{
    openCoachSheet(`
      <div class="coach-head"><div class="coach-title">${paper.title}</div></div>
      <div class="coach-body">${paper.detail}</div>
    `);
  });
}

/* -------------------------------------------------------------------- *
 * 8) Boot + écoute des mises à jour
 * -------------------------------------------------------------------- */
function bootHydrations(){
  hydrateHome();
  hydrateActivity();
  hydrateActivities();
  hydrateProfile();
  hydrateTrainingEntr();
  hydrateTrainingQuotidien();
  hydrateTrainingRecuperation();
  hydrateTrainingTendance();
  renderAnalysisPanelFromStore();
  renderProfileInspoLatest();
}

document.addEventListener('DOMContentLoaded', ()=>{
  ensureBaselineS0();
  ensureAnalysisTypo();
  bootHydrations();
  setupSyncAnimation();

  window.addEventListener('rockso:storeUpdated', bootHydrations);

  if (document.body.dataset.page === 'training') {
    const t = document.getElementById('tab-training');
    t && t.classList.add('active');
  }
});

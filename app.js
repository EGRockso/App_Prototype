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
  // analysis_text: "Semaine de référence (44 km) régulière : 4 séances, progression contrôlée, sommeil ~7h19, HRV ~74 ms. Charge tolérée et intensité mesurée → risque faible."
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
//  • Home: 2-slide carousel (GLANCE first) + bottom-sheet CTA
//  • Training/Entraînement: stacked sections (no carousel) + same sheet
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
  const avg = (arr, k) => (arr.length ? arr.reduce((a,x)=>a+(x[k]||0),0)/arr.length : 0);
  const slpMin = avg(days,'sleep_min'); // minutes
  const hrvMs  = avg(days,'hrv_ms');
  const rpe    = avg(days,'rpe');

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

  // long form (coach sheet): use your existing analysis text if present, otherwise synthesize
  const longText = (cur.analysis_text?.trim())
    ? cur.analysis_text
    : (tone==='risk'
       ? "Semaine en surcharge : volume et/ou intensité élevés. Réduis le volume de 20–30 %, conserve une seule séance technique courte et dors ≥7h30 2 nuits."
       : "Semaine maîtrisée : progression dans la zone sûre. Conserve 1 séance de qualité, stabilise le volume et ajoute du vélo Z2 si jambes lourdes.");
      
      const iaBrief = extractBriefText(cur.analysis_text || '', 220);
      // build GLANCE card — phrase IA (one-liner) pour combler l'espace
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
          <p class="ap-brief muted">${iaBrief}</p>
        </div>
      `;

    // --- REASON (chips courts + sparkline optionnelle)
    const sleepHM = hm(slpMin).replace(' ', '');       // "7h21"
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
      <button class="btn btn-primary ap-plan-cta" data-open-sheet>Appliquer au plan</button>
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
        <div class="ap-dots"><button class="dot active"></button><button class="dot"></button></div>
      </div>
    `;

    initApCarousel(mount.querySelector('.ap-carousel'));
    wireCoachSheet(longText, cur);

    // ---- égalisation hauteur + ajustement du brief (sans redéclarer) ----
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
  // 6 points du S-5 à S0, progression lissée vers la valeur courante
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
    // Couper avant la section "Suggestion…" si présente
    const cutIdx = raw.toLowerCase().indexOf('suggestion');
    let s = (cutIdx > 0 ? raw.slice(0, cutIdx) : raw).trim();

    // Prendre la 1ère phrase si elle est raisonnable, sinon couper à ~140c
    const dot = s.indexOf('.');
    if (dot > 40 && dot < 140) s = s.slice(0, dot + 1);
    if (s.length > 140) s = s.slice(0, 137).trimEnd() + '…';

    return s;
  } catch(_) { return fallback; }
}

function buildMiniSparkline(values, current, prev){
  // Série 6 semaines : vraie data si dispo, sinon synthèse cohérente
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

  // Delta volume courant vs semaine précédente (pour la couleur)
  let deltaPct = -4;
  if (typeof prev === 'number' && prev > 0 && typeof current === 'number') {
    deltaPct = ((current - prev) / prev) * 100;
  }
  const abs = Math.abs(deltaPct);
  let lastFill = '#3F8C6A'; // ok (vert)
  if (abs > EVOL_THRESH.ok && abs <= EVOL_THRESH.warn) lastFill = '#F2A65A'; // warn (orangé)
  else if (abs > EVOL_THRESH.warn) lastFill = '#D64545'; // risk (rouge)

  // Dimensions compactes
  const max = Math.max(...v, 1);
  const w = 120, h = 56;
  const padX = 10, padY = 6;
  const chartW = w - padX*2;
  const chartH = h - padY*2 - 10;
  const bw = Math.floor(chartW / 6) - 2;
  const baseY = padY + chartH;

  // Barres (S-5→S0), S0 = dernière, couleur selon delta volume
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

// Récupère un bref résumé texte depuis l'analyse HTML longue
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

// Donne la même hauteur à tous les slides du carrousel (= hauteur du plus grand)
function equalizeCarouselHeight(car){
  if (!car) return;
  const slides = Array.from(car.querySelectorAll('.ap-track .ap-slide'));
  if (!slides.length) return;
  slides.forEach(s => s.style.minHeight = 'auto');                 // reset pour mesurer
  const maxH = Math.max(...slides.map(s => s.scrollHeight || s.offsetHeight || 0));
  car.style.setProperty('--ap-slide-h', `${maxH}px`);
  slides.forEach(s => s.style.minHeight = `var(--ap-slide-h)`);    // verrouille la hauteur
}
// Remplit la phrase IA exactement jusqu'aux points du carrousel (sans dépasser)
function fitGlanceToDots(mount){
  const car   = mount.querySelector('.ap-carousel');
  if (!car) return;
  const brief = car.querySelector('.ap-slide:first-child .ap-brief');
  const dots  = car.querySelector('.ap-dots');
  if (!brief || !dots) return;

  // Espace disponible entre le TOP du brief et le TOP des points (petite marge de sécu)
  const br = brief.getBoundingClientRect();
  const dr = dots.getBoundingClientRect();
  const cap = Math.max(0, Math.floor(dr.top - br.top - 12)); // 12 px de marge

  // Line-height réel (fallback si 'normal')
  const cs = window.getComputedStyle(brief);
  let lh = parseFloat(cs.lineHeight);
  if (isNaN(lh)) {
    const fs = parseFloat(cs.fontSize) || 12;
    lh = Math.round(fs * 1.3);
  }

  // Nombre de lignes qui tiennent exactement
  const maxLines = Math.max(1, Math.floor(cap / lh));

  // Clamp multi-ligne standard + webkit (et coupe stricte en max-height)
  brief.style.display = '-webkit-box';
  brief.style.webkitBoxOrient = 'vertical';
  brief.style.overflow = 'hidden';
  brief.style.setProperty('-webkit-line-clamp', String(maxLines));
  brief.style.setProperty('line-clamp',        String(maxLines));
  brief.style.maxHeight = `${maxLines * lh}px`;
}

// ── minimal carousel (auto-advance + dots; pauses on interaction)
function initApCarousel(node){
  if (!node) return;
  const track = node.querySelector('.ap-track');
  const slides = Array.from(node.querySelectorAll('.ap-slide'));
  const dots = Array.from(node.querySelectorAll('.ap-dots .dot'));
  let idx = 0, timer = null, dur = Number(node.dataset.auto||9000);

  function go(i){
    idx = (i+slides.length)%slides.length;
    track.style.transform = `translateX(${-idx*100}%)`;
    dots.forEach((d,j)=> d.classList.toggle('active', j===idx));
  }
  function start(){ stop(); timer = setInterval(()=>go(idx+1), dur); }
  function stop(){ if (timer){ clearInterval(timer); timer=null; } }

  dots.forEach((d,i)=> d.addEventListener('click', ()=>{ stop(); go(i); start(); }));
  node.addEventListener('pointerdown', stop);
  node.addEventListener('pointerup',   start);
  node.addEventListener('pointerleave',start);
  go(0); start();
}

// ── Bottom-sheet (coach)
function wireCoachSheet(longText, curWeek){
  ensureCoachSheet(); // injects if absent
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
        <div class="coach-content">
          <!-- filled dynamically -->
        </div>
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
function openCoachSheet(innerHTML){
  const sheet = document.getElementById('coach-sheet');
  if (!sheet) return;

  // largeur = largeur du conteneur de l'app (ici le panel d'analyse)
  const host = document.getElementById('analysis-panel');
  const w = host ? host.getBoundingClientRect().width : Math.min(window.innerWidth, 430);
  document.documentElement.style.setProperty('--coach-w', `${Math.round(w)}px`);

  sheet.querySelector('.coach-content').innerHTML = innerHTML;
  sheet.classList.add('open');
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

  // Cible de volume compacte (réduc si risque, +light sinon)
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

// Carrousel minimal (auto + dots progress + swipe + reprise quand visible)
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

  // interactions
  dots.addEventListener('click', e=>{
    const btn = e.target.closest('.ac-dot');
    if (!btn) return;
    i = Number(btn.dataset.i||0); prog=0; t0=performance.now(); apply();
  });

  // swipe
  let sx=0, dx=0;
  track.addEventListener('pointerdown', e=>{ hold=true; sx=e.clientX; dx=0; track.setPointerCapture(e.pointerId); });
  track.addEventListener('pointermove', e=>{ if(!hold)return; dx=e.clientX - sx; track.style.setProperty('--drag', dx); });
  track.addEventListener('pointerup',   e=>{
    track.releasePointerCapture(e.pointerId);
    track.style.removeProperty('--drag');
    if (Math.abs(dx) > 40){ dx<0 ? next() : prev(); }
    hold=false;
  });

  // pause si hors écran / onglet
  const io = new IntersectionObserver(([ent])=>{
    const visible = ent?.isIntersecting;
    hold = !visible;
  }, { threshold: .5 });
  io.observe(root);

  document.addEventListener('visibilitychange', ()=>{
    hold = (document.visibilityState !== 'visible');
  });

  // start
  apply(); t0 = performance.now(); raf = requestAnimationFrame(tick);
}

function hydrateActivities(){
  const list = $('#activity-list');
  if (!list) return;
  const live = getLiveState();
  const items = (live.activities||[]).slice().sort((a,b)=> new Date(b.dateISO)-new Date(a.dateISO));
  list.innerHTML = items.map(a=>(
    `<a class="row" href="./activity.html?id=${a.id}">
      <div class="left">
        <span class="icon">${Icons.Course}</span>
        <div>
          <div><strong>${a.type}</strong></div>
          <div class="meta">${fmtDate(a.dateISO)}</div>
        </div>
      </div>
      <div class="right">
        <div style="text-align:right"><strong>${a.distanceKm ? a.distanceKm.toFixed(1)+' km' : ''}</strong><div class="meta">${fmtDurSec(a.durationSec||0)}</div></div>
      </div>
    </a>`
  )).join('');
}

function hydrateActivity(){
  if (!$('#type')) return;
  const id = new URLSearchParams(location.search).get('id');
  const live = getLiveState();
  const a = (live.activities||[]).find(x=>x.id===id) || live.activities?.[live.activities.length-1];
  if (!a) return;
  $('#type').textContent = a.type;
  $('#date').textContent = fmtDate(a.dateISO);
  $('#distance').textContent = a.distanceKm ? a.distanceKm.toFixed(2)+' km' : '—';
  $('#duration').textContent = fmtDurSec(a.durationSec||0);
  $('#pace').textContent = fmtPace(a.paceSecPerKm);
  $('#hr').textContent = a.hrAvg ? a.hrAvg+' bpm' : '—';
  $('#elev') && ($('#elev').textContent = a.elevPos ? a.elevPos+' m' : '—');
  $('#cal') && ($('#cal').textContent = a.calories ? a.calories+' kcal' : '—');
}

function hydrateTrainingEntr(){
  const dEl = $('#trg-dist-7'); const tEl = $('#trg-dur-7'); const sEl = $('#trg-sessions');
  if (!dEl && !tEl && !sEl) return;
  const live = getLiveState();
  if (dEl) dEl.textContent = formatKm(live.weekly.load);
  if (tEl) tEl.textContent = fmtMinutesToHM(live.weekly.durationMin);
  if (sEl) sEl.textContent = String(live.weekly.sessions);
}

/* --------- Quotidien (IDs alignés avec ton HTML) --------- */
function hydrateTrainingQuotidien(){
  // Ancre : on teste un ID qui existe sur ta page
  const anchor = $('#dq-steps') || $('#qd-daily-list');
  if (!anchor) return;

  const live = getLiveState();
  const days = live.daily || [];
  const sortedDesc = days.slice().sort((a,b)=> new Date(b.date) - new Date(a.date));
  const D = sortedDesc[0] || {};

  // Cartes
  $('#dq-steps')     && ($('#dq-steps').textContent     = (D.steps||0).toLocaleString('fr-FR'));
  $('#dq-cal')       && ($('#dq-cal').textContent       = `${D.active_cal||0} kcal`);
  $('#dq-resthr')    && ($('#dq-resthr').textContent    = D.rhr_bpm ? `${D.rhr_bpm} bpm` : '—');
  $('#dq-resp')      && ($('#dq-resp').textContent      = D.resp_rpm ? `${D.resp_rpm} rpm` : '—'); // rpm = respirations/min
  $('#dq-spo2')      && ($('#dq-spo2').textContent      = D.spo2_pct ? `${D.spo2_pct}%` : '—');
  $('#dq-active-min')&& ($('#dq-active-min').textContent= D.act_min ? `${D.act_min} min` : '—');

  // Récap récup (cartes hautes)
  $('#dq-sleep-last')&& ($('#dq-sleep-last').textContent= D.sleep_min ? fmtMinutesToHM(D.sleep_min) : '—');
  $('#dq-slp-avg')   && ($('#dq-slp-avg').textContent   = fmtMinutesToHM(avg(days,'sleep_min')));
  $('#dq-hrv-avg')   && ($('#dq-hrv-avg').textContent   = `${Math.round(avg(days,'hrv_ms'))} ms`);
  $('#dq-rpe-avg')   && ($('#dq-rpe-avg').textContent   = `${avg(days,'rpe').toFixed(1)}`);
  $('#dq-rhr-avg')   && ($('#dq-rhr-avg').textContent   = `${Math.round(avg(days,'rhr_bpm'))} bpm`);

  // Statut simple (OK / Attention)
  const sleepAvgMin = avg(days,'sleep_min');
  const hrvAvg      = avg(days,'hrv_ms');
  const rpeAvg      = avg(days,'rpe');
  const ok = (sleepAvgMin >= 7*60) && (hrvAvg >= 70) && (rpeAvg <= 5);
  $('#qd-status-text') && ($('#qd-status-text').textContent = ok ? 'OK' : 'Attention');

  // Journal quotidien (du + récent au + ancien)
  const list = $('#qd-daily-list');
  if (list){
    list.innerHTML = sortedDesc.map(d => `
      <div class="list row" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:8px 0;border-bottom:1px solid var(--line)">
        <div><div class="meta">${new Date(d.date).toLocaleDateString('fr-FR',{ weekday:'short', day:'2-digit', month:'short'})}</div><strong>${(d.steps||0).toLocaleString('fr-FR')} pas</strong></div>
        <div><div class="meta">Sommeil</div><strong>${fmtMinutesToHM(d.sleep_min||0)}</strong></div>
        <div><div class="meta">HRV</div><strong>${d.hrv_ms||'—'} ms</strong></div>
      </div>
    `).join('');
  }

  // Récap “bas de page” (sum-sleep / sum-hrv / sum-rpe / statut)
  $('#sum-sleep')      && ($('#sum-sleep').textContent   = fmtMinutesToHM(sleepAvgMin));
  $('#sum-hrv')        && ($('#sum-hrv').textContent     = `${Math.round(hrvAvg)} ms`);
  $('#sum-rpe')        && ($('#sum-rpe').textContent     = `${rpeAvg.toFixed(1)}`);
  const dot = $('#sum-status-dot'), stx = $('#sum-status-text'), note = $('#sum-note');
  if (dot && stx && note) {
    dot.className = 'dot ' + (ok ? 'dot--ok' : 'dot--warn');
    stx.textContent = ok ? 'OK' : 'Attention';
    note.textContent = ok
      ? "Sommeil et variabilité cardiaque dans la cible sur 7 jours. Poursuivre la progression contrôlée."
      : "Signes de charge/fatigue : surveiller le sommeil et réduire légèrement l’intensité si besoin.";
  }
}

function hydrateProfile(){
  const pLoad = $('#p-load');
  if (!pLoad) return;

  const live = getLiveState();
  pLoad.textContent = formatKm(live.weekly.load);

  const durMin = typeof live.weekly.durationMin === 'number'
    ? live.weekly.durationMin
    : (typeof live.weekly.hours === 'number' ? live.weekly.hours * 60 : 0);
  const hEl = $('#p-hours');
  if (hEl) hEl.textContent = fmtMinutesToHM(durMin);

  const restEl = $('#p-rest');
  if (restEl) {
    const st = getStore();
    const weeks = st.weeks || [];
    const lastW = weeks[weeks.length - 1];
    restEl.textContent = (lastW?.ml?.predicted_label ? 'Attention' : 'OK');
  }
}


/* --------- Récupération --------- */
function hydrateTrainingRecuperation(){
  const root = $('#rec-sleep-last') || $('#rec-tsb-text') || $('#rec-rpe-7d-text');
  if (!root) return;
  const st = getStore();
  const live = getLiveState();
  const days = live.daily || [];
  const sortedDesc = days.slice().sort((a,b)=> new Date(b.date)-new Date(a.date));
  const D = sortedDesc[0] || {};

  // Sommeil
  $('#rec-sleep-last') && ($('#rec-sleep-last').textContent = D.sleep_min ? fmtMinutesToHM(D.sleep_min) : '—');
  $('#rec-sleep-avg')  && ($('#rec-sleep-avg').textContent  = fmtMinutesToHM(avg(days,'sleep_min')));

  // RPE 7j
  $('#rec-rpe-7d-text') && ($('#rec-rpe-7d-text').textContent = avg(days,'rpe').toFixed(1));

  // TSB simple : CTL(τ=7) - ATL(τ=2) calculés sur les semaines connues à partir du volume (proxy TSS)
  const vols = (st.weeks||[]).map(w=> w.summary?.total_km || 0);
  function ema(arr, alpha){
    let v = arr[0] || 0;
    for (let i=1;i<arr.length;i++) v = alpha*arr[i] + (1-alpha)*v;
    return v;
  }
  const ctl = ema(vols, 1/7);
  const atl = ema(vols, 1/2);
  const tsb = ctl - atl;
  const tsbTxt = `${tsb>=0?'+':''}${Math.round(tsb)}`;
  $('#rec-tsb-text') && ($('#rec-tsb-text').textContent = tsbTxt);
}

/* --------- Tendance (VO2 & CTL/ATL) --------- */
function miniLine(containerId, seriesList, opts={}){
  const el = document.getElementById(containerId);
  if (!el) return;
  const w = opts.w||320, h = opts.h||120, pad = 16;
  // seriesList: [{data:[...], color:'#...', label:'...'}, ...]
  const all = seriesList.flatMap(s=>s.data);
  const min = Math.min(...all), max = Math.max(...all);
  const sx = (i, N)=> pad + (w-2*pad) * (N<=1 ? 0.5 : (i/(N-1)));
  const sy = (v)=> pad + (h-2*pad) * (1 - ( (v-min)/(max-min || 1) ));
  const svgs = seriesList.map(s=>{
    const pts = s.data.map((v,i)=> `${sx(i,s.data.length)},${sy(v)}`).join(' ');
    return `<polyline points="${pts}" fill="none" stroke="${s.color||'#2E6E55'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join('');
  el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${svgs}</svg>`;
}

function hydrateTrainingTendance(){
  const needle = $('#trend-needle') || $('#trend-vo2') || $('#trend-ctl-atl');
  if (!needle) return;

  const st = getStore();
  const weeks = st.weeks || [];
  // Proxy VO2max relatif (stable S0→S1, léger retrait S2)
  // On part sur une base 52 → 52.5 → 52.2
  const vo2 = [51.8, 52.0, 52.2, 52.1, 52.5, 52.2]; // 6 semaines fictives mais cohérentes
  miniLine('trend-vo2', [{ data: vo2, color:'#3F8C6A' }]);

  // CTL/ATL depuis volumes des semaines dispo + 3 semaines “historique” stables
  const volsKnown = weeks.map(w=> w.summary?.total_km || 0);
  const seed = volsKnown.length ? volsKnown[0] : 44;
  const vols = [seed*0.95, seed*0.98, seed].concat(volsKnown); // 3 semaines avant S0, puis S0..Sn
  function emaSeries(arr, alpha){
    const out=[arr[0]||0]; for(let i=1;i<arr.length;i++){ out.push(alpha*arr[i] + (1-alpha)*out[i-1]); } return out;
  }
  const CTL = emaSeries(vols, 1/7);
  const ATL = emaSeries(vols, 1/2);
  miniLine('trend-ctl-atl', [
    { data: CTL.slice(-6), color:'#2E6E55' },
    { data: ATL.slice(-6), color:'#F2A65A' }
  ]);

  // Aiguille “modif condition physique” : delta CTL 3 dernières vs 3 précédentes
  const last3 = CTL.slice(-3).reduce((a,b)=>a+b,0)/3;
  const prev3 = CTL.slice(-6,-3).reduce((a,b)=>a+b,0)/3;
  // scale -10..+10 → 0..100 %
  const delta = clamp(last3 - prev3, -10, 10);
  const pos = Math.round((delta + 10) * 5); // 0..100
  const n = $('#trend-needle'); if (n) n.style.left = `${pos}%`;
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

  // Reflète l'état si déjà synchronisé
  const persisted = getStore();
  if ((persisted.synced || 0) > 0) {
    gCheck.style.display = 'block';
    gProg.style.display  = 'none';
    if (doneEl){
      doneEl.classList.remove('hidden');
      doneEl.innerHTML = `✅ Rockso a déjà analysé l'entraînement. Consulte l'analyse sur <a href="./index.html">Index</a> ou <a href="./training-entrainement.html">Training</a>.`;
    }
    const last = document.querySelector('[data-sync-last]') || document.getElementById('sync-last') || document.querySelector('.sync-row .sync-label + .sync-val');
    if(last){
      const d = new Date();
      last.textContent = `aujourd’hui ${d.toLocaleString('fr-FR', { hour:'2-digit', minute:'2-digit' })}`;
    }
  }

  // Reset démo → réinjecte S0 et recharge la page (retour état initial visible)
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
      doneEl && (doneEl.classList.remove('hidden'),
                 doneEl.innerHTML = `✅ Rockso a analysé l'entraînement. Consulte l'analyse sur la page <a href="./index.html">Index</a> ou <a href="./training-entrainement.html">Training</a>.`);
    } catch(e){
      console.error(e);
      status && (status.textContent = "Erreur de synchronisation.");
      textProgress && (textProgress.textContent = "La démo a un fallback intégré, recharge la page si le problème persiste.");
      if (gPulsar){ gPulsar.classList.remove('animate'); gPulsar.style.display='none'; }
      btn.disabled = false;
    }
  }

  // État initial
  gCheck.style.display = 'block';
  gProg.style.display  = 'none';
  if (gPulsar){ gPulsar.classList.remove('animate'); gPulsar.style.display='none'; }

  btn.addEventListener('click', startSync);
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
}

document.addEventListener('DOMContentLoaded', ()=>{
  ensureBaselineS0();     // injecte S0 si nécessaire
  bootHydrations();
  setupSyncAnimation();

  window.addEventListener('rockso:storeUpdated', bootHydrations);

  if (document.body.dataset.page === 'training') {
    const t = document.getElementById('tab-training');
    t && t.classList.add('active');
  }
});

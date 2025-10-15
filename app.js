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
  analysis_text: "Semaine de référence (44 km) régulière : 4 séances, progression contrôlée, sommeil ~7h19, HRV ~74 ms. Charge tolérée et intensité mesurée → risque faible."
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

function renderAnalysisPanelFromStore(){
  const panel = document.getElementById("analysis-panel");
  if (!panel) return;
  const st = getStore();
  const lastW = (st.weeks||[])[(st.weeks||[]).length-1];
  if (!lastW){
    panel.innerHTML = `<div class="card"><div class="card-body"><p>Pas d'analyse disponible.</p></div></div>`;
    return;
  }
  const badge = lastW.ml?.predicted_label
    ? `<span class="badge badge-red">Risque de blessure</span>`
    : `<span class="badge badge-green">Risque faible</span>`;
  panel.innerHTML = `
    <div class="card">
      <div class="card-title">Analyse de la semaine</div>
      <div class="card-body">
        <p>${badge} — proba=${Math.round((lastW.ml?.predicted_probability||0)*100)}%</p>
        <p><strong>Total:</strong> ${lastW.summary?.total_km ?? '—'} km &nbsp;|&nbsp; 
           <strong>Intensité Z5/T1/T2:</strong> ${lastW.summary?.km_z5t ?? '—'} km &nbsp;|&nbsp;
           <strong>Progression:</strong> x${lastW.summary?.load_spike_rel_w1_w2 ?? '—'}</p>
        <p>${lastW.analysis_text || ''}</p>
        <p class="muted">Modèle: ${lastW.ml?.model || "global_sgd_tuned.joblib (simulé)"} </p>
      </div>
    </div>`;
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

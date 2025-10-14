// =======================
// Rockso prototype — app.js (demo sync + IA) — CLEAN
// =======================

// ---- Mock data (fallback si aucune synchro démo n'a été jouée)
const state = {
  lastActivity: {
    id: "sample",
    type: "Course",
    dateISO: "2025-10-05T07:42:00",
    distanceKm: 8.42,
    durationSec: 45*60 + 12,
    paceSecPerKm: 321,
    hrAvg: 152,
    elevPos: 86,
    calories: 564,
    laps: [
      { n: 1, distKm: 1, timeSec: 323 },
      { n: 2, distKm: 1, timeSec: 325 },
      { n: 3, distKm: 1, timeSec: 319 },
      { n: 4, distKm: 1, timeSec: 320 },
      { n: 5, distKm: 1, timeSec: 318 },
      { n: 6, distKm: 1, timeSec: 324 },
      { n: 7, distKm: 1, timeSec: 321 },
      { n: 8, distKm: 1, timeSec: 322 },
    ],
    route: [[2,90],[8,80],[15,70],[25,62],[35,60],[45,64],[55,74],[64,88],[74,82],[84,70],[92,58]]
  },
  weekly: { load: 73, hours: 4.6, readiness: 82 },
  sports: [
    { name: "Course",   color: "#EB6E9A" },
    { name: "Cyclisme", color: "#00B37A" },
    { name: "Padel",    color: "#F2A65A" },
    { name: "Renfo",    color: "#E9DDC9" }
  ]
};

state.activities = [
  state.lastActivity,
  { id:'a2', type:'Cyclisme', dateISO:'2025-10-04T18:20:00', distanceKm: 32.6, durationSec: 3600+18*60, paceSecPerKm: 120, hrAvg: 138, elevPos: 220, calories: 780 },
  { id:'a3', type:'Course',   dateISO:'2025-10-03T07:15:00', distanceKm: 6.2,  durationSec: 34*60+10,   paceSecPerKm: 330, hrAvg: 149, elevPos: 65,  calories: 410 },
  { id:'a4', type:'Padel',    dateISO:'2025-10-01T20:05:00', distanceKm: 3.1,  durationSec: 70*60,      paceSecPerKm: 0,   hrAvg: 156, elevPos: 10,  calories: 620 },
  { id:'a5', type:'Renfo',    dateISO:'2025-09-30T19:00:00', distanceKm: 0,    durationSec: 40*60,      paceSecPerKm: 0,   hrAvg: 120, elevPos: 0,   calories: 220 },
  { id:'a6', type:'Cyclisme', dateISO:'2025-09-29T17:30:00', distanceKm: 25.4, durationSec: 55*60,      paceSecPerKm: 0,   hrAvg: 130, elevPos: 160, calories: 560 }
];

// =======================
// DEMO SYNC + PERSISTENCE
// =======================
const STORE_KEY = "rocksoState"; // localStorage

function getStore(){
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || { synced:0, weeks:[], activities:[], lastWeekAnalysis:null, lastActivity:null };
  } catch(e){
    return { synced:0, weeks:[], activities:[], lastWeekAnalysis:null, lastActivity:null };
  }
}
function saveStore(st){ localStorage.setItem(STORE_KEY, JSON.stringify(st)); }

// --- Demo inline payloads (fallback si les JSON externes ne sont pas accessibles) ---
const DEMO_INLINE = [
  { // week_demo_1.json (no injury)
    week_index: 1,
    activities: [
      { datetime_iso:"2025-09-22T07:10:00", type:"run",  distance_km:12.6, duration_min:63, avg_hr:148 },
      { datetime_iso:"2025-09-24T18:00:00", type:"run",  distance_km:8.0,  duration_min:42, avg_hr:151 },
      { datetime_iso:"2025-09-26T07:20:00", type:"run",  distance_km:10.2, duration_min:54, avg_hr:146 },
      { datetime_iso:"2025-09-28T09:00:00", type:"run",  distance_km:18.5, duration_min:95, avg_hr:152 }
    ],
    summary: { total_km: 49.3, km_z5t: 4.2, load_spike_rel_w1_w2: 1.12, sessions: 4, rest_days: 3 },
    ml: { predicted_label: 0, predicted_probability: 0.12, model: "global_sgd_tuned.joblib (simulé)" },
    analysis_text: "Semaine maîtrisée : volume modéré (49 km), intensité contrôlée (≈4 km en Z5/T1/T2). RPE cohérent, sommeil et ressenti quotidiens stables. Le risque de blessure est faible."
  },
  { // week_demo_2.json (injury)
    week_index: 2,
    activities: [
      { datetime_iso:"2025-09-29T06:55:00", type:"run",  distance_km:15.0, duration_min:74, avg_hr:154 },
      { datetime_iso:"2025-10-01T19:05:00", type:"run",  distance_km:10.2, duration_min:50, avg_hr:158 },
      { datetime_iso:"2025-10-03T07:00:00", type:"run",  distance_km:12.0, duration_min:56, avg_hr:160 },
      { datetime_iso:"2025-10-05T09:10:00", type:"run",  distance_km:24.0, duration_min:118, avg_hr:156 }
    ],
    summary: { total_km: 61.2, km_z5t: 10.0, load_spike_rel_w1_w2: 1.42, sessions: 4, rest_days: 3 },
    ml: { predicted_label: 1, predicted_probability: 0.76, model: "global_sgd_tuned.joblib (simulé)" },
    analysis_text: "Surcharge nette (+42% vs S-1) et bloc d’intensité élevé (~10 km en Z5/T1/T2). Indices de fatigue probables (HRV en baisse, sommeil moyen). Le risque de blessure est accru — allégez le volume et fractionnez la récupération."
  }
];

// --- Charge JSON depuis plusieurs chemins candidats ; fallback DEMO_INLINE si échecs ---
function resolveUrl(rel){
  const base = (document.querySelector('base')?.href) ||
               (location.origin + location.pathname.replace(/[^/]+$/, ''));
  return new URL(rel, base).toString();
}
async function tryFetch(url){
  const res = await fetch(url, { cache:"no-cache" });
  if(!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
// chemins candidats (si tu mets tes fichiers ailleurs, adapte ici)
const DEMO_WEEKS = ["week_demo_1.json", "week_demo_2.json"];
const DEMO_ALT_PREFIXES = ["./", "./assets/", "./data/", "./assets/data/"];

async function loadWeek(idx){
  const file = DEMO_WEEKS[idx];
  for (const prefix of DEMO_ALT_PREFIXES){
    try { return await tryFetch(resolveUrl(prefix + file)); }
    catch(e){ /* on essaie le suivant */ }
  }
  console.warn(`[sync] Fallback DEMO_INLINE[${idx}] (fichier introuvable)`);
  return DEMO_INLINE[idx];
}

function calcPaceSecPerKm(distanceKm, durationMin){
  if (!distanceKm || distanceKm<=0) return 0;
  return Math.round((durationMin*60) / distanceKm);
}
function mapPayloadActivity(a, idx, weekIndex){
  const typeLabel = (a.type === 'run') ? 'Course' : (a.type === 'cross' ? 'Renfo' : 'Course');
  return {
    id: `wk${weekIndex}-a${idx+1}`,
    type: typeLabel,
    dateISO: a.datetime_iso,
    distanceKm: Number(a.distance_km || 0),
    durationSec: Math.round((a.duration_min || 0) * 60),
    paceSecPerKm: calcPaceSecPerKm(a.distance_km || 0, a.duration_min || 0),
    hrAvg: a.avg_hr || null,
    elevPos: 0, calories: 0
  };
}
function getLiveState(){
  const st = getStore();
  if (st.weeks && st.weeks.length){
    const lastW = st.weeks[st.weeks.length-1];
    const acts = (st.activities||[]).slice().sort((a,b)=> new Date(a.datetime_iso||a.dateISO) - new Date(b.datetime_iso||b.dateISO));
    const lastRaw = acts[acts.length-1];
    const last = lastRaw ? mapPayloadActivity(lastRaw, 0, lastW.week_index || 0) : null;

    const totalKm = lastW.summary?.total_km || 0;
    const hours   = (st.activities||[]).reduce((acc,a)=>acc + (a.duration_min||0), 0) / 60;
    return {
      weekly: {
        load: totalKm,
        hours: hours,
        evolVolumePct: Math.round(((lastW.summary?.load_spike_rel_w1_w2||1)-1)*100) || 0,
        evolIntensityPct: Math.round((((lastW.summary?.km_z5t||0)/(lastW.summary?.total_km||1))*100) - 10)
      },
      lastActivity: last || state.lastActivity,
      activities: acts.map((a,i)=> mapPayloadActivity(a, i, lastW.week_index || 0)),
      sports: state.sports,
      lastWeekAnalysis: lastW.ml ? { text: lastW.analysis_text, ml: lastW.ml } : st.lastWeekAnalysis
    };
  }
  return {
    weekly: state.weekly,
    lastActivity: state.lastActivity,
    activities: state.activities,
    sports: state.sports,
    lastWeekAnalysis: null
  };
}

// =======================
// DOM helpers & formatters
// =======================
const $  = (sel)=>document.querySelector(sel);
const $$ = (sel)=>Array.from(document.querySelectorAll(sel));

function fmtPace(secPerKm){
  const m = Math.floor(secPerKm/60), s = String(Math.round(secPerKm%60)).padStart(2,"0");
  return `${m}:${s}/km`;
}
function fmtDur(sec){
  const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s = Math.round(sec%60);
  return (h? h+":" : "") + String(m).padStart(2,'0') + ":" + String(s).padStart(2,'0');
}
function fmtDate(iso){
  const d = new Date(iso);
  return d.toLocaleString('fr-FR', { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
}
function formatHoursDecimalToHM(hDecimal=0){
  const h = Math.floor(hDecimal);
  const m = Math.round((hDecimal - h) * 60);
  return `${h}h ${String(m).padStart(2,'0')}`;
}
function formatKm(val){
  if (val == null) return '—';
  const n = Number(val);
  if (!Number.isFinite(n)) return '—';
  return `${n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km`;
}

// ---- Inline icons
const Icons = {
  Course:   '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 12h3l3 4 3-8 3 4h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  Cyclisme: '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="6" cy="17" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="17" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 17l6-8 3 4h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  Padel:    '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="9" cy="9" r="4.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12.5 12.5l6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  Renfo:    '<svg viewBox="0 0 24 24" width="18" height="18"><rect x="4" y="10" width="16" height="4" rx="1" fill="currentColor"/></svg>'
};
function iconFor(sport){ return Icons[sport] || Icons.Course; }

// ---- Evolution dots
const EVOL_THRESHOLDS = { ok: 10, warn: 20 };
function setEvolution(baseId, valuePct=0){
  const valEl = document.getElementById(baseId);
  const dotEl = document.getElementById(`${baseId}-dot`);
  if (!valEl || !dotEl) return;
  const sign = valuePct > 0 ? '+' : '';
  valEl.textContent = `${sign}${Math.round(valuePct)}%`;
  const a = Math.abs(valuePct);
  dotEl.classList.remove('dot--ok','dot--warn','dot--risk');
  if (a <= EVOL_THRESHOLDS.ok)        dotEl.classList.add('dot--ok');
  else if (a <= EVOL_THRESHOLDS.warn) dotEl.classList.add('dot--warn');
  else                                dotEl.classList.add('dot--risk');
}

// =======================
// Analyse IA (index + training)
// =======================
function renderAnalysisPanelFromStore(){
  const panel = document.getElementById("analysis-panel");
  if (!panel) return;
  const st = getStore();
  if (!st.weeks || !st.weeks.length){
    panel.innerHTML = `<div class="card"><div class="card-body"><p>Pas d'analyse disponible.</p></div></div>`;
    return;
  }
  const week = st.weeks[st.weeks.length-1];
  const badge = week.ml?.predicted_label ? `<span class="badge badge-red">Risque de blessure</span>` 
                                         : `<span class="badge badge-green">Risque faible</span>`;
  panel.innerHTML = `
    <div class="card">
      <div class="card-title">Analyse de la semaine</div>
      <div class="card-body">
        <p>${badge} — proba=${Math.round((week.ml?.predicted_probability||0)*100)}%</p>
        <p><strong>Total:</strong> ${week.summary?.total_km ?? '—'} km &nbsp;|&nbsp; 
           <strong>Intensité Z5/T1/T2:</strong> ${week.summary?.km_z5t ?? '—'} km &nbsp;|&nbsp;
           <strong>Progression:</strong> x${week.summary?.load_spike_rel_w1_w2 ?? '—'}</p>
        <p>${week.analysis_text || ''}</p>
        <p class="muted">Modèle: ${week.ml?.model || "global_sgd_tuned.joblib (simulé)"} </p>
      </div>
    </div>
  `;
}

// =======================
// Hydrations
// =======================
function hydrateHome(){
  if (!$('#metric-load')) return;
  const live = getLiveState();
  const { weekly, lastActivity, sports } = live;

  $('#metric-load').textContent = formatKm(weekly.load);
  $('#metric-hours').textContent = formatHoursDecimalToHM(typeof weekly.hours === 'number' ? weekly.hours : 0);
  setEvolution('evol-vol', typeof weekly.evolVolumePct==='number'?weekly.evolVolumePct:6);
  setEvolution('evol-int', typeof weekly.evolIntensityPct==='number'?weekly.evolIntensityPct:-12);

  const chips = document.getElementById('sport-chips');
  if (chips && chips.children.length === 0){
    sports.forEach(sp=>{
      const el = document.createElement('button');
      el.className = 'chip'; el.type='button';
      el.innerHTML = `<span class="dot" style="background:${sp.color}"></span>${iconFor(sp.name)} ${sp.name}`;
      chips.appendChild(el);
    });
  }

  $('#last-type').textContent     = lastActivity.type;
  $('#last-date').textContent     = fmtDate(lastActivity.dateISO);
  $('#last-distance').textContent = `${(lastActivity.distanceKm||0).toFixed(2)} km`;
  $('#last-duration').textContent = fmtDur(lastActivity.durationSec||0);
  $('#last-pace').textContent     = lastActivity.paceSecPerKm ? fmtPace(lastActivity.paceSecPerKm) : '—';
  $('#last-activity').href        = `./activity.html?id=${lastActivity.id || 'sample'}`;

  renderAnalysisPanelFromStore();
}

function hydrateActivity(){
  const id = new URLSearchParams(location.search).get('id') || 'sample';
  const live = getLiveState();
  const a = (live.activities || []).find(x=>x.id===id) || live.lastActivity;
  if (!$('#type')) return;

  $('#type').textContent   = a.type;
  $('#date').textContent   = fmtDate(a.dateISO);
  $('#distance').textContent = a.distanceKm ? a.distanceKm.toFixed(2)+' km' : '—';
  $('#duration').textContent = fmtDur(a.durationSec||0);
  $('#pace').textContent     = a.paceSecPerKm ? fmtPace(a.paceSecPerKm) : '—';
  $('#hr').textContent       = a.hrAvg ? a.hrAvg + ' bpm' : '—';
  $('#elev').textContent     = a.elevPos ? a.elevPos + ' m' : '—';
  $('#cal').textContent      = a.calories ? a.calories + ' kcal' : '—';

  const w=320,h=140;
  const points = (a.route||[]).map(([x,y])=>`${x/100*w},${y/100*h}`).join(' ');
  const svg = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%"   stop-color="#EB6E9A"/>
        <stop offset="50%"  stop-color="#F2A65A"/>
        <stop offset="100%" stop-color="#00B37A"/>
      </linearGradient>
    </defs>
    <polyline points="${points}" fill="none" stroke="url(#g)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  $('#route').innerHTML = svg;

  const laps = $('#laps'); if (laps){ laps.innerHTML = '';
    (a.laps||[]).forEach(l => {
      const row = document.createElement('div');
      row.style.display='grid';
      row.style.gridTemplateColumns='40px 1fr auto';
      row.style.gap='10px';
      row.style.padding='8px 0';
      row.style.borderBottom='1px solid var(--line)';
      row.innerHTML = `<span class="muted">#${l.n}</span><strong>${l.distKm.toFixed(2)} km</strong><span>${fmtDur(l.timeSec)}</span>`;
      laps.appendChild(row);
    });
  }
}

function activityRow(a){
  const d = new Date(a.dateISO).toLocaleString('fr-FR', { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
  const dist = a.distanceKm ? a.distanceKm.toFixed(1)+' km' : '';
  const dur = fmtDur(a.durationSec||0);
  return `<a class="row" href="./activity.html?id=${a.id}">
    <div class="left">
      <span class="icon">${iconFor(a.type)}</span>
      <div>
        <div><strong>${a.type}</strong></div>
        <div class="meta">${d}</div>
      </div>
    </div>
    <div class="right">
      <div style="text-align:right"><strong>${dist}</strong><div class="meta">${dur}</div></div>
    </div>
  </a>`;
}
function hydrateActivities(){
  const list = document.getElementById('activity-list');
  if(!list) return;
  const live = getLiveState();
  const items = (live.activities||[]).slice().sort((a,b)=> new Date(b.dateISO)-new Date(a.dateISO));
  list.innerHTML = items.map(activityRow).join('');
}

function hydrateProfile(){
  if (!$('#p-load')) return;
  const live = getLiveState();
  const w = live.weekly;
  $('#p-load').textContent  = formatKm(w.load);
  $('#p-hours').textContent = formatHoursDecimalToHM(typeof w.hours === 'number' ? w.hours : 0);
  const restEl = $('#p-rest'); if (restEl) restEl.textContent = 'OK';

  const chips = document.getElementById('p-sports');
  if (chips) {
    chips.innerHTML = '';
    live.sports.forEach(sp=>{
      const el = document.createElement('span');
      el.className = 'chip';
      el.innerHTML = `<span class="dot" style="background:${sp.color}"></span>${iconFor(sp.name)} ${sp.name}`;
      chips.appendChild(el);
    });
  }
}

function hydrateSync(){
  if (!document.getElementById('btn-sync') && !document.getElementById('sync-btn')) return;
  const elBatt = document.getElementById('sync-battery-val') || document.querySelector('[data-sync-battery]');
  const elLast = document.getElementById('sync-last')        || document.querySelector('[data-sync-last]');
  if (elBatt && !elBatt.textContent.trim()) elBatt.textContent = '87%';
  if (elLast && !elLast.textContent.trim()) elLast.textContent = '—';
}

// =======================
// Sync animation + intégration démo
// =======================
function setupSyncAnimation(){
  const btn     = document.getElementById('sync-btn') || document.getElementById('btn-sync');
  const bar     = document.getElementById('sync-progress-bar');
  const gProg   = document.getElementById('sync-progress'); // calque SVG (anneau)
  const gCheck  = document.getElementById('sync-check');
  const status  = document.getElementById('sync-status');
  const textProgress = document.getElementById('sync-progress-text');
  const iaGear  = document.getElementById('ia-gear');
  const doneEl  = document.getElementById('sync-done');
  const resetBtn= document.getElementById('reset-demo');
  const gPulsar = document.getElementById('sync-pulsar');

  if(!btn || !bar || !gProg || !gCheck) return; // pas sur la page

  // État persistant au chargement
  const persisted = getStore();
  if ((persisted.synced || 0) > 0) {
    gCheck.style.display = 'block';
    gProg.style.display  = 'none';
    if (doneEl) {
      doneEl.classList.remove('hidden');
      doneEl.innerHTML = `✅ Rockso a déjà analysé l'entraînement. Consulte l'analyse sur <a href="./index.html">Index</a> ou <a href="./training-entrainement.html">Training</a>.`;
    }
    const last = document.querySelector('[data-sync-last]') ||
                 document.getElementById('sync-last') ||
                 document.querySelector('.sync-row .sync-label + .sync-val');
    if(last){
      const d = new Date();
      last.textContent = `aujourd’hui ${d.toLocaleString('fr-FR', { hour:'2-digit', minute:'2-digit' })}`;
    }
  }

  // Reset démo
  if (resetBtn) {
    resetBtn.addEventListener('click', ()=>{
      localStorage.removeItem(STORE_KEY);
      location.reload();
    });
  }

  const CIRC = 2*Math.PI*60; // r=60 -> ~377
  function setProgress(pct){
    const off = CIRC * (1 - pct/100);
    bar.style.strokeDashoffset = off.toFixed(1);
  }

  function startSyncUI(){
    gCheck.style.display = 'none';
    gProg.style.display  = 'block';
    btn.disabled = true;
    setProgress(0);
    if (textProgress) textProgress.textContent = '';
    if (doneEl) { doneEl.classList.add('hidden'); doneEl.innerHTML = ''; }
    if (iaGear) iaGear.classList.add('hidden');

    // PULSAR ON
    if (gPulsar){ gPulsar.style.display = ''; gPulsar.classList.add('animate'); }
  }
  function endSyncUI(){
    gProg.style.display  = 'none';
    gCheck.style.display = 'block';
    if (status) status.textContent = "Synchronisation terminée";

    // PULSAR OFF
    if (gPulsar){ gPulsar.classList.remove('animate'); gPulsar.style.display = 'none'; }

    const last = document.querySelector('[data-sync-last]') ||
                 document.getElementById('sync-last') ||
                 document.querySelector('.sync-row .sync-label + .sync-val');
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
        const k = Math.min(1, (now - t0) / dur);
        const pct = currentPct + delta * k;
        setProgress(pct);
        if (k<1) requestAnimationFrame(tick);
        else res();
      }
      requestAnimationFrame(tick);
    });
  }

  async function runDemoUpload(payload){
    const N = (payload.activities||[]).length;
    if (status) status.textContent = "Connexion…";
    await animTo(10, 600);
    if (status) status.textContent = "Préparation de la synchronisation…";
    await animTo(20, 700);

    for (let i=0;i<N;i++){
      if (textProgress) textProgress.textContent = `Synchronisation des activités ${i+1}/${N}…`;
      await animTo(20 + ((i+1)/N)*75, 600);
      await new Promise(r=>setTimeout(r, 120));
    }
    await animTo(98, 500);
  }

  function mergePayloadIntoStore(payload){
    const st = getStore();
    st.weeks = st.weeks || [];
    st.activities = st.activities || [];
    st.weeks.push(payload);
    st.activities = st.activities.concat(payload.activities);
    st.lastActivity = payload.activities[payload.activities.length-1];
    st.lastWeekAnalysis = { text: payload.analysis_text, ml: payload.ml };
    st.synced = (st.synced||0) + 1;
    saveStore(st);
  }

  // Injecte le markup des 3 engrenages si absent (sécurité)
  function ensureGearMarkup(){
    if (!iaGear) return;
    if (iaGear.children.length) return;
    iaGear.innerHTML = `
      <svg class="gear g-lg" width="34" height="34" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" fill="none" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      <svg class="gear g-md" width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z"/>
        <path d="M12 3v1.6M12 18.4V20M5.76 5.76l1.13 1.13M17.1 17.1l1.13 1.13M3 12h1.6M18.4 12H20M5.76 18.24l1.13-1.13M17.1 6.9l1.13-1.13" fill="none" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      <svg class="gear g-sm" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 10.2a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6Z"/>
        <path d="M12 4v1M12 19v1M6.5 6.5l.8.8M16.7 16.7l.8.8M4 12h1M19 12h1M6.5 17.5l.8-.8M16.7 7.3l.8-.8" fill="none" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      <span class="muted">Analyse IA en cours…</span>
    `;
  }

  async function startSync(){
    startSyncUI();
    try {
      const st = getStore();
      const idx = st.synced || 0;

      if (idx >= DEMO_INLINE.length) { // max 2 semaines en démo
        if (status) status.textContent = "Aucune nouvelle donnée démo à synchroniser.";
        if (textProgress) textProgress.textContent = "Démo : toutes les données ont déjà été synchronisées.";
        await animTo(100, 400);
        endSyncUI();
        return;
      }

      const payload = await loadWeek(idx);  // essaie fichiers, puis fallback inline
      await runDemoUpload(payload);
      mergePayloadIntoStore(payload);

      await animTo(100, 400);
      endSyncUI();

      // Animation IA visible 2s
      ensureGearMarkup();
      if (iaGear) iaGear.classList.remove("hidden");
      if (status) status.textContent = "Analyse IA en cours…";
      await new Promise(r=>setTimeout(r, 2000));
      if (iaGear) iaGear.classList.add("hidden");
      if (doneEl) {
        doneEl.classList.remove("hidden");
        doneEl.innerHTML = `✅ Rockso a analysé l'entraînement. Consulte l'analyse sur la page <a href="./index.html">Index</a> ou <a href="./training-entrainement.html">Training</a>.`;
      }
    } catch(e){
      console.error(e);
      if (status) status.textContent = "Erreur de synchronisation.";
      if (textProgress) textProgress.textContent = "La démo a un fallback intégré, recharge la page si le problème persiste.";
      // Éteindre le pulsar en cas d'erreur
      if (gPulsar){ gPulsar.classList.remove('animate'); gPulsar.style.display = 'none'; }
      btn.disabled = false;
    }
  }

  // état initial : check visible, progress caché, pulsar off
  gCheck.style.display = 'block';
  gProg.style.display  = 'none';
  setProgress(0);
  if (gPulsar){ gPulsar.classList.remove('animate'); gPulsar.style.display = 'none'; }

  btn.addEventListener('click', startSync);
}

// =======================
// Boot
// =======================
document.addEventListener('DOMContentLoaded', ()=>{
  hydrateHome();
  hydrateActivity();
  hydrateActivities();
  hydrateProfile();
  hydrateSync();
  setupSyncAnimation();

  if (document.body.dataset.page === 'training') {
    const t = document.getElementById('tab-training');
    if (t) t.classList.add('active');
    renderAnalysisPanelFromStore();
  }
  if (document.getElementById('analysis-panel')) {
    renderAnalysisPanelFromStore();
  }
});

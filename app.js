// =======================
// Rockso prototype — app.js (cohérence globale S0→S1→S2)
// =======================

// ---------- Helpers ----------
const $  = (s)=>document.querySelector(s);
const $$ = (s)=>Array.from(document.querySelectorAll(s));

function fmtPace(secPerKm){ const m=Math.floor(secPerKm/60), s=String(Math.round(secPerKm%60)).padStart(2,"0"); return `${m}:${s}/km`; }
function fmtDur(sec){ const h=Math.floor(sec/3600), m=Math.floor((sec%3600)/60), s=Math.round(sec%60); return (h? h+":" : "")+String(m).padStart(2,'0')+":"+String(s).padStart(2,'0'); }
function fmtHMfromMin(min){ const h=Math.floor(min/60), m=Math.round(min%60); return `${h}h ${String(m).padStart(2,'0')}`; }
function fmtDate(iso){ const d=new Date(iso); return d.toLocaleString('fr-FR',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}); }
function formatKm(n){ if(n==null||!isFinite(n))return '—'; return `${Number(n).toLocaleString('fr-FR',{maximumFractionDigits:1})} km`; }
function avg(a){ return a.length ? a.reduce((x,y)=>x+y,0)/a.length : 0; }
function round1(n){ return Math.round(n*10)/10; }

// ---------- Icônes ----------
const Icons={
  Course:'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 12h3l3 4 3-8 3 4h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  Cyclisme:'<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="6" cy="17" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="17" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 17l6-8 3 4h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  Padel:'<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="9" cy="9" r="4.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12.5 12.5l6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  Renfo:'<svg viewBox="0 0 24 24" width="18" height="18"><rect x="4" y="10" width="16" height="4" rx="1" fill="currentColor"/></svg>'
};
function iconFor(sport){ return Icons[sport] || Icons.Course; }

// ---------- Données baseline (Semaine 0) ----------
const STORE_KEY="rocksoState";

const baselineActivities = [
  // Course (compte dans km hebdo)
  { id:'s0a1', type:'Course', dateISO:'2025-09-16T07:10:00', distanceKm:8.2,  durationSec:44*60,     paceSecPerKm:322, hrAvg:148, elevPos:60,  calories:520 },
  { id:'s0a2', type:'Course', dateISO:'2025-09-18T18:10:00', distanceKm:9.6,  durationSec:51*60,     paceSecPerKm:318, hrAvg:149, elevPos:70,  calories:600 },
  { id:'s0a3', type:'Course', dateISO:'2025-09-20T08:05:00', distanceKm:10.4, durationSec:55*60,     paceSecPerKm:317, hrAvg:150, elevPos:80,  calories:690 },
  { id:'s0a4', type:'Course', dateISO:'2025-09-21T09:00:00', distanceKm:16.0, durationSec:85*60+20,  paceSecPerKm:320, hrAvg:152, elevPos:120, calories:980 },
  // Cross (ne compte pas dans km hebdo, mais compte dans durée et séances)
  { id:'s0b1', type:'Renfo',   dateISO:'2025-09-17T19:00:00', distanceKm:0,    durationSec:40*60,     paceSecPerKm:0,   hrAvg:120, elevPos:0,   calories:260 },
  { id:'s0b2', type:'Cyclisme',dateISO:'2025-09-19T18:00:00', distanceKm:26.0, durationSec:58*60,     paceSecPerKm:0,   hrAvg:130, elevPos:160, calories:540 },
];

const baselineDaily = [
  { date:'2025-09-15', sleep_min:440, hrv_ms:78, rhr_bpm:53, rpe:2, steps:8200,  act_min:32 },
  { date:'2025-09-16', sleep_min:465, hrv_ms:77, rhr_bpm:54, rpe:3, steps:10800, act_min:46 },
  { date:'2025-09-17', sleep_min:430, hrv_ms:76, rhr_bpm:54, rpe:2, steps:9000,  act_min:38 },
  { date:'2025-09-18', sleep_min:455, hrv_ms:75, rhr_bpm:54, rpe:3, steps:11200, act_min:52 },
  { date:'2025-09-19', sleep_min:445, hrv_ms:77, rhr_bpm:53, rpe:2, steps:9600,  act_min:41 },
  { date:'2025-09-20', sleep_min:470, hrv_ms:76, rhr_bpm:54, rpe:3, steps:12400, act_min:64 },
  { date:'2025-09-21', sleep_min:468, hrv_ms:78, rhr_bpm:53, rpe:4, steps:13200, act_min:68 },
];

const initialWeek = {
  week_index: 0,
  summary: { total_km: 44.2, km_z5t: 3.5, load_spike_rel_w1_w2: 1.00, sessions: 6, rest_days: 1 },
  ml: { predicted_label: 0, predicted_probability: 0.10, model:"global_sgd_tuned.joblib (simulé)" },
  analysis_text: "Semaine de base stable (~44 km), intensité maîtrisée (~3–4 km en Z5/T1/T2), biomarqueurs OK (HRV ~76 ms, FC repos ~54 bpm, sommeil ~7h25). Risque faible."
};

// ---------- Semaine 1 & 2 (synchro démo) ----------
const DEMO_WEEKS = ["week_demo_1.json","week_demo_2.json"];
const DEMO_ALT_PREFIXES=["./","./assets/","./data/","./assets/data/"];

const DEMO_INLINE = [
  { // S-1 : 22→28 sept (+12% vs S-0)
    week_index: 1,
    activities: [
      { datetime_iso:"2025-09-22T07:10:00", type:"run", distance_km:12.6, duration_min:63, avg_hr:148 },
      { datetime_iso:"2025-09-24T18:00:00", type:"run", distance_km: 8.0, duration_min:42, avg_hr:151 },
      { datetime_iso:"2025-09-26T07:20:00", type:"run", distance_km:10.2, duration_min:54, avg_hr:146 },
      { datetime_iso:"2025-09-28T09:00:00", type:"run", distance_km:18.5, duration_min:95, avg_hr:152 },
    ],
    daily: [
      { date:"2025-09-22", sleep_min:450, hrv_ms:75, rhr_bpm:54, rpe:3 },
      { date:"2025-09-23", sleep_min:470, hrv_ms:77, rhr_bpm:53, rpe:2 },
      { date:"2025-09-24", sleep_min:455, hrv_ms:76, rhr_bpm:54, rpe:3 },
      { date:"2025-09-25", sleep_min:440, hrv_ms:74, rhr_bpm:54, rpe:2 },
      { date:"2025-09-26", sleep_min:465, hrv_ms:75, rhr_bpm:54, rpe:3 },
      { date:"2025-09-27", sleep_min:455, hrv_ms:75, rhr_bpm:54, rpe:3 },
      { date:"2025-09-28", sleep_min:470, hrv_ms:76, rhr_bpm:53, rpe:4 },
    ],
    summary: { total_km: 49.3, km_z5t: 4.2, load_spike_rel_w1_w2: 1.12, sessions: 4, rest_days: 3 },
    ml: { predicted_label: 0, predicted_probability: 0.12, model:"global_sgd_tuned.joblib (simulé)" },
    analysis_text: "Progression modérée (+12 % vs S-0) et intensité contenue (~4 km rapides). HRV/sommeil stables. Risque faible — on continue."
  },
  { // S : 29 sept → 05 oct (+24% vs S-1, intensité ↑)
    week_index: 2,
    activities: [
      { datetime_iso:"2025-09-29T06:55:00", type:"run", distance_km:15.0, duration_min:74, avg_hr:154 },
      { datetime_iso:"2025-10-01T19:05:00", type:"run", distance_km:10.2, duration_min:50, avg_hr:158 },
      { datetime_iso:"2025-10-03T07:00:00", type:"run", distance_km:12.0, duration_min:56, avg_hr:160 },
      { datetime_iso:"2025-10-05T09:10:00", type:"run", distance_km:24.0, duration_min:118,avg_hr:156 },
    ],
    daily: [
      { date:"2025-09-29", sleep_min:405, hrv_ms:72, rhr_bpm:56, rpe:4 },
      { date:"2025-09-30", sleep_min:420, hrv_ms:71, rhr_bpm:57, rpe:4 },
      { date:"2025-10-01", sleep_min:395, hrv_ms:70, rhr_bpm:57, rpe:5 },
      { date:"2025-10-02", sleep_min:410, hrv_ms:69, rhr_bpm:58, rpe:4 },
      { date:"2025-10-03", sleep_min:400, hrv_ms:70, rhr_bpm:58, rpe:5 },
      { date:"2025-10-04", sleep_min:390, hrv_ms:68, rhr_bpm:58, rpe:5 },
      { date:"2025-10-05", sleep_min:380, hrv_ms:69, rhr_bpm:57, rpe:6 },
    ],
    summary: { total_km: 61.2, km_z5t: 10.0, load_spike_rel_w1_w2: 1.24, sessions: 4, rest_days: 3 },
    ml: { predicted_label: 1, predicted_probability: 0.76, model:"global_sgd_tuned.joblib (simulé)" },
    analysis_text: "Surcharge (+24 % vs S-1) et hausse d’intensité (~10 km rapides). Signes de fatigue (HRV ↓, FC repos ↑, sommeil < 7 h). Risque accru — alléger le volume et fractionner la récup."
  }
];

// ---------- Store ----------
function saveStore(st){ localStorage.setItem(STORE_KEY, JSON.stringify(st)); }
function getStore(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY)) || null; }
  catch(e){ return null; }
}
function seedStoreIfEmpty(){
  let st=getStore();
  if(st) return;
  st = {
    synced: 0,
    weeks: [ initialWeek ],
    // On stocke baseline en “forme UI” ; la suite pourra mixer JSON/UI sans pb
    activities: baselineActivities.slice(),
    daily: baselineDaily.slice(),
    lastWeekAnalysis: initialWeek,
    lastActivity: baselineActivities.slice().sort((a,b)=>new Date(b.dateISO)-new Date(a.dateISO))[0]
  };
  saveStore(st);
}

// ---------- Fetch JSON (synchro) ----------
function resolveUrl(rel){ const base=(document.querySelector('base')?.href)||(location.origin+location.pathname.replace(/[^/]+$/,'')); return new URL(rel,base).toString(); }
async function tryFetch(url){ const res=await fetch(url,{cache:"no-cache"}); if(!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); }
async function loadWeek(idx){ const file=DEMO_WEEKS[idx]; for(const p of DEMO_ALT_PREFIXES){ try{ return await tryFetch(resolveUrl(p+file)); }catch(e){} } console.warn(`[sync] fallback inline week ${idx}`); return DEMO_INLINE[idx]; }

// ---------- Agrégations ----------
function weeklyFromActivities(acts){
  const isRun = a => (a.type==='Course'||a.type==='run');
  const km = acts.reduce((s,a)=>{
    const d = a.distanceKm ?? a.distance_km ?? 0;
    const t = (a.type==='Course'||a.type==='run') ? d : 0;
    return s + t;
  },0);
  const durMin = acts.reduce((s,a)=> s + ((a.durationSec ?? ((a.duration_min||0)*60))/60), 0);
  const sessions = acts.length;
  return { km, durMin, sessions };
}

// ---------- Live state ----------
function normalizeActivity(a){
  if(a.datetime_iso){
    return {
      id: a.id || `wk${Math.random().toString(36).slice(2)}`,
      type: (a.type==='run'?'Course':(a.type==='cross'?'Renfo':'Course')),
      dateISO: a.datetime_iso,
      distanceKm: a.distance_km||0,
      durationSec: Math.round((a.duration_min||0)*60),
      paceSecPerKm: a.distance_km ? Math.round((a.duration_min*60)/a.distance_km) : 0,
      hrAvg: a.avg_hr||null, elevPos:0, calories:0
    };
  }
  return a; // déjà au format UI
}

function getLiveState(){
  seedStoreIfEmpty();
  const st = getStore();

  // map + tri
  const acts = (st.activities||[]).map(normalizeActivity).sort((a,b)=> new Date(b.dateISO)-new Date(a.dateISO));
  const wk = weeklyFromActivities(acts);
  const lastWeek = st.weeks[st.weeks.length-1] || initialWeek;

  return {
    weekly: {
      load: round1(wk.km),
      hours: wk.durMin/60,
      evolVolumePct: Math.round(((lastWeek.summary?.load_spike_rel_w1_w2||1)-1)*100) || 0,
      evolIntensityPct: Math.round((((lastWeek.summary?.km_z5t||0)/(lastWeek.summary?.total_km||1))*100) - 8)
    },
    activities: acts,
    lastActivity: acts[0] || null,
    daily: st.daily||[],
    sports: [
      { name:"Course",   color:"#EB6E9A" },
      { name:"Cyclisme", color:"#00B37A" },
      { name:"Padel",    color:"#F2A65A" },
      { name:"Renfo",    color:"#E9DDC9" }
    ],
    lastWeekAnalysis: lastWeek
  };
}

// ---------- Dots évolution ----------
const EVOL_THRESHOLDS={ ok:10, warn:20 };
function setEvolution(baseId, valuePct=0){
  const valEl=$(`#${baseId}`), dotEl=$(`#${baseId}-dot`);
  if(!valEl||!dotEl) return;
  const sign=valuePct>0?'+':'';
  valEl.textContent=`${sign}${Math.round(valuePct)}%`;
  const a=Math.abs(valuePct);
  dotEl.classList.remove('dot--ok','dot--warn','dot--risk');
  if(a<=EVOL_THRESHOLDS.ok) dotEl.classList.add('dot--ok');
  else if(a<=EVOL_THRESHOLDS.warn) dotEl.classList.add('dot--warn');
  else dotEl.classList.add('dot--risk');
}

// ---------- Analyse IA (Index/Training) ----------
function renderAnalysisPanelFromStore(){
  const panel = $("#analysis-panel"); if(!panel) return;
  const st = getStore(); const week = st?.weeks?.[st.weeks.length-1] || initialWeek;
  const badge = week.ml?.predicted_label ? `<span class="badge badge-red">Risque de blessure</span>` : `<span class="badge badge-green">Risque faible</span>`;
  panel.innerHTML = `
    <div class="card">
      <div class="card-title">Analyse de la semaine</div>
      <div class="card-body">
        <p>${badge} — proba=${Math.round((week.ml?.predicted_probability||0)*100)}%</p>
        <p><strong>Total:</strong> ${week.summary?.total_km ?? '—'} km &nbsp;|&nbsp;
           <strong>Intensité Z5/T1/T2:</strong> ${week.summary?.km_z5t ?? '—'} km &nbsp;|&nbsp;
           <strong>Progression:</strong> x${week.summary?.load_spike_rel_w1_w2 ?? '—'}</p>
        <p>${week.analysis_text||''}</p>
        <p class="muted">Modèle: ${week.ml?.model || "global_sgd_tuned.joblib (simulé)"}</p>
      </div>
    </div>`;
}

// ---------- Hydratations pages ----------
function hydrateHome(){
  const ml = $("#metric-load"); if(!ml) return;
  const live=getLiveState(), {weekly,lastActivity,sports}=live;
  ml.textContent = formatKm(weekly.load);
  $("#metric-hours").textContent = fmtHMfromMin((weekly.hours||0)*60);
  setEvolution('evol-vol', weekly.evolVolumePct||0);
  setEvolution('evol-int', weekly.evolIntensityPct||0);

  const chips=$("#sport-chips");
  if(chips && chips.children.length===0){
    sports.forEach(sp=>{
      const el=document.createElement('button');
      el.className='chip'; el.type='button';
      el.innerHTML=`<span class="dot" style="background:${sp.color}"></span>${iconFor(sp.name)} ${sp.name}`;
      chips.appendChild(el);
    });
  }
  $("#last-type").textContent=lastActivity.type;
  $("#last-date").textContent=fmtDate(lastActivity.dateISO);
  $("#last-distance").textContent=`${(lastActivity.distanceKm||0).toFixed(2)} km`;
  $("#last-duration").textContent=fmtDur(lastActivity.durationSec||0);
  $("#last-pace").textContent= lastActivity.paceSecPerKm ? fmtPace(lastActivity.paceSecPerKm) : '—';
  $("#last-activity").href=`./activity.html?id=${lastActivity.id||'sample'}`;

  renderAnalysisPanelFromStore();
}

function hydrateTrainingSummary(){
  const dEl=$("#trg-dur-7"), kEl=$("#trg-dist-7"), sEl=$("#trg-sessions");
  if(!dEl && !kEl && !sEl) return;
  const live=getLiveState();
  const w = weeklyFromActivities(live.activities||[]);
  if(kEl) kEl.textContent = formatKm(round1(w.km));
  if(dEl) dEl.textContent = fmtHMfromMin(w.durMin);
  if(sEl) sEl.textContent = String(w.sessions);
}

function hydrateTrainingQuotidien(){
  const live=getLiveState(), days=live.daily||[]; if(!days.length) return;

  // Dernier jour (proxy pour “aujourd’hui”)
  const last = days[days.length-1];

  const set = (id, val)=>{ const el=$(id); if(el) el.textContent = val; };

  // Bloc “Santé du quotidien”
  set("#dq-steps",      last.steps ? last.steps.toLocaleString('fr-FR') : "—");
  set("#dq-active-cal", last.steps ? Math.round(last.steps*0.04)+" kcal" : "—");  // approx démo
  set("#dq-rhr",        last.rhr_bpm ? `${last.rhr_bpm} bpm` : "—");
  set("#dq-resp",       "14 rpm");     // démo fixe
  set("#dq-spo2",       "97%");
  set("#dq-act-min",    last.act_min ? `${last.act_min} min` : "—");

  // Récap récupération (moyennes 7j)
  const sleepLast = last.sleep_min || null;
  const sleepAvg  = round1(avg(days.map(d=>d.sleep_min))/60);
  const hrvAvg    = Math.round(avg(days.map(d=>d.hrv_ms)));
  const rpeAvg    = round1(avg(days.map(d=>d.rpe)));
  const rhrAvg    = Math.round(avg(days.map(d=>d.rhr_bpm)));

  set("#dq-sleep-last", sleepLast ? fmtHMfromMin(sleepLast) : "—");
  set("#dq-sleep-avg",  sleepAvg  ? `${sleepAvg} h` : "—");
  set("#dq-hrv-avg",    hrvAvg    ? `${hrvAvg} ms` : "—");
  set("#dq-rpe-avg",    rpeAvg    ? `${rpeAvg}`    : "—");
  set("#dq-rhr-avg",    rhrAvg    ? `${rhrAvg} bpm`: "—");

  // Journal (J-6 → J)
  const list = $("#daily-list");
  if(list){
    list.innerHTML = days.map(d=>{
      const dt = new Date(d.date+'T12:00:00');
      const lab = dt.toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'short'});
      return `<div class="row" style="display:grid;grid-template-columns:1.2fr 1fr 1fr 0.6fr;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)">
        <div><span class="muted">${lab}</span></div>
        <div><strong>${fmtHMfromMin(d.sleep_min)}</strong><div class="meta">Sommeil</div></div>
        <div><strong>${d.hrv_ms} ms</strong><div class="meta">HRV</div></div>
        <div><strong>${d.rpe}</strong><div class="meta">RPE</div></div>
      </div>`;
    }).join('');
  }
}

function hydrateActivity(){
  const id=new URLSearchParams(location.search).get('id') || (getLiveState().lastActivity?.id || 'sample');
  const live=getLiveState();
  const a=(live.activities||[]).find(x=>x.id===id) || live.lastActivity;
  if(!$("#type")||!a) return;
  $("#type").textContent=a.type;
  $("#date").textContent=fmtDate(a.dateISO);
  $("#distance").textContent=a.distanceKm ? a.distanceKm.toFixed(2)+' km' : '—';
  $("#duration").textContent=fmtDur(a.durationSec||0);
  $("#pace").textContent=a.paceSecPerKm ? fmtPace(a.paceSecPerKm) : '—';
  $("#hr").textContent=a.hrAvg? a.hrAvg+' bpm':'—';
  $("#elev").textContent=a.elevPos? a.elevPos+' m':'—';
  $("#cal").textContent=a.calories? a.calories+' kcal':'—';
}

function activityRow(a){
  const d=new Date(a.dateISO).toLocaleString('fr-FR',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
  const dist=a.distanceKm? a.distanceKm.toFixed(1)+' km':'';
  const dur=fmtDur(a.durationSec||0);
  return `<a class="row" href="./activity.html?id=${a.id}">
    <div class="left"><span class="icon">${iconFor(a.type)}</span>
      <div><div><strong>${a.type}</strong></div><div class="meta">${d}</div></div></div>
    <div class="right"><div style="text-align:right"><strong>${dist}</strong><div class="meta">${dur}</div></div></div>
  </a>`;
}
function hydrateActivities(){
  const list=$("#activity-list"); if(!list) return;
  const items=(getLiveState().activities||[]).slice().sort((a,b)=> new Date(b.dateISO)-new Date(a.dateISO));
  list.innerHTML=items.map(activityRow).join('');
}

function hydrateProfile(){
  const loadEl=$("#p-load"); if(!loadEl) return;
  const live=getLiveState(); const w=weeklyFromActivities(live.activities||[]);
  loadEl.textContent  = formatKm(round1(w.km));
  $("#p-hours").textContent = fmtHMfromMin(w.durMin);
  const restEl=$("#p-rest"); if(restEl) restEl.textContent='OK';
  const chips=$("#p-sports"); if(chips){ chips.innerHTML=''; (live.sports||[]).forEach(sp=>{ const el=document.createElement('span'); el.className='chip'; el.innerHTML=`<span class="dot" style="background:${sp.color}"></span>${iconFor(sp.name)} ${sp.name}`; chips.appendChild(el); }); }
}

function hydrateSync(){
  if (!$("#sync-btn") && !$("#btn-sync")) return;
  const elBatt=$("#sync-battery-val")||document.querySelector('[data-sync-battery]');
  const elLast=$("#sync-last")||document.querySelector('[data-sync-last]');
  if(elBatt && !elBatt.textContent.trim()) elBatt.textContent='87%';
  if(elLast && !elLast.textContent.trim()) elLast.textContent='—';
}

// ---------- Sync UI + intégration ----------
function setupSyncAnimation(){
  const btn=$("#sync-btn")||$("#btn-sync");
  const bar=$("#sync-progress-bar");
  const gProg=$("#sync-progress")||$("#sync-watch-layer");
  const gCheck=$("#sync-check");
  const status=$("#sync-status");
  const textProgress=$("#sync-progress-text");
  const iaGear=$("#ia-gear")||$("#gear-area");
  const doneEl=$("#sync-done");
  const resetBtn=$("#reset-demo");
  const gPulsar=$("#sync-pulsar");

  if(!btn||!bar||!gProg||!gCheck) return;

  const persisted=getStore();
  if((persisted?.synced||0)>0){
    gCheck.style.display='block'; gProg.style.display='none';
    if(doneEl){ doneEl.classList.remove('hidden'); doneEl.innerHTML=`✅ Rockso a déjà analysé l'entraînement. Consulte l'analyse sur <a href="./index.html">Index</a> ou <a href="./training-entrainement.html">Training</a>.`; }
    const last=document.querySelector('[data-sync-last]')||$("#sync-last")||document.querySelector('.sync-row .sync-label + .sync-val');
    if(last){ const d=new Date(); last.textContent=`aujourd’hui ${d.toLocaleString('fr-FR',{hour:'2-digit',minute:'2-digit'})}`; }
  }
  if(resetBtn){ resetBtn.addEventListener('click',()=>{ localStorage.removeItem(STORE_KEY); location.reload(); }); }

  const CIRC=2*Math.PI*60;
  function setProgress(pct){ const off=CIRC*(1-pct/100); bar.style.strokeDashoffset=off.toFixed(1); }

  function startSyncUI(){ gCheck.style.display='none'; gProg.style.display='block'; btn.disabled=true; setProgress(0); if(textProgress) textProgress.textContent=''; if(doneEl){doneEl.classList.add('hidden'); doneEl.innerHTML='';} if(iaGear) iaGear.classList.add('hidden'); if(gPulsar){ gPulsar.style.display=''; gPulsar.classList.add('animate'); } }
  function endSyncUI(){ gProg.style.display='none'; gCheck.style.display='block'; if(status) status.textContent='Synchronisation terminée'; if(gPulsar){ gPulsar.classList.remove('animate'); gPulsar.style.display='none'; } const last=document.querySelector('[data-sync-last]')||$("#sync-last")||document.querySelector('.sync-row .sync-label + .sync-val'); if(last){ const d=new Date(); last.textContent=`aujourd’hui ${d.toLocaleString('fr-FR',{hour:'2-digit',minute:'2-digit'})}`; } btn.disabled=false; }

  function animTo(targetPct,dur=800){
    const t0=performance.now(); const start=parseFloat(bar.style.strokeDashoffset||(CIRC)); const currentPct=100-(start/CIRC*100); const delta=targetPct-currentPct;
    return new Promise(res=>{ function tick(now){ const k=Math.min(1,(now-t0)/dur); const pct=currentPct+delta*k; setProgress(pct); if(k<1) requestAnimationFrame(tick); else res(); } requestAnimationFrame(tick); });
  }

  async function runDemoUpload(payload){
    const N=(payload.activities||[]).length;
    if(status) status.textContent="Connexion…"; await animTo(10,600);
    if(status) status.textContent="Préparation de la synchronisation…"; await animTo(20,700);
    for(let i=0;i<N;i++){ if(textProgress) textProgress.textContent=`Synchronisation des activités ${i+1}/${N}…`; await animTo(20+((i+1)/N)*75,600); await new Promise(r=>setTimeout(r,120)); }
    await animTo(98,500);
  }

  function mergePayloadIntoStore(payload){
    const st=getStore();
    st.weeks = st.weeks || [];
    st.activities = st.activities || [];
    st.daily = st.daily || [];

    st.weeks.push(payload);
    st.activities = st.activities.concat(payload.activities);     // on garde le format JSON brut
    if(payload.daily?.length) st.daily = st.daily.concat(payload.daily);

    st.lastActivity = payload.activities[payload.activities.length-1];
    st.lastWeekAnalysis = { text: payload.analysis_text, ml: payload.ml };
    st.synced = (st.synced||0) + 1;
    saveStore(st);
  }

  function ensureGearMarkup(){
    if(!iaGear || iaGear.children.length) return;
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
      <span class="muted">Analyse IA en cours…</span>`;
  }

  async function startSync(){
    startSyncUI();
    try{
      const st=getStore(); const idx=st.synced||0;
      if(idx >= DEMO_INLINE.length){
        if(status) status.textContent="Aucune nouvelle donnée démo à synchroniser.";
        if(textProgress) textProgress.textContent="Démo : toutes les données ont déjà été synchronisées.";
        await animTo(100,400); endSyncUI(); return;
      }
      const payload=await loadWeek(idx);
      await runDemoUpload(payload);
      mergePayloadIntoStore(payload);
      await animTo(100,400); endSyncUI();

      ensureGearMarkup();
      if(iaGear) iaGear.classList.remove('hidden');
      if(status) status.textContent="Analyse IA en cours…";
      await new Promise(r=>setTimeout(r,2000));
      if(iaGear) iaGear.classList.add('hidden');
      if(doneEl){ doneEl.classList.remove('hidden'); doneEl.innerHTML=`✅ Rockso a analysé l'entraînement. Consulte l'analyse sur la page <a href="./index.html">Index</a> ou <a href="./training-entrainement.html">Training</a>.`; }
    }catch(e){
      console.error(e);
      if(status) status.textContent="Erreur de synchronisation.";
      if(textProgress) textProgress.textContent="La démo a un fallback intégré, recharge la page si le problème persiste.";
      if(gPulsar){ gPulsar.classList.remove('animate'); gPulsar.style.display='none'; }
      btn.disabled=false;
    }
  }

  // état initial UI
  const CIRC=2*Math.PI*60;
  if(bar){ bar.style.strokeDasharray='377'; bar.style.strokeDashoffset='377'; }
  gCheck.style.display='block'; gProg.style.display='none';
  if(gPulsar){ gPulsar.classList.remove('animate'); gPulsar.style.display='none'; }

  function startSyncUI(){ /* défini plus haut via closures */ }
  btn.addEventListener('click', startSync);
}

// ---------- Boot ----------
document.addEventListener('DOMContentLoaded', ()=>{
  seedStoreIfEmpty();

  hydrateHome();
  hydrateTrainingSummary();
  hydrateTrainingQuotidien();
  hydrateActivity();
  hydrateActivities();
  hydrateProfile();
  hydrateSync();
  setupSyncAnimation();

  if (document.body.dataset.page === 'training') {
    const t = $("#tab-training"); if(t) t.classList.add('active');
    renderAnalysisPanelFromStore();
  }
  if ($("#analysis-panel")) renderAnalysisPanelFromStore();
});

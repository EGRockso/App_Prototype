// =======================
// Rockso prototype — app.js (clean)
// =======================

// ---- Data (inchangée)
const state = {
  lastActivity: {
    id: "sample",
    type: "Course",
    dateISO: "2025-10-05T07:42:00",
    distanceKm: 8.42,
    durationSec: 45*60 + 12,
    paceSecPerKm: 321, // 5:21 /km
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
    route: [
      [2,90],[8,80],[15,70],[25,62],[35,60],[45,64],[55,74],[64,88],[74,82],[84,70],[92,58]
    ]
  },
  weekly: { load: 73, hours: 4.6, readiness: 82 },
  sports: [
    { name: "Course",   color: "#EB6E9A" },
    { name: "Cyclisme", color: "#00B37A" },
    { name: "Padel",    color: "#F2A65A" },
    { name: "Renfo",    color: "#E9DDC9" }
  ]
};

// Génère quelques activités pour le Journal
state.activities = [
  state.lastActivity,
  { id:'a2', type:'Cyclisme', dateISO:'2025-10-04T18:20:00', distanceKm: 32.6, durationSec: 3600+18*60, paceSecPerKm: 120, hrAvg: 138, elevPos: 220, calories: 780 },
  { id:'a3', type:'Course',   dateISO:'2025-10-03T07:15:00', distanceKm: 6.2,  durationSec: 34*60+10,   paceSecPerKm: 330, hrAvg: 149, elevPos: 65,  calories: 410 },
  { id:'a4', type:'Padel',    dateISO:'2025-10-01T20:05:00', distanceKm: 3.1,  durationSec: 70*60,      paceSecPerKm: 0,   hrAvg: 156, elevPos: 10,  calories: 620 },
  { id:'a5', type:'Renfo',    dateISO:'2025-09-30T19:00:00', distanceKm: 0,    durationSec: 40*60,      paceSecPerKm: 0,   hrAvg: 120, elevPos: 0,   calories: 220 },
  { id:'a6', type:'Cyclisme', dateISO:'2025-09-29T17:30:00', distanceKm: 25.4, durationSec: 55*60,      paceSecPerKm: 0,   hrAvg: 130, elevPos: 160, calories: 560 }
];

// ---- Helpers DOM & format
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

// ---- Icônes inline
const Icons = {
  Course:   '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 12h3l3 4 3-8 3 4h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  Cyclisme: '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="6" cy="17" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="17" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 17l6-8 3 4h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  Padel:    '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="9" cy="9" r="4.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12.5 12.5l6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  Renfo:    '<svg viewBox="0 0 24 24" width="18" height="18"><rect x="4" y="10" width="16" height="4" rx="1" fill="currentColor"/></svg>'
};
function iconFor(sport){ return Icons[sport] || Icons.Course; }

// ---- Évolution (couleurs)
const EVOL_THRESHOLDS = { ok: 10, warn: 20 }; // <=10% vert, <=20% jaune, >20% rouge
function setEvolution(baseId, valuePct=0){
  const valEl = document.getElementById(baseId);
  const dotEl = document.getElementById(`${baseId}-dot`);
  if (!valEl || !dotEl) return;
  const sign = valuePct > 0 ? '+' : '';
  valEl.textContent = `${sign}${Math.round(valuePct)}%`;
  const a = Math.abs(valuePct);
  dotEl.classList.remove('dot--ok','dot--warn','dot--risk');
  if (a <= EVOL_THRESHOLDS.ok)      dotEl.classList.add('dot--ok');
  else if (a <= EVOL_THRESHOLDS.warn) dotEl.classList.add('dot--warn');
  else                               dotEl.classList.add('dot--risk');
}

function formatKm(val){
  if (val == null) return '—';
  const n = Number(val);
  if (!Number.isFinite(n)) return '—';
  return `${n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km`;
}


// =======================
// Hydrations par page
// =======================

function hydrateHome(){
  const homeGuard = $('#metric-load');
  if (!homeGuard) return; // pas la page d'accueil

  try{
    const { weekly, lastActivity, sports } = state;

    // Quick cards
    $('#metric-load').textContent = formatKm(weekly.load);
    $('#metric-hours').textContent = formatHoursDecimalToHM(
      typeof weekly.hours === 'number' ? weekly.hours : 0
    );

    // Évolution (démo : 6% / -12%) -> remplace par tes vrais calculs plus tard
    const evolVolumePct    = typeof weekly.evolVolumePct === 'number' ? weekly.evolVolumePct : 6;
    const evolIntensityPct = typeof weekly.evolIntensityPct === 'number' ? weekly.evolIntensityPct : -12;
    setEvolution('evol-vol', evolVolumePct);
    setEvolution('evol-int', evolIntensityPct);

    // Chips sports
    const chips = document.getElementById('sport-chips');
    if (chips && chips.children.length === 0){
      sports.forEach(sp=>{
        const el = document.createElement('button');
        el.className = 'chip'; el.type='button';
        el.innerHTML = `<span class="dot" style="background:${sp.color}"></span>${iconFor(sp.name)} ${sp.name}`;
        chips.appendChild(el);
      });
    }

    // Dernière activité
    $('#last-type').textContent = lastActivity.type;
    $('#last-date').textContent = fmtDate(lastActivity.dateISO);
    $('#last-distance').textContent = lastActivity.distanceKm.toFixed(2) + ' km';
    $('#last-duration').textContent = fmtDur(lastActivity.durationSec);
    $('#last-pace').textContent = fmtPace(lastActivity.paceSecPerKm);
    $('#last-activity').href = `./activity.html?id=${lastActivity.id}`;

  }catch(err){
    console.error('hydrateHome error:', err);
  }
}

function hydrateActivity(){
  const id = new URLSearchParams(location.search).get('id') || 'sample';
  const a = state.activities.find(x=>x.id===id) || state.lastActivity;
  const guard = $('#type');
  if (!guard) return;

  try{
    $('#type').textContent = a.type;
    $('#date').textContent = fmtDate(a.dateISO);
    $('#distance').textContent = a.distanceKm ? a.distanceKm.toFixed(2)+' km' : '—';
    $('#duration').textContent = fmtDur(a.durationSec);
    $('#pace').textContent     = a.paceSecPerKm ? fmtPace(a.paceSecPerKm) : '—';
    $('#hr').textContent       = a.hrAvg ? a.hrAvg + ' bpm' : '—';
    $('#elev').textContent     = a.elevPos ? a.elevPos + ' m' : '—';
    $('#cal').textContent      = a.calories ? a.calories + ' kcal' : '—';

    // Route mini-graph
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

    // Laps
    const laps = $('#laps'); laps.innerHTML = '';
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
  }catch(err){
    console.error('hydrateActivity error:', err);
  }
}

function activityRow(a){
  const d = new Date(a.dateISO).toLocaleString('fr-FR', { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
  const dist = a.distanceKm ? a.distanceKm.toFixed(1)+' km' : '';
  const dur = fmtDur(a.durationSec);
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
  try{
    list.innerHTML = state.activities.map(activityRow).join('');
  }catch(err){
    console.error('hydrateActivities error:', err);
  }
}

function hydrateProfile(){
  const guard = $('#gauge');
  if(!guard) return;
  try{
    const w = state.weekly;
    const readiness = w.readiness || 82;
    $('#gauge').style.setProperty('--p', readiness);
    $('#gauge-val').textContent = readiness + '%';
    $('#p-load').textContent  = formatKm(w.load);
    $('#p-hours').textContent = formatHoursDecimalToHM(typeof w.hours === 'number' ? w.hours : 0);

    const chips = document.getElementById('p-sports');
    if (chips && chips.children.length === 0){
      state.sports.forEach(sp=>{
        const el = document.createElement('span');
        el.className = 'chip';
        el.innerHTML = `<span class="dot" style="background:${sp.color}"></span>${iconFor(sp.name)} ${sp.name}`;
        chips.appendChild(el);
      });
    }
  }catch(err){
    console.error('hydrateProfile error:', err);
  }
}

// ---- Boot
document.addEventListener('DOMContentLoaded', ()=>{
  hydrateHome();
  hydrateActivity();
  hydrateActivities();
  hydrateProfile();
});
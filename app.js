// Minimal data + hydration
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
    { name: "Course", color: "#00b37a" },
    { name: "Cyclisme", color: "#3abff8" },
    { name: "Padel", color: "#f59e0b" },
    { name: "Renfo", color: "#a78bfa" }
  ]
};

function fmtPace(secPerKm){
  const m = Math.floor(secPerKm/60), s = String(Math.round(secPerKm%60)).padStart(2,"0");
  return `${m}:${s}/km`;
}
function fmtDur(sec){
  const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s = sec%60;
  return (h? h+":" : "") + String(m).padStart(2,'0') + ":" + String(s).padStart(2,'0');
}
function fmtDate(iso){
  const d = new Date(iso);
  return d.toLocaleString('fr-FR', { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
}

function hydrateHome(){
  const { weekly, lastActivity, sports } = state;
  const $ = (s)=>document.querySelector(s);
  if($('#metric-load')){
    $('#metric-load').textContent = weekly.load;
    $('#metric-hours').textContent = weekly.hours.toFixed(1);
    $('#metric-readiness').textContent = weekly.readiness + '%';

    const chips = document.getElementById('sport-chips');
    sports.forEach(sp=>{
      const el = document.createElement('button');
      el.className = 'chip'; el.type='button';
      el.innerHTML = `<span class="dot" style="background:${sp.color}"></span>${sp.name}`;
      chips.appendChild(el);
    });

    $('#last-type').textContent = lastActivity.type;
    $('#last-date').textContent = fmtDate(lastActivity.dateISO);
    $('#last-distance').textContent = lastActivity.distanceKm.toFixed(2) + ' km';
    $('#last-duration').textContent = fmtDur(lastActivity.durationSec);
    $('#last-pace').textContent = fmtPace(lastActivity.paceSecPerKm);
    const a = document.getElementById('last-activity'); a.href = `./activity.html?id=${lastActivity.id}`;
  }
}

function hydrateActivity(){
  const id = new URLSearchParams(location.search).get('id') || 'sample';
  const a = state.lastActivity;
  const $ = (s)=>document.querySelector(s);
  if($('#type')){
    $('#type').textContent = a.type;
    $('#date').textContent = fmtDate(a.dateISO);
    $('#distance').textContent = a.distanceKm.toFixed(2)+ ' km';
    $('#duration').textContent = fmtDur(a.durationSec);
    $('#pace').textContent = fmtPace(a.paceSecPerKm);
    $('#hr').textContent = a.hrAvg + ' bpm';
    $('#elev').textContent = a.elevPos + ' m';
    $('#cal').textContent = a.calories + ' kcal';

    // Simple route polyline
    const w=320,h=140;
    const points = a.route.map(([x,y])=>`${x/100*w},${y/100*h}`).join(' ');
    const svg = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#00d08f"/><stop offset="100%" stop-color="#00b37a"/>
        </linearGradient>
      </defs>
      <polyline points="${points}" fill="none" stroke="url(#g)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    document.getElementById('route').innerHTML = svg;

    // Laps
    const laps = document.getElementById('laps');
    const table = document.createElement('div');
    a.laps.forEach(l => {
      const row = document.createElement('div');
      row.style.display='grid'; row.style.gridTemplateColumns='40px 1fr auto'; row.style.gap='10px';
      row.style.padding='8px 0'; row.style.borderBottom='1px solid #242a33';
      row.innerHTML = `<span class="muted">#${l.n}</span><strong>${l.distKm.toFixed(2)} km</strong><span>${fmtDur(l.timeSec)}</span>`;
      table.appendChild(row);
    });
    laps.appendChild(table);
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  hydrateHome();
  hydrateActivity();
});

// --- Inline sport icons (SVG strings) ---
const Icons = {
  Course: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 12h3l3 4 3-8 3 4h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  Cyclisme: '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="6" cy="17" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="17" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 17l6-8 3 4h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  Padel: '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="9" cy="9" r="4.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12.5 12.5l6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  Renfo: '<svg viewBox="0 0 24 24" width="18" height="18"><rect x="4" y="10" width="16" height="4" rx="1" fill="currentColor"/></svg>'
};

state.activities = [
  state.lastActivity,
  { id:'a2', type:'Cyclisme', dateISO:'2025-10-04T18:20:00', distanceKm: 32.6, durationSec: 3600+18*60, paceSecPerKm: 120, hrAvg: 138, elevPos: 220, calories: 780 },
  { id:'a3', type:'Course', dateISO:'2025-10-03T07:15:00', distanceKm: 6.2, durationSec: 34*60+10, paceSecPerKm: 330, hrAvg: 149, elevPos: 65, calories: 410 },
  { id:'a4', type:'Padel', dateISO:'2025-10-01T20:05:00', distanceKm: 3.1, durationSec: 70*60, paceSecPerKm: 0, hrAvg: 156, elevPos: 10, calories: 620 },
  { id:'a5', type:'Renfo', dateISO:'2025-09-30T19:00:00', distanceKm: 0, durationSec: 40*60, paceSecPerKm: 0, hrAvg: 120, elevPos: 0, calories: 220 },
  { id:'a6', type:'Cyclisme', dateISO:'2025-09-29T17:30:00', distanceKm: 25.4, durationSec: 55*60, paceSecPerKm: 0, hrAvg: 130, elevPos: 160, calories: 560 }
];

function iconFor(sport){ return Icons[sport] || Icons['Course']; }

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
  list.innerHTML = state.activities.map(activityRow).join('');
}

function hydrateProfile(){
  const $ = (s)=>document.querySelector(s);
  const w = state.weekly;
  if(document.querySelector('#gauge')){
    const readiness = w.readiness || 82;
    document.querySelector('#gauge').style.setProperty('--p', readiness);
    document.querySelector('#gauge-val').textContent = readiness + '%';
    document.querySelector('#p-load').textContent = w.load;
    document.querySelector('#p-hours').textContent = w.hours.toFixed(1);
    const chips = document.getElementById('p-sports');
    state.sports.forEach(sp=>{
      const el = document.createElement('span');
      el.className = 'chip';
      el.innerHTML = `<span class="dot" style="background:${sp.color}"></span>${iconFor(sp.name)} ${sp.name}`;
      chips.appendChild(el);
    });
  }
}

// Enhance home chips with icons if present
(function enhanceHomeChips(){
  const chips = document.getElementById('sport-chips');
  if(!chips) return;
  const children = Array.from(chips.children);
  children.forEach((el, i)=>{
    const name = state.sports[i]?.name;
    if(!name) return;
    el.innerHTML = `<span class="dot" style="background:${state.sports[i].color}"></span>${iconFor(name)} ${name}`;
  });
})();

// Run page-specific hydrations too
document.addEventListener('DOMContentLoaded', ()=>{
  hydrateActivities();
  hydrateProfile();
});

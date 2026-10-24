import { safeUtmValue, readUtm, classifySource, propagateUtm } from "./acquisition.js?v=20261024-privacy";
import { analyticsConfig } from "./analytics-config.js?v=20261024-privacy";

export const SDK_URL = "https://eu-assets.i.posthog.com/static/1.380.0/array.js";
export const SDK_INTEGRITY = "sha384-OkAZ5oESfzEQoGLu0RgDrWPX37oaUYIxe0S5PLKr1SzTEaTH9G6lHvizeuw6EM/y";
export const CONSENT_KEY = "rockso_audience_consent_v1";
export const SESSION_KEY = "rockso_audience_session_v1";
export const TEST_KEY = "rockso_audience_local_test_v1";
export const CONSENT_VERSION = "2026-10-20.2";
const CONSENT_DURATION = 180 * 24 * 60 * 60 * 1000;
const SESSION_DURATION = 30 * 60 * 1000;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const PAGES = Object.freeze({
  "/": ["home_fr", "fr", "landing_page_viewed"],
  "/index.html": ["home_fr", "fr", "landing_page_viewed"],
  "/index-en.html": ["home_en", "en", "landing_page_viewed"],
  "/demo-login.html": ["early_access_fr", "fr", "early_access_page_viewed"],
  "/demo-login-en.html": ["early_access_en", "en", "early_access_page_viewed"],
});
const LEGAL_PAGES = new Set([
  "/privacy.html", "/privacy-en.html", "/cgu.html", "/terms-en.html",
  "/mentions-legales.html", "/legal-notice-en.html",
  "/account-deletion.html", "/account-deletion-en.html",
]);
const EVENTS = new Set([
  "landing_page_viewed", "early_access_page_viewed", "early_access_submitted", "download_clicked",
]);
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export { safeUtmValue, readUtm } from "./acquisition.js?v=20261024-privacy";
export function isNewSignup(data, error) {
  return !error && data?.ok === true && data?.alreadyRegistered === false;
}

export function downloadPlatform(href, base) {
  if (!href || href.trim().startsWith("#")) return null;
  try {
    const url = new URL(href, base);
    if (url.protocol !== "https:" || url.username || url.password || url.hash) return null;
    if (url.hostname === "apps.apple.com" && /^\/(?:[a-z]{2}\/)?app\/(?:[^/]+\/)?id\d+$/.test(url.pathname)) return "ios";
    if (url.hostname === "testflight.apple.com" && /^\/join\/[a-z0-9]+$/i.test(url.pathname) && !url.search) return "ios";
    if (url.hostname === "play.google.com" && url.pathname === "/store/apps/details" && /^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+$/i.test(url.searchParams.get("id") || "")) return "android";
  } catch { /* Invalid or relative non-download destination. */ }
  return null;
}

// All SDK enrichment is discarded. Rebuild the payload using a strict schema.
export function filterSdkEvent(event, context) {
  if (!context.allowed || !event || !EVENTS.has(event.event) || !UUID.test(context.id || "")) return null;
  const p = event.properties || {};
  const page = Object.values(PAGES).find(value => value[0] === p.page_id);
  if (!page || p.language !== page[1]) return null;
  if (event.event === "landing_page_viewed" && page[2] !== event.event) return null;
  if (event.event.startsWith("early_access_") && page[2] !== "early_access_page_viewed") return null;
  const properties = {
    distinct_id: context.id,
    $process_person_profile: true,
    $geoip_disable: true,
    $ip: null,
    environment: context.environment,
    surface: "landing",
    page_id: page[0],
    language: page[1],
    platform: ["ios", "android", "desktop", "unknown"].includes(p.platform) ? p.platform : "unknown",
  };
  if (context.projectToken) properties.token = context.projectToken;
  for (const key of UTM_KEYS) {
    const value = safeUtmValue(p[key]);
    if (value) properties[key] = value;
  }
  if (["campaign", "organic_search", "social", "referral", "internal", "unknown"].includes(p.traffic_channel) &&
      ["campaign", "google", "bing", "duckduckgo", "linkedin", "instagram", "facebook", "other_referrer", "internal", "unknown"].includes(p.traffic_source)) {
    properties.traffic_channel = p.traffic_channel;
    properties.traffic_source = p.traffic_source;
  }
  if (event.event === "download_clicked") {
    if (!["ios", "android"].includes(p.download_platform) || p.placement !== "footer") return null;
    properties.download_platform = p.download_platform;
    properties.placement = "footer";
  }
  return { event: event.event, uuid: event.uuid, timestamp: event.timestamp, properties };
}

export function sdkOptions(id, beforeSend, signal) {
  return {
    api_host: "https://eu.i.posthog.com",
    ui_host: "https://eu.posthog.com",
    defaults: "2026-05-30",
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    capture_heatmaps: false,
    capture_dead_clicks: false,
    capture_exceptions: false,
    capture_performance: false,
    rageclick: false,
    disable_scroll_properties: true,
    disable_session_recording: true,
    enable_recording_console_log: false,
    disable_surveys: true,
    disable_conversations: true,
    disable_product_tours: true,
    disable_web_experiments: true,
    disable_external_dependency_loading: true,
    advanced_disable_flags: true,
    remote_config_refresh_interval_ms: 0,
    opt_in_site_apps: false,
    person_profiles: "always",
    save_campaign_params: false,
    save_referrer: false,
    persistence: "memory",
    disable_persistence: true,
    cross_subdomain_cookie: false,
    opt_out_capturing_by_default: true,
    consent_persistence_name: "rockso_audience_sdk_consent",
    request_batching: false,
    api_transport: "fetch",
    disable_beacon: true,
    // Version 1.380.0 still reads this name in its transport implementation.
    __preview_disable_beacon: true,
    disable_compression: true,
    debug: false,
    logs: { captureConsoleLogs: false },
    bootstrap: { distinctID: id, isIdentifiedID: false },
    before_send: beforeSend,
    fetch_options: { credentials: "omit", referrerPolicy: "no-referrer", signal },
  };
}

function mountAnalytics() {
  const path = window.location.pathname;
  const page = PAGES[path];
  if (!page && !LEGAL_PAGES.has(path)) return;
  if (window.RocksoAnalytics) return;
  propagateUtm(document, window.location);
  const english = document.documentElement.lang === "en";
  const local = LOCAL_HOSTS.has(window.location.hostname);
  const production = window.location.protocol === "https:" && ["rockso.app", "www.rockso.app"].includes(window.location.hostname);
  const storage = {
    get(type, key) { try { return window[type].getItem(key); } catch { return null; } },
    set(type, key, value) { try { window[type].setItem(key, value); return true; } catch { return false; } },
    remove(type, key) { try { window[type].removeItem(key); } catch { /* Fail closed. */ } },
  };
  const test = local && storage.get("sessionStorage", TEST_KEY) === "enabled";
  const hasInlineToken = /^phc_[a-z0-9_-]{12,196}$/i.test(analyticsConfig.projectToken);
  const configurationUrl = analyticsConfig.configurationUrl === "https://hegtnyarfeoyapobysee.supabase.co/functions/v1/analytics-collect" ? analyticsConfig.configurationUrl : null;
  const productionReady = production && analyticsConfig.enabled === true && (hasInlineToken || !!configurationUrl);
  const ready = test || productionReady;
  let projectToken = analyticsConfig.projectToken;
  let remotelyStopped = false;
  let choice = null;
  let session = null;
  let source = null;
  let sdk = null;
  let sdkPromise = null;
  let controller = null;
  let epoch = 0;
  let pending = [];
  let viewed = false;
  let expiryTimer;
  const testEvents = [];

  function readChoice() {
    try {
      const value = JSON.parse(storage.get("localStorage", CONSENT_KEY));
      if (value?.version === CONSENT_VERSION && typeof value.accepted === "boolean" &&
          Number.isFinite(value.createdAt) && value.createdAt <= Date.now() &&
          value.expiresAt === value.createdAt + CONSENT_DURATION && value.expiresAt > Date.now()) return value;
    } catch { /* Missing or corrupt decision means no consent. */ }
    return null;
  }

  function allowed() {
    const current = readChoice();
    return ready && !remotelyStopped && !!page && choice?.accepted === true && current?.accepted === true;
  }

  function clearSession() {
    session = null;
    source = null;
    storage.remove("sessionStorage", SESSION_KEY);
  }

  function sessionData() {
    if (!allowed()) return null;
    let saved;
    try { saved = JSON.parse(storage.get("sessionStorage", SESSION_KEY)); } catch { /* New visit. */ }
    const now = Date.now();
    if (!session && saved && UUID.test(saved.id || "") && Number.isFinite(saved.updatedAt) && saved.updatedAt <= now && now - saved.updatedAt < SESSION_DURATION) {
      session = { id: saved.id, updatedAt: now, utm: {} };
      for (const key of UTM_KEYS) {
        const value = safeUtmValue(saved.utm?.[key]);
        if (value) session.utm[key] = value;
      }
    }
    if (!session || now - session.updatedAt >= SESSION_DURATION) session = { id: crypto.randomUUID(), updatedAt: now, utm: {} };
    // Read the referrer only inside the consent gate and the separate rollout switch.
    if (analyticsConfig.sourceClassificationEnabled === true && !source)
      source = classifySource(window.location.search, document.referrer, window.location.origin);
    const incoming = readUtm(window.location.search);
    if (Object.keys(incoming).length) session.utm = incoming;
    session.updatedAt = now;
    storage.set("sessionStorage", SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function context() {
    return { allowed: allowed(), id: session?.id, environment: test ? "test" : "production", projectToken: test ? "" : projectToken };
  }

  function stop() {
    clearTimeout(expiryTimer);
    epoch++;
    pending = [];
    viewed = false;
    controller?.abort();
    controller = null;
    if (sdk) {
      sdk.opt_out_capturing({ clear_persistence: true });
      sdk.clear_opt_in_out_capturing();
    }
    clearSession();
    testEvents.length = 0;
  }

  function scheduleExpiry() {
    clearTimeout(expiryTimer);
    const current = readChoice();
    if (!current?.accepted) return;
    expiryTimer = setTimeout(() => {
      if (readChoice()?.accepted) scheduleExpiry();
      else { choice = null; stop(); }
    }, Math.min(current.expiresAt - Date.now() + 1, 2147483647));
  }

  function loadSdk() {
    if (sdkPromise) return sdkPromise;
    sdkPromise = new Promise((resolve, reject) => {
      if (window.posthog?.__loaded) return reject(new Error("An existing PostHog instance cannot be reused."));
      const script = document.createElement("script");
      script.src = SDK_URL;
      script.integrity = SDK_INTEGRITY;
      script.crossOrigin = "anonymous";
      script.referrerPolicy = "no-referrer";
      script.onload = () => resolve(window.posthog);
      script.onerror = () => { sdkPromise = null; script.remove(); reject(new Error("Analytics unavailable.")); };
      document.head.append(script);
    });
    return sdkPromise;
  }

  function platform() {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)) return "ios";
    if (/Android/i.test(navigator.userAgent)) return "android";
    return /Windows|Macintosh|Linux/i.test(navigator.userAgent) ? "desktop" : "unknown";
  }

  function send(event) {
    if (!allowed()) return;
    if (test) {
      const safe = filterSdkEvent(event, context());
      if (safe) {
        testEvents.push(safe);
        window.dispatchEvent(new CustomEvent("rockso:analytics-test-event", { detail: structuredClone(safe) }));
      }
    } else if (sdk && controller && !controller.signal.aborted) {
      const activeController = controller;
      const activeEpoch = epoch;
      void (async () => {
        try {
          // Recheck the existing server switch before every transmission, including
          // on already-open pages. Fail closed; never replay a suppressed event.
          if (configurationUrl) {
            const response = await fetch(configurationUrl, { cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer", signal: activeController.signal });
            const config = response.ok ? await response.json() : null;
            if (epoch !== activeEpoch || !allowed() || activeController.signal.aborted) return;
            if (config?.landing_enabled !== true || config.projectToken !== projectToken || config.api_host !== "https://eu.i.posthog.com") {
              remotelyStopped = true;
              stop();
              return;
            }
          }
          if (epoch !== activeEpoch || !allowed() || activeController.signal.aborted) return;
          const safe = filterSdkEvent(event, context());
          if (!safe) return;
          sdk.capture(event.event, event.properties, { send_instantly: true, transport: "fetch" });
          // Aggregate reference counts only. No visit ID, email, URL or form value.
          if (configurationUrl) {
            const properties = Object.fromEntries(Object.entries(safe.properties).filter(([key]) => ["page_id", "language", "download_platform", "placement", "traffic_channel", "traffic_source", ...UTM_KEYS].includes(key)));
            await fetch(configurationUrl, { method: "POST", headers: { "content-type": "application/json" }, credentials: "omit", referrerPolicy: "no-referrer", signal: activeController.signal,
              body: JSON.stringify({mode:"landing",surface:"landing",consent:true,consent_version:CONSENT_VERSION,events:[{id:event.uuid,event:event.event,platform:safe.properties.platform,properties}]}) });
          }
        } catch {
          if (epoch === activeEpoch) { remotelyStopped = true; stop(); }
        }
      })();
    } else if (pending.length < 20) pending.push(event);
  }

  function record(name, extra = {}) {
    const data = sessionData();
    if (!data) return;
    send({ uuid: crypto.randomUUID(), event: name, timestamp: new Date().toISOString(), properties: {
      page_id: page[0], language: page[1], platform: platform(), ...data.utm, ...(source || {}), ...extra,
    } });
  }

  async function activate() {
    if (!allowed()) return;
    // Never revive an instance whose old retry queue belongs to withdrawn consent.
    // Its fetch signal stays aborted permanently; a new document gets a fresh SDK.
    if (sdk) {
      if (!controller || controller.signal.aborted) window.location.reload();
      return;
    }
    scheduleExpiry();
    const data = sessionData();
    if (!data) return;
    const activeEpoch = epoch;
    if (!viewed) { viewed = true; record(page[2]); }
    if (test) return;
    try {
      controller?.abort();
      controller = new AbortController();
      if (!projectToken && configurationUrl) {
        const response = await fetch(configurationUrl, { cache:"no-store", credentials:"omit", referrerPolicy:"no-referrer", signal:controller.signal });
        const config = response.ok ? await response.json() : null;
        if (epoch !== activeEpoch || !allowed()) return;
        if (!config?.landing_enabled || !/^phc_[a-z0-9_-]{12,196}$/i.test(config.projectToken) || config.api_host !== "https://eu.i.posthog.com") throw new Error("Analytics unavailable.");
        projectToken = config.projectToken;
      }
      const instance = sdk || await loadSdk();
      if (epoch !== activeEpoch || !allowed()) return;
      if (sdk) return;
      controller?.abort();
      controller = new AbortController();
      const options = sdkOptions(data.id, event => filterSdkEvent(event, context()), controller.signal);
      sdk = instance.init(projectToken, options);
      sdk.opt_in_capturing({ captureEventName: false });
      const queued = pending;
      pending = [];
      queued.forEach(send);
    } catch { pending = []; viewed = false; /* Analytics must never affect signup or navigation. */ }
  }

  const dialog = document.createElement("dialog");
  dialog.className = "analytics-consent";
  dialog.setAttribute("aria-labelledby", "analytics-consent-title");
  const heading = document.createElement("h2");
  heading.id = "analytics-consent-title";
  heading.textContent = english ? "Privacy preferences" : "Préférences de confidentialité";
  const description = document.createElement("p");
  description.textContent = english
    ? "Optional Analytics with PostHog EU: pages and acquisition sources. Refusing does not affect access."
    : "Analyse facultative avec PostHog EU : pages et sources d’acquisition. Refuser ne change pas l’accès.";
  const text = (fr, en) => english ? en : fr;
  function category(title, brief, values, fixed = false) {
    const row = document.createElement("section");
    row.className = "privacy-category";
    row.setAttribute("aria-label", title);
    const line = document.createElement("div");
    line.className = "privacy-category-line";
    const content = document.createElement("div");
    const name = document.createElement("h3"); name.textContent = title;
    const note = document.createElement("p"); note.textContent = brief;
    content.append(name, note); line.append(content);
    const control = document.createElement("span");
    control.className = "privacy-category-control";
    let input = null;
    if (fixed) control.textContent = text("Toujours actif", "Always on");
    else {
      input = document.createElement("input"); input.type = "checkbox";
      input.className = "privacy-category-switch"; input.setAttribute("role", "switch"); input.setAttribute("aria-label", title);
      control.append(input);
    }
    line.append(control);
    const details = document.createElement("details"), summary = document.createElement("summary");
    summary.textContent = text("En savoir plus", "Learn more") + " — " + title;
    const list = document.createElement("dl");
    const names = [text("Finalités", "Purposes"),text("Données", "Data"),text("Destinataires", "Recipients"),text("Conservation", "Retention"),text("En cas de refus", "If declined")];
    values.forEach((value,index)=>{ const group=document.createElement("div"),dt=document.createElement("dt"),dd=document.createElement("dd");dt.textContent=names[index];dd.textContent=value;group.append(dt,dd);list.append(group); });
    details.append(summary,list); row.append(line,details);
    return {row,input,control};
  }
  const essential = category(text("Nécessaire", "Necessary"), text("Affichage du site, demandes d’inscription et sécurité.", "Site delivery, requested signups and security."), [
    text("Fournir le site et traiter les demandes que vous envoyez. Réutiliser les faits métier déjà enregistrés pour les comptages internes existants.", "Deliver the site and process requests you submit. Reuse existing business facts for existing internal counts."),
    text("Choix de confidentialité, données de la demande envoyée et journaux indispensables. Aucun parcours facultatif ni mesure d’audience non qualifiée n’est ajouté à cette catégorie.", "Privacy choices, submitted request data and indispensable logs. No optional journeys or unqualified audience measurement are added to this category."),
    text("AIMS Corp., hébergement et Supabase ; prestataires de notification pour les demandes, selon la politique.", "AIMS Corp., hosting and Supabase; notification providers for requests as described in the policy."),
    text("Durées propres à chaque traitement dans la politique. Votre choix de mesure est conservé 180 jours dans ce navigateur.", "Processing-specific periods in the policy. Your measurement choice is kept for 180 days in this browser."),
    text("Toujours actif. Refuser les options n’empêche pas d’utiliser le site ou d’envoyer une demande, et ne supprime pas les demandes déjà reçues.", "Always on. Rejecting optional choices does not prevent site use or submitting a request, and does not delete requests already received.")
  ], true).row;
  const analysis = category(text("Analyse", "Analytics"), text("Comprendre les pages consultées et l’acquisition, après votre accord.", "Understand viewed pages and acquisition after your permission."), [
    text("Mesurer pages, sources d’acquisition UTM, confirmations d’inscription et clics sur de vrais téléchargements, sans publicité ni profilage publicitaire.", "Measure pages, UTM acquisition sources, signup confirmations and genuine download clicks, without advertising or advertising profiling."),
    text("Quatre événements explicites, plateforme et identifiant aléatoire de visite. Aucun e-mail, contenu de formulaire, donnée sportive ou de santé, ni URL complète.", "Four explicit events, platform and random visit identifier. No email, form contents, sports or health data, or full URLs."),
    text("AIMS Corp., Supabase et PostHog Inc. (projet EU), selon les garanties de transfert décrites dans la politique.", "AIMS Corp., Supabase and PostHog Inc. (EU project), with transfer safeguards described in the policy."),
    text("Choix : 180 jours ; identifiant : 30 minutes d’inactivité dans cet onglet ; compteurs Supabase : 12 mois ; cible PostHog : 12 mois, sans garantie de purge automatique.", "Choice: 180 days; identifier: 30 minutes idle in this tab; Supabase counters: 12 months; PostHog target: 12 months, without automatic deletion guaranteed."),
    text("Aucun SDK ni événement PostHog, aucun compteur facultatif avant accord. Le retrait arrête les futurs envois ; l’effacement des données déjà reçues se demande séparément.", "No PostHog SDK or events, and no optional counters before permission. Withdrawal stops future sends; erasure of already received data is requested separately.")
  ]);
  const label = analysis.row, toggle = analysis.input;
  const perf = category(text("Performance", "Performance"), text("Aucune mesure active — option indisponible pour le moment.", "No measurement active — option currently unavailable."), [
    text("Mesures techniques complémentaires distinctes des parcours, si elles sont proposées plus tard.", "Additional technical measurements separate from journeys, if offered later."),
    text("Aucune donnée collectée dans cette catégorie.", "No data collected in this category."),
    text("Aucun destinataire pour cette catégorie inactive.", "No recipient for this inactive category."),
    text("Aucune donnée à conserver. Une future activation exigera une information et un choix propres.", "No data to retain. Future activation will require its own information and choice."),
    text("Aucun effet sur Analyse ou sur l’accès au site.", "No effect on Analytics or website access.")
  ]);
  perf.input.disabled = true;
  const unavailable = document.createElement("small"); unavailable.textContent = text("Aucune mesure active", "No measurement active"); perf.control.append(unavailable);
  const performance = perf.row;
  const details = document.createElement("p");
  details.className = "privacy-category-help";
  details.textContent = text("Ces boutons concernent uniquement les options de mesure disponibles, jamais l’IA externe. Vous pouvez retirer votre accord à tout moment dans ces préférences. Après un refus, les opérations demandées et leurs journaux nécessaires restent actifs. Accès et effacement : support@rockso.app. ", "These buttons affect available measurement options only, never external AI. You can withdraw consent at any time in these preferences. After refusal, requested operations and their necessary logs remain active. Access and erasure: support@rockso.app. ");
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  const information = document.createElement("a");
  information.href = english ? "privacy-en.html#website-analytics" : "privacy.html#site-analytics";
  information.textContent = english ? "Privacy, storage and withdrawal" : "Confidentialité, stockage et retrait";
  const actions = document.createElement("div");
  actions.className = "analytics-consent-actions";
  const accept = document.createElement("button");
  accept.type = "button";
  accept.textContent = english ? "Accept all" : "Tout accepter";
  const refuse = document.createElement("button");
  refuse.type = "button";
  refuse.textContent = english ? "Reject all" : "Tout refuser";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "analytics-consent-close";
  close.textContent = english ? "Close" : "Fermer";
  actions.append(accept, refuse);
  details.append(information);
  dialog.append(heading, description, essential, label, performance, status, actions, details, close);
  document.body.append(dialog);
  let previousFocus;
  const policySection = document.getElementById(english ? "website-analytics" : "site-analytics");
  let policyPanel = null;
  if (policySection && /\/privacy(?:-en)?\.html$/.test(window.location.pathname)) {
    policyPanel = document.createElement("section");
    policyPanel.id = "audience-preferences";
    policyPanel.className = "audience-settings";
    policyPanel.tabIndex = -1;
    policyPanel.setAttribute("aria-labelledby", heading.id);
    // Deliberate, inline privacy settings, not another automatic popup.
    policyPanel.append(heading, description, essential, label, performance, status, actions, details);
    const back = document.createElement("a");
    const target = new URL(english ? "index-en.html" : "index.html", window.location.href);
    for (const [key, value] of Object.entries(readUtm(window.location.search))) target.searchParams.set(key, value);
    back.href = target.href;
    back.textContent = english ? "Return to home" : "Retour à l’accueil";
    policyPanel.append(back);
    policySection.prepend(policyPanel);
    dialog.remove();
  }

  function updatePreferenceStatus() {
    accept.disabled = !ready;
    const current = readChoice();
    toggle.checked = current?.accepted === true;
    toggle.disabled = !ready;
    status.textContent = !ready
      ? (english ? "Audience measurement is currently disabled." : "La mesure d’audience est actuellement désactivée.")
      : test
        ? (english ? "Local test: events stay in this browser. Nothing is sent to PostHog." : "Test local : les événements restent dans ce navigateur. Aucun envoi à PostHog.")
        : current?.accepted === true
          ? (english ? "Current choice: accepted. You can withdraw by choosing Refuse." : "Choix actuel : accepté. Pour retirer votre accord, choisissez Refuser.")
          : (english ? "Without your agreement, no audience measurement takes place." : "Sans votre accord, aucune mesure d’audience n’est effectuée.");
  }

  function openPreferences() {
    updatePreferenceStatus();
    if (policyPanel) {
      policyPanel.scrollIntoView({ block: "center" });
      policyPanel.focus({ preventScroll: true });
      return;
    }
    previousFocus = document.activeElement;
    if (!dialog.open) dialog.show();
    // Banner blockers can hide this element after it opens. A non-modal
    // dialog never makes the rest of the site inert in that case.
    accept.focus({ preventScroll: true });
  }

  function decide(accepted) {
    const now = Date.now();
    const next = { version: CONSENT_VERSION, accepted, createdAt: now, expiresAt: now + CONSENT_DURATION };
    if (accepted && !ready) return;
    const saved = storage.set("localStorage", CONSENT_KEY, JSON.stringify(next));
    if (accepted && !saved) {
      status.textContent = english ? "Your choice could not be saved. Audience measurement remains disabled." : "Votre choix n’a pas pu être enregistré. La mesure d’audience reste désactivée.";
      return;
    }
    if (!accepted && !saved) storage.remove("localStorage", CONSENT_KEY);
    choice = next;
    if (accepted) activate(); else stop();
    dialog.close();
    updatePreferenceStatus();
  }
  accept.addEventListener("click", () => decide(true));
  refuse.addEventListener("click", () => decide(false));
  toggle.addEventListener("change", () => decide(toggle.checked));
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => previousFocus?.focus());
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && dialog.open) dialog.close();
  });
  document.querySelectorAll("[data-analytics-preferences]").forEach(button => {
    button.hidden = false;
    button.addEventListener("click", () => {
      if (policyPanel) { openPreferences(); return; }
      const target = new URL(english ? "privacy-en.html" : "privacy.html", window.location.href);
      target.hash = "audience-preferences";
      for (const [key, value] of Object.entries(readUtm(window.location.search))) target.searchParams.set(key, value);
      window.location.assign(target.href);
    });
  });

  window.addEventListener("storage", event => {
    if (event.key !== CONSENT_KEY && event.key !== null) return;
    choice = readChoice();
    if (choice?.accepted === true) activate(); else stop();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && choice?.accepted && !readChoice()?.accepted) { choice = null; stop(); }
  });
  window.addEventListener("rockso:early-access-confirmed", () => {
    if (page?.[2] === "early_access_page_viewed") record("early_access_submitted");
  });
  document.addEventListener("click", event => {
    if (!allowed() || event.defaultPrevented || event.button !== 0) return;
    const link = event.target.closest?.("a[data-analytics-download]");
    if (!link || link.dataset.analyticsPlacement !== "footer") return;
    const destination = downloadPlatform(link.getAttribute("href"), window.location.href);
    if (destination) record("download_clicked", { download_platform: destination, placement: "footer" });
  });

  window.RocksoAnalytics = Object.freeze({
    openPreferences,
    enableTestMode() {
      if (!local) return false;
      storage.set("sessionStorage", TEST_KEY, "enabled");
      window.location.reload();
      return true;
    },
    disableTestMode() {
      if (!local) return false;
      stop();
      storage.remove("sessionStorage", TEST_KEY);
      window.location.reload();
      return true;
    },
    getTestEvents() { return test ? structuredClone(testEvents) : []; },
  });
  if (policyPanel) {
    updatePreferenceStatus();
    if (window.location.hash === "#audience-preferences") openPreferences();
  }
  choice = readChoice();
  if (choice?.accepted === true) activate();
  else {
    clearSession();
    if (ready && page && !choice) openPreferences();
  }
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountAnalytics, { once: true });
  else mountAnalytics();
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
// UTM values are campaign slugs, never arbitrary text. This rejects common PII
// and token formats; it cannot decide whether an otherwise valid slug is a name.
export function safeUtmValue(value) {
  if (typeof value !== "string" || value.length > 64 || !/^[a-z][a-z0-9_-]*$/i.test(value)) return null;
  const normalized = value.toLowerCase();
  if (/\d{7}|[a-f0-9]{24}|[a-z0-9]{40}/i.test(normalized)) return null;
  if ((normalized.match(/\d/g) || []).length > 10) return null;
  if (normalized === "email") return normalized; // Standard marketing channel, not an address.
  if (/(^|[-_])(email|mail|phone|tel|mobile|token|jwt|password|secret|auth|userid|user_id|patient|medical|health|diagnosis|injury|blessure|sante|hrv|rpe|gps)([-_]|$)/i.test(normalized)) return null;
  if (/^[a-f0-9]{8}-[a-f0-9-]{27}$/i.test(normalized)) return null;
  return normalized;
}

export function readUtm(search) {
  const params = new URLSearchParams(search);
  if ([...params.keys()].some(key => /^(email|e-mail|phone|token|token_hash|access_token|refresh_token|code|state|password|authorization)$/i.test(key))) return {};
  const output = {};
  for (const key of UTM_KEYS) {
    const values = params.getAll(key);
    if (!values.length) continue;
    // Reject the whole incoming attribution on duplicates or suspicious values.
    if (values.length !== 1 || !safeUtmValue(values[0])) return {};
    output[key] = safeUtmValue(values[0]);
  }
  return output;
}


// A bounded channel only; never retain the raw URL, path, query or fragment.
export function classifySource(search, referrer, origin) {
  const utm = readUtm(search);
  if (utm.utm_source) return { traffic_channel: "campaign", traffic_source: "campaign" };
  if (!referrer) return { traffic_channel: "unknown", traffic_source: "unknown" };
  try {
    const url = new URL(referrer);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new Error();
    if (url.origin === origin) return { traffic_channel: "internal", traffic_source: "internal" };
    const host = url.hostname.toLowerCase();
    const known = [
      [/^(?:www\.)?google\.(?:com|fr|ca|co\.uk|de|es|it|be|ch)$/, "organic_search", "google"],
      [/^(?:www\.)?bing\.com$/, "organic_search", "bing"],
      [/^(?:www\.)?duckduckgo\.com$/, "organic_search", "duckduckgo"],
      [/^(?:(?:www|m)\.)?linkedin\.com$|^lnkd\.in$/, "social", "linkedin"],
      [/^(?:(?:www|l|m)\.)?instagram\.com$/, "social", "instagram"],
      [/^(?:(?:www|m|l|lm)\.)?facebook\.com$|^fb\.com$/, "social", "facebook"],
    ];
    for (const [pattern, channel, source] of known) if (pattern.test(host)) return { traffic_channel: channel, traffic_source: source };
    return { traffic_channel: "referral", traffic_source: "other_referrer" };
  } catch { return { traffic_channel: "unknown", traffic_source: "unknown" }; }
}

// Link decoration only: no request, persistence, identifier or behavior record.
// Existing target UTMs take precedence; OAuth, external and legal links excluded.
export function propagateUtm(document, location) {
  const utm = readUtm(location.search);
  if (!Object.keys(utm).length) return;
  const paths = new Set(["/", "/index.html", "/index-en.html", "/demo-login.html", "/demo-login-en.html"]);
  if (!paths.has(location.pathname)) return;
  for (const link of document.querySelectorAll("a[href]")) {
    try {
      const raw = link.getAttribute("href");
      if (!raw || raw.startsWith("#")) continue;
      const url = new URL(raw, location.href);
      if (url.origin !== location.origin || !paths.has(url.pathname)) continue;
      if ([...url.searchParams.keys()].some(key => key.startsWith("utm_") || /^(email|token|code|state|password)$/i.test(key))) continue;
      for (const [key, value] of Object.entries(utm)) url.searchParams.set(key, value);
      link.href = url.href;
    } catch { /* An invalid link is left untouched. */ }
  }
}

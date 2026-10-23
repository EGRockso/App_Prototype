// Public endpoints only; the Project API Key is configured in Supabase secrets.
// Collection also requires consent and the server-side landing_enabled switch.
export const analyticsConfig = Object.freeze({
  enabled: true,
  minimalEnabled: false,
  // Prepared, not active: requires qualified SQL and updated purpose information.
  sourceClassificationEnabled: false,
  projectToken: "",
  configurationUrl: "https://hegtnyarfeoyapobysee.supabase.co/functions/v1/analytics-collect",
});

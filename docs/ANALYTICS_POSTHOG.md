# Rockso public website — PostHog EU preparation

Date: 20 October 2026. Scope: the public website and its waitlist-notification function. The owner authorized production publication of the website and notification minimization; PostHog collection remains disabled and is not part of that activation approval.

## Mise à jour du 28 octobre 2026

Les sections historiques ci-dessous décrivent la préparation initiale du 20 octobre. En production, les quatre événements de base sont désormais activés sous consentement ; la clé publique est fournie par le collecteur Supabase, les profils strictement pseudonymes permettent la procédure d’effacement. La mesure minimale et les référents restent désactivés. Les deux événements supplémentaires de boutons/sections sont préparés mais désactivés ; voir le complément du 28 octobre dans `ANALYTICS_FINALISATION_2026_10_23.md` pour le contrat et la procédure sélective.

## Activation status

The committed default in `assets/analytics-config.js` is **disabled**, with an empty project token. There is no invented token, private key, second project, or automatic fallback to a production token.

A real EU public project token must be configured separately. Only after the blockers below are resolved and the owner explicitly approves **Analytics activation** may `enabled` be set to `true`. Publishing the website with the configuration disabled is a separate, now-authorized action. GitHub Pages serves static JavaScript: a `.env` file does not configure this module at runtime.

Production requires HTTPS and exactly `rockso.app` or `www.rockso.app`. Other origins remain disabled. The local test flag is ignored on production origins; URL parameters cannot enable test mode or collection.

## Files and events

`assets/analytics.js` centralizes consent, attribution, SDK loading, schema filtering and explicit events. `assets/analytics-consent.css` supplies the FR/EN preference dialog. Both home pages, both waitlist forms and eight legal pages load the module. Legal pages expose preferences but emit no page events and do not load the SDK.

| Event | Trigger |
| --- | --- |
| `landing_page_viewed` | French or English home page, once per consent episode in the document |
| `early_access_page_viewed` | French or English waitlist form, once per consent episode in the document |
| `early_access_submitted` | New registration confirmed by the actual Supabase response |
| `download_clicked` | Explicitly marked footer link to a valid HTTPS Apple App Store, TestFlight or Google Play destination |

The store badges still have `href="#"`; they produce **no download event**. Real product destinations must be supplied and reviewed separately. This measures clicks, not completed downloads or installations.

OAuth routes, beta invitations, old home pages, `demo/`, `demo-app.html`, `app-demo/`, Coach and the mobile application are outside the integration. A pathname allowlist also prevents activation if the module is accidentally included on an excluded page.

## Supabase contract verified in source

Source: `Rockso_Mobile_Prototype/supabase/functions/request-beta-access/index.ts`, read without modification on 20 October 2026.

- New prospect: HTTP 200, `{ "ok": true, "alreadyRegistered": false }`, after successful insertion into `prospects` with status `pending`.
- Existing email, including a concurrent unique-constraint conflict: HTTP 200, `{ "ok": true, "alreadyRegistered": true }`.
- Invalid JSON, email or role: HTTP 400, `{ "ok": false, "error": "…" }`.
- Missing environment or database failure: HTTP 500, `{ "ok": false, "error": "…" }`.
- Unsupported method: HTTP 405. OPTIONS handles CORS.
- Notification failures are logged independently and do not undo the saved prospect.

The form hook dispatches a signal with **no detail/payload** only when `ok === true` and `alreadyRegistered === false`, after its existing error check. Endpoint, business payload, messages, reset and error behavior remain unchanged. The existing UI's treatment of malformed HTTP-success bodies is deliberately unchanged; those bodies emit no conversion. Before the local notification-minimization change on 20 October 2026, a read-only API download of the deployed function was byte-identical to the then-current local source (SHA-256 `76c4fb56c35bd062424b0a43714d64bdd3f86a1f8b2abcda9ef20625edf12c81`). No function invocation, real signup or notification was performed for this verification.

## Waitlist notifications — verified without changing their behavior

The owner's stated purpose is internal notification of new waitlist registrations so the requests can be processed. After a new prospect is saved, the function attempts all configured notification channels concurrently, rather than using one as a fallback for another.

Read-only inspection of production secret **names only** on 20 October 2026 established the following **pre-minimization deployed behavior**. The code changes described below are local and have not replaced that deployed version:

| Channel | Configuration | Data / recipients in the deployed source |
| --- | --- | --- |
| Discord | `DISCORD_WEBHOOK_URL` present | Full visitor email, optional role and organisation, locale, static form source, notification timestamp; delivered to the configured Discord destination |
| Resend | `RESEND_API_KEY` present; no `BETA_ACCESS_NOTIFICATION_EMAIL_TO` override | Notification to the source default `etienne@rockso.app`; full visitor email in both subject and body, optional role and organisation, locale and static form source; Resend and the operator's receiving email provider process the message |
| Additional webhook | `BETA_ACCESS_NOTIFICATION_WEBHOOK_URL` absent | Not configured; if added later, its recipient must be reviewed and disclosed before use. Its code would send the same prospect payload plus event name and timestamp |

Secret values, Discord channel membership and actual delivery were not inspected. Presence of configuration is not proof that a particular message was delivered. The source still uses its default sender because no sender override is configured. No notification goes to the visitor, creates an account, verifies their email or admits them to the beta. No notification payload is sent to PostHog.

An offline execution of the downloaded notification functions with in-memory `fetch` stubs verified these two configured sends, the five signup fields, the email in the subject and the default recipient. It made no network request and did not call the database or the deployed endpoint.

The FR/EN policies describe the internal notification purpose and providers separately from voluntary participation in the Discord community and optional PostHog consent. Their local draft now describes the minimized payload below; publish it together with the backend update so it matches effective processing.

### Approved minimization — deployed on 20 October 2026

The owner approved removing the visitor email from the subject and keeping secondary signup metadata in Supabase. The deployed backend now projects a notification payload containing **only `email`**, before dispatching to any notification channel. Discord keeps one Email field; Resend uses a fixed waitlist subject and keeps the email only in the body. The optional webhook, still not configured, would also receive only the email inside its existing event/timestamp envelope. No role, organisation, locale or form source is duplicated in alerts.

All signup fields remain unchanged in the Supabase insert. Notification channels, configured recipients/sender, parallel attempts, duplicate handling and success/error contract remain intact. No migration, new notification provider or PostHog activation is included. The isolated backend fix was merged in PR #23 (commit `08013347bdbcdacfa75711f344c7239db8f46277`) and deployed as function version 77, ACTIVE, with JWT verification still disabled as before. A fresh API download matched the tested source byte-for-byte (SHA-256 `e5881f52c422467efe18a7afbc6bcad1731800815fe32c2ae8bb7a041b19a4dd`). No real signup or notification was used to test the deployment. The old pre-minimization source hash above remains historical evidence, not a claim of parity with the newly edited local source.

The FR/EN policy wording is updated accordingly for website publication. No new analytics purpose or SDK setting is introduced, so the Analytics information version remains `2026-10-20.2`; health/AI versions remain intact. The backend minimization was deployed before publication of these notification disclosures, following the owner’s explicit approval.

Regression tests use the real Edge handler with database and network stubs to check stored signup metadata, minimized payloads for all three channels, fixed subject, default/custom recipients, existing/concurrent duplicate cases, invalid requests, database errors and notification-failure tolerance. No visitor email or real credential is used in these fixtures. Nine targeted Jest cases pass (`node node_modules/jest/bin/jest.js tests/services/requestBetaAccessNotifications.spec.ts --runInBand` in `Rockso_Mobile_Prototype`), along with Deno type-check/format, targeted ESLint/Prettier and static FR/EN policy link checks. The sanitized report records this local change separately from the earlier deployed-source audit.

## Consent and local storage

The SDK is not even requested before valid consent. Closing/Escape does not accept. Acceptance and refusal use the same button style and level. Both decisions expire after 180 days, using the same versioned record. A missing, corrupt, outdated or unwriteable acceptance fails closed.

The current SDK/configuration is inactive by default. In that state the preference dialog reports that audience measurement is disabled and cannot record a new acceptance.

| Storage | Purpose | Lifetime |
| --- | --- | --- |
| localStorage `rockso_audience_consent_v1` | Choice, information version, choice date and expiry; essential consent preference | Choice valid for 180 days for both choices; expired record may remain until overwritten or cleared, without authorizing collection |
| sessionStorage `rockso_audience_session_v1` | Random UUIDv4 and validated campaign fields, only after acceptance | Logical expiry after 30 minutes of inactivity; removed on withdrawal; normally ends with the tab |
| sessionStorage `rockso_audience_local_test_v1` | Explicit local development test switch | Until disabled or the local tab session ends; ignored in production |
| SDK consent state | SDK's opted-in/out state, using a dedicated consent persistence name | Created only after acceptance; cleared upon withdrawal |
| SDK analytics state | Page memory only; SDK disk persistence disabled | Document lifetime |

No shared domain cookie or web/mobile/Coach identity is configured. `www` and apex origins have independent consent. Withdrawal aborts the active fetch signal, drops pending application events, opts out the SDK, clears its consent state and removes the tab's audience state. Other open eligible tabs receive the consent storage event and stop too. After withdrawal of an initialized SDK, accepting again refreshes the document rather than reviving that SDK and its retry queue; its old fetch signal remains permanently aborted. Withdrawal does not claim erasure of events already received by the provider.

## Attribution rules and limitations

All five standard fields are supported: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`.

Values must be ASCII campaign slugs starting with a letter, followed only by letters, digits, `_` or `-`, at most 64 characters. They are normalized to lowercase. Reject email/URL punctuation, repeated encoding, phone-like digit runs, UUIDs, long hexadecimal or token-like strings and explicit personal/health/security labels. Duplicate UTM keys or suspicious recognized URL parameters reject the entire incoming attribution. All other query parameters, advertising IDs and referrers are ignored.

A URL containing a valid UTM set replaces the current visit's attribution as a unit; navigating to the form without a new UTM set retains the accepted tab's attribution. No UTM state or pre-consent event history is saved before acceptance. If the visitor leaves the campaign page before accepting, the earlier attribution cannot be reconstructed.

This is **not** a closed campaign allowlist. New campaign slugs do not require code changes. It is also **not a reliable semantic PII detector**: an otherwise valid slug could be a real person's name or a sensitive code. Campaign creators must never put personal or health data in UTM values. If a guarantee covering arbitrary sender input is required, raw campaign labels must not be transmitted; that would require a different attribution design. Arbitrary free text/search terms containing spaces are intentionally rejected instead of collected.

## SDK filtering and audit

Official CDN version: **posthog-js 1.380.0**. The pinned EU asset is loaded after acceptance with `crossOrigin="anonymous"`, `referrerPolicy="no-referrer"` and integrity:

```
sha384-OkAZ5oESfzEQoGLu0RgDrWPX37oaUYIxe0S5PLKr1SzTEaTH9G6lHvizeuw6EM/y
```

Disable autocapture, pageview/pageleave, heatmaps, dead/rage clicks, exceptions, performance, scroll properties, recording, logs, surveys, conversations, product tours, experiments, flags, external dependency loading and automatic campaign/referrer persistence. Never call identify, alias, groups or person-property APIs. Session Replay and heatmaps must also be disabled in the project settings.

`before_send` rejects all event names outside the four-event schema and reconstructs the whole payload. It drops implicit URLs/fragments/referrers, original SDK/account/device/session IDs, raw user agent, OS/browser versions, screen dimensions, `$set`, `$set_once`, advertising IDs and unexpected application fields. Keep only the random visit ID, predefined page/language, coarse platform, validated UTMs, optional download enums, event time/UUID and transport necessities (the real public project token, profile processing disabled, IP/GeoIP suppression flags).

IP suppression flags are **not evidence** that PostHog discards an IP. The SDK source explicitly warns that its legacy `ip` option is ineffective. Network traffic inherently reveals network metadata to the destination. Verify **Discard client IP data** and disable GeoIP enrichment in the project before activation. For the pinned 1.380.0 transport, both the documented beacon switch and its then-current `__preview_disable_beacon` switch are set. No reverse proxy, cookieless server hashing, backend tracing headers or replay fallback is enabled.

The keyless offline SDK audit exercises the **real pinned SDK enrichment method**, then the final filter, without calling SDK init with an invented key. This establishes which implicit properties that SDK version generates and that the filter removes them. It does not attest production SDK initialization, transport or server ingestion.

The same suite contains a full SDK init/capture audit when a real public token is supplied separately through `ROCKSO_POSTHOG_PUBLIC_KEY`. Browser requests are still intercepted locally, including the EU SDK asset and all capture requests, so that audit never ingests events into the production project.

## Running checks

Node.js 22+ and an existing Playwright installation are required; no dependency is added to this static site.

```sh
# Download the exact official SDK into temporary storage for the offline audit.
curl -fLsS https://eu-assets.i.posthog.com/static/1.380.0/array.js -o /private/tmp/rockso-posthog-1.380.0.js
# Set ROCKSO_PLAYWRIGHT_MODULE and ROCKSO_BROWSER_PATH for the local runtime if needed.
ROCKSO_POSTHOG_SDK_PATH=/private/tmp/rockso-posthog-1.380.0.js node scripts/check-analytics.mjs
```

The suite checks the asset integrity, consent/no-consent/refusal/withdrawal, all events, safe and suspicious UTMs, attribution propagation, strict Supabase responses, unchanged business payload, disabled development, missing configuration, legal preference access, excluded routes and real SDK enrichment. It starts and closes its own localhost server. All third-party browser requests are intercepted; Supabase signup responses are simulated.

### Supplying the real public key to the intercepted test

On macOS, copy only the public **Project API Key** (`phc_…`) to the clipboard, then run the following from the repository root with the Playwright/browser environment configured as above:

```sh
ROCKSO_POSTHOG_PUBLIC_KEY="$(/usr/bin/pbpaste)" \
ROCKSO_POSTHOG_SDK_PATH=/private/tmp/rockso-posthog-1.380.0.js \
ROCKSO_ANALYTICS_REPORT=/private/tmp/rockso-analytics-report.json \
node scripts/check-analytics.mjs
```

The key is passed to this process only; do not paste it into a shell command, `.env`, the public configuration or a report. The command history contains the clipboard command, not the expanded key. The runner injects the enabled configuration into an intercepted browser response only; the repository configuration remains disabled with an empty token. Reports contain property **names**, never the key or raw payloads. Replace/clear the clipboard afterward if desired.

The real SDK 1.380.0 recognizes both `HeadlessChrome` and `navigator.webdriver` as bots. The harness simulates an ordinary Chrome visitor using a normal user agent, client-hint brands and `webdriver=false` in the test context. The website's bot filtering is unchanged. Service workers are blocked so they cannot bypass interception. The pinned SDK asset is served from the verified temporary file; `/e/` capture responses are fulfilled locally. No PostHog endpoint is allowed through to the network.

The keyed FR/EN tests inspect the actual JSON transport for all four events, strict Supabase outcomes, all five UTMs, one random visit ID, `$geoip_disable: true`, `$ip: null`, person-profile suppression, absent URL/referrer/device/form properties, absent HTTP Referer/Cookie, and storage cleanup/aborted transport after withdrawal. Runtime SDK options are checked as well as the absence of flags/replay/heatmap/log traffic. Store navigation uses a test fixture intercepted by the harness; the site's `#` badges remain untracked.

These checks prove local initialization and request construction with the supplied key. They deliberately do **not** verify server acceptance, key/project matching, ingestion, server-side transformations or account settings; doing so would require real requests and separate authorization.

Local manual preview: serve the repository over HTTP, open a home page and run `RocksoAnalytics.enableTestMode()` in the browser console. After reload and consent, `RocksoAnalytics.getTestEvents()` shows only safe local events; this mode never loads PostHog or contacts its servers. Use `RocksoAnalytics.disableTestMode()` to disable it. No query-string test override exists.

## Privacy versioning

FR/EN privacy pages contain a separately dated website analytics supplement, version `2026-10-20.2`, matching the consent information version. This replaces the earlier local draft `2026-10-20.1`; an acceptance of that superseded information cannot authorize collection. The existing general privacy reference `2026-10-18.1` remains intact for health/AI agreements; no mobile/Coach agreement or backend publication is changed. Website clarifications cover launch waitlist handling/notifications and distinguish them from audience measurement. Existing mobile usage events stored in Supabase are explicitly separate; no new mobile legal basis, retention rule or consent behavior has been invented or implemented here.

The supplement explicitly identifies preparation/retention work still pending. It must not be presented as a completed configuration or a certification of compliance. Existing authenticated beta/demo processing remains described independently.

## Production blockers and owner's review

1. The owner supplied the **real public EU project token** externally for the successful local intercepted audit. Keep it out of the repository until production configuration is explicitly approved; all private keys remain excluded. Real server acceptance/ingestion has not been tested.
2. The owner confirms a DPA signed by **AIMS Corp.**, EU hosting and **Discard client IP data** enabled. The SDK's outgoing GeoIP suppression is verified. The policies identify PostHog Inc., the signed DPA and possible international transit, access or subprocessing with applicable safeguards. EU storage does not establish that all operations stay in the EU. Restricted access, disabled optional products and actual provider-side enrichment remain part of the approved activation review, not grounds for building a new consent system.
3. The owner has chosen a **12-month target from collection** for website and launch measurement. This is not yet a verified erasure deadline. PostHog Free currently offers a **one-year query window**, not automatic erasure. Profiles now use only the existing random visit pseudonym (`person_profiles: always`, final `$process_person_profile: true`), with no `$set`/`$set_once` or extra person properties. Validate standard profile-plus-event erasure and verified completion on an isolated EU test project before collection. No support response is required; the test cannot prove backup timelines or twelve months of deletion history. No purge system or deletion automation is developed in this change. The policies keep the activation-pending notice and scope the separate 90-day account-backup statement away from website analytics.
4. Review the UTM validation tradeoff and prohibit personal data in campaign naming; a format filter cannot prove that every free slug is non-personal.
5. Review SDK audit output (property names only), legal supplement and the complete local diff. Deployed Supabase source parity is verified as described above; the notification payload is minimized while the signup business contract, channels and recipients remain unchanged.
6. Website and notification deployment are now explicitly approved. **Analytics activation remains separate and unapproved**: keep the token empty and `enabled: false`. After the remaining activation blockers are resolved, obtain explicit approval before enabling collection and running a consented ingestion smoke test. No public form submission should be used for development tests.

## Isolated EU acceptance test

Use `scripts/analytics/test-posthog-isolated.mts` in the mobile/backend repository. See `docs/analytics/POSTHOG_FREE_ERASURE.md` there for the local-only credentials and exact invocation. It checks actual stored profile/event properties, verified asynchronous erasure and an unchanged witness. **Not executed: test-project credentials are missing.** Production remains disabled; an intercepted SDK test is not a successful hosted acceptance test.

## PostHog verification after an approved activation

Use the single EU project. In the event explorer inspect the four names and their properties, with `environment=production`. Local tests do not go there. Check one French and one English visit after consent; confirm refusal generates no requests, actual submission creates exactly one new conversion, existing registration creates none, and hash store badges create no downloads. Check DevTools request bodies, initiators, query strings, fetch referrer policy, local/session storage and cookies. Confirm no replay/heatmap/error/log/flags traffic and only the expected empty-property pseudonymous person profiles. Build trends and the home → form → confirmed signup funnel using predefined page/language/UTM properties. Confirm withdrawal blocks subsequent requests and event retries. Record a sanitized verification report; never export the public token or visitor data into it.

## Local verification result

The initial draft (`2026-10-20.1`) passed 24 analytics checks, including real pinned SDK initialization and all four events in FR/EN with the owner's public key supplied through a process environment variable. All PostHog requests were intercepted locally; zero requests reached PostHog. GeoIP/IP suppression, optional capture switches, final wire properties, identifiers, HTTP referrer, cookies, storage and withdrawal were verified.

After the targeted policy/wording update (`2026-10-20.2`), **22 checks passed**, including the real pinned SDK's keyless enrichment audit and the new test for superseded consent, matching FR/EN information versions, banner purpose/withdrawal text, and layout at 320, 390 and 1280 pixels. No key was read again or used for this text-only update; the full real-key initialization test was not repeated. Static checks also confirmed policy links/anchors, the four event names and the unchanged app policy version. The deployed notification code and configuration were checked read-only, and its payloads were verified with offline stubs. `git diff --check` passed. The existing 238-check responsive result is historical; this update uses the focused policy/banner viewport checks above.

See `ANALYTICS_POSTHOG_TESTS_2026_10_20.json` for the initial SDK report and the separately labelled policy-update result. Local verification performed no real signup, ingestion or notification. The later owner-approved notification deployment is recorded below; PostHog project settings were not changed. The public configuration remains `enabled: false` with an empty token; no purge mechanism was added.

## Primary references checked on 20 October 2026

- https://posthog.com/docs/libraries/js/config
- https://posthog.com/docs/libraries/js/persistence
- https://posthog.com/docs/privacy/data-collection
- https://posthog.com/docs/privacy/data-storage
- https://posthog.com/docs/data/events-retention
- https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/FAQ
- https://posthog.com/dpa
- https://posthog.com/subprocessors
- https://discord.com/privacy
- https://resend.com/legal/privacy-policy

## Production publication approved on 20 October 2026

The owner requested publication of the notifications and public website. The final local checks passed: 9 notification-handler tests, 22 Analytics/consent checks, and 238 page/viewport checks (14 pages, 17 widths). The selected website files contain no configured PostHog token or private key. GitHub Pages publishes `main` from the repository root at `https://rockso.app/`. Unrelated local files and assets are excluded.

The backend release is isolated from in-progress mobile/Coach work in [PR #23](https://github.com/EGRockso/Rockso_Mobile_Prototype/pull/23). Only `request-beta-access` was deployed to Supabase (version 77); no database migration, other function or project setting is part of this publication. Analytics stays disabled while retention/deletion confirmation is pending. No real signup or notification is used for publication tests.

GitHub Actions for the backend PR did not start: GitHub reported failed account payments or an insufficient spending limit (run `39515927633`). The nine local handler tests, Deno type-check and formatting, targeted lint and the prepublication website checks passed. No billing or protection settings were changed and no administrator merge override was used.


## Préparation Analytics produit — 21 octobre 2026 (non déployée)

La clé publique est désormais fournie après consentement par le GET de `analytics-collect`, depuis le secret Supabase `POSTHOG_PROJECT_TOKEN`. Aucune clé ne doit être commitée. `assets/analytics-config.js` prépare le chargement, mais le contrôle serveur `landing_enabled` reste désactivé par défaut. L'endpoint et la migration doivent être livrés avant le site, après autorisation. Les tests interceptent les deux services.

Les quatre événements restent inchangés et portent `surface=landing`. Une copie sans identifiant de visite alimente les compteurs agrégés Supabase après accord. Les inscriptions de référence viennent de `prospects`, pas de l'événement navigateur. Le module `minimal-audience.js` prépare une mesure de pages sans cookies ni identifiant ; `minimalEnabled=false` et le contrôle serveur indépendant empêchent toute collecte avant validation de ce nouveau périmètre. Aucun visiteur unique n'est déduit de ces compteurs.

Préférences et politiques du site conservées ; avant activation, compléter uniquement la mention des copies statistiques dans Supabase (même consentement). La politique applicable aux nouveaux événements Mobile/Coach et à l'éventuel socle minimal doit être validée séparément. Aucun déploiement ni événement réel envoyé pendant cette préparation.


## Production acceptance decision — 21 October 2026

The owner explicitly authorized progressive production collection after the disabled common release. This supersedes the earlier isolated-project prerequisite above: no additional organization is created, and the isolated fixture script must not be used against production. Acceptance uses only the owner's real navigation after explicit consent, followed by actual profile-and-event erasure verification. Neither local interception nor an accepted deletion request proves hosted completion. Minimal collection stays disabled; there is no backfill.

The existing server landing switch is checked without caching before every SDK capture, including on already-open pages. Failure or a disabled switch stops that document, aborts its transport and clears its visit ID; suppressed events are never replayed. Withdrawal is rechecked after the asynchronous switch check. A request already received by PostHog cannot be recalled: stop collection and withdraw locally before the erasure acceptance test. Reload after a remote stop to start a new visit.

The 12-month target remains distinct from the Free query window and is not an automatic erasure guarantee. Production activation and real acceptance results are recorded separately from the historical disabled-release tests.

Local activation verification: 31 browser checks passed on 21 October 2026 with the pinned SDK and externally supplied public key. All PostHog and Supabase browser requests were intercepted. Both a remote stop on an open page and withdrawal while the control request is pending prevent new captures and counter writes. Existing acceptance fixtures use the actual 180-day receipt format. This is not a claim of real production navigation or successful vendor erasure.

Production display correction: a browser banner filter was observed injecting `display: none !important` for `.analytics-consent`. The consent window now uses a non-modal native dialog, explicitly positioned within the viewport, so cosmetic blocking cannot make the site inert. The selector is preserved, the filter is respected and hiding the window never grants consent. Escape dismisses the window. Footer preferences now open deliberate inline settings in the privacy policy (FR/EN), with the same 180-day choice and equal accept/refuse controls. This does not depend on displaying an automatic banner. No SDK or page event is loaded on the legal page; safe UTM campaign labels pass through its return-to-home link without pre-consent storage. No browser protection setting needs to be changed.

Inline preference verification: 34 intercepted browser checks pass, including FR/EN acceptance and withdrawal with `.analytics-consent` hidden, preserved safe UTM, no collection on the policy page and no pre-consent visit storage.


## 24 octobre 2026 — catégories de confidentialité (correction UX)

- Site : Nécessaire toujours actif, Analyse facultative, Performance indisponible selon la décision d’Étienne. Aucun collecteur Performance ni préférence fictive. Chaque ligne expose cinq rubriques repliables ; boutons accepter/refuser égaux et visibles sur petit écran. L’IA externe reste gérée séparément dans le produit.
- La logique de consentement, sa version, ses 180 jours, le retrait et les filtres de données restent inchangés. Le cache des modules/CSS passe à `20261024-privacy`, y compris l’import commun du mode minimal, qui reste désactivé.
- Politique FR/EN : catégories explicitées ; correction ciblée Sentry (pas d’e-mail ajouté par Rockso au contexte utilisateur, état dépendant de la version/configuration native). Les binaires Mobile ne sont pas modifiés par cette publication statique.
- Recette locale : 27 contrôles passent, sans requête réelle PostHog/Supabase ; refus, expiration, retrait, UTM, contrats formulaire, pages exclues, interrupteur Performance désactivé et quinze champs de détails vérifiés. La vérification supplémentaire du SDK réel n’a pas été relancée faute de fichier épinglé/clé dans cette commande ; le SDK et sa configuration sont inchangés. Captures fraîches FR/EN 390 px inspectées, deux boutons immédiatement visibles.
- Publication : correctif uniquement frontend autorisé, base distante et locale 437ebd3, source GitHub Pages main/racine vérifiée avant opération. Aucun SQL, flag, clé ou changement de backend. Résultat hébergé consigné après publication.

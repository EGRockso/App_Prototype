# Cartographie et registre Cloudflare de la vitrine

**Proposition du 26 novembre 2026.** Référence Git et statut général dans le [dossier de décision](README.md). Le proxy s’applique à un hostname : un filtre de tableau de bord sur deux pages n’exclut aucune autre requête de son traitement technique.

## Trois périmètres de données

| Périmètre | Catégories | Qualification |
| --- | --- | --- |
| Traitement technique Cloudflare si proxy | IP de connexion, dates, hôte, méthode, chemin et query string, en-têtes reçus dont User-Agent, Referer, cookies ou Authorization s’ils existent, caractéristiques TLS/réseau ; contenu des requêtes/réponses, cache et signaux de sécurité selon services | Données personnelles possibles avant agrégation. Full (strict) chiffre les deux segments et vérifie l’origine ; Cloudflare termine TLS et peut inspecter le trafic. Une absence de log visible ne démontre pas une absence d’accès ou de traitement |
| Accès Rockso dans Cloudflare | Graphiques agrégés, dimensions/filtres, détails de requêtes et événements de sécurité selon permissions/forfait. Growth rapporte avoir vu IP et User-Agent dans les captures du test | Retour documentaire indirect ; liste exacte des champs/API, utilisateurs habilités, exports et rétentions à relever dans le compte. Ne pas supposer que Free masque toute IP |
| Exploitation statistique Rockso souhaitée | Nombre quotidien de réponses HTML qualifiées par accueil FR/EN, période UTC, version de méthode et état de couverture | Aucun IP, identifiant, query string, UTM, référent, pays, appareil, compte, score individuel ou historique de navigation exporté. Ne pas réutiliser des IP pour dédupliquer ou reconnaître des personnes |

Source TLS : [Full strict](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/). Les catégories de journaux et rôles sont traitées dans [la qualification fournisseur](PRESTATAIRE_TRANSFERTS_CONSERVATION.md).

## Pages et parcours couverts par les hostnames

L’[inventaire](INVENTAIRE_SOURCES.json) répertorie les 154 fichiers suivis de la révision, dont 31 HTML. Un fichier présent n’est pas une preuve de fréquentation ni d’activation métier. Un contrôle JavaScript d’accès n’empêche pas le téléchargement initial du HTML.

| Pages ou chemins | Transit prévisible si proxy | Appels distincts et conséquences |
| --- | --- | --- |
| `/`, `/index.html`, `/index-en.html` | Document, URL complète hors fragment, métadonnées réseau ; UTM éventuellement reçus même si exclus du KPI | CSS, scripts, images et galerie même origine transitent aussi. PostHog ne devient pas indépendant de son consentement |
| `/index-old.html`, `/index-en-old.html` | Anciennes pages encore suivies et potentiellement servies | Exclues du KPI ; statut historique ne signifie pas accès impossible |
| `/demo-login.html`, `/demo-login-en.html` | Formulaires de liste d’attente, malgré le nom « login » | E-mail, rôle et organisation facultatifs, langue, source envoyés directement à `hegtnyarfeoyapobysee.supabase.co/functions/v1/request-beta-access` ; ce POST ne passe pas par le proxy des deux hostnames. Notifications internes existantes hors nouvelle chaîne Cloudflare |
| `/beta-access.html` | Page d’invitation et définition du mot de passe ; paramètres `source`, `type`, `code`, `token_hash`, `token`, `access_token`, `refresh_token` acceptés en query ou fragment | Query reçue par proxy et origine ; fragment non envoyé dans la requête HTTP initiale. Échange de code, OTP, session et mise à jour du mot de passe directement avec Supabase. Le mot de passe saisi n’est pas POSTé à `rockso.app` par ce code ; ne pas prétendre que Cloudflare le reçoit systématiquement |
| `/oauth/{garmin,coros,polar,suunto}/callback/` et leurs `index.html` | Codes OAuth, `state`, erreurs et descriptions dans la query ; le document affiche ces valeurs | Chaque source lit la query puis POSTe à `...supabase.co/functions/v1/oauth-callback`, avec `redirect_url=window.location.href`. Cet appel direct reste hors proxy vitrine. Exclure ces URL du KPI ne retire pas leurs secrets de l’entrée réseau du proxy |
| `/demo-app.html`, `/app-demo/index.html`, `/app-demo/**` | Cadre iframe, HTML Expo, bundle et assets même origine | Bundle compilé contient des références Supabase et Sentry. Leur présence statique ne prouve pas l’exécution ; authentification, télémétrie et appels effectifs restent non vérifiés. Ne pas certifier cette démo « entièrement fictive » ou « sans données personnelles » |
| `/demo/index.html`, `activities.html`, `activity.html`, `profile.html`, `sync.html`, `training-entrainement.html`, `training-quotidien.html`, `training-recuperation.html`, `training-tendance.html` | Pages, scripts et fichiers JSON de démonstration | Pages contrôlent la session via `sbDemo.auth.getUser()` et redirigent vers la liste d’attente en absence de session. Appels Supabase directs ; données présentes dans le navigateur ne traversent pas nécessairement le proxy vitrine |
| `/privacy.html`, `/privacy-en.html`, `/cgu.html`, `/terms-en.html`, `/mentions-legales.html`, `/legal-notice-en.html`, `/account-deletion.html`, `/account-deletion-en.html`, `/docs/privacy-policy.html` | Pages légales et requêtes associées ; la dernière redirige côté document vers la politique EN | Suppression renvoie vers `coach.rockso.app/account/deletion`. La visite de la page vitrine traverse le proxy ; la suite Coach n’est pas ajoutée à ce proxy par ce lot |
| Toute autre URL ou ressource même origine | 404, scans, HTTP redirigé vers HTTPS, HEAD, OPTIONS, fichiers images, polices, PDF, scripts, CSS, JSON, ressources publiques sous `docs/` | Tous hors KPI sauf accueils exactement qualifiés. La visibilité de la ressource et ses règles de cache doivent être distinguées de sa sensibilité |

Références de code à la révision examinée : [liste d’attente](https://github.com/EGRockso/App_Prototype/blob/74ad7df0a1a309e1ce4653a1ab8601ecde00fe39/demo-login.html#L170), [bêta](https://github.com/EGRockso/App_Prototype/blob/74ad7df0a1a309e1ce4653a1ab8601ecde00fe39/beta-access.html#L365), [callback Garmin représentatif](https://github.com/EGRockso/App_Prototype/blob/74ad7df0a1a309e1ce4653a1ab8601ecde00fe39/oauth/garmin/callback/index.html#L114), [iframe](https://github.com/EGRockso/App_Prototype/blob/74ad7df0a1a309e1ce4653a1ab8601ecde00fe39/demo-app.html#L197), [contrôle de session démo](https://github.com/EGRockso/App_Prototype/blob/74ad7df0a1a309e1ce4653a1ab8601ecde00fe39/demo/index.html#L151).

## Ressources et frontières

`assets/` contient feuilles de style, navigation, galerie, acquisition, Analytics, images et badges. `app-demo/` contient également polices et images. CSS peut charger Google Fonts ; certains HTML chargent jsDelivr. Après accord, le module Analytics charge le SDK PostHog depuis son domaine EU et transmet aux endpoints prévus. Ces requêtes tierces ne deviennent pas des requêtes au proxy vitrine. Un Referer ou des cookies de domaine peuvent néanmoins accompagner une requête suivant la politique du navigateur et la configuration réelle : vérifier les en-têtes, ne pas supposer un partage automatique de tous les cookies.

Cloudflare DNS autoritatif reçoit des requêtes DNS et données techniques de résolution, souvent du résolveur récursif : cela ne lui fournit ni le chemin HTML ni la query HTTP en DNS only. Cloudflare n’est pas devenu le registrar par ce seul changement. Les engagements particuliers du résolveur public **1.1.1.1** ne doivent pas être appliqués au DNS autoritatif ou au proxy.

Les mails Workspace/Resend, Coach et PostHog conservent leurs chaînes existantes. Un fournisseur tiers peut déjà utiliser Cloudflare pour ses propres domaines ; cette éventualité ne résulte pas du proxy des deux hostnames et n’est pas auditée ici.

## Registre vitrine préparé

Responsable : AIMS Corp., 941 923 682 RCS Paris, contact `privacy@rockso.app`, adresse postale dans les mentions légales actuelles. Personnes : visiteurs, prospects, invités bêta, utilisateurs de démonstrations et connexions sportives ; des mineurs peuvent consulter la vitrine. Destinataires internes : personnes habilitées à l’exploitation ; aucun accès Growth aux détails individuels requis.

| Entrée | Finalité et opérations | Données et base envisagée | Destinataires, durées, garanties et état |
| --- | --- | --- | --- |
| VIT-CF-DNS | Résolution et sécurité DNS | Nom interrogé, type, date, IP du requérant DNS si reçue ; intérêt légitime sous RGPD | Cloudflare et chaîne applicable ; durées DNS autoritatif à confirmer. DNS déjà déclaré actif ; pas assimilé à HTTP Analytics |
| VIT-CF-TECH | Distribution HTTPS, cache, disponibilité et sécurité du proxy | Données réseau, URL, en-têtes et contenu décrit ci-dessus ; intérêt légitime envisagé, contrat seulement pour une opération réellement nécessaire à une demande contractuelle | Cloudflare, GitHub origine, sous-traitants pertinents ; transfert global, durées par catégorie et contrôle des URL sensibles à finaliser. Proxy désactivé selon déclaration |
| VIT-CF-STAT | Production puis consultation de statistiques de chargements HTML | Comptes par jour/langue, en amont issus de données personnelles ; intérêt légitime candidat, ePrivacy et Québec/Canada à résoudre séparément | Opérateur habilité et futurs agrégats privés ; aucune collecte KPI active. Cible proposée pour copies Rockso : 13 mois glissants puis suppression, réexamen annuel ; pas une durée Cloudflare garantie |

Les garanties communes sont Full (strict), contrôle d’accès avec MFA, absence d’export de logs dans Growth, aucune jointure et minimisation des copies. Les mesures de compte non observées sont des conditions, pas des réalisations. [Durées et transferts](PRESTATAIRE_TRANSFERTS_CONSERVATION.md), [analyses et droits](ANALYSE_JURIDIQUE.md). Le registre n’étend aucune autorisation aux données de santé : si la recette découvre du contenu sensible transmis sur ces chemins, reprendre la qualification correspondante avant GO.

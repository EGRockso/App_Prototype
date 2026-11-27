# Cloudflare contrat transferts et conservation

**26 novembre 2026 — pièces publiques vérifiées, couverture effective du compte à confirmer.** Les preuves à obtenir sont décrites dans [la procédure fondateur](PREUVES_ET_DECISION.md).

## Contrat du compte Free

Le [Self-Serve Subscription Agreement](https://www.cloudflare.com/terms/), daté du 12 septembre 2025, vise les services avec compte, prévoit les services gratuits (§2.6) et incorpore le DPA par référence pour les données personnelles visées au §6.1. Le Free n’est donc pas exclu par principe. Le texte public ne démontre toutefois ni la partie ayant accepté pour ce compte, ni la version et la chaîne de modifications opposables. Ses limitations de responsabilité Free méritent une acceptation consciente ; elles ne suppriment pas les obligations de protection des données.

Le [DPA public](https://www.cloudflare.com/cloudflare-customer-dpa/) affiche **version 6.4, effet au 3 avril 2026**. Il couvre le traitement comme sous-traitant, prévoit instructions, confidentialité, sécurité, assistance aux droits/incidents, suppression ou restitution en fin de service, sous-traitance ultérieure et audit (§2–5, annexe 2). Il contient DPF et CCT, modules 2 ou 3 selon rôle (§6), et des dispositions CBPR/PRP (§7). La liste doit annoncer les nouveaux sous-traitants 30 jours avant leur traitement ; le délai d’objection prévu est de 10 jours (§4.4). L’annexe 1 retient des critères de nécessité/fin du contrat, pas un délai uniforme de purge des logs. **Version publique disponible ne signifie pas version effectivement applicable au compte Rockso.**

L’[Information Security Exhibit](https://www.cloudflare.com/security-exhibit/), effet au 14 février 2026, décrit notamment contrôle d’accès, MFA, chiffrement et surveillance. Il indique son incorporation à l’accord **Enterprise** : ne pas le présenter comme engagement automatiquement acquis au Free. Les engagements de sécurité à opposer au compte doivent être rattachés au contrat réellement applicable et au DPA, pas à la seule présence d’un lien sur le site commercial.

## Rôles et utilisations propres

AIMS Corp. détermine les finalités Rockso. Cloudflare présente les contenus en transit et les **Customer Logs** comme traitements sous-traités, mais revendique d’autres traitements comme responsable distinct, dont des données réseau. Sa politique prévoit aussi création et partage de résultats agrégés non identifiants. La conservation est formulée par critères, sans durée unique de tous les journaux. Source : [politique Cloudflare, §2, 4, 6, 7 et 11](https://www.cloudflare.com/privacypolicy/).

Le [contrat Self-Serve, §2.5.5](https://www.cloudflare.com/terms/) prévoit l’usage de Network Data pour fournir, maintenir, développer et améliorer les services et l’inspection du trafic nécessaire au service ou à la sécurité du réseau. Ces finalités propres ne sont pas les statistiques internes de Rockso. Demander la séparation concrète entre contenu/journaux sous instructions et données dérivées, avec champs, identifiants et durées. Ne pas déduire d’une interdiction de marketing sur les données sous-traitées une interdiction de tous les usages propres. Ne pas appliquer les clauses de marketing des administrateurs Cloudflare aux visiteurs Rockso sans vérifier la catégorie concernée.

La [FAQ RGPD Cloudflare](https://www.cloudflare.com/trust-hub/gdpr/) indique, pour ses services applicatifs principaux, un transit majoritairement sur les serveurs Edge et un traitement des métadonnées aux États-Unis et en Europe. Elle ne chiffre pas précisément toutes les rétentions. Elle ne démontre pas qu’aucune donnée ne soit cachée ou traitée temporairement.

## Cartographie proportionnée des prestataires

| Intervenant | Rôle dans ce lot | Pays et statut |
| --- | --- | --- |
| Cloudflare, Inc. | Fournisseur DNS/proxy/statistiques ; sous-traitant ou responsable distinct suivant opération | Société américaine, réseau mondial ; identité contractuelle du compte et localisation effective à confirmer |
| Sociétés Cloudflare du groupe | Assistance compte/ingénierie potentielle | Liste publique : notamment États-Unis, Royaume-Uni, UE, Canada, Singapour et autres pays ; présence sur liste ne prouve pas accès à Rockso |
| Slack, Zendesk, Salesforce | Sous-traitants publiés pour assistance/gestion du compte | Slack et Salesforce : États-Unis ; Zendesk : hébergement annoncé États-Unis, EEE, Japon, Australie. Ne pas envoyer de logs personnels au support pour ce lot |
| Autres fournisseurs de la liste Cloudflare | Produits spécifiques | Google/Oracle, AWS Email Security, fournisseurs Workers AI/AI Gateway ne sont pas réputés traiter le trafic du proxy Free par le seul fait de figurer sur la liste ; vérifier si ces services sont réellement utilisés |
| GitHub Pages | Origine inchangée, fournisseur direct Rockso | Fournisseur américain déjà déclaré ; ne pas le reclasser en sous-traitant de Cloudflare |
| Supabase, jsDelivr, Google Fonts, PostHog, services de notification | Chaînes directes existantes distinctes | Pas d’extension contractuelle ou d’activation dans ce lot ; voir cartographie des appels |

Source : [liste officielle Cloudflare services](https://www.cloudflare.com/gdpr/subprocessors/cloudflare-services/), indiquant une mise à jour au 1er octobre 2025 lors de la consultation. La liste « professional services » ne remplace pas celle des services courants. Conserver une copie datée et suivre les notifications avant de conclure qu’aucun sous-traitant n’a changé.

## Transferts internationaux

| Flux | Garantie à établir | Conclusion du lot |
| --- | --- | --- |
| AIMS Corp. → Cloudflare, Inc., données européennes | Adéquation DPF seulement si statut actif, entité, données et transfert couverts ; sinon CCT applicables et évaluation requise | Cloudflare déclare le DPF dans ses textes ; fiche active au [registre officiel DPF](https://www.dataprivacyframework.gov/list) non établie individuellement ici. Le registre général n’est pas une preuve de certification Cloudflare |
| Accès/transit/stockage dans les autres pays et sous-traitance | Identifier chaque rôle/destination utile et la garantie propre ; adequation ou CCT et mesures selon cas | Ni DPF américain ni localisation de l’origine ne couvrent automatiquement tout pays et tout accès ultérieur |
| Données relevant du Québec → hors Québec | EFVP, protection adéquate et écrit, si régime applicable | Préparé, non conclu ; un mécanisme européen ne remplace pas l’évaluation Québec |
| Opérations commerciales canadiennes, si LPRPDE applicable | Responsabilité, fins et protection comparable par contrat et mesures | Qualification territoriale et contractuelle à finaliser |

La [Data Localization Suite](https://developers.cloudflare.com/data-localization/) est un supplément payant Enterprise. Ne pas promettre ses frontières de métadonnées ou son déchiffrement régional sur Free. Full (strict) ne rend pas le contenu inaccessible à Cloudflare et ne neutralise pas l’exposition aux lois locales. Si CCT utilisées : analyser données, pays, accès des autorités, recours et mesures réelles ; un chiffrement déchiffrable par le proxy n’est pas une mesure empêchant son accès au clair.

## Conservation par catégorie

| Catégorie | État établi | Pièce ou choix restant |
| --- | --- | --- |
| Analytics adaptatives HTTP/sécurité/DNS | [Annonce officielle du 2 octobre 2026](https://developers.cloudflare.com/changelog/post/2026-10-02-30-days-analytics-on-every-plan/) : au moins 31 jours sur Free/Pro, jusqu’à 30 jours par requête ; autres jeux de données distincts | Relever `settings` de chaque dataset du compte. Ni « au moins » ni fenêtre de consultation ne signifie purge exacte à 31 jours |
| Logs HTTP détaillés, IP, User-Agent, URL/query et événements de sécurité | Durée exacte non démontrée pour Rockso | Préciser rétention interne vs données accessibles, échantillons, copies, purge/sauvegardes, exceptions légales ; blocage si pas de borne ou de critère suffisamment précis pour le risque |
| Données DNS autoritatif | Engagement spécifique non reçu | Ne pas reprendre les 25 heures du résolveur public 1.1.1.1 |
| Contenus en cache | [Comportement documenté](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/) dépend des extensions, en-têtes, statuts et règles ; HTML/JSON non cachés par défaut | Relever règles de zone, TTL et overrides ; pas de « Cache Everything » présumé. Vérifier OAuth/bêta. Bypass cache ne supprime pas le transit |
| Données réseau dérivées et finalités propres | Critères généraux publics | Demander catégories, identifiants conservés, durées maximales ou critères précis et anonymisation réelle |
| Compte administrateur, assistance, audit | Finalités et durées différentes des visites | Relever rétentions et procédure de fin de compte ; ne pas importer ces données dans Growth |
| Cookies de sécurité si présents | [Documentation dédiée](https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/) : par exemple `__cf_bm` expire après 30 min d’inactivité ; autres cookies ont des règles différentes | Vérifier présence, finalité, portée/durée et qualifier séparément ; pas de cookie autorisé par ce dossier |
| Copies Rockso des futurs agrégats | Aucune nouvelle copie exploitée par ce lot | Proposition : 13 mois glissants puis suppression ; conserver seulement jour/langue/nombre et qualité. Revue de l’anonymat avant toute durée plus longue |

## Fonctions pouvant ajouter des traitements

| Fonction à inspecter | Motif et état cible vitrine |
| --- | --- |
| Web Analytics et RUM, Browser Insights | [Configuration officielle](https://developers.cloudflare.com/web-analytics/get-started/) : ajout d’un site proxifié peut activer l’injection automatique. Absence de site ou injection désactivée, aucun beacon ; cela n’est pas la même mesure que HTTP Analytics |
| Zaraz et Tag Setup | [Zaraz](https://developers.cloudflare.com/zaraz/) peut charger outils tiers, pixels et scripts. Aucun outil/injection configuré sur les deux hostnames |
| Bot Fight Mode et JavaScript Detections | [Bot Fight Mode](https://developers.cloudflare.com/bots/get-started/bot-fight-mode/) active automatiquement des détections JS ; ne pas l’activer. Contrôler aussi les réglages hérités et changements automatiques |
| Challenges, Under Attack, Turnstile, règles WAF | Peuvent introduire scripts, cookies ou challenges selon déclenchement ; état précis à qualifier. Ne pas désactiver aveuglément la sécurité pour satisfaire le compteur |
| Always Online, affinité/load balancing, waiting room, règles de débit, produits bots | Cookies possibles suivant service. Seules les fonctions réellement configurées concernent ce dossier ; ni toutes présumées actives ni toutes garanties absentes |
| Workers, Snippets, Transform/Page/Cache Rules et autres réécritures | Relever les routes et règles appliquées à la vitrine, les modifications de contenu ou nouveaux transferts ; aucun ajout dans ce lot |

L’engagement « aucun mécanisme supplémentaire » doit être vérifié sur configuration et, lors d’une future recette autorisée, dans les réponses, cookies et requêtes navigateur, y compris cas de sécurité. Le filtre robots du KPI ne justifie pas l’activation d’un détecteur côté navigateur.

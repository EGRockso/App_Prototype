# Qualification Cloudflare de la vitrine Rockso

**26 novembre 2026, America/Toronto — proposition documentaire pour décision du fondateur. Recommandation : STOP pour la réactivation du proxy.** Le DNS only est l’état déclaré par Étienne ; aucune modification de production n’est incluse. Cette recommandation ne conclut pas à une interdiction générale de Cloudflare Free. Elle constate que les conditions de notre configuration ne sont pas encore toutes démontrées.

## Périmètre et état des preuves

La cible autorisée à l’étude est Cloudflare Free DNS et reverse proxy pour `rockso.app` et `www.rockso.app`, TLS Full (strict), avec GitHub Pages comme origine. Coach, Mobile, Google Workspace, Resend, PostHog et les consentements restent inchangés. `minimalEnabled=false` est vérifié dans la source vitrine ; `minimal_enabled=false` est une contrainte reçue, sans nouvelle lecture du backend hébergé. Aucun KPI n’est ajouté à Growth.

Source applicative de référence : [App_Prototype à 74ad7df0](https://github.com/EGRockso/App_Prototype/tree/74ad7df0a1a309e1ce4653a1ab8601ecde00fe39), HEAD distant lu pour ce lot. GitHub Pages est configuré sur `main`, racine, domaine `rockso.app`, HTTPS imposé, statut `built` à la lecture API. Cette configuration ne prouve pas l’identité octet par octet du site servi. Le checkout vitrine local `5032af12` diffère de cette référence par deux logos et les politiques FR/EN : les politiques distantes ont donc été relues. Les modifications locales étrangères sont préservées. Aucun fichier Mobile ou Coach n’est modifié.

Les conclusions DNS/HTTPS/mail/Coach et la disponibilité des filtres Free sont **reçues du fondateur et de Growth**, pas refaites ici. Le compte Cloudflare et les captures d’origine ne sont pas directement consultés ; les documents publics sont distingués de la preuve contractuelle du compte.

## Dossier maintenable

| Document | Fonction |
| --- | --- |
| [Cartographie et registre](CARTOGRAPHIE_ET_REGISTRE.md) | Flux, 31 pages HTML, ressources et trois périmètres de données |
| [Analyse juridique et évaluations](ANALYSE_JURIDIQUE.md) | RGPD, ePrivacy, Québec/Canada, mises en balance et EFVP préparée |
| [Prestataire et transferts](PRESTATAIRE_TRANSFERTS_CONSERVATION.md) | DPA, sous-traitance, transferts et durées par catégorie |
| [Propositions FR et EN](POLITIQUES_FR_EN.md) | Inserts ciblés pour les politiques existantes, sans publication |
| [Preuves et décision](PREUVES_ET_DECISION.md) | Pièces manquantes, collecte par le fondateur, KPI et exclusion du test |
| [Inventaire vérifiable](INVENTAIRE_SOURCES.json) | Fichiers suivis et blobs Git, empreintes des sources examinées, période de recette |

Ces entrées concernent exclusivement la vitrine. Elles complètent [le suivi Analytics existant](../../ANALYTICS_POSTHOG.md) et [sa finalisation](../../ANALYTICS_FINALISATION_2026_10_23.md), sans créer de backlog général de conformité. Responsable proposé pour la tenue : président d’AIMS Corp., fonction déjà indiquée dans les politiques actuelles ; acceptation et clôture des réserves à dater par lui.

## Décision et classification

| Classe | Élément | Condition de clôture |
| --- | --- | --- |
| Bloquant B1 | DPA du compte et partie contractante non établis | Preuve AIMS Corp./mandat et chaîne contrat → DPA versionné, ou confirmation écrite Cloudflare |
| Bloquant B2 | Données personnelles, URL sensibles et rétentions insuffisamment bornées | Réponse par catégorie et validation de la proportionnalité du proxy sur tous les chemins, pas seulement les accueils |
| Bloquant B3 | Fonctions injectées et usages propres non qualifiés pour le compte | Contrôles de configuration ; qualification ePrivacy effective du traitement statistique et de ses données sources |
| Bloquant B4 | Transferts et évaluations inachevés | Destinations/garanties vérifiées, EFVP si applicable, décision écrite sur l’applicabilité Québec/Canada |
| Bloquant B5 | Information publique ne décrivant pas Cloudflare | Publication séparément autorisée des textes finalisés avant réactivation ; ne pas publier les brouillons incomplets |
| Risque résiduel conditionnel | Bots résiduels, rechargements, cache navigateur et échantillonnage | Libellé de chargements, méthode versionnée, couverture et incertitudes visibles ; aucun indicateur humain implicite |
| Risque résiduel conditionnel | Infrastructure globale, accès d’autorités et limites du Free | Garanties effectives et acceptation motivée du responsable après analyse ; aucun engagement de résidence UE inventé |
| Obligation ultérieure | Exploitation, droits, suivi fournisseur et fin de conservation | Revue annuelle et à chaque changement de service, renouvellement contractuel ou incident ; procédure opérationnelle avant mise en service |
| Porte distincte du futur KPI | Filtres combinés et API non vérifiés, bornes du test inconnues | Qualification hors intégration Growth puis GO distinct ; l’incertitude sur les bornes se traite par exclusion conservatoire |

Même après clôture documentaire, un GO explicite de production reste indispensable. Aucun changement DNS, proxy, script, consentement, hébergement, données ou déploiement n’est autorisé par ce dossier ou sa fusion éventuelle.

## Contrôle Science UX et existant

Le contrôle §6.2 a précédé la rédaction : [point d’entrée](https://github.com/EGRockso/Rockso_Mobile_Prototype/blob/d03a5201a9146b5fb8b2c2c1fbcbd64ed5a3820c/docs/guides/CONTROLE_CONFORMITE_SCIENCE_UX.md), passations Science du 19 octobre et UX/UI du 9 octobre, documents Focus et suivi Analytics relus. Aucun calcul sportif, écran ou conseil n’est transformé.

| Axe | Source et exigence | Réalisation et preuve ou limite |
| --- | --- | --- |
| Acquis | Analytics vitrine, configuration et politiques actuelles | Conservation du consentement PostHog et du mode minimal désactivé ; diff exclusivement `docs/` |
| Calcul et information | Mandat Growth et sources Analytics | Chargements HTML séparés des personnes/sessions ; filtres/API restent à qualifier |
| Benchmark UX | Passation UX, distinction donnée/preuve | Aucun nouveau composant ni graphique ; noms, états inconnus et limites explicites |
| Doublons | Suivi vitrine existant | Un dossier lié à ce suivi ; aucune reprise du registre Mobile/Coach |
| Science | Passation Science, faits attribués et inconnue distincte de zéro | Pas d’usage de données de santé pour ce KPI ; aucune interprétation sportive |
| Cohérence | Mandat, confidentialité, contrôle §6.2 | Source → transit → accès → agrégat → libellé → décision tracés ; l’action production reste fermée |

## Note de changement du lot

26 novembre 2026 : qualification documentaire Cloudflare, registre vitrine, évaluations préparées, textes FR/EN et contrat du futur KPI. Impact utilisateur actuel : aucun changement du site ou de la collecte. Vérifications : référence Git distante, configuration Pages en lecture seule, inventaire des fichiers, consommateurs et appels directs, sources officielles, liens locaux et périmètre de la PR. Limites : aucun compte Cloudflare, réseau navigateur authentifié, effacement fournisseur, test API Cloudflare ou recette hébergée. Pas de version Mobile/Coach créée pour un lot documentaire vitrine.

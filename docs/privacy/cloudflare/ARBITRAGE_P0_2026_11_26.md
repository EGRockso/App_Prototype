# Arbitrage P0 de sécurité pour le proxy Cloudflare actuel

**26 novembre 2026, America/Toronto — GO de sécurité pour une réactivation temporaire bornée, sous les préconditions ciblées ci-dessous.** Aucun risque critique non maîtrisé imposant une migration immédiate n’est démontré par les preuves collectées. La séparation de `beta-access`, le retrait des relais et la réconciliation des entrypoints peuvent être différés à la semaine du 30 novembre.

Ce GO est un **avis de sécurité**, pas une autorisation d’activer : le mandat interdit toujours toute modification de production. Le GO de production reste distinct. La qualification juridique initiale, le fondement statistique et l’information publique ne sont pas déclarés clos par cet avis ; leur statut doit rester explicite dans la décision du pilotage. Le caractère temporaire ne crée aucune exemption réglementaire.

## 1. Base de décision

Uniquement les [preuves du premier audit](INVENTAIRE_SOURCES.json), l’[audit architectural reçu](AUDIT_SEPARATION_VITRINE_2026_11_26.md), ses [empreintes](PREUVES_AUDIT_ARCHITECTURE.json) et les sources déjà téléchargées. Aucun nouveau portail, réglage hébergé, journal de production, lien réel ou test de connexion n’a été interrogé pour cet arbitrage. Les lectures GitHub de ce lot servent uniquement à la publication documentaire et au suivi demandé.

La cible est limitée aux deux hostnames publics, GitHub Pages conservé, Full (strict), sans modification des intégrations ni des mécanismes de consentement. Les validations DNS/TLS précédemment réceptionnées sont réutilisées, sans exiger de les refaire. L’absence d’incident constaté ne prouve pas une sécurité absolue ; elle interdit aussi de présenter comme démontrée une fuite dont nous n’avons aucune preuve.

## 2. Parcours réellement raccordés et URL sensibles

| Parcours | Ce que les preuves établissent | Ce qu’elles n’établissent pas |
| --- | --- | --- |
| Activation bêta | `promote-prospect` v37 est déployée ; son défaut cible `rockso.app/beta-access.html`. En mode custom, le producteur ajoute `token_hash`, `type` et `source` à la query ; une branche de récupération utilise le même mécanisme | Mode/configuration effectivement employés à cet instant, liens actuellement en circulation, durée des OTP et paramètres des modèles Auth non vérifiés. Aucun jeton individuel n’a été collecté |
| Auth bêta standard | Le producteur utilise aussi `inviteUserByEmail` avec cette destination ; la page accepte code, OTP ou paire access/refresh tokens | Le format réellement émis par la configuration Auth hébergée n’est pas connu. La présence d’un parseur de query ne prouve pas qu’un producteur émet des access/refresh tokens en query |
| OAuth sportif | Les applications inspectées utilisent des fonctions connect et les callbacks serveur dédiées. Les anciennes pages de la vitrine lisent des codes/state et les relaient au callback JSON, désormais Polar seulement | Aucun usage actuel de ces pages comme callback partenaire n’est démontré. Les URI privées des partenaires restent inconnues ; cela n’autorise pas leur suppression |
| Liste d’attente | Les CTA FR/EN pointent vers les formulaires. Les données saisies partent directement vers Supabase | Aucun code ou jeton d’authentification émis par ce formulaire vers l’URL de la vitrine n’est identifié |
| Démonstrateurs historiques | Sources publiées et capacités d’authentification existantes, mais pas de lien depuis les accueils courants | Aucun trajet courant de jeton réutilisable dans leur query n’est démontré |

**Conclusion factuelle :** le seul producteur raccordé et documenté capable de placer directement une preuve d’authentification dans une URL `rockso.app` est l’invitation/récupération bêta en mode custom. Nous n’avons pas observé de lien individuel « aujourd’hui » ; l’audit ne transforme pas une capacité de code en événement de production. Pour les access/refresh tokens, l’émission en query reste non démontrée.

## 3. Codes consommables et jetons réutilisables

| Élément | Protection et portée | Qualification P0 |
| --- | --- | --- |
| Code OAuth et state | Les sources reçues prévoient un état aléatoire haché, liaison propriétaire/génération, consommation serveur et expiration ; le helper Suunto/Polar fixe un défaut de 10 minutes. COROS ajoute PKCE. La durée exacte du code du fournisseur n’est pas déduite de celle du state | Pas une session réutilisable en soi. Les protections réduisent le rejeu ; ne pas promettre PKCE pour tous les fournisseurs ni une nouvelle validation SQL réalisée dans ce lot |
| `code` d’authentification bêta | Page appelle `exchangeCodeForSession` | Code d’échange, pas access token. La condition de vérificateur et sa disponibilité dépendent du flux réellement utilisé ; pas de recette de rejeu reçue |
| `token_hash` ou `token` d’invitation/récupération | Produit via `generateLink`, puis présenté à `verifyOtp`. Il s’agit d’une preuve destinée à être consommée pour établir une session, pas d’un anonymat obtenu par hachage | Secret sensible jusqu’à consommation/expiration. Aucun délai chiffré ni contrôle effectif de rejeu OTP n’a été vérifié. Même à usage unique, un voleur peut tenter une première utilisation avant le destinataire ; le risque n’est pas nul |
| `access_token` | Session utilisable pour des requêtes pendant sa validité | Jeton réutilisable ; sa simple lecture par la page n’est pas une fuite démontrée |
| `refresh_token` | Permet de renouveler une session selon la politique Auth | Secret de session plus durable ; `persistSession:false` ou `autoRefreshToken:false` dans le navigateur ne l’invalide pas côté serveur. Aucune émission réelle en query démontrée |

Un fragment `#…` n’est pas transmis dans la requête HTTP initiale, à GitHub Pages comme à Cloudflare. Une query `?…` l’est. Les appels suivants de la page vers Supabase restent sur le domaine Supabase ; le proxy limité à apex/www n’intercepte pas automatiquement leur corps. Les mots de passe et sessions reçues directement de Supabase ne deviennent donc pas, par ce seul ajout, des réponses personnalisées servies par GitHub Pages.

## 4. Ce que change réellement le proxy

**Exposition existante :** une URL bêta avec secret en query est déjà reçue par GitHub Pages et peut rester dans l’historique du navigateur ; le contenu de la page et ses scripts manipulent les paramètres. Les appels d’authentification vont déjà à Supabase, dont la couche Cloudflare a été constatée séparément. Ces faits ne prouvent ni fuite publique ni compromission.

**Exposition supplémentaire :** Cloudflare devient un intermédiaire TLS pour les requêtes de la vitrine et peut traiter leurs URL, en-têtes et contenus. Des détails peuvent aussi devenir consultables par les personnes habilitées dans le compte Cloudflare, selon les fonctions. Full (strict) conserve le chiffrement des deux segments ; il ne cache pas les URL à cet intermédiaire. Le contrat direct, les accès et la rétention doivent donc être traités, même si le fournisseur intervient déjà dans la chaîne Supabase.

Ce changement ajoute un destinataire et une surface administrative ; il ne transforme pas automatiquement le secret en URL publique, ne désactive pas les états mono-usage et ne révèle pas les fragments HTTP. Aucun scénario reçu ne démontre un accès inter-comptes ou une réutilisation non autorisée introduite par le proxy.

## 5. Protections ciblées et dernières actions indispensables

Aucun patch applicatif, migration OAuth, retrait de page ou réconciliation de `main` n’est exigé par ce P0. Avant un éventuel GO de production, seules les confirmations d’exploitation suivantes sont indispensables à la portée de cet avis :

1. **Respect du périmètre sans instrumentation supplémentaire.** Confirmer sur la configuration concernée l’absence d’injection RUM/Web Analytics, Zaraz et détections JS/Bot Fight Mode contraires au mandat. Leur état n’est pas établi dans les preuves reçues. Toute correction de réglage exige une autorisation distincte ; ne pas désactiver aveuglément des protections pour obtenir un compteur.
2. **Accès maîtrisé aux détails.** Réserver les accès opérationnels aux personnes habilitées, avec MFA ; aucune publication de captures, export de logs ou partage de liens contenant des paramètres d’authentification. L’état des habilitations/MFA reste à confirmer. Le KPI ne requiert ni ces détails ni des exports d’IP.
3. **Fenêtre et responsabilité explicites.** Le GO de production doit désigner le responsable, accepter le risque supplémentaire du destinataire et fixer la revue. Fenêtre recommandée : jusqu’au **lundi 30 novembre 2026 à 12 h, America/Toronto**, sans prolongation tacite. Prévoir dans ce GO la conduite à tenir en cas d’incident ; aucun retour DNS automatique n’est installé par le présent lot.

Le scope apex/www et Full (strict) sont déjà réceptionnés : aucun nouvel audit général DNS/mail n’est nécessaire. Pas de Worker, de réécriture ou d’extension de collecte à ajouter pour cette période.

**Mesures utiles mais non réparations magiques :** un bypass de cache sur bêta/OAuth peut servir de défense supplémentaire dans un lot autorisé ; il ne retire pas les URL du transit ou des journaux Cloudflare. Les pages inspectées sont statiques et l’authentification se fait directement auprès de Supabase : aucun cache de réponse HTML contenant les données d’un autre compte n’est démontré. Le bypass, une redirection ou un nettoyage JavaScript ne peuvent donc pas être présentés comme la condition qui résoudrait à eux seuls l’exposition des jetons.

## 6. Risques bloquants et dettes acceptables à court terme

| Catégorie | Décision |
| --- | --- |
| **Risque critique démontré dans les preuves reçues** | Aucun identifié imposant STOP de sécurité ou migration immédiate |
| **Préconditions non attestées** | Absence d’injection supplémentaire et maîtrise des accès : confirmation nécessaire avant de rendre le GO de sécurité effectif. Aucun état favorable n’est inventé |
| **Déclencheurs de STOP si constatés** | Fuite de jetons de session réutilisables vers un destinataire non autorisé ; accès administratif non maîtrisé ou compromission ; réponse personnalisée d’un compte exposée à un autre. Aucun de ces constats n’est établi ici |
| **Risques résiduels temporairement acceptables sous conditions** | Traitement des URL bêta consommables par un intermédiaire supplémentaire ; risque de première utilisation avant le destinataire si un secret est effectivement divulgué ; historique navigateur et rétentions insuffisamment caractérisées. Pas de preuve de divulgation actuelle |
| **Dettes différables de sécurité** | Séparation bêta, retrait des relais/démos, rapprochement des réglages partenaires et des entrypoints. Les écarts de source ne sont pas une compromission : préserver les versions déployées pendant la fenêtre et éviter tout redéploiement depuis un `main` non réconcilié |
| **Qualification indépendante** | DPA applicable, transferts, finalité statistique, information et droits demeurent les réserves du premier audit. Ce ne sont pas, à eux seuls, la preuve d’une faille critique ; ce GO de sécurité ne permet pas de les déclarer conformes ou de les contourner |

Les expérimentations peuvent être cadrées sans présenter le compteur comme certifié. Le GO proxy ne démontre ni les filtres combinés/API ni la qualité du KPI. Pour publier un chiffre officiel, qualifier GET/200/HTML/accueils, cache, robots, échantillonnage et couverture ; exclure le test du 26 novembre selon les règles déjà consignées. Aucun KPI n’est intégré à Growth dans ce lot.

## 7. Backlog Global pour la semaine du 30 novembre

Le suivi canonique figure dans [l’issue Global #2](https://github.com/EGRockso/App_Prototype/issues/2) ; ce tableau en précise l’ordre proposé, sans autoriser sa réalisation.

| Ordre | Résultat attendu |
| --- | --- |
| 1 — revue de la fenêtre | Renouveler ou arrêter explicitement le fonctionnement temporaire, sur état des incidents et réserves restant ouvertes ; pas de prolongation tacite |
| 2 — bêta et Auth | Confirmer émetteurs réels, mode des invitations, TTL et comportement anti-rejeu ; implémenter ensuite la séparation minimale déjà validée, après GO de réalisation |
| 3 — relais et démos | Rapprocher portails/variables et usages opérateur ; retirer de la publication seulement les éléments validés comme historiques, archives conservées |
| 4 — sources déployées | Réconcilier les six entrypoints différents de `main`, avec référence de production et protections préservées ; aucun redéploiement global implicite |
| 5 — fournisseur et statistiques | Fermer la qualification juridique restante et le contrat de mesure ; publier seulement les textes et le KPI explicitement autorisés |

## 8. Contrôle et portée

Les exigences Science/UX/existant restent celles des audits reçus : aucun calcul sportif ou écran modifié, aucun conseil nouveau, protections Auth et parcours acquis conservés, données inconnues non converties en faits. Ce lot requalifie les priorités de sécurité sans effacer les constats historiques.

Deux conclusions doivent rester lisibles ensemble : **la migration architecturale n’est pas un prérequis de sécurité démontré pour une courte fenêtre ; les réglages et autorisations manquants ne sont pas pour autant réputés acquis.** Aucun DNS, OAuth, partenaire, backend, consentement ou déploiement n’a été changé. La publication GitHub contient seulement des documents contrôlés et des empreintes, pas les sources brutes ni les données individuelles utilisées pour l’authentification.

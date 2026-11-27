# Preuves manquantes et décision opérationnelle

**26 novembre 2026 — cadre initial de qualification, antérieur à l’arbitrage P0.** Pour la décision de sécurité à court terme, voir [l’arbitrage P0](ARBITRAGE_P0_2026_11_26.md) ; les réserves juridiques restent distinguées de cet avis. La liste ci-dessous rend la qualification terminable sans demander au fondateur de réauditer tout Rockso. Aucune étape n’exige une nouvelle activation du proxy.

## Pièces à recueillir dans le compte Cloudflare

Le fondateur peut collecter les pièces en lecture seule. Les libellés de navigation peuvent varier ; utiliser Quick search si nécessaire. Conserver date, fuseau, zone, plan et référence du document dans un dossier privé. Ne jamais publier tokens API, cookies de session, liens d’invitation, captures contenant IP/URL personnelles ou identité des visiteurs. Dans Git, conserver seulement références expurgées et empreintes des pièces privées.

1. **Identité et contrat, B1.** Dans le sélecteur de compte, relever le compte propriétaire de la zone `rockso.app`, le plan Free et les coordonnées de l’organisation dans les paramètres du compte/Billing lorsqu’elles sont disponibles. Rapprocher l’adhésion initiale, le courriel de création/acceptation, les avis de modification contractuelle et les éventuels accords conservés par AIMS Corp. Un nom de compte à lui seul ne prouve pas la partie contractante. Depuis Legal/Trust Hub, sauvegarder le Self-Serve Agreement et le DPA effectivement incorporé avec date/version. S’il n’existe aucun historique accessible, demander confirmation écrite à Cloudflare de la partie liée, du DPA/version/date applicable au compte Free et de sa couverture des données Québec/Canada. Ne pas rechercher un bouton « signer DPA » dont l’existence n’est pas établie. Ne rien accepter de nouveau dans ce lot.
2. **Configuration vitrine, B3.** Sans changer les réglages : DNS → Records pour les quatre A apex et CNAME www ; SSL/TLS → Overview ; Web Analytics → Manage site pour chacun des hostnames (pas d’injection RUM) ; Zaraz/Tag Setup (aucun outil) ; Security/Bots (Bot Fight Mode et JS Detections), challenges et Under Attack ; Rules/Workers/Snippets pour les routes et réécritures concernées ; cache pour règles/TTL. Capturer uniquement l’état nécessaire. Ne pas toucher à Coach. L’absence d’une option visible n’est pas une preuve qu’un traitement de sécurité n’existe pas.
3. **Champs, accès et rétention, B2.** Analytics → Traffic/Requests puis Security/Events : relever les catégories de détails exposés et la plage disponible, sans exporter les valeurs individuelles. Relever utilisateurs/permissions du compte et MFA ; demander à Cloudflare les champs de journaux internes, URL/query, IP, identifiants, durées actives, sauvegardes, exceptions, suppression et usages réseau propres. Exiger des réponses séparées des fenêtres de consultation des graphiques. Demander si les secrets d’URL sont masqués seulement à l’écran ou également avant toute conservation/réutilisation.
4. **Transferts et évaluations, B4.** Copier la liste de sous-traitants applicable ; identifier les services effectivement utilisés, pays de support et traitements réseau. Au registre DPF officiel, rechercher Cloudflare, Inc. et conserver sa fiche active, couverture et dates ; si couverture inadéquate/absente, compléter le fondement CCT et l’analyse correspondante. Faire statuer le responsable sur les liens Québec/Canada et conclure les évaluations préparées. Ne pas présenter le DPF comme une exemption à l’EFVP Québec.
5. **Historique du test.** Dans les Audit Logs du compte, filtrer la zone et les changements des enregistrements DNS du 26 novembre, en tenant compte du fuseau. Exporter seulement les dates avant/après du booléen `proxied` pour apex/www, référence d’événement et fuseau ; corréler la fin avec le retour DNS only rapporté. Une modification DNS ne prouve pas la fin instantanée du trafic : noter propagation et possibles connexions persistantes. Si les logs ne sont pas accessibles sur le compte, rapprocher courriels, historique des captures ou navigateur ; laisser la borne inconnue plutôt que l’inventer.

Questions documentaires à transmettre par le fondateur, si nécessaires : « Pour le compte Free et la zone Rockso indiqués de manière privée, quel contrat et DPA nous lient, pour quelle entité, quelles données sont traitées comme sous-traitant ou pour vos finalités propres, dans quels pays, par quels intervenants et pendant combien de temps, y compris URL/query d’OAuth/bêta et sauvegardes ? Quelles fonctions peuvent ajouter scripts, cookies ou identifiants dans notre configuration actuelle ? » Aucun message n’a été envoyé à Cloudflare par ce lot.

Une réponse fournisseur refusant tout délai chiffré n’est pas automatiquement éliminatoire : des critères assez précis et proportionnés peuvent être évalués. En revanche, une référence circulaire à « aussi longtemps que nécessaire » sans explication sur des URL à jetons ne permet pas de conclure B2. Les inconnues résiduelles doivent être appréciées selon les données et l’exposition réelles, puis motivées par le responsable.

## Période temporaire du 26 novembre

Source : compte rendu Growth déjà reçu, cinq échanges relus lors du premier audit. La référence de conversation privée est omise de la version publiée. Les images jointes n’étaient pas accessibles ; les constats qui en découlent sont **rapportés dans le chat**, sans contrôle direct des pixels. Les heures ci-dessous sont les horodatages des messages, pas ceux des bascules DNS.

| Message | America/Toronto | UTC | Ce qu’il établit |
| --- | --- | --- | --- |
| Envoi de captures de statistiques, commentaire sur IP/User-Agent | 26 novembre 20:39:15 | 27 novembre 01:39:15Z | Des statistiques sont rapportées ; ne fixe pas le début de l’activation |
| Captures DNS/filtres, commentaire apex/www proxifiés | 26 novembre 20:42:05 | 27 novembre 01:42:05Z | État actif rapporté sur les captures antérieures au commentaire ; pas d’heure de changement vérifiée |
| Retour DNS only confirmé dans le compte rendu | 26 novembre 20:43:58 | 27 novembre 01:43:58Z | Retour DNS only déclaré au plus tard dans cet échange, sans preuve de fin de tout trafic |

**Début exact : inconnu. Fin exacte du trafic proxifié : inconnue.** Ne pas transformer 20:42–20:43 en durée du test. Les champs restent `null` dans l’inventaire. La date locale du test est le 26 novembre, mais les messages de fin sont le 27 en UTC.

Tout le test est exclu des futurs KPI officiels. À défaut de bornes plus précises, proposition conservatoire : exclure la journée locale entière du 26 novembre, soit `[2026-11-26T05:00:00Z, 2026-11-27T05:00:00Z)`, **fenêtre d’exclusion et non durée réelle du test**. Pour des buckets journaliers UTC non séparables, exclure les deux buckets UTC des 26 et 27 novembre. Étendre si des preuves révèlent un débordement. Ce choix peut exclure du trafic hors test ; ne pas le maquiller en zéro.

Aucune reprise historique ne devient officielle. La future origine de couverture sera une date prouvée après GO distinct et recette satisfaisante ; toute période antérieure ou de recette sera marquée hors couverture. Cette règle permet de protéger le futur KPI même si les bornes du test ne peuvent être retrouvées.

## Contrat du futur KPI sans implémentation

Nom proposé : **Chargements HTML qualifiés des accueils FR et EN**. Unité : réponses HTML aux requêtes reçues par le réseau Cloudflare ; jamais personnes, visites uniques, sessions, inscriptions ou preuve de lecture. Les rechargements répétés peuvent compter plusieurs fois ; les retours depuis un cache navigateur sans requête ne comptent pas.

| Critère | Contrat proposé à vérifier avant exploitation |
| --- | --- |
| Host | Exactement `rockso.app` ou `www.rockso.app` ; les redirections ne doivent pas être comptées une seconde fois |
| Path | FR : `/` et `/index.html` ; EN : `/index-en.html` ; aucune autre route. Examiner les variantes réellement servies, ne pas élargir par préfixe |
| Requête/réponse | GET ; code 200 ; type de réponse `text/html` après normalisation du MIME. Exclure HEAD, 204/206, 304, redirections, erreurs et pages de challenge. Cette convention exclut certaines revalidations réelles ; elle doit rester annoncée |
| Paramètres | Query/UTM jamais dimensions ni exports. Le chemin seul sert à qualifier l’accueil ; aucune réconciliation. Une query arbitraire peut néanmoins déjà transiter techniquement |
| Provenance et robots | Qualifier la source des requêtes, exclure sous-requêtes internes et robots vérifiés lorsque les champs le permettent sans nouvelle instrumentation. Ne pas prétendre exclure tous les robots ni activer un détecteur pour améliorer le KPI |
| Cache | Compter réponses au visiteur en cache Edge et à l’origine, une fois ; ne pas substituer requêtes vers l’origine au nombre de réponses client |
| Période et qualité | Journées UTC, fenêtres de couverture effectives, exclusions de recette, méthode versionnée ; toute lacune est inconnue, pas zéro |
| Données retenues | Jour UTC, accueil FR/EN, nombre et métadonnées de méthode/couverture ; aucune dimension personnelle ou libre |

Le schéma final/API n’est pas certifié par l’existence des filtres UI. Les [limites GraphQL](https://developers.cloudflare.com/analytics/graphql-api/limits/) et le [nœud settings](https://developers.cloudflare.com/analytics/graphql-api/features/discovery/settings/) permettent de vérifier datasets/champs et fenêtres de la zone. Tenir compte de l’[échantillonnage adaptatif](https://developers.cloudflare.com/analytics/graphql-api/migration-guides/graphql-api-analytics/) : ne pas sommer des lignes échantillonnées ou multiplier un compteur sans contrat documenté. Si le résultat est estimé, le libeller ainsi ; si les filtres requis ne sont pas disponibles, suspendre la certification du KPI. Aucun token ni appel Cloudflare API n’est créé par ce dossier.

## Passage éventuel à GO

Le fondateur clôt B1–B5 sur pièces, accepte explicitement les risques résiduels et valide les versions finales des textes/évaluations. La publication des politiques nécessite sa propre autorisation ; la réactivation ensuite nécessite un GO distinct de production. Une recette ultérieure autorisée doit confirmer comportement réseau et consentement, y compris refus PostHog, absence d’injection, callbacks/bêta sans exposition supplémentaire non qualifiée et filtres du compteur. Si une observation contredit la cible, revenir à la décision et arrêter l’exploitation correspondante.

L’intégration du KPI dans Rockso Growth, toute migration vers Cloudflare Pages et les changements de Mobile/Coach restent hors mandat, même si le proxy obtient ultérieurement GO. Le statut actuel de ce dossier est « prêt à revue documentaire avec réserves », pas « conformité validée ».

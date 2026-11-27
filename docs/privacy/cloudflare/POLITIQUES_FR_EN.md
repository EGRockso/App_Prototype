# Propositions pour les politiques FR et EN

**Brouillons du 26 novembre 2026, non publiés.** Destinations : `privacy.html` et `privacy-en.html`, version distante `74ad7df0`. Préserver l’identité AIMS Corp., les droits existants et tous les contenus Mobile/Coach. La présente PR ne modifie aucun HTML servi. Les détails contractuels et durées encore inconnus doivent être fermés avant publication des textes du proxy ; ils ne doivent pas être remplacés par une promesse non établie.

## Mise à jour DNS déjà applicable à proposer

Insertion dans les destinataires (§6), sans affirmer que le proxy est actif.

**FR** — Cloudflare fournit la résolution DNS du domaine rockso.app. Cette opération traite les noms de domaine interrogés et les informations techniques nécessaires à leur résolution. En mode DNS only, elle ne fait pas transiter le contenu HTTP du site par le proxy Cloudflare. GitHub Pages reste l’hébergeur du site.

**EN** — Cloudflare provides DNS resolution for the rockso.app domain. This involves the queried domain names and technical information needed for resolution. In DNS-only mode, the website’s HTTP content does not pass through the Cloudflare proxy. GitHub Pages remains the website host.

Ne publier cette information qu’avec les mentions appropriées de destinataires, transferts et conservation DNS finalisées ; aucune durée DNS spécifique n’est établie dans ce lot.

## Textes cibles après qualification et GO distinct

Le présent de ces propositions décrit la configuration future, **pas l’état actuel DNS only**. Les paragraphes sont à intégrer seulement si toutes leurs affirmations sont réalisées. Aucun changement de mécanisme de choix n’est proposé.

### Données et finalités aux sections 2 et 3

**FR** — Pour distribuer et sécuriser les pages de rockso.app et www.rockso.app, nous utilisons Cloudflare comme intermédiaire technique devant GitHub Pages. Les requêtes transmettent notamment votre adresse IP, l’adresse demandée, la date et des informations techniques du navigateur et de la connexion. Selon la requête, des en-têtes ou paramètres d’accès peuvent également transiter. Ce traitement technique repose sur notre intérêt légitime à assurer la disponibilité et la sécurité de la vitrine.

**EN** — To deliver and secure pages on rockso.app and www.rockso.app, we use Cloudflare as a technical intermediary in front of GitHub Pages. Requests transmit information including your IP address, the requested address, the date, and technical browser and connection information. Depending on the request, headers or access parameters may also pass through the service. This technical processing is based on our legitimate interest in maintaining the website’s availability and security.

### Destinataires à la section 6

**FR** — Cloudflare, Inc. assure la résolution DNS, la distribution et la sécurité du trafic des deux domaines de la vitrine ainsi que la production de statistiques de requêtes. Cloudflare agit comme sous-traitant pour les contenus et journaux traités pour notre compte. Certaines opérations sur ses données réseau relèvent de ses finalités propres, décrites dans sa [politique de confidentialité](https://www.cloudflare.com/privacypolicy/). Les conditions de traitement et sous-traitants applicables sont accessibles à partir de son [DPA](https://www.cloudflare.com/cloudflare-customer-dpa/) et de sa [liste de sous-traitants](https://www.cloudflare.com/gdpr/subprocessors/cloudflare-services/).

**EN** — Cloudflare, Inc. provides DNS resolution, traffic delivery and security for the two website domains, and produces request statistics. Cloudflare acts as a processor for content and logs processed on our behalf. Certain operations involving its network data serve its own purposes, described in its [privacy policy](https://www.cloudflare.com/privacypolicy/). Applicable processing terms and subprocessors can be found through its [DPA](https://www.cloudflare.com/cloudflare-customer-dpa/) and [subprocessor list](https://www.cloudflare.com/gdpr/subprocessors/cloudflare-services/).

### Transferts et conservation aux sections 7 et 8

**FR** — Le recours à Cloudflare peut impliquer des traitements et des accès hors de l’EEE, du Canada et du Québec, notamment aux États-Unis. Nous documentons les garanties applicables à chaque transfert et pouvons vous en communiquer les éléments pertinents à privacy@rockso.app. La localisation de l’hébergeur d’origine ne détermine pas celle de tous les traitements du proxy.

**EN** — Cloudflare may process data or access it outside the EEA, Canada and Quebec, including in the United States. We document the safeguards applicable to each transfer and can provide relevant information at privacy@rockso.app. The origin host’s location does not determine where all proxy processing takes place.

**À compléter avant publication FR/EN** : nommer les mécanismes effectivement établis (DPF pour flux couvert ou CCT et mesures correspondantes), pays/catégories utiles et modalités d’accès aux garanties. Ajouter la durée ou les critères précis des catégories de journaux, données réseau, cache et sauvegardes effectivement reçus du fournisseur. La durée de consultation des statistiques ne suffit pas. Ne pas laisser entendre que la règle existante de 90 jours sur les données de compte/sauvegardes Rockso s’applique aux données Cloudflare.

### Nouveau paragraphe dans la section 11

À insérer séparément du complément PostHog et avant les passages Mobile/Coach. Remplacer la désignation trop générale « mesure d’audience facultative » de l’introduction §11 par « mesure facultative avec PostHog » / « optional measurement using PostHog ». Dans le paragraphe des catégories, limiter la phrase « Analyse est facultative » aux mesures avec choix effectivement couvertes, et renvoyer explicitement au paragraphe Cloudflare. Ne pas reclasser la statistique Cloudflare comme nécessaire au seul motif qu’elle est indépendante du choix PostHog.

**FR — Statistiques agrégées de chargements des accueils**

Nous utilisons séparément des statistiques de requêtes Cloudflare pour compter les réponses HTML qualifiées des accueils français et anglais. Ces nombres décrivent des chargements, et non des visiteurs uniques, des sessions ou des lectures. Cette mesure n’ajoute ni balise de mesure, ni SDK, ni identifiant individuel. Rockso n’exporte pour cet indicateur aucune adresse IP, aucun paramètre de campagne UTM et aucun identifiant de compte ; nous ne rapprochons pas ces résultats des comptes Rockso. Cloudflare traite néanmoins des données personnelles techniques pour fournir ses services. Les tableaux de bord accessibles aux personnes habilitées peuvent contenir plus d’informations que les seuls agrégats retenus pour cet indicateur.

Sous réserve de la qualification applicable décrite aux sections précédentes, cette finalité statistique repose sur notre intérêt légitime à comprendre l’usage global des accueils et reste indépendante de votre choix relatif à PostHog. Votre refus de PostHog continue d’arrêter cette mesure facultative. Vous pouvez exercer les droits décrits à la section 10, notamment nous adresser une opposition pour des raisons tenant à votre situation. Sans identifiant permettant d’attribuer un agrégat, nous ne pouvons pas en extraire une visite individuelle. Cela ne signifie pas qu’aucune donnée personnelle technique n’est traitée en amont.

**EN — Aggregated home page load statistics**

We separately use Cloudflare request statistics to count qualified HTML responses for the French and English home pages. These figures describe loads, not unique visitors, sessions or content read. This measurement adds no measurement beacon, SDK or individual identifier. Rockso exports no IP address, UTM campaign parameter or account identifier for this indicator, and does not match these results to Rockso accounts. Cloudflare nevertheless processes technical personal data to provide its services. Dashboards available to authorised staff may contain more information than the aggregates selected for this indicator.

Subject to the applicable assessment described above, this statistical purpose is based on our legitimate interest in understanding overall use of the home pages and is independent of your PostHog choice. Declining PostHog continues to stop that optional measurement. You can exercise the rights described in section 10, including objecting on grounds relating to your particular situation. Without an identifier linking an aggregate to you, we cannot extract an individual visit from it. This does not mean that no technical personal data is processed upstream.

**Condition éditoriale impérative** : remplacer « sous réserve » et « subject to » par une formulation affirmative correspondant à une qualification réellement achevée avant publication ; sinon ne pas publier ce passage et conserver STOP. Ajouter les durées fournisseur finalisées et la durée des copies Rockso approuvée. Si des cookies ou scripts de sécurité sont présents, l’affirmation d’absence de mécanisme supplémentaire doit être réexaminée ; ne pas publier une description inexacte pour préserver le projet de KPI.

## Vérification avant publication future

Vérifier la parité de sens FR/EN, les liens et ancres existantes `site-analytics` / `website-analytics`, l’articulation avec les catégories Nécessaire/Analyse/Performance et les mentions légales d’hébergement. GitHub reste hébergeur : Cloudflare ne doit pas le remplacer dans ces mentions. Le retrait PostHog reste identique. Ne pas modifier les versions de consentement ou la logique des choix par cette PR ; si une nouvelle version d’information est nécessaire, la traiter explicitement dans le lot ultérieur autorisé.

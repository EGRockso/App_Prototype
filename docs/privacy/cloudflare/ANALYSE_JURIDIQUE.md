# Analyse juridique et évaluations de confidentialité

**26 novembre 2026 — analyse préparatoire, décisions du responsable encore requises.** La configuration du proxy doit être qualifiée sur tous les chemins de la [cartographie](CARTOGRAPHIE_ET_REGISTRE.md), même si ses statistiques sont restreintes aux accueils.

## RGPD et finalités distinctes

AIMS Corp. étant établie en France, le RGPD encadre ce traitement réalisé dans le cadre de cet établissement. Une IP, une URL d’invitation ou un ensemble de métadonnées peuvent être personnels ; retirer les IP des exports ne supprime pas le traitement amont. Les principes applicables portent sur finalité, minimisation, durée, sécurité et responsabilité. Le registre, l’encadrement des prestataires et des transferts, l’information, les droits et le dépistage du risque élevé doivent être documentés. Un intérêt légitime n’autorise pas à lui seul le traitement de données de santé ; une requête à une vitrine sportive n’est pas automatiquement une donnée de santé. Références : [RGPD, articles 3 à 6, 9, 13, 21, 25, 28, 30, 32, 35 et 44 à 49](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra).

La finalité technique est de distribuer et sécuriser un service demandé. La finalité statistique est de mesurer l’évolution des chargements des accueils sans suivre les personnes. Elle demeure distincte même si le même fournisseur produit les deux. Le contrat passé avec Cloudflare ne constitue pas la base juridique RGPD des données des visiteurs. Ne pas qualifier la statistique de « strictement nécessaire » par simple classement dans une catégorie de consentement.

## Mises en balance préparées

La [CNIL](https://www.cnil.fr/fr/les-bases-legales/interet-legitime) exige un intérêt licite et réel, la nécessité du traitement et une mise en balance avec les attentes et droits des personnes. Les analyses suivantes concernent les choix Rockso, pas une validation des finalités propres de Cloudflare.

| Étape | Distribution et sécurité | Statistiques des accueils |
| --- | --- | --- |
| Intérêt concret | Maintenir disponibilité, HTTPS et prévention des abus | Comprendre le volume de chargements sans biais limité aux seuls accords PostHog |
| Nécessité comparée | DNS only + GitHub Pages fournit déjà HTTPS ; le bénéfice additionnel du proxy doit justifier un nouvel accès au trafic | Les événements consentis ne mesurent pas tout le trafic. Un compteur à l’origine serait moins étendu mais GitHub Pages n’en expose pas ici de source équivalente démontrée. Ajouter un proxy pour le seul compteur étend le traitement à OAuth/bêta : nécessité non acquise |
| Atteintes possibles | Accès supplémentaire à IP, URL de sécurité et en-têtes ; accès internationaux ; éventuel cache de contenus | Réutilisation secondaire, petits effectifs, géolocalisation/identifiants et robots si options activées, rétention non bornée |
| Garanties proposées | Contrat effectif, protection des secrets d’URL, contrôle du cache et des journaux, accès limités, MFA, durées documentées | Agrégation précoce jour/langue, pas d’IP/UTM/pays/appareil/visiteur/session, aucune jointure, faible granularité, copies limitées |
| Conclusion | Article 6.1.f candidat ; conclusion suspendue aux pièces fournisseur et au périmètre sensible | Article 6.1.f candidat, sans exemption automatique de consentement ; balance non close tant que la chaîne et les usages propres ne sont pas qualifiés |

L’absence de source équivalente côté GitHub Pages est un constat de ce dossier, pas une preuve qu’aucune autre solution n’existe. L’objectif d’un KPI plus complet ne suffit pas à justifier toutes les données accessibles au prestataire.

## ePrivacy et article 82

L’article 82 encadre l’accès aux informations du terminal et leur stockage, au-delà des cookies. Une opération exclusivement nécessaire à la communication ou à un service expressément demandé peut être exemptée ; l’intérêt légitime RGPD ne remplace pas ce test. Source : [loi Informatique et Libertés, article 82](https://www.cnil.fr/fr/le-cadre-national/la-loi-informatique-et-libertes).

Un comptage dérivé des requêtes normales sans mécanisme additionnel constitue une piste, pas une exemption démontrée. Les [lignes directrices EDPB 2/2023 finales, §42–43 et 54–56](https://www.edpb.europa.eu/system/files/documents/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf) couvrent notamment les en-têtes et certaines collectes d’IP. Elles distinguent l’application du texte de l’obligation de recueillir le consentement. Il faut établir si la chaîne statistique accède à des informations du terminal, réutilise des identifiants ou suit la navigation, puis qualifier une exemption précise si nécessaire. « Sans cookie » ne règle pas la question.

Si l’on invoque l’exemption de mesure d’audience, vérifier les conditions de la [CNIL](https://www.cnil.fr/fr/mesurer-la-frequentation-de-vos-sites-web-et-de-vos-applications), dont finalité limitée, compte exclusif de l’éditeur et absence de suivi transversal. Les usages propres du fournisseur et ses données réseau ne peuvent être ignorés. Les champs IP, visiteurs, sessions, géolocalisation, empreintes ou attribution doivent être exclus du KPI ; leur usage amont éventuel doit aussi être qualifié. La présence de filtres dans l’interface ne prouve ni exclusivité ni minimisation amont. Ce dossier ne certifie donc pas Cloudflare comme outil exempté par la CNIL.

Les cookies/scripts de sécurité éventuels demandent une qualification technique et juridique propre. La déclaration fournisseur « strictement nécessaire » ne remplace pas l’analyse Rockso. Si la configuration ne respecte pas l’engagement d’absence de mécanisme supplémentaire ou exige un nouveau consentement, arrêter la partie dépendante et soumettre un arbitrage ; ne pas modifier les préférences dans ce lot.

## Québec et Loi 25

La Loi 25 modifie notamment la loi québécoise sur le secteur privé. Son application à AIMS Corp. doit être motivée à partir des liens réels de son activité avec le Québec : établissement/exploitation, clientèle visée, contrats et flux concernés. La résidence actuelle du fondateur ou la simple accessibilité mondiale du site ne tranchent pas à elles seules ce rattachement. Les politiques existantes prennent déjà en compte les droits québécois ; cela ne vaut pas conclusion territoriale définitive.

Si applicable : limiter la collecte au nécessaire, informer sur fins/moyens/destinataires et hors Québec ; examiner les fonctions d’identification/localisation/profilage, l’évaluation du projet et des transferts, le contrat de service, la conservation et les droits. Références : [loi secteur privé, articles 3.3, 5, 8, 8.1, 12, 17, 18.3, 23 et 27 et suivants](https://www.legisquebec.gouv.qc.ca/en/document/cs/P-39.1).

La [CAI, entreprises privées](https://www.cai.gouv.qc.ca/protection-renseignements-personnels/information-entreprises-privees/utilisation-communication-renseignements-personnels) décrit la réutilisation interne nécessaire à des statistiques de renseignements dépersonnalisés. Elle ne dispense pas de qualifier leur collecte initiale ni les communications au prestataire ; dépersonnalisé reste personnel. Le mandat écrit de service ne couvre pas automatiquement des réutilisations propres du fournisseur. Les données brutes Cloudflare ne deviennent pas dépersonnalisées parce que Rockso n’en télécharge pas les IP.

## LPRPDE et PIPEDA

L’applicabilité fédérale reste à établir selon l’activité commerciale et son lien réel et substantiel avec le Canada. Les lois provinciales jugées essentiellement similaires ne neutralisent pas nécessairement les opérations interprovinciales/internationales. Sources : [CPVP, panorama](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/02_05_d_15/) et [champ d’application](https://www.priv.gc.ca/biens-assets/compliance-framework/en/index?wbdisable=true).

Si applicable, documenter fins raisonnables, consentement significatif ou exception pertinente, limitation, responsabilité, garanties et accès. Il n’existe pas de transposition automatique de l’intérêt légitime européen. Pour un transfert au sous-traitant conservant la finalité initiale, le [CPVP](https://www.priv.gc.ca/en/privacy-topics/airports-and-borders/gl_dab_090127/) n’exige pas systématiquement un nouveau consentement, mais maintient la responsabilité et la transparence sur les traitements étrangers. Cette règle ne valide pas une nouvelle finalité statistique ou des usages propres non couverts.

## Évaluations préparées et résultat

| Évaluation | Application au lot | Résultat et travail de clôture |
| --- | --- | --- |
| Dépistage AIPD RGPD | Petit compteur agrégé ; pas de profilage ni de décisions sur une personne prévus. Mais proxy global, URL d’accès et démo compilée méritent contrôle | Pas de preuve qu’une AIPD complète soit automatiquement obligatoire pour le seul KPI. Dépistage non clos sur le trafic réellement traité ; vérifier volume, mineurs, données sensibles, suivi systématique et combinaisons avant décision motivée du responsable |
| EFVP projet Québec, art. 3.3 si applicable | Ajout d’un intermédiaire à la prestation électronique traitant des renseignements personnels | Préparée dans cette cartographie, registre, analyse et matrice des risques ; consulter le responsable. Conclusion non signée |
| EFVP hors Québec, art. 17 si applicable | Cloudflare global et accès à distance, pas seulement lieu de stockage | Adéquation de protection non conclue : pays, lois, contrat et durées manquent. Entente écrite à rapprocher de la couverture réelle ; DPF seul ne remplace pas cette analyse |
| Analyse de transfert RGPD | Identifier destinataire, lieu et mécanisme pour chaque transfert et accès ultérieur | Si adéquation effective, documenter couverture ; si CCT, analyse des lois/pratiques et mesures complémentaires. Voir [matrice fournisseur](PRESTATAIRE_TRANSFERTS_CONSERVATION.md) |

Le [cadre AIPD CNIL](https://www.cnil.fr/fr/RGPD-analyse-impact-protection-des-donnees-aipd) vise les risques élevés, pas toute statistique indistinctement. Les évaluations restent proportionnées à ce lot ; aucune AIPD globale Mobile/Coach n’est déclarée effectuée.

## Matrice des risques de confidentialité

| Risque initial | Mesures à vérifier | Risque résiduel et décision |
| --- | --- | --- |
| Élevé : divulgation/rétention de codes ou jetons en URL | Accès aux logs limité, traitement/rétention query documentés, cache/publication contrôlés, absence de réemploi | Indéterminé, B2 : la query arrive au proxy avant tout filtre ; un bypass du cache n’est pas un bypass du proxy |
| Élevé : transfert sans protection démontrée | Contrat effectif, chaîne pays/sous-traitants, mécanismes et EFVP | Indéterminé, B1/B4 tant que pièces absentes |
| Moyen : injection JS/cookies et mesure non couverte | État de compte et exclusions des fonctions ; qualification ePrivacy | Indéterminé, B3. Si sécurité ne peut respecter la cible, arbitrage produit/juridique nécessaire |
| Moyen : usage abusif ou réidentification | Moindre privilège, pas d’export des détails, pas de dimensions libres ni croisement | Faible à modéré sous conditions ; agrégation seule ne certifie pas l’anonymat |
| Moyen : chiffres trompeurs | Contrat de mesure, couverture, robots et estimation signalés | Acceptable sous conditions pour chargements, jamais comme visiteurs ou sessions |

## Information et droits

Les [inserts FR/EN](POLITIQUES_FR_EN.md) distinguent technique et statistiques, responsable, prestataire, données, transferts, durées et recours. Le refus PostHog n’autorise ni ne désactive automatiquement un traitement juridique distinct ; il doit toujours arrêter PostHog selon le dispositif actuel.

Réception des demandes : `privacy@rockso.app`, avec responsable déjà indiqué dans les politiques. Vérifier proportionnellement l’identité et la capacité à retrouver les données, sans créer un identifiant ou un export d’IP pour ce seul besoin. Pour les journaux sous-traités, Rockso instruit Cloudflare ; pour ses traitements propres, orienter également vers Cloudflare sans se décharger de la réponse Rockso. Expliquer la distinction entre impossibilité d’attribuer un agrégat et absence de données sources. Une opposition relative à une situation particulière doit être instruite ; ne pas promettre un retrait individuel impossible du compteur déjà agrégé. Droits et délais existants restent applicables ; aucune portabilité universelle n’est promise pour un traitement fondé sur l’intérêt légitime. Source : [CNIL, droits](https://www.cnil.fr/fr/les-droits-pour-maitriser-vos-donnees-personnelles).

Avant exploitation, formaliser un circuit de demande/incident avec Cloudflare et une preuve de clôture, puis traiter les demandes réelles selon les délais déjà publiés. Ne pas envoyer de données de visiteurs à l’assistance pour obtenir une réponse documentaire.

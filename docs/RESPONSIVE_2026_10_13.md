# Responsive — site vitrine Rockso

Corrections locales du 13 octobre 2026, commit autorisé par l'utilisateur. Aucun déploiement effectué.

## Comportement

- Menu compact sous 1200 px sur l'accueil et jusqu'à 1100 px sur les pages secondaires. Fermeture par Échap, lien, clic extérieur, sortie du focus et changement de largeur ; état et libellés accessibles FR/EN.
- Visuels liés à la largeur de leur colonne ; fond Produit dimensionné par son contenu. Les cinq aperçus sont alignés sur ordinateur et défilent horizontalement sous 900 px, avec un ou deux téléphones entiers et le suivant partiellement visible.
- Marges et boutons adaptés aux petits écrans, textes longs pouvant revenir à la ligne, pages légales limitées à une colonne lisible.
- Cadre de démonstration limité à l'espace disponible, avec son ratio conservé. La recette concerne le cadre, pas les parcours de l'application Expo intégrée dans l'iframe.
- Réponses de FAQ réajustées pendant le redimensionnement, liens fermés inactifs au clavier, état ouvert accessible.
- Collage principal : compensation des marges transparentes des PNG, téléphone central entier et dégagé, photos dimensionnées par leur colonne. Composition compacte suivant sa largeur réelle ; deux colonnes dès 900 px et trois phrases du titre conservées. Le débordement décoratif sur ordinateur est limité à la marge jusqu'au bord de l'écran.

## Recette

Première recette, avant la galerie défilante : 196 combinaisons réussies, soit 14 pages sur 14 largeurs : 320, 390, 480, 640, 768, 900, 1024, 1100, 1199, 1200, 1280, 1440, 1920 et 2560 px. Contrôle du chargement des images, de la largeur du document, des éléments de contenu, des cinq aperçus et de la couverture du fond. Menus testés à 390×900 et 1024×500.

Contrôles complémentaires : pages secondaires et cartes d'accès bêta rendues visibles ; menus sur écran court ; FAQ FR/EN ouvertes pendant les changements de largeur ; texte agrandi à 200 %. Captures relues et revue indépendante favorable. Syntaxe JavaScript et `git diff --check` réussis.

Finalisation visuelle des collages : 32 contrôles supplémentaires FR/EN dans le navigateur intégré réellement utilisé, sur 16 largeurs, dont 539, 899, 900 et 1025 px. Téléphone central contenu dans la section et non masqué, titre en trois phrases, images chargées et absence de débordement du contenu vérifiés. Les captures finales remplacent l'aperçu initial de l'accueil ; la première recette de 196 combinaisons reste identifiée séparément. Le script contient désormais aussi les contrôles de masquage du téléphone et de retour à la ligne du titre.

Google Chrome local piloté par Playwright, tailles émulées. Safari, Firefox et appareils physiques non vérifiés. Aucun formulaire soumis ni écriture vers le backend réel.

## Galerie Produit et harmonisation du français

Suivi du 13 octobre 2026 après retour visuel de l'utilisateur :

- Galerie native sous 900 px, utilisable par balayage, défilement horizontal, flèches et touches gauche/droite, Début/Fin. Les commandes ont des libellés FR/EN, une cible de 44 px, un focus visible et un indicateur accessible. Le dernier téléphone reste entièrement accessible. Le défilement respecte la préférence de réduction des animations.
- Légendes sous les cinq aperçus. La disposition de cinq téléphones sur ordinateur est conservée.
- Téléphone de l'assistant IA plafonné à 430 px au lieu de 480 px, puis adapté à la largeur disponible sur écran compact.
- « Product » devient « Produit », « Smart AI » devient « Assistant IA » ou « IA · Messages et voix ». Les anglicismes de l'accueil, des pages d'accès, de démonstration et des pages légales françaises ont été revus. Les erreurs du fournisseur de connexion sont remplacées par des messages français, sans changement des appels ni des branches d'authentification. Les marques, noms de services et termes usuels restent conservés ; les textes intégrés aux captures raster de l'application ne sont pas recréés.

Validation de ce suivi dans le navigateur intégré réellement utilisé : 32 contrôles FR/EN, sur 16 largeurs de 320 à 2560 px, dont 539, 899, 900 et 1025 px. Aucun débordement du document ou du contenu hors galerie ; images chargées, légendes correctes, un ou deux aperçus entiers en mode compact et cinq sur ordinateur. Les commandes gauche/droite, Début/Fin et les deux boutons sont testées sur les six largeurs compactes de chaque langue. Le dernier aperçu est vérifié après la fin du défilement. Défilement horizontal natif confirmé à 539 px. Les sept pages françaises secondaires sont aussi contrôlées à 320 et 1440 px, soit 14 contrôles complémentaires, sans formulaire soumis.

La syntaxe JavaScript et `git diff --check` passent. `scripts/check-responsive.mjs` est étendu aux contrôles de galerie et à 17 largeurs pour les prochaines recettes ; cette version du script n'a pas été exécutée ici. Les résultats de ce suivi proviennent des 46 contrôles du navigateur intégré, distincts des recettes historiques ci-dessus.

- [Galerie compacte — premier aperçu](product-gallery-2026-10-13/produit-539-debut.jpg)
- [Galerie compacte — dernier aperçu](product-gallery-2026-10-13/produit-539-fin.jpg)
- [Galerie sur ordinateur](product-gallery-2026-10-13/produit-1440.jpg)
- [Assistant IA — 539 px](product-gallery-2026-10-13/assistant-ia-539.jpg)
- [Assistant IA — 390 px](product-gallery-2026-10-13/assistant-ia-390.jpg)
- [Rapport des 46 contrôles](product-gallery-2026-10-13/rapport.json)

## Rejouer

Depuis le dépôt, démarrer `python3 -m http.server 8086 --bind 127.0.0.1`, puis utiliser une installation existante de Playwright avec `node scripts/check-responsive.mjs`.

Le contrôle accepte `ROCKSO_BASE_URL`, `ROCKSO_PLAYWRIGHT_MODULE` (chemin du module Playwright fourni par le runtime), `ROCKSO_BROWSER_PATH` et `ROCKSO_REPORT_PATH`. Aucun paquet ajouté au dépôt. Les requêtes vers le backend Supabase réel sont annulées pendant cette recette.

## Aperçus

- [Accueil ordinateur — version finale](responsive-2026-10-13/accueil-1440-final.jpg)
- [Accueil compact — version finale](responsive-2026-10-13/accueil-539-final.jpg)
- [Aperçus produit sur téléphone — disposition initiale remplacée par la galerie](responsive-2026-10-13/produit-390.png)
- [Première recette — 196 contrôles](responsive-2026-10-13/rapport.json)
- [Collages finaux — 32 contrôles FR/EN](responsive-2026-10-13/rapport-collages-final.json)

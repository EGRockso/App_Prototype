# Responsive — site vitrine Rockso

Corrections locales du 13 octobre 2026, commit autorisé par l'utilisateur. Aucun déploiement effectué.

## Comportement

- Menu compact sous 1200 px sur l'accueil et jusqu'à 1100 px sur les pages secondaires. Fermeture par Échap, lien, clic extérieur, sortie du focus et changement de largeur ; état et libellés accessibles FR/EN.
- Visuels liés à la largeur de leur colonne ; fond Produit dimensionné par son contenu. Les cinq aperçus restent visibles en grilles de cinq, trois ou deux colonnes.
- Marges et boutons adaptés aux petits écrans, textes longs pouvant revenir à la ligne, pages légales limitées à une colonne lisible.
- Cadre de démonstration limité à l'espace disponible, avec son ratio conservé. La recette concerne le cadre, pas les parcours de l'application Expo intégrée dans l'iframe.
- Réponses de FAQ réajustées pendant le redimensionnement, liens fermés inactifs au clavier, état ouvert accessible.
- Collage principal : compensation des marges transparentes des PNG, téléphone central entier et dégagé, photos dimensionnées par leur colonne. Composition compacte suivant sa largeur réelle ; deux colonnes dès 900 px et trois phrases du titre conservées. Le débordement décoratif sur ordinateur est limité à la marge jusqu'au bord de l'écran.

## Recette

`scripts/check-responsive.mjs` : 196 combinaisons réussies, soit 14 pages sur 14 largeurs : 320, 390, 480, 640, 768, 900, 1024, 1100, 1199, 1200, 1280, 1440, 1920 et 2560 px. Contrôle du chargement des images, de la largeur du document, des éléments de contenu, des cinq aperçus et de la couverture du fond. Menus testés à 390×900 et 1024×500.

Contrôles complémentaires : pages secondaires et cartes d'accès bêta rendues visibles ; menus sur écran court ; FAQ FR/EN ouvertes pendant les changements de largeur ; texte agrandi à 200 %. Captures relues et revue indépendante favorable. Syntaxe JavaScript et `git diff --check` réussis.

Finalisation visuelle des collages : 32 contrôles supplémentaires FR/EN dans le navigateur intégré réellement utilisé, sur 16 largeurs, dont 539, 899, 900 et 1025 px. Téléphone central contenu dans la section et non masqué, titre en trois phrases, images chargées et absence de débordement du contenu vérifiés. Les captures finales remplacent l'aperçu initial de l'accueil ; la première recette de 196 combinaisons reste identifiée séparément. Le script contient désormais aussi les contrôles de masquage du téléphone et de retour à la ligne du titre.

Google Chrome local piloté par Playwright, tailles émulées. Safari, Firefox et appareils physiques non vérifiés. Aucun formulaire soumis ni écriture vers le backend réel.

## Rejouer

Depuis le dépôt, démarrer `python3 -m http.server 8086 --bind 127.0.0.1`, puis utiliser une installation existante de Playwright avec `node scripts/check-responsive.mjs`.

Le contrôle accepte `ROCKSO_BASE_URL`, `ROCKSO_PLAYWRIGHT_MODULE` (chemin du module Playwright fourni par le runtime), `ROCKSO_BROWSER_PATH` et `ROCKSO_REPORT_PATH`. Aucun paquet ajouté au dépôt. Les requêtes vers le backend Supabase réel sont annulées pendant cette recette.

## Aperçus

- [Accueil ordinateur — version finale](responsive-2026-10-13/accueil-1440-final.jpg)
- [Accueil compact — version finale](responsive-2026-10-13/accueil-539-final.jpg)
- [Aperçus produit sur téléphone](responsive-2026-10-13/produit-390.png)
- [Première recette — 196 contrôles](responsive-2026-10-13/rapport.json)
- [Collages finaux — 32 contrôles FR/EN](responsive-2026-10-13/rapport-collages-final.json)

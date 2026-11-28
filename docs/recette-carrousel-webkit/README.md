# Carrousel mobile · recette du 27 novembre 2026

La version de référence est `9dd692c1ca4183c24b16868a0ba4fb70eae56331`. Les deux versions ont été servies localement. La validation sur Safari et iPhone physique reste ouverte.

## Comparatifs

Les planches mobiles montrent, de gauche à droite, la première, la troisième et la cinquième position. La première rangée vient de la version de référence, la seconde du correctif.

| Vue | Français | Anglais |
| --- | --- | --- |
| WebKitGTK, 390 × 844, densité 3× | [Avant et après](webkit-fr-mobile.webp) | [Avant et après](webkit-en-mobile.webp) |
| Chromium, 390 × 844, densité 3× | [Avant et après](chromium-fr-mobile.webp) | [Avant et après](chromium-en-mobile.webp) |
| Desktop, 1440 × 900, les deux moteurs | [Avant et après](desktop-fr.webp) | [Avant et après](desktop-en.webp) |

[Voir six secondes de navigation dans WebKit après correction](webkit-defilement.webp) · [Consulter les mesures par moteur, langue et largeur](mesures.json)

## Ce que la recette reproduit

Sur la référence, WebKitGTK mesure une carte de 191,52 px et une image de 306,42 px à 390 px de large. Les marges négatives et le filtre `drop-shadow` appliquent l’ombre à une surface qui déborde des deux côtés de la carte dans la zone défilante. Le défaut géométrique est reproductible. Les grands rectangles verts persistants signalés sur l’iPhone physique n’ont pas été reproduits dans les deux moteurs de cette recette. Le rôle exact du compositeur iOS reste à confirmer sur l’appareil.

Sur la branche, l’image occupe les 191,52 px de la carte. Les cinq PNG d’origine mesurent 1600 × 2000 px. Tous leurs pixels ayant une opacité non nulle se trouvent entre les colonnes 300 et 1269. Le cadrage centré dans un rapport 1:2 montre les colonnes 300 à 1299 et toute la hauteur. Il conserve le cadre du téléphone et l’ombre intégrée au PNG. La règle mobile supprime les marges négatives et l’ombre CSS. La fin du défilement passe de 713 à 664 px à cette largeur.

## Vérifications

- **WebKitGTK 2.54.3** sur Linux, via WebKitWebDriver. Les captures mobiles proviennent de l’affichage X11 à densité 3×. Les flèches parcourent les cinq positions. La touche Début ramène à la première et un geste de molette horizontale fait avancer la pagination.
- **Chromium 156.0.8078.79** via Playwright. Les cinq positions, le retour clavier et le balayage par événements tactiles natifs du navigateur ont été vérifiés.
- Pour chaque moteur, les deux pages ont été contrôlées à 390 × 844 et 393 × 852. Les cinq descriptions accessibles, l’absence de sous-titres, l’aperçu partiel suivant, les cinq points et les deux flèches sous le rail sont présents comme prévu. À 1440 × 900, les cinq cartes sont visibles ensemble et la navigation est masquée. Les captures desktop avant et après de chaque langue sont identiques dans chaque moteur.
- Les pixels du rail aux cinq positions ont été comparés à la composition attendue de la photographie, de son dégradé et des cinq PNG d’origine. Sur mobile, dans les deux moteurs et pour les deux versions, l’écart RVB absolu moyen de chaque bloc de 16 × 16 px reste inférieur à 40 sur 255. Pendant le geste WebKit, aucun des 68 échantillons avant et 77 après ne contient un bloc de 24 × 24 px couvert à plus de 95 % par la couleur de fond `#0f3a2a` à deux niveaux RVB près. Ces sondes documentent les images observées.
- La suite existante `scripts/check-responsive.mjs` passe ses 238 contrôles de page et largeur ainsi que quatre balayages tactiles (iPhone 13 et Pixel 7 émulés, FR et EN). La nouvelle assertion sur les limites des images échoue sur la référence dès 320 px et passe sur la branche.

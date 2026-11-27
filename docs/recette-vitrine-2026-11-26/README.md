# Recette de la vitrine · 26 novembre 2026

Sur mobile, la navigation se trouve sous les captures. Deux flèches encadrent cinq points, dont un vert pour l’écran actif. Sur desktop, les cinq captures sont visibles ensemble. Les descriptions des images restent accessibles aux lecteurs d’écran.

## Captures avant et après

Chaque comparaison oppose la première version de la PR (`935dd40`, à gauche) à la version révisée (à droite). Sur mobile, les comparatifs du carrousel sont cadrés sur la galerie. Les hauteurs du panneau de confidentialité sont mesurées en pixels CSS, détails repliés. Le nouveau libellé Analyse ajoute une ligne sur les deux profils mobiles. Les trois actions restent visibles sans défilement dans les deux langues.

| Profil Playwright | Langue | Hauteur avant → après | Confidentialité | Carrousel |
| --- | --- | ---: | --- | --- |
| iPhone 13 · 390 × 844 | FR | 424 → 445 px | [Panneau](iphone-fr-consent.webp) | [Aperçus](iphone-fr-gallery.webp) |
| iPhone 13 · 390 × 844 | EN | 400 → 420 px | [Panneau](iphone-en-consent.webp) | [Aperçus](iphone-en-gallery.webp) |
| Pixel 7 · 412 × 915 | FR | 420 → 440 px | [Panneau](android-fr-consent.webp) | [Aperçus](android-fr-gallery.webp) |
| Pixel 7 · 412 × 915 | EN | 400 → 420 px | [Panneau](android-en-consent.webp) | [Aperçus](android-en-gallery.webp) |
| Desktop · 1440 × 900 | FR | 400 → 420 px | [Panneau](desktop-fr-consent.webp) | [Aperçus](desktop-fr-gallery.webp) |
| Desktop · 1440 × 900 | EN | 379 → 400 px | [Panneau](desktop-en-consent.webp) | [Aperçus](desktop-en-gallery.webp) |

## Consentement Analytics

Les six parcours ont été exécutés dans Chromium 156 avec le SDK PostHog 1.380.0, vérifié par son empreinte SHA-384. Playwright sert les fichiers locaux sous l’origine de la vitrine et intercepte les requêtes du navigateur vers PostHog et le collecteur Supabase. La clé publique fournie par la configuration de la vitrine sert à initialiser le SDK dans cette recette isolée. Les rapports contiennent uniquement les décomptes, les noms de propriétés et les résultats des contrôles.

| Étape | Observation sur chacun des six parcours |
| --- | --- |
| Première visite, activation du bouton Analyse puis fermeture | Aucun choix enregistré, aucun identifiant de session et zéro requête Analytics. À la réouverture, Analyse est désactivé. |
| Tout refuser malgré un interrupteur activé, puis recharger | Le refus est relu. Un changement suivi d’Échap préserve la décision et son horodatage. Zéro requête Analytics. |
| Enregistrer avec Analyse activé | Un événement PostHog et une écriture de compteur interceptés sur la page d’inscription. Le reçu expire 180 jours après l’enregistrement. |
| Retrouver les préférences en pied de page | L’accord apparaît dans l’interrupteur. Modifier puis recharger les réglages avant d’enregistrer restitue l’accord. |
| Enregistrer le retrait dans un deuxième onglet | L’identifiant de session est effacé dans l’onglet d’inscription. Une confirmation simulée, un rechargement et une nouvelle confirmation y produisent zéro requête supplémentaire. |

La recette relit aussi un accord et un refus au format déjà publié le 28 octobre, lors d’un passage du français à l’anglais. Les valeurs enregistrées et leurs échéances sont conservées à l’identique. Le scénario de retrait pendant une vérification serveur en cours contrôle l’annulation des futurs envois.

**55 contrôles Analytics réussis.** [Résultats et compteurs des six parcours](analytics.json) · [Script Playwright](../../scripts/check-analytics.mjs)

## Carrousel et accessibilité

**238 combinaisons page × largeur réussies** sur 14 pages, de 320 à 2560 px. Les flèches parcourent les cinq aperçus dans les deux sens. Les tests vérifient la position de la capture, l’unicité du point actif et l’annonce de position en FR et EN à chaque étape. Les touches de direction, Début et Fin restent disponibles lorsque le carrousel a le focus. Quatre balayages tactiles injectés dans Chromium ont déplacé le carrousel et mis à jour son repère sur les profils iPhone et Android, en FR et EN. [Script Playwright](../../scripts/check-responsive.mjs)

Le focus initial se place sur le titre du panneau. Les deux actions globales ont les mêmes dimensions et le même style. Les informations détaillées et leurs liens restent accessibles après dépliage, y compris à 320 × 568 et 844 × 390 px.

Les profils mobiles émulent les dimensions et les entrées tactiles dans Chromium. Les captures utilisent les polices Fraunces et Inter servies localement. La recette ne couvre pas Safari sur iPhone physique.

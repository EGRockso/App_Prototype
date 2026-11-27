# Recette de la vitrine · 26 novembre 2026

Le panneau français passe de 883 à 420 px sur le profil Android. Les deux décisions globales et l’enregistrement de la sélection tiennent dans la fenêtre dès l’ouverture. Le carrousel indique le balayage avant la première capture et laisse entrevoir la suivante sur mobile. Les cinq aperçus sont visibles ensemble sur desktop.

## Captures avant et après

La colonne gauche de chaque image montre `main` au commit `74ad7df`. La colonne droite montre le correctif. Les hauteurs sont mesurées en pixels CSS avec les détails repliés. Les comparaisons mobiles du carrousel sont cadrées sur la galerie.

| Profil Playwright | Langue | Hauteur avant → après | Confidentialité | Carrousel |
| --- | --- | ---: | --- | --- |
| iPhone 13 · 390 × 844 | FR | 812 → 424 px | [Panneau](iphone-fr-consent.webp) | [Aperçus](iphone-fr-gallery.webp) |
| iPhone 13 · 390 × 844 | EN | 812 → 400 px | [Panneau](iphone-en-consent.webp) | [Aperçus](iphone-en-gallery.webp) |
| Pixel 7 · 412 × 915 | FR | 883 → 420 px | [Panneau](android-fr-consent.webp) | [Aperçus](android-fr-gallery.webp) |
| Pixel 7 · 412 × 915 | EN | 883 → 400 px | [Panneau](android-en-consent.webp) | [Aperçus](android-en-gallery.webp) |
| Desktop · 1440 × 900 | FR | 868 → 400 px | [Panneau](desktop-fr-consent.webp) | [Aperçus](desktop-fr-gallery.webp) |
| Desktop · 1440 × 900 | EN | 857 → 379 px | [Panneau](desktop-en-consent.webp) | [Aperçus](desktop-en-gallery.webp) |

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

**238 combinaisons page × largeur réussies** sur 14 pages, de 320 à 2560 px. Les flèches et les touches de direction permettent de parcourir les cinq aperçus. Début et Fin atteignent les extrémités. Le repère de position est annoncé dans la langue de la page. Quatre balayages tactiles injectés dans Chromium ont déplacé le carrousel et mis à jour son repère sur les profils iPhone et Android, en FR et EN. [Script Playwright](../../scripts/check-responsive.mjs)

Le focus initial se place sur le titre du panneau. Les deux actions globales ont les mêmes dimensions et le même style. Les informations détaillées et leurs liens restent accessibles après dépliage, y compris à 320 × 568 et 844 × 390 px.

Les profils mobiles émulent les dimensions et les entrées tactiles dans Chromium. Les captures utilisent les polices Fraunces et Inter servies localement. La recette ne couvre pas Safari sur iPhone physique.

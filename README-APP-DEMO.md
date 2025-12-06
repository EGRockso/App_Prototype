# 📱 Démo App Rockso - Documentation

## Vue d'ensemble

Ce dossier contient une **démo interactive de l'application mobile Rockso** accessible directement depuis le navigateur web.

## Architecture

```
App_Prototype/
├── demo-app.html       # Page avec cadre iPhone stylisé
├── app-demo/           # Build web de l'app React Native (généré par Expo)
│   ├── index.html      # Point d'entrée de l'app
│   ├── _expo/          # Assets et bundles JavaScript
│   └── assets/         # Images, fonts, icônes
└── index.html          # Page marketing (lien vers demo-app.html)
```

## Comment ça marche ?

1. **Page de démo (`demo-app.html`)** :
   - Affiche un cadre iPhone stylisé
   - Contient une iframe qui charge l'app web

2. **App web (`app-demo/`)** :
   - Version web compilée de l'app React Native
   - Générée avec `npx expo export --platform web`
   - Fonctionne sans serveur (HTML/CSS/JS statique)

3. **Restrictions web** :
   - Le mode Admin/Test est **désactivé sur web** (uniquement mobile)
   - Détection via `Platform.OS !== 'web'` dans le code React Native

## Régénérer le build web

Si tu modifies l'app mobile et veux mettre à jour la démo web :

```bash
# 1. Aller dans le dossier de l'app mobile
cd ../Rockso_Mobile_Prototype

# 2. Builder pour le web
npx expo export --platform web

# 3. Copier le build dans App_Prototype
rm -rf ../App_Prototype/app-demo
cp -r dist ../App_Prototype/app-demo

# 4. Commit et push vers GitHub
cd ../App_Prototype
git add .
git commit -m "Update app demo build"
git push
```

## Liens modifiés

Les liens suivants du site marketing pointent maintenant vers `demo-app.html` :

- **Navigation** : "Essayer l'app" (anciennement "Accès démo")
- **Hero CTA** : "🚀 Essayer l'application" (anciennement "Demander un accès démo")
- **Version EN** : "🚀 Try the app" (anciennement "Request demo access")

## Identifiants de démo

Les visiteurs peuvent se connecter avec :
- **Email** : demo@rockso.app
- **Mot de passe** : demo123

## Déploiement

Tout est hébergé sur **GitHub Pages** via le repo GitHub. Aucun serveur backend nécessaire.

---

**Note** : Le dossier `app-demo/` contient ~2MB d'assets (fonts, icônes). C'est normal pour une app React Native compilée en web.

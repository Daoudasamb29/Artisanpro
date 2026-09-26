# ArtisanPro Sénégal 🇸🇳

Application moderne de devis, facturation, suivi clients et comptabilité dédiée aux artisans et professionnels du bâtiment au Sénégal (plomberie, électricité, maçonnerie, menuiserie, etc.).

---

## 🚀 Déploiement sur Vercel

Cette application est prête pour un déploiement instantané sur **[Vercel](https://vercel.com)**.

### Méthode 1 : Via l'interface Vercel (Recommandée)

1. **Poussez votre code sur GitHub / GitLab / Bitbucket** :
   ```bash
   git add .
   git commit -m "Prêt pour déploiement Vercel"
   git push origin main
   ```

2. **Connectez-vous sur [Vercel](https://vercel.com)**.
3. Cliquez sur **« Add New... »** > **« Project »**.
4. Importez votre dépôt Git.
5. Vercel détecte automatiquement la configuration grâce à `vercel.json` et `vite.config.ts` :
   - **Framework Preset** : `Vite`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`
6. Cliquez sur **« Deploy »**. Votre application sera en ligne en quelques secondes avec une URL HTTPS sécurisée (ex: `https://artisanpro-senegal.vercel.app`).

---

### Méthode 2 : Déploiement via le CLI Vercel

Si vous avez le CLI Vercel installé sur votre machine :

```bash
# 1. Installer le CLI Vercel (si ce n'est pas déjà fait)
npm i -g vercel

# 2. Se connecter à son compte Vercel
vercel login

# 3. Déployer en prévisualisation
vercel

# 4. Déployer directement en production
vercel --prod
```

---

## 🛠️ Configuration Vercel incluse (`vercel.json`)

Le fichier `vercel.json` à la racine configure automatiquement :
- La réécriture d'URL pour le routage SPA (Single Page Application) afin d'éviter les erreurs 404 lors du rechargement des pages ou d'accès direct.
- Le dossier de distribution cible (`dist`).
- La commande de build standard (`npm run build`).

---

## 💻 Développement local

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Tester la compilation de production localement
npm run build
npm run preview
```

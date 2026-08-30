# Mes Habitudes 🌱

Application mobile de suivi d'habitudes : chaque jour, cochez ce que vous avez fait,
et suivez vos progrès avec des statistiques au mois et à l'année.

C'est une **PWA** (Progressive Web App) : elle s'installe sur l'écran d'accueil du
téléphone comme une vraie app, fonctionne hors-ligne, et vos données restent
stockées sur votre appareil (aucun serveur, aucun compte).

## Fonctionnalités

- ✅ Cocher chaque jour les habitudes accomplies (bouton sur chaque carte)
- 🎨 Autant d'habitudes que vous voulez, chacune avec son **emoji** et sa **couleur**
- 🟩 Grille de progression sur 6 mois sur chaque carte (façon GitHub)
- 🔥 Séries en cours et records (jours d'affilée)
- 📊 Statistiques **par mois** : taux de réussite, calendrier de chaleur, jours parfaits, détail par habitude
- 📈 Statistiques **par année** : réussite mois par mois, totaux, détail par habitude
- 📅 Vue détaillée par habitude : grille de l'année complète, navigation entre les années
- ✏️ Modifier / supprimer une habitude à tout moment

## Lancer en local

Aucune dépendance, aucun build :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

(ou `npx serve`, ou n'importe quel serveur statique)

## Installer sur son téléphone

Hébergez le dossier sur n'importe quel hébergement statique en HTTPS
(GitHub Pages, Netlify, Vercel…), puis :

- **iPhone (Safari)** : ouvrir l'URL → bouton Partager → « Sur l'écran d'accueil »
- **Android (Chrome)** : ouvrir l'URL → menu ⋮ → « Installer l'application »

L'app s'ouvre alors en plein écran, avec son icône, et fonctionne hors-ligne.

## Structure

| Fichier | Rôle |
|---|---|
| `index.html` | Structure de l'app (accueil, stats, feuilles d'édition et de détail) |
| `styles.css` | Tout le design (thème sombre) |
| `app.js` | Logique : habitudes, coches, séries, statistiques, rendu |
| `sw.js` | Service worker (cache hors-ligne) |
| `manifest.webmanifest` | Manifeste PWA (icône, nom, couleurs) |
| `icons/` | Icônes de l'app |

## Données

Stockées dans le `localStorage` du navigateur, clé `habits.v1` :

```json
{
  "habits": [{ "id": "…", "name": "Sport", "emoji": "💪", "color": "#4ADE80", "createdAt": "2026-08-30" }],
  "checks": { "idHabitude": { "2026-08-30": 1 } }
}
```

## Pistes d'amélioration

- Export / import des données (sauvegarde JSON)
- Cocher un jour passé (correction d'oubli)
- Rappels / notifications
- Habitudes « X fois par semaine » plutôt que quotidiennes
- Réordonner les habitudes par glisser-déposer
- Version native (Capacitor / React Native) si besoin des stores

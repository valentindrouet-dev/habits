# Mes Habitudes 🌱

Application mobile de suivi d'habitudes : chaque jour, cochez ce que vous avez fait,
et suivez vos progrès avec des statistiques au mois et à l'année.

C'est une **PWA** (Progressive Web App) : elle s'installe sur l'écran d'accueil du
téléphone comme une vraie app, fonctionne hors-ligne, et vos données restent
stockées sur votre appareil (aucun serveur, aucun compte).

## Fonctionnalités

- ✅ Cocher chaque jour les habitudes accomplies (bouton sur chaque tuile)
- 🎨 Autant d'habitudes que vous voulez, chacune avec son **emoji**, sa **couleur** et une description
- 🏷️ **Catégories** (avec emoji) pour filtrer les habitudes, + bouton « Fait » pour masquer ce qui est déjà coché
- 🔲 **3 modes d'affichage** (sélecteur flottant en bas) : grille de tuiles, liste de contrôle, grandes cartes
- 🟩 Grilles de progression teintées à la couleur de l'habitude (façon GitHub)
- 🔥 Séries en cours et records (jours d'affilée)
- 📊 Statistiques **par mois** : réalisations, taux de réussite, calendrier de chaleur, détail par habitude
- 📈 Statistiques **par année** : grande grille de l'année, courbe « Réalisations / Mois », détail par habitude
- 📅 Fiche par habitude : grille des 6 derniers mois + **calendrier interactif** pour cocher / corriger un jour passé
- ✏️ Modifier / supprimer habitudes et catégories à tout moment

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
  "habits": [{ "id": "…", "name": "Sport", "emoji": "💪", "color": "#4ADE80",
               "createdAt": "2026-08-30", "categoryId": null, "description": "" }],
  "checks": { "idHabitude": { "2026-08-30": 1 } },
  "categories": [{ "id": "…", "name": "Forme", "emoji": "🚴" }],
  "settings": { "viewMode": "grid", "showDone": true }
}
```

## Pistes d'amélioration

- Export / import des données (sauvegarde JSON)
- Rappels / notifications
- Objectifs « X fois par semaine » plutôt que quotidiens
- Réordonner les habitudes par glisser-déposer
- Archiver une habitude sans perdre son historique
- Version native (Capacitor / React Native) si besoin des stores

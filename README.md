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
- 🔍 **3 tailles par mode** (compact / normal / large) : appuyez sur l'icône de la vue active,
  ou pincez l'écran. Chaque vue garde sa propre taille
- 🟩 Grilles de progression teintées à la couleur de l'habitude (façon GitHub)
- 🔥 Séries en cours et records (jours d'affilée)
- 📊 Statistiques **par mois** : réalisations, taux de réussite, calendrier de chaleur, détail par habitude
- 📈 Statistiques **par année** : grande grille de l'année, courbe « Réalisations / Mois », détail par habitude
- 📅 Fiche par habitude : grille des 6 derniers mois + **calendrier interactif** pour cocher / corriger un jour passé
- ⏪ **Cocher dans le passé** : flèches ‹ › sur l'accueil pour revenir à hier ou avant et cocher directement
- 💾 **Sauvegarde** : export JSON (fichier ou presse-papier) et restauration, dans les Réglages
- 🔔 **Rappel quotidien** à l'heure de votre choix (voir les limites ci-dessous)
- ✋ **Réorganisation par glisser-déposer** : appui long sur une habitude puis déplacement (dans les 3 vues)
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

## Mises à jour

L'app est servie par un *service worker* en « réseau d'abord » pour son code
(HTML/CSS/JS) : **au lancement suivant un déploiement, la nouvelle version est
chargée automatiquement**. Le cache ne sert que de secours hors-ligne.

Si une nouvelle version arrive pendant que l'app est ouverte, un bandeau
« Nouvelle version disponible » apparaît. Réglages → **Version** affiche la version
installée et permet de forcer une vérification.

> Une version déjà installée avant ce changement pouvait rester bloquée sur
> l'ancien code (l'ancien service worker servait tout depuis le cache).
> Un rechargement forcé, ou une désinstallation/réinstallation, règle le cas une
> dernière fois ; ensuite les mises à jour se font toutes seules.

## Déploiement

**GitHub Pages** est configuré en « Deploy from a branch » : chaque push sur la
branche par défaut republie le site automatiquement, sans workflow à maintenir.
L'URL est stable :

```
https://valentindrouet-dev.github.io/habits/
```

C'est cette URL qu'il faut ajouter à l'écran d'accueil : elle reçoit toutes les
mises à jour, contrairement à un lien de prévisualisation.

## Rappel quotidien : ce qu'il faut savoir

Le rappel utilise les notifications web, qui n'ont pas les mêmes garanties qu'une app native :

- **Android (installée sur l'écran d'accueil)** : le rappel s'affiche même app fermée,
  tant que le système n'a pas mis l'app en veille profonde.
- **iPhone (installée sur l'écran d'accueil, iOS 16.4+)** : les notifications sont possibles,
  mais iOS ne garantit pas le réveil à heure fixe ; en pratique le rappel arrive
  de façon fiable à l'ouverture de l'app.
- **Navigateur simple (non installé)** : le rappel ne sonne que si l'app est ouverte dans un onglet.

Pour un rappel garanti à la seconde près comme une app native, il faudrait une version
native (Capacitor) ou des notifications push avec un petit serveur — faisable en évolution.

## Sauvegarde

Réglages → **Sauvegarde** :

- *Télécharger (.json)* enregistre un fichier `habitudes-AAAAMMJJ.json` ;
- *Copier* place la sauvegarde dans le presse-papier (pratique pour l'envoyer par message) ;
- *Restaurer* accepte un fichier ou un collage, avec une confirmation avant de remplacer les données.

À faire de temps en temps : les données vivent dans le navigateur, et effacer les données
de site les supprimerait.

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
  "settings": {
    "viewMode": "grid",
    "showDone": true,
    "reminder": { "enabled": false, "time": "20:00" },
    "zoom": { "grid": 1, "check": 1, "list": 1 }
  }
}
```

L'ordre du tableau `habits` est celui de l'affichage (modifié par glisser-déposer).

## Pistes d'amélioration

- Objectifs « X fois par semaine » plutôt que quotidiens
- Archiver une habitude sans perdre son historique
- Sauvegarde automatique vers un cloud (Drive, iCloud…)
- Rappels par habitude, et non un seul rappel global
- Version native (Capacitor / React Native) pour des notifications garanties et les stores

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
- 🗓️ Mini-grille **en lecture calendrier** sur chaque tuile : 7 colonnes (lundi → dimanche),
  une ligne par semaine ; en taille Large, l'en-tête L M M J V S D est affiché.
  Une colonne = toujours le même jour de la semaine, ce qui rend les motifs visibles
- 🟩 Grilles de progression teintées à la couleur de l'habitude
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

La version installée s'affiche en petit **à droite du titre** (`v0.07`), et dans
Réglages → **Version**, avec un bouton pour forcer une vérification. Si une nouvelle
version arrive pendant que l'app est ouverte, un bandeau « Nouvelle version
disponible » apparaît.

Pour publier une nouvelle version : incrémenter `APP_VERSION` dans `app.js`
et `VERSION` dans `sw.js`, puis pousser.

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

### Prérequis : l'app doit être installée

**Sur iPhone/iPad**, Apple ne permet les notifications web **que** pour les apps ajoutées
à l'écran d'accueil (iOS 16.4+) : depuis un simple onglet Safari, c'est impossible.
Sur Android, elles fonctionnent dans Chrome, mais l'app installée est nécessaire pour
un rappel quand l'app est fermée.

Les Réglages diagnostiquent la situation réelle et affichent la marche à suivre :
page dans un cadre (aperçu), app iOS non installée, autorisation refusée, ou tout bon.
Un bouton **Envoyer une notification test** permet de vérifier immédiatement.

### Autorisation refusée : comment la rétablir

- **iPhone** : Réglages iOS → Notifications → *Habits* → autoriser. Si l'app n'y figure
  pas, supprimez son icône, réinstallez-la depuis Safari, puis réactivez le rappel
  (les données sont conservées : elles appartiennent au site, pas à l'icône).
- **Android** : appui long sur l'icône → Infos sur l'appli → Notifications ; ou
  Chrome → ⋮ → Paramètres → Paramètres des sites → Notifications.
- **Ordinateur** : icône à gauche de la barre d'adresse → Notifications → Autoriser.

### Fiabilité

- **Android (installée sur l'écran d'accueil)** : le rappel s'affiche même app fermée,
  tant que le système n'a pas mis l'app en veille profonde.
- **iPhone (installée sur l'écran d'accueil, iOS 16.4+)** : les notifications sont possibles,
  mais iOS ne garantit pas le réveil à heure fixe ; en pratique le rappel arrive
  de façon fiable à l'ouverture de l'app.
- **Navigateur simple (non installé)** : le rappel ne sonne que si l'app est ouverte dans un onglet.

Pour un rappel garanti à la seconde près comme une app native, il faudrait une version
native (Capacitor) ou des notifications push avec un petit serveur — faisable en évolution.

## Sécurité des données

Les données vivent **sur l'appareil**. Trois protections sont en place, plus une
qui ne dépend que de vous.

### Comment des données pourraient disparaître

| Cause | Risque | Protégé ? |
|---|---|---|
| « Effacer les données de site » / historique | élevé | ❌ seul l'export protège |
| Suppression de l'icône (PWA iOS) | élevé | ❌ seul l'export protège |
| Perte, vol, changement de téléphone | élevé | ❌ seul l'export protège |
| Purge automatique du navigateur (espace disque, inactivité) | moyen | ✅ stockage persistant + copie de secours |
| localStorage vidé ou corrompu | moyen | ✅ récupération automatique depuis IndexedDB |
| Mauvaise manipulation (suppression, import raté) | moyen | ✅ copies locales quotidiennes (30 jours) |
| Bug d'écriture silencieux (quota plein…) | faible | ✅ bandeau d'alerte visible |

### Ce que fait l'app

1. **Stockage persistant** — au démarrage, l'app appelle `navigator.storage.persist()`
   pour demander au navigateur de ne pas évincer ses données quand l'espace se réduit.
   Accordé automatiquement sur Android quand l'app est installée ; refusé dans certains
   contextes (le panneau Réglages indique l'état réel).
2. **Copie de secours** — chaque enregistrement est dupliqué dans **IndexedDB**, un
   stockage distinct de localStorage. Si localStorage est vidé, l'app **restaure seule**
   au lancement suivant.
3. **Copies locales quotidiennes** — un instantané par jour, 30 conservés, restaurables
   depuis Réglages → *Copies locales*. C'est le filet contre une suppression accidentelle.
4. **Écritures surveillées** — une écriture qui échoue (quota plein, mode privé) affiche
   un bandeau rouge au lieu d'échouer en silence. Des données illisibles sont **mises de
   côté** (`habits.v1.corrompu.<date>`) au lieu d'être écrasées.

### Ce que l'app ne peut pas faire

Les points 1 à 4 vivent tous **sur le téléphone**. Ils ne protègent ni d'un
« effacer les données du site », ni d'une perte de l'appareil.

**La seule protection réelle est une copie hors de l'appareil** : Réglages →
*Sauvegarde hors de l'appareil* → *Télécharger (.json)* ou *Copier*.
L'app suit la date de la dernière sauvegarde et affiche une pastille orange sur
l'engrenage passé 14 jours. Un rythme mensuel suffit largement.

La restauration (fichier ou collage) demande une confirmation en deux temps,
car elle remplace tout.

## Structure

| Fichier | Rôle |
|---|---|
| `index.html` | Structure de l'app (accueil, stats, feuilles d'édition et de détail) |
| `styles.css` | Tout le design (thème sombre) |
| `app.js` | Logique : habitudes, coches, séries, statistiques, rendu |
| `sw.js` | Service worker (cache hors-ligne) |
| — | Copies de secours : IndexedDB `habits-backup`, magasin `copies` |
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
    "zoom": { "grid": 1, "check": 1, "list": 1 },
    "lastBackupAt": "2026-08-30T16:00:00.000Z"
  }
}
```

L'ordre du tableau `habits` est celui de l'affichage (modifié par glisser-déposer).

## Pistes d'amélioration

- Objectifs « X fois par semaine » plutôt que quotidiens
- Archiver une habitude sans perdre son historique
- Sauvegarde automatique vers un cloud (Drive, iCloud…) — la seule vraie protection
  contre la perte du téléphone qui ne demande aucun geste
- Rappels par habitude, et non un seul rappel global
- Version native (Capacitor / React Native) pour des notifications garanties et les stores

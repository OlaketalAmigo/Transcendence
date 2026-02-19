# Transcendence

---

## Configuration — Fichier `.env`

```env
POSTGRES_PASSWORD=coucou
JWT_SECRET=superlongsecretkeyatleast32characterspleasenevercommitthis
POSTGRES_DB=database
POSTGRES_HOST=database
POSTGRES_USER=user

GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_CALLBACK_URL=http://localhost:8080/api/auth/github/callback
```

> Les variables `GITHUB_*` sont à générer sur [github.com/settings/applications/new](https://github.com/settings/applications/new)

---

## Gestion des amitiés (PostgreSQL)

| Statut      | Signification              |
|-------------|----------------------------|
| `pending`   | Demande envoyée            |
| `accepted`  | Amis                       |
| `blocked`   | Utilisateur bloqué         |
| `rejected`  | Demande refusée            |

---

## Ressources

- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
- [Autoriser les OAuth Apps — GitHub](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [Créer une OAuth App — GitHub](https://docs.github.com/fr/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)

---

## Journal des modifications

### BACKEND

| Date  | Description |
|-------|-------------|
| 17/01 | Ajout du service/route pour le système de `game_room` — création/rejoindre une room, destruction automatique si vide, liste des rooms joignables et des joueurs avec scores et état |
| 21/01 | Ajout du service/route pour le système d'avatar — changement, suppression, et récupération de l'avatar |

### DATABASE

| Date  | Description |
|-------|-------------|
| 17/01 | Ajout des tables `game_rooms`, `game_players`, `game_rounds`, `words` — nom/statut/paramètres de game, joueurs/scores/rôles, historique des rounds, liste des mots |
| 21/01 | Ajout de `avatar_url` dans la table `users` |

---

---

# TETRIS

```
 ████████╗███████╗████████╗██████╗ ██╗███████╗
    ██╔══╝██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝
    ██║   █████╗     ██║   ██████╔╝██║███████╗
    ██║   ██╔══╝     ██║   ██╔══██╗██║╚════██║
    ██║   ███████╗   ██║   ██║  ██║██║███████║
    ╚═╝   ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝
```

Implémentation du jeu Tetris avec un thème cyberpunk, entièrement découpée en modules JS séparés.

---

## Architecture des fichiers

```
srcs/frontend/src/
├── pieces.js    ← Définition des 7 pièces Tetris et leurs rotations
├── tetris.js    ← Logique du jeu (classe Tetris)
├── renderer.js  ← Rendu canvas (grille principale, hold, next)
└── ui.js        ← Glue UI : boutons, overlay, liaison game ↔ DOM
```

```
srcs/frontend/
└── tetris.html  ← Structure HTML de la page
    tetris.css   ← Styles (thème cyberpunk)
```

---

## Contrôles clavier

| Touche      | Action                              |
|-------------|-------------------------------------|
| `←` `→`    | Déplacer la pièce horizontalement   |
| `↓`         | Descente douce (+1 pt)              |
| `Espace`    | Hard drop — chute instantanée (+2 pts par case) |
| `Q`         | Rotation gauche                     |
| `W`         | Rotation droite                     |
| `C`         | Hold — stocker / échanger la pièce courante |

---

## Flux de jeu

```
 spawn()
    │
    ▼
 tick() ──── toutes les timeToDown ms ────┐
    │                                      │
    ├─ canMoveDown ? ──── oui ──► moveDown()
    │
    └─ non ──► lockPiece()
                  │
                  ├─► verifierLignes()  (efface + score)
                  ├─► _makeHarder()     (accélération)
                  └─► spawn()
                         │
                         └─ canSpawn ? ──── non ──► GAME OVER
```

---

## `pieces.js` — Les pièces Tetris

### Classe de base : `Piece`

Classe abstraite dont héritent toutes les pièces du jeu.

```
┌─────────────────────────────────────────────────────────────┐
│  class Piece                                                │
├─────────────────────────────────────────────────────────────┤
│  position          { x, y } — coordonnées dans la grille   │
│  currentRotation   index de la rotation active             │
│  rotations         tableau de toutes les formes rotées      │
│  shape             forme actuellement active                │
└─────────────────────────────────────────────────────────────┘
```

| Méthode            | Description |
|--------------------|-------------|
| `defineRotations()`| Retourne le tableau de toutes les matrices de rotation de la pièce. Surchargée dans chaque sous-classe. |
| `getColor()`       | Retourne l'index couleur de la pièce (1 à 7). Surchargée dans chaque sous-classe. |
| `getPosition()`    | Retourne une copie de `{ x, y }` — position actuelle dans la grille. |
| `getShape()`       | Retourne la matrice 2D de la forme active (rotation courante). |
| `moveDown()`       | Incrémente `y` de 1 — descend la pièce d'une case. |
| `moveLeft()`       | Décrémente `x` de 1 — déplace la pièce d'une case à gauche. |
| `moveRight()`      | Incrémente `x` de 1 — déplace la pièce d'une case à droite. |
| `rotateLeft()`     | Passe à la rotation précédente dans le tableau (sens anti-horaire). |
| `rotateRight()`    | Passe à la rotation suivante dans le tableau (sens horaire). |

---

### Les 7 pièces — sous-classes de `Piece`

Chaque pièce définit ses rotations via une matrice `1`/`0` et son index couleur.

| Classe          | Forme | Couleur (index) | Rotations |
|-----------------|-------|-----------------|-----------|
| `PieceT`        | T     | Violet `1`      | 4         |
| `PieceL`        | L     | Orange `2`      | 4         |
| `PieceReverseL` | J     | Bleu `3`        | 4         |
| `PieceI`        | I     | Cyan `4`        | 2         |
| `PieceZ`        | Z     | Rouge `5`       | 2         |
| `PieceReverseZ` | S     | Vert `6`        | 2         |
| `PieceO`        | O     | Jaune `7`       | 1         |

**Exemple — `PieceT` (4 rotations) :**
```
Rotation 0    Rotation 1    Rotation 2    Rotation 3
  0 1 0         0 1 0         0 0 0         0 1 0
  1 1 1         0 1 1         1 1 1         1 1 0
  0 0 0         0 1 0         0 1 0         0 1 0
```

---

## `tetris.js` — Logique du jeu

### Classe `Tetris`

```
┌─────────────────────────────────────────────────────────────────────┐
│  new Tetris(onRender, onGameOver)                                   │
├─────────────────────────────────────────────────────────────────────┤
│  onRender    : () => void        — callback de rendu à chaque frame │
│  onGameOver  : (score) => void   — callback appelé en fin de partie │
└─────────────────────────────────────────────────────────────────────┘
```

#### État interne

| Propriété            | Type      | Description |
|----------------------|-----------|-------------|
| `grid`               | `number[][]` | Grille principale 10×20 — `0` = vide, sinon index couleur |
| `bufferGrid`         | `number[][]` | Grille 10×5 utilisée pour afficher la pièce suivante |
| `currentPiece`       | `Piece`   | Pièce en cours de chute |
| `nextPiece`          | `Piece`   | Prochaine pièce à spawner |
| `storedPiece`        | `Piece`   | Pièce en hold (stockée par le joueur) |
| `score`              | `number`  | Score courant |
| `timeToDown`         | `number`  | Intervalle (ms) entre deux descentes automatiques |
| `hardening`          | `number`  | Seuil de points avant chaque accélération |
| `decrementTTD`       | `number`  | Réduction de `timeToDown` à chaque palier |
| `count`              | `number`  | Accumulateur de points depuis le dernier palier |
| `isRunning`          | `boolean` | Vrai si une partie est en cours |
| `isPaused`           | `boolean` | Vrai si la partie est en pause |
| `canStore`           | `boolean` | Faux si le hold a déjà été utilisé depuis le dernier spawn |

---

### Méthodes publiques

| Méthode                | Description |
|------------------------|-------------|
| `configure(options)`   | Applique les paramètres de difficulté — `timeToDown`, `hardening`, `decrementTTD`. Doit être appelé **avant** `start()` pour que `timeToDown` soit pris en compte. |
| `start()`              | Initialise et démarre une nouvelle partie (réinitialise la grille, le score, et spawn la première pièce). |
| `stop()`               | Arrête la partie — annule la boucle `requestAnimationFrame` et retire l'écouteur clavier. |
| `pause()`              | Bascule entre pause et reprise. En reprise, réinitialise `lastTime` pour éviter un saut d'accumulation. |

---

### Méthodes privées

#### Boucle de jeu

| Méthode              | Description |
|----------------------|-------------|
| `_startGameLoop()`   | Lance la boucle via `requestAnimationFrame`. Calcule le `deltaTime` entre chaque frame et accumule le temps. Déclenche `_tick()` dès que l'accumulateur dépasse `timeToDown`. |
| `_tick()`            | Un pas logique du jeu : descend la pièce si possible, sinon la verrouille, vérifie les lignes, accélère le jeu, puis spawne la suivante. Si le spawn est impossible → game over. |

#### Gestion des pièces

| Méthode                | Description |
|------------------------|-------------|
| `_spawnNewPiece()`     | Fait de `nextPiece` la pièce courante, génère une nouvelle `nextPiece`, et met à jour la `bufferGrid`. |
| `_createRandomPiece()` | Instancie aléatoirement l'une des 7 pièces à la position de départ `(3, 0)`. |
| `_updateBufferGrid()`  | Recrée la grille miniature `bufferGrid` (10×5) centrée sur la forme de `nextPiece`. |
| `_lockPiece()`         | Grave la forme et la couleur de `currentPiece` dans `grid` à sa position actuelle. |
| `_storePiece()`        | Échange `currentPiece` et `storedPiece` (ou stocke la pièce courante si hold vide). Désactive le hold jusqu'au prochain spawn. |
| `_rotatePiece(dir)`    | Tente une rotation (`-1` = gauche, `1` = droite). En cas de collision, essaie des décalages latéraux ou verticaux (wall kick) avant d'annuler. |
| `_hardDrop()`          | Téléporte la pièce au bas de sa trajectoire, ajoute +2 pts par case parcourue, puis la verrouille immédiatement. |

#### Collisions

| Méthode              | Description |
|----------------------|-------------|
| `_canMoveDown()`     | Vérifie que chaque cellule de la pièce peut descendre d'une ligne (pas de mur bas, pas de case occupée). |
| `_canMoveLeft()`     | Vérifie que chaque cellule peut se déplacer d'une colonne à gauche. |
| `_canMoveRight()`    | Vérifie que chaque cellule peut se déplacer d'une colonne à droite. |
| `_isValidPosition()` | Vérifie que la pièce est entièrement dans les limites de la grille et n'occupe aucune case déjà remplie. |
| `_canSpawn()`        | Alias de `_isValidPosition()` — utilisé pour détecter le game over après un spawn. |

#### Score & difficulté

| Méthode          | Description |
|------------------|-------------|
| `verifierLignes()` | Parcourt la grille de bas en haut. Supprime chaque ligne complète, insère une ligne vide en haut. Ajoute les points selon le nombre de lignes effacées simultanément : `0→0 / 1→100 / 2→300 / 3→500 / 4→800`. |
| `_makeHarder()`  | Si `count` (points accumulés depuis le dernier palier) dépasse `hardening`, remet `count` à 0 et réduit `timeToDown` de `decrementTTD` (minimum 100 ms). |
| `_gameOver()`    | Appelle `stop()` puis déclenche le callback `onGameOver(score)`. |

#### Entrées clavier

| Méthode           | Description |
|-------------------|-------------|
| `_handleKey(e)`   | Écouteur `keydown`. Dispatche l'action selon la touche pressée. Appelle `onRender()` après chaque action. Ignoré si la partie est en pause (sauf pour les touches déjà bloquées par `isRunning`). |

---

### Paramètres de difficulté

| Paramètre     | Défaut   | Description |
|---------------|----------|-------------|
| `timeToDown`  | `1000 ms`| Intervalle entre deux descentes automatiques. Plus faible = plus rapide. |
| `hardening`   | `1000 pts`| Points cumulés avant chaque accélération. Plus élevé = progression plus lente. |
| `decrementTTD`| `100 ms` | Réduction de `timeToDown` à chaque palier. Plus élevé = accélération plus brutale. |

---

## `renderer.js` — Rendu canvas

### Constantes

| Constante | Valeur | Description |
|-----------|--------|-------------|
| `CELL`    | `30`   | Taille en pixels d'une cellule dans la grille principale |
| `COLORS`  | tableau| 8 couleurs indexées de `0` (fond) à `7` (jaune) — thème cyberpunk |

### Fonctions

| Fonction                              | Description |
|---------------------------------------|-------------|
| `drawCell(ctx, x, y, colorIndex, size)` | Dessine une cellule colorée à la position `(x, y)` avec un effet 3D : highlight blanc en haut/gauche, ombre noire en bas/droite. |
| `clearCanvas(ctx, w, h)`              | Efface un canvas en le remplissant avec la couleur de fond `#070712`. |
| `drawGridLines(ctx, cols, rows, size)`| Trace la grille de fond en lignes semi-transparentes (opacité 4 %). |
| `drawGhost(ctx, piece, grid)`         | Calcule et affiche la "pièce fantôme" — projection de la pièce courante au bas de sa trajectoire, dessinée en contour blanc semi-transparent. |
| `drawMiniPiece(ctx, piece, w, h)`     | Dessine une pièce centrée dans un petit canvas (pour les panneaux **Next** et **Hold**), en utilisant des cellules de 20 px. |
| `render()`                            | Fonction de rendu principale appelée à chaque frame. Redessine : la grille principale, les cellules verrouillées, la pièce ghost, la pièce courante, les panneaux Next/Hold, et le score. |

---

## `ui.js` — Interface utilisateur

### Fonctions

| Fonction                    | Description |
|-----------------------------|-------------|
| `updateButtons()`           | Met à jour l'état des boutons et des inputs selon `game.isRunning` et `game.isPaused` — désactive Start si en cours, active Pause/Stop seulement pendant une partie, bascule le label entre "Pause" et "Resume", verrouille les inputs de settings pendant le jeu. |
| `showOverlay(title, score)` | Affiche l'overlay (écran superposé) avec un titre et optionnellement un score. Utilisé pour "GAME OVER", "PAUSE", et "STOPPED". |
| `hideOverlay()`             | Retire la classe `visible` de l'overlay pour le masquer. |
| `applySettings()`           | Lit les valeurs des trois inputs de configuration et appelle `game.configure(...)` pour mettre à jour les paramètres de difficulté. |

### Initialisation

```js
const game = new Tetris(
    () => { render(); updateButtons(); },     // onRender
    (score) => { render(); updateButtons(); showOverlay('GAME OVER', score); } // onGameOver
);
```

| Événement                        | Action |
|----------------------------------|--------|
| Clic `btn-start`                 | Masque l'overlay, démarre la partie, met à jour UI et canvas |
| Clic `btn-pause`                 | Bascule pause, affiche ou masque l'overlay "PAUSE" |
| Clic `btn-stop`                  | Arrête la partie, affiche l'overlay "STOPPED" |
| `change` sur les inputs settings | Appelle `applySettings()` pour reconfigurer la difficulté |

---

## Système de couleurs

```
Index  Couleur    Hex        Pièce
  0    Fond       #070712    (vide)
  1    Violet     #a855f7    PieceT
  2    Orange     #f97316    PieceL
  3    Bleu       #3b82f6    PieceReverseL
  4    Cyan       #06b6d4    PieceI
  5    Rouge      #ef4444    PieceZ
  6    Vert       #22c55e    PieceReverseZ
  7    Jaune      #eab308    PieceO
```

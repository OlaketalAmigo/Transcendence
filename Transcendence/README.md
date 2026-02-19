# Transcendence

Exemple d'../.env fonctionnel:

POSTGRES_PASSWORD=coucou
JWT_SECRET=superlongsecretkeyatleast32characterspleasenevercommitthis
POSTGRES_DB=database
POSTGRES_HOST=database
POSTGRES_USER=user

GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_CALLBACK_URL=http://localhost:8080/api/auth/github/callback

Les Variables d'env GITHUB_* sont a generer sur ce lien 'https://github.com/settings/applications/new'


Gestion de friendship dans POSTGRESQL:
'pending' → demande envoyée
'accepted' → amis
'blocked' → bloqué
'rejected' → refusé

Ressource:
    https://www.postgresql.org/docs/
    https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
    https://docs.github.com/fr/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app

/////////////////////////////////////////////////////////////////////////////////////////

BACKEND

17/01   - Ajout du service/route pour le systeme de game_room
        permet aux joueurs de creer et rejoindre des rooms
        une room vide est automatiquement detruite.
        - Presence d'une fonction affichant toutes les rooms joignables
        ainsi qu'une autre fonction pour afficher tous les joueurs de la room avec
        leur scores et leur etat actuel.
        - Aucun moyen de changer l'etat de la room de waiting a en cours ou finished
        ca attendra le systeme du jeu

21/01   - Ajout du service/route pour le systeme d'avatar
        permet aux utilisateurs de changer ou supprimer leur avatar actuel
        - Ajout egalement d'une simple fonction pour recuperer l'avatar d'un utilisateur (pour le frontend)

DATABASE

17/01   Ajout des tables game_rooms, game_players, game_rounds, words
        - nom, status et parametres de la game
        - joueurs dans la game, leur scores et leur role actuel (dessinateur, devineur)
        - historique de la game, qui a dessine quoi precedemment ainsi que les timers des rounds, sera aussi utile si on veut faire les stats de compte a l'avenir.
        - contient la liste des mots utilisable par les joueurs

21/01   Ajout de avatar_url dans la table users

/////////////////////////////////////////////////////////////////////////////////////////

TETRIS

Feuille de route
    - Ajout du jeu Tetris au projet Transcendence
    - Bouton Tetris qui redirige vers une page dédiée (tetris.html)
    - Architecture modulaire : le monolithe HTML a été découpé en 5 fichiers séparés :
        tetris.html  — structure de la page
        tetris.css   — styles (thème cyberpunk)
        pieces.js    — définition des 7 pièces Tetris et leurs rotations
        tetris.js    — logique du jeu (classe Tetris)
        renderer.js  — rendu canvas (grille, hold, next)
        ui.js        — glue UI : boutons, overlay, liaison game ↔ DOM

Architecture — classe Tetris (tetris.js)
    Constructeur
        new Tetris(onRender, onGameOver)
        onRender    : callback appelé à chaque frame pour redessiner
        onGameOver  : callback appelé avec le score final

    Méthodes publiques
        start()                         — initialise et lance une partie
        stop()                          — arrête la partie en cours
        pause()                         — bascule pause / reprise
        configure({ timeToDown,         — modifie les paramètres de difficulté
                    hardening,            (efficace uniquement avant start()
                    decrementTTD })       pour timeToDown)

    Paramètres de difficulté (configurables via le panneau Settings)
        timeToDown   (ms, défaut 1000)  — intervalle entre deux descentes automatiques.
                                          Plus la valeur est petite, plus le jeu est rapide.
        hardening    (pts, défaut 1000) — nombre de points de score cumulés avant chaque
                                          accélération. Augmenter = progression plus lente.
        decrementTTD (ms, défaut 100)   — réduction de timeToDown à chaque palier atteint.
                                          Augmenter = accélération plus brutale.

    Flux de jeu
        spawn → tick (toutes les timeToDown ms) → moveDown ou lockPiece
        → verifierLignes (score + lignes) → _makeHarder → spawn suivant
        → game over si la pièce spawne dans une case occupée

Contrôles clavier
    ← →      Déplacer la pièce
    ↓        Descente douce (+1 pt)
    Espace   Hard drop (+2 pts par case)
    Q        Rotation gauche
    W        Rotation droite
    C        Hold (stocker / échanger la pièce courante)
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

17/01   Ajout du service/route pour le systeme de game_room
        permet aux joueurs de creer et rejoindre des rooms
        une room vide est automatiquement detruite.
        Presence d'une fonction affichant toutes les rooms joignables
        ainsi qu'une autre fonction pour afficher tous les joueurs de la room avec
        leur scores et leur etat actuel.
        Aucun moyen de changer l'etat de la room de waiting a en cours ou finished
        ca attendra le systeme du jeu

DATABASE

17/01   Ajout des tables game_rooms, game_players, game_rounds, words
        - nom, status et parametres de la game
        - joueurs dans la game, leur scores et leur role actuel (dessinateur, devineur)
        - historique de la game, qui a dessine quoi precedemment ainsi que les timers des rounds, sera aussi utile si on veut faire les stats de compte a l'avenir.
        - contient la liste des mots utilisable par les joueurs
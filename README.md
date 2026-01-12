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

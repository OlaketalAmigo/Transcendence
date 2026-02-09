#!/bin/bash
#ce script va lancer le projet icp_container en prenant les fichier du volume

#create le projet
dfx new tetris --type motoko --frontend sveltekit

#remplacement du fichier index.scss
rm -rf /tetris/src/tetris_frontend/src/index.scss
mv /src/index.scss /tetris/src/tetris_frontend/src/.

#remplacement du fichier +page.svelte
rm -rf /tetris/src/tetris_frontend/src/routes/+page.svelte
mv /src/+page.svelte /tetris/src/tetris_frontend/src/routes/.

#ajout du dossier contenant le fichier tetris.ts
mv /src/game /tetris/src/tetris_frontend/src/lib/.

#ajout du dossier contenant les fichiers GameUI.svelte, tetrisGame.svelte et TetrisGrid.svelte
mv /src/components /tetris/src/tetris_frontend/src/lib/.
cd tetris #chemin du volume

dfx start --background --host 0.0.0.0:4943
dfx deploy

sleep infinity
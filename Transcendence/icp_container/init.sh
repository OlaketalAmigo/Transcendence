#!/bin/bash
#ce script va lancer le projet icp_container en prenant les fichier du volume

cd tetris #chemin du volume

npm install # pour installer les dependancce npm au cas ou

dfx cache install # pour installer les dependance motoko via dfx

#telecharger les dependance des canister
dfx deps pull
dfx deps init
dfx deps deploy


dfx start --background --host 0.0.0.0:4943
dfx deploy

sleep infinity
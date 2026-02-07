#!/bin/bash
#ce script va lancer le projet icp_container en prenant les fichier du volume

#create le projet
dfx new tetris --type motoko --frontend sveltekit

cd tetris #chemin du volume

dfx start --background --host 0.0.0.0:4943
dfx deploy

sleep infinity
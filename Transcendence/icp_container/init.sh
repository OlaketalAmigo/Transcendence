#!/bin/bash
#cette commande créer un nouveau projet dfx
#les options --type et --frontend permettent
#in finne d'enlever l'interaction de création
#(sinon on ne peut pas automatiser et un humain doit-etre derriere)
#mokoto pour le backend et sveltekit comme framework pour le front-end

#je dois faire une condition pour les lancements suivants
#il créera le projet s'il n'est pas deja la, sinon,
#il passe directement aux autres commande

if [ ! -d ./icp_container ]; then
    dfx new icp_container --type motoko  --frontend sveltekit
fi

cd icp_container
dfx start --background --host 0.0.0.0:4943
dfx deploy

sleep infinity
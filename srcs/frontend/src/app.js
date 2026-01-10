import {Element, MenuElement} from "./element.js";
import {Grid} from "./grid.js";
import {fenetre, LoginWindow} from "./windows.js";

function direBonjour() {
    alert("clicked !");
}

const menuElement = new Element("menu");
const loginElement = new MenuElement("login");
const registeredElement = new MenuElement("registered");
const explorerElement = new MenuElement("explorer");
const accueilElement = new MenuElement("accueil");

// Lancement de la grille
const gridgreen = new Grid('#143a0fff', -1, 25, 0.12, "normal");
const gridReverseRed = new Grid('#3a0f0f75', -1, 12.5, 0.09, "reverse");

//Ajouter les fenetres
const test = new fenetre();
const loginWindow = new LoginWindow();

document.getElementById("login").addEventListener("click", () => {
    loginWindow.show();
});

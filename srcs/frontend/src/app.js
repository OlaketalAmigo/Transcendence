import {Element, MenuElement} from "./element.js";
import {Grid} from "./grid.js";
import {fenetre} from "./windows.js";
import {LoginWindow} from "./login.js";
import { GlobalChat } from "./global_chat.js";
 

function direBonjour() {
  alert("clicked !");
}

// Définir les éléments du menu (structure logique)
const menuElement = new Element("menu");
const loginElement = new MenuElement("login");
const registeredElement = new MenuElement("registered");
const explorerElement = new MenuElement("explorer");
const accueilElement = new MenuElement("accueil");
const globalChatElement = new MenuElement("global_chat");

// Lancement de la grille (commentés si on ne l’utilise pas tout de suite)
// const gridgreen = new Grid('#143a0fff', -1, 25, 0.12, "normal");
// const gridReverseRed = new Grid('#3a0f0f75', -1, 12.5, 0.09, "reverse");

// Fenêtres et écrans
const test = new fenetre();
const loginWindow = new LoginWindow();
const global_chat = new GlobalChat();

// Actions UI
document.getElementById("login").addEventListener("click", () => {
  // Toggle login window visibility
  if (loginWindow.main && loginWindow.main.style.display !== "none") {
    loginWindow.hide();
  } else {
    loginWindow.show();
  }
});

document.getElementById("global_chat").addEventListener("click", () => {
  // Toggle global chat visibility
  if (global_chat.main && global_chat.main.style.display !== "none") {
    global_chat.hide();
  } else {
    global_chat.show();
  }
});

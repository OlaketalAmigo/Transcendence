import {Element, MenuElement} from "./element.js";
import {fenetre} from "./windows.js";
import {LoginWindow} from "./login.js";
import { GlobalChat } from "./global_chat.js";
import {avatarWindows} from "./avatarWindows.js"; 

function direBonjour() {
  alert("clicked !");
}

// Define the elements of the menu (logical structure)
const menuElement = new Element("menu");
const loginElement = new MenuElement("login");
const registeredElement = new MenuElement("registered");
const explorerElement = new MenuElement("explorer");
const accueilElement = new MenuElement("accueil");
const globalChatElement = new MenuElement("global_chat");
const avatarElement = new MenuElement("avatar");
// Windows and screens
const loginWindow = new LoginWindow();
const global_chat = new GlobalChat();
const avatar_windows = new avatarWindows();


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


document.getElementById("avatar").addEventListener("click", () => {
  // Toggle global chat visibility
  if (avatarWindows.main && avatarWindows.main.style.display !== "none") {
    avatarWindows.hide();
  } else {
    avatarWindows.show();
  }
});
function direBonjour() {
    alert("clicked !");
}

class Element {
    constructor(id) {
        this.element = document.getElementById(id);
        this.element.addEventListener("mouseenter", () => { 
            console.log("La souris est sur le bouton " + id + " !");
        });
        this.element.addEventListener("mouseleave", () => { 
            console.log("La souris a quitté le bouton " + id + ".");
        });
    }
}

class MenuElement extends Element {
    constructor(id) {
        super(id);
        this.element.addEventListener("click", () => { 
            console.log("Le bouton " + id + " a été cliqué !");
        });
        this.element.addEventListener("mouseenter", () => { 
            this.element.style.backgroundColor = "lightgrey";
            this.element.style.fontSize = "1.2em";
            this.element.style.cursor = "move";
        });
        this.element.addEventListener("mouseleave", () => { 
            this.element.style.backgroundColor = "";
            this.element.style.fontSize = "";
            this.element.style.cursor = "";
            this.element.getAnimations().forEach(animation => animation.cancel());
        });
    }
}



class Grid {
    constructor(color = '#143a0fff', zIndex = 1, gridSize = 25, speed = 0.35, sens = "normal") {
        // Initialisation des propriétés de l'instance
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.offset = 0;
        this.gridSize = gridSize;
        this.speed = speed;
        this.color = color;

        // Configuration du style
        document.body.appendChild(this.canvas);
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = zIndex;
        this.canvas.style.pointerEvents = 'none'; // Pour ne pas bloquer les clics sur les boutons

        // Gestion du redimensionnement
        window.addEventListener('resize', () => this.resize());
        this.resize();
        this.draw(sens);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    draw(sens = "normal") {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = 1;

        // Mise à jour de l'offset
        this.offset = (this.offset + this.speed) % this.gridSize;
        if (sens === "normal") {
            // Lignes verticales
            for (let x = this.offset; x < this.canvas.width; x += this.gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.canvas.height);
                this.ctx.stroke();
            }

            // Lignes horizontales
            for (let y = this.offset; y < this.canvas.height; y += this.gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.canvas.width, y);
                this.ctx.stroke();
            }
        }
        //pareillement pour le sens reverse
        else if (sens === "reverse") {
            // Lignes verticales
            for (let x = this.gridSize - this.offset; x < this.canvas.width; x += this.gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.canvas.height);
                this.ctx.stroke();
            }
            // Lignes horizontales
            for (let y = this.gridSize - this.offset; y < this.canvas.height; y += this.gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.canvas.width, y);
                this.ctx.stroke();
            }
        }
        // Appel récursif pour l'animation
        requestAnimationFrame(() => this.draw(sens));
    }
    
}

class fenetre {
    constructor(width = 320, height = 220, title = "Window") {
        this.main = document.createElement("div");
        this.main.style.width = width + "px";
        this.main.style.height = height + "px";
        this.main.style.position = "fixed";
        this.main.style.top = "50%";
        this.main.style.left = "50%";
        this.main.style.transform = "translate(-50%, -50%)";
        this.main.style.backgroundColor = "#000";
        this.main.style.border = "2px ridge white";
        this.main.style.color = "white";
        this.main.style.zIndex = "100";
        this.main.style.display = "none";

        // Header
        this.header = document.createElement("div");
        this.header.innerText = title;
        this.header.style.padding = "6px";
        this.header.style.background = "#222";
        this.header.style.cursor = "move";

        // Close
        this.closeBtn = document.createElement("span");
        this.closeBtn.innerText = "✖";
        this.closeBtn.style.float = "right";
        this.closeBtn.style.cursor = "pointer";
        this.closeBtn.onclick = () => this.hide();

        this.header.appendChild(this.closeBtn);

        // Body
        this.body = document.createElement("div");
        this.body.style.padding = "10px";

        this.main.append(this.header, this.body);
        document.body.appendChild(this.main);
    }

    show() {
        this.main.style.display = "block";
    }

    hide() {
        this.main.style.display = "none";
    }
}

class LoginWindow extends fenetre {
    constructor() {
        super(320, 240, "Connexion");

        this.mode = "login"; // login | register

        this.username = document.createElement("input");
        this.username.placeholder = "Username";

        this.password = document.createElement("input");
        this.password.type = "password";
        this.password.placeholder = "Password";

        this.submit = document.createElement("button");
        this.submit.innerText = "Se connecter";

        this.switch = document.createElement("button");
        this.switch.innerText = "S'inscrire";

        this.message = document.createElement("div");
        this.message.style.fontSize = "0.8em";

        this.body.append(
            this.username,
            this.password,
            this.submit,
            this.switch,
            this.message
        );

        this.applyStyles();
        this.bindEvents();
    }

    applyStyles() {
        this.body.style.display = "flex";
        this.body.style.flexDirection = "column";
        this.body.style.gap = "8px";
    }

    bindEvents() {
        this.switch.onclick = () => this.toggleMode();

        this.submit.onclick = () => {
            this.message.innerText =
                this.mode === "login"
                    ? "Tentative de connexion..."
                    : "Tentative d'inscription...";
        };
    }

    toggleMode() {
        if (this.mode === "login") {
            this.mode = "register";
            this.header.firstChild.textContent = "Inscription";
            this.submit.innerText = "S'inscrire";
            this.switch.innerText = "Se connecter";
        } else {
            this.mode = "login";
            this.header.firstChild.textContent = "Connexion";
            this.submit.innerText = "Se connecter";
            this.switch.innerText = "S'inscrire";
        }
    }
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

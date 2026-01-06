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

class fenetre{
    constructor(width = 300, height = 150) {
        this.width = width;
        this.height = height;
        this.main = document.createElement("div");
        this.main.style.width = this.width + "px";
        this.main.style.height = this.height + "px";
        this.main.style.position = "absolute";
        this.main.style.top = "50%";
        this.main.style.left = "50%";
        this.main.style.transform = "translate(-50%, -50%)";
        this.main.style.backgroundColor = '#000000ff';
        this.main.style.border = "1.4mm ridge white";
        this.body = document.createElement("div");
        this.body.style.width = "50%";
        this.body.style.height = "50%";
        this.body.style.backgroundColor = '#faeaea';
        document.body.appendChild(this.main);
        this.main.appendChild(this.body);
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
const loginWindow = new fenetre();
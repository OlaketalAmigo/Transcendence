export class Grid {
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
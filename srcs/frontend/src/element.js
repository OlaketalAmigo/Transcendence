export class Element {
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

export class MenuElement extends Element {
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
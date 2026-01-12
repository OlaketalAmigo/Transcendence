export class fenetre {
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


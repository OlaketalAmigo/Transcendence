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

export class LoginWindow extends fenetre {
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

    async connexion() {
        console.log("methode connexion lancée");
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: this.username.value,
                password: this.password.value
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("OK", data);
        } else {
            console.error("ERROR", data);
        }
    }


    async inscription(){
        console.log("methode inscription lancée");
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: this.username.value,
                password: this.password.value
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("OK", data);
        } else {
            console.error("ERROR", data);
        }
    }

    bindEvents() {
        this.switch.onclick = () => this.toggleMode();

        this.submit.onclick = () => {
            this.message.innerText = this.mode === "login"
                                                    ? "Tentative de connexion..."
                                                    : "Tentative d'inscription...";
            if (this.mode === "login"){
                this.connexion();
            }
            else {
                this.inscription();
            }
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
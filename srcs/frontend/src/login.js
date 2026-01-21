import {fenetre} from "./windows.js";

export class LoginWindow extends fenetre {
    constructor() {
        super(320, 240, "Connexion");

        this.mode = "login";

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

        //  **** APPEND FUNCTION GITHUB ****
        this.githubBtn = document.createElement("button");
        this.githubBtn.innerText = "Se connecter avec GitHub";
        this.githubBtn.style.backgroundColor = "#24292e";
        this.githubBtn.style.color = "white";
        this.githubBtn.onclick = () => {
            // open  OAuth GitHub  in popup and receive token with postMessage
            const w = 600;
            const h = 700;
            const left = (screen.width - w) / 2;
            const top = (screen.height - h) / 2;
            const popup = window.open('/api/auth/github', 'githubOAuth', `width=${w},height=${h},left=${left},top=${top}`);
            const listener = (ev) => {
                if (ev.data && ev.data.token) {
                    localStorage.setItem('auth_token', ev.data.token);
                    this.message.innerText = 'Connexion GitHub réussie ! Bienvenue.';
                    this.message.style.color = '#3cff01';
                    window.removeEventListener('message', listener);
                    if (popup) popup.close();
                }
            };
            window.addEventListener('message', listener, {once: true});
        };
        this.body.appendChild(this.githubBtn);

        this.checkIfAlreadyLoggedIn();
    }

    applyStyles() {
        this.body.style.display = "flex";
        this.body.style.flexDirection = "column";
        this.body.style.gap = "8px";
    }

    checkIfAlreadyLoggedIn(){
        const token = localStorage.getItem("auth_token");
        if (token) {
            this.message.innerText = "Vous êtes déjà connecté !";
            this.message.style.color = "#3cff01";
        }
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
            console.log("connexion ok", data);
            //  *** STORAGE TOKEN ***
            if (data.token) {
                localStorage.setItem("auth_token", data.token);
                this.message.innerText = "Connexion réussie ! Bienvenue.";
                this.message.style.color = "#3cff01";

                // mask  windows after 1.5s
                setTimeout(() => this.hide(), 1500);

            } 
            else {
                this.message.innerText = "Token manquant dans la réponse";
                this.message.style.color = "#ff4444";
            }
        } 
        else {
            // print une error user invisibled
            const errMsg = data && data.message ? data.message : "Échec de la connexion";
            this.message.innerText = errMsg;
            this.message.style.color = "#ff4d4d";
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

import {fenetre} from "./windows.js";
export class GlobalChat extends fenetre {
    constructor() {
        super(320, 240, "Global Chat");

        // Création des éléments
        this.output = document.createElement("div");
        this.output.className = "chat-output";

        this.input = document.createElement("input");
        this.input.type = "text";
        this.input.placeholder = "Tape ton message...";
        this.input.className = "chat-input";

        this.sendButton = document.createElement("button");
        this.sendButton.textContent = "Envoyer";
        this.sendButton.className = "send-btn";

        this.inputContainer = document.createElement("div");
        this.inputContainer.className = "input-container";
        this.inputContainer.append(this.input, this.sendButton);

        this.body.append(this.output, this.inputContainer);

        this.applyStyles();
        this.applyEvents();
        this.connect_sockio_global_chat();
    }

    applyStyles() {
        // Conteneur principal en flex column
        this.body.style.display = "flex";
        this.body.style.flexDirection = "column";
        this.body.style.height = "100%";
        this.body.style.padding = "10px";
        this.body.style.boxSizing = "border-box";
        this.body.style.gap = "10px";

        // Zone des messages
        this.output.style.flex = "1";
        this.output.style.overflowY = "auto";
        this.output.style.padding = "8px";
        this.output.style.background = "#f8f9fa";
        this.output.style.borderRadius = "6px";
        this.output.style.display = "flex";
        this.output.style.flexDirection = "column";
        this.output.style.gap = "10px";

        // Conteneur input + bouton
        this.inputContainer.style.display = "flex";
        this.inputContainer.style.gap = "8px";
        this.inputContainer.style.paddingTop = "8px";

        // Input
        this.input.style.flex = "1";
        this.input.style.padding = "8px 12px";
        this.input.style.border = "1px solid #ccc";
        this.input.style.borderRadius = "6px";
        this.input.style.fontSize = "14px";

        // Bouton envoyer
        this.sendButton.style.padding = "8px 16px";
        this.sendButton.style.background = "#0066cc";
        this.sendButton.style.color = "white";
        this.sendButton.style.border = "none";
        this.sendButton.style.borderRadius = "6px";
        this.sendButton.style.cursor = "pointer";
        this.sendButton.style.fontWeight = "500";
    }

    applyEvents() {
        // Envoi avec le bouton
        this.sendButton.addEventListener("click", () => this.sendMessage());

        // Envoi avec Entrée
        this.input.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    async connect_sockio_global_chat() {
        const token = localStorage.getItem("auth_token");

        console.log("Tentative de connexion Socket.IO");
        console.log("→ Token trouvé ? ", !!token);
        if (token) console.log("→ Token (début) : ", token.substring(0, 20) + "...");

        if (!token) {
            console.error("→ ERREUR : Aucun token dans localStorage → connexion impossible");
            this.output.innerHTML += '<div class="system">Erreur : vous devez être connecté pour utiliser le chat global</div>';
            return;
        }

        if (!window.io) {
            const script = document.createElement("script");
            script.src = "/socket.io/socket.io.js";
            document.head.appendChild(script);

            await new Promise(resolve => {
                script.onload = () => {
                    console.log("Script socket.io chargé depuis le backend");
                    resolve();
                };
                script.onerror = () => console.error("Impossible de charger socket.io depuis le backend");
            });
        }

        this.socket = io({
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ["websocket", "polling"]
        });

        this.socket.on("connect", () => {
            console.log("→ SOCKET CONNECTÉ ! ID =", this.socket.id);
            this.output.innerHTML += '<div class="system">Connecté au chat global ✓</div>';
        });

        this.socket.on("connect_error", (err) => {
            console.error("→ Erreur de connexion socket :", err.message);
            this.output.innerHTML += `<div class="system error">Erreur connexion chat : ${err.message}</div>`;
        });

        this.socket.on("disconnect", (reason) => {
            console.log("→ Déconnecté :", reason);
            this.output.innerHTML += `<div class="system">Déconnecté du chat (${reason})</div>`;
        });

        // Réception des messages
        this.socket.on("chat-message", (msg) => {
            const div = document.createElement("div");
            div.className = "chat-message";
            div.innerHTML = `<strong>${msg.username}:</strong> ${msg.content}`;
            this.output.appendChild(div);
            this.output.scrollTop = this.output.scrollHeight;
        });
    }
}
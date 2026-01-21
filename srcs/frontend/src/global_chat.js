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
        // Connexion au chat global est déclenchée via des contrôles dédiés
        this.connected = false;
        this.historyLoaded = false;
        this.createConnectControls();
    }

    // Crée les contrôles Connect / Reconnect dans la fenêtre du chat
    createConnectControls() {
        this.controls = document.createElement("div");
        this.controls.style.display = "flex";
        this.controls.style.gap = "8px";
        this.controls.style.marginTop = "6px";

        this.connectButton = document.createElement("button");
        this.connectButton.textContent = "Connecter";
        this.connectButton.style.padding = "6px 12px";
        this.connectButton.style.background = "#28a745";
        this.connectButton.style.color = "white";
        this.connectButton.style.border = "none";
        this.connectButton.style.borderRadius = "6px";
        this.connectButton.style.cursor = "pointer";

        this.reconnectButton = document.createElement("button");
        this.reconnectButton.textContent = "Reconnecter";
        this.reconnectButton.style.padding = "6px 12px";
        this.reconnectButton.style.background = "#007bff";
        this.reconnectButton.style.color = "white";
        this.reconnectButton.style.border = "none";
        this.reconnectButton.style.borderRadius = "6px";
        this.reconnectButton.style.cursor = "pointer";

        this.controls.append(this.connectButton, this.reconnectButton);
        this.body.appendChild(this.controls);

        this.connectButton.addEventListener("click", () => this.connect_sockio_global_chat());
        this.reconnectButton.addEventListener("click", () => this.reconnect_sockio_global_chat());
    }

    async reconnect_sockio_global_chat() {
        // Déconnecte et reconnecte le socket si nécessaire
        if (this.socket) {
            try {
                this.socket.close();
            } catch (e) {
                // ignore
            }
            this.socket = null;
            this.output.innerHTML += '<div class="system">Reconnexion en cours...</div>';
        }
        this.connected = false;
        await this.connect_sockio_global_chat();
    }

    // Charge les 50 derniers messages du chat global et les affiche
    async loadRecentMessages() {
        const token = localStorage.getItem("auth_token");
        if (!token) return;
        try {
            const res = await fetch("/api/global_chat/messages", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const messages = await res.json();
                for (const m of messages) {
                    const div = document.createElement("div");
                    div.className = "chat-message";
                    div.innerHTML = `<strong>${m.username}:</strong> ${m.content}`;
                    this.output.appendChild(div);
                }
                this.output.scrollTop = this.output.scrollHeight;
            } else {
                this.output.innerHTML += '<div class="system error">Impossible de récupérer les messages du chat</div>';
            }
        } catch (e) {
            console.error(e);
        }
        this.historyLoaded = true;
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
        this.output.style.background = "#7fb8f1";
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

    // Envoie le message courant via Socket.IO
    sendMessage() {
        const content = this.input.value.trim();
        if (!content) return;

        // Envoi au backend si connecté
        if (this.socket && this.socket.connected) {
            this.socket.emit("chat-message", { content });
        } else {
            this.output.innerHTML += '<div class="system error">Erreur: vous n\'êtes pas connecté au chat global</div>';
            return;
        }

        // Pas d'affichage local duplicatif du message afin d'éviter les doublons
        // Le serveur broadcasting le message avec le username du sender
        // Reset input
        this.input.value = "";
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

        // Charge les derniers messages s'ils n'ont pas été chargés
        if (!this.historyLoaded) {
            await this.loadRecentMessages();
            this.historyLoaded = true;
        }

        // Si déjà connecté, ne pas tenter de nouveau
        if (this.socket && this.socket.connected) {
            this.output.innerHTML += '<div class="system">Déjà connecté au chat global</div>';
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

        const ioConfig = {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ["websocket", "polling"]
        };
        const altPort = window.GLOBAL_CHAT_ALT_PORT;
        if (altPort) {
            const host = location.hostname || 'localhost';
            this.socket = io(`http://${host}:${altPort}`, ioConfig);
        } else {
            this.socket = io(ioConfig);
        }

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

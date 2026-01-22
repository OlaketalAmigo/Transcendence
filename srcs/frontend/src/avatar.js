import {fenetre} from "./windows.js";

export class AvatarWindow extends fenetre {
    constructor() {
        super(360, 320, "Avatar");
        // Avatar preview
        this.avatarPreview = document.createElement("img");
        this.avatarPreview.style.width = "120px";
        this.avatarPreview.style.height = "120px";
        this.avatarPreview.style.objectFit = "cover";
        this.avatarPreview.style.borderRadius = "50%";
        this.avatarPreview.style.border = "2px solid #fff";


        this.fileInput = document.createElement("input");
        this.fileInput.type = "file";
        this.fileInput.accept = "image/*";
        // Hide the raw file input to keep only one visible control
        this.fileInput.style.display = "none";

        this.chooseBtn = document.createElement("button");
        this.chooseBtn.textContent = "Choisir image";

        this.saveBtn = document.createElement("button");
        this.saveBtn.textContent = "Enregistrer avatar";

        // Refresh button to re-fetch avatar from server
        this.refreshBtn = document.createElement("button");
        this.refreshBtn.textContent = "Rafraîchir photo";

        this.message = document.createElement("div");
        this.message.style.fontSize = "0.9em";

        this.body.append(
            this.avatarPreview,
            this.fileInput,
            this.chooseBtn,
            this.saveBtn,
            this.refreshBtn,
            this.message
        );

        this.applyStyles();
        this.bindEvents();
    }

    applyStyles() {
        // Center avatar in the window body
        this.body.style.display = "flex";
        this.body.style.flexDirection = "column";
        this.body.style.alignItems = "center";
        this.body.style.gap = "12px";
        // Style helpers
        this.avatarPreview.style.boxShadow = "0 0 8px rgba(0,0,0,0.5)";
        this.chooseBtn.style.padding = "6px 12px";
        this.chooseBtn.style.cursor = "pointer";
        this.saveBtn.style.padding = "6px 12px";
        this.saveBtn.style.cursor = "pointer";
    }

    bindEvents() {
        this.fileInput.addEventListener("change", (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                this.avatarPreview.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });

        this.chooseBtn.addEventListener("click", () => {
            // trigger file input
            this.fileInput.click();
        });

        this.saveBtn.addEventListener("click", () => {
            const url = this.avatarPreview.src;
            if (url) {
                localStorage.setItem("avatar_url", url);
                this.message.textContent = "Avatar enregistré !";
                this.message.style.color = "#3cff01";
            }
        });

        // Bind refresh button to re-fetch avatar from server
        this.refreshBtn.addEventListener("click", () => {
            this.getPhoto();
        });
    }
    async getPhoto(){
        console.log("getPhoto launched...");
        const token = localStorage.getItem("auth_token");
        if (!token) {
            console.log("No auth token found; skipping avatar fetch");
            return;
        }
        try {
            const response = await fetch("/api/avatar/me", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) {
                console.warn("Failed to fetch avatar (status", response.status, ")");
                return;
            }
            const data = await response.json();
            if (data && data.avatar_url) {
                this.avatarPreview.src = data.avatar_url;
            } else {
                console.warn("Avatar URL not found in response");
            }
        } catch (err) {
            console.error("Error while fetching avatar:", err);
        }
    }
    
}

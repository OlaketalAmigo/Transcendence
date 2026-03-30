export class Popup {

    constructor(msg, parent = document.body) {
        this.msg = msg;
        this.parent = parent;
        this.obj = document.createElement('span');
        
        this.obj.className = "popup";
        this.obj.textContent = "";
        this.obj.style.opacity = "0";
        this.run();
    }

    async create() {
        this.parent.appendChild(this.obj);
    
        this.obj.style.transition = "opacity 0.5s ease";
        requestAnimationFrame(() => {
            this.obj.style.opacity = "1";
        });
        await new Promise(r => setTimeout(r, 500));
    }
    async write(speed = 50) {
        for (let i = 0; i < this.msg.length; i++) {
            this.obj.textContent += this.msg[i];
            await new Promise(r => setTimeout(r, speed));
        }
    }
    async remove() {
    
        await new Promise(r => setTimeout(r, 2000));
        this.obj.style.transition = "opacity 0.3s ease";
        this.obj.style.opacity = "0";
        await new Promise(r => setTimeout(r, 300));
        if (this.obj.parentNode) {
            this.obj.parentNode.removeChild(this.obj);
        }
    }
    async run() {
        await this.create();
        await this.write();
        await this.remove();
    }
}

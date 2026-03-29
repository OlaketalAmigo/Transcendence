import { updateElement } from "./tools.js";

export class Sidebar {

    constructor(parent = document.body) {
        this.parent = parent;
        this.stateopen = 'closed';
        // this.state = this.checkIfLoggedIn() ? "loggedOut" : "loggedIn";

        this.obj = updateElement({
            parent: parent
        })
        this.createAllButtons();
        // this.render(this.state, this.stateopen);
    }

    checkIfLoggedIn() {
        return true;
    }

    render(stateopen) {
        this.obj.textContent = '';
        if (this.stateopen === 'open') {
            // Show the menu buttons
            this.menu_buttons.forEach(btn => this.obj.appendChild(btn));
        } else {
            // Show only main login button
            this.obj.appendChild(this.main_button);
        }
    }

    toggle() {

        this.stateopen = (this.stateopen === 'open') ? 'closed' : 'open';
        console.log(this.stateopen)
        this.render(this.stateopen);
    }

    handleClickOutside = (event) => {
        if (this.stateopen === 'open' && !this.obj.contains(event.target)) {
            this.toggle(); // close the menu
        }
    }

    createAllButtons() {
        this.main_button = updateElement({
            parent: this.obj,
            textContent: 'button',
            classList: [ 'loggin-button' ],
        })
        this.main_button.addEventListener('click', () => {
            this.toggle();
        })


        const items = ['friends', 'chat', 'rooms', 'settings', 'logout'];
        this.menu_buttons = [];

        items.forEach(name => {
            this[name] = updateElement({
                id: `button-${name}`,
                parent: this.obj,
                textContent: name,
                classList: ['item'],
                additionalStyles: { display: 'none'}
            })
            this.menu_buttons.push(this[name]);
        })
    }

}
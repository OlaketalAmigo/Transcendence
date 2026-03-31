import { updateElement } from "./tools.js";

import { windowRegistry } from '../core/windows.js';
import { LoginWindow } from '../windows/login.js';
import { LogoutWindow } from '../windows/logout.js';
import { GlobalChat } from '../windows/global_chat.js';
import { AvatarWindow } from '../windows/avatar.js';
import { FriendsWindow } from '../windows/friends.js';
import { GameRoomWindow } from '../windows/game_room.js';
import { StatsWindow } from '../windows/stats.js';

export class Sidebar {

/* CONSTURCTOR */
    constructor(parent = document.body) {
        this.parent = parent;
        this.stateopen = 'closed';
        // this.state = this.checkIfLoggedIn() ? "loggedOut" : "loggedIn";

        this.obj = updateElement({
            parent: parent,
        	id: `login-wrapper`,
            classList: [ 'login-wrapper' ],
        })
        this.createAllButtons();

		this.handleClickOutside = (event) => {
			if (this.stateopen === 'open' && !this.obj.contains(event.target)) {
				this.toggle();
			}
		};
    }

/* toogle menu open / closed */
    toggle() {
        this.stateopen = (this.stateopen === 'open') ? 'closed' : 'open';
        console.log(this.stateopen);
		if (this.stateopen === 'open') {
			this.main_button.style.display = 'none';
			this.menu_buttons.forEach(b => b.style.display = 'block');
			// ensure only ONE listener exists
			document.removeEventListener('click', this.handleClickOutside);
			document.addEventListener('click', this.handleClickOutside);

		}
		else {
			this.menu_buttons.forEach(b => b.style.display = 'none');
			this.main_button.style.display = 'block';
			document.removeEventListener('click', this.handleClickOutside);
		}
    }

/* create all element, append to div */
    createAllButtons() {
	//	not-logged closed button
        this.main_button = updateElement({
        	id: `button-main`,
            parent: this.obj,
            textContent: 'LOGIN',
            classList: [ 'login-button' ],
        })
		this.obj.append(this.main_button);
        this.main_button.addEventListener('click', (e) => {
			e.stopPropagation();
            this.toggle();
        })
	
	// menu buttons
        const items = ['friends', 'chat', 'rooms', 'settings', 'log','logout'];
        this.menu_buttons = [];

        items.forEach(name => {
            this[name] = updateElement({
                id: `button-${name}`,
                parent: this.obj,
                textContent: name,
                classList: ['login-button'],
                additionalStyles: { display: 'none'}
            })
            this.menu_buttons.push(this[name]);
			this.obj.append(this[name]);
        })
		this.loginWindow = new LoginWindow();
		this.obj.append(this.loginWindow.form);
		this.loginWindow.form.style.display = 'none';
        this['log'].addEventListener('click', () => {
			this.menu_buttons.forEach(b => b.style.display = 'none');
            this.loginWindow.form.style.display = 'block';
        })
	// menu elements
    }

}
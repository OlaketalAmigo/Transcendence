import {checkIfLoggedIn} from './tools.js';

export class Header {
    constructor() {
        this.obj = document.createElement('div');
        Object.assign(this.obj.style, {
            
        });
        let play = document.createElement('span');
        let title = document.createElement('span');
        let login = document.createElement('span');

        play.textContent = "PLAY";
        if (checkIfLoggedIn())
            title.textContent = "Welcome back you!";
        else
            title.textContent = "Welcome to CAT !";

        this.obj.append(play);
        this.obj.append(title);
        this.obj.append(login);
    }



}
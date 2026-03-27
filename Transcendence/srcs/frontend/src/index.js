
let a = document.createElement('div');
document.body.append(a);

a.textContent = "abc";
a.style.color = "red";
a.style.border = "2px solid black";
a.style.margin = "10px 20px 30px 40px";
a.style.backgroundColor = "green";

import { Popup } from './webcat/popup.js';

for (let i = 0; i <= 50; i++) {

	let b = document.createElement('span');
	Object.assign(b, {

	});
	b.classList.add("box");
	a.append(b);

	// b.style.color = "blue";
	b.textContent = "hallow-" + i;
}

let b = document.getElementById('button-login');
b.style.display = "flex";


let c = new Popup("MOUHAHAH");
document.body.appendChild(c.obj);

import {Header} from './webcat/header.js';
let h = new Header;
document.body.append(h.obj);

// import {LoginWindow} from './windows/login.js';
// import {LogoutWindow} from './windows/logout.js';

// let l = new LoginWindow;
// document.body.append(l);
// l = new LogoutWindow;
// document.body.append(l);
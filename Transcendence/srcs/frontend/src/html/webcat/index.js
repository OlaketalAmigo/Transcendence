import { DialogBubble } from './chaberu.js';
import { STORAGE_KEYS } from '../../js/config.js';

function chaberu(text) {

	const wiskas = document.getElementById('wiskas');
	const bubble = new DialogBubble(wiskas, text);
	bubble.chat();

}

// THINGS TO CHANGE BASED ON LOGIN STATUS
const playButton = document.getElementById('play-button');
const title = document.getElementById('header-hello');
const loginButton = document.getElementById('login-button');

// <!--///////////////////////////////////////////////////////////////////////////////////////////-->
// looged in check
if (localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)) {
	// play button mapped to transcendnece
	playButton.addEventListener('click', () => {
		window.location.href = 'donate.html';
	});
	title.content = "hello ${user}";
	loginButton = loggedmenu;
}
// <!--///////////////////////////////////////////////////////////////////////////////////////////-->
else {
	playButton.addEventListener('click', () => {
		chaberu('Please login before');
	});
	title.content = "Welcome to CAT !";
	loginButton.addEventListener('click', () => {
		try loggin();
	});

}
// chaberu('Please log in before playing');
import { updateElement } from "./test/tools.js";
import { colorizeText } from "./tools.js";

// //////////////////////////////////////////]
let div2 = document.createElement('div')
document.body.append(div2)
let button1 = document.createElement('button')
div2.append(button1)
button1.textContent = 'game-lobby'
button1.addEventListener('click', () => {
	window.location.href = './game2/game.html';
})
let button2 = document.createElement('button')
div2.append(button2)
button2.textContent = 'tetris'
button2.addEventListener('click', () => {
	window.location.href = './tetris/tetris.html';
})

let button4 = document.createElement('button')
div2.append(button4)
button4.textContent = 'test'
button4.addEventListener('click', () => {
	window.location.href = './test/index.html';
})
let img = document.getElementById('wiskas');
img.before(div2)

// apply multicolor to .multicolor
colorizeText();


/* ///////////////////////////////////////////////////////// */
// make transcendence button move via: .button-trans
function updateButtonTranscendence(move) {

	const btn = document.querySelector('.button-trans');
	btn.addEventListener('mousemove', e => {
		const rect = btn.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width - 0.5) * move;
		const y = ((e.clientY - rect.top) / rect.height - 0.5) * move;
		btn.style.backgroundPosition = `calc(50% + ${x}px) calc(50% + ${y}px)`;
	});

	btn.addEventListener('mouseleave', () => {
		btn.style.backgroundPosition = 'center';
	});

	btn.addEventListener('click', () => {
		window.location.href = './trans/index2.html';
	});
}
/* ///////////////////////////////////////////////////////// */
updateButtonTranscendence(100);
import { updateElement } from "./test/tools.js";

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
let button3 = document.createElement('button')
div2.append(button3)
button3.textContent = 'transcendance'
button3.addEventListener('click', () => {
	window.location.href = './trans/index2.html';
})
let button4 = document.createElement('button')
div2.append(button4)
button4.textContent = 'test'
button4.addEventListener('click', () => {
	window.location.href = './test/index.html';
})
let img = document.getElementById('wiskas');
img.before(div2)

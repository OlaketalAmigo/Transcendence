
// header creation
let h = document.getElementById('top-header')
// document.body.append(h)
Object.assign(h.style, {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
});

// top left button
let el = document.createElement('button')
h.append(el)
el.textContent = 'test';
Object.assign(el.style, {
	fontSize: '50px'
})
el.classList.add('button')

// middle title
let title = document.createElement('span')
h.append(title)
title.textContent = 'title'

// right button
let b = document.createElement('button')
h.append(b)
b.textContent = 'login'
Object.assign(b.style, {
	fontSize: '50px'
})
b.classList.add('button')


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




// 
let wiskas = document.createElement('img')
wiskas.src = './webcat/web_cat_img/wiskas-the-third.jpg'
document.body.append(wiskas)
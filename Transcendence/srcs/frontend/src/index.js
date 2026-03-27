
let a = document.createElement('div');
document.body.append(a);

a.textContent = "abc";
a.style.color = "red";
a.style.border = "2px solid black";
a.style.margin = "10px 20px 30px 40px";
a.style.backgroundColor = "green";


for (let i = 0; i <= 10; i++) {

	let b = document.createElement('span');
	a.append(b);

	b.style.color = "blue";
	b.textContent = "hallow-" + i;
}
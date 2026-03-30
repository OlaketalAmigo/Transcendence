// render in color the text of all .multicolor
export function colorizeText() {
    
	const elements = document.querySelectorAll(".multicolor");

	const colorizeText = (el) => {
		const text = el.textContent;
		el.innerHTML = "";

		const baseHue = Math.random() * 360;

		// 🎲 random step = makes rainbow "scrambled"
		const step = (Math.random() * 60) + 10; // 10 → 70

		// 🎲 random direction (left or right rainbow)
		const direction = Math.random() < 0.5 ? 1 : -1;

		[...text].forEach((char, i) => {
			const span = document.createElement("span");
			span.textContent = char;

			const hue = baseHue + (i * step * direction);

			span.style.color = `hsl(${hue}, 90%, 60%)`;

			span.style.textShadow = `1px 1px 0 rgba(0,0,0,0.3)`;

			el.appendChild(span);
		});
	};
	elements.forEach(colorizeText);
}

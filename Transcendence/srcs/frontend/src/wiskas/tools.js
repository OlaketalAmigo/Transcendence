/* /////////////////////////////////////////// */
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

export function updateElement({
    el,                  // existing element or null to create new
    parent = document.body,
    id = null,
    classList = [],      // object like { css - classes to add }
    textContent = "",
    additionalStyles = {} // object like { color: 'red', display: 'flex' }
} = {}) {
    // If no element passed, create a div by default
    if (!el) {
        el = document.createElement('div');
        parent.appendChild(el);
    }

    // Set ID if provided
    if (id) el.id = id;

    // Manage classes
    classList.forEach(cls => el.classList.add(cls));

    // Set text content
    if (textContent !== undefined) el.textContent = textContent;

    Object.assign(el.style, additionalStyles);

    return el;
}
const maxdoodles = 34;

// /////////////////////////////////////////////////////////////////////////////////////////>\
// container for all doodles, create them
class DoodleContainer {

	constructor(parent) {

		this.parent = parent;
		this.obj = document.createElement('div');
		Object.assign(this.obj.style, {
			width: '100vw', 
			height: '100vw',
		});

		this.createAllDoodles();
		parent.append(this.obj);
		this.randomizeAnimationStarts();
	}

	createAllDoodles() {

		for (let i = 0; i <= maxdoodles; i++) {
			let d = document.createElement('div');
			d.classList.add('shape', 'doodle-' + i, 'loop-color');
			d.id = 'shape' + i;
			this.obj.append(d);
			d.addEventListener('click', () => {
				console.log(`hi from ${d.id}!`);
			})
		}
	}

	startSmoothRandomMove(id, speed = 2) {

		const el = document.getElementById(id);
		if (!el)
			return;

		// 1. Get initial pixel position or pick random if CSS isn't loaded yet
		const rect = el.getBoundingClientRect();
		
		const state = {
			x: rect.left || Math.random() * (window.innerWidth - 142),
			y: rect.top || Math.random() * (window.innerHeight - 142),
			angle: Math.random() * Math.PI * 2,
			speed: speed 
		};

		function update() {
			// 2. Refresh screen boundaries every frame
			const screenW = window.innerWidth;
			const screenH = window.innerHeight;
			const shapeSize = 142; // Matches your CSS width/height

			// 3. Calculate next step
			state.x += Math.cos(state.angle) * state.speed;
			state.y += Math.sin(state.angle) * state.speed;

			// 4. BOUNCE LOGIC
			// Horizontal check
			if (state.x <= 0) {
				state.x = 0;
				state.angle = Math.PI - state.angle;
			} else if (state.x + shapeSize >= screenW) {
				state.x = screenW - shapeSize;
				state.angle = Math.PI - state.angle;
			}

			// Vertical check
			if (state.y <= 0) {
				state.y = 0;
				state.angle = -state.angle;
			} else if (state.y + shapeSize >= screenH) {
				state.y = screenH - shapeSize;
				state.angle = -state.angle;
			}

			// 5. Apply position using pixels for precision
			el.style.left = state.x + "px";
			el.style.top = state.y + "px";

			requestAnimationFrame(update);
		}

		requestAnimationFrame(update);
	}

	randomizeAnimationStarts() {
		for (let i = 0; i <= maxdoodles; i++) {
			const randomSpeed = 1 + Math.random() * 3; 
			this.startSmoothRandomMove(`shape${i}`, randomSpeed);
		}
	}
}

// /////////////////////////////////////////////////////////////////////////////////////////>
// all loop-color have the same @colorShift animation cycle, this disynchronize them
function randomizeColorsStarts() {
    const shapes = document.querySelectorAll('.loop-color');
    
    shapes.forEach(shape => {
        // Pick a random number between 0 and 10 (since your loop is 10s)
        const randomDelay = Math.random() * - 15; 
        
        // Apply it directly to the element's style
        shape.style.animationDelay = randomDelay + "s";
    });
}

const a = new DoodleContainer(document.body);
// Call this once when the script loads
randomizeColorsStarts();

// Function to update a specific shape's color and position
function updateShape(id, x, y, color) {
    const element = document.getElementById(id);
    
    if (element) {
        element.style.left = x + "px";
        element.style.top = y + "px";
        element.style.backgroundColor = color;
    }
}

// Example usage: Move shape1 to (100, 100) and make it red
// updateShape('shape1', 100, 100, '#ff0000');

function moveRandomly(id) {
    const element = document.getElementById(id);
    if (!element) return;

    // Calculate random coordinates
    // We subtract 300 so the shape doesn't go partially off-screen (since your width is 300px)
    const maxX = window.innerWidth - 300;
    const maxY = window.innerHeight - 300;

    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    // Generate a random HEX color
    const randomColor = "#" + Math.floor(Math.random()*16777215).toString(16);

    // Apply the changes
    element.style.left = randomX + "px";
    element.style.top = randomY + "px";
    element.style.backgroundColor = randomColor;
}

// To make it move every 2 seconds automatically:
// setInterval(() => moveRandomly('shape1'), 2000);
// setInterval(() => moveRandomly('shape2'), 2000);
function startSmoothRandomMove(id, speed = 2) {
    const el = document.getElementById(id);
    if (!el) return;

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

        // 4. BOUNCE LOGIC (Corrected)
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


// This loop runs 35 times, once for each shape ID
for (let i = 1; i <= 35; i++) {
    // Generate a random speed between 1 and 4 for each shape
    // so they don't all move at the exact same pace
    const randomSpeed = 1 + Math.random() * 3; 
    
    // Call your function using the ID 'shape1', 'shape2', etc.
    startSmoothRandomMove(`shape${i}`, randomSpeed);
}

function randomizeAnimationStarts() {
    const shapes = document.querySelectorAll('.loop-color');
    
    shapes.forEach(shape => {
        // Pick a random number between 0 and 10 (since your loop is 10s)
        const randomDelay = Math.random() * - 12; 
        
        // Apply it directly to the element's style
        shape.style.animationDelay = randomDelay + "s";
    });
}

// Call this once when the script loads
randomizeAnimationStarts();


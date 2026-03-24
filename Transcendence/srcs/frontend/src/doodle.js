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

// Store the state of our moving shapes
const movingShapes = {};
function startSmoothRandomMove(id, speed = 2) {
    const el = document.getElementById(id);
    if (!el) return;

    // We store position as 0.0 to 1.0 (percentage of screen)
    // This makes it "Resolution Independent"
    const state = {
        percentX: parseFloat(el.style.left) / 100 || Math.random(),
        percentY: parseFloat(el.style.top) / 100 || Math.random(),
        angle: Math.random() * Math.PI * 2,
        speed: speed 
    };

    function update() {
        // 1. Get current pixel dimensions of the window
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // 2. Convert speed (pixels) into a "percentage" of this specific screen
        const vx = (Math.cos(state.angle) * state.speed) / width;
        const vy = (Math.sin(state.angle) * state.speed) / height;

        state.percentX += vx;
        state.percentY += vy;

        // 3. Bounce logic (Keep between 0% and 100%)
        // We subtract a little (e.g., 0.1) so the 300px shape doesn't go off-edge
        const bufferX = 300 / width; 
        const bufferY = 300 / height;

        if (state.percentX < 0 || state.percentX > (1 - bufferX)) {
            state.angle = Math.PI - state.angle;
            state.percentX = Math.max(0, Math.min(state.percentX, 1 - bufferX));
        }
        if (state.percentY < 0 || state.percentY > (1 - bufferY)) {
            state.angle = -state.angle;
            state.percentY = Math.max(0, Math.min(state.percentY, 1 - bufferY));
        }

        // 4. Apply as percentages
        el.style.left = (state.percentX * 100) + "vw";
        el.style.top = (state.percentY * 100) + "vh";

        requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

// function startSmoothRandomMove(id, speed = 2) {
//     const el = document.getElementById(id);
//     if (!el) return;

//     // Initial state: Start in the center, pick a random angle
//     movingShapes[id] = {
//         x: parseFloat(el.style.left) || 500,
//         y: parseFloat(el.style.top) || 300,
//         angle: Math.random() * Math.PI * 2, // Random direction in radians
//         speed: speed
//     };

//     function update() {
//         const state = movingShapes[id];

//         // 1. Calculate new position based on angle and speed
//         state.x += Math.cos(state.angle) * state.speed;
//         state.y += Math.sin(state.angle) * state.speed;

//         // 2. "Bounce" logic: Change direction if hitting screen edges
//         if (state.x < 0 || state.x > window.innerWidth - 300) {
//             state.angle = Math.PI - state.angle; // Flip horizontal
//         }
//         if (state.y < 0 || state.y > window.innerHeight - 300) {
//             state.angle = -state.angle; // Flip vertical
//         }

//         // 3. Randomly change direction slightly (the "Wander" effect)
//         // 1% chance every frame to pivot slightly
//         if (Math.random() < 0.01) {
//             state.angle += (Math.random() - 0.5) * 1; 
//         }

//         // 4. Apply to the element
//         el.style.left = state.x + "px";
//         el.style.top = state.y + "px";

//         // Keep the loop going
//         requestAnimationFrame(update);
//     }

//     // Start the first "heartbeat"
//     requestAnimationFrame(update);
// }

startSmoothRandomMove('shape1', 3); // Moves at speed 3
startSmoothRandomMove('shape2', 1.5); // Moves slower


function randomizeAnimationStarts() {
    const shapes = document.querySelectorAll('.loop-color');
    
    shapes.forEach(shape => {
        // Pick a random number between 0 and 10 (since your loop is 10s)
        const randomDelay = Math.random() * -10; 
        
        // Apply it directly to the element's style
        shape.style.animationDelay = randomDelay + "s";
    });
}

// Call this once when the script loads
randomizeAnimationStarts();


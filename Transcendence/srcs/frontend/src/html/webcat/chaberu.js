export class DialogBubble {
    constructor(toAttachTo, messageText) {
        this.message = messageText;         // the text to show
        this.bubbleElement = null;          // the actual DOM element for the bubble
        this.sender = null;                 // "user" or "bot"
        this.visible = false;               // track visibility
		this.toAttachTo = toAttachTo;
		this.render();
    }

// Create the bubble element in the DOM
    render() {
        // 1. Create <div> or <span> for the bubble
		const bubble = document.createElement('div');  // could also use 'span'
		this.bubbleElement = bubble;                  // store reference for later

		bubble.classList.add('popup-chaberu');
		bubble.textContent = this.message;

	    if (this.toAttachTo) {
			this.toAttachTo.appendChild(bubble);
		} else {
			console.warn('No parent to attach bubble to');
		}
    }

// Animate text letter by letter
	async typeText(speed = 50) {
		if (!this.bubbleElement) return;

		// 1️⃣ Show the bubble with a smooth fade-in
		this.bubbleElement.style.opacity = '0';
		this.bubbleElement.style.display = 'inline-block';
		this.bubbleElement.style.transition = 'opacity 0.3s ease';
		requestAnimationFrame(() => {
			this.bubbleElement.style.opacity = '1';
		});

		// 2️⃣ Loop through message characters
		this.bubbleElement.textContent = ''; // start empty
		for (let i = 0; i < this.message.length; i++) {
			this.bubbleElement.textContent += this.message[i];

			// 3️⃣ Wait `speed` ms between letters
			await new Promise(resolve => setTimeout(resolve, speed));
		}

		// 4️⃣ Optionally trigger a callback or just mark as done
		// e.g., you could emit an event here
	}

    // Make the bubble visible with optional transition
	show() {
		if (!this.bubbleElement) return;

		// Mark as visible
		this.visible = true;

		// Ensure it’s displayed (in case it was hidden)
		this.bubbleElement.style.display = 'inline-block';

		// Apply fade-in using opacity and transition
		this.bubbleElement.style.opacity = '0'; // start hidden
		this.bubbleElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

		// Trigger the transition on the next frame
		requestAnimationFrame(() => {
			this.bubbleElement.style.opacity = '1';
			this.bubbleElement.style.transform = 'translateY(0)'; // optional subtle move-in
		});
	}

    // Fade out after a delay
	hide(delay = 2000) {
		if (!this.bubbleElement) return;

		// Schedule the fade-out
		setTimeout(() => {
			// Start fade-out
			this.bubbleElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
			this.bubbleElement.style.opacity = '0';
			this.bubbleElement.style.transform = 'translateY(-10px)'; // optional slight move up

			// Optional: remove from DOM after fade-out finishes
			setTimeout(() => {
				if (this.bubbleElement && this.bubbleElement.parentNode) {
					this.bubbleElement.parentNode.removeChild(this.bubbleElement);
				}
			}, 500); // match the fade duration
		}, delay);

		this.visible = false;
	}

    // Main function to “chat” this bubble
    chat(speed = 50, fadeDelay = 2000) {
        this.render();             // create bubble in DOM
        this.show();               // fade-in
        this.typeText(speed);      // write text letter by letter
        setTimeout(() => this.hide(fadeDelay), fadeDelay + this.message.length * speed);
    }
}
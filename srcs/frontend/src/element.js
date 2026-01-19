export class Element {
  constructor(id) {
    this.element = document.getElementById(id);
    // Debug: log hover events for the element with a minimal, clear message
    this.element.addEventListener("mouseenter", () => {
      console.log("Hover: " + id);
    });
    this.element.addEventListener("mouseleave", () => {
      console.log("Leave: " + id);
    });
  }
}

export class MenuElement extends Element {
  constructor(id) {
    super(id);
    // Basic click feedback
    this.element.addEventListener("click", () => {
      console.log("Clicked: " + id);
    });
    // Simple hover styling for menu items to improve clarity
    this.element.addEventListener("mouseenter", () => {
      this.element.style.backgroundColor = "lightgrey";
      this.element.style.fontSize = "1.2em";
      this.element.style.cursor = "pointer";
    });
    this.element.addEventListener("mouseleave", () => {
      // Reset styles when not hovered
      this.element.style.backgroundColor = "";
      this.element.style.fontSize = "";
      this.element.style.cursor = "";
      // Cancel any running animations for a crisp reset (defensive)
      if (this.element.getAnimations) {
        this.element.getAnimations().forEach(animation => animation.cancel());
      }
    });
  }
}

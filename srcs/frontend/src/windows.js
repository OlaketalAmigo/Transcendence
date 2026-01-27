import { CSS } from './config.js';
import { eventBus, Events } from './events.js';

/**
 * Centralized window registry
 * Manages window visibility and positioning
 */
class WindowRegistry {
    constructor() {
        this.windows = new Map();
    }

    /**
     * Registers a window in the registry
     * @param {string} name - Unique window name
     * @param {Window} window - Window instance
     */
    register(name, window) {
        this.windows.set(name, window);
    }

    /**
     * Gets a window by its name
     * @param {string} name - Window name
     * @returns {Window|undefined}
     */
    get(name) {
        return this.windows.get(name);
    }

    /**
     * Returns all visible windows
     * @returns {Window[]}
     */
    getVisible() {
        return Array.from(this.windows.values()).filter(w => w.isVisible());
    }

    /**
     * Reorganizes visible windows
     */
    reorganize() {
        const visible = this.getVisible();

        if (visible.length === 0) return;

        if (visible.length === 1) {
            visible[0].setPosition('center');
        } else if (visible.length === 2) {
            visible[0].setPosition('left');
            visible[1].setPosition('right');
        } else {
            visible.forEach(w => w.setPosition('center'));
        }
    }

    /**
     * Shows a window and reorganizes
     * @param {string} name - Window name
     */
    show(name) {
        const window = this.get(name);
        if (window) {
            window.show();
        }
    }

    /**
     * Hides a window and reorganizes
     * @param {string} name - Window name
     */
    hide(name) {
        const window = this.get(name);
        if (window) {
            window.hide();
        }
    }

    /**
     * Toggles window visibility
     * @param {string} name - Window name
     */
    toggle(name) {
        const window = this.get(name);
        if (window) {
            window.toggle();
        }
    }
}

// Singleton registry instance
export const windowRegistry = new WindowRegistry();

/**
 * Base class for all windows
 * Uses CSS classes instead of inline styles
 */
export class Window {
    /**
     * @param {Object} options - Configuration options
     * @param {string} options.name - Unique name for the registry
     * @param {string} options.title - Title displayed in the header
     * @param {string[]} [options.cssClasses] - Additional CSS classes
     */
    constructor({ name, title, cssClasses = [] }) {
        this.name = name;

        // Create main container
        this.element = document.createElement('div');
        this.element.className = [CSS.WINDOW, ...cssClasses].join(' ');

        // Header
        this.header = document.createElement('div');
        this.header.className = CSS.WINDOW_HEADER;

        this.titleElement = document.createElement('span');
        this.titleElement.className = CSS.WINDOW_TITLE;
        this.titleElement.textContent = title;

        this.closeBtn = document.createElement('button');
        this.closeBtn.className = CSS.WINDOW_CLOSE;
        this.closeBtn.textContent = '✖';
        this.closeBtn.setAttribute('aria-label', 'Close');
        this.closeBtn.addEventListener('click', () => this.hide());

        this.header.append(this.titleElement, this.closeBtn);

        // Body
        this.body = document.createElement('div');
        this.body.className = CSS.WINDOW_BODY;

        // Assembly
        this.element.append(this.header, this.body);
        document.body.appendChild(this.element);

        // Register in the registry
        windowRegistry.register(name, this);
    }

    /**
     * Checks if the window is visible
     * @returns {boolean}
     */
    isVisible() {
        return this.element.classList.contains(CSS.WINDOW_VISIBLE);
    }

    /**
     * Sets the window position
     * @param {'center'|'left'|'right'} position
     */
    setPosition(position) {
        this.element.classList.remove('window--left', 'window--right');

        if (position === 'left') {
            this.element.classList.add('window--left');
        } else if (position === 'right') {
            this.element.classList.add('window--right');
        }
    }

    /**
     * Shows the window
     */
    show() {
        const wasHidden = !this.isVisible();
        this.element.classList.add(CSS.WINDOW_VISIBLE);

        if (wasHidden) {
            windowRegistry.reorganize();
            eventBus.emit(Events.WINDOW_OPENED, { name: this.name });
        }
    }

    /**
     * Hides the window
     */
    hide() {
        const wasVisible = this.isVisible();
        this.element.classList.remove(CSS.WINDOW_VISIBLE);

        if (wasVisible) {
            windowRegistry.reorganize();
            eventBus.emit(Events.WINDOW_CLOSED, { name: this.name });
        }
    }

    /**
     * Toggles visibility
     */
    toggle() {
        if (this.isVisible()) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Updates the window title
     * @param {string} title
     */
    setTitle(title) {
        this.titleElement.textContent = title;
    }

    /**
     * Creates an element with CSS classes
     * @param {string} tag - HTML tag
     * @param {string|string[]} classes - CSS classes
     * @param {Object} [attrs] - Additional attributes
     * @returns {HTMLElement}
     */
    createElement(tag, classes, attrs = {}) {
        const element = document.createElement(tag);
        const classList = Array.isArray(classes) ? classes : [classes];
        element.className = classList.filter(Boolean).join(' ');

        Object.entries(attrs).forEach(([key, value]) => {
            if (key === 'text') {
                element.textContent = value;
            } else if (key === 'html') {
                element.innerHTML = value;
            } else {
                element.setAttribute(key, value);
            }
        });

        return element;
    }
}

// Export old class name for compatibility (alias)
export { Window as fenetre };

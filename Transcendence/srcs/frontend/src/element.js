/**
 * DOM element utilities
 * This module provides helper functions for creating elements
 * without depending on specific HTML IDs
 */

/**
 * Creates a DOM element with options
 * @param {string} tag - HTML tag
 * @param {Object} options - Configuration options
 * @param {string|string[]} [options.classes] - CSS classes
 * @param {string} [options.text] - Element text
 * @param {string} [options.html] - Inner HTML
 * @param {Object} [options.attrs] - Additional attributes
 * @param {Object} [options.style] - Inline styles (avoid using)
 * @param {Object} [options.events] - Events to attach
 * @param {HTMLElement[]} [options.children] - Child elements
 * @returns {HTMLElement}
 */
export function createElement(tag, options = {}) {
    const element = document.createElement(tag);

    // Classes
    if (options.classes) {
        const classes = Array.isArray(options.classes) ? options.classes : [options.classes];
        element.className = classes.filter(Boolean).join(' ');
    }

    // Text
    if (options.text) {
        element.textContent = options.text;
    }

    // HTML
    if (options.html) {
        element.innerHTML = options.html;
    }

    // Attributes
    if (options.attrs) {
        Object.entries(options.attrs).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }

    // Styles (use sparingly)
    if (options.style) {
        Object.assign(element.style, options.style);
    }

    // Events
    if (options.events) {
        Object.entries(options.events).forEach(([event, handler]) => {
            element.addEventListener(event, handler);
        });
    }

    // Children
    if (options.children) {
        options.children.forEach(child => {
            if (child) element.appendChild(child);
        });
    }

    return element;
}

/**
 * Selects an element by its data-attribute
 * @param {string} attr - Attribute name (without 'data-')
 * @param {string} value - Value to search for
 * @param {HTMLElement} [parent=document] - Parent element
 * @returns {HTMLElement|null}
 */
export function findByData(attr, value, parent = document) {
    return parent.querySelector(`[data-${attr}="${value}"]`);
}

/**
 * Selects all elements by their data-attribute
 * @param {string} attr - Attribute name (without 'data-')
 * @param {string} [value] - Value to search for (optional)
 * @param {HTMLElement} [parent=document] - Parent element
 * @returns {HTMLElement[]}
 */
export function findAllByData(attr, value, parent = document) {
    const selector = value ? `[data-${attr}="${value}"]` : `[data-${attr}]`;
    return Array.from(parent.querySelectorAll(selector));
}

/**
 * Adds or removes a class based on a condition
 * @param {HTMLElement} element
 * @param {string} className
 * @param {boolean} condition
 */
export function toggleClass(element, className, condition) {
    if (condition) {
        element.classList.add(className);
    } else {
        element.classList.remove(className);
    }
}

/**
 * Escapes HTML to prevent XSS
 * @param {string} text
 * @returns {string}
 */
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

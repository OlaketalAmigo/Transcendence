
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

    // Apply additional styles
    Object.assign(el.style, additionalStyles);

    return el; // return element for further use
}
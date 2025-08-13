/**
 * Binds a click event handler to a button element or element ID.
 *
 * @param {string|HTMLElement} buttonOrId - Button element or its ID.
 * @param {Function} handler - Click event handler function.
 */
export function bindClick(buttonOrId, handler) {
    let button;

    if (typeof buttonOrId === 'string') {
        button = document.getElementById(buttonOrId);
        if (!button) {
            console.warn(`Button not found: ${buttonOrId}`);
            return;
        }
    } else if (buttonOrId instanceof HTMLElement) {
        button = buttonOrId;
    } else {
        console.warn('Invalid button argument. Must be string ID or HTMLElement.');
        return;
    }

    button.addEventListener('click', handler);
}

/**
 * Sets the text content of an element identified by ID or directly by an HTMLElement.
 *
 * @param {string | HTMLElement} elementOrId - The element ID string or the HTMLElement itself.
 * @param {string} text - The text content to set on the element.
 */
export function setText(elementOrId, text) {
    let el;
    if (typeof elementOrId === 'string') {
        el = document.getElementById(elementOrId);
    } else if (elementOrId instanceof HTMLElement) {
        el = elementOrId;
    } else {
        console.warn('Invalid elementOrId argument. Must be string ID or HTMLElement.');
        return;
    }
    if (el) el.textContent = text;
}

/**
 * Sets the `src` attribute of an image element identified by ID or directly by an HTMLElement.
 *
 * @param {string | HTMLElement} elementOrId - The element ID string or the HTMLElement itself.
 * @param {string} src - The source URL to set for the image element.
 */
export function setImageSrc(elementOrId, src) {
    let el;
    if (typeof elementOrId === 'string') {
        el = document.getElementById(elementOrId);
    } else if (elementOrId instanceof HTMLElement) {
        el = elementOrId;
    } else {
        console.warn('Invalid elementOrId argument. Must be string ID or HTMLElement.');
        return;
    }
    if (el) el.src = src;
}


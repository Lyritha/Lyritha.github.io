import * as pageNavigator from './PageNavigator.js';

/**
 * Binds a button to a page section switch. 
 * 
 * If no custom `targetPage` and `targetSection` are provided, the function 
 * infers them from the button's ID using the format: `{page}-button-{section}`.
 * The corresponding section must have an ID matching: `{page}-ui-{section}`.
 *
 * @param {string} buttonID - The ID of the button element.
 * @param {string} [targetPage] - (Optional) Page name to navigate to.
 * @param {string} [targetSection] - (Optional) Section name to navigate to.
 * @returns {void}
 */
export function bindNavButtonToSection(buttonID, targetPage = null, targetSection = null) {
    let page, section;

    if (!targetPage || !targetSection) {
        [page, , section] = buttonID.split('-');
    } else {
        page = targetPage;
        section = targetSection;
    }

    bindClick(buttonID, () => pageNavigator.navigateToSection(page, section));
}

export function bindClick(buttonID, handler) {
    const button = document.getElementById(buttonID);
    if (!button) {
        console.warn(`Button not found: ${buttonID}`);
        return;
    }
    button.addEventListener('click', handler);
}
import * as UrlState from './Utility/UrlState.js';

/**
 * Binds a button to a section switch.
 * 
 * If no custom `targetPage` and `targetSection` are provided, the function 
 * infers them from the button's ID using the format: `{page}-button-{section}`.
 * The corresponding section must have an ID matching: `{page}-ui-{section}`.
 *
 * @param {string} buttonID - The ID of the button element.
 * @param {Function} navigateFn - A function to call when navigating, e.g., (page, section) => {}
 * @param {string} [targetPage] - (Optional) Page name to navigate to.
 * @param {string} [targetSection] - (Optional) Section name to navigate to.
 */
export function bindNavButtonToSection({ buttonId }) {
    const button = document.getElementById(buttonId);

    button.addEventListener('click', () => {
        navigateToSection({
            page: button.dataset.page,
            section: button.dataset.section
        })
    })
}

export function handleInitialNavigation() {
    let { page = 'main', section = 'about', id = '' } = UrlState.get();
    navigateToSection({ page, section, id });
}


export function navigateToSection({ page, section, id }) {
    const { page: pPage, section: pSection, id: pId } = UrlState.get();

    if (pPage) toggleSection(pPage, pSection, pId, false);
    toggleSection(page, section, id, true);

    //override info in url so that page switching works properly on load
    UrlState.set({ params: { page, section, id } });
}

function toggleSection(page, section, id, toggle) {
    console.log(`${page}`);
    const idAttr = id ? `[data-id="${id}"]` : '';
    const pgAttr = `[data-page="${page}"]`;
    const scAttr = `[data-section="${section}"]`;

    // Toggle buttons sharing same page and id
    const buttonSelector = `button${pgAttr}${idAttr}`;
    document.querySelectorAll(buttonSelector).forEach(el => el.classList.toggle('hide-element', !toggle));

    // Toggle the section elements with page, section, and optional id
    const sectionSelector = `${pgAttr}${scAttr}${idAttr}`;
    document.querySelectorAll(sectionSelector).forEach(el => el.classList.toggle('active', toggle));

    // Toggle elements with page and id but NO section attribute
    document.querySelectorAll(`${pgAttr}${idAttr}:not([data-section])`).forEach(el => el.classList.toggle('active', toggle));

    // Toggle elements with page only (no section, no id)
    document.querySelectorAll(`${pgAttr}:not([data-section]):not([data-id])`).forEach(el => el.classList.toggle('active', toggle));
}
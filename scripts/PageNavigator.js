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
export function bindNavButtonToSection(button) {
    
    button.addEventListener('click', () => {
        navigateToSection({ page: button.dataset.page, section: button.dataset.section })
    })
}

export function handleInitialNavigation() {
    let { page = 'main', section = 'about'} = UrlState.get();
    navigateToSection({ page, section});
}


export function navigateToSection({ page, section}) {
    const { page: pPage, section: pSection } = UrlState.get();

    if(pPage && pSection)toggleSection(pPage, pSection, false);
    toggleSection(page, section, true);

    //override info in url so that page switching works properly on load
    UrlState.set({ params: { page, section} });
}

function toggleSection(page, section, toggle) {
    const pgAttr = `[data-page="${page}"]`;
    const scAttr = `[data-section="${section}"]`;

    //navigate pages
    const pageSelector = `${pgAttr}:not([data-section])`;
    document.querySelectorAll(pageSelector).forEach(el => el.classList.toggle('active', toggle));

    // navigate sections
    const sectionSelector = `${pgAttr}${scAttr}`;
    document.querySelectorAll(sectionSelector).forEach(el => el.classList.toggle('active', toggle));
}
import * as Utils from './Utility/Utils.js';
import * as UrlState from './Utility/UrlState.js';
import * as ProjectLoader from './Utility/ProjectLoader.js';
import * as projectHandler from './ProjectHandler.js';

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
export function bindNavButtonToSection(buttonId, targetPage = null, targetSection = null) {
    let page, section;

    if (!targetPage || !targetSection) {
        [page, , section] = buttonId.split('-');
    }
    else {
        page = targetPage;
        section = targetSection;
    }

    Utils.bindClick(buttonId, () => navigateToSection(page, section));
}

export function handleInitialNavigation() {
    const { page, section, id } = UrlState.getInfoFromURL();

    //override info in url so that page switching works properly on load
    UrlState.saveSectionInURL({ page: 'main', section: 'about' });

    if (!page || !section) {
        return;
    }

    if (id) {
        const project = ProjectLoader.projects.find(p => p.id === id);
        projectHandler.createProjectPage({ project });
    }

    navigateToSection(page, section);
}

export function navigateToSection(page, section) {
    const { page: urlPage } = UrlState.getInfoFromURL();

    // Deactivate all sections and nav buttons
    document.querySelectorAll('[id*="-ui-"]').forEach(el => el.classList.remove('active'))
    document.querySelectorAll('[id*="-button-"]').forEach(el => el.classList.remove('active'))

    // Activate target section and button if found
    const targetSection = document.getElementById(`${page}-ui-${section}`);
    if (targetSection) targetSection.classList.add('active');

    const targetButton = document.getElementById(`${page}-button-${section}`);
    if (targetButton) targetButton.classList.add('active');
        
    // Show/hide page-level elements if page changed
    if (urlPage !== page) {
        document.querySelectorAll(`.${urlPage}-page`).forEach(el => el.classList.remove('active'))
        document.querySelectorAll(`.${page}-page`).forEach(el => el.classList.add('active'))
    }

    // Update currentPage from URL and save new state to URL
    UrlState.saveSectionInURL({ page, section });
}

import * as dataHandler from './DataHandler.js';
import * as projectHandler from './ProjectHandler.js';

export function handleInitialNavigation() {
    const { page, section, id } = dataHandler.getInfoFromURL();

    //override info in url so that page switching works properly on load
    dataHandler.saveSectionInURL({ page: 'main', section: 'about' });

    if (!page || !section) {
        return;
    }

    if (id) {
        const project = dataHandler.loadedJsons['./Data/projects.json'].find(p => p.id === id);
        projectHandler.createProjectPage({ project });
    }

    navigateToSection(page, section);
}

export function navigateToSection(page, section) {
    const { page: urlPage } = dataHandler.getInfoFromURL();

    // Deactivate all sections and nav buttons
    batchToggleClasses(document.querySelectorAll('.ui-section'), null, 'active');
    batchToggleClasses(document.querySelectorAll('.nav-button'), 'button-deselected', 'button-selected');

    // Activate target section and button if found
    const targetSection = document.getElementById(`${page}-ui-${section}`);
    if (targetSection) targetSection.classList.add('active');

    const targetButton = document.getElementById(`${page}-button-${section}`);
    if (targetButton) {
        targetButton.classList.add('button-selected');
        targetButton.classList.remove('button-deselected');
    }

    // Show/hide page-level elements if page changed
    if (urlPage !== page) {
        batchToggleClasses(document.querySelectorAll(`.${urlPage}-page`), null, 'active');
        batchToggleClasses(document.querySelectorAll(`.${page}-page`), 'active', null);
    }

    // Update currentPage from URL and save new state to URL
    dataHandler.saveSectionInURL({ page, section });
}
function batchToggleClasses(elements, classToAdd, classToRemove) {
    elements.forEach(el => {
        if (classToRemove) el.classList.remove(classToRemove);
        if (classToAdd) el.classList.add(classToAdd);
    });
}
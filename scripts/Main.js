import * as PageNavigator from './PageNavigator.js';
import * as LazyLoadImages from './LazyLoadImages.js';
import * as TiltCards from './TiltCards.js';
import * as FitParent from './FitParent.js';
import * as ImageModal from './ImageModal.js';

export async function initializePage() {
    LazyLoadImages.init();

    PageNavigator.bindAllNavButtons();

    const randomButtons = document.querySelectorAll('[data-function="random-project"]');
    randomButtons.forEach(button => {
        button.addEventListener('click', () => {
            PageNavigator.randomProjectNavigation();
        });
    });

    PageNavigator.handleInitialNavigation();

    FitParent.init();

    TiltCards.init({
        selector: '.tiltCards',
        tiltStrength: 1
    });

    ImageModal.init({ hideRoles: ['nav-hide'] });

    initFilters({
        filtersContainerId: 'projects-filters',
        itemsContainerId: 'projects-list',
    });

    initScripts();
}

function initScripts() {
    const scriptButtons = document.querySelectorAll('button[data-script]');
    const scriptContainers = document.querySelectorAll('[data-script]:not(button)');

    scriptButtons.forEach(button => {
        button.addEventListener('click', () => {
            const scriptName = button.dataset.script;

            // Activate the clicked button, deactivate others
            scriptButtons.forEach(btn =>
                btn.classList.toggle('active', btn === button)
            );

            // Deactivate all containers
            scriptContainers.forEach(c => c.classList.remove('active'));

            // Activate the matching container
            const codeContainer = document.querySelector(`[data-script="${scriptName}"]:not(button)`);
            if (codeContainer) codeContainer.classList.add('active');
        });
    });

    scriptButtons[0]?.click();
}


function initFilters({ filtersContainerId, itemsContainerId }) {
    const filterContainer = document.getElementById(filtersContainerId);
    const containerToFilter = document.getElementById(itemsContainerId);

    const filterButtons = filterContainer.querySelectorAll('[data-filter]');

    const applyFilter = (activeFilter) => {
        Array.from(containerToFilter.children).forEach(item => {
            const itemType = (item.dataset.filter?.toLowerCase()) || '';
            const match = activeFilter === 'all' || itemType === activeFilter;
            item.classList.toggle('dynamicFilters-hide', !match);
        });
    };

    filterButtons.forEach(item => {
        item.addEventListener('click', () => {
            const activeFilter = item.dataset.filter?.toLowerCase() || 'all';

            filterButtons.forEach(btn => btn.classList.toggle('active', btn === item));
            applyFilter(activeFilter);
        });
    });

    filterButtons[0]?.click();
}


/*

export async function initializePage() {

    Modules.Viewer3D.init(TemplateLoader.getTemplateClone('viewer3D-big'));
    Modules.ShaderViewer.init(TemplateLoader.getTemplateClone('viewer2D-big'));



    // Filters

}*/
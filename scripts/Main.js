import * as PageNavigator from './PageNavigator.js';
import * as TiltCards from './TiltCards.js';
import * as FitParent from './FitParent.js';
import * as ImageModal from './ImageModal.js';
import * as viewer from './Viewer/viewer.js';

export async function initializePage() {
    initLazyLoading();

    PageNavigator.bindAllNavButtons();

    const randomButtons = document.querySelectorAll('[data-function="random-project"]');
    randomButtons.forEach(button => {
        button.addEventListener('click', () => {
            PageNavigator.randomProjectNavigation();
        });
    });

    PageNavigator.handleInitialNavigation();

        
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
    initTimelines();
    viewer.init();

    FitParent.init();
}

/**
 * Initializes script switching behavior for elements using `data-script`.
 *
 * - Clicking a button activates its associated script container.
 * - All other buttons and containers are deactivated.
 * - Automatically activates the first script button on load.
 */
function initScripts() {
    const scriptButtons = document.querySelectorAll('button[data-script]');
    const scriptContainers = document.querySelectorAll('[data-script]:not(button)');

    scriptButtons.forEach(button => {
        button.addEventListener('click', () => {
            const scriptName = button.dataset.script;

            // Activate clicked button, deactivate others
            scriptButtons.forEach(btn =>
                btn.classList.toggle('active', btn === button)
            );

            // Deactivate all containers
            scriptContainers.forEach(c => c.classList.remove('active'));

            // Activate the matching container
            const codeContainer = document.querySelector(
                `[data-script="${scriptName}"]:not(button)`
            );
            if (codeContainer) codeContainer.classList.add('active');
        });
    });

    scriptButtons[0]?.click();
}

/**
 * Initializes a dynamic filtering system for DOM elements.
 *
 * @param {Object} options
 * @param {string} options.filtersContainerId - The ID of the container holding filter buttons.
 * @param {string} options.itemsContainerId   - The ID of the container whose child items will be filtered.
 *
 * Behavior:
 * - Clicking a filter button shows only items with the matching `data-filter` value.
 * - Items that don't match are given the class `dynamicFilters-hide`.
 * - Automatically applies the first filter on load.
 */
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


/**
 * Lazily loads images that use a `data-src` attribute.
 *
 * Behavior:
 * - If the image's `.overlayed-container-item` parent is already `.active`, the image loads immediately.
 * - Otherwise, it waits until the container gains the `.active` class, detected via MutationObserver.
 * - Replaces `data-src` with `src` and removes the lazy-loading attribute after loading.
 *
 * Intended for deferred loading of images inside tabbed or overlayed UI elements.
 */
function initLazyLoading() {
    const load = (img) => (img.src = img.dataset.src, img.removeAttribute('data-src'));

    document.querySelectorAll('img[data-src]').forEach(img => {
        const container = img.closest('.overlayed-container-item');
        if (!container) return;

        if (container.classList.contains('active')) return load(img);

        const observer = new MutationObserver(() => {
            if (container.classList.contains('active')) {
                load(img);
                observer.disconnect();
            }
        });

        observer.observe(container, { attributes: true });
    });
}


function initTimelines() {
    const elements = document.querySelectorAll('.timeline-item');
    const parents = new Set();

    elements.forEach(el => {
        const parent = el.parentElement;
        parents.add(parent);

        const buttons = parent.querySelectorAll('button.timeline-item');

        const target = document.getElementById(el.dataset.target);
        const titleEl = target.querySelector('#title');
        const descriptionEl = target.querySelector('#description');

        el.addEventListener('click', () => {
            titleEl.textContent = el.dataset.title;
            descriptionEl.textContent = el.dataset.description;

            buttons.forEach(btn => btn.classList.toggle('active', btn === el));
        });
    });

    // initialize first timeline in each parent
    parents.forEach(parent => parent.querySelector('.timeline-item')?.click());
}
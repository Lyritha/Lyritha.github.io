export const hasCss = true;

/**
 * Dynamically creates filter buttons from a template, binds click handlers,
 * applies filtering logic to a target container's children,
 * and keeps filtering working for dynamically added items.
 *
 * @param {Object} options
 * @param {string} options.filtersContainerId - ID of the container where filter buttons will be inserted.
 * @param {DocumentFragment} options.template - A document fragment containing the button template (cloned).
 * 
 *   Requirements:
 *   - Must contain exactly one `<button>` element.
 *   - Must include an element with `data-role="content"` to show filter name.
 *   - Selected button uses CSS class `active`.
 *
 * @param {string[]} options.filterNames - Array of filter names (e.g., ['All', 'Unity', 'Blender']).
 * @param {string} options.itemsContainerId - ID of the container holding items to be filtered.
 * @param {string} [options.filterDataKey='filter'] - The data attribute key (without 'data-') used on items.
 */
export function create({ filtersContainerId, filterNames, template, itemsContainerId, filterDataKey = 'filter' }) {
    const filterContainer = document.getElementById(filtersContainerId);
    const containerToFilter = document.getElementById(itemsContainerId);

    if (!filterContainer || !containerToFilter || !template) {
        console.warn('Invalid container or template');
        return;
    }

    filterContainer.innerHTML = '';

    let activeFilter = 'all'; // track currently active filter

    filterNames.forEach(filterName => {
        const clone = template.cloneNode(true);
        const button = clone.querySelector('button');
        const contentEl = clone.querySelector('[data-role="content"]');

        if (contentEl) contentEl.textContent = filterName;
        if (!button) return;

        const lowerFilterName = filterName.toLowerCase();

        button.addEventListener('click', () => {
            activeFilter = lowerFilterName;

            filter(containerToFilter, activeFilter, filterDataKey);
            filterContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });

        clone.querySelectorAll('[data-role]').forEach(el => el.removeAttribute('data-role'));
        filterContainer.appendChild(clone);
    });

    // Trigger click on first button to initialize filtering
    const firstButton = filterContainer.querySelector('button');
    if (firstButton) firstButton.click();

    // Observe container for dynamically added items and filter them automatically
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                filter(containerToFilter, activeFilter, filterDataKey);
            }
        });
    });

    observer.observe(containerToFilter, { childList: true });
}

function filter(containerToFilter, activeFilter, filterDataKey) {
    const currentItems = Array.from(containerToFilter.children);
    currentItems.forEach(item => {
        const itemType = (item.dataset[filterDataKey]?.toLowerCase()) || '';
        const match = activeFilter === 'all' || itemType === activeFilter;
        item.classList.toggle('dynamicFilters-hide', !match);
    });
}
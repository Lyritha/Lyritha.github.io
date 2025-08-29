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
export function create({ filtersContainerId, template, itemsContainerId, filterDataKey = 'filter' }) {
    const filterContainer = document.getElementById(filtersContainerId);
    const containerToFilter = document.getElementById(itemsContainerId);

    if (!filterContainer || !containerToFilter || !template) {
        console.warn('Invalid container or template');
        return;
    }

    filterContainer.innerHTML = '';
    let activeFilter = 'all'; // track currently active filter

    const filters = [];
    const currentItems = Array.from(containerToFilter.children);

    // create a default all filter
    const allClone = template.cloneNode(true);
    const allButton = allClone.querySelector('button');
    const allContentEl = allClone.querySelector('[data-role="content"]');

    if (allContentEl) allContentEl.textContent = "All";
    if (!allButton) return;

    allButton.addEventListener('click', () => {
        activeFilter = "all";

        filter(containerToFilter, activeFilter, filterDataKey);
        filterContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        allButton.classList.add('active');
    });

    filterContainer.appendChild(allClone);

    // create the rest of the filters dynamically
    currentItems.forEach(item => {
        const targetFilter = item.dataset[filterDataKey];

        if (!filters.includes(targetFilter)) {
            filters.push(targetFilter);

            const clone = template.cloneNode(true);
            const button = clone.querySelector('button');
            const contentEl = clone.querySelector('[data-role="content"]');

            if (contentEl) contentEl.textContent = targetFilter;
            if (!button) return;

            const lowerFilterName = targetFilter.toLowerCase();

            button.addEventListener('click', () => {
                activeFilter = lowerFilterName;

                filter(containerToFilter, activeFilter, filterDataKey);
                filterContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });

            clone.querySelectorAll('[data-role]').forEach(el => el.removeAttribute('data-role'));
            filterContainer.appendChild(clone);
        }
    });

    // Trigger click on first button to initialize filtering
    const firstButton = filterContainer.querySelector('button');
    if (firstButton) firstButton.click();
}

function filter(containerToFilter, activeFilter, filterDataKey) {
    const currentItems = Array.from(containerToFilter.children);
    currentItems.forEach(item => {
        const itemType = (item.dataset[filterDataKey]?.toLowerCase()) || '';
        const match = activeFilter === 'all' || itemType === activeFilter;
        item.classList.toggle('dynamicFilters-hide', !match);
    });
}
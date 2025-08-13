/**
 * Dynamically creates filter buttons from a template, binds click handlers,
 * and applies filtering logic to a target container's children.
 *
 * @param {Object} options
 * @param {string} options.filterContainerId - ID of the container where filter buttons will be inserted.
 * @param {DocumentFragment} options.template - A document fragment containing the button template (cloned).
 * @param {string[]} options.filters - Array of filter names (e.g., ['All', 'Unity', 'Blender']).
 * @param {string} options.containerToFilterId - ID of the container holding items to be filtered.
 * @param {string} [options.dataAttribute='filter'] - The data attribute key (without 'data-') used on items to determine their filter type.
 *
 * For example, if your items use `data-filter="Unity"`, then `dataAttribute` should be 'filter'.
 * This value is used to access the corresponding dataset property on each item dynamically.
 */
export function createFilters({ filterContainerId, template, filters, containerToFilterId, dataAttribute = 'filter' }) {
    const filterContainer = document.getElementById(filterContainerId);
    const containerToFilter = document.getElementById(containerToFilterId);
    const items = Array.from(containerToFilter?.children || []);

    if (!filterContainer || !containerToFilter || !template) {
        console.warn('Invalid container or template');
        return;
    }

    filterContainer.innerHTML = '';

    filters.forEach(filterName => {
        const clone = template.cloneNode(true);
        const button = clone.querySelector('button');

        const contentEl = clone.querySelector('[data-role="content"]');
        if (contentEl) contentEl.textContent = filterName;
        if (!button) return;

        filterName = filterName.toLowerCase();

        button.addEventListener('click', () => {
            items.forEach(item => {
                const itemType = (item.dataset[dataAttribute]?.toLowerCase()) || '';

                const match = filterName === 'all' || itemType === filterName;
                item.classList.toggle('hide-element', !match);
            });

            filterContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        })

        filterContainer.appendChild(clone);
    });

    const firstButton = filterContainer.querySelector('button');
    if (firstButton) firstButton.click();
}

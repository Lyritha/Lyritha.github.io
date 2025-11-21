export function init({ filtersContainerId, itemsContainerId }) {
    const filterContainer = document.getElementById(filtersContainerId);
    const containerToFilter = document.getElementById(itemsContainerId);

    // Select all children that are filter buttons
    const filterButtons = filterContainer.querySelectorAll('[data-filter]');

    filterButtons.forEach(item => {
        item.addEventListener('click', () => {
            const activeFilter = item.dataset.filter?.toLowerCase() || 'all';

            filterButtons.forEach(btn => {
                btn.classList.toggle('active', btn === item);
            });

            filter(containerToFilter, activeFilter, 'filter');
        });
    });

    filterButtons[0]?.click();
}

function filter(containerToFilter, activeFilter, filterDataKey) {
    const currentItems = Array.from(containerToFilter.children);
    currentItems.forEach(item => {
        const itemType = (item.dataset[filterDataKey]?.toLowerCase()) || '';
        const match = activeFilter === 'all' || itemType === activeFilter;
        item.classList.toggle('dynamicFilters-hide', !match);
    });
}
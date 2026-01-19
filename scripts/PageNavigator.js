export function bindAllNavButtons() {
    document.querySelectorAll('button[data-page][data-section]').forEach(button => {
        button.addEventListener('click', () => {
            const { page, section } = button.dataset;
            navigateToSection({ page, section });
        });
    });
}

export function randomProjectNavigation(dataKey = 'page') {
    const currentPage = getPage().page;

    // Convert NodeList to Array
    const elements = Array.from(document.querySelectorAll(`[data-${dataKey}]`));

    // Extract unique page names
    const pages = [...new Set(elements.map(el => el.dataset[dataKey]))];

    // Filter out current and 'main'
    const candidates = pages.filter(p => p !== currentPage && p !== 'main');

    if (candidates.length === 0) {
        console.warn(`No pages available for random navigation (dataKey: ${dataKey})`);
        return;
    }

    // Pick a random page
    const randomPage = candidates[Math.floor(Math.random() * candidates.length)];

    // Find the first section belonging to that page
    const firstSection = document.querySelector(
        `[data-${dataKey}="${randomPage}"][data-section]`
    );

    if (!firstSection) {
        console.warn(`No sections found for page "${randomPage}"`);
        return;
    }

    navigateToSection({
        page: randomPage,
        section: firstSection.dataset.section
    });
}



export function handleInitialNavigation() {
    let { page = 'main', section = 'about' } = getPage();
    navigateToSection({ page, section});
}

function navigateToSection({ page, section}) {
    const { page: pPage, section: pSection } = getPage();

    if(pPage && pSection)toggleSection(pPage, pSection, false);
    toggleSection(page, section, true);

    //override info in url so that page switching works properly on load
    setPage({ params: { page, section} });
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

function getPage() {
    return Object.fromEntries(new URL(window.location).searchParams.entries());
}

function setPage({ params }) {
    const url = new URL(window.location);

    Object.entries(params).forEach(([key, value]) => {
        if (value != null && value !== '') {
            url.searchParams.set(key, value);
        } else {
            url.searchParams.delete(key);
        }
    });

    window.history.replaceState({}, '', url);
}
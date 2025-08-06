export function saveSectionInURL({ page, section }) {
    const url = new URL(window.location);
    url.searchParams.set('page', page);
    url.searchParams.set('section', section);
    window.history.replaceState({}, '', url);
}

export function saveIDInURL({ id = null }) {
    const url = new URL(window.location);

    if (id) url.searchParams.set('id', id);
    else url.searchParams.delete('id');

    window.history.replaceState({}, '', url);
}

export function getInfoFromURL() {
    const url = new URL(window.location);
    return {
        page: url.searchParams.get('page'),
        section: url.searchParams.get('section'),
        id: url.searchParams.get('id')
    };
}

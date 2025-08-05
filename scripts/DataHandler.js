export let templates = {};
export let loadedJsons = {};

export async function loadJson(filepath) {
    try {
        const response = await fetch(filepath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        loadedJsons[filepath] = await response.json();
    } catch (error) {
        console.error(`Failed to load JSON from ${filepath}:`, error);
    }
}

/**
 * Loads <template> elements from a separate HTML file into the shared templates object.
 * @param {string} filePath - Path to the templates HTML file
 */
export async function loadTemplates(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText}`);

        const htmlText = await response.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlText;

        const foundTemplates = tempDiv.querySelectorAll('template');
        if (foundTemplates.length === 0) {
            console.warn(`No <template> elements found in ${filePath}`);
            return;
        }

        foundTemplates.forEach(template => {
            if (template.id) {
                templates[template.id] = template;
            } else {
                console.warn('Template without ID encountered and skipped:', template);
            }
        });

    } catch (err) {
        console.error(`Error loading templates from ${filePath}:`, err);
    }
}

/**
 * Returns a clone of the template content by ID.
 * @param {string} templateId - The ID of the template to clone
 */
export function getTemplateClone(templateId) {
    if (Object.keys(templates).length === 0) {
        console.warn('No templates have been loaded');
        return null;
    }

    const template = templates[templateId];
    if (!template) {
        console.warn(`No template found for ID: ${templateId}`);
        return null;
    }

    return template.content.cloneNode(true);
}

export function saveSectionInURL({ page, section}) {
    const url = new URL(window.location);

    url.searchParams.set('page', page);
    url.searchParams.set('section', section);

    window.history.replaceState({}, '', url);
}

export function saveIDInURL({id = null}) {
    const url = new URL(window.location);

    if (id) {
        url.searchParams.set('id', id);
    } else {
        url.searchParams.delete('id');
    }

    window.history.replaceState({}, '', url);
}

export function getInfoFromURL() {
    const url = new URL(window.location);
    const page = url.searchParams.get('page');
    const section = url.searchParams.get('section');
    const id = url.searchParams.get('id');

    return { page, section, id };
}
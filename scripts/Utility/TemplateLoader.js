const templates = {};

export async function loadTemplates(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Failed to fetch templates: ${response.statusText}`);
        const htmlText = await response.text();

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlText;

        tempDiv.querySelectorAll('template').forEach(template => {
            if (template.id) templates[template.id] = template;
        });
    } catch (err) {
        console.error(`Error loading templates from ${filePath}:`, err);
    }
}

export function getTemplateClone(templateId) {
    const template = templates[templateId];
    return template?.content.cloneNode(true) ?? null;
}

export function getTemplateCloneByDataRoles(dataRolesInput) {
    if (!dataRolesInput) return null;

    const dataRoles = new Set(Array.isArray(dataRolesInput) ? dataRolesInput : Object.keys(dataRolesInput));

    for (const [id, template] of Object.entries(templates)) {
        const content = template.content;

        // Get the first direct child of the template (the div with data-role="target-id")
        const firstChild = content.children[0];
        if (!firstChild) continue;

        // Get all elements inside the firstChild (its descendants) with data-role
        const elements = firstChild.querySelectorAll('[data-role]');

        // Gather unique data-roles from these descendants
        const templateRolesSet = new Set();

        elements.forEach(el => {
            const roles = el.getAttribute('data-role').split(/\s+/);
            roles.forEach(role => templateRolesSet.add(role));
        });

        // Check if the sets match exactly
        if (templateRolesSet.size === dataRoles.size &&
            [...templateRolesSet].every(role => dataRoles.has(role))) {
            return content.cloneNode(true);
        }
    }

    return null;
}

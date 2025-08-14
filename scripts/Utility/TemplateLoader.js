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

    // Filter out ?-prefixed roles from the provided input
    const cleanRoles = Array.isArray(dataRolesInput)
        ? dataRolesInput.filter(role => !role.startsWith('?'))
        : Object.keys(dataRolesInput).filter(role => !role.startsWith('?'));

    const dataRoles = new Set(cleanRoles);

    for (const [id, template] of Object.entries(templates)) {
        const content = template.content;
        const firstChild = content.children[0];
        if (!firstChild) continue;

        const elements = firstChild.querySelectorAll('[data-role]');
        const templateRolesSet = new Set();

        elements.forEach(el => {
            const roles = el.getAttribute('data-role').split(/\s+/);
            roles
                .filter(role => !role.startsWith('?'))
                .forEach(role => templateRolesSet.add(role));
        });

        // Check that all required roles are present in the template
        if ([...dataRoles].every(role => templateRolesSet.has(role))) {
            return content.cloneNode(true);
        }
    }

    return null;
}

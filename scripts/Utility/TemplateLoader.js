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

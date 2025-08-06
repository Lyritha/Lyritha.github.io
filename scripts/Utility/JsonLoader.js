export const loadedJsons = {};

export async function loadJson(filepath) {
    try {
        const response = await fetch(filepath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const json = await response.json();

        const filename = filepath.split('/').pop().replace(/\.[^/.]+$/, '');
        loadedJsons[filename] = json;
    } catch (error) {
        console.error(`Failed to load JSON from ${filepath}:`, error);
    }
}

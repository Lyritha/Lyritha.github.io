const loadedJsons = {};

/**
 * Retrieves JSON data by filename, caching loaded files to avoid redundant fetches.
 *
 * @param {string} fileName - The name of the JSON file (without extension) to load.
 * @returns {Promise<Object|null>} The parsed JSON data or null if loading fails.
 */
export async function getJson(fileName) {
    if (loadedJsons[fileName]) {
        return loadedJsons[fileName];
    }
    const json = await loadJson(`./Data/${fileName}.json`);
    loadedJsons[fileName] = json;
    return json;
}

async function loadJson(filepath) {
    try {
        const response = await fetch(filepath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        return await response.json();
    } catch (error) {
        console.error(`Failed to load JSON from ${filepath}:`, error);
        return null;
    }
}

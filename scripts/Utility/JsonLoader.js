const loadedJsons = {};

/**
 * Retrieves JSON data by filename, caching loaded files to avoid redundant fetches.
 * 
 * If the JSON for the requested filename is already cached in `loadedJsons`, 
 * it returns the cached data immediately. Otherwise, it fetches the JSON file 
 * from the `/Data/` directory, caches it, and then returns the data.
 *
 * @param {string} fileName - The name of the JSON file (without extension) to load.
 * @returns {Promise<Object|null>} The parsed JSON data or null if loading fails.
 */
export async function getJson(fileName) {
    return loadedJsons[fileName] ?? await loadJson(`./Data/${fileName}.json`);
}


async function loadJson(filepath) {
    try {
        const response = await fetch(filepath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const json = await response.json();
        const filename = filepath.split('/').pop().replace(/\.[^/.]+$/, '');
        return loadedJsons[filename] = json;
    } catch (error) {
        console.error(`Failed to load JSON from ${filepath}:`, error);
        return null;
    }

}

export let projects = null;

export async function loadProjectJson(filepath) {
    try {
        const response = await fetch(filepath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        let projectData = await response.json();

        // Convert arrays with 'id' keys to objects recursively
        projects = convertArraysWithIdToObjects(projectData);

        return projects;
    } catch (error) {
        console.error(`Failed to load project JSON from ${filepath}:`, error);
    }
}

function convertArraysWithIdToObjects(data) {
    if (Array.isArray(data)) {

        // Recursively apply on each element if array
        return data.map(convertArraysWithIdToObjects);

    }

    else if (data !== null && typeof data === 'object') {

        // Check each property
        for (const key in data) {

            if (Array.isArray(data[key])) {
                const arr = data[key];
                // Check if every element has 'id' string property
                const hasIds = arr.length > 0 && arr.every(el => el && typeof el.id === 'string');

                if (hasIds) {
                    // Convert to object keyed by 'id'
                    const obj = {};
                    arr.forEach(el => {
                        obj[el.id] = convertArraysWithIdToObjects(el);
                    });
                    data[key] = obj;
                } else {
                    // Recursively convert inner arrays
                    data[key] = convertArraysWithIdToObjects(arr);
                }
            } else if (typeof data[key] === 'object' && data[key] !== null) {
                // Recurse into nested objects
                data[key] = convertArraysWithIdToObjects(data[key]);
            }
        }
        return data;
    } else {
        // Primitives - return as is
        return data;
    }
}

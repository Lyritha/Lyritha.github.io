import * as TemplateLoader from './Utility/TemplateLoader.js';
import * as PageNavigator from './PageNavigator.js';
import * as UrlState from './Utility/UrlState.js';

let projects = null;

// ui maker
export async function createAllProjects({projectDataPath, projectListId, projectContainerId, projectNavContainerId }) {
    projects = await loadProjectJson(projectDataPath);

    const projectListContainer = document.getElementById(projectListId);
    const projectsContainer = document.getElementById(projectContainerId);
    const navButtonContainer = document.getElementById(projectNavContainerId);

    projects.forEach(project => {
        const projectItemElement = createProjectItem(project);
        const projectElement = createProject(project, navButtonContainer);

        projectElement.id = project.id;

        projectListContainer.appendChild(projectItemElement);
        projectsContainer.appendChild(projectElement);
    });
}

// gallery of projects
function createProjectItem(project) {
    const clone = TemplateLoader.getTemplateClone('project-item-template');

    assignValues(clone, project);

    const button = clone.querySelector('button[data-function="button"]');
    button.addEventListener('click', () => {

        PageNavigator.navigateToSection({
            page: 'project',
            section: project.pages[0]['page-name'],
            id: project.id
        })
    });

    return clone;
}

// the pages themselves
function createProject(project, navButtonContainer) {
    const projectElement = document.createElement('div');
    projectElement.classList.add('overlayed-container-item');
    projectElement.dataset.id = project.id;
    projectElement.dataset.page = 'project';

    const pages = Object.values(project.pages);

    pages.forEach(page => {
        const projectPageElement = createProjectPage(project, page, navButtonContainer);

        if (projectPageElement) projectElement.appendChild(projectPageElement);
    });

    return projectElement;
}
function createProjectPage(project, page, navButtonContainer) {
    const keys = Object.keys(page);
    const clone = TemplateLoader.getTemplateCloneByDataRoles(keys);

    if (!clone) {
        console.warn('No template found for page keys:', keys);
        return;
    }

    // Set dataset for the main UI element used for navigation targeting
    const uiRoot = clone.querySelector('[data-role="target-id"]');
    Object.assign(uiRoot.dataset, {
        page: 'project',
        section: page['page-name'],
        id: project.id
    });


    // Bulk set dataset attributes on navButton
    const navButton = clone.querySelector('[data-function="nav-button"]');
    navButton.classList.add('hide-element');
    Object.assign(navButton.dataset, {
        page: 'project',
        section: page['page-name'],
        id: project.id
    });

    navButton.addEventListener('click', () => {
        PageNavigator.navigateToSection({
            page: 'project',
            section: page['page-name'],
            id: project.id
        });
    });

    assignValues(navButton, page);
    assignValues(clone, page);

    navButtonContainer.appendChild(navButton);

    return clone;
}



export function getRandomProject() {
    const { id: currentId } = UrlState.get();

    if (!projects || projects.length === 0) {
        console.warn("No projects available!");
        return;
    }

    // Filter out the current project
    const otherProjects = projects.filter(p => p.id !== currentId);

    if (otherProjects.length === 0) {
        console.warn("Only one project available!");
        return;
    }

    const randomProject = otherProjects[Math.floor(Math.random() * otherProjects.length)];
    const firstPage = randomProject.pages[0]['page-name'];

    PageNavigator.navigateToSection({
        page: 'project',
        section: firstPage,
        id: randomProject.id
    });
}

// Helper function to assign data values to elements in a cloned template
function assignValues(clone, data) {
    Object.entries(data).forEach(([key, value]) => {
        // Select all elements with a data-role matching the current key
        const elements = clone.querySelectorAll(`[data-role="${key}"]`);
        if (!elements) return;

        elements.forEach(element => {
            const tag = element.tagName.toUpperCase();

            // Handle special data-* attributes by mapping keys starting with 'data-'
            if (key.startsWith('data-')) {
                const dataAttr = key.slice(5);
                // For each matching element, set the corresponding dataset attribute
                elements.forEach(el => {
                    if (el.hasAttribute('data-role') && el.getAttribute('data-role').includes(key)) {
                        el.dataset[dataAttr] = value;
                    }
                });
                return;
            }

            // Handle <img> tags by setting the 'src' attribute
            if (tag === 'IMG') {
                element.src = value;
                return;
            }

            // Handle <code> tags by setting text content and applying syntax highlighting
            if (tag === 'CODE') {
                element.textContent = value;
                Prism.highlightElement(element);
                return;
            }

            // Handle keys that include 'images' by creating a gallery if the value is an array
            if (key?.toLowerCase().includes('images') && Array.isArray(value)) {
                const length = value.length - 1;

                const children = Array.from(element.children);
                children.forEach((child, index) => { if (index !== length) element.removeChild(child); });
                element.querySelectorAll('img').forEach((imgEl, index) => { imgEl.src = value[index]; });

                return;
            }

            // For common text elements, set their text content
            const textTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'LABEL', 'BUTTON'];
            if (textTags.includes(tag)) {
                element.textContent = value;
            }
        });
    });
}

// importer
async function loadProjectJson(filepath) {
    try {
        const response = await fetch(filepath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const arrayData = await response.json();

        // Convert arrays with 'id' keys to objects recursively
        return arrayToObjectById(arrayData);

    } catch (error) {
        console.error(`Failed to load project JSON from ${filepath}:`, error);
        return null;  // Explicitly return null on failure
    }
}
function arrayToObjectById(data) {
    if (Array.isArray(data)) return data.map(arrayToObjectById);
    if (data === null || typeof data !== 'object') return data;

    const result = {};
    for (const [key, value] of Object.entries(data)) {

        // handle arrays
        if (Array.isArray(value)) {
            const hasIds = value.length > 0 && value.every(el => el && typeof el.id === 'string');

            // If array elements do NOT have 'id' properties, recursively convert each element
            if (!hasIds) {
                result[key] = arrayToObjectById(value);
                continue;
            }

            // Convert array with 'id' to object keyed by 'id'
            result[key] = Object.fromEntries(
                value.map(el => [el.id, arrayToObjectById(el)])
            );

            continue;
        }

        // handle objects
        if (typeof value === 'object' && value !== null) {
            result[key] = arrayToObjectById(value);
            continue;
        }

        // handle primitive values
        result[key] = value;
    }

    return result;
}
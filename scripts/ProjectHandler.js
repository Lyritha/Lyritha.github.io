import * as TemplateLoader from './Utility/TemplateLoader.js';
import * as PageNavigator from './PageNavigator.js';
import * as UrlState from './Utility/UrlState.js';
import * as Modules from '../Modules/moduleManager.js';

/** @type {Set<string>} Tags considered as simple text elements for populateTemplate */
const TEXT_TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'LABEL', 'BUTTON']);

/** @type {Array<Object>|null} List of all loaded projects */
let projects = null;

/**
 * Load all projects and populate the UI with project list, pages, and navigation.
 * @param {Object} params
 * @param {string} params.projectDataPath - Path to the JSON file containing project data
 * @param {string} params.projectListId - ID of the container for project list items
 * @param {string} params.pageContainerId - ID of the container for project pages
 * @param {string} params.navContainerId - ID of the container for project navigation buttons
 */
export async function createAllProjects({ projectDataPath, projectListId, pageContainerId, navContainerId, footerContainerId }) {
    projects = await loadProjectJson(projectDataPath);

    const projectListContainer = document.getElementById(projectListId);
    const pagesContainer = document.getElementById(pageContainerId);
    const navContainer = document.getElementById(navContainerId);
    const footerContainer = document.getElementById(footerContainerId);

    projects.forEach(project => {
        const projectItemElement = createProjectItem(project);
        projectListContainer.appendChild(projectItemElement);

        const projectElement = createProject(project);
        pagesContainer.appendChild(projectElement);

        const navElement = createProjectNav(project);
        navContainer.appendChild(navElement);

        const footerElement = createProjectFooter(project);
        footerContainer.appendChild(footerElement);
    });
}

/**
 * Create a project item element for the project list.
 * @param {Object} project - Project data object
 * @returns {HTMLElement} Cloned project item element
 */
function createProjectItem(project) {
    const clone = TemplateLoader.getTemplateClone('project-item-template');
    populateTemplate(clone, project);

    const button = clone.querySelector('button[data-function="button"]');
    button.addEventListener('click', () => {
        PageNavigator.navigateToSection({
            page: sanitizeId(project.title),
            section: project.sections[0]['?section-name']
        });
    });

    return clone;
}

/**
 * Create navigation buttons for a project.
 * @param {Object} project - Project data object
 * @returns {HTMLElement} Container element holding navigation buttons
 */
function createProjectNav(project) {
    const navElement = document.createElement('div');
    navElement.classList.add('overlayed-container-item', 'flex-ratio-1', 'flex-vertical', 'gap-small', 'flex-horizontal-wrap-tablet', 'flex-allign-center-tablet');
    navElement.dataset.page = sanitizeId(project.title);

    Object.values(project.sections).forEach(section => {
        const clone = TemplateLoader.getTemplateClone('project-button');
        populateTemplate(clone, section);

        const button = clone.querySelector('button');
        const santizedPageName = sanitizeId(project.title);

        button.dataset.page = santizedPageName;
        button.dataset.section = section['?section-name'];

        button.addEventListener('click', () => {
            PageNavigator.navigateToSection({
                page: santizedPageName,
                section: section['?section-name']
            });
        });

        navElement.appendChild(clone);
    });

    return navElement;
}

function createProjectFooter(project) {
    let footerElement = TemplateLoader.getTemplateClone('project-footer-empty');

    switch (project['data-filter']) {
        case 'Unity':
            footerElement = TemplateLoader.getTemplateClone('project-footer-game');
            const buttonContainer = footerElement.querySelector('[data-role="link-container"]');

            Object.values(project.links).forEach(link => {
                const buttonEle = TemplateLoader.getTemplateClone('project-button');
                buttonEle.querySelector('[data-role="section-icon"]').src = link.icon;
                buttonEle.querySelector('[data-role="section-name"]').textContent = link.name;
                const button = buttonEle.querySelector('button');

                button.addEventListener('click', () => {
                    window.open(link.link, '_blank');
                });

                buttonContainer.appendChild(buttonEle);
            });

            break;
    }

    const dataEl = footerElement.querySelector('[data-role="project-data"]');
    dataEl.dataset.page = sanitizeId(project.title);

    return footerElement;
}

/**
 * Create a full project page including sections and action buttons.
 * @param {Object} project - Project data object
 * @returns {HTMLElement} Project page element
 */
function createProject(project) {
    const projectElement = TemplateLoader.getTemplateClone('project');

    projectElement.querySelector('[data-role="project-data"]').dataset.page = sanitizeId(project.title);
    projectElement.querySelector('[data-role="project-title"]').textContent = project.title;

    const sectionContainer = projectElement.querySelector('[data-role="section-container"]');
    Object.values(project.sections).forEach(section => {
        const sectionElement = createSection(project, section);
        if (sectionElement) sectionContainer.appendChild(sectionElement);
    });

    const randomButton = projectElement.querySelector('[data-function="random-project"]');
    randomButton.addEventListener('click', () => openRandomProject());

    const projectsButton = projectElement.querySelector('[data-function="projects"]');
    projectsButton.addEventListener('click', () => PageNavigator.navigateToSection({ page: 'main', section: 'projects' }));

    return projectElement;
}

/**
 * Create a section element for a project page.
 * @param {Object} project - Project data object
 * @param {Object} section - Section data object
 * @returns {HTMLElement|undefined} Cloned section element or undefined if template not found
 */
function createSection(project, section) {
    const keys = Object.keys(section);
    const clone = TemplateLoader.getTemplateCloneByDataRoles(keys);

    if (!clone) {
        console.warn('No template found for page keys:', keys);
        return;
    }

    const uiRoot = clone.querySelector('[data-role="section-data"]');
    Object.assign(uiRoot.dataset, { page: sanitizeId(project.title), section: section['?section-name'] });

    populateTemplate(clone, section);

    return clone;
}

/**
 * Open a random project that is not the currently displayed page.
 */
function openRandomProject() {
    if (!projects || projects.length === 0) return;

    const { page: currentPage } = UrlState.get();
    const otherProjects = projects.filter(p => sanitizeId(p.title) !== currentPage);

    if (otherProjects.length === 0) return;

    const randomIndex = Math.floor(Math.random() * otherProjects.length);
    const project = otherProjects[randomIndex];

    const firstSectionName = project.sections[0]['?section-name'];
    const pageName = sanitizeId(project.title);
    PageNavigator.navigateToSection({ page: pageName, section: firstSectionName });
}

/**
 * Populate a cloned template with data, mapping keys to elements with matching data-role attributes.
 * @param {HTMLElement} clone - Cloned template element
 * @param {Object} data - Data object to populate into the template
 */
function populateTemplate(clone, data) {
    Object.entries(data).forEach(([rawKey, value]) => {
        const key = rawKey.replace(/\?/g, '');
        const elements = clone.querySelectorAll(`[data-role="${key}"]`);
        if (elements.length === 0) return;

        elements.forEach(element => {
            const tag = element.tagName.toUpperCase();

            if (TEXT_TAGS.has(tag)) {
                element.textContent = value;
                return;
            }

            if (tag === 'IMG') {
                element.dataset.src = value;
                return;
            }

            if (tag === 'CODE') {
                element.textContent = value;
                Prism.highlightElement(element);
                return;
            }

            if (key.toLowerCase().includes('images') && Array.isArray(value)) {
                const length = value.length - 1;
                const children = Array.from(element.children);
                children.forEach((child, index) => { if (index !== length) element.removeChild(child); });
                element.querySelectorAll('img').forEach((imgEl, index) => { imgEl.dataset.src = value[index]; });
                return;
            }

            if (key.toLowerCase().includes('scene')) {
                Object.entries(value).forEach(([sceneKey, sceneValue]) => {
                    element.dataset[sceneKey] = sceneValue;
                });

                const canOpen = Modules.Viewer3D.canOpen3DViewer(element);

                if (canOpen) {
                    Modules.Viewer3D.openScene({
                        modelPath: value.modelPath,
                        modelBoundsName: value.modelBoundsName,
                        hdrPathOrHex: value.hdrPathOrHex,
                        container: element
                    });
                }
            }

            if (key.startsWith('data-')) {
                element.dataset[key.slice(5)] = value;
                return;
            }
        });
    });
}

/**
 * Sanitize a string to use as a valid page ID.
 * @param {string} str
 * @returns {string} Sanitized string with no spaces
 */
const sanitizeId = str => str.replace(/\s/g, '');

/**
 * Load a JSON file containing projects and convert arrays with `id` keys into objects.
 * @param {string} filepath - URL or path to JSON file
 * @returns {Promise<Object|null>} Parsed project data object or null on failure
 */
async function loadProjectJson(filepath) {
    try {
        const response = await fetch(filepath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayData = await response.json();
        return arrayToObjectById(arrayData);
    } catch (error) {
        console.error(`Failed to load project JSON from ${filepath}:`, error);
        return null;
    }
}

/**
 * Recursively convert arrays with `id` keys to objects keyed by `id`.
 * @param {any} data - Input data
 * @returns {any} Converted object
 */
function arrayToObjectById(data) {
    if (Array.isArray(data)) return data.map(arrayToObjectById);
    if (data === null || typeof data !== 'object') return data;

    const result = {};
    for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
            const hasIds = value.length > 0 && value.every(el => el && typeof el.id === 'string');
            if (!hasIds) {
                result[key] = arrayToObjectById(value);
                continue;
            }
            result[key] = Object.fromEntries(value.map(el => [el.id, arrayToObjectById(el)]));
            continue;
        }
        if (typeof value === 'object' && value !== null) {
            result[key] = arrayToObjectById(value);
            continue;
        }
        result[key] = value;
    }
    return result;
}

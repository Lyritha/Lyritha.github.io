import * as dataHandler from './DataHandler.js';
import * as pageNavigator from './PageNavigator.js';
import * as projectHandler from './ProjectHandler.js';
import * as experienceHandler from './experienceHandler.js';
import * as buttonBinder from './ButtonBinder.js';
import * as projectFilter from './ProjectFilter.js';

export async function initializePage() {
    await loadFiles();

    pageNavigator.handleInitialNavigation();

    projectHandler.createProjectList({
        projects: dataHandler.loadedJsons['./Data/projects.json'],
        containerId: 'projects-list',
        switchSectionFN: pageNavigator.navigateToSection
    });

    experienceHandler.createDynamicList({
        data: dataHandler.loadedJsons['./Data/education.json'],
        listContainerId: "education-list",
        titleId: "education-title",
        descriptionId: "education-description",
        template: dataHandler.getTemplateClone('vertical-list-item')
    });

    experienceHandler.createDynamicList({
        data: dataHandler.loadedJsons['./Data/experiences.json'],
        listContainerId: "experiences-list",
        titleId: "experience-title",
        descriptionId: "experience-description",
        template: dataHandler.getTemplateClone('vertical-list-item')
    });

    bindAllButtons();

    /*initializes the project list with the unity filter */
    projectFilter.applyProjectFilter('filter-all', 'All');

    initFullscreenImages();
}

async function loadFiles() {
    await dataHandler.loadJson('./Data/projects.json');
    await dataHandler.loadJson('./Data/education.json');
    await dataHandler.loadJson('./Data/experiences.json');
    await dataHandler.loadTemplates('./Data/templates.html');
}

function bindAllButtons() {
    /*main page nav buttons*/
    const navButtons = [
        'main-button-about',
        'main-button-experiences',
        'main-button-education',
        'main-button-projects',
        'project-button-about',
        'project-button-contribution',
        'project-button-gallery',
        'project-button-code',
    ];
    navButtons.forEach(id => buttonBinder.bindNavButtonToSection(id));

    /*adds the filter functionality to the buttons */
    buttonBinder.bindClick('filter-all', () => {
        projectFilter.applyProjectFilter('filter-all', 'All');
    });
    buttonBinder.bindClick('filter-unity', () => {
        projectFilter.applyProjectFilter('filter-unity', 'Unity');
    });
    buttonBinder.bindClick('filter-blender', () => {
        projectFilter.applyProjectFilter('filter-blender', 'Blender');
    });
    buttonBinder.bindClick('filter-shaders', () => {
        projectFilter.applyProjectFilter('filter-shaders', 'Shaders');
    });

    buttonBinder.bindNavButtonToSection('button-to-projects', 'main', 'projects');

    buttonBinder.bindClick('button-random-project', () => {
        projectHandler.getRandomProject(
            { switchSectionFN: pageNavigator.navigateToSection });
    });
}
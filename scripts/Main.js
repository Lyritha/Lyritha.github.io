import * as TemplateLoader from './Utility/TemplateLoader.js';
import * as ProjectLoader from './Utility/ProjectLoader.js';
import * as JsonLoader from './Utility/JsonLoader.js';
import * as UrlState from './Utility/UrlState.js';

import * as Utils from './Utility/Utils.js';
import * as PageNavigator from './PageNavigator.js';
import * as ProjectHandler from './ProjectHandler.js';

// page elements
import * as Timeline from './Elements/Timeline.js';
import * as DynamicFilters from './Elements/DynamicFilters.js';
import * as InfoIcon from './Elements/InfoIcon.js';
import * as ReactiveCorners from './Elements/ReactiveCorners.js'

export async function initializePage() {
    await loadFiles();

    PageNavigator.handleInitialNavigation();

    ProjectHandler.createProjectList({
        projects: ProjectLoader.projects,
        template: TemplateLoader.getTemplateClone('project-item-template'),
        containerId: 'projects-list',
        switchSectionFN: PageNavigator.navigateToSection
    });

    DynamicFilters.createFilters({
        filterContainerId: 'projects-filters',
        template: TemplateLoader.getTemplateClone('simple-button'),
        filters: ['All', 'Unity', 'Blender', 'Shaders'],
        containerToFilterId: 'projects-list',
        dataAttribute: 'filter'
    });

    Timeline.createTimeline({
        data: JsonLoader.loadedJsons['education'],
        containerId: "education-list",
        titleId: "education-title",
        descriptionId: "education-description",
        template: TemplateLoader.getTemplateClone('timeline-item')
    });
    Timeline.createTimeline({
        data: JsonLoader.loadedJsons['experiences'],
        containerId: "experiences-list",
        titleId: "experience-title",
        descriptionId: "experience-description",
        template: TemplateLoader.getTemplateClone('timeline-item')
    });

    InfoIcon.createInfoIconList({
        data: JsonLoader.loadedJsons['languagesIcons'],
        template: TemplateLoader.getTemplateClone('info-icons'),
        containerId: 'info-languages'
    });
    InfoIcon.createInfoIconList({
        data: JsonLoader.loadedJsons['programIcons'],
        template: TemplateLoader.getTemplateClone('info-icons'),
        containerId: 'info-programs'
    });

    document.querySelectorAll('.text-container, .image-container, .code-container').forEach(container => {
        ReactiveCorners.addCornerElements(container, './Images/Icons/triangle.svg');
    });


    bindAllButtons();
}

async function loadFiles() {
    const jsonFiles = [
        'education',
        'experiences',
        'languagesIcons',
        'programIcons'
    ];

    await Promise.all(
        jsonFiles.map(file => JsonLoader.loadJson(`./Data/${file}.json`))
    );

    await TemplateLoader.loadTemplates('./Data/templates.html');
    await ProjectLoader.loadProjectJson('./Data/projects.json');
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
    navButtons.forEach(id => PageNavigator.bindNavButtonToSection(id));

    Utils.bindClick('button-to-projects', () => {
        PageNavigator.navigateToSection('main', 'projects');
        UrlState.saveIDInURL({});
    });

    Utils.bindClick('button-random-project', () => {
        ProjectHandler.getRandomProject(
            {projects: ProjectLoader.projects, switchSectionFN: PageNavigator.navigateToSection });
    });
}
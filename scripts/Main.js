import * as TemplateLoader from './Utility/TemplateLoader.js';
import * as JsonLoader from './Utility/JsonLoader.js';

import * as PageNavigator from './PageNavigator.js';
import * as ProjectHandler from './ProjectHandler.js';

import * as Modules from '../Modules/moduleManager.js'

export async function initializePage() {
    await Modules.LoadModules();
    await TemplateLoader.loadTemplates('./Data/templates.html');

    
    await ProjectHandler.createAllProjects({
        projectDataPath: './Data/projects.json',
        projectListId: 'projects-list',
        pageContainerId: 'pages',
        navContainerId: 'nav-buttons',
        footerContainerId: 'footer-container'
    });

    // Enable image modal
    Modules.ImageModal.enable({
        template: TemplateLoader.getTemplateClone('image-modal'),
        hideRoles: ['nav-hide']
    });

    // Filters
    Modules.DynamicFilters.create({
        filtersContainerId: 'projects-filters',
        filterNames: ['All', 'Unity', 'Blender', 'Shaders'],
        template: TemplateLoader.getTemplateClone('simple-button'),
        itemsContainerId: 'projects-list',
        filterDataKey: 'filter'
    });

    // timelines
    Modules.InteractiveItems.create({
        template: TemplateLoader.getTemplateClone('timeline-item'),
        data: JsonLoader.getJson('education'),
        containerId: "education-list",
        targetMap: {
            title: "education-title",
            description: "education-description",
        }
    });

    Modules.InteractiveItems.create({
        template: TemplateLoader.getTemplateClone('timeline-item'),
        data: JsonLoader.getJson('experiences'),
        containerId: "experiences-list",
        targetMap: {
            title: "experience-title",
            description: "experience-description"
        }
    });

    // hover info icons
    Modules.InteractiveItems.create({
        template: TemplateLoader.getTemplateClone('info-icons'),
        data: JsonLoader.getJson('languagesIcons'),
        containerId: "info-languages",
    });

    Modules.InteractiveItems.create({
        template: TemplateLoader.getTemplateClone('info-icons'),
        data: JsonLoader.getJson('programIcons'),
        containerId: "info-programs",
    });

    // Decorative modules
    Modules.CornerDecorations.create({
        selector: '.text-container, .image-container, .code-container, .button-location',
        imageSource: './Images/Icons/triangle.svg',
        imageSize: 'var(--text-size)'
    });

    Modules.TiltCards.create({
        selector: '.text-container, .image-container, .code-container, .button-location, .button-social',
        tiltStrength: 1
    });


    bindAllButtons();
    PageNavigator.handleInitialNavigation();
}

function bindAllButtons() {
    // Auto-bind any main-button-* ID
    document.querySelectorAll('[id^="main-button-"]').forEach(btn => {
        PageNavigator.bindNavButtonToSection({ buttonId: btn.id });
    });
}
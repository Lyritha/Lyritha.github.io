import * as TemplateLoader from './Utility/TemplateLoader.js';
import * as JsonLoader from './Utility/JsonLoader.js';

import * as PageNavigator from './PageNavigator.js';
import * as ProjectHandler from './ProjectHandler.js';

import * as Modules from './Modules/moduleManager.js'

export async function initializePage() {
    await Modules.LoadModules();
    await TemplateLoader.loadTemplates('./Data/templates.html');

    Modules.Viewer3D.init(TemplateLoader.getTemplateClone('viewer3D-big'));
    Modules.ShaderViewer.init(TemplateLoader.getTemplateClone('viewer2D-big'));

    // Load projects
    await ProjectHandler.createAllProjects({
        projectDataPath: './Projects/projects.json',
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
        template: TemplateLoader.getTemplateClone('simple-button'),
        itemsContainerId: 'projects-list',
        filterDataKey: 'filter'
    });

    // timeline items
    const timelines = await JsonLoader.getJson('timeline');
    ['education', 'experiences'].forEach(group => {
        Modules.InteractiveItems.create({
            template: TemplateLoader.getTemplateClone('timeline-item'),
            data: timelines[group],
            containerId: `${group}-list`,
            targetMap: {
                title: `${group}-title`,
                description: `${group}-description`
            }
        });
    });

    // hover info icons
    const icons = await JsonLoader.getJson('infoIcons');
    ['languages', 'programs'].forEach(group => {
        Modules.InteractiveItems.create({
            template: TemplateLoader.getTemplateClone('info-icons'),
            data: icons[group],
            containerId: `info-${group}`,
        });
    });

    // Decorative modules
    Modules.CornerDecorations.create({
        selector: '.text-container, .image-container, .code-container, .button-location, .viewer3D-container, .default-container',
        imageSource: './Images/Icons/triangle.svg',
        imageSize: 'var(--text-size)'
    });

    Modules.TiltCards.create({
        selector: '.text-container, .image-container, .code-container, .button-location, .button-social, .viewer3D-container, .default-container',
        tiltStrength: 1
    });


    // Bind navigation buttons to sections
    document.querySelectorAll('button[data-page][data-section]').forEach(btn => {
        PageNavigator.bindNavButtonToSection(btn);
    });

    Modules.LoadImagesOptimized.initialize();
    Modules.FitParent.init();
    PageNavigator.handleInitialNavigation();
}
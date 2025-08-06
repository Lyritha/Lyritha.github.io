import * as UrlState from './Utility/UrlState.js';
import * as TemplateLoader from './Utility/TemplateLoader.js';
import * as Utils from './Utility/Utils.js';

const linkTypeInfo = {
    Github: { src: 'Images/Socials/Github.png', label: 'Github', alt: 'Github Icon' },
    Direct: { src: 'Images/Icons/download.png', label: 'Download', alt: 'Download Icon' },
    UnityPlay: { src: 'Images/Software/unity.png', label: 'Unity play', alt: 'Unity Play Icon' },
    ItchIO: { src: 'Images/Socials/itchio.svg', label: 'Itch.io', alt: 'Itch.io Icon' },
};

export function createProjectList({ projects, containerId, template, switchSectionFN }) {
    const listContainer = document.getElementById(containerId);
    if (!listContainer) return;

    listContainer.innerHTML = '';

    projects.forEach(project => {
        const clone = template.cloneNode(true);

        const rootDiv = clone.querySelector('[data-role="filter"]');
        rootDiv.dataset.filter = project.projectType;

        const img = clone.querySelector('[data-role="icon"]');
        img.src = project.projectThumbnail;
        img.alt = `${project.projectTitle} Thumbnail`;

        const title = clone.querySelector('[data-role="title"]');
        title.textContent = project.projectTitle;

        const subTitle = clone.querySelector('[data-role="sub-title"]');
        subTitle.textContent = project.projectSubtitle;

        const button = clone.querySelector('[data-role="button"]');
        Utils.bindClick(button, () => {
            switchSectionFN('project', getFirstAvailablePage(project));
            createProjectPage({ project });
        })


        // Optionally remove all data-role attributes (cleanup)
        clone.querySelectorAll('[data-role]').forEach(el => el.removeAttribute('data-role'));

        listContainer.appendChild(clone);
    });
}

export function createProjectPage({ project }) {
    Utils.setText('project-title', project.projectTitle);

    Utils.setText('about-desc', project.pages['about'].desc);
    Utils.setImageSrc('about-img', project.pages['about'].img);

    Utils.setText('contribution-desc', project.pages['contribution'].desc);
    Utils.setImageSrc('contribution-img', project.pages['contribution'].img);

    const codeEl = document.querySelector('#code-code');
    Utils.setText(codeEl, project.pages['code'].code);
    Prism.highlightElement(codeEl);
    codeEl.scrollTop = 0;
    codeEl.scrollLeft = 0;

    CreateGallery(project, 'gallery-container');

    Object.values(project.pages).forEach((page) => {
        const element = document.getElementById(`project-button-${page.id}`);

        if (!element) return;  // safeguard in case element doesn't exist

        if (page.enabled) {
            element.classList.remove('hide-element');
        } else {
            element.classList.add('hide-element');
        }
    });

    UrlState.saveIDInURL({ id: project.id });
    CreatePlayLinks(project, 'where-to-list');
}

function getFirstAvailablePage(project) {
    const pages = Object.values(project.pages);
    return pages.find(page => page.enabled).id;
}

function createPlayButton(info, url) {
    const button = document.createElement('button');
    button.className = 'button';
    button.innerHTML = `<img src="${info.src}" class="button-icon" alt="${info.alt}"/><p>${info.label}</p>`;
    button.addEventListener('click', () => window.open(url, '_blank'));
    return button;
}

function CreatePlayLinks(project, containerID) {
    const listContainer = document.getElementById(containerID);
    if (!listContainer || !project.links) return;

    listContainer.innerHTML = '';

    project.links.forEach(exp => {
        const info = linkTypeInfo[exp.type] || { src: 'Images/Socials/itchio.svg', label: 'MISSINGTYPE', alt: 'Missing Icon' };
        const button = createPlayButton(info, exp.link);
        listContainer.appendChild(button);
    });
}

function CreateGallery(project, targetContainer) {
    const count = project.pages['gallery'].images.length;
    const container = document.getElementById(targetContainer);
    if (!container) return;

    const templateId = `gallery-${count}`;
    const clone = TemplateLoader.getTemplateClone(templateId);
    if (!clone) return;

    clone.querySelectorAll('img').forEach((imgEl, index) => {
        imgEl.src = project.pages['gallery'].images[index];
    });

    container.innerHTML = '';
    container.appendChild(clone);
}

export function getRandomProject({projects, switchSectionFN }) {
    const { id: currentId } = UrlState.getInfoFromURL();

    // Filter out the current project
    const filteredProjects = projects.filter(project => project.id !== currentId);

    if (filteredProjects.length === 0) {
        console.warn("No other projects to choose from.");
        return;
    }

    // Pick a random project
    const randomProject = filteredProjects[Math.floor(Math.random() * filteredProjects.length)];

    // Trigger the page update
    createProjectPage({ project: randomProject });
    const firstPage = getFirstAvailablePage(randomProject);
    switchSectionFN('project', firstPage);
}

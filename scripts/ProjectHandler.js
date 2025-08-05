import * as dataHandler from './DataHandler.js';

const linkTypeInfo = {
    Github: { src: 'Images/Socials/Github.png', label: 'Github', alt: 'Github Icon' },
    Direct: { src: 'Images/Icons/download.png', label: 'Download', alt: 'Download Icon' },
    UnityPlay: { src: 'Images/Software/unity.png', label: 'Unity play', alt: 'Unity Play Icon' },
    ItchIO: { src: 'Images/Socials/itchio.svg', label: 'Itch.io', alt: 'Itch.io Icon' },
};

export function createProjectList({ projects, containerId, switchSectionFN }) {
    const listContainer = document.getElementById(containerId);
    if (!listContainer) return;

    listContainer.innerHTML = '';

    projects.forEach(exp => {
        const clone = dataHandler.getTemplateClone('project-item-template');
        if (!clone) return;

        // same content updates as before
        const rootDiv = clone.querySelector('#project-item-root');
        rootDiv.classList.add(exp.projectType);
        rootDiv.dataset.id = exp.id;

        const img = clone.querySelector('#project-item-img');
        img.src = exp.projectThumbnail;
        img.alt = `${exp.projectTitle} Thumbnail`;

        const title = clone.querySelector('#project-item-title');
        title.textContent = exp.projectTitle;

        const subTitle = clone.querySelector('#project-item-subTitle');
        subTitle.textContent = exp.projectSubtitle;

        const button = clone.querySelector('#project-item-button');
        button.addEventListener('click', () => {
            const firstPage = getFirstAvailablePage(exp);
            switchSectionFN('project', firstPage);
            dataHandler.saveIDInURL({ id: exp.id });
            createProjectPage({ project: exp });
        });

        listContainer.appendChild(clone);
    });
}
export function createProjectPage({ project }) {

    setText('project-title', project.projectTitle);

    toggleVisibility({
        elementID: 'project-button-about',
        shouldShow: !!(project.about.enabled),
        handler: () => {
            setText('about-desc', project.about.desc);
            setImageSrc('about-img', project.about.img);
        }
    });

    toggleVisibility({
        elementID: 'project-button-contribution',
        shouldShow: !!(project.contribution.enabled),
        handler: () => {
            setText('contribution-desc', project.contribution.desc);
            setImageSrc('contribution-img', project.contribution.img);
        }
    });

    toggleVisibility({
        elementID: 'project-button-code',
        shouldShow: !!(project.code.enabled),
        handler: () => {
            setText('code-code', project.code.code);
            const codeEl = document.querySelector('#code-code');
            Prism.highlightElement(codeEl);
            codeEl.scrollTop = 0;
        }
    });

    toggleVisibility({
        elementID: 'project-button-gallery',
        shouldShow: !!(project.galleryImages && project.galleryImages.length > 0),
        handler: () => {
            CreateGallery(project, 'gallery-container');
            initFullscreenImages();
        }
    });

    CreatePlayLinks(project, 'where-to-list');
}



function toggleVisibility({ elementID, shouldShow, handler }) {
    const element = document.getElementById(elementID);
    if (!element) return;

    if (shouldShow) {
        element.classList.remove('hide-element');
        if (typeof handler === 'function') { handler(); }
    }
    else {
        element.classList.add('hide-element');
    }
}

function getFirstAvailablePage(project) {
    if (project.about.enabled) return 'about';
    if (project.contribution.enabled) return 'contribution';
    if (project.code.enabled) return 'code';
    if (project.galleryImages && project.galleryImages.length > 0) return 'gallery';
    return 'about';
}


function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}
function setImageSrc(id, src) {
    const el = document.getElementById(id);
    if (el) el.src = src;
}

function createPlayButton(info, url) {
    const button = document.createElement('button');
    button.className = 'button-deselected';
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
    const count = project.galleryImages.length;
    const container = document.getElementById(targetContainer);
    if (!container) return;

    const templateId = `gallery-${count}`;
    const clone = dataHandler.getTemplateClone(templateId);
    if (!clone) return;

    clone.querySelectorAll('img').forEach((imgEl, idx) => {
        if (project.galleryImages[idx]) {
            imgEl.src = project.galleryImages[idx];
        }
    });

    container.innerHTML = '';
    container.appendChild(clone);
}

export function getRandomProject({ switchSectionFN }) {
    const { id: currentId } = dataHandler.getInfoFromURL();
    const projects = dataHandler.loadedJsons['./Data/projects.json'];

    // Filter out the current project
    const filteredProjects = projects.filter(project => project.id !== currentId);

    if (filteredProjects.length === 0) {
        console.warn("No other projects to choose from.");
        return;
    }

    // Pick a random project
    const randomProject = filteredProjects[Math.floor(Math.random() * filteredProjects.length)];

    dataHandler.saveIDInURL({ id: randomProject.id });

    // Trigger the page update
    createProjectPage({ project: randomProject });
    const firstPage = getFirstAvailablePage(randomProject);
    switchSectionFN('project', firstPage);
}

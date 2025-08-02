const EXMAPLEPROJECT = [
    {
        id: "ID",
        projectTitle: "NAME",
        projectSubTitle: "1 sentence description",
        projectThumbnail: "link to preview image",
        projectType: "Unity/Blender/Shaders",
        AboutProjectDesc: "explain what the project is",
        AboutProjectImg: "image to help explanation",
        ContributionDesc: "what i did within the project (maybe hide if solo project?)",
        ContributionImg: "image to support contribution",
        galleryImages: [
            "list of image links for gallary, can be 1-5 images"
        ],
        CodeDesc: "describe a piece of code",
        CodeImg: "piece of code (maybe add option for actual text based version?)",
        WhereToPlay: [
            {
                Type: "Github",
                Link: "LINK"
            },
            {
                Type: "UnityPlay",
                Link: "LINK"
            },
            {
                Type: "Direct",
                Link: "LINK"
            },
            {
                Type: "ItchIO",
                Link: "LINK"
            },
        ]
    }
]

const projects = [
    {
        id: "towaria",
        projectTitle: "Towaria",
        projectSubTitle: "A voxel based tower defense.",
        projectThumbnail: "Images/Projects/Towaria/towaria_preview.png",
        projectType: "Unity",
        AboutProjectDesc: "Towaria is a challenging tower defense game where letting enemies reach the end means defeat. \n\nPlace auto-firing towers to eliminate all enemies and advance through waves. Survive the final wave to move on to the next level.",
        AboutProjectImg: "Images/Projects/Towaria/towaria_preview.png",
        ContributionDesc: "I focused on core game mechanics, like tower placement and stats. \n\nI also contributed to 3D models (ground tiles, a tower, enemies) and helped polish the UI to ensure visual consistency after functionality was implemented.",
        ContributionImg: "Images/Projects/Towaria/towaria_preview2.png",
        galleryImages: [
            "Images/Projects/Towaria/towaria_preview.png",
            "Images/Projects/Towaria/towaria_preview2.png",
            "Images/Projects/Towaria/towaria_3d_models.png",
        ],
        CodeDesc: "This piece of code is a unity job, jobs \nallow you to do multi-threading without \nhaving to thread manage yourself. \n\nThis specific job moves all the enemies in our game across the path towards the goal, it also rotates the enemy when needed(if it goes around a corner).",
        CodeImg: "Images/Projects/Towaria/towaria_code.png",
        WhereToPlay: [
            {
                Type: "Github",
                Link: "https://github.com/Egg321123/J2P1_microgame/releases/tag/prototype-03"
            },
            {
                Type: "Direct",
                Link: "https://github.com/Egg321123/J2P1_microgame/releases/download/prototype-03/Towaria.apk"
            },
        ]
    },
    {
        id: "the-filth",
        projectTitle: "The Filth",
        projectSubTitle: "90's desktop bullet hell.",
        projectThumbnail: "Images/Projects/TheFilth/TheFilth_preview.png",
        projectType: "Unity",
        AboutProjectDesc: "The Filth is a space shooter-like game made during a gamejam with the theme: \"Making free space\", where you have to shoot at files to destroy them, and survive their attacks. \n\nAs the player you can shoot projectiles to destroy enemies, and also have access to a special attack that hurts multiple enemies.",
        AboutProjectImg: "Images/Projects/TheFilth/TheFilth_preview.png",
        ContributionDesc: "In this project my role was SCRUM master and lead developer. \n\nI focused on integrating game systems that the other group members made, but also made my own systems like the spawning grid. I also made the UI of the game.",
        ContributionImg: "Images/Projects/TheFilth/TheFilth_preview2.png",
        galleryImages: [
            "Images/Projects/TheFilth/TheFilth_preview.png",
            "Images/Projects/TheFilth/TheFilth_sprites.png",
            "Images/Projects/TheFilth/TheFilth_preview2.png",
        ],
        CodeDesc: "This script controls the \"eye\" \nin the middle of the screen to add a \nbit of extra movement in the scene\n\nIt chooses a random delay for movement,\nthen flips a coin if it will follow the players movement for a few seconds, or \nif it will look at a random point on the screen.",
        CodeImg: "Images/Projects/TheFilth/TheFilth_code.png",
        WhereToPlay: [
            {
                Type: "Github",
                Link: "https://github.com/Lyritha/TheFilth/releases/tag/GameJam-Release"
            },
            {
                Type: "UnityPlay",
                Link: "https://play.unity.com/en/games/b90b0494-ef42-4095-bdf8-ac9bbe0ff9be/the-filth"
            },
        ]
    }
];

/**
 * allow switching between "pages" (anything marked with the ui-section tag). 
 * important: this is a global effect, not local to each ui-container
 */
function SwitchSection(targetDivId, buttonID) {
    const targetSection = document.getElementById(targetDivId);
    const targetButton = document.getElementById(buttonID);
    const sections = document.querySelectorAll('.ui-section');
    const selectedButtons = document.querySelectorAll('.nav-button');

    sections.forEach(section => section.classList.remove('active'));

    selectedButtons.forEach(btn => {
        btn.classList.remove('button-selected');
        btn.classList.add('button-deselected');
    });

    if (targetSection) {
        targetSection.classList.add('active');
    }

    if (targetButton) {
        targetButton.classList.add('button-selected');
        targetButton.classList.remove('button-deselected');
    }

    const cleanSection = targetDivId.replace(/^ui-/, '');
    const url = new URL(window.location);
    url.searchParams.set('section', cleanSection);
    window.history.pushState({}, '', url);
}

function LoadPageOnStart() {
    const url = new URL(window.location);
    const section = url.searchParams.get('section');
    const projectID = url.searchParams.get('id');

    if (!section) return;

    if (projectID) {
        const project = projects.find(p => p.id === projectID);
        CreateProjectPage({ project });
        switchPages('.project-page', '.main-page');
    }

    SwitchSection(`ui-${section}`, `button-${section}`);
}

/**
 * assign the switch page method correctly to a button
 */
function CreateSectionSwitchButton(targetDivId, buttonID) {
    const targetButton = document.getElementById(buttonID);
    if (!targetButton) return;

    targetButton.addEventListener('click', () => {
        SwitchSection(targetDivId, buttonID);
    });
}

/**
 * automatically creates a list of elements from the list of projects
 */
function CreateProjectList({ data }) {
    const listContainer = document.getElementById('projects-list');

    if (listContainer === null) return;

    data.forEach((exp) => {
        const div = document.createElement('div');
        div.className = `${exp.projectType} projects-item flex-vertical flex-horizontal-mobile gap-between-mobile`;
        div.dataset.id = exp.projectTitle;

        // Create inner content using innerHTML (excluding the button)
        div.innerHTML = `                                
            <div>
                <img src="${exp.projectThumbnail}" class="projects-img thumbnail thumnail-fit-container" alt="Icons" />
            </div>
            <div class="flex-vertical gap-small">
                <div class="flex-vertical">
                    <h1 class="text-align-right-mobile">${exp.projectTitle}</h1>
                    <p class="text-grey text-align-right-mobile">${exp.projectSubTitle}</p>
                </div>
            </div>`;

        // Create button separately
        const button = document.createElement('button');
        button.className = 'button-deselected align-right-mobile';
        button.innerHTML = `<p class="sub-p">Read more</p>`;
        button.addEventListener('click', () => {

            const url = new URL(window.location);
            url.searchParams.set('id', exp.id);
            window.history.pushState({}, '', url);

            CreateProjectPage({ project: exp });
            switchPages('.project-page', '.main-page');
            SwitchSection('ui-about-project', 'button-about-project', '.ui-section', '.nav-button');
        });

        // Append button to the last div in the content
        div.querySelector('.flex-vertical.gap-small').appendChild(button);

        listContainer.appendChild(div);
    });

    initFullscreenImages();
}

function GetRandomProject({projectsData}) {
    const url = new URL(window.location);
    const currentId = url.searchParams.get('id');

    // Filter out the current project
    const filteredProjects = projectsData.filter(project => project.id !== currentId);

    if (filteredProjects.length === 0) {
        console.warn("No other projects to choose from.");
        return;
    }

    // Pick a random project
    const randomProject = filteredProjects[Math.floor(Math.random() * filteredProjects.length)];

    // Update URL with new ID (without reloading)
    url.searchParams.set('id', randomProject.id);
    window.history.pushState({}, '', url);

    // Trigger the page update
    CreateProjectPage({ project: randomProject });
    switchPages('.project-page', '.main-page');
    SwitchSection('ui-about-project', 'button-about-project', 'about-project');
}

function switchPages(showSelector, hideSelector) {
    const showElements = document.querySelectorAll(showSelector);
    const hideElements = document.querySelectorAll(hideSelector);

    showElements.forEach(el => el.classList.add('active'));
    hideElements.forEach(el => el.classList.remove('active'));
}

function CreateFilterButton(buttonID, FilterName) {
    const button = document.getElementById(buttonID)

    if (!button) return;

    button.addEventListener('click', () => {
        FilterProjectList(buttonID, FilterName)
    });
}

function FilterProjectList(buttonID, FilterName) {
    const button = document.getElementById(buttonID)
    const listContainer = document.getElementById('projects-list');
    const children = listContainer.children;

    for (let i = 0; i < children.length; i++) {
        const item = children[i];

        if (item.classList.contains(FilterName)) {
            item.classList.remove('hide-element');
        } else {
            item.classList.add('hide-element');
        }
    }

    const filterButtons = document.querySelectorAll('.filter');

    filterButtons.forEach(btn => {
        btn.classList.remove('button-selected');
        btn.classList.add('button-deselected');
    });

    button.classList.remove('button-deselected');
    button.classList.add('button-selected');
}

/**
 * updates all the ui elements on the page properly
 */
function CreateProjectPage({ project }) {

    setText('project-title', project.projectTitle);
    setText('about-title', `What is ${project.projectTitle}`);
    setText('about-desc', project.AboutProjectDesc);
    setImageSrc('about-img', project.AboutProjectImg);
    setText('contribution-desc', project.ContributionDesc);
    setImageSrc('contribution-img', project.ContributionImg);
    setText('code-desc', project.CodeDesc);
    setImageSrc('code-img', project.CodeImg);

    CreatePlayLinks({ project: project });
    CreateGallery({ project: project });
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = text;
}
function setImageSrc(id, src) {
    const el = document.getElementById(id);
    if (el) el.src = src;
}

/**
 * creates the correct buttons and assigns the links to the correct pages
 */
function CreatePlayLinks({ project }) {
    const whereToList = document.getElementById('where-to-list');
    if (!whereToList) return;

    whereToList.innerHTML = '';

    project.WhereToPlay.forEach(exp => {
        const button = document.createElement('button');
        button.className = 'button-deselected';

        if (exp.Type === "Github") {
            button.innerHTML = `<img src="Images/Socials/Github.png" class="button-icon" alt="Github Icon" />
            <p>Github</p>`;
        } else if (exp.Type === "Direct") {
            button.innerHTML = `<img src="Images/Icons/download.png" class="button-icon" alt="Download Icon" />
            <p>Download</p>`;
        } else if (exp.Type === "UnityPlay") {
            button.innerHTML = `<img src="Images/Software/unity.png" class="button-icon" alt="Play Icon" />
            <p>Unity play</p>`;
        } else if (exp.Type === "ItchIO") {
            button.innerHTML = `<img src="Images/Socials/itchio.svg" class="button-icon" alt="Play Icon" />
            <p>Itch.io</p>`;
        }

        button.addEventListener('click', () => {
            window.open(exp.Link, '_blank');
        });

        whereToList.appendChild(button);
    });
}

/**
 * changes the layout of the gallery based on the amount of images within the project
 */
function CreateGallery({ project }) {
    const count = project.galleryImages.length;
    const container = document.getElementById('gallery-container');

    if (container) {
        if (count === 1) {
            container.innerHTML = `                        
            <div class="flex-vertical gap fill-container" style="max-height: 407.273px;">
                <div class="image-container fill-container">
                    <img src="${project.galleryImages[0]}" class="gallery-img thumbnail thumnail-fit-container" alt="Icons" />
                </div>
            </div>`;
        }

        else if (count === 2) {
            container.innerHTML = `                        
            <div class="flex-vertical fill-container">
                <div class="image-container fill-container">
                    <img src="${project.galleryImages[0]}" class="gallery-img thumbnail thumnail-fit-container" alt="Icons" />
                </div>
            </div>
            <div class="flex-vertical fill-container">
                <div class="image-container fill-container">
                    <img src="${project.galleryImages[1]}" class="gallery-img thumbnail thumnail-fit-container" alt="Icons" />
                </div>
            </div>`;
        }

        else if (count === 3) {
            container.innerHTML = `                        
            <div class="flex-horizontal fill-container gap">
                <div class="image-container fill-container">
                    <img src="${project.galleryImages[0]}" class="gallery-img thumbnail thumnail-fit-container" alt="Icons" />
                </div>
                <div class="image-container fill-container">
                    <img src="${project.galleryImages[1]}" class="gallery-img thumbnail thumnail-fit-container" alt="Icons" />
                </div>
                <div class="image-container fill-container">
                    <img src="${project.galleryImages[2]}" class="gallery-img thumbnail thumnail-fit-container" alt="Icons" />
                </div>
            </div>`;
        }

        else if (count === 4) {
            container.innerHTML = `
            <div class="flex-vertical gap fill-container" style="max-height: 388.273px;">
                <div class="flex-horizontal gap" style="height:50%;">
                    <div class="image-container fill-container">
                        <img src="${project.galleryImages[0]}" class="gallery-img thumbnail thumnail-fit-container" alt="Icons" />
                    </div>
                    <div class="image-container fill-container">
                        <img src="${project.galleryImages[1]}" class="gallery-img thumbnail thumnail-fit-container" alt="Icons" />
                    </div>
                </div>
                <div class="flex-horizontal gap" style="height:50%;">
                    <div class="image-container fill-container">
                        <img src="${project.galleryImages[2]}" class="gallery-img thumbnail thumnail-fit-container" alt="Icons" />
                    </div>
                    <div class="image-container fill-container">
                        <img src="${project.galleryImages[3]}" class="gallery-img thumbnail thumnail-fit-container" alt="Icons" />
                    </div>
                </div>
            </div>`;
        }

        else if (count === 5) {
            container.innerHTML = `                        
            <div class="flex-vertical fill-container">
                <div class="image-container fill-container">
                    <img src="${project.galleryImages[0]}" class="gallery-img thumbnail thumnail-fit-container" alt="Icons" />
                </div>
            </div>
            <div class="flex-vertical gap fill-container">
                <div class="flex-horizontal gap fill-container">
                    <div class="image-container fill-container">
                        <img src="${project.galleryImages[1]}" class="gallery-img thumbnail thumnail-fit-container" alt="Icons" />
                    </div>
                    <div class="image-container fill-container">
                        <img src="${project.galleryImages[2]}" class="gallery-img thumbnail thumnail-fit-container" alt="Icons" />
                    </div>
                </div>
                <div class="flex-horizontal gap fill-container">
                    <div class="image-container fill-container">
                        <img src="${project.galleryImages[3]}" class="gallery-img thumbnail thumnail-fit-container" alt="Icons" />
                    </div>
                    <div class="image-container fill-container">
                        <img src="${project.galleryImages[4]}" class="gallery-img thumbnail thumnail-fit-container" alt="Icons" />
                    </div>
                </div>
            </div>`;
        }
    }
}
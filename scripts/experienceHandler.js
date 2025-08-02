const experiencesData = [
    {
        title: "TotalReality",
        subtitle: "Intern software developer",
        image: "Images/Experiences/TotalReality.png",
        period: "3/02/25 - 20/06/25",
        description: `During my internship at TotalReality, I worked on several AR and VR projects, both for clients and for the companies own platform. I was involved in different parts of the process, from research and idea development to building and testing, mostly using Unity. 
        \n\nWorking closely with the team, I learned a lot about how things work in a real software company and got hands-on experience with immersive tech.`
    },
    {
        title: "Zoete kruimels",
        subtitle: "Intern Pastry baker",
        image: "Images/Experiences/ZoeteKruimels.png",
        period: "6/02/23 - 21/04/23",
        description: `During my internship at Zoete Kruimels, I mostly worked under the guidance of a team leader, but as part of my studies, I also took on tasks independently.`
    },
    {
        title: "Nienke's cupcakes",
        subtitle: "Intern Pastry baker",
        image: "Images/Experiences/Nienkes.jpg",
        period: "15/11/21 - 4/02/22",
        description: `During my internship at Nienke's Cupcakes, I was involved in both day-to-day operations and special projects. 
        \n\nWhile I often collaborated with the team, I also had opportunities to take initiative and handle tasks on my own as part of my study requirements.`
    },
];
const eductationData = [
    {
        title: "ROC van twente",
        subtitle: "software developer",
        image: "Images/Experiences/ROC.png",
        period: "? - 31/07/27 (screw duo)",
        description: `I'm currently in my third year of a four-year Software Development program at ROC van Twente, where I focus primarily on game development using Unity. Alongside game projects, I have also worked on websites and MonoGame.
        \n\nMy passion for programming started as a hobby but i wanted to get more in-depth with it.`
    },
    {
        title: "ROC van twente",
        subtitle: "independent working baker",
        image: "Images/Experiences/ROC.png",
        period: "? - ? (screw duo)",
        description: `During my training to become an independent baker, I focused mainly on pastries, cakes, and other sweet baked goods.
        \n\nI gained hands-on experience in the bakery, alongside studying ingredient science, baking techniques, hygiene, and scheduling.`
    }
];

function createDynamicList({ data, listContainerId, titleId, descriptionId, renderItem }) {
    const listContainer = document.getElementById(listContainerId);
    const titleElement = document.getElementById(titleId);
    const descElement = document.getElementById(descriptionId);

    if (!listContainer || !titleElement || !descElement || !Array.isArray(data)) {
        console.warn('Invalid input for experience list setup');
        return;
    }

    data.forEach((exp, index) => {
        const button = document.createElement('button');
        button.className = 'experiences-item flex-horizontal allign-center';
        button.dataset.id = exp.title;

        // Use custom renderer if provided, otherwise use default
        button.innerHTML = renderItem
            ? renderItem(exp, index)
            : `
              <div class="line"></div>
              <div class="experience-container flex-horizontal allign-center">
                <img src="${exp.image}" class="experiences-icon" alt="Icon" />
                <div>
                  <p>${exp.title}</p>
                  <p class="sub-p text-grey">${exp.subtitle}</p>
                </div>
              </div>
              <div class="line"></div>
              <div class="experience-container fill-container">
                <p>Period</p>
                <p class="sub-p text-grey">${exp.period}</p>
              </div>
            `;

        button.addEventListener('click', () => {
            titleElement.textContent = exp.title;
            descElement.innerHTML = exp.description.replace(/\n/g, '<br>');

            listContainer.querySelectorAll('.experiences-item').forEach(btn => {
                btn.classList.remove('experience-col-selected');
            });
            button.classList.add('experience-col-selected');
        });

        listContainer.appendChild(button);
    });

    if (data.length > 0) {
        listContainer.querySelector('.experiences-item').click();
    }
}

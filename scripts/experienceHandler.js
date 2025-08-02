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
        period: "? - ?",
        description: `Meow`
    },
    {
        title: "Nienke's cupcakes",
        subtitle: "Intern Pastry baker",
        image: "Images/Experiences/Nienkes.jpg",
        period: "? - ?",
        description: `Meow, but different`
    },
    {
        title: "Action",
        subtitle: "shelf stacker",
        image: "Images/Experiences/Action.png",
        period: "? - ?",
        description: `Meow special edition`
    },
];
const eductationData = [
    {
        title: "ROC van twente",
        subtitle: "software developer",
        image: "Images/Experiences/ROC.png",
        period: "? - 31/07/27",
        description: `meoster`
    },
    {
        title: "ROC van twente",
        subtitle: "independent working baker",
        image: "Images/Experiences/ROC.png",
        period: "? - ?",
        description: `Meow`
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

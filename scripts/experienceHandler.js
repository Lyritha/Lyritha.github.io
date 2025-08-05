export function createDynamicList({ data, listContainerId, titleId, descriptionId, template }) {
    const listContainer = document.getElementById(listContainerId);
    const titleElement = document.getElementById(titleId);
    const descElement = document.getElementById(descriptionId);

    if (!listContainer || !titleElement || !descElement) {
        console.warn('Invalid input for experience list setup');
        return;
    }

    data.forEach((exp) => {
        const button = document.createElement('button');
        button.className = 'experiences-item flex-horizontal allign-center';
        button.dataset.id = exp.title;

        const clone = template.cloneNode(true);

        const icon = clone.querySelector('#vertical-list-item-icon');
        if (icon) {
            icon.src = exp.image;
            icon.alt = exp.title + ' icon';
        }
        clone.querySelector('#vertical-list-item-title').textContent = exp.title;
        clone.querySelector('#vertical-list-item-subtitle').textContent = exp.subtitle;
        clone.querySelector('#vertical-list-item-period').textContent = exp.period;

        // Append the clone to the button
        button.appendChild(clone);

        button.addEventListener('click', () => {
            titleElement.textContent = exp.title;
            descElement.innerHTML = exp.description;

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

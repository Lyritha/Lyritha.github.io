/**
 * Creates a clickable timeline list inside the container.
 *
 * @param {Object} params
 * @param {Array<{ 
 *   title: string,
 *   subtitle: string,
 *   image: string,
 *   period: string,
 *   description: string
 * }>} params.data - Array of timeline entries.
 * @param {string} params.containerId - ID of the container element.
 * @param {string} params.titleId - ID of the title display element.
 * @param {string} params.descriptionId - ID of the description display element.
 * @param {HTMLElement} params.template - Template element for each timeline item.
 */

export function createTimeline({ data, containerId, titleId, descriptionId, template }) {
    const containerElement = document.getElementById(containerId);
    const titleElement = document.getElementById(titleId);
    const descElement = document.getElementById(descriptionId);

    if (!containerElement || !titleElement || !descElement) {
        console.warn('Invalid input for timeline list setup');
        return;
    }

    data.forEach((exp) => {
        const clone = template.cloneNode(true);
        const button = clone.querySelector('[data-role="button"]');

        const icon = clone.querySelector('[data-role="icon"]');
        if (icon) {
            icon.src = exp.image;
            icon.alt = exp.title + ' icon';
        }

        const title = clone.querySelector('[data-role="title"]');
        const subtitle = clone.querySelector('[data-role="sub"]');
        const period = clone.querySelector('[data-role="period"]');

        if (title) title.textContent = exp.title;
        if (subtitle) subtitle.textContent = exp.subtitle;
        if (period) period.textContent = exp.period;

        button.addEventListener('click', () => {
            titleElement.textContent = exp.title;
            descElement.innerHTML = exp.description;

            containerElement.querySelectorAll('.timeline-item').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');

        });

        clone.querySelectorAll(`[data-role]`).forEach(el => el.removeAttribute('data-role'));
        containerElement.appendChild(clone);
    });

    if (data.length > 0) {
        containerElement.querySelector('.timeline-item').click();
    }
}
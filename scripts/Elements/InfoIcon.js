/**
 * Creates a list of info icons inside the container.
 *
 * @param {Object} params
 * @param {Array<{
 *   key: string,
 *   name: string,
 *   skillLevel: string,
 *   iconSrc: string,
 *   bgColor: string,
 *   outlineColor: string,
 *   textColor: string
 * }>} params.data - Array of info icon objects with details about each icon.
 * @param {DocumentFragment} params.template - Template fragment for each icon.
 * @param {string} params.containerId - ID of the container element.
 */
export function createInfoIconList({ data, template, containerId }) {
    const container = document.getElementById(containerId);

    data.forEach(infoIcon => {
        const clone = template.cloneNode(true);

        const colorDivs = clone.querySelectorAll('[data-role="color"]');
        colorDivs.forEach(div => {
            div.style.background = infoIcon.bgColor;
            div.style.outlineColor = infoIcon.outlineColor;
        });

        const icons = clone.querySelectorAll('[data-role="icon"]');
        icons.forEach(icon => {
            icon.src = infoIcon.iconSrc;
        });

        const nameEl = clone.querySelector('[data-role="name"]');
        nameEl.textContent = infoIcon.name;
        nameEl.style.color = infoIcon.textColor;

        const skillEl = clone.querySelector('[data-role="skill-level"]');
        skillEl.textContent = infoIcon.skillLevel;
        skillEl.style.color = infoIcon.textColor;

        // Remove all data-role attributes in the cloned fragment
        clone.querySelectorAll('[data-role]').forEach(el => el.removeAttribute('data-role'));

        container.appendChild(clone);
    });
}
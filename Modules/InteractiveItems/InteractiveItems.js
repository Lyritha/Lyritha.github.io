export const hasCss = false;

/**
 * Renders a generalized interactive list from structured data.
 *
 * For each item in `data`, a new element is created by cloning the provided `template`.
 * The template can use `[data-role="<key>"]` or `[data-role="<key1> <key2>"]` to bind multiple roles.
 * If a <button data-function="button"> exists, it will be used for selection interaction and update external elements.
 * Otherwise, items are rendered without interaction and external targets remain unchanged.
 *
 * @param {Object} options
 * @param {HTMLElement} options.template - Template element to clone for each data item.
 * @param {Array<Object> | Promise<Array<Object>>} options.data - Array or promise of arbitrary data objects.
 * @param {string} options.containerId - ID of the container where items are appended.
 * @param {Object<string, string>} [options.targetMap] - Optional map of data keys to external element IDs to update on item click.
 * @param {Object} [options.buttonData] - Configuration object for buttons.
 * @param {boolean} [options.buttonData.isToggle=true] - Whether buttons act as toggles.
 * @param {boolean} [options.buttonData.clickFirst=true] - Whether the first button is toggled by default
 * @param {function} [options.buttonData.customFunction] - Custom function to execute on button click. Receives (item, buttonElement).
 */
export async function create({ template, data, containerId, targetMap = {}, buttonData = {} }) {
    const { isToggle = true, customFunction = null, clickFirst = true } = buttonData;
    const defaultButtonData = { isToggle, customFunction, clickFirst};


    const containerEl = document.getElementById(containerId);
    const externalTargets = {};

    if (!containerEl || !template) {
        console.warn('Invalid container or template element.');
        return;
    }

    const resolvedData = data instanceof Promise ? await data : data;

    if (!Array.isArray(resolvedData)) {
        console.warn('Data is not an array or could not be loaded.');
        return;
    }

    for (const [key, id] of Object.entries(targetMap)) {
        const el = document.getElementById(id);
        if (el) externalTargets[key] = el;
    }

    let firstButton = null;

    resolvedData.forEach((entry) => {
        const clone = template.cloneNode(true);

        const allRoleElements = Array.from(clone.querySelectorAll('[data-role]'));

        for (const [key, value] of Object.entries(entry)) {

            // handle custom data
            if (key.startsWith('data-')) {
                const dataAttr = key.slice(5);
                allRoleElements.forEach(el => {
                    if (el.hasAttribute('data-role') && el.getAttribute('data-role').includes(key)) {
                        el.dataset[dataAttr] = value;
                    }
                });
                continue;
            }

            //handle styling
            if (key.startsWith('style-') && typeof value === 'object') {

                getFilteredTargets(allRoleElements, key.slice(6)).forEach(target =>
                {
                    Object.entries(value).forEach(([prop, val]) => {
                        target.style.setProperty(prop, val);
                    });
                });
                continue;
            }

            // Regular content/image binding
            getFilteredTargets(allRoleElements, key).forEach(target => {
                if (target.tagName === 'IMG') {
                    target.dataset.src = value;
                    target.alt = `${entry.title || key} image`;
                }

                else {
                    target.textContent = value;
                }
            });
        }

        const currentButton = handleButton(clone, entry, externalTargets, containerEl, defaultButtonData);
        if (!firstButton && currentButton) {
            firstButton = currentButton;
        }

        // Optional: clean up data-role attributes
        allRoleElements.forEach(el => el.removeAttribute('data-role'));
        containerEl.appendChild(clone);
    });


    if (defaultButtonData.clickFirst && firstButton) {
        firstButton.click();
    }

}

function getFilteredTargets(elements, includes) {
    return elements.filter(el => {
        const roles = el.getAttribute('data-role')?.split(/\s+/) || [];
        return roles.includes(includes);
    });
}


function handleButton(clone, entry, externalTargets, containerEl, buttonData) {
    const button = clone.querySelector('button[data-function="button"]');
    if (!button) return null;

    button.addEventListener('click', () => {
        if (buttonData.customFunction) buttonData.customFunction({ data: entry, button, containerEl });

        if (buttonData.isToggle) {
            containerEl.querySelectorAll('button[data-function="button"]').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
        }

        for (const [key, el] of Object.entries(externalTargets)) {
            if (!el) continue;
            el.innerHTML = entry[key] ?? '';
        }
    })

    return button;
}
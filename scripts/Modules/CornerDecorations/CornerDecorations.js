export const hasCss = true;

/**
 * Adds images in the corners of all the elements matching the given selector.
 *
 * @param {Object} params - Parameters object.
 * @param {string} params.selector - A CSS selector string to target elements.
 * @param {string} params.imageSource - The source URL/path of the corner image.
 * @param {string} [params.imageSize='20px'] - The size of the corner image.
 */
export function create({ selector, imageSource, imageSize = '20px' }) {
    document.querySelectorAll(selector).forEach(container => {
        createSingle(container, imageSource, imageSize);
    });

    // Observe DOM for future matching elements
    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== 1) return; // Only element nodes

                    // If the added node matches selector
                    if (node.matches(selector)) {
                        createSingle(node, imageSource, imageSize);
                    }

                    // Also check descendants
                    node.querySelectorAll?.(selector).forEach(el => {
                        createSingle(el, imageSource, imageSize);
                    });
                });
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function createSingle(container, imageSource, imageSize) {
    if (container.classList.contains('cornerDecorations')) return;

    // Ensure container is positioned relative so corners can be absolutely positioned
    if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
    }


    const cornerContainer = document.createElement('div');
    cornerContainer.classList.add('cornerDecorations-container');
    container.appendChild(cornerContainer);

    const positions = [
        { pos: 'top-left', rotation: '0deg' },
        { pos: 'top-right', rotation: '90deg' },
        { pos: 'bottom-left', rotation: '270deg' },
        { pos: 'bottom-right', rotation: '180deg' }
    ];

    positions.forEach(({ pos, rotation }) => {
        const el = document.createElement('img');
        el.src = imageSource;
        el.classList.add('cornerDecorations-corner', `cornerDecorations-${pos}`);
        el.style.setProperty('--cornerDecorations-rotation', rotation);
        el.style.setProperty('--cornerDecorations-size', imageSize);
        cornerContainer.appendChild(el);
    });

    container.classList.add('cornerDecorations');
}

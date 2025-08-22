export const hasCss = false;


const imageObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (!(node instanceof HTMLElement)) return;

            // Directly added <img>, only if it has a data-src attribute
            if (node.tagName === 'IMG' && node.dataset.src) {
                handleNewImage(node);
            }

            // <img> inside added subtree, also only if it has a data-src attribute
            node.querySelectorAll?.('img[data-src]').forEach(img => {
                handleNewImage(img);
            });
        });
    });
});

function handleNewImage(img) {
    const container = img.closest('.overlayed-container-item');
    if (!container) return;

    // Load immediately if container is active
    if (container.matches('.active')) {
        loadImage(img);
        return;
    }

    // Otherwise, watch for it becoming active
    const observer = new MutationObserver(() => {
        if (container.matches('.active')) {
            loadImage(img);
            observer.disconnect();
        }
    });

    observer.observe(container, { attributes: true });
}


function loadImage(img) {
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
}

export function initialize() {
    // handle images already present at page load
    document.querySelectorAll('img[data-src]').forEach(handleNewImage);

    // watch the whole document for new images
    imageObserver.observe(document.body, { childList: true, subtree: true });
}



const observer = new MutationObserver(mutationsList => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // ELEMENT_NODE
                    if (node.matches('img.thumbnail')) {
                        initFullscreenImages([node]);
                    }
                    const thumbnails = node.querySelectorAll?.('img.thumbnail');
                    if (thumbnails?.length) {
                        initFullscreenImages(Array.from(thumbnails));
                    }
                }
            });
        }
    }
});

// "static" reference to the modal, to allow for less relience of document.
let hideWhenSingle = [];
let modal;

/**
 * Sets up a fullscreen image modal gallery by appending the provided modal template
 * to the document, initializing thumbnails, and adding navigation and interaction controls.
 *
 * Images are connected via the `.thumbnail` class. When thumbnails are inside a `.thumbnail-group`,
 * navigation is limited to that group; otherwise, each thumbnail acts as a standalone gallery.
 *
 * Features include:
 * - Swipe navigation for touchscreens
 * - Keyboard navigation (A/D and arrow keys) plus Escape to close
 * - Optional button navigation (if included in the template)
 * 
 * @param {Object} options
 * 
 * Minimal structure:
 * <div id="imageModal">
 *   <div id="imageModal-content">
 *     <img data-role="image" src="" alt="Image" />
 *   </div>
 * </div>
 * 
 * Optional elements:
 * - Buttons with `data-function` attributes `close-modal`, `previous-image`, and `next-image`
 *   can be included to enable modal controls.
 * 
 * @param {string[]} [options.hideRoles=[]] - Array of modal element `data-role` values to hide when only one image is shown.
 */
export function init({hideRoles = [] }) {
    hideWhenSingle = hideRoles;
    modal = document.getElementById('imageModal');

    observer.observe(document.body, { childList: true, subtree: true });

    const thumbnails = document.querySelectorAll('.thumbnail');
    initFullscreenImages(thumbnails);

    addButtonControls();
    addKeyboardControls();
    addSwipeControls();

    modal.addEventListener('click', event => {
        if (event.target === modal) {
            modal.classList.toggle('active', false);
        }
    });
}


function initFullscreenImages(elements) {
    elements.forEach(el => {
        el.removeEventListener('click', openModal);
        el.addEventListener('click',  openModal);
    });
}

function openModal() {
    const image = modal.querySelector('[data-role="image"]');

    // get all images that are in the same group as this thumbnail
    const group = this.closest('.thumbnail-group');
    const thumbnails = Array.from(group?.querySelectorAll('.thumbnail') || [this]);

    // save group data inside the modal
    modal.dataset.gallery = JSON.stringify(thumbnails.map(t => t.src));
    modal.dataset.index = thumbnails.indexOf(this);

    // Hide or show elements based on gallery size
    const hideElements = thumbnails.length <= 1;
    hideWhenSingle.forEach(role => {
        const el = modal.querySelector(`[data-role="${role}"]`);
        if (!el) return;
        el.classList.toggle('hide-element', hideElements);
    });

    // Show selected image
    image.src = this.src;
    modal.classList.toggle('active', true);
}

function addButtonControls() {

    const closeBtn = modal.querySelector('[data-function="close-modal"]');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.toggle('active', false));

    const prevBtn = modal.querySelector('[data-function="previous-image"]');
    if (prevBtn) prevBtn.addEventListener('click', () => navigateGallery(-1));

    const nextBtn = modal.querySelector('[data-function="next-image"]');
    if (nextBtn) nextBtn.addEventListener('click', () => navigateGallery(1));
}
function addKeyboardControls() {
    document.addEventListener('keydown', (event) => {
        if (!modal.classList.contains('active')) return;

        switch (event.key) {
            case 'ArrowLeft':
            case 'a':
                navigateGallery(-1);
                break;
            case 'ArrowRight':
            case 'd':
                navigateGallery(1);
                break;
            case 'Escape':
                modal.classList.toggle('active', false);
                break;
        }
    });
}

function addSwipeControls() {
    let touchStartX = 0;

    modal.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    modal.addEventListener('touchend', (e) => {
        const delta = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(delta) < 50) return; // Ignore small swipes

        if (delta > 0) {
            // Swiped left
            navigateGallery(1);
        } else {
            // Swiped right
            navigateGallery(-1);
        }
    });
}

function navigateGallery(direction) {
    const gallery = JSON.parse(modal.dataset.gallery || '[]');
    let index = parseInt(modal.dataset.index, 10);

    if (!gallery.length) return;

    index = (index + direction + gallery.length) % gallery.length;

    modal.dataset.index = index;
    modal.querySelector('[data-role="image"]').src = gallery[index];
}
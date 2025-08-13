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

observer.observe(document.body, { childList: true, subtree: true });

document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.thumbnail');

    const modal = document.getElementById('imageModal-modal');
    if (!modal) return;

    modal.addEventListener('click', event => {
        if (event.target === modal) {
            toggleModal(modal, false);
        }
    });

    addButtonControls(modal);
    addKeyboardControls(modal);
    addSwipeControls(modal);

    initFullscreenImages(elements);
});

function initFullscreenImages(elements) {
    elements.forEach(el => {
        el.removeEventListener('click', handleClick);
        el.addEventListener('click', handleClick);
    });
}

function handleClick() {
    const modal = document.getElementById('imageModal-modal');
    const image = document.getElementById('imageModal-modal-img');
    const btnPrevious = document.getElementById('imageModal-previous');
    const btnNext = document.getElementById('imageModal-next');

    // Try to find a parent .thumbnail-group
    const group = this.closest('.thumbnail-group');

    // Get thumbnails in group if found, otherwise fallback to just this
    const thumbnails = group
        ? Array.from(group.querySelectorAll('.thumbnail'))
        : [this];

    // Store thumbnails and current index in modal dataset (for navigation)
    modal.dataset.gallery = JSON.stringify(thumbnails.map(t => t.src));
    modal.dataset.index = thumbnails.findIndex(t => t === this);

    // Show/hide nav buttons
    if (thumbnails.length > 1) {
        createProgressBar(thumbnails.length, modal.dataset.index);
        btnPrevious.classList.remove('imageModal-hide');
        btnNext.classList.remove('imageModal-hide');
        document.getElementById('imageModal-nav-bottom').classList.remove('imageModal-hide');
    }
    else {
        btnPrevious.classList.add('imageModal-hide');
        btnNext.classList.add('imageModal-hide');
        document.getElementById('imageModal-nav-bottom').classList.add('imageModal-hide');
    }

    // Show selected image
    image.src = this.src;

    // Open modal
    toggleModal(modal, true);
}

function toggleModal(modal, show = true) {
    if (show) {
        modal.classList.add('active');
    }
    else {
        modal.classList.remove('active');
    }
}

function createProgressBar(length, currentIndex) {
    const container = document.getElementById('imageModal-progress-bar');
    const modal = document.getElementById('imageModal-modal');
    const image = modal.querySelector('#imageModal-modal-img');
    const gallery = JSON.parse(modal.dataset.gallery || '[]');

    container.innerHTML = '';
    container.classList.remove('imageModal-hide');

    for (let i = 0; i < length; i++) {
        const button = document.createElement('button');
        button.classList.add('cube');

        if (i === Number(currentIndex)) {
            button.classList.add('active');
        }

        // Add click event to jump to selected index
        button.addEventListener('click', () => {
            modal.dataset.index = i;
            image.src = gallery[i];

            // Update active cube
            const cubes = container.querySelectorAll('.cube');
            cubes.forEach((cube, j) => {
                cube.classList.toggle('active', j === i);
            });
        });

        container.appendChild(button);
    }
}

function navigateGallery(direction) {
    const modal = document.getElementById('imageModal-modal');
    const progressContainer = document.getElementById('imageModal-progress-bar');;
    if (!modal) return;

    const gallery = JSON.parse(modal.dataset.gallery || '[]');
    let index = parseInt(modal.dataset.index, 10);

    if (!gallery.length) return;

    index = (index + direction + gallery.length) % gallery.length;

    modal.dataset.index = index;
    modal.querySelector('#imageModal-modal-img').src = gallery[index];

    if (progressContainer) {
        const cubes = progressContainer.querySelectorAll('.cube');
        cubes.forEach((cube, i) => {
            cube.classList.toggle('active', i === index);
        });
    }
}

function addButtonControls(modal) {
    document.getElementById('imageModal-close').addEventListener('click', () => {
        toggleModal(modal, false);
    });

    document.getElementById('imageModal-previous').addEventListener('click', () => {
        navigateGallery(-1);
    });
    document.getElementById('imageModal-next').addEventListener('click', () => {
        navigateGallery(1);
    });
}

function addKeyboardControls(modal) {
    document.addEventListener('keydown', (event) => {
        if (!modal.classList.contains('active')) return;

        switch (event.key) {
            case 'ArrowLeft':
                navigateGallery(-1);
                break;
            case 'ArrowRight':
                navigateGallery(1);
                break;
            case 'Escape':
                toggleModal(modal, false);
                break;
        }
    });
}

function addSwipeControls(modal) {
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

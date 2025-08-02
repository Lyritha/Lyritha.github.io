document.addEventListener('DOMContentLoaded', () => {
    initFullscreenImages();
});

function initFullscreenImages() {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-content');

    if (!modal || !modalImg) return;

    const thumbnails = document.querySelectorAll('.thumbnail');

    thumbnails.forEach(thumbnail => {
        // Prevent duplicate listeners
        thumbnail.removeEventListener('click', handleClick);
        thumbnail.addEventListener('click', handleClick);
    });

    function handleClick() {
        modal.style.display = 'flex';
        ModalAnimation(1);

        let link;
        let tag = this.tagName.toLowerCase();

        if (tag === 'img') {
            link = this.src;
        } else if (tag === 'div') {
            const backgroundImage = window.getComputedStyle(this).backgroundImage;
            link = backgroundImage.slice(5, -2);
        }

        modalImg.src = link;
    }

    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            ModalAnimation(0);
        }
    });

    function ModalAnimation(target) {
        setTimeout(() => {
            modal.style.opacity = target;
            modalImg.style.transform = `scale(${target})`;
        }, 0);

        if (target === 0) {
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
}

// Make it callable globally
window.initFullscreenImages = initFullscreenImages;
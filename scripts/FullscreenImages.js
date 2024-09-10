// Get the modal
const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-content');

// Get all thumbnail images
const thumbnails = document.querySelectorAll('.thumbnail');

// Add click event listeners to thumbnails
thumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', function () {
        modal.style.display = 'flex';
        ModalAnimation(1);
        modalImg.src = this.src;
    });
});

// Close the modal when clicking outside of the image
window.addEventListener('click', function (event) {
    if (event.target === modal) {
        ModalAnimation(0);

    }
});

function ModalAnimation(target) {

    setTimeout(() => {
        modal.style.opacity = target;
        modalImg.style.transform = 'scale(' + target + ')';
    }, 0);

    if (target == 0) {
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}
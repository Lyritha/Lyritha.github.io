// Get the modal
const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-content');

// Get all thumbnail images
const thumbnails = document.querySelectorAll('.thumbnail');

// Add click event listeners to thumbnails
thumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', function () {
        modal.style.display = 'flex';
        modalImg.src = this.src;
    });
});

// Close the modal when clicking outside of the image
window.addEventListener('click', function (event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
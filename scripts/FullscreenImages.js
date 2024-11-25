// Get the modal components
const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-content');

// Get all thumbnail images
const thumbnails = document.querySelectorAll('.thumbnail');

// Add click event listeners to thumbnails
thumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', function () {
        modal.style.display = 'flex';
        ModalAnimation(1);

        // Determine the source based on the element type
        let link;

        if (this.tagName.toLowerCase() === 'img') {
            // If the element is an <img>, use the 'src' attribute
            link = this.src;
        }

        else if (this.tagName.toLowerCase() === 'div') {
            // If the element is a <div>, use the background image
            const backgroundImage = window.getComputedStyle(this).backgroundImage;
            // Extract the URL from 'url("...")'
            link = backgroundImage.slice(5, -2); // Removes 'url("' and '")'
        }

        // Set the modal image source
        modalImg.src = link;
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
// Check if the user prefers reduced motion
const prefersReducedMotionP = window.matchMedia('(prefers-reduced-motion: reduce)');
const targets = document.querySelectorAll('.scroll-effect');

SetPositions();

// Add an event listener to the window to listen for the scroll event
if (!prefersReducedMotionP.matches) {
    window.addEventListener('scroll', function () {
        SetPositions();
    });
}

function SetPositions() {
    targets.forEach(target => {
        const elementPos = Math.min(0, target.getBoundingClientRect().top) / 2;
        target.style.backgroundPositionY = elementPos - 10 + 'px';
    });
}

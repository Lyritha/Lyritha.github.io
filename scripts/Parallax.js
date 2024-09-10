// Add an event listener to the window to listen for the scroll event
window.addEventListener('scroll', function() {
    // Get the number of pixels the document has scrolled vertically
    const scrollPosition = window.scrollY;
    
    // Move the background image in the opposite direction of scrolling
    // We can use a multiplier (like 0.5) to control the speed of the effect
    document.querySelector('.scroll-effect').style.backgroundPositionY = -(scrollPosition * 0.5) + 'px';
});
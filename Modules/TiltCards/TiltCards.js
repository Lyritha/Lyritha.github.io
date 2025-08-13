export const hasCss = true;

/**
 * Initializes a 3D tilt effect on all elements matching the given selector,
 * and watches for future elements added dynamically.
 * 
 * Adds interactive mouse-based tilt animation on each target element:
 * - Tilts the element based on mouse position relative to its center.
 * - Smoothly animates rotation, shadow and animates an background-image changes.
 * - Resets tilt to neutral on mouse leave.
 * 
 * @param {Object} options - Configuration options.
 * @param {string} options.selector - CSS selector string to target elements.
 * @param {number} [options.tiltStrength=1] - Multiplier for the tilt intensity.
 */
export function create({ selector, tiltStrength = 1 }) {
    // Initialize existing elements
    document.querySelectorAll(selector).forEach(container => {
        setupTilt(container, tiltStrength);
    });

    // Observe DOM for future elements matching selector
    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== 1) return; // Element nodes only

                    // If added node matches selector
                    if (node.matches(selector)) {
                        setupTilt(node, tiltStrength);
                    }

                    // Check descendants of added node as well
                    node.querySelectorAll?.(selector).forEach(el => {
                        setupTilt(el, tiltStrength);
                    });
                });
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function setupTilt(container, tiltStrength) {
    // Prevent double initialization
    if (container.classList.contains('tiltCards')) return;

    container.classList.add('tiltCards');

    const parent = container.parentElement;
    if (parent) parent.classList.add('tiltCards-parent');

    let currentRotateX = 0;
    let currentRotateY = 0;
    let targetRotateX = 0;
    let targetRotateY = 0;
    let animationFrameId = null;

    container.addEventListener('mousemove', (event) => {
        const rect = container.getBoundingClientRect();

        const deltaX = (event.clientX - rect.left) - rect.width / 2;
        const deltaY = (event.clientY - rect.top) - rect.height / 2;

        targetRotateX = -(deltaY / (rect.height / 2)) * tiltStrength;
        targetRotateY = (deltaX / (rect.width / 2)) * tiltStrength;

        if (!animationFrameId) {
            animate();
        }
    });

    container.addEventListener('mouseleave', () => {
        targetRotateX = 0;
        targetRotateY = 0;

        if (!animationFrameId) {
            animate();
        }
    });

    function animate() {
        const ease = 0.05;

        currentRotateX += (targetRotateX - currentRotateX) * ease;
        currentRotateY += (targetRotateY - currentRotateY) * ease;

        const currentAverage = (currentRotateX + -currentRotateY) / 2;
        const normalizedAverage = currentAverage / tiltStrength;


        container.style.setProperty('--tiltCards-rotate-x', `${currentRotateX}deg`);
        container.style.setProperty('--tiltCards-rotate-y', `${currentRotateY}deg`);
        container.style.setProperty('--tiltCards-position', `${((1 + normalizedAverage) / 2) * 100}%`);
        container.style.setProperty('--tiltCards-shadow-x', `${(-currentRotateY * 15) / tiltStrength}px`);
        container.style.setProperty('--tiltCards-shadow-y', `${(currentRotateX * 15) / tiltStrength}px`);

        const blurStrength = Math.abs(currentRotateX) + Math.abs(currentRotateY);
        container.style.setProperty('--tiltCards-shadow-blur', `${(blurStrength * 10) / tiltStrength}px`);

        if (Math.abs(currentRotateX - targetRotateX) > 0.1 || Math.abs(currentRotateY - targetRotateY) > 0.1) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            animationFrameId = null;
        }
    }
}

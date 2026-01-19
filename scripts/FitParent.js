export function init() {
    // Initial resize for any currently active containers
    requestAnimationFrame(() => resizeToContainer());

    // Resize on window resize
    window.addEventListener("resize", resizeToContainer);

    // Observe class changes on all overlayed-container-item elements
    const containers = document.querySelectorAll('.overlayed-container-item');

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('active')) {
                    // Only resize elements inside the newly active container
                    resizeToContainer();
                }
            }
        });
    });

    containers.forEach(container => {
        observer.observe(container, { attributes: true });
    });
}

function resizeToContainer() {
    const elementsToResize = document.querySelectorAll('.fit-parent');

    elementsToResize.forEach(el => {
        const parent = el.parentElement;
        if (!parent) return;

        el.style.setProperty('--width', 0 + "px");
        el.style.setProperty('--height', 0 + "px");

        const parentStyles = getComputedStyle(parent);
        const elStyles = getComputedStyle(el);

        const parentWidth = parent.clientWidth - getSizeX(parentStyles, "padding") - getSizeX(elStyles, "padding") - getSizeX(elStyles, "margin");
        const parentHeight = parent.clientHeight - getSizeY(parentStyles, "padding") - getSizeY(elStyles, "padding") - getSizeY(elStyles, "margin");

        el.style.setProperty('--width', parentWidth + "px");
        el.style.setProperty('--height', parentHeight + "px");
    });
}

const getSizeX = (styles, prop) =>
    parseFloat(styles[`${prop}Left`]) + parseFloat(styles[`${prop}Right`]);

const getSizeY = (styles, prop) =>
    parseFloat(styles[`${prop}Top`]) + parseFloat(styles[`${prop}Bottom`]);

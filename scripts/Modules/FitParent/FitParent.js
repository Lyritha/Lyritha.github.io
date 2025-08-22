export const hasCss = true;

export function init() {
    requestAnimationFrame(() => resizeToContainer());
    window.addEventListener("resize", resizeToContainer);
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

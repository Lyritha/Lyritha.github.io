export function addCornerElements(container, imgSrc) {
    const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

    positions.forEach(pos => {
        const el = document.createElement('img');
        el.src = imgSrc
        el.classList.add('reactive-corner', `corner-${pos}`);
        container.appendChild(el);
    });

    container.classList.add('has-reactive-corners');
}

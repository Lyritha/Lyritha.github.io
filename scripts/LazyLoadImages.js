export function init() {
    const load = (img) => (img.src = img.dataset.src, img.removeAttribute('data-src'));

    document.querySelectorAll('img[data-src]').forEach(img => {
        const container = img.closest('.overlayed-container-item');
        if (!container) return;

        if (container.classList.contains('active')) return load(img);

        const observer = new MutationObserver(() => {
            if (container.classList.contains('active')) {
                load(img);
                observer.disconnect();
            }
        });

        observer.observe(container, { attributes: true });
    });
}




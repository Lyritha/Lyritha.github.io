document.querySelectorAll('.text-container, .code-container').forEach(container => {
    const div = document.createElement('div');
    div.classList.add('background-overlay');

    container.insertBefore(div, container.firstChild);  

    container.addEventListener('mousemove', e => {
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        div.style.setProperty('--mouse-pos-x', `${100 - x}%`);
        div.style.setProperty('--mouse-pos-y', `${100 - y}%`);
    });

});

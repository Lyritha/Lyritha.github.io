export function applyProjectFilter(buttonID, FilterName) {
    const button = document.getElementById(buttonID);
    const listContainer = document.getElementById('projects-list');
    const children = Array.from(listContainer.children);

    if (FilterName === 'All') {
        children.forEach(item => item.classList.remove('hide-element'));
    }
    else {
        children.forEach(item => {
            if (item.classList.contains(FilterName)) {
                item.classList.remove('hide-element');
            }
            else {
                item.classList.add('hide-element');
            }
        });
    }

    const filterButtons = document.querySelectorAll('.filter');
    filterButtons.forEach(btn => {
        btn.classList.remove('button-selected');
        btn.classList.add('button-deselected');
    });

    button.classList.remove('button-deselected');
    button.classList.add('button-selected');
}

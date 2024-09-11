// Check if the user prefers reduced motion
const prefersReducedMotionG = window.matchMedia('(prefers-reduced-motion: reduce)');

const letters = "abcdefghijklmnopqrstuvwxyz";
if (!prefersReducedMotionG.matches) GlitchOnLoad();

function GlitchOnLoad() {
    const targets = document.querySelectorAll(".glitch-effect-load");
    const targetsValues = Array.from(targets).map(element => element.innerText);

    for (let i = 0; i < targets.length; i++) {
        let iterations = 0;

        const interval = setInterval(() => {
            targets[i].innerText = targets[i].innerText.split("")
                .map((letter, index) => {
                    if (index < iterations || letter == ' ') {
                        return targetsValues[i][index];
                    }

                    return letters[Math.floor(Math.random() * 26)]
                })
                .join("");

            if (iterations >= targetsValues[i].length) clearInterval(interval);

            iterations += 1 / targets[i].dataset.steps;
        }, targets[i].dataset.speed);
    }
}

if (!prefersReducedMotionG.matches) {
    document.querySelectorAll(".glitch-effect-hover").forEach(element => {
        element.onmouseover = event => {
            let iterations = 0;

            const interval = setInterval(() => {
                event.target.innerText = event.target.innerText.split("")
                    .map((letter, index) => {
                        if (index < iterations || letter == ' ') {
                            return event.target.dataset.value[index];
                        }

                        return letters[Math.floor(Math.random() * 26)];
                    })
                    .join("");

                if (iterations >= event.target.dataset.value.length) clearInterval(interval);

                iterations += 1 / event.target.dataset.steps;
            }, event.target.dataset.speed);
        };
    });
}

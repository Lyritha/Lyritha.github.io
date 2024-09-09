const letters = "abcdefghijklmnopqrstuvwxyz";
const targets = document.querySelectorAll(".glitch-effect");

for (let i = 0; i < targets.length; i++) {
    let iterations = 0;

    const interval = setInterval(() => {
        targets[i].innerText = targets[i].innerText.split("")
            .map((letter, index) => {
                if (index < iterations) {
                    return targets[i].dataset.value[index];
                }

                return letters[Math.floor(Math.random() * 26)]
            })
            .join("");

        if (iterations >= targets[i].dataset.value.length) clearInterval(interval);

        iterations += 1;
    }, 30);
}
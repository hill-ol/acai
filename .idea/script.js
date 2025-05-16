const ingredients = {
    "Cost Hamiltonian": "🍓",
    "Mixer": "🫐",
    "Parameters": "🥄",
    "Optimizer": "🍯",
    "Mango": "🥭",
    "Cacao Nibs": "🍫",
    "Mixed Berries": "🍇",
    "Oracle": "🍌",
    "Diffusion": "🍍",
    "Iterations": "🌰",
    "Estimator": "🍯",
    "Modular ops": "🍓",
    "QFT": "🫐",
    "Precision": "🌰",
    "Post-processing": "🍯",
    "Unitary ops": "🍓",
    "Controlled rotations": "🫐",
    "Entangled Cluster State": "🍫",
    "Adaptive Measurements": "🍇",
    "Classical Post-processing": "🍯",
    "Peanut Butter": "🥜"
};

let playerBowl = [];

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.dataset.name);
}

function drop(ev) {
    ev.preventDefault();
    const name = ev.dataTransfer.getData("text");
    if (!playerBowl.includes(name)) {
        playerBowl.push(name);
        const item = document.createElement("div");
        item.className = "bowl-item";
        item.innerText = `${ingredients[name] || ''} ${name}`;
        item.onclick = () => removeFromBowl(name, item);
        item.ondblclick = () => showModal(name);
        document.getElementById("bowl").appendChild(item);
    }
}

function removeFromBowl(name, itemElement) {
    playerBowl = playerBowl.filter(item => item !== name);
    itemElement.remove();
}

function showModal(name) {
    document.getElementById("ingredient-name").value = name;
    document.getElementById("ingredient-color").value = "";
    document.getElementById("ingredient-modal").style.display = "block";
}

function closeModal() {
    document.getElementById("ingredient-modal").style.display = "none";
}

function resetHighlights() {
    document.querySelectorAll('.ingredient').forEach(elem => {
        elem.classList.remove('highlighted');
    });
}

function highlightIngredients(list) {
    resetHighlights();
    document.querySelectorAll('.ingredient').forEach(elem => {
        const name = elem.textContent.trim().split(' ').slice(1).join(' ');
        if (list.includes(name)) {
            elem.classList.add('highlighted');
        }
    });
}

function arraysEqual(a, b) {
    return a.length === b.length && a.every(val => b.includes(val));
}

let selectedOrderIngredients = [];

function checkBowl() {
    const result = document.getElementById("result");

    // Ensure an order has been selected
    if (selectedOrderIngredients.length === 0) {
        result.innerText = "❗ Please select a bowl from the order tickets first.";
        result.style.color = "orange";
        return;
    }

    // Compare ingredient names only (ignore emoji)
    const expected = selectedOrderIngredients.slice().sort();
    const actual = playerBowl.slice().sort();

    const isMatch = expected.length === actual.length && expected.every((val, i) => val === actual[i]);

    if (isMatch) {
        result.innerText = "✅ Correct! Your quantum bowl is ready to serve!";
        result.style.color = "green";

        // Reset the bowl only
        playerBowl = [];
        document.getElementById("bowl").innerHTML = '<h2>Your Bowl</h2>';
    } else {
        result.innerText = "❌ Keep trying! Some ingredients are missing or incorrect.";
        result.style.color = "red";
    }
}


function resetGame() {
    playerBowl = [];
    document.getElementById("bowl").innerHTML = '<h2>Your Bowl</h2>';
    document.getElementById("result").innerText = '';
    resetHighlights();
}

function setupIngredients() {
    document.querySelectorAll('.ingredient').forEach(div => {
        div.draggable = true;
        div.ondragstart = drag;
        const name = div.innerText.trim().split(' ').slice(1).join(' ');
        div.dataset.name = name;
    });
}

function setupTickets() {
    document.querySelectorAll('.order-ticket').forEach(button => {
        button.addEventListener('click', () => {
            const ingList = button.dataset.ingredients.split(',').map(i => i.trim());

            // Extract plain text ingredient names (after emoji)
            selectedOrderIngredients = ingList.map(i => i.split(' ').slice(1).join(' '));

            highlightIngredients(selectedOrderIngredients);

            // Show the bowl name
            document.getElementById('bowl-name').innerText = button.innerText.split('\n')[0];
        });
    });
}


window.onload = () => {
    setupIngredients();
    setupTickets();
    document.getElementById("submit-btn").onclick = checkBowl;
    document.getElementById("reset-btn").onclick = resetGame;
};

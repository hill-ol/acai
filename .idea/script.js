const ingredients = {
    "strawberries": "🍓",
    "blueberries": "🫐",
    "granola": "🥄",
    "honey": "🍯",
    "mango": "🥭",
    "cacao nibs": "🍫",
    "mixed berries": "🍇",
    "bananas": "🍌",
    "pineapple": "🍍",
    "almonds": "🌰",
    "peanut butter": "🥜"
};

let playerBowl = [];
let selectedOrderIngredients = [];
let selectedOrderBase = "";

function normalizeName(item) {
    if (typeof item !== 'string') return '';
    const withoutEmoji = item.replace(/[\u{1F300}-\u{1F6FF}][\s]?/gu, '');
    return withoutEmoji.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    const name = ev.target.dataset.name;
    ev.dataTransfer.setData("text", name);
}

function updateBowlPlaceholder() {
    const bowlPlaceholder = document.getElementById('bowl-placeholder');
    const bowlItems = document.querySelectorAll('.bowl-item');
    bowlPlaceholder.style.display = bowlItems.length > 0 ? 'none' : 'block';
}

function drop(ev) {
    ev.preventDefault();
    const name = ev.dataTransfer.getData("text");

    if (!playerBowl.includes(name)) {
        playerBowl.push(name);

        const item = document.createElement("div");
        item.className = "bowl-item";
        item.innerText = `${ingredients[name] || ''} ${name.charAt(0).toUpperCase() + name.slice(1)}`;
        item.onclick = () => removeFromBowl(name, item);
        item.ondblclick = () => showModal(name);
        document.getElementById("bowl").appendChild(item);

        updateBowlPlaceholder();

        console.log(`Added ${name} to bowl. Current bowl:`, playerBowl);
    }
}

function removeFromBowl(name, itemElement) {
    playerBowl = playerBowl.filter(item => item !== name);
    itemElement.remove();

    updateBowlPlaceholder();

    console.log(`Removed ${name} from bowl. Current bowl:`, playerBowl);
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

function resetBowlName() {
    const element = document.getElementById('bowl-name');
    element.innerHTML = 'Select Above';
}

function highlightIngredients(list) {
    resetHighlights();
    document.querySelectorAll('.ingredient').forEach(elem => {
        const name = normalizeName(elem.innerText);
        if (list.includes(name)) {
            elem.classList.add('highlighted');
            console.log(`Highlighting: ${name}`);
        }
    });
}

function checkBowl() {
    const result = document.getElementById("result");

    console.log("Selected Order Ingredients:", selectedOrderIngredients);
    console.log("Selected Order Base:", selectedOrderBase);
    console.log("Player Bowl:", playerBowl);

    if (selectedOrderIngredients.length === 0 || !selectedOrderBase) {
        result.innerText = "❗ Please select a bowl from the order tickets first.";
        result.style.color = "orange";
        return;
    }

    const expectedIngredients = [...selectedOrderIngredients].sort();
    const actualIngredients = [...playerBowl].sort();

    const selectedBase = normalizeName(document.getElementById("base-select").value);
    const orderBase = selectedOrderBase;

    console.log("Expected Ingredients (sorted):", expectedIngredients);
    console.log("Actual Ingredients (sorted):", actualIngredients);
    console.log("Selected Base:", selectedBase);
    console.log("Order Base:", orderBase);

    const baseMatch = selectedBase === orderBase;
    const sameLength = expectedIngredients.length === actualIngredients.length;
    let allMatch = true;

    if (sameLength) {
        for (let i = 0; i < expectedIngredients.length; i++) {
            if (expectedIngredients[i] !== actualIngredients[i]) {
                allMatch = false;
                console.log(`Mismatch at position ${i}: expected "${expectedIngredients[i]}", got "${actualIngredients[i]}"`);
                break;
            }
        }
    } else {
        allMatch = false;
        console.log(`Length mismatch: expected ${expectedIngredients.length}, got ${actualIngredients.length}`);
    }

    const ingredientsMatch = sameLength && allMatch;

    console.log("Base Match:", baseMatch);
    console.log("Ingredients Match:", ingredientsMatch);

    if (baseMatch && ingredientsMatch) {
        result.innerText = "✅ Correct! Your quantum bowl is ready to serve!";
        result.style.color = "green";
        playerBowl = [];
        document.getElementById("bowl").innerHTML = '<div id="bowl-placeholder">Your Bowl</div>';
    } else {
        if (!baseMatch && !ingredientsMatch) {
            result.innerText = "❌ Both the base and ingredients are incorrect.";
        } else if (!baseMatch) {
            result.innerText = "❌ The base is incorrect. Check your selection!";
        } else {
            result.innerText = "❌ The ingredients don't match the order. Check again!";
        }
        result.style.color = "red";
    }
}

function resetGame() {
    playerBowl = [];
    document.getElementById("bowl").innerHTML = '<div id="bowl-placeholder">Your Bowl</div>';
    document.getElementById("result").innerText = '';
    resetBowlName();
    resetHighlights();
    console.log("Game reset");
}

function setupIngredients() {
    document.querySelectorAll('.ingredient').forEach(div => {
        div.draggable = true;
        div.ondragstart = drag;

        const name = normalizeName(div.innerText);
        div.dataset.name = name;

        console.log(`Set up ingredient: "${div.innerText}" → normalized to "${name}"`);
    });
}

function setupTickets() {
    document.querySelectorAll('.order-ticket').forEach(button => {
        button.addEventListener('click', () => {
            const rawIngredients = button.dataset.ingredients.split(',');
            const ingList = rawIngredients.map(i => normalizeName(i));
            selectedOrderIngredients = ingList;
            selectedOrderBase = normalizeName(button.dataset.base);

            highlightIngredients(selectedOrderIngredients);
            document.getElementById('bowl-name').innerText = button.innerText.split('\n')[0];
            document.getElementById("base-select").value = button.dataset.base;

            console.log("Selected order:", button.innerText.split('\n')[0]);
            console.log("Ingredients with emojis:", rawIngredients);
            console.log("Normalized ingredients:", ingList);
            console.log("Base:", selectedOrderBase);
        });
    });
}

window.onload = () => {
    setupIngredients();
    setupTickets();

    const bowlArea = document.getElementById("bowl");
    bowlArea.ondragover = allowDrop;
    bowlArea.ondrop = drop;

    document.getElementById("submit-btn").onclick = checkBowl;
    document.getElementById("reset-btn").onclick = resetGame;

    const ingredientsContainer = document.getElementById("ingredients");

    const peanutButterExists = Array.from(document.querySelectorAll('.ingredient')).some(
        el => normalizeName(el.innerText) === "peanut butter"
    );

    if (!peanutButterExists) {
        const peanutButter = document.createElement("div");
        peanutButter.className = "ingredient";
        peanutButter.draggable = true;
        peanutButter.innerText = "🥜 Peanut Butter";
        peanutButter.ondragstart = drag;
        peanutButter.dataset.name = "peanut butter";
        ingredientsContainer.appendChild(peanutButter);
        console.log("Added missing Peanut Butter ingredient");
    }

    updateBowlPlaceholder();

    console.log("Game initialized");
};

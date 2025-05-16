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
    // Handle cases where the item includes an emoji
    if (typeof item !== 'string') return '';

    // Remove emojis (they are generally followed by spaces)
    const withoutEmoji = item.replace(/[\u{1F300}-\u{1F6FF}][\s]?/gu, '');

    // Then normalize as before
    return withoutEmoji.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    // Store the normalized name for consistency
    const name = ev.target.dataset.name;
    ev.dataTransfer.setData("text", name);
}

function drop(ev) {
    ev.preventDefault();
    const name = ev.dataTransfer.getData("text");

    // Only add if it's not already in the bowl
    if (!playerBowl.includes(name)) {
        playerBowl.push(name);

        const item = document.createElement("div");
        item.className = "bowl-item";
        item.innerText = `${ingredients[name] || ''} ${name.charAt(0).toUpperCase() + name.slice(1)}`;
        item.onclick = () => removeFromBowl(name, item);
        item.ondblclick = () => showModal(name);
        document.getElementById("bowl").appendChild(item);

        console.log(`Added ${name} to bowl. Current bowl:`, playerBowl);
    }
}

function removeFromBowl(name, itemElement) {
    playerBowl = playerBowl.filter(item => item !== name);
    itemElement.remove();
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
    element.innerHTML = 'Select Above'; // Clears all content within the element
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

    // Debugging info
    console.log("Selected Order Ingredients:", selectedOrderIngredients);
    console.log("Selected Order Base:", selectedOrderBase);
    console.log("Player Bowl:", playerBowl);

    if (selectedOrderIngredients.length === 0 || !selectedOrderBase) {
        result.innerText = "❗ Please select a bowl from the order tickets first.";
        result.style.color = "orange";
        return;
    }

    // Sort arrays for comparison
    const expectedIngredients = [...selectedOrderIngredients].sort();
    const actualIngredients = [...playerBowl].sort();

    // Get the selected base from the dropdown and normalize it
    const selectedBase = normalizeName(document.getElementById("base-select").value);
    const orderBase = selectedOrderBase; // Already normalized in setupTickets

    console.log("Expected Ingredients (sorted):", expectedIngredients);
    console.log("Actual Ingredients (sorted):", actualIngredients);
    console.log("Selected Base:", selectedBase);
    console.log("Order Base:", orderBase);

    // Check if base matches
    const baseMatch = selectedBase === orderBase;

    // Check if ingredients match (same length and all elements match)
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
        document.getElementById("bowl").innerHTML = '<h2>Your Bowl</h2>';
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
    document.getElementById("bowl").innerHTML = '<h2>Your Bowl</h2>';
    document.getElementById("result").innerText = '';
    resetBowlName();
    resetHighlights();
    console.log("Game reset");
}

function setupIngredients() {
    document.querySelectorAll('.ingredient').forEach(div => {
        div.draggable = true;
        div.ondragstart = drag;

        // Store normalized name (without emoji) in dataset for consistency
        const name = normalizeName(div.innerText);
        div.dataset.name = name;

        console.log(`Set up ingredient: "${div.innerText}" → normalized to "${name}"`);
    });
}

function setupTickets() {
    document.querySelectorAll('.order-ticket').forEach(button => {
        button.addEventListener('click', () => {
            // The data-ingredients attribute contains items WITH emojis
            const rawIngredients = button.dataset.ingredients.split(',');

            // Normalize each ingredient by removing emojis
            const ingList = rawIngredients.map(i => normalizeName(i));
            selectedOrderIngredients = ingList;
            selectedOrderBase = normalizeName(button.dataset.base);

            highlightIngredients(selectedOrderIngredients);
            document.getElementById('bowl-name').innerText = button.innerText.split('\n')[0];

            // Auto-select correct base in dropdown (with original case)
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

    // Make sure the bowl area can receive drops
    // Note: These are already set in the HTML but setting them here as well for redundancy
    const bowlArea = document.getElementById("bowl");
    bowlArea.ondragover = allowDrop;
    bowlArea.ondrop = drop;

    document.getElementById("submit-btn").onclick = checkBowl;
    document.getElementById("reset-btn").onclick = resetGame;

    // Add event listeners for Peanut Butter as it's missing from HTML but in orders
    const ingredients = document.getElementById("ingredients");

    // Check if Peanut Butter is missing and add it
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
        ingredients.appendChild(peanutButter);
        console.log("Added missing Peanut Butter ingredient");
    }

    console.log("Game initialized");
};
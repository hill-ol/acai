const ingredients = {
    "Strawberries": "🍓",
    "Blueberries": "🫐",
    "Granola": "🥣",
    "Honey": "🍯",
    "Bananas": "🍌",
    "Almonds": "🌰",
    "Pineapple": "🍍",
    "Mango": "🥭",
    "Peanut Butter": "🥜",
    "Cacao Nibs": "🍫",
    "Mixed Berries": "🍇"
};

let currentOrder = [];
let playerBowl = [];

function generateOrder() {
    const keys = Object.keys(ingredients);
    const shuffled = keys.sort(() => 0.5 - Math.random());
    currentOrder = shuffled.slice(0, 3);
    const base = document.getElementById("base-select").value;
    document.getElementById("order-display").innerText =
        `Base: ${base}\nToppings:\n - ` + currentOrder.join('\n - ');
}

function createIngredientElements() {
    const container = document.getElementById('ingredients');
    container.innerHTML = '<h2>Ingredients</h2>';
    for (const [name, emoji] of Object.entries(ingredients)) {
        const div = document.createElement('div');
        div.className = 'ingredient';
        div.draggable = true;
        div.ondragstart = drag;
        div.dataset.name = name;
        div.innerText = `${emoji} ${name}`;
        container.appendChild(div);
    }
}

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
        item.innerText = `${ingredients[name]} ${name}`;
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
    document.getElementById("ingredient-color").value = ""; // You can customize color logic here
    document.getElementById("ingredient-modal").style.display = "block";
}

function closeModal() {
    document.getElementById("ingredient-modal").style.display = "none";
}

function arraysEqual(a, b) {
    return a.length === b.length && a.every(val => b.includes(val));
}

function checkBowl() {
    const selectedBase = document.getElementById("base-select").value;
    const baseInOrder = document.getElementById("order-display").innerText.includes(selectedBase);
    const result = document.getElementById("result");

    if (arraysEqual(currentOrder.sort(), playerBowl.sort()) && baseInOrder) {
        result.innerText = '✅ Correct! Great job!';
        result.style.color = 'green';
    } else {
        result.innerText = '❌ Incorrect. Try again!';
        result.style.color = 'red';
    }
}

function resetGame() {
    playerBowl = [];
    document.getElementById("bowl").innerHTML = '<h2>Your Bowl</h2>';
    document.getElementById("result").innerText = '';
    generateOrder();
}

document.getElementById("submit-btn").onclick = checkBowl;
document.getElementById("reset-btn").onclick = resetGame;
document.getElementById("base-select").onchange = generateOrder;

window.onload = () => {
    createIngredientElements();
    generateOrder();
};
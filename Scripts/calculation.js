// ======================
// BASE DATA LAYER
// ======================

function loadAppData() {
  return JSON.parse(localStorage.getItem("appData")) || {
    meta: { version: "1.0", currency: "CZK" },
    months: {}
  };
}

function saveAppData(data) {
  localStorage.setItem("appData", JSON.stringify(data));
}

function ensureMonth(appData, monthKey) {
  if (!appData.months[monthKey]) {
    appData.months[monthKey] = {
      status: "open",
      fuel: [],
      finance: [],
      summary: null
    };
  }
}

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

// ======================
// DOM
// ======================

const form = document.getElementById("transaction-form");
const sale = document.getElementById("sale");
const amount = document.getElementById("amount");
const litrs = document.getElementById("litrs");

const list = document.getElementById("transaction-list");
const totalElement = document.getElementById("total-display");

const monthSelect = document.getElementById("month-select");
const saveMonthBtn = document.getElementById("save-month");
const showMonthsBtn = document.getElementById("show-months");
const savedMonthsDiv = document.getElementById("saved-months");


// ======================
// INIT
// ======================

monthSelect.value = new Date().toISOString().slice(0, 7);
renderFuelList();

// ======================
// ADD CHECK (UX как раньше)
// ======================

form.addEventListener("submit", function (e) {
  e.preventDefault();

const saleValue = parseFloat(sale.value.replace(",", ".")) || 0;
const amountValue = parseFloat(amount.value.replace(",", "."));
const litersValue = parseFloat(litrs.value.replace(",", ".")) || 0;

if (isNaN(amountValue)) {
  alert("Введіть суму");
  return;
}

// 👉 ЛОГИКА БЕЗ СКИДКИ
let discountTotal = 0;
let finalAmount = amountValue;

// 👉 ЕСЛИ УКАЗАНЫ ЛИТРЫ И СКИДКА
if (litersValue > 0 && saleValue > 0) {
  discountTotal = +(saleValue * litersValue).toFixed(2);
  finalAmount = +(amountValue - discountTotal).toFixed(2);
}


  const monthKey = monthSelect.value;
  if (!monthKey) {
    alert("Оберіть місяць");
    return;
  }

  const appData = loadAppData();
  ensureMonth(appData, monthKey);

  if (appData.months[monthKey].status === "closed") {
    alert("Місяць вже збережений");
    return;
  }

  const fuelId = generateId("fuel");

  appData.months[monthKey].fuel.push({
    id: fuelId,
    amount: amountValue,
    liters: litersValue,
    finalAmount
  });

  appData.months[monthKey].finance.push({
    id: generateId("finance"),
    type: "expense",
    category: "Паливо",
    amount: finalAmount,
    linkedFuelId: fuelId
  });

  saveAppData(appData);
  form.reset();
  renderFuelList();
});

// ======================
// RENDER (как в старой версии)
// ======================

function renderFuelList() {
  const monthKey = monthSelect.value;
  const appData = loadAppData();

  list.innerHTML = "";
  let total = 0;

  if (!monthKey || !appData.months[monthKey]) {
    totalElement.textContent = "Загальна сума: 0.00";
    return;
  }

  appData.months[monthKey].fuel.forEach((t) => {
    total += t.finalAmount;

    const li = document.createElement("li");
    li.textContent = `Сума: ${t.amount} - Літри: ${t.liters} - Фінальна сума: ${t.finalAmount}`;

    const btn = document.createElement("button");
    btn.textContent = "❌";
    btn.onclick = () => deleteFuel(monthKey, t.id);

    li.appendChild(btn);
    list.appendChild(li);
  });

  totalElement.textContent = `Загальна сума: ${total.toFixed(2)}`;
}

monthSelect.addEventListener("change", renderFuelList);

// ======================
// DELETE CHECK
// ======================

function deleteFuel(monthKey, fuelId) {
  const appData = loadAppData();

  appData.months[monthKey].fuel =
    appData.months[monthKey].fuel.filter(f => f.id !== fuelId);

  appData.months[monthKey].finance =
    appData.months[monthKey].finance.filter(f => f.linkedFuelId !== fuelId);

  saveAppData(appData);
  renderFuelList();
}

// ======================
// SAVE MONTH (как раньше, но правильно)
// ======================

saveMonthBtn.addEventListener("click", function () {
  const monthKey = monthSelect.value;
  if (!monthKey) return;

  const appData = loadAppData();
  const month = appData.months[monthKey];

  if (!month) return;

  const total = month.fuel.reduce((sum, f) => sum + f.finalAmount, 0);

  month.status = "closed";
  month.summary = {
    fuelTotal: total
  };

  saveAppData(appData);
  alert(`Місяць ${monthKey} збережено: ${total.toFixed(2)}`);
});
showMonthsBtn.addEventListener("click", function () {
  const appData = loadAppData();
  savedMonthsDiv.innerHTML = "";

  if (savedMonthsDiv.style.display === "block") {
    savedMonthsDiv.style.display = "none";
    return;
  }

  savedMonthsDiv.style.display = "block";

  const savedKeys = Object.keys(appData.months)
    .filter(m => appData.months[m].status === "closed")
    .sort();

  if (savedKeys.length === 0) {
    savedMonthsDiv.textContent = "Немає збережених місяців";
    return;
  }

  const ul = document.createElement("ul");

  savedKeys.forEach(monthKey => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";

    const total = appData.months[monthKey].summary?.fuelTotal || 0;

    // 📅 текст месяца
    const text = document.createElement("span");
    text.textContent = `📅 ${monthKey} — 💰 ${total.toFixed(2)} Kč`;
    text.style.cursor = "pointer";
    text.onclick = () => {
      monthSelect.value = monthKey;
      renderFuelList();
      savedMonthsDiv.style.display = "none";
    };

    // ❌ кнопка удаления
    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.style.marginLeft = "10px";
    delBtn.onclick = (e) => {
      e.stopPropagation();

      if (!confirm(`Видалити місяць ${monthKey}?`)) return;

      delete appData.months[monthKey];
      saveAppData(appData);
      showMonthsBtn.click(); // перерисовать список
    };

    li.appendChild(text);
    li.appendChild(delBtn);
    ul.appendChild(li);
  });

  savedMonthsDiv.appendChild(ul);
});


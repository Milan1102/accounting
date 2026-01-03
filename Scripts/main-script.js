// ======================
// BASE
// ======================

function loadAppData() {
  return JSON.parse(localStorage.getItem("appData")) || {
    meta: {},
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

const entryForm = document.getElementById("entry-form");
const entryType = document.getElementById("entry-type");
const entryCategory = document.getElementById("entry-category");
const entryAmount = document.getElementById("entry-amount");
const entryDate = document.getElementById("entry-date");
const entryList = document.getElementById("entry-list");
const financeMonth = document.getElementById("finance-month");

// ======================
// INIT
// ======================

financeMonth.value = new Date().toISOString().slice(0, 7);
renderList();

financeMonth.addEventListener("change", renderList);

// ======================
// ADD ENTRY
// ======================

entryForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const amount = parseFloat(entryAmount.value.replace(",", "."));
  if (isNaN(amount)) {
    alert("Некоректна сума");
    return;
  }

  const monthKey = financeMonth.value;
  if (!monthKey) {
    alert("Оберіть місяць");
    return;
  }

  const appData = loadAppData();
  ensureMonth(appData, monthKey);

  if (appData.months[monthKey].status === "closed") {
    alert("Місяць вже закритий");
    return;
  }

  appData.months[monthKey].finance.push({
    id: generateId("finance"),
    type: entryType.value === "Дохід" ? "income" : "expense",
    category: entryCategory.value || "Без категорії",
    amount: amount,
    date: entryDate.value || new Date().toISOString().slice(0, 10)
  });

  saveAppData(appData);
  
// ⬇️ ВАЖНО: принудительно обновляем текущий месяц
financeMonth.value = monthKey;
renderList();
});

// ======================
// RENDER
// ======================

function renderList() {
  const monthKey = financeMonth.value;
  const appData = loadAppData();
  entryList.innerHTML = "";

  if (!monthKey || !appData.months[monthKey]) {
    entryList.innerHTML = "<li>Немає даних</li>";
    return;
  }

  const finance = appData.months[monthKey].finance;

  if (finance.length === 0) {
    entryList.innerHTML = "<li>Немає операцій</li>";
    return;
  }

  finance.forEach((f) => {
    const li = document.createElement("li");
    li.textContent =
      `${f.date} | ${f.category} | ` +
      `${f.type === "income" ? "+" : "-"}${f.amount.toFixed(2)}`;

    const btn = document.createElement("button");
    btn.textContent = "❌";
    btn.onclick = () => deleteFinance(monthKey, f.id);

    li.appendChild(btn);
    entryList.appendChild(li);
  });
}

// ======================
// DELETE
// ======================

function deleteFinance(monthKey, id) {
  const appData = loadAppData();
  const month = appData.months[monthKey];

  month.finance = month.finance.filter(f => f.id !== id);

  saveAppData(appData);
  renderList();
}

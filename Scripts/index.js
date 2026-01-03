function loadAppData() {
  return JSON.parse(localStorage.getItem("appData")) || {
    meta: {},
    months: {}
  };
}

const monthInput = document.getElementById("main-month");

const incomeEl = document.getElementById("income-total");
const expenseEl = document.getElementById("expense-total");
const fuelEl = document.getElementById("fuel-total");
const balanceEl = document.getElementById("balance-total");
const categoryList = document.getElementById("category-stats");

// текущий месяц по умолчанию
monthInput.value = new Date().toISOString().slice(0, 7);
renderDashboard();

monthInput.addEventListener("change", renderDashboard);

function renderDashboard() {
  const monthKey = monthInput.value;
  const appData = loadAppData();
  const month = appData.months[monthKey];

  const stats = calculateMonthAnalytics(month);

  incomeEl.textContent = stats.income.toFixed(2);
  expenseEl.textContent = stats.expense.toFixed(2);
  fuelEl.textContent = stats.fuelExpense.toFixed(2);
  balanceEl.textContent = stats.profit.toFixed(2);

  categoryList.innerHTML = "";

Object.entries(stats.categories).forEach(([cat, values]) => {
  const li = document.createElement("li");

  let text = `${cat}: `;
  let color = "#333";

  if (values.income > 0) {
    text += `+${values.income.toFixed(2)} Kč`;
    color = "#27ae60";
  }

  if (values.expense > 0) {
    if (values.income > 0) text += " / ";
    text += `-${values.expense.toFixed(2)} Kč`;
    color = "#c0392b";
  }

  li.textContent = text;
  li.style.color = color;

  categoryList.appendChild(li);
});


}

// ======================
// ANALYTICS CORE
// ======================

// Аналитика одного месяца
function calculateMonthAnalytics(month) {
  let income = 0;
  let expense = 0;
  let fuelExpense = 0;

  // категории с разделением доход / расход
  const categories = {};

  if (!month) {
    return {
      income: 0,
      expense: 0,
      fuelExpense: 0,
      profit: 0,
      categories: {}
    };
  }

  month.finance.forEach(f => {
    // Общие суммы
    if (f.type === "income") income += f.amount;
    if (f.type === "expense") expense += f.amount;

    // Категории
    if (!categories[f.category]) {
      categories[f.category] = {
        income: 0,
        expense: 0
      };
    }

    categories[f.category][f.type] += f.amount;

    // Отдельно топливо
    if (f.category === "Паливо" && f.type === "expense") {
      fuelExpense += f.amount;
    }
  });

  return {
    income,
    expense,
    fuelExpense,
    profit: income - expense,
    categories
  };
}

// ======================
// Аналитика по всем месяцам (динамика)
// ======================

function calculateMonthlyTrend(appData) {
  const result = [];

  Object.entries(appData.months).forEach(([monthKey, month]) => {
    if (month.status !== "closed") return;

    const stats = calculateMonthAnalytics(month);

    result.push({
      month: monthKey,
      income: stats.income,
      expense: stats.expense,
      profit: stats.profit
    });
  });

  return result.sort((a, b) => a.month.localeCompare(b.month));
}


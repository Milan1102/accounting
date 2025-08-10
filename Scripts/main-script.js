const entryForm = document.getElementById("entry-form");
const entryType = document.getElementById("entry-type");
const entryCategory = document.getElementById("entry-category");
const entryAmount = document.getElementById("entry-amount");
const entryDate = document.getElementById("entry-date");
const entryList = document.getElementById("entry-list");

// Завантаження даних з LocalStorage
let entryTransactions = JSON.parse(localStorage.getItem("entryTransactions")) || [];

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', function() {
    initFilters();
    renderList();
});

// Додавання нової транзакції
entryForm.addEventListener("submit", function(e) {
    e.preventDefault();
    
    if (!entryAmount.value || isNaN(parseFloat(entryAmount.value))) {
        alert("Будь ласка, введіть коректну суму!");
        return;
    }

    const entryTransaction = {
        entryType: entryType.value,
        entryCategory: entryCategory.value,
        entryAmount: parseFloat(entryAmount.value),
        entryDate: entryDate.value || new Date().toISOString().slice(0, 10)
    };
    
    entryTransactions.push(entryTransaction);
    localStorage.setItem("entryTransactions", JSON.stringify(entryTransactions));
    renderList(document.getElementById("month-filter").value);
    entryForm.reset();
});

// Ініціалізація фільтрів
function initFilters() {
    const filtersDiv = document.createElement('div');
    filtersDiv.className = 'filters-container';
    
    // Фільтр по місяцю
    const monthFilter = document.createElement('input');
    monthFilter.type = 'month';
    monthFilter.id = 'month-filter';
    monthFilter.addEventListener('change', () => renderList(monthFilter.value));
    
    // Кнопка експорту
    const exportBtn = document.createElement('button');
    exportBtn.className = 'export-btn';
    exportBtn.textContent = 'Експорт в TXT';
    exportBtn.addEventListener('click', exportToTxt);
    
    filtersDiv.append(monthFilter, exportBtn);
    entryList.parentNode.insertBefore(filtersDiv, entryList);
}

// Відображення списку з фільтрацією
function renderList(filterMonth = null) {
    entryList.innerHTML = "";
    
    let filteredTransactions = entryTransactions;
    let totalIncome = 0;
    let totalExpense = 0;
    const categoriesSummary = {};

    // Фільтрація та розрахунки
    if (filterMonth) {
        filteredTransactions = entryTransactions.filter(et => {
            return et.entryDate.slice(0, 7) === filterMonth;
        });
    }

    // Розрахунок сум
    filteredTransactions.forEach(et => {
        if (et.entryType === "Дохід") {
            totalIncome += et.entryAmount;
        } else {
            totalExpense += et.entryAmount;
        }

        if (!categoriesSummary[et.entryCategory]) {
            categoriesSummary[et.entryCategory] = { income: 0, expense: 0 };
        }
        
        if (et.entryType === "Дохід") {
            categoriesSummary[et.entryCategory].income += et.entryAmount;
        } else {
            categoriesSummary[et.entryCategory].expense += et.entryAmount;
        }
    });

    const balance = totalIncome - totalExpense;

    // Відображення фінансового звіту
    const summaryHTML = `
        <div class="summary-container">
            <h3>Фінансовий звіт</h3>
            <div class="summary-row">
                <span>Доходи:</span>
                <span class="income">+${totalIncome.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Витрати:</span>
                <span class="expense">-${totalExpense.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Баланс:</span>
                <span class="${balance >= 0 ? 'income' : 'expense'}">${balance.toFixed(2)}</span>
            </div>
            
            <h4>Розподіл за категоріями:</h4>
            <div class="categories-container" id="categories-summary"></div>
        </div>
    `;
    entryList.innerHTML = summaryHTML;

    // Додаємо статистику по категоріям
    const categoriesContainer = document.getElementById("categories-summary");
    for (const category in categoriesSummary) {
        const categoryBalance = categoriesSummary[category].income - categoriesSummary[category].expense;
        const categoryHTML = `
            <div class="category-item">
                <div class="category-header">
                    <strong>${category}</strong>
                    <span class="${categoryBalance >= 0 ? 'income' : 'expense'}">${categoryBalance.toFixed(2)}</span>
                </div>
                <div class="category-details">
                    <span class="income">Доходи: +${categoriesSummary[category].income.toFixed(2)}</span>
                    <span class="expense">Витрати: -${categoriesSummary[category].expense.toFixed(2)}</span>
                </div>
            </div>
        `;
        categoriesContainer.insertAdjacentHTML('beforeend', categoryHTML);
    }

    // Відображення транзакцій
    if (filteredTransactions.length === 0) {
        entryList.insertAdjacentHTML('beforeend', '<li class="no-data">Немає транзакцій за обраний період</li>');
    } else {
        filteredTransactions.forEach((et, index) => {
            const transactionHTML = `
                <li class="transaction-item ${et.entryType === 'Дохід' ? 'income-item' : 'expense-item'}">
                    <div class="transaction-info">
                        <span class="transaction-date">${et.entryDate}</span>
                        <span class="transaction-category">${et.entryCategory}</span>
                        <span class="transaction-amount ${et.entryType === 'Дохід' ? 'income' : 'expense'}">
                            ${et.entryType === 'Дохід' ? '+' : '-'}${et.entryAmount.toFixed(2)}
                        </span>
                    </div>
                    <button class="delete-btn" data-index="${index}">❌</button>
                </li>
            `;
            entryList.insertAdjacentHTML('beforeend', transactionHTML);
        });

        // Додаємо обробники подій для кнопок видалення
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                entryTransactions.splice(index, 1);
                localStorage.setItem("entryTransactions", JSON.stringify(entryTransactions));
                renderList(document.getElementById("month-filter").value);
            });
        });
    }
}

// Експорт в TXT
function exportToTxt() {
    const monthFilter = document.getElementById("month-filter").value;
    let filteredData = entryTransactions;
    
    if (monthFilter) {
        filteredData = entryTransactions.filter(et => et.entryDate.slice(0, 7) === monthFilter);
    }

    let txtContent = "Дата\tТип\tКатегорія\tСума\n";
    filteredData.forEach(et => {
        txtContent += `${et.entryDate}\t${et.entryType}\t${et.entryCategory}\t${et.entryType === 'Дохід' ? '+' : '-'}${et.entryAmount.toFixed(2)}\n`;
    });
    
    // Додаємо підсумки
    let totalIncome = 0;
    let totalExpense = 0;
    filteredData.forEach(et => {
        if (et.entryType === "Дохід") totalIncome += et.entryAmount;
        else totalExpense += et.entryAmount;
    });
    
    txtContent += `\nПідсумки:\nДоходи: ${totalIncome.toFixed(2)}\nВитрати: ${totalExpense.toFixed(2)}\nБаланс: ${(totalIncome - totalExpense).toFixed(2)}`;
    
    const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${monthFilter || 'all'}.txt`;
    a.click();
}




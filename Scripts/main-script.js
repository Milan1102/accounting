const entryForm = document.getElementById("entry-form");
const entryType = document.getElementById("entry-type");
const entryCategory = document.getElementById("entry-category");
const entryAmount = document.getElementById("entry-amount");
const entryDate = document.getElementById("entry-date");
const entryList = document.getElementById("entry-list");

//загружаєм данні в LokalStorage
let entryTransactions = JSON.parse(localStorage.getItem("entryTransactions")) || [];

// Инициализируем список при загрузке страницы
renderList();

entryForm.addEventListener("submit", function (e){
    e.preventDefault();
    
    // Проверяем корректность введенной суммы
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
    renderList();
    entryForm.reset();
});

function renderList(){
    entryList.innerHTML = "";//об'єкт з html даними дістає значення
    
    // Если нет транзакций, выходим из функции
    if (!entryTransactions || entryTransactions.length === 0) {
        return;
    }

    entryTransactions.forEach((et, index) => {
        const li = document.createElement("li");
        // Проверяем наличие суммы и форматируем ее
        const formattedAmount = et.entryAmount ? et.entryAmount.toFixed(2) : "0.00";
        li.textContent = `${et.entryDate} ${et.entryType} ${et.entryCategory} ${formattedAmount}`;
        
        const deleteEtBtn = document.createElement("button");
        deleteEtBtn.textContent = "❌";
        deleteEtBtn.addEventListener("click", function(){
            entryTransactions.splice(index, 1);//почни з елемента по индексу и видали 1 елемент
            localStorage.setItem("entryTransactions", JSON.stringify(entryTransactions));
            renderList();
        });
        li.appendChild(deleteEtBtn);//добавити в кінець елементу елемент 
        entryList.appendChild(li);
    });
};




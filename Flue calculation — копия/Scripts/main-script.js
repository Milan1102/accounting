const entryForm = document.getElementById ("entry-form");
const entryType = document.getElementById ("entry-type");
const entryCategory = document.getElementById ("entry-category");
const entryAmount = document.getElementById  ("entry-amount");
const entryDate = document.getElementById ("entry-date");
const entryList = document.getElementById ("entry-list");

//загружаєм данні в LokalStorage
let entryTransactions = JSON.parse(localStorage.getItem ("entryTransactions")) || [];

entryForm.addEventListener("submit", function (e){
    e.preventDefault();
    const entryTransaction ={
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
    entryTransactions.forEach((et, index) => {
        const li = document.createElement ("li");
        li.textContent = `${et.entryDate} ${et.entryType} ${et.entryCategory} ${et.entryAmount.toFixed(2)}`;
        const deleteEtBtn = document.createElement ("button");
        deleteEtBtn.textContent = "❌";
        deleteEtBtn.addEventListener("click", function(){
            entryTransactions.splice(index, 1);//почни з елемента по индексу и видали 1 елемент
            localStorage.setItem ("entryTransactions", JSON.stringify(entryTransactions));
            renderList();
        });
        li.appendChild(deleteEtBtn);//добавити в кінець елементу елемент 
        entryList.appendChild(li);
    });
};



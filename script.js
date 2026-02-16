let editingIndex = -1;

function loadDefaultExpenses(){

  document.getElementById("expenseList").innerHTML = `
    <div class="expense-row"><input type="number" class="expense" placeholder="🏢 Field Work"></div>
    <div class="expense-row"><input type="number" class="expense" placeholder="🏠 Boarding House"></div>
    <div class="expense-row"><input type="number" class="expense" placeholder="💧 Water Bill"></div>
    <div class="expense-row"><input type="number" class="expense" placeholder="💡 Electric Bill"></div>
    <div class="expense-row"><input type="number" class="expense" placeholder="💰 Savings"></div>
    <div class="expense-row"><input type="number" class="expense" placeholder="🎯 Ipon Challenge"></div>
    <div class="expense-row"><input type="number" class="expense" placeholder="📶 Wifi"></div>
    <div class="expense-row"><input type="number" class="expense" placeholder="💳 Home Credit"></div>
    <div class="expense-row"><input type="number" class="expense" placeholder="🛒 Groceries"></div>
  `;
}

// ===============================
// ADD EXPENSE
// ===============================
function addExpense(){
  const name = prompt("Expense name:");
  if(!name) return;

  const row = document.createElement("div");
  row.className="expense-row";

  row.innerHTML = `
    <input type="number" class="expense" placeholder="${name}">
    <button class="delete-btn" onclick="deleteExpense(this)">✕</button>
  `;

  document.getElementById("expenseList").appendChild(row);
}

// ===============================
function deleteExpense(btn){
  btn.parentElement.remove();
}

// ===============================
// COMPUTE
// ===============================
function computeBudget(){
  const salary = Number(document.getElementById("salary").value)||0;
  const expenses = document.querySelectorAll(".expense");
  const next = new Date(document.getElementById("nextSalary").value);
  const today = new Date();

  let total = 0;
  expenses.forEach(e => total += Number(e.value || 0));

  let remaining = salary - total;
  let days = Math.ceil((next - today)/(1000*60*60*24));
  if(days<=0 || isNaN(days)) days = 0;

  let daily = days>0 ? (remaining/days).toFixed(2) : 0;

  document.getElementById("totalExpenses").textContent = total.toFixed(2);
  document.getElementById("remaining").textContent = remaining.toFixed(2);
  document.getElementById("dailyBudget").textContent = daily;
}

// ===============================
// SAVE PLAN
// ===============================
function saveArchive(){

  const salaryInput = document.getElementById("salary").value;
  const nextSalaryInput = document.getElementById("nextSalary").value;
  const expenseInputs = document.querySelectorAll(".expense");

  // ===== VALIDATION =====
  if(!salaryInput && !nextSalaryInput){
    alert("Please enter your Salary and Next Salary Date first.");
    return;
  }

  if(!salaryInput){
    alert("Please enter your Salary first.");
    return;
  }

  if(!nextSalaryInput){
    alert("Please enter your Next Salary Date first.");
    return;
  }

  let hasExpense = false;
  expenseInputs.forEach(e=>{
    if(Number(e.value)>0) hasExpense = true;
  });

  if(!hasExpense){
    alert("Please enter at least one expense before saving.");
    return;
  }

  // ===== SAVE DATA =====
  const salary = Number(salaryInput);
  const next = new Date(nextSalaryInput);
  const today = new Date();

  let expenses = [];
  let total = 0;

  expenseInputs.forEach(e=>{
    const val = Number(e.value||0);
    total += val;
    expenses.push({
      name: e.placeholder,
      value: val
    });
  });

  let days = Math.ceil((next - today)/(1000*60*60*24));
  if(days<=0 || isNaN(days)) days=0;

  let daily = days>0 ? ((salary-total)/days).toFixed(2) : 0;

  const data = {
    date:new Date().toLocaleString(),
    salary,
    nextSalary: nextSalaryInput,
    expenses,
    totalExpenses:total,
    dailyBudget:daily
};

  let archives = JSON.parse(localStorage.getItem("archives")||"[]");

  if(editingIndex >= 0){
    archives[editingIndex] = data;   // ⭐ replace old record
    editingIndex = -1;               // reset editing mode
}else{
    archives.push(data);             // normal save
}

  localStorage.setItem("archives",JSON.stringify(archives));

alert(editingIndex === -1 ? 
      "Plan saved successfully!" : 
      "Plan updated successfully!");


// RESET FORM AFTER SAVE
document.getElementById("salary").value = "";
document.getElementById("nextSalary").value = "";
loadDefaultExpenses();
computeBudget();

}

// ===============================
// OPEN HISTORY
// ===============================
function openArchive(){

  const page = document.getElementById("historyPage");
  const content = document.getElementById("historyContent");

  const archives = JSON.parse(localStorage.getItem("archives")||"[]");

  if(archives.length === 0){
    content.innerHTML = "<p>No saved plans yet.</p>";
    page.style.display = "block";
    return;
  }

  let html = "";

  archives.slice().reverse().forEach((a, index)=>{

    let list = "";
    a.expenses.forEach(e=>{
      list += `<div>${e.name}: ₱${e.value}</div>`;
    });

    html += `
      <div class="history-card">
        <b>${a.date}</b><br><br>
        Salary: ₱${a.salary}<br>
        ${list}
        <br>
        <b>Total Expenses:</b> ₱${a.totalExpenses}<br>
        <b>Daily Budget:</b> ₱${a.dailyBudget}<br><br>

        <button onclick="editArchive(${archives.length-1-index})">✏️ Edit</button>
        <button onclick="deleteArchive(${archives.length-1-index})">🗑 Delete</button>
      </div>
      <br>
    `;
  });

  content.innerHTML = html;
  page.style.display = "block";
}

function editArchive(index){

  let archives = JSON.parse(localStorage.getItem("archives")||"[]");
  let data = archives[index];

  editingIndex = index; // ⭐ remember which record is editing

  document.getElementById("salary").value = data.salary;
  document.getElementById("nextSalary").value = data.nextSalary || "";

  document.getElementById("expenseList").innerHTML = "";

  data.expenses.forEach(e=>{
    const row = document.createElement("div");
    row.className="expense-row";

    row.innerHTML = `
      <input type="number" class="expense" value="${e.value}" placeholder="${e.name}">
      <button class="delete-btn" onclick="deleteExpense(this)">✕</button>
    `;
    document.getElementById("expenseList").appendChild(row);
  });

  closeArchive();
  computeBudget();
}


// ===============================
function closeArchive(){
  document.getElementById("historyPage").style.display = "none";
}

function deleteArchive(index){

  if(!confirm("Delete this saved plan?")) return;

  let archives = JSON.parse(localStorage.getItem("archives")||"[]");

  archives.splice(index,1);

  localStorage.setItem("archives",JSON.stringify(archives));

  openArchive(); // refresh history
}

window.onload = loadDefaultExpenses;

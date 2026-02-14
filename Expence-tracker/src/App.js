import { useState, useEffect } from "react";
import Header from "./components/Header";
import Summary from "./components/Summary";
import TransactionList from "./components/TransactionList";
import AddModal from "./components/AddModal";
import ReportModal from "./components/ReportModal";
import MonthlyHistory from "./components/MonthlyHistory";
import "./index.css";

const months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];

function App() {
  const currentMonth = months[new Date().getMonth()];

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [allTransactions, setAllTransactions] = useState({});
  const [type, setType] = useState(null);
  const [showReport, setShowReport] = useState(false);

  // Load saved data
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("monthlyTransactions"));
    if (saved) {
      setAllTransactions(saved);
    }
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem(
      "monthlyTransactions",
      JSON.stringify(allTransactions)
    );
  }, [allTransactions]);

  const transactions = allTransactions[selectedMonth] || [];

  const addTransaction = (text, amount) => {
    const newTransaction = {
      id: Date.now(),
      text,
      amount:
        type === "expense"
          ? -Math.abs(amount)
          : Math.abs(amount),
    };

    setAllTransactions({
      ...allTransactions,
      [selectedMonth]: [...transactions, newTransaction],
    });

    setType(null);
  };

  const deleteTransaction = (id) => {
    const updated = transactions.filter((t) => t.id !== id);

    setAllTransactions({
      ...allTransactions,
      [selectedMonth]: updated,
    });
  };

  return (
    <div className="container">
      <Header />

      {/* Month Selector */}
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="month-select"
      >
        {months.map((month) => (
          <option key={month}>{month}</option>
        ))}
      </select>

      <Summary transactions={transactions} />

      {/* View Report Button */}
      <button
        className="report-btn"
        onClick={() => setShowReport(true)}
      >
        📊 View {selectedMonth} Report
      </button>

      <div className="buttons">
        <button
          className="income-btn"
          onClick={() => setType("income")}
        >
          + Add Income
        </button>

        <button
          className="expense-btn"
          onClick={() => setType("expense")}
        >
          + Add Expense
        </button>
      </div>

      {type && (
        <AddModal
          addTransaction={addTransaction}
          type={type}
        />
      )}

      <TransactionList
        transactions={transactions}
        deleteTransaction={deleteTransaction}
      />

      {showReport && (
        <ReportModal
          transactions={transactions}
          month={selectedMonth}
          close={() => setShowReport(false)}
        />
      )}

      <MonthlyHistory allTransactions={allTransactions} />
    </div>
  );
}

export default App;

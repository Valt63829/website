function ReportModal({ transactions, month, close }) {
  const amounts = transactions.map((t) => t.amount);

  const income = amounts
    .filter((a) => a > 0)
    .reduce((a, b) => a + b, 0);

  const expense = amounts
    .filter((a) => a < 0)
    .reduce((a, b) => a + b, 0);

  const balance = income + expense;
  const incomeNeeded = balance < 0 ? Math.abs(balance) : 0;

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h3>{month} Report</h3>

        <p>Total Income: ₹{income}</p>
        <p>Total Expense: ₹{Math.abs(expense)}</p>
        <p>Final Balance: ₹{balance}</p>
        <p>Total Transactions: {transactions.length}</p>

        {balance < 0 && (
          <p style={{ color: "#ff4d6d" }}>
            Income Needed: ₹{incomeNeeded}
          </p>
        )}

        <button onClick={close}>Close</button>
      </div>
    </div>
  );
}

export default ReportModal;

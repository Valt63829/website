function Summary({ transactions }) {
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
    <>
      <div className="balance">₹{balance}</div>

      <div className="summary">
        <div>
          <h4>Income</h4>
          <p className="income">₹{income}</p>
        </div>
        <div>
          <h4>Expense</h4>
          <p className="expense">₹{Math.abs(expense)}</p>
        </div>
      </div>

      {/* 🔥 Monthly Status */}
      <div style={{ marginTop: "15px", textAlign: "center" }}>
        {balance >= 0 ? (
          <p style={{ color: "#00ffb3" }}>
            ✅ You are safe this month! Savings: ₹{balance}
          </p>
        ) : (
          <p style={{ color: "#ff4d6d" }}>
            ⚠ You need ₹{incomeNeeded} more income to balance this month
          </p>
        )}
      </div>
    </>
  );
}

export default Summary;

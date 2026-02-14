function MonthlyHistory({ allTransactions }) {
  const months = Object.keys(allTransactions);

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>📜 Monthly History</h3>

      {months.map((month) => {
        const amounts = allTransactions[month].map(t => t.amount);

        const income = amounts
          .filter(a => a > 0)
          .reduce((a, b) => a + b, 0);

        const expense = amounts
          .filter(a => a < 0)
          .reduce((a, b) => a + b, 0);

        const balance = income + expense;

        return (
          <div
            key={month}
            style={{
              marginTop: "8px",
              padding: "10px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.08)"
            }}
          >
            <strong>{month}</strong>
            <div style={{ fontSize: "13px" }}>
              Income: ₹{income} | Expense: ₹{Math.abs(expense)} | Balance: ₹{balance}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MonthlyHistory;

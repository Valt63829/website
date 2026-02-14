function Balance({ transactions }) {
  const amounts = transactions.map(t => t.amount);

  const total = amounts.reduce((acc, item) => acc + item, 0);

  const income = amounts
    .filter(item => item > 0)
    .reduce((acc, item) => acc + item, 0);

  const expense = amounts
    .filter(item => item < 0)
    .reduce((acc, item) => acc + item, 0);

  return (
    <>
      <h3>Your Balance</h3>
      <div className="balance">₹{total}</div>

      <div className="inc-exp-container">
        <div>
          <h4>Income</h4>
          <p className="money plus">₹{income}</p>
        </div>
        <div>
          <h4>Expense</h4>
          <p className="money minus">₹{expense}</p>
        </div>
      </div>
    </>
  );
}

export default Balance;

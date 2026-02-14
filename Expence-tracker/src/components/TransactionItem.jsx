function TransactionItem({ transaction, deleteTransaction }) {
  return (
    <li>
      {transaction.text}
      <span>
        ₹{transaction.amount}
        <button onClick={() => deleteTransaction(transaction.id)}> ❌</button>
      </span>
    </li>
  );
}

export default TransactionItem;

import TransactionItem from "./TransactionItem";

function TransactionList({ transactions, deleteTransaction }) {
  return (
    <ul className="list">
      {transactions.map((t) => (
        <TransactionItem
          key={t.id}
          transaction={t}
          deleteTransaction={deleteTransaction}
        />
      ))}
    </ul>
  );
}

export default TransactionList;

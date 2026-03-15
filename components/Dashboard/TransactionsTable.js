export default function TransactionsTable({ transactions }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Recent Transactions
      </h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-green-50 text-green-700">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">Date</th>
              <th className="py-3 px-4 text-left font-semibold">Description</th>
              <th className="py-3 px-4 text-left font-semibold">Type</th>
              <th className="py-3 px-4 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => (
              <tr
                key={i}
                className="border-t border-gray-100 hover:bg-green-50 transition"
              >
                <td className="py-3 px-4">{tx.date}</td>
                <td className="py-3 px-4">{tx.description}</td>
                <td className="py-3 px-4">{tx.type}</td>
                <td
                  className={`py-3 px-4 text-right font-semibold ${
                    tx.amount.includes("+")
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {tx.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function DataTable({ columns, rows, loading, renderActions }) {
  const span = columns.length + (renderActions ? 1 : 0)

  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-semibold">
                {c.label}
              </th>
            ))}
            {renderActions && (
              <th className="px-4 py-3 text-right font-semibold print:hidden">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading && (
            <tr>
              <td colSpan={span} className="px-4 py-8 text-center text-slate-400">
                Loading…
              </td>
            </tr>
          )}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={span} className="px-4 py-8 text-center text-slate-400">
                No records found.
              </td>
            </tr>
          )}
          {!loading &&
            rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3">
                    {c.render ? c.render(row) : row[c.key] ?? '—'}
                  </td>
                ))}
                {renderActions && (
                  <td className="px-4 py-3 text-right print:hidden">{renderActions(row)}</td>
                )}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
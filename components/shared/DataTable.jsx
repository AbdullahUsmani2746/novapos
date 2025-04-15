export default function DataTable({ data, fields, onEdit, onDelete }) {
    return (
      <table className="w-full border mt-4">
        <thead>
          <tr>
            {fields.map((field) => (
              <th key={field} className="border px-2 py-1 text-left">{field}</th>
            ))}
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              {fields.map((field) => (
                <td key={field} className="border px-2 py-1">{item[field]}</td>
              ))}
              <td className="border px-2 py-1 space-x-2">
                <button onClick={() => onEdit(item)} className="text-blue-600">Edit</button>
                <button onClick={() => onDelete(item.id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }
  
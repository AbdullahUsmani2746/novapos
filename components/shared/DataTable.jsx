import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

const DataTable = ({ data = [], fields = [], onEdit = () => {}, onDelete = () => {} }) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  // Function to format date without moment dependency
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="overflow-hidden rounded-lg shadow-md border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              {fields?.map((field) => (
                <th 
                  key={field.label || field.name} 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                >
                  {field.label || field.name}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={fields.length + 1} 
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data?.map((item) => (
                <tr 
                  key={item.id || Math.random().toString(36)}
                  className={`${
                    hoveredRow === item.id ? 'bg-blue-50' : ''
                  } transition-colors duration-200`}
                  onMouseEnter={() => setHoveredRow(item.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {fields?.map((field) => {
                    let cellContent = '';
                    try {
                      if (field.fieldType === "date" && item[field.name]) {
                        cellContent = formatDate(item[field.name]);
                      } else if (field.relationName && item[field.relation]) {
                        cellContent = item[field.relation][field.relationName] || '';
                      } else {
                        cellContent = item[field.name] || '';
                      }
                    } catch (e) {
                      cellContent = '';
                    }
                    
                    return (
                      <td 
                        key={field.label || field.name} 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => onEdit(item)} 
                      className="inline-flex items-center text-blue-600 hover:text-blue-900 mr-3 transition-colors"
                    >
                      <Pencil size={16} className="mr-1" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(item.id || item)}
                      className="inline-flex items-center text-red-600 hover:text-red-900 transition-colors"
                    >
                      <Trash2 size={16} className="mr-1" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
              {fields?.map((field) => (
                <th 
                  key={field.label || field.name} 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  {field.label || field.name}
                </th>
              ))}
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={fields.length + 1} 
                  className="px-6 py-8 text-center text-sm text-gray-500 bg-gray-50"
                >
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p className="font-medium">No data available</p>
                  </div>
                </td>
              </tr>
            ) : (
              data?.map((item) => (
                <tr 
                  key={item.id || Math.random().toString(36)}
                  className={`${
                    hoveredRow === item.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  } transition-all duration-200`}
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
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700"
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button 
                        onClick={() => onEdit(item)} 
                        className="inline-flex items-center rounded-full px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200"
                      >
                        <Pencil size={14} className="mr-1" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => onDelete(item.id || item)}
                        className="inline-flex items-center rounded-full px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200"
                      >
                        <Trash2 size={14} className="mr-1" />
                        <span>Delete</span>
                      </button>
                    </div>
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
import { useState } from 'react';

export default function Form({ fields, onSubmit, initialData = {}, submitLabel = 'Submit' }) {
  const [formData, setFormData] = useState(initialData || {}); // Ensure formData is always an object

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({}); 
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mb-4">
      {fields.map((field) => {
        return (
          <div key={field.name}>
            {field.fieldType === 'text' && (
              <input
                name={field.name}
                placeholder={field.label || field.name}
                value={formData?.[field.name] || ''}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
            )}
  
            {field.fieldType === 'select' && (
              <select
                name={field.name}
                value={formData?.[field.name] || ''}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              >
                <option value="">Select {field.label || field.name}</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        );
      })}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        {submitLabel}
      </button>
    </form>
  );
  
}
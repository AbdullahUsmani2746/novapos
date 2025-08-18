import { useState, useEffect } from "react";
import Modal from "./Modal";
import axios from "axios";

const EditModal = ({ title, fields, initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState({});
   const [relationData, setRelationData] = useState({});

  useEffect(() => {
    // Fetch data for relation fields
    const fetchRelationData = async () => {
      const relationDataObj = {};
      
      for (const field of fields) {
        if (field.fieldType === "select" && field.fetchFrom) {
          try {
            const response = await axios.get(field.fetchFrom);
            const data = await response.data.data;
            console.log(field.name);
            relationDataObj[field.name] = data;
          } catch (error) {
            console.error(`Error fetching relation data for ${field.name}:`, error);
          }
        }
      }
      
      setRelationData(relationDataObj);
    };

    fetchRelationData();
  }, [fields]);

  useEffect(() => {
    setFormData(initialData || {});
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }

      if (field.fieldType === "number" && formData[field.name]) {
        if (isNaN(Number(formData[field.name]))) {
          newErrors[field.name] = `${field.label} must be a number`;
        }
      }
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-1">
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-white"
            >
              {field.label?.charAt(0).toUpperCase() + field.label.slice(1)}
            </label>

            {field.fieldType === "text" && (
              <input
                type="text"
                id={field.name}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                className="border p-2 w-full rounded bg-secondary"
              />
            )}

            {field.fieldType === "number" && (
              <input
                type="number"
                id={field.name}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                className="border p-2 w-full rounded bg-secondary"
              />
            )}

            {field.fieldType === "date" && (
              <input
                type="date"
                id={field.name}
                name={field.name}
                value={formData[field.name]?.slice(0, 10) || ""}
                onChange={handleChange}
                className="border p-2 w-full rounded bg-secondary"
              />
            )}

              {field.fieldType === "select" && (
              <select
                id={field.name}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                className="border p-2 w-full rounded bg-secondary"
                required={field.required}
              >
                <option value="">Select {field.label}</option>
                {field.options && Array.isArray(field.options) ? (
                  // For static options
                  field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))
                ) : (
                  // For relation options fetched from API
                  relationData[field.name]?.map((item) => (
                    <option 
                      key={item[field.optionValueKey]} 
                      value={item[field.optionValueKey]}
                    >
                      {item[field.optionLabelKey]}
                    </option>
                  ))
                )}
              </select>
            )}
             {errors[field.name] && (
              <p className="text-red-500 text-sm">{errors[field.name]}</p>
            )}
          </div>
        ))}

        <div className="flex space-x-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-secondary text-primary px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-secondary text-primary px-4 py-2 rounded"
          >
            Update
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditModal;

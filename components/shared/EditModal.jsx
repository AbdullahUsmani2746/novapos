import { useState, useEffect } from "react";
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
            console.error(
              `Error fetching relation data for ${field.name}:`,
              error
            );
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

      if (field.fieldType === "email" && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = `Please enter a valid email address`;
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

  const inputBaseClasses =
    "w-full px-4 py-3 rounded-xl border-2 bg-white backdrop-blur-sm text-black placeholder-gray-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 ";
  const errorInputClasses =
    "border-red-400 focus:border-red-400 focus:ring-red-400/30";
  const normalInputClasses = "border-white/20";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-primary backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 flex items-center justify-center group"
            >
              <span className="text-white/70 group-hover:text-white text-lg">
                ×
              </span>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {Array.isArray(fields) &&
              fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-semibold text-white/90 mb-2"
                  >
                    {field.label?.charAt(0).toUpperCase() +
                      field.label.slice(1)}
                    {field.required && (
                      <span className="text-red-400 ml-1 text-lg">*</span>
                    )}
                  </label>

                  <div className="relative">
                    {field.fieldType === "text" && (
                      <input
                        type="text"
                        id={field.name}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className={`${inputBaseClasses} ${
                          errors[field.name]
                            ? errorInputClasses
                            : normalInputClasses
                        }`}
                        required={field.required}
                      />
                    )}

                    {field.fieldType === "email" && (
                      <input
                        type="email"
                        id={field.name}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className={`${inputBaseClasses} ${
                          errors[field.name]
                            ? errorInputClasses
                            : normalInputClasses
                        }`}
                        required={field.required}
                      />
                    )}

                    {field.fieldType === "number" && (
                      <input
                        type="number"
                        id={field.name}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className={`${inputBaseClasses} ${
                          errors[field.name]
                            ? errorInputClasses
                            : normalInputClasses
                        }`}
                        required={field.required}
                      />
                    )}

                    {field.fieldType === "date" && (
                      <input
                        type="date"
                        id={field.name}
                        name={field.name}
                        value={formData[field.name]?.slice(0, 10) || ""}
                        onChange={handleChange}
                        className={`${inputBaseClasses} ${
                          errors[field.name]
                            ? errorInputClasses
                            : normalInputClasses
                        } [color-scheme:dark]`}
                        required={field.required}
                      />
                    )}

                    {field.fieldType === "select" && (
                      <select
                        id={field.name}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        className={`${inputBaseClasses} ${
                          errors[field.name]
                            ? errorInputClasses
                            : normalInputClasses
                        } cursor-pointer`}
                        required={field.required}
                      >
                        <option value="" className="bg-secondary text-white/70">
                          Select {field.label}
                        </option>
                        {field.options && Array.isArray(field.options)
                          ? // For static options
                            field.options?.map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                                className="bg-secondary text-white"
                              >
                                {option.label}
                              </option>
                            ))
                          : // For relation options fetched from API
                            relationData[field.name]?.map((item) => (
                              <option
                                key={item[field.optionValueKey]}
                                value={item[field.optionValueKey]}
                                className="bg-secondary text-white"
                              >
                                {item[field.optionLabelKey]}
                              </option>
                            ))}
                      </select>
                    )}

                    {errors[field.name] && (
                      <div className="flex items-center mt-2 space-x-2">
                        <div className="w-4 h-4 rounded-full bg-red-400 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            !
                          </span>
                        </div>
                        <p className="text-red-400 text-sm font-medium">
                          {errors[field.name]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

            <div className="flex space-x-4 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold 
                           transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] 
                           active:scale-[0.98] backdrop-blur-sm border border-white/20
                           hover:border-white/30 focus:outline-none focus:ring-2 
                           focus:ring-white/30"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-white/20 to-white/30 
                           text-white font-semibold transition-all duration-300 
                           hover:from-white/30 hover:to-white/40 hover:scale-[1.02] 
                           active:scale-[0.98] backdrop-blur-sm border border-white/30
                           hover:border-white/40 focus:outline-none focus:ring-2 
                           focus:ring-white/40 shadow-lg hover:shadow-xl"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditModal;

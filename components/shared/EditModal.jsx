import { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  DollarSign,
  Building,
  CreditCard,
} from "lucide-react";

const EditModal = ({ title, fields, initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState({});
  const [relationData, setRelationData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors = {};

    fields.forEach((field) => {
      if (
        ["bankId", "accountName", "accountNumber"].includes(field.name) &&
        formData.paymentMethod === "CASH"
      ) {
        return;
      }

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
      setIsSubmitting(false);
      return;
    }

    try {
      setErrors({});
      await onSubmit(formData);
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get icon for field type
  const getFieldIcon = (fieldType, fieldName) => {
    const iconProps = { size: 18, className: "text-gray-400" };

    if (fieldName.includes("email") || fieldType === "email")
      return <Mail {...iconProps} />;
    if (fieldName.includes("phone")) return <Phone {...iconProps} />;
    if (fieldName.includes("date") || fieldType === "date")
      return <Calendar {...iconProps} />;
    if (fieldName.includes("location") || fieldName.includes("department"))
      return <MapPin {...iconProps} />;
    if (
      fieldName.includes("rate") ||
      fieldName.includes("pay") ||
      fieldName.includes("account")
    )
      return <DollarSign {...iconProps} />;
    if (fieldName.includes("bank") || fieldName.includes("cost"))
      return <Building {...iconProps} />;
    if (fieldName.includes("payment")) return <CreditCard {...iconProps} />;
    return <User {...iconProps} />;
  };

  // Check if this is employee modal
  const isEmployeeModal = title.toLowerCase().includes("employee");

  // Group fields into sections (only for employee)
  const personalFields = isEmployeeModal
    ? fields.filter((field) =>
        [
          "firstName",
          "surname",
          "dob",
          "gender",
          "phoneNumber",
          "emailAddress",
        ].includes(field.name)
      )
    : [];

  const workFields = isEmployeeModal
    ? fields.filter((field) =>
        [
          "hireDate",
          "jobTitleId",
          "departmentId",
          "workLocationId",
          "managerId",
          "status",
          "costCenterId",
        ].includes(field.name)
      )
    : [];

  const paymentFields = isEmployeeModal
    ? fields.filter((field) =>
        [
          "paymentMethod",
          "bankId",
          "accountName",
          "accountNumber",
          "payType",
          "rate",
          "payFrequency",
        ].includes(field.name)
      )
    : [];

  const renderField = (field) => {
    if (
      ["bankId", "accountName", "accountNumber"].includes(field.name) &&
      formData.paymentMethod === "CASH"
    ) {
      return null;
    }

    const hasError = errors[field.name];
    const inputClasses = `
      w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-300 
      text-gray-900 placeholder-gray-500 bg-gray-50/50 backdrop-blur-sm
      focus:outline-none focus:ring-primary focus:border-primary
      hover:border-gray-300 hover:bg-white/70
      ${
        hasError
          ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-500/20"
          : "border-gray-200"
      }
    `;

    return (
      <div key={field.name} className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {field.label?.charAt(0).toUpperCase() + field.label.slice(1)}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
            {getFieldIcon(field.fieldType, field.name)}
          </div>

          {field.fieldType === "text" && (
            <input
              type="text"
              id={field.name}
              name={field.name}
              value={formData[field.name] || ""}
              onChange={handleChange}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              className={inputClasses}
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
              className={inputClasses}
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
              className={inputClasses}
              required={field.required}
              step="0.01"
            />
          )}

          {field.fieldType === "date" && (
            <input
              type="date"
              id={field.name}
              name={field.name}
              value={formData[field.name]?.slice(0, 10) || ""}
              onChange={handleChange}
              className={`${inputClasses} [color-scheme:light]`}
              required={field.required}
            />
          )}

          {field.fieldType === "select" && (
            <select
              id={field.name}
              name={field.name}
              value={formData[field.name] || ""}
              onChange={handleChange}
              className={`${inputClasses} cursor-pointer`}
              required={field.required}
            >
              <option value="" className="text-gray-500">
                Select {field.label}
              </option>
              {field.options && Array.isArray(field.options)
                ? // For static options
                  field.options?.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="text-gray-900"
                    >
                      {option.label}
                    </option>
                  ))
                : // For relation options fetched from API
                  relationData[field.name]?.map((item) => (
                    <option
                      key={item[field.optionValueKey]}
                      value={item[field.optionValueKey]}
                      className="text-gray-900"
                    >
                      {item[field.optionLabelKey]}
                    </option>
                  ))}
            </select>
          )}

          {hasError && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
          )}
        </div>

        {hasError && (
          <p className="mt-2 text-sm text-red-600 font-medium flex items-center">
            <span className="mr-1">⚠</span>
            {errors[field.name]}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-3xl shadow-2xl w-full overflow-hidden border border-gray-200 ${
          isEmployeeModal ? "max-w-5xl max-h-[95vh]" : "max-w-md max-h-[90vh]"
        }`}
      >
        {/* Header */}
        <div className="bg-primary px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <p className="text-white mt-1">Update the information below</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 flex items-center justify-center group backdrop-blur-sm"
            >
              <X
                className="text-white group-hover:rotate-90 transition-transform duration-300"
                size={20}
              />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className={
            isEmployeeModal
              ? "max-h-[calc(95vh-140px)] overflow-y-auto"
              : "max-h-[calc(90vh-140px)] overflow-y-auto"
          }
        >
          <div className="p-8 space-y-4">
            {isEmployeeModal ? (
              <>
                {/* Personal Information Section */}
                {personalFields.length > 0 && (
                  <div className="rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <User size={20} className="mr-2 text-blue-600" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {personalFields.map(renderField)}
                    </div>
                  </div>
                )}

                {/* Work Information Section */}
                {workFields.length > 0 && (
                  <div className="rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Building size={20} className="mr-2 text-green-600" />
                      Work Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {workFields.map(renderField)}
                    </div>
                  </div>
                )}

                {/* Payment Information Section */}
                {paymentFields.length > 0 && (
                  <div className="bg-purple-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <DollarSign size={20} className="mr-2 text-purple-600" />
                      Payment Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {paymentFields.map(renderField)}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-6">
                {Array.isArray(fields) && fields.map(renderField)}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50/50 px-8 py-4">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl bg-secondary text-primary font-semibold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl bg-primary text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModal;

  "use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Package,
  Settings,
  Calendar,
  BarChart3,
  FileText,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  AlertCircle,
  Check,
} from "lucide-react";
import { useBOM } from "@/hooks/useBOM";
import { useProductionPlans } from "@/hooks/useProduction";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [notification, setNotification] = useState(null);

  // Sample BOM data with more realistic entries
  const {
    bomItems,
    items: finishItems,
    loading: bomLoading,
    error: bomError,
    createBOM: createBOMAPI,
    updateBOM: updateBOMAPI,
    deleteBOM: deleteBOMAPI,
  } = useBOM();

  const {
    productionPlans,
    loading: productionLoading,
    error: productionError,
    createProductionPlan: createProductionPlanAPI,
    updateProductionPlan: updateProductionPlanAPI,
    deleteProductionPlan: deleteProductionPlanAPI,
  } = useProductionPlans();

  const [materialItems, setMaterialItems] = useState([]);
  // Form states
  const [bomForm, setBomForm] = useState({
    finishedId: "",
    category: "Finished",
    materials: [],
  });

  const [productionForm, setProductionForm] = useState({
    finishedId: "",
    productName: "",
    date: "",
    qty: 0,
    materialRequirements: [],
  });

  const [materialInput, setMaterialInput] = useState({
    id: "",
    name: "",
    percentage: 0,
  });

  // Auto-populate production form when finished ID changes
  useEffect(() => {
    if (productionForm.finishedId) {
      const bom = bomItems.find(
        (b) => b.finishedId === productionForm.finishedId
      );
      if (bom && productionForm.qty > 0) {
        const materialRequirements = bom.materials.map((mat) => ({
          name: mat.name,
          percentage: mat.percentage,
          required: (productionForm.qty * mat.percentage) / 100,
        }));
        setProductionForm((prev) => ({
          ...prev,
          productName: bom.productName,
          materialRequirements,
        }));
      }
    }
  }, [productionForm.finishedId, productionForm.qty, bomItems]);
  
 // 5. Add error handling in render
  if (bomError || productionError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600">{bomError || productionError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Notification system
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Generate unique IDs
  const generateId = (prefix) => {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0");
    return `${prefix}${timestamp}${random}`;
  };

  // BOM Operations
  const createBOM = async () => {
    if (
      !bomForm.finishedId ||
      bomForm.materials.length === 0
    ) {
      showNotification(
        "Please fill all required fields and add at least one material",
        "error"
      );
      return;
    }

    const totalPercentage = bomForm.materials.reduce(
      (sum, mat) => sum + mat.percentage,
      0
    );
    if (totalPercentage !== 100) {
      showNotification("Material percentages must add up to 100%", "error");
      return;
    }

    const result = await createBOMAPI({
      ...bomForm,
      status: "Active",
    });

    if (result.success) {
      resetBOMForm();
      closeModal();
      showNotification("BOM created successfully!");
    } else {
      showNotification(result.error || "Failed to create BOM", "error");
    }
  };

  const updateBOM = async () => {
    console.log("Updating BOM: ", bomForm);
    if (
      !bomForm.finishedId ||
      // !bomForm.productName ||
      bomForm.materials.length === 0
    ) {
      showNotification(
        "Please fill all required fields and add at least one material",
        "error"
      );
      return;
    }

    const totalPercentage = bomForm.materials.reduce(
      (sum, mat) => sum + mat.percentage,
      0
    );
    if (totalPercentage !== 100) {
      showNotification("Material percentages must add up to 100%", "error");
      return;
    }

    const result = await updateBOMAPI(editingItem.finishedId, bomForm);

    if (result.success) {
      resetBOMForm();
      closeModal();
      showNotification("BOM updated successfully!");
    } else {
      showNotification(result.error || "Failed to update BOM", "error");
    }
  };

  const deleteBOM = async (id) => {
    if (window.confirm("Are you sure you want to delete this BOM?")) {
      const result = await deleteBOMAPI(id);

      if (result.success) {
        showNotification("BOM deleted successfully!");
        bomItems.filter((b) => b.finishedId !== id);

      } else {
        showNotification(result.error || "Failed to delete BOM", "error");
      }
    }
  };

  // Production Plan Operations
  const createProductionPlan = async () => {
    if (
      !productionForm.finishedId ||
      !productionForm.date ||
      productionForm.qty <= 0
    ) {
      showNotification("Please fill all required fields", "error");
      return;
    }

    // Find BOM to calculate material requirements
    const bom = bomItems.find(
      (b) => b.finishedId === productionForm.finishedId
    );
    const materialRequirements = bom
      ? bom.materials.map((mat) => ({
          name: mat.name,
          percentage: mat.percentage,
          required: (productionForm.qty * mat.percentage) / 100,
        }))
      : [];

    const planData = {
      ...productionForm,
      productName: bom?.productName || productionForm.productName,
      status: "Scheduled",
      materialRequirements,
    };

    const result = await createProductionPlanAPI(planData);

    if (result.success) {
      resetProductionForm();
      closeModal();
      showNotification("Production plan created successfully!");
    } else {
      showNotification(
        result.error || "Failed to create production plan",
        "error"
      );
    }
  };

  const updateProductionPlan = async () => {
    if (
      !productionForm.finishedId ||
      !productionForm.date ||
      productionForm.qty <= 0
    ) {
      showNotification("Please fill all required fields", "error");
      return;
    }

    const bom = bomItems.find(
      (b) => b.finishedId === productionForm.finishedId
    );
    const materialRequirements = bom
      ? bom.materials.map((mat) => ({
          name: mat.name,
          percentage: mat.percentage,
          required: (productionForm.qty * mat.percentage) / 100,
        }))
      : productionForm.materialRequirements;

    const planData = {
      ...productionForm,
      materialRequirements,
      productName: bom?.productName || productionForm.productName,
    };

    const result = await updateProductionPlanAPI(editingItem.id, planData);

    if (result.success) {
      resetProductionForm();
      closeModal();
      showNotification("Production plan updated successfully!");
    } else {
      showNotification(
        result.error || "Failed to update production plan",
        "error"
      );
    }
  };

  const deleteProductionPlan = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this production plan?")
    ) {
      const result = await deleteProductionPlanAPI(id);

      if (result.success) {
        showNotification("Production plan deleted successfully!");
      } else {
        showNotification(
          result.error || "Failed to delete production plan",
          "error"
        );
      }
    }
  };

  // Form helpers
  const resetBOMForm = () => {
    setBomForm({
      finishedId: "",
      productName: "",
      category: "Finished",
      materials: [],
    });
    setMaterialInput({ id: "", name: "", percentage: 0 });
  };

  const resetProductionForm = () => {
    setProductionForm({
      finishedId: "",
      productName: "",
      date: "",
      qty: 0,
      materialRequirements: [],
    });
  };

  const addMaterial = () => {
    if (
      !materialInput.id ||
      !materialInput.name ||
      materialInput.percentage <= 0
    ) {
      showNotification("Please fill all material fields", "error");
      return;
    }

    console.log("Adding material: ", materialInput);

    

    // const currentTotal = 0
    const currentTotal = bomForm.materials?.reduce(
      (sum, mat) => sum + mat.percentage,
      0
    );
    if (currentTotal + materialInput.percentage > 100) {
      showNotification("Total percentage cannot exceed 100%", "error");
      return;
    }

    setBomForm({
  ...bomForm,
  materials: [
    ...(bomForm.materials || []),  // if undefined, fallback to empty array
    { ...materialInput }
  ],
});
    setMaterialInput({ id: "", name: "", percentage: 0 });
  };

  const removeMaterial = (index) => {
    setBomForm({
      ...bomForm,
      materials: bomForm.materials.filter((_, i) => i !== index),
    });
  };

  // Modal handlers
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);

    if (type === "bom") {
      if (item) {
        setBomForm({
          finishedId: item.finishedId,
          // productName: item.productName,
          category: item.category,
          materials: [...item.materials],
        });
      } else {
        resetBOMForm();
      }
    } else if (type === "production") {
      if (item) {
        setProductionForm({
          finishedId: item.finishedId,
          // productName: item.productName,
          date: item.date,
          qty: item.qty,
          materialRequirements: item.materialRequirements,
        });
      } else {
        resetProductionForm();
      }
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setEditingItem(null);
    resetBOMForm();
    resetProductionForm();
  };

  const isLoading = bomLoading || productionLoading;

 
  // 6. Add loading spinner to tables
  const LoadingSpinner = () => (
    <tr className="flex items-center justify-center py-8">
      <td className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></td>
      <td className="ml-2 text-gray-600">Loading...</td>
    </tr>
  );

  // Filter functions
  const filteredBomItems = bomItems?.filter((item) => {
    const matchesSearch = 
      // item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.finishedId.toString().toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterStatus || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredProductionPlans = productionPlans?.filter((plan) => {
    const matchesSearch =
      plan.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterStatus || plan.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  

  // Component definitions
  const NavButton = ({ icon: Icon, label, tabKey, count }) => (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full text-left ${
        activeTab === tabKey
          ? "bg-blue-600 text-white shadow-lg"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
      {count !== undefined && (
        <span
          className={`ml-auto px-2 py-1 rounded-full text-xs font-semibold ${
            activeTab === tabKey
              ? "bg-white text-blue-600"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  const ActionButton = ({
    icon: Icon,
    label,
    onClick,
    variant = "primary",
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        variant === "primary"
          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
          : variant === "secondary"
          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
          : variant === "danger"
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "bg-green-100 text-green-700 hover:bg-green-200"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  const Card = ({ children, className = "" }) => (
    <div
      className={`bg-white rounded-xl shadow-md border border-gray-200 ${className}`}
    >
      {children}
    </div>
  );

  const StatusBadge = ({ status }) => (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        status === "Active" || status === "Scheduled"
          ? "bg-green-100 text-green-800"
          : status === "In Progress"
          ? "bg-blue-100 text-blue-800"
          : status === "Completed"
          ? "bg-purple-100 text-purple-800"
          : "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );

  const Notification = ({ message, type }) => (
    <div
      className={`fixed top-[36%] right-[45%] p-4 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
        type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
      }`}
    >
      {type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );

  const BOMForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Product Category
          </label>
          <select
            value={bomForm.category}
            onChange={(e) =>
              setBomForm({ ...bomForm, category: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Raw Material">Raw Material</option>
            <option value="Semi Finished">Semi Finished</option>
            <option value="Finished">Finished</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Finished Product
          </label>
           <select
            value={bomForm.finishedId}
            onChange={(e) =>
              setBomForm({
                ...bomForm,
                finishedId: e.target.value,
              })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
             <option value="">Select Product</option>
            {finishItems?.map((bom) => (
              <option key={bom.itcd} value={bom.itcd}>
                {bom.itcd} - {bom.item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-4">Materials Required</h4>

        {/* Add Material Form */}
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
             <select
            value={materialInput.id}
            onChange={(e) =>
              setMaterialInput({ ...materialInput, id: e.target.value, name: e.target.options[e.target.selectedIndex].text })

            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >

            <option value="">Select Material</option>
            {finishItems?.map((bom) => (
              <option key={bom.itcd} value={bom.itcd}>
                {bom.item}
              </option>
            ))}
          </select>
            
            <input
              type="number"
              value={materialInput.percentage}
              onChange={(e) =>
    setMaterialInput({
      ...materialInput,
      percentage:parseFloat(e.target.value) || 0, // keep as string for now
    })
  }

              placeholder="Percentage %"
              min="0"
              max="100"
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={addMaterial}
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              Add Material
            </button>
          </div>
        </div>

        {/* Materials List */}
        {bomForm.materials && (
          <div className="space-y-2">
            <h5 className="font-medium text-gray-700">Added Materials:</h5>
            {bomForm.materials.map((material, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded border"
              >
                <div className="flex-1">
                  <span className="font-medium">{material.id}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    ({material.name})
                  </span>
                  <span className="text-sm text-gray-600 ml-2">
                    - {material.percentage}%
                  </span>
                </div>
                <button
                  onClick={() => removeMaterial(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <div className="text-sm text-gray-600 mt-2">
              Total:{" "}
              {bomForm.materials.reduce((sum, mat) => sum + mat.percentage, 0)}%
              (Must equal 100%)
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const ProductionPlanForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Plan Date
          </label>
          <input
            type="date"
            value={productionForm.date}
            onChange={(e) =>
              setProductionForm({ ...productionForm, date: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Finished Product ID
          </label>
          <select
            value={productionForm.finishedId}
            onChange={(e) =>
              setProductionForm({
                ...productionForm,
                finishedId: e.target.value,
              })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            
            <option value="">Select Product ID</option>
            {bomItems.map((bom) => (
              <option key={bom.finishedId} value={bom.finishedId}>
                {bom.finishedId} - {bom.productName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Production Quantity
        </label>
        <input
          type="number"
          value={productionForm.qty}
          onChange={(e) =>
            setProductionForm({
              ...productionForm,
              qty: parseInt(e.target.value) || 0,
            })
          }
          placeholder="Enter quantity to produce"
          min="1"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {productionForm.materialRequirements.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-4">
            Material Requirements (Auto-calculated)
          </h4>
          <div className="space-y-2">
            {productionForm.materialRequirements.map((material, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-white rounded border"
              >
                <span className="font-medium">{material.name}</span>
                <span className="text-sm text-gray-600">
                  {material.percentage}% - {material.required} units
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const Modal = ({ isOpen, onClose, title, children, onSave }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-49">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="p-6">{children}</div>
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              {editingItem ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <Notification message={notification.message} type={notification.type} />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Package className="text-blue-600" size={28} />
              <h1 className="text-xl font-bold text-gray-900">
                Manufacturing Hub
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products, plans..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <Card className="p-6">
              <nav className="space-y-2">
                <NavButton
                  icon={BarChart3}
                  label="Dashboard"
                  tabKey="dashboard"
                />
                <NavButton
                  icon={Package}
                  label="Bill of Materials"
                  tabKey="bom"
                  count={bomItems.length}
                />
                <NavButton
                  icon={Calendar}
                  label="Production Plans"
                  tabKey="production"
                  count={productionPlans.length}
                />
                <NavButton
                  icon={Settings}
                  label="Product Categories"
                  tabKey="categories"
                />
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9">
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Total BOMs
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {bomItems.length}
                        </p>
                      </div>
                      <FileText className="text-blue-600" size={32} />
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Production Plans
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {productionPlans.length}
                        </p>
                      </div>
                      <Calendar className="text-green-600" size={32} />
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Active BOMs
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {bomItems.filter((b) => b.status === "Active").length}
                        </p>
                      </div>
                      <Check className="text-purple-600" size={32} />
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Draft BOMs
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {bomItems.filter((b) => b.status === "Draft").length}
                        </p>
                      </div>
                      <AlertCircle className="text-red-600" size={32} />
                    </div>
                  </Card>
                </div>
                {/* Recent Activities */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Recent Activities
                  </h3>
                  <p className="text-sm text-gray-600">
                    No recent activities to display.
                  </p>
                </Card>
              </div>
            )}
            {activeTab === "bom" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Bill of Materials
                  </h2>
                  <ActionButton
                    icon={Plus}
                    label="New BOM"
                    onClick={() => openModal("bom")}
                    variant="primary"
                  />
                </div>
                <Card>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          BOM ID
                        </th> */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Finished ID
                        </th>
                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product Name
                        </th> */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoading ? (
                        <LoadingSpinner />
                      ) : filteredBomItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                          >
                            No BOMs found.
                          </td>
                        </tr>
                      ) : (
                        filteredBomItems.map((item) => (
                          <tr key={item.finishedId}>
                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.finishedId}
                            </td> */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.finishedId}
                            </td>
                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.productName}
                            </td> */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.dateCreated}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={item.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                              <button
                                onClick={() => openModal("bom", item)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteBOM(item.finishedId)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </Card>
              </div>
            )}
            {activeTab === "production" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Production Plans
                  </h2>
                  <ActionButton
                    icon={Plus}
                    label="New Plan"
                    onClick={() => openModal("production")}
                    variant="primary"
                  />
                </div>
                <Card>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plan ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Finished ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoading ? (
                        <LoadingSpinner />
                      ) : filteredProductionPlans.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                          >
                            No BOMs found.
                          </td>
                        </tr>
                      ) : (
                        filteredProductionPlans.map((plan) => (
                          <tr key={plan.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {plan.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {plan.finishedId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {plan.productName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {plan.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {plan.qty}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={plan.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                              <button
                                onClick={() => openModal("production", plan)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteProductionPlan(plan.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </Card>
              </div>
            )}
            {activeTab === "categories" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Product Categories
                </h2>
                <Card className="p-6">
                  <p className="text-sm text-gray-600">
                    Category management functionality is not implemented yet.
                  </p>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={
          modalType === "bom"
            ? editingItem
              ? "Edit BOM"
              : "New BOM"
            : editingItem
            ? "Edit Production Plan"
            : "New Production Plan"
        }
        onSave={
          modalType === "bom"
            ? editingItem
              ? updateBOM
              : createBOM
            : editingItem
            ? updateProductionPlan
            : createProductionPlan
        }
      >
        {modalType === "bom" ? <BOMForm /> : <ProductionPlanForm />}
      </Modal>
    </div>
  );
};

export default Dashboard;

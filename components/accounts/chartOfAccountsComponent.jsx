"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Info,
  Trash2,
  Search,
  AlertCircle,
  User,
  Mail,
  MapPin,
  Phone,
  Building,
  Edit,
  ChevronDown,
  X,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// Configuration - Easy to modify
const CONFIG = {
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:3000",

  levels: [
    {
      key: "mbscd",
      title: "Main Business",
      codeField: "mbscd",
      nameField: "mbscdDetail",
      padding: 2,
      parentField: null,
    },
    {
      key: "bscd",
      title: "Business Category",
      codeField: "bscd",
      nameField: "bscdDetail",
      padding: 2,
      parentField: "mbscd",
    },
    {
      key: "macno",
      title: "Main Account",
      codeField: "macno",
      nameField: "macname",
      padding: 3,
      parentField: "bscd",
    },
    {
      key: "acno",
      title: "Account",
      codeField: "acno",
      nameField: "acname",
      padding: 4,
      parentField: "macno",
    },
  ],
  endpoints: {
    mbscd: "/api/accounts/mbscd",
    bscd: "/api/accounts/bscd",
    macno: "/api/accounts/macno",
    acno: "/api/accounts/acno",
  },
  accountFields: [
    { name: "acname", label: "Account Name*", icon: User, required: true },
    { name: "bankAccountNo", label: "Bank Account No", icon: Building },
    { name: "address", label: "Address", icon: MapPin },
    { name: "city", label: "City", icon: MapPin },
    { name: "phoneFax", label: "Phone/Fax", icon: Phone },
    { name: "email", label: "Email", icon: Mail },
  ],
};

const ChartOfAccounts = () => {
  // State Management
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    mbscd: [],
    bscd: [],
    macno: [],
    acno: [],
  });
  const [selectedItems, setSelectedItems] = useState({});
  const [searchTerms, setSearchTerms] = useState({});
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState({});
  const [expandedCards, setExpandedCards] = useState({ 0: true });

  // Mock API functions (replace with actual API calls)
  const api = {
    get: async (endpoint, params = {}) => {
      try {
        const response = await axios.get(endpoint, {
          params,
          headers: {
            "Content-Type": "application/json",
            // Add your auth headers here if needed
            // 'Authorization': `Bearer ${getAuthToken()}`,
          },
        });

        return { data: response.data };
      } catch (error) {
        console.error("API GET Error:", error.response?.data || error.message);
        throw new Error(
          error.response?.data?.message || error.message || "Network error"
        );
      }
    },

    post: async (endpoint, data) => {
      try {
        const response = await axios.post(endpoint, data, {
          headers: {
            "Content-Type": "application/json",
            // Add your auth headers here if needed
            // 'Authorization': `Bearer ${getAuthToken()}`,
          },
        });

        return { data: response.data };
      } catch (error) {
        console.error("API POST Error:", error.response?.data || error.message);
        throw new Error(
          error.response?.data?.message || error.message || "Network error"
        );
      }
    },

    put: async (endpoint, data) => {
      try {
        const response = await axios.put(endpoint, data, {
          headers: {
            "Content-Type": "application/json",
            // Add your auth headers here if needed
            // 'Authorization': `Bearer ${getAuthToken()}`,
          },
        });

        return { data: response.data };
      } catch (error) {
        console.error("API PUT Error:", error.response?.data || error.message);
        throw new Error(
          error.response?.data?.message || error.message || "Network error"
        );
      }
    },

    delete: async (endpoint) => {
      try {
        const response = await axios.delete(endpoint, {
          headers: {
            "Content-Type": "application/json",
            // Add your auth headers here if needed
            // 'Authorization': `Bearer ${getAuthToken()}`,
          },
        });

        return { data: response.data };
      } catch (error) {
        console.error(
          "API DELETE Error:",
          error.response?.data || error.message
        );
        throw new Error(
          error.response?.data?.message || error.message || "Network error"
        );
      }
    },
  };

  // Utility Functions
  const showToast = (message, type = "success") => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const validateEmail = (email) => {
    return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const checkDuplicateName = (levelKey, name, excludeCode = null) => {
    const levelData = data[levelKey] || [];
    const nameField = CONFIG.levels.find((l) => l.key === levelKey)?.nameField;
    return levelData.some(
      (item) =>
        item[nameField]?.toLowerCase() === name.toLowerCase() &&
        item[CONFIG.levels.find((l) => l.key === levelKey)?.codeField] !==
          excludeCode
    );
  };

  const getNextCode = (levelKey) => {
    const levelConfig = CONFIG.levels.find((l) => l.key === levelKey);
    const existingCodes =
      data[levelKey]?.map(
        (item) => parseInt(item[levelConfig?.codeField]) || 0
      ) || [];
    const maxCode = existingCodes.length ? Math.max(...existingCodes) : 0;
    return (maxCode + 1).toString().padStart(levelConfig?.padding, "0");
  };

  // Data Fetching
  // Update fetchData function:
  const fetchData = async (levelKey, params = {}) => {
    try {
      setLoading(true);
      const endpoint = CONFIG.endpoints[levelKey];
      const response = await api.get(endpoint, params);
      setData((prev) => ({
        ...prev,
        [levelKey]: response.data.data || response.data,
      }));
    } catch (error) {
      console.error(`Error fetching ${levelKey}:`, error);
      showToast(`Failed to load ${levelKey}: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Update handleCreate function error handling:
  const handleCreate = async (formData) => {
    try {
      setLoading(true);
      const { level, data: itemData } = formData;
      const levelConfig = CONFIG.levels.find((l) => l.key === level);
      const nameField = levelConfig?.nameField;

      // Check for duplicate names
      if (checkDuplicateName(level, itemData[nameField])) {
        showToast(`${itemData[nameField]} already exists`, "error");
        return;
      }

      const code = getNextCode(level);
      const newItem = {
        ...itemData,
        [levelConfig?.codeField]: code,
      };

      // Add parent code if level has a parent
      if (levelConfig?.parentField) {
        const parentLevelConfig = CONFIG.levels.find(
          (l) => l.key === levelConfig.parentField
        );
        console.log("Parent Level Config:", parentLevelConfig);
        if (parentLevelConfig && itemData[parentLevelConfig.codeField]) {
          newItem[parentLevelConfig.codeField] =
            itemData[parentLevelConfig.codeField];
        }
      }

      console.log(newItem);

      await api.post(CONFIG.endpoints[level], newItem);
      setData((prev) => ({
        ...prev,
        [level]: [...prev[level], newItem],
      }));

      showToast(`${levelConfig?.title} created successfully`);
      setActiveModal(null);
    } catch (error) {
      console.error("Create error:", error);
      showToast(`Failed to create item: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const promises = Object.keys(CONFIG.endpoints).map((key) =>
        api.get(CONFIG.endpoints[key])
      );
      const responses = await Promise.all(promises);

      const newData = {};
      Object.keys(CONFIG.endpoints).forEach((key, index) => {
        newData[key] = responses[index].data.data;
      });
      setData(newData);
    } catch (error) {
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      setLoading(true);
      const { level, code, data: itemData } = formData;
      const levelConfig = CONFIG.levels.find((l) => l.key === level);
      const nameField = levelConfig?.nameField;

      // Check for duplicate names (excluding current item)
      if (checkDuplicateName(level, itemData[nameField], code)) {
        showToast(`${itemData[nameField]} already exists`, "error");
        return;
      }

      await api.put(`${CONFIG.endpoints[level]}`, itemData);
      setData((prev) => ({
        ...prev,
        [level]: prev[level].map((item) =>
          item[levelConfig?.codeField] === code
            ? { ...item, ...itemData }
            : item
        ),
      }));

      showToast(`${levelConfig?.title} updated successfully`);
      setActiveModal(null);
    } catch (error) {
      showToast("Failed to update item", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (level, code) => {
    try {
      setLoading(true);
      await api.delete(`${CONFIG.endpoints[level]}?code=${code}`);
      const levelConfig = CONFIG.levels.find((l) => l.key === level);

      setData((prev) => ({
        ...prev,
        [level]: prev[level].filter(
          (item) => item[levelConfig?.codeField] !== code
        ),
      }));

      showToast(`${levelConfig?.title} deleted successfully`);
      setActiveModal(null);
    } catch (error) {
      showToast("Failed to delete item", "error");
    } finally {
      setLoading(false);
    }
  };

  // UI Components
  const FormInput = ({ icon: Icon, error, label, ...props }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        )}
        <Input
          className={`${Icon ? "pl-10" : ""} w-full ${
            error ? "border-red-500 focus:ring-red-500" : "focus:ring-primary"
          }`}
          {...props}
        />
        {error && (
          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );

  const ItemForm = () => {
    const [formData, setFormData] = useState(modalData.item || {});
    const [errors, setErrors] = useState({});
    const isEdit = modalData.mode === "edit";
    const level = modalData.level;
    const levelConfig = CONFIG.levels.find((l) => l.key === level);
    const parentLevelConfig = CONFIG.levels.find(
      (l) => l.key === levelConfig?.parentField
    );

    // Add parent selection field for levels that have parents
    const getParentOptions = () => {
      if (!parentLevelConfig) return [];
      return data[parentLevelConfig.key] || [];
    };

    const validateForm = () => {
      const newErrors = {};
      const nameField = levelConfig?.nameField;

      if (!formData[nameField]?.trim()) {
        newErrors[nameField] = `${levelConfig?.title} name is required`;
      }

      // Validate parent selection for child levels
      if (parentLevelConfig && !formData[parentLevelConfig.codeField]) {
        newErrors[
          parentLevelConfig.codeField
        ] = `${parentLevelConfig.title} selection is required`;
      }

      if (level === "acno") {
        if (!formData.acname?.trim())
          newErrors.acname = "Account name is required";
        if (formData.email && !validateEmail(formData.email)) {
          newErrors.email = "Invalid email format";
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = () => {
      if (!validateForm()) return;

      if (isEdit) {
        handleUpdate({
          level,
          code: modalData.item[levelConfig?.codeField],
          data: formData,
        });
      } else {
        handleCreate({ level, data: formData });
      }
    };

    const fields =
      level === "acno"
        ? CONFIG.accountFields
        : [
            {
              name: levelConfig?.nameField,
              label: `${levelConfig?.title} Name*`,
              icon: Building,
              required: true,
            },
          ];

    return (
      <Dialog
        open={activeModal === "form"}
        onOpenChange={() => setActiveModal(null)}
      >
        <DialogContent className="max-w-md mx-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {isEdit ? "Edit" : "Add"} {levelConfig?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Parent Selection Field */}
            {parentLevelConfig && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {parentLevelConfig.title}*
                </label>
                <select
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors[parentLevelConfig.codeField]
                      ? "border-red-500 focus:ring-red-500"
                      : "focus:ring-primary"
                  }`}
                  value={formData[parentLevelConfig.codeField] || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [parentLevelConfig.codeField]: e.target.value,
                    }))
                  }
                >
                  <option value="">Select {parentLevelConfig.title}</option>
                  {getParentOptions().map((option) => (
                    <option
                      key={option[parentLevelConfig.codeField]}
                      value={option[parentLevelConfig.codeField]}
                    >
                      {option[parentLevelConfig.codeField]} -{" "}
                      {option[parentLevelConfig.nameField]}
                    </option>
                  ))}
                </select>
                {errors[parentLevelConfig.codeField] && (
                  <p className="text-xs text-red-500">
                    {errors[parentLevelConfig.codeField]}
                  </p>
                )}
              </div>
            )}
            {fields.map((field) => (
              <FormInput
                key={field.name}
                icon={field.icon}
                label={field.label}
                placeholder={field.label.replace("*", "")}
                value={formData[field.name] || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    [field.name]: e.target.value,
                  }))
                }
                error={errors[field.name]}
              />
            ))}
          </div>

          <DialogFooter className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setActiveModal(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {isEdit ? "Update" : "Create"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const DeleteConfirm = () => (
    <Dialog
      open={activeModal === "delete"}
      onOpenChange={() => setActiveModal(null)}
    >
      <DialogContent className="max-w-sm mx-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg text-red-600">
            Confirm Delete
          </DialogTitle>
        </DialogHeader>
        <p className="text-gray-600">
          Are you sure you want to delete this item? This action cannot be
          undone.
        </p>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setActiveModal(null)}
            className="flex-1"
          >
            No, Keep it
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDelete(modalData.level, modalData.code)}
            disabled={loading}
            className="flex-1 text-white"
          >
            Yes, Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const LevelCard = ({ levelConfig, index }) => {
    const levelData = data[levelConfig?.key] || [];
    const parentLevelConfig = CONFIG.levels.find(
      (l) => l.key === levelConfig?.parentField
    );

    const filteredData = levelData.filter((item) =>
      item[levelConfig?.nameField]
        ?.toLowerCase()
        .includes((searchTerms[levelConfig?.key] || "").toLowerCase())
    );

    const isExpanded = expandedCards[index];

    const getParentName = (item) => {
      if (!parentLevelConfig) return null;
      const parentItem = data[parentLevelConfig.key]?.find(
        (p) =>
          p[parentLevelConfig.codeField] === item[parentLevelConfig.codeField]
      );
      return parentItem ? parentItem[parentLevelConfig.nameField] : "Unknown";
    };

    return (
      <Card className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <CardHeader
          className="bg-gradient-to-r from-secondary to-muted p-4 cursor-pointer"
          onClick={() =>
            setExpandedCards((prev) => ({ ...prev, [index]: !prev[index] }))
          }
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">
              {levelConfig?.title}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-primary bg-muted px-2 py-1 rounded-full">
                {filteredData.length}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-primary transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="p-4">
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={`Search ${levelConfig?.title.toLowerCase()}...`}
                      value={searchTerms[levelConfig?.key] || ""}
                      onChange={(e) =>
                        setSearchTerms((prev) => ({
                          ...prev,
                          [levelConfig?.key]: e.target.value,
                        }))
                      }
                      className="pl-10 h-10"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      setModalData({
                        mode: "create",
                        level: levelConfig?.key,
                        item: {},
                      });
                      setActiveModal("form");
                    }}
                    className="bg-primary hover:bg-primary/90 h-10 px-4"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-primary hover:bg-primary/90 h-10 px-4 text-white"
                    onClick={() => {
                      // Clear selected item at this level
                      setSelectedItems((prev) => ({
                        ...prev,
                        [levelConfig.key]: null,
                      }));

                      // Fetch all data again for this level
                      fetchData(levelConfig.key);
                    }}
                  >
                    Reset
                  </Button>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <motion.div
                        key={item[levelConfig?.codeField]}
                        onClick={() => {
                          // Select this item for current level
                          setSelectedItems((prev) => ({
                            ...prev,
                            [levelConfig.key]: item[levelConfig.codeField],
                          }));

                          // Find child level
                          const childLevel = CONFIG.levels.find(
                            (l) => l.parentField === levelConfig.key
                          );

                          // Fetch child level data filtered by this code
                          if (childLevel) {
                            fetchData(childLevel.key, {
                              [levelConfig.codeField]:
                                item[levelConfig.codeField],
                            });
                          }
                        }}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-primary bg-secondary px-2 py-1 rounded">
                              {item[levelConfig?.codeField]}
                            </span>
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {item[levelConfig?.nameField]}
                            </span>
                          </div>

                          {/* Show parent information */}
                          {parentLevelConfig && (
                            <p className="text-xs text-gray-500 mt-1">
                              {parentLevelConfig.title}:{" "}
                              {item[parentLevelConfig.codeField]} -{" "}
                              {getParentName(item)}
                            </p>
                          )}

                          {levelConfig?.key === "acno" && item.email && (
                            <p className="text-xs text-gray-500 mt-1">
                              {item.email}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setModalData({
                                mode: "edit",
                                level: levelConfig?.key,
                                item,
                              });
                              setActiveModal("form");
                            }}
                            className="h-8 w-8 p-0 hover:bg-secondary/80"
                          >
                            <Edit className="w-4 h-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setModalData({
                                level: levelConfig?.key,
                                code: item[levelConfig?.codeField],
                              });
                              setActiveModal("delete");
                            }}
                            className="h-8 w-8 p-0 hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <Info className="w-8 h-8 mb-2" />
                      <p className="text-sm">
                        No {levelConfig?.title.toLowerCase()} found
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    );
  };

  // Effects
  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Chart of Accounts
          </h1>
          <Button
            onClick={() => {
              setModalData({ mode: "create", level: "acno", item: {} });
              setActiveModal("form");
            }}
            className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Quick Add Account
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
            />
          </div>
        )}

        {/* Level Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {CONFIG.levels.map((levelConfig, index) => (
            <LevelCard
              key={levelConfig?.key}
              levelConfig={levelConfig}
              index={index}
            />
          ))}
        </div>

        {/* Modals */}
        <ItemForm />
        <DeleteConfirm />
      </motion.div>
    </div>
  );
};

export default ChartOfAccounts;

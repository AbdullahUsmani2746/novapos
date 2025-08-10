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
  Upload,
  Download,
  FileSpreadsheet,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import * as XLSX from 'xlsx';

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

// Sample data for Excel template
const SAMPLE_DATA = [
  {
    mainBusiness: "ASSETS",
    businessCategory: "CURRENT ASSETS",
    mainAccount: "CASH AND BANK",
    account: "Cash in Hand",
    bankAccountNo: "12345678",
    address: "Main Office",
    city: "New York",
    phoneFax: "123-456-7890",
    email: "cash@company.com"
  },
  {
    mainBusiness: "ASSETS",
    businessCategory: "CURRENT ASSETS",
    mainAccount: "CASH AND BANK",
    account: "Bank Account - ABC Bank",
    bankAccountNo: "87654321",
    address: "Branch Office",
    city: "Los Angeles",
    phoneFax: "098-765-4321",
    email: "bank@company.com"
  },
  {
    mainBusiness: "LIABILITIES",
    businessCategory: "CURRENT LIABILITIES",
    mainAccount: "ACCOUNTS PAYABLE",
    account: "Vendor Payments",
    bankAccountNo: "",
    address: "",
    city: "",
    phoneFax: "",
    email: "vendor@company.com"
  }
];

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
  
  // Import related states
  const [importFile, setImportFile] = useState(null);
  const [importData, setImportData] = useState([]);
  const [importPreview, setImportPreview] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Mock API functions (replace with actual API calls)
  const api = {
    get: async (endpoint, params = {}) => {
      try {
        const response = await axios.get(endpoint, {
          params,
          headers: {
            "Content-Type": "application/json",
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

  const getNextCode = (levelKey, existingData = null) => {
    const levelConfig = CONFIG.levels.find((l) => l.key === levelKey);
    const dataToUse = existingData || data[levelKey] || [];
    const existingCodes = dataToUse.map(
      (item) => parseInt(item[levelConfig?.codeField]) || 0
    );
    const maxCode = existingCodes.length ? Math.max(...existingCodes) : 0;
    return (maxCode + 1).toString().padStart(levelConfig?.padding, "0");
  };

  // Import Functions
  const generateSampleFile = () => {
    const ws = XLSX.utils.json_to_sheet(SAMPLE_DATA);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Chart of Accounts");
    
    // Set column widths
    ws['!cols'] = [
      { width: 20 }, // mainBusiness
      { width: 25 }, // businessCategory
      { width: 25 }, // mainAccount
      { width: 30 }, // account
      { width: 15 }, // bankAccountNo
      { width: 20 }, // address
      { width: 15 }, // city
      { width: 15 }, // phoneFax
      { width: 25 }, // email
    ];
    
    XLSX.writeFile(wb, "chart_of_accounts_template.xlsx");
    showToast("Sample file downloaded successfully");
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileType)) {
      showToast("Please upload an Excel file (.xlsx, .xls) or CSV file", "error");
      return;
    }

    setImportFile(file);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let workbook;
        if (fileType === 'csv') {
          const text = e.target.result;
          workbook = XLSX.read(text, { type: 'string' });
        } else {
          const data = new Uint8Array(e.target.result);
          workbook = XLSX.read(data, { type: 'array' });
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          showToast("The file appears to be empty", "error");
          return;
        }

        processImportData(jsonData);
      } catch (error) {
        console.error("File parsing error:", error);
        showToast("Error reading file. Please check the file format.", "error");
      }
    };

    if (fileType === 'csv') {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const processImportData = (rawData) => {
    const processedData = [];
    const errors = [];

    rawData.forEach((row, index) => {
      const rowNumber = index + 2; // Excel row numbers start from 2 (after header)
      const processedRow = {
        rowNumber,
        mainBusiness: row.mainBusiness?.toString().trim() || "",
        businessCategory: row.businessCategory?.toString().trim() || "",
        mainAccount: row.mainAccount?.toString().trim() || "",
        account: row.account?.toString().trim() || "",
        bankAccountNo: row.bankAccountNo?.toString().trim() || "",
        address: row.address?.toString().trim() || "",
        city: row.city?.toString().trim() || "",
        phoneFax: row.phoneFax?.toString().trim() || "",
        email: row.email?.toString().trim() || "",
        status: "pending",
        errors: []
      };

      // Validate required fields
      if (!processedRow.mainBusiness) {
        processedRow.errors.push("Main Business is required");
      }
      if (!processedRow.businessCategory) {
        processedRow.errors.push("Business Category is required");
      }
      if (!processedRow.mainAccount) {
        processedRow.errors.push("Main Account is required");
      }
      if (!processedRow.account) {
        processedRow.errors.push("Account name is required");
      }

      // Validate email format
      if (processedRow.email && !validateEmail(processedRow.email)) {
        processedRow.errors.push("Invalid email format");
      }

      if (processedRow.errors.length > 0) {
        processedRow.status = "error";
        errors.push(...processedRow.errors.map(err => `Row ${rowNumber}: ${err}`));
      }

      processedData.push(processedRow);
    });

    setImportData(processedData);
    setImportPreview(processedData.slice(0, 10)); // Show first 10 rows for preview
    setImportErrors(errors);
    setActiveModal("importPreview");
  };

  const findOrCreateHierarchy = async (row, tempData, createdItems) => {
    const hierarchy = {
      mbscd: null,
      bscd: null,
      macno: null,
      acno: null
    };

    console.log(`Processing row: ${row.mainBusiness} → ${row.businessCategory} → ${row.mainAccount} → ${row.account}`);

    // Find or create Main Business
    let mbItem = tempData.mbscd.find(item => 
      item.mbscdDetail.toLowerCase() === row.mainBusiness.toLowerCase()
    );
    
    if (!mbItem) {
      const newCode = getNextCode("mbscd", tempData.mbscd);
      mbItem = {
        mbscd: newCode,
        mbscdDetail: row.mainBusiness
      };
      tempData.mbscd.push(mbItem);
      createdItems.mbscd.push(mbItem);
      console.log(`Created Main Business: ${newCode} - ${row.mainBusiness}`);
    } else {
      console.log(`Found existing Main Business: ${mbItem.mbscd} - ${mbItem.mbscdDetail}`);
    }
    hierarchy.mbscd = mbItem.mbscd;

    // Find or create Business Category
    let bsItem = tempData.bscd.find(item => 
      item.bscdDetail.toLowerCase() === row.businessCategory.toLowerCase() &&
      item.mbscd === hierarchy.mbscd
    );
    
    if (!bsItem) {
      const newCode = getNextCode("bscd", tempData.bscd);
      bsItem = {
        bscd: newCode,
        bscdDetail: row.businessCategory,
        mbscd: hierarchy.mbscd
      };
      tempData.bscd.push(bsItem);
      createdItems.bscd.push(bsItem);
      console.log(`Created Business Category: ${newCode} - ${row.businessCategory} under ${hierarchy.mbscd}`);
    } else {
      console.log(`Found existing Business Category: ${bsItem.bscd} - ${bsItem.bscdDetail}`);
    }
    hierarchy.bscd = bsItem.bscd;

    // Find or create Main Account
    let macItem = tempData.macno.find(item => 
      item.macname.toLowerCase() === row.mainAccount.toLowerCase() &&
      item.bscd === hierarchy.bscd &&
      item.mbscd === hierarchy.mbscd
    );
    
    if (!macItem) {
      const newCode = getNextCode("macno", tempData.macno);
      macItem = {
        macno: newCode,
        macname: row.mainAccount,
        bscd: hierarchy.bscd,
        mbscd: hierarchy.mbscd
      };
      tempData.macno.push(macItem);
      createdItems.macno.push(macItem);
      console.log(`Created Main Account: ${newCode} - ${row.mainAccount} under ${hierarchy.bscd}`);
    } else {
      console.log(`Found existing Main Account: ${macItem.macno} - ${macItem.macname}`);
    }
    hierarchy.macno = macItem.macno;

    // Check if Account already exists
    const existingAccount = tempData.acno.find(item => 
      item.acname.toLowerCase() === row.account.toLowerCase() &&
      item.macno === hierarchy.macno &&
      item.bscd === hierarchy.bscd &&
      item.mbscd === hierarchy.mbscd
    );

    if (existingAccount) {
      console.log(`Account already exists: ${existingAccount.acno} - ${existingAccount.acname}`);
      return { ...hierarchy, exists: true, existing: existingAccount };
    }

    console.log(`Account ${row.account} will be created under ${hierarchy.macno}`);
    return hierarchy;
  };

  const executeImport = async () => {
    setLoading(true);
    setImportProgress(0);

    try {
      // Create a copy of current data to work with
      const tempData = {
        mbscd: [...data.mbscd],
        bscd: [...data.bscd],
        macno: [...data.macno],
        acno: [...data.acno]
      };

      const validRows = importData.filter(row => row.status !== "error");
      const totalRows = validRows.length;
      let processedRows = 0;
      
      // Track what needs to be created
      const createdItems = {
        mbscd: [],
        bscd: [],
        macno: [],
        acno: []
      };

      console.log("Starting import process...");
      console.log("Current data counts:", {
        mbscd: tempData.mbscd.length,
        bscd: tempData.bscd.length,
        macno: tempData.macno.length,
        acno: tempData.acno.length
      });

      for (const row of validRows) {
        try {
          console.log(`\n--- Processing Row ${row.rowNumber} ---`);
          const hierarchy = await findOrCreateHierarchy(row, tempData, createdItems);

          if (!hierarchy.exists) {
            // Create new account
            const newCode = getNextCode("acno", tempData.acno);
            const newAccount = {
              acno: newCode,
              acname: row.account,
              macno: hierarchy.macno,
              bscd: hierarchy.bscd,
              mbscd: hierarchy.mbscd,
              bankAccountNo: row.bankAccountNo || "",
              address: row.address || "",
              city: row.city || "",
              phoneFax: row.phoneFax || "",
              email: row.email || ""
            };

            tempData.acno.push(newAccount);
            createdItems.acno.push(newAccount);
            row.status = "created";
            row.message = `Account created with code ${newCode}`;
            console.log(`Created Account: ${newCode} - ${row.account}`);
          } else {
            row.status = "skipped";
            row.message = `Account already exists: ${hierarchy.existing.acno}`;
            console.log(`Skipped existing account: ${row.account}`);
          }

        } catch (error) {
          console.error(`Error processing row ${row.rowNumber}:`, error);
          row.status = "error";
          row.message = error.message;
        }

        processedRows++;
        setImportProgress((processedRows / totalRows) * 100);
      }

      console.log("\n--- API Creation Phase ---");
      console.log("Items to be created:", {
        mbscd: createdItems.mbscd.length,
        bscd: createdItems.bscd.length,
        macno: createdItems.macno.length,
        acno: createdItems.acno.length
      });

      // Send new items to API in correct order (parent before child)
      for (const level of CONFIG.levels) {
        const levelKey = level.key;
        const newItems = createdItems[levelKey];
        
        if (newItems.length > 0) {
          console.log(`\nCreating ${newItems.length} ${level.title}(s) via API...`);
          
          for (const item of newItems) {
            try {
              console.log(`API POST ${level.title}:`, item);
              const response = await api.post(CONFIG.endpoints[levelKey], item);
              console.log(`Successfully created ${level.title}:`, response);
            } catch (error) {
              console.error(`Error creating ${level.title}:`, error);
              // Mark related accounts as error
              importData.forEach(row => {
                if (row.status === "created" && 
                    ((levelKey === "mbscd" && row.mainBusiness === item.mbscdDetail) ||
                     (levelKey === "bscd" && row.businessCategory === item.bscdDetail) ||
                     (levelKey === "macno" && row.mainAccount === item.macname))) {
                  row.status = "error";
                  row.message = `Failed to create ${level.title}: ${error.message}`;
                }
              });
            }
          }
        }
      }

      // Update local data state
      console.log("\nUpdating local state...");
      setData(tempData);

      const createdCount = importData.filter(row => row.status === "created").length;
      const skippedCount = importData.filter(row => row.status === "skipped").length;
      const errorCount = importData.filter(row => row.status === "error").length;

      console.log("\n--- Import Summary ---");
      console.log(`Created: ${createdCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);
      console.log("Hierarchy items created:", {
        "Main Business": createdItems.mbscd.length,
        "Business Category": createdItems.bscd.length,
        "Main Account": createdItems.macno.length,
        "Account": createdItems.acno.length
      });

      showToast(
        `Import completed: ${createdCount} created, ${skippedCount} skipped, ${errorCount} errors`
      );

      setActiveModal("importResult");

    } catch (error) {
      console.error("Import error:", error);
      showToast("Import failed: " + error.message, "error");
    } finally {
      setLoading(false);
      setImportProgress(0);
    }
  };

  // Data Fetching
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

  const handleCreate = async (formData) => {
    try {
      setLoading(true);
      const { level, data: itemData } = formData;
      const levelConfig = CONFIG.levels.find((l) => l.key === level);
      const nameField = levelConfig?.nameField;

      if (checkDuplicateName(level, itemData[nameField])) {
        showToast(`${itemData[nameField]} already exists`, "error");
        return;
      }

      const code = getNextCode(level);
      const newItem = {
        ...itemData,
        [levelConfig?.codeField]: code,
      };

      if (levelConfig?.parentField) {
        const parentLevelConfig = CONFIG.levels.find(
          (l) => l.key === levelConfig.parentField
        );
        if (parentLevelConfig && itemData[parentLevelConfig.codeField]) {
          newItem[parentLevelConfig.codeField] =
            itemData[parentLevelConfig.codeField];
        }
      }

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

  // Import Dialog Components
  const ImportDialog = () => (
    <Dialog
      open={activeModal === "import"}
      onOpenChange={() => setActiveModal(null)}
    >
      <DialogContent className="max-w-md mx-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Import Chart of Accounts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Upload an Excel file with your chart of accounts data. The system will automatically generate codes and handle duplicates.
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary hover:bg-primary/90"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
              <p className="text-sm text-gray-500">
                Supports .xlsx, .xls, and .csv files
              </p>
              {importFile && (
                <p className="text-sm font-medium text-green-600">
                  Selected: {importFile.name}
                </p>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={generateSampleFile}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Sample Template
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          className="hidden"
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setActiveModal(null)}
            className="flex-1"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const ImportPreviewDialog = () => (
    <Dialog
      open={activeModal === "importPreview"}
      onOpenChange={() => setActiveModal(null)}
    >
      <DialogContent className="max-w-4xl mx-auto rounded-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Import Preview - {importData.length} rows
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {importErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                <h3 className="font-semibold text-red-800">
                  {importErrors.length} Errors Found
                </h3>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {importErrors.slice(0, 5).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
                {importErrors.length > 5 && (
                  <li className="font-medium">...and {importErrors.length - 5} more</li>
                )}
              </ul>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h3 className="font-semibold">Preview (First 10 rows)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-2 text-left">Row</th>
                    <th className="px-2 py-2 text-left">Status</th>
                    <th className="px-2 py-2 text-left">Main Business</th>
                    <th className="px-2 py-2 text-left">Business Category</th>
                    <th className="px-2 py-2 text-left">Main Account</th>
                    <th className="px-2 py-2 text-left">Account</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-2 py-2">{row.rowNumber}</td>
                      <td className="px-2 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          row.status === "error" 
                            ? "bg-red-100 text-red-800" 
                            : "bg-green-100 text-green-800"
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-2 py-2">{row.mainBusiness}</td>
                      <td className="px-2 py-2">{row.businessCategory}</td>
                      <td className="px-2 py-2">{row.mainAccount}</td>
                      <td className="px-2 py-2">{row.account}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setActiveModal(null)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={executeImport}
            disabled={loading || importErrors.length > 0}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                Importing... {Math.round(importProgress)}%
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Import Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const ImportResultDialog = () => {
    const createdCount = importData.filter(row => row.status === "created").length;
    const skippedCount = importData.filter(row => row.status === "skipped").length;
    const errorCount = importData.filter(row => row.status === "error").length;

    return (
      <Dialog
        open={activeModal === "importResult"}
        onOpenChange={() => setActiveModal(null)}
      >
        <DialogContent className="max-w-2xl mx-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Import Results
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{createdCount}</div>
                <div className="text-sm text-green-700">Created</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{skippedCount}</div>
                <div className="text-sm text-yellow-700">Skipped</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-red-700">Errors</div>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left">Row</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Account</th>
                    <th className="px-3 py-2 text-left">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {importData.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{row.rowNumber}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          row.status === "created" 
                            ? "bg-green-100 text-green-800" 
                            : row.status === "skipped"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">{row.account}</td>
                      <td className="px-3 py-2 text-gray-600">
                        {row.message || (row.status === "created" ? "Successfully created" : "")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setActiveModal(null);
                setImportData([]);
                setImportPreview([]);
                setImportErrors([]);
                setImportFile(null);
              }}
              className="bg-primary hover:bg-primary/90"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const ItemForm = () => {
    const [formData, setFormData] = useState(modalData.item || {});
    const [errors, setErrors] = useState({});
    const isEdit = modalData.mode === "edit";
    const level = modalData.level;
    const levelConfig = CONFIG.levels.find((l) => l.key === level);
    const parentLevelConfig = CONFIG.levels.find(
      (l) => l.key === levelConfig?.parentField
    );

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
                      setSelectedItems((prev) => ({
                        ...prev,
                        [levelConfig.key]: null,
                      }));
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
                          setSelectedItems((prev) => ({
                            ...prev,
                            [levelConfig.key]: item[levelConfig.codeField],
                          }));

                          const childLevel = CONFIG.levels.find(
                            (l) => l.parentField === levelConfig.key
                          );

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
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setActiveModal("import")}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button
              onClick={() => {
                setModalData({ mode: "create", level: "acno", item: {} });
                setActiveModal("form");
              }}
              className="bg-primary hover:bg-primary/90 flex-1 sm:flex-none"
            >
              <Plus className="w-4 h-4 mr-2" />
              Quick Add Account
            </Button>
          </div>
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
        <ImportDialog />
        <ImportPreviewDialog />
        <ImportResultDialog />
      </motion.div>
    </div>
  );
};

export default ChartOfAccounts;
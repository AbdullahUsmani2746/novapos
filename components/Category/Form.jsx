"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Trash2,
  Save,
  X,
  AlertCircle,
  Search,
  User,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  CreditCard,
  Building,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { VOUCHER_CONFIG } from "./constants";

// Icon mapping for field types
const ICON_MAP = {
  date: Calendar,
  time: Clock,
  number: DollarSign,
  text: FileText,
  textarea: FileText,
  select: Building,
  acname: User,
  ccname: Building,
  currency: DollarSign,
  invoice_no: FileText,
  narration: FileText,
  narration1: FileText,
  narration2: FileText,
  check_no: CreditCard,
  check_date: Calendar,
  pycd: Building,
  rmk: FileText,
  rmk1: FileText,
  rmk2: FileText,
  rmk3: FileText,
  rmk4: FileText,
  rmk5: FileText,
  tran_no: FileText,
  tran_id: FileText,
  vr_no: FileText,
  st_inv_no: FileText,
  godown: Building,
  delv_n: FileText,
  prd_cat: FileText,
  com_inv_no: FileText,
  product: FileText,
  item: FileText,
  no_of_pack: FileText,
  qty_per_pack: FileText,
  qty: FileText,
  rate: DollarSign,
  gross_amount: DollarSign,
  st_rate: DollarSign,
  st_amount: DollarSign,
  additional_tax: DollarSign,
  amount: DollarSign,
};

const FormInput = ({
  icon: Icon,
  error,
  label,
  required,
  className,
  ...props
}) => (
  <div className="space-y-1">
    <Label className="text-xs text-primary">
      {label}
      {required && <span className="text-red-500">*</span>}
    </Label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      )}
      <Input
        className={`${
          Icon ? "pl-8 pr-8" : "px-3"
        } w-full rounded-md border-gray-300 focus:ring-primary focus:border-primary ${
          error ? "border-red-500 focus:ring-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
      )}
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// Searchable Select Component
const SearchableSelect = ({
  value,
  onValueChange,
  options,
  placeholder,
  label,
  required,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="space-y-1">
      <Label className="text-xs text-primary">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <Select
        value={value?.toString() || ""}
        onValueChange={onValueChange}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger
          className={`h-8 text-xs w-full rounded-md border-gray-300 focus:ring-primary focus:border-primary ${
            error ? "border-red-500" : ""
          }`}
          aria-label={placeholder}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <div className="p-2 sticky top-0 bg-white">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-full rounded-md text-xs"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          {filteredOptions.length === 0 ? (
            <div className="p-2 text-xs text-gray-500">No options found</div>
          ) : (
            filteredOptions.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="text-xs hover:bg-primary focus:bg-primary"
              >
                {opt.label}
              </SelectItem>
            ))
          )}
          <SelectItem
            value="add_new"
            className="text-primary hover:bg-primary focus:bg-primary"
          >
            Add New {placeholder.split("Select ")[1]}
          </SelectItem>
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default function VoucherForm({ type, onClose }) {
  const voucherConfig = VOUCHER_CONFIG[type] || {};
  const [masterData, setMasterData] = useState({});
  const [mainLines, setMainLines] = useState([{}]);
  const [deductionLines, setDeductionLines] = useState([{}]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [totals, setTotals] = useState({});
  const [optionsData, setOptionsData] = useState({
    accounts: [],
    costCenters: [],
    currencies: [],
    suppliers: [],
    customers: [],
    products: [],
    itemCategories:[],
    godowns: [],
    mainAccounts: [],
  });
  const [loading, setLoading] = useState({
    options: true,
    submit: false,
    vrNo: false,
  });
  const [errors, setErrors] = useState({
    options: null,
    submit: null,
    validation: {},
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalField, setModalField] = useState({});
  // Add these refs at the component level
  const prevMainLinesRef = useRef(null);
  const prevDeductionLinesRef = useRef(null);

  const apiMap = {
    payment: "/api/voucher/payment",
    receipt: "/api/voucher/receipt",
    journal: "/api/voucher/journal",
    purchase: "/api/voucher/purchase",
    sale: "/api/voucher/sale",
  };

  // Fetch options for select fields
  const getRequiredOptionTypes = useCallback(() => {
    return [
      ...new Set(
        [
          ...(voucherConfig.masterFields || []),
          ...(voucherConfig.lineFields || []),
          ...(voucherConfig.deductionFields || []),
        ]
          .filter((f) => f.type === "select" && f.options)
          .map((f) => f.options)
      ),
    ];
  }, [voucherConfig]);

  const fetchOptions = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, options: true }));
      const requiredOptionTypes = getRequiredOptionTypes();
      const initialOptionsData = requiredOptionTypes.reduce(
        (acc, key) => ({ ...acc, [key]: [] }),
        { mainAccounts: [] } // Include mainAccounts for account creation
      );

      const fields = [
        ...(voucherConfig.masterFields || []),
        ...(voucherConfig.lineFields || []),
        ...(voucherConfig.deductionFields || []),
      ];

      const endpoints = requiredOptionTypes
        .map((key) => {
          const field = fields.find((f) => f.options === key);
          return { key, url: field?.apiEndpoint };
        })
        .filter((e) => e.url);

      // Add mainAccounts endpoint for account creation
      endpoints.push({ key: "mainAccounts", url: "/api/accounts/macno" });
      endpoints.push({ key: "itemCategories", url: "/api/setup/item_categories" });
      // endpoints.push({ key: "mainAccounts", url: "/api/accounts/macno" });


      const results = await Promise.all(
        endpoints.map(async ({ key, url }) => {
          const response = await axios.get(url);
          return { key, data: response.data.data };
        })
      );

      const newOptionsData = results.reduce(
        (acc, { key, data }) => ({ ...acc, [key]: data }),
        initialOptionsData
      );
      setOptionsData((prev) => ({ ...prev, ...newOptionsData }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        options: `Failed to load options: ${error.message}`,
      }));
      toast.error(`Failed to load options: ${error.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, options: false }));
    }
  }, [getRequiredOptionTypes, voucherConfig]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  // Initialize master data
  useEffect(() => {
    if (!voucherConfig.masterFields) return;

    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toTimeString().split(" ")[0];

    const defaultMasterData = voucherConfig.masterFields.reduce(
      (acc, field) => {
        const fieldKey = field.formName || field.name;
        return {
          ...acc,
          [fieldKey]:
            field.type === "date" && field.name === "dateD"
              ? today
              : field.type === "time"
              ? now
              : field.type === "select"
              ? ""
              : field.type === "number"
              ? 0
              : field.defaultValue || "",
        };
      },
      {}
    );

    defaultMasterData.tran_code = voucherConfig.tran_code;
    setMasterData(defaultMasterData);
  }, [voucherConfig]);

  // Fetch next voucher number
  const fetchNextVrNo = async (tran_code) => {
    try {
      setLoading((prev) => ({ ...prev, vrNo: true }));
      setErrors((prev) => ({ ...prev, vrNo: null }));

      const response = await axios.get(
        `/api/voucher/next-vr-no?tran_code=${tran_code}`
      );
      return response.data.nextVrNo;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setErrors((prev) => ({
        ...prev,
        vrNo: `Failed to get voucher number: ${errorMsg}`,
      }));
      toast.error("Error fetching next voucher number");
      return "";
    } finally {
      setLoading((prev) => ({ ...prev, vrNo: false }));
    }
  };

  useEffect(() => {
    if (
      voucherConfig.masterFields?.some(
        (f) => f.name === "vr_no" && f.autoGenerate
      )
    ) {
      setLoading((prev) => ({ ...prev, vrNo: true }));
      fetchNextVrNo(voucherConfig.tran_code).then((nextVrNo) => {
        setMasterData((prev) => ({ ...prev, vr_no: nextVrNo }));
        setLoading((prev) => ({ ...prev, vrNo: false }));
      });
    }
  }, [voucherConfig]);

  // Calculate totals
  useEffect(() => {
    if (!voucherConfig.totals) return;

    // Use memo to avoid unnecessary recalculations
    const calculatedTotals = Object.entries(voucherConfig.totals).reduce(
      (acc, [key, config]) => {
        // Only calculate if this is the first run or if relevant data changed
        if (
          !totals[key] ||
          (key === "deductionTotal" &&
            JSON.stringify(deductionLines) !== prevDeductionLinesRef.current) ||
          (key !== "deductionTotal" &&
            JSON.stringify(mainLines) !== prevMainLinesRef.current)
        ) {
          const lines = key === "deductionTotal" ? deductionLines : mainLines;
          acc[key] = config.calculate(lines, acc) || 0;
        } else {
          // Reuse existing value
          acc[key] = totals[key];
        }
        return acc;
      },
      {}
    );

    // Store references for comparison
    prevMainLinesRef.current = JSON.stringify(mainLines);
    prevDeductionLinesRef.current = JSON.stringify(deductionLines);

    setTotals(calculatedTotals);
  }, [mainLines, deductionLines, voucherConfig]);

  const handleMasterChange = (name, value) => {
    setMasterData((prev) => ({
      ...prev,
      [name]: value === "placeholder" ? "" : value,
    }));
    setErrors((prev) => ({
      ...prev,
      validation: { ...prev.validation, [name]: null },
    }));
  };

  const calculateFieldValue = (line, fieldConfig) => {
    if (!fieldConfig.calculate || !fieldConfig.dependencies)
      return line[fieldConfig.formName || fieldConfig.name] || "";

    const dependencies = fieldConfig.dependencies.reduce(
      (acc, dep) => ({
        ...acc,
        [dep]: parseFloat(line[dep]) || 0,
      }),
      {}
    );

    return fieldConfig.calculate(dependencies) || 0;
  };

  const handleLineChange = (index, fieldName, value, isMain = true) => {
    const lines = isMain ? [...mainLines] : [...deductionLines];
    const fieldConfigs = isMain
      ? voucherConfig.lineFields
      : voucherConfig.deductionFields;
    const fieldConfig = fieldConfigs.find(
      (f) => (f.formName || f.name) === fieldName
    );

    if (!fieldConfig) return;

    let processedValue =
      fieldConfig.type === "number"
        ? value === ""
          ? 0
          : parseFloat(value) || 0
        : value;
    const newLine = { ...lines[index], [fieldName]: processedValue };

    fieldConfigs
      .filter((f) => f.dependencies?.includes(fieldName))
      .forEach((depField) => {
        newLine[depField.formName || depField.name] = calculateFieldValue(
          newLine,
          depField
        );
      });

    lines[index] = newLine;
    if (isMain) setMainLines(lines);
    else setDeductionLines(lines);

    // Use a more reliable identifier that won't break when rows are reordered
    // Store errors using a data attribute or other unique identifier instead of index
    setErrors((prev) => {
      const newValidation = { ...prev.validation };
      // Use line's internal ID or create one if needed
      const lineId = newLine.id || `${isMain ? "main" : "deduction"}-${index}`;
      delete newValidation[`${lineId}-${fieldName}`];
      return {
        ...prev,
        validation: newValidation,
      };
    });
  };

  const addLine = (isMain = true) => {
    const newLine = {};
    const fields = isMain
      ? voucherConfig.lineFields
      : voucherConfig.deductionFields;

    fields?.forEach((field) => {
      if (field.calculate && field.dependencies)
        newLine[field.formName || field.name] = 0;
    });

    if (isMain) setMainLines([...mainLines, newLine]);
    else setDeductionLines([...deductionLines, newLine]);
  };

  // Update removeLine function (around line 287)
  const removeLine = (index, isMain = true) => {
    const lines = isMain ? [...mainLines] : [...deductionLines];
    if (lines.length <= 1) return;

    // Get the line being removed to clear its errors
    const removedLine = lines[index];

    lines.splice(index, 1);
    if (isMain) setMainLines(lines);
    else setDeductionLines(lines);

    setSelectedRows((prev) =>
      prev.filter((k) => k !== `${isMain ? "main" : "deduction"}-${index}`)
    );

    // Clear errors related to the removed line
    setErrors((prev) => {
      const newValidation = { ...prev.validation };
      // Remove any errors that start with this line's identifier
      const prefix = `${isMain ? "main" : "deduction"}-${index}`;
      Object.keys(newValidation).forEach((key) => {
        if (key.startsWith(prefix)) {
          delete newValidation[key];
        }
      });
      return {
        ...prev,
        validation: newValidation,
      };
    });
  };

  const toggleRowSelection = (index, isMain = true) => {
    const rowKey = `${isMain ? "main" : "deduction"}-${index}`;
    setSelectedRows((prev) =>
      prev.includes(rowKey)
        ? prev.filter((k) => k !== rowKey)
        : [...prev, rowKey]
    );
  };

  const toggleAllRowSelection = (isMain = true) => {
    const prefix = isMain ? "main" : "deduction";
    const currentLines = isMain ? mainLines : deductionLines;
    const currentKeys = currentLines.map((_, i) => `${prefix}-${i}`);

    setSelectedRows((prev) =>
      currentKeys.every((k) => prev.includes(k))
        ? prev.filter((k) => !k.startsWith(prefix))
        : [...prev.filter((k) => !k.startsWith(prefix)), ...currentKeys]
    );
  };

  const deleteSelectedRows = (isMain = true) => {
    const prefix = isMain ? "main" : "deduction";
    const currentLines = isMain ? mainLines : deductionLines;
    const newLines = currentLines.filter(
      (_, i) => !selectedRows.includes(`${prefix}-${i}`)
    );

    if (newLines.length === 0) newLines.push({});
    if (isMain) setMainLines(newLines);
    else setDeductionLines(newLines);

    setSelectedRows((prev) => prev.filter((k) => !k.startsWith(prefix)));
  };

  const validateForm = () => {
    const newErrors = {};
    const missingFields = (
      voucherConfig.masterFields?.filter((f) => f.required) || []
    )
      .filter((f) => !masterData[f.formName || f.name]?.toString().trim())
      .map((f) => f.formName || f.name);

    missingFields.forEach((field) => {
      newErrors[field] = `${
        voucherConfig.masterFields.find((f) => (f.formName || f.name) === field)
          .label
      } is required`;
    });

    // Check if any line items exist
    if (
      !mainLines.some((line) =>
        Object.values(line).some((v) => v?.toString().trim())
      )
    ) {
      newErrors.mainLines = "At least one line item is required";
    } else {
      // Validate required fields in each line item
      mainLines.forEach((line, index) => {
        const linePrefix = `main-${index}`;
        (voucherConfig.lineFields?.filter((f) => f.required) || []).forEach(
          (field) => {
            const fieldName = field.formName || field.name;
            if (!line[fieldName]?.toString().trim()) {
              newErrors[
                `${linePrefix}-${fieldName}`
              ] = `${field.label} is required`;
            }
          }
        );
      });

      // Do the same for deduction lines if they exist
      if (voucherConfig.hasDeductionBlock) {
        deductionLines.forEach((line, index) => {
          // Only validate non-empty deduction lines
          if (Object.values(line).some((v) => v?.toString().trim())) {
            const linePrefix = `deduction-${index}`;
            (
              voucherConfig.deductionFields?.filter((f) => f.required) || []
            ).forEach((field) => {
              const fieldName = field.formName || field.name;
              if (!line[fieldName]?.toString().trim()) {
                newErrors[
                  `${linePrefix}-${fieldName}`
                ] = `${field.label} is required`;
              }
            });
          }
        });
      }
    }

    if (voucherConfig.balanceCheck) {
      const formData = {
        master: masterData,
        lines: mainLines,
        deductions: deductionLines,
        totals,
      };
      if (!voucherConfig.balanceCheck.condition(formData)) {
        const errorMsg =
          typeof voucherConfig.balanceCheck.errorMessage === "function"
            ? voucherConfig.balanceCheck.errorMessage(formData)
            : voucherConfig.balanceCheck.errorMessage;
        newErrors.balance = errorMsg;
      }
    }

    setErrors((prev) => ({
      ...prev,
      validation: newErrors,
    }));
    return Object.keys(newErrors).length === 0;
  };
  const prepareFormData = () => ({
    master: { ...masterData, tran_code: voucherConfig.tran_code },
    lines: mainLines
      .filter((line) => Object.values(line).some((v) => v?.toString().trim()))
      .map((line) => ({ ...line })),
    deductions: voucherConfig.hasDeductionBlock
      ? deductionLines
          .filter((line) =>
            Object.values(line).some((v) => v?.toString().trim())
          )
          .map((line) => ({ ...line }))
      : [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if any API operations are pending
    if (loading.options || loading.vrNo) {
      toast.error("Please wait for all operations to complete");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix validation errors");

      // Scroll to the first error if any
      const firstErrorField = Object.keys(errors.validation)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.focus();
        }
      }

      return;
    }

    setLoading((prev) => ({ ...prev, submit: true }));
    setErrors((prev) => ({ ...prev, submit: null }));

    try {
      const formData = prepareFormData();
      await axios.post(apiMap[type], formData);
      toast.success("Voucher saved successfully");
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setErrors((prev) => ({
        ...prev,
        submit: `Failed to save: ${errorMsg}`,
      }));
      toast.error(`Failed to save: ${errorMsg}`);
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const getSelectOptions = (optionsType, valueKey = "id", nameKey = "name") => {
    const options = optionsData[optionsType] || [];
    return options.map((opt) => ({
      value: opt[valueKey]?.toString() || "",
      label: opt[nameKey] || opt.title || opt[valueKey]?.toString() || "",
    }));
  };

  const renderSelectField = (
    field,
    value,
    onChange,
    optionsType,
    isMaster = true,
    index = 0,
    isMain = true
  ) => {
    const options = getSelectOptions(
      optionsType,
      field.valueKey,
      field.nameKey
    );
    const fieldName = field.formName || field.name;

    return (
      <SearchableSelect
        value={value}
        onValueChange={(v) => {
          if (v === "add_new") {
            setModalType(optionsType);
            setModalField(field);
            setModalOpen(true);
          } else {
            onChange(fieldName, v);
          }
        }}
        options={options}
        placeholder={`Select ${field.label}`}
        label={field.label}
        required={field.required}
        error={
          isMaster
            ? errors.validation[fieldName]
            : errors.validation[
                `${isMain ? "main" : "deduction"}-${index}-${fieldName}`
              ]
        }
      />
    );
  };

  const renderInputField = (line, fieldConfig, index, isMain) => {
    const fieldName = fieldConfig.formName || fieldConfig.name;
    const value = calculateFieldValue(line, fieldConfig);
    const Icon =
      ICON_MAP[fieldConfig.name] || ICON_MAP[fieldConfig.type] || FileText;

    if (fieldConfig.type === "select") {
      return renderSelectField(
        fieldConfig,
        line[fieldName],
        (name, v) => handleLineChange(index, name, v, isMain),
        fieldConfig.options,
        false,
        index,
        isMain
      );
    }

    const inputType =
      fieldConfig.type === "number"
        ? "number"
        : fieldConfig.type === "date"
        ? "date"
        : fieldConfig.type === "time"
        ? "time"
        : "text";
    const isReadOnly = fieldConfig.calculate && fieldConfig.dependencies;

    if (fieldConfig.type === "textarea") {
      return (
        <div className="space-y-1">
          <Label className="text-xs text-primary">{fieldConfig.label}</Label>
          <Textarea
            value={value || ""}
            onChange={(e) =>
              handleLineChange(index, fieldName, e.target.value, isMain)
            }
            readOnly={isReadOnly}
            disabled={loading.submit || isReadOnly}
            className="h-16 text-xs w-full rounded-md border-gray-300 focus:ring-primary focus:border-primary"
          />
          {errors.validation[
            `${isMain ? "main" : "deduction"}-${index}-${fieldName}`
          ] && (
            <p className="text-xs text-red-500">
              {
                errors.validation[
                  `${isMain ? "main" : "deduction"}-${index}-${fieldName}`
                ]
              }
            </p>
          )}
        </div>
      );
    }

    return (
      <FormInput
        icon={Icon}
        label={fieldConfig.label}
        type={inputType}
        value={
          fieldConfig.type === "number" && typeof value === "number"
            ? value
            : value || ""
        }
        onChange={(e) =>
          handleLineChange(index, fieldName, e.target.value, isMain)
        }
        readOnly={isReadOnly}
        disabled={loading.submit || isReadOnly}
        className="h-8 text-xs w-full px-8" // Add px-8 for proper icon padding
        error={
          errors.validation[
            `${isMain ? "main" : "deduction"}-${index}-${fieldName}`
          ]
        }
      />
    );
  };

  const renderMasterFields = () => (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-secondary rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {voucherConfig.masterFields
        ?.filter((f) => f.name !== "tran_code")
        .map((field) => {
          const fieldName = field.formName || field.name;
          const Icon = ICON_MAP[field.name] || ICON_MAP[field.type] || FileText;

          return (
            <motion.div
              key={fieldName}
              className="flex flex-col space-y-1 min-w-[160px] flex-1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {field.type === "select" ? (
                renderSelectField(
                  field,
                  masterData[fieldName],
                  handleMasterChange,
                  field.options,
                  true
                )
              ) : field.type === "textarea" ? (
                <div className="space-y-1">
                  <Label className="text-xs text-primary">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  <Textarea
                    value={masterData[fieldName] || ""}
                    onChange={(e) =>
                      handleMasterChange(fieldName, e.target.value)
                    }
                    disabled={loading.submit}
                    className="h-16 text-sm rounded-md border-gray-300 focus:ring-primary focus:border-primary"
                  />
                  {errors.validation[fieldName] && (
                    <p className="text-xs text-red-500">
                      {errors.validation[fieldName]}
                    </p>
                  )}
                </div>
              ) : (
                <FormInput
                  icon={Icon}
                  label={field.label}
                  type={field.type}
                  value={
                    field.name === "vr_no" && field.autoGenerate
                      ? masterData[fieldName] || ""
                      : masterData[fieldName] || ""
                  }
                  onChange={(e) =>
                    handleMasterChange(fieldName, e.target.value)
                  }
                  readOnly={field.name === "vr_no" && field.autoGenerate}
                  disabled={
                    loading.submit ||
                    (field.name === "vr_no" &&
                      field.autoGenerate &&
                      loading.vrNo)
                  }
                  required={field.required}
                  error={errors.validation[fieldName]}
                />
              )}
            </motion.div>
          );
        })}
    </motion.div>
  );

  const renderTable = (isMain = true) => {
    const fields =
      (isMain
        ? voucherConfig.lineFields
        : voucherConfig.deductionFields
      )?.filter((f) => !["tran_code", "ac_no", "ccno"].includes(f.name)) || [];
    if (!fields.length) return null;

    const lines = isMain ? mainLines : deductionLines;
    const prefix = isMain ? "main" : "deduction";
    const title = isMain
      ? type === "payment"
        ? "Payments"
        : type === "receipt"
        ? "Receipts"
        : type === "journal"
        ? "Journal Entries"
        : type === "purchase"
        ? "Purchases"
        : "Sales"
      : "Deductions";

    return (
      <motion.div
        className="mt-6 border rounded-lg bg-white shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-gradient-to-r from-primary to-primary p-3 flex justify-between items-center text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <Badge className="bg-white text-primary">{lines.length}</Badge>
            <span className="text-sm font-medium">{title}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault(); // Prevent form submission
                e.stopPropagation(); // Stop event bubbling
                deleteSelectedRows(isMain);
              }}
              disabled={
                !selectedRows.some((k) => k.startsWith(prefix)) ||
                loading.submit
              }
              className="bg-white text-primary hover:bg-secondary hover:text-primary"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault(); // Prevent form submission
                e.stopPropagation(); // Stop event bubbling
                addLine(isMain);
              }}
              disabled={loading.submit}
              className="bg-white text-primary hover:bg-secondary hover:text-primary"
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-xs border-b text-primary">
                <th className="p-2 w-10">
                  <input
                    type="checkbox"
                    checked={
                      lines.length > 0 &&
                      lines.every((_, i) =>
                        selectedRows.includes(`${prefix}-${i}`)
                      )
                    }
                    onChange={() => toggleAllRowSelection(isMain)}
                    disabled={loading.submit}
                    className="cursor-pointer"
                  />
                </th>
                <th className="p-2 w-10">#</th>
                {fields.map((f) => (
                  <th key={f.name} className="p-2 text-left font-medium">
                    {f.label}
                  </th>
                ))}
                <th className="p-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {lines.map((line, idx) => (
                  <motion.tr
                    key={`${prefix}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`border-b hover:bg-gray-50 ${
                      selectedRows.includes(`${prefix}-${idx}`)
                        ? "bg-primary"
                        : ""
                    }`}
                    onClick={() => toggleRowSelection(idx, isMain)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleRowSelection(idx, isMain);
                      }
                    }}
                  >
                    <td className="p-1 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(`${prefix}-${idx}`)}
                        onChange={() => toggleRowSelection(idx, isMain)}
                        disabled={loading.submit}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="p-1 text-center text-sm">{idx + 1}</td>
                    {fields.map((f) => (
                      <td key={f.name} className="p-2 min-w-[150px]">
                        {" "}
                        {/* Increased padding and min-width */}
                        {renderInputField(line, f, idx, isMain)}
                      </td>
                    ))}
                    <td className="p-1 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault(); // Prevent form submission
                          e.stopPropagation(); // Stop event bubbling
                          removeLine(idx, isMain);
                        }}
                        disabled={loading.submit || lines.length <= 1}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {voucherConfig.totals && (
          <div className="bg-gray-50 p-3 flex justify-end gap-6 border-t">
            {Object.entries(voucherConfig.totals)
              .filter(
                ([k]) =>
                  (isMain && k !== "deductionTotal") ||
                  (!isMain && ["deductionTotal", "netTotal"].includes(k))
              )
              .map(([k, config]) => (
                <motion.div
                  key={k}
                  className="text-right"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-xs text-primary">
                    {config.label}:{" "}
                  </span>
                  <span className="text-primary font-bold">
                    {totals[k]?.toFixed(2) || "0.00"}
                  </span>
                </motion.div>
              ))}
          </div>
        )}
      </motion.div>
    );
  };

  const AddEntityModal = ({ onClose, onSave, entityType, fieldConfig }) => {
    const [entityData, setEntityData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalErrors, setModalErrors] = useState({});

    // Initialize entity data based on modalFields
    useEffect(() => {
      const initialData = fieldConfig.modalFields.reduce(
        (acc, field) => ({
          ...acc,
          [field.name]: field.type === "number" ? 0 : field.defaultValue || "",
        }),
        {}
      );
      setEntityData(initialData);
    }, [fieldConfig.modalFields]);

    const validateModal = () => {
      const newErrors = {};
      fieldConfig.modalFields.forEach((field) => {
        if (field.required && !entityData[field.name]?.toString().trim()) {
          newErrors[field.name] = `${field.label} is required`;
        }
      });
      setModalErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
      if (!validateModal()) {
        toast.error("Please fix validation errors");
        return;
      }

      try {
        setIsSubmitting(true);
        const response = await axios.post(
          fieldConfig.createEndpoint,
          entityData
        );
        onSave(response.data);
        toast.success(`${fieldConfig.label} added successfully`);
        onClose();
      } catch (error) {
        toast.error(`Error adding ${fieldConfig.label}: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Add New {fieldConfig.label}</DialogTitle>
          </DialogHeader>
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {fieldConfig.modalFields.map((field) => {
              const Icon =
                ICON_MAP[field.name] || ICON_MAP[field.type] || FileText;
              return (
                <div key={field.name} className="space-y-1">
                  {field.type === "select" ? (
                    <SearchableSelect
                      value={entityData[field.name]}
                      onValueChange={(v) =>
                        setEntityData({ ...entityData, [field.name]: v })
                      }
                      options={getSelectOptions(
                        field.options,
                        field.valueKey,
                        field.nameKey
                      )}
                      placeholder={`Select ${field.label}`}
                      label={field.label}
                      required={field.required}
                      error={modalErrors[field.name]}
                    />
                  ) : field.type === "textarea" ? (
                    <div className="space-y-1">
                      <Label className="text-xs text-primary">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500">*</span>
                        )}
                      </Label>
                      <Textarea
                        value={entityData[field.name] || ""}
                        onChange={(e) =>
                          setEntityData({
                            ...entityData,
                            [field.name]: e.target.value,
                          })
                        }
                        className="h-16 text-xs w-full rounded-md border-gray-300 focus:ring-primary focus:border-primary"
                        disabled={isSubmitting}
                      />
                      {modalErrors[field.name] && (
                        <p className="text-xs text-red-500">
                          {modalErrors[field.name]}
                        </p>
                      )}
                    </div>
                  ) : (
                    <FormInput
                      icon={Icon}
                      label={field.label}
                      type={field.type}
                      value={entityData[field.name] || ""}
                      onChange={(e) =>
                        setEntityData({
                          ...entityData,
                          [field.name]: e.target.value,
                        })
                      }
                      required={field.required}
                      disabled={isSubmitting}
                      error={modalErrors[field.name]}
                    />
                  )}
                </div>
              );
            })}
          </motion.div>
          <DialogFooter className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleSave}
              className="bg-primary hover:bg-secondary hover:text-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  if (!voucherConfig || !Object.keys(voucherConfig).length) {
    return (
      <div className="min-w-[320px] max-w-full bg-gray-100 min-h-screen p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Invalid voucher type: "{type}"</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-[320px] max-w-full min-h-screen p-1 ">
      <Toaster richColors />
      {loading.options && (
        <motion.div
          className="flex justify-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
          />
        </motion.div>
      )}
      {Object.values(errors.validation).some(Boolean) && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Error</AlertTitle>
          <AlertDescription>
            {Object.values(errors.validation).filter(Boolean).join("; ")}
          </AlertDescription>
        </Alert>
      )}
      {errors.options && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errors.options}</AlertDescription>
        </Alert>
      )}
      {errors.submit && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <Card className="mb-6 shadow-sm">
          <CardHeader className="bg-primary border-b">
            <CardTitle className="text-lg text-white">
              Voucher Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">{renderMasterFields()}</CardContent>
        </Card>
        {renderTable(true)}
        {voucherConfig.hasDeductionBlock && renderTable(false)}
        <motion.div
          className="mt-6 flex justify-end gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading.submit}
            className="rounded-md text-primary bg-secondary hover:bg-primary "
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading.submit || loading.options || loading.vrNo}
            className="rounded-md bg-primary hover:bg-secondary text-white hover:text-primary"
          >
            {loading.submit ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save Voucher
              </>
            )}
          </Button>
        </motion.div>
      </form>
      {modalOpen && (
        <AddEntityModal
          onClose={() => setModalOpen(false)}
          onSave={(newEntity) => {
            // Add the new entity to options data
            setOptionsData((prev) => ({
              ...prev,
              [modalType]: [...prev[modalType], newEntity],
            }));

            // Update the field value
            const fieldName = modalField.formName || modalField.name;
            const newValue = newEntity[modalField.valueKey];

            // Update in the appropriate location (master or line item)
            if (modalField.container === "master") {
              handleMasterChange(fieldName, newValue);

              // Also update any dependent fields
              voucherConfig.masterFields
                ?.filter((f) => f.dependencies?.includes(fieldName))
                .forEach((depField) => {
                  const depName = depField.formName || depField.name;
                  if (depField.calculate) {
                    const dependencies = depField.dependencies.reduce(
                      (acc, dep) => ({
                        ...acc,
                        [dep]:
                          dep === fieldName ? newValue : masterData[dep] || 0,
                      }),
                      {}
                    );
                    handleMasterChange(
                      depName,
                      depField.calculate(dependencies) || 0
                    );
                  }
                });
            } else if (modalField.lineIndex !== undefined) {
              const isMain = modalField.container === "main";
              handleLineChange(
                modalField.lineIndex,
                fieldName,
                newValue,
                isMain
              );
            }

            setModalOpen(false);
          }}
          entityType={modalType}
          fieldConfig={modalField}
        />
      )}
    </div>
  );
}

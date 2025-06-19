"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import axios from "axios";
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

// Reusable FormInput Component
const FormInput = ({
  icon: Icon,
  error,
  label,
  required,
  className,
  ...props
}) => (
  <div className="space-y-1">
    <Label className="text-xs text-gray-700">
      {label}
      {required && <span className="text-red-500">*</span>}
    </Label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      )}
      <Input
        className={`w-full rounded-md border-gray-300 focus:ring-primary0 focus:border-primary0 ${
          Icon ? "pl-8" : "px-3"
        } ${error ? "border-red-500 focus:ring-red-500" : ""} ${className}`}
        {...props}
      />
      {error && (
        <AlertCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
      )}
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// Reusable SearchableSelect Component
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
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  return (
    <div className="space-y-1">
      <Label className="text-xs text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <Select
        value={value ? String(value) : ""} // Ensure value is a string or empty
        onValueChange={(v) => {
          // Only call onValueChange if the value is different to prevent unnecessary updates
          if (v !== value) {
            onValueChange(v);
          }
        }}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger
          className={`w-full h-9 text-sm rounded-md border-gray-300 focus:ring-primary0 focus:border-primary0 ${
            error ? "border-red-500" : ""
          }`}
          aria-label={placeholder}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <div className="p-2 sticky top-0 bg-white z-10">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-full h-9 text-sm rounded-md"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          {filteredOptions.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">No options found</div>
          ) : (
            filteredOptions.map((opt) => (
              <SelectItem
                key={opt.value}
                value={String(opt.value)} // Ensure option value is a string
                className="text-sm hover:bg-secondary focus:bg-primary"
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

// Main VoucherForm Component
export default function VoucherForm({
  type,
  onClose,
  editMode = false,
  existingData = null,
}) {
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
    itemCategories: [],
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
    setLoading((prev) => ({ ...prev, options: true }));
    try {
      const requiredOptionTypes = getRequiredOptionTypes();
      const endpoints = [
        ...requiredOptionTypes.map((key) => ({
          key,
          url:
            voucherConfig.masterFields?.find((f) => f.options === key)
              ?.apiEndpoint ||
            voucherConfig.lineFields?.find((f) => f.options === key)
              ?.apiEndpoint ||
            voucherConfig.deductionFields?.find((f) => f.options === key)
              ?.apiEndpoint,
        })),
        { key: "mainAccounts", url: "/api/accounts/macno" },
        { key: "itemCategories", url: "/api/setup/item_categories" },
      ].filter((e) => e.url);

      const results = await Promise.all(
        endpoints.map(async ({ key, url }) => {
          const response = await axios.get(url);
          console.log(`Fetched ${key} from ${url}:`, response.data.data); // Log API response
          return { key, data: response.data.data || [] };
        })
      );

      const newOptionsData = results.reduce(
        (acc, { key, data }) => ({ ...acc, [key]: data }),
        {}
      );
      setOptionsData((prev) => ({ ...prev, ...newOptionsData }));
    } catch (error) {
      const errorMsg = error.message || "Unknown error";
      setErrors((prev) => ({
        ...prev,
        options: `Failed to load options: ${errorMsg}`,
      }));
      toast.error(`Failed to load options: ${errorMsg}`);
    } finally {
      setLoading((prev) => ({ ...prev, options: false }));
    }
  }, [getRequiredOptionTypes, voucherConfig]);

  const formatDateToYYYYMMDD = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "";
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    console.log(`${month}-${day}-${year}`)
    return `${year}-${month}-${day}`;
  };

  // Utility function to format ISO time to HH:mm:ss
  const formatTimeToHHMMSS = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "";
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  // Initialize form data
  useEffect(() => {
    fetchOptions();

    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toTimeString().split(" ")[0];
    const defaultMasterData =
      voucherConfig.masterFields?.reduce(
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
        { tran_code: voucherConfig.tran_code }
      ) || {};

    if (editMode && existingData) {
      const mappedMaster = {
        ...existingData.master,
        pycd: String(existingData.master.pycd || ""), // Ensure string
        godown: String(existingData.master.godown || ""), // Convert number to string
        dateD:
          formatDateToYYYYMMDD(existingData.master.dateD) ||
          formatDateToYYYYMMDD(new Date()),
        time: formatTimeToHHMMSS(existingData.master.time) || now,
        vr_no: String(existingData.master.vr_no || ""),
        check_no: String(existingData.master.check_no || ""),
        check_date: formatDateToYYYYMMDD(existingData.master.check_date) || "",
        rmk: String(existingData.master.rmk || ""),
        invoice_no: String(existingData.master.invoice_no || "").trim(), // Trim whitespace
        rmk2: String(existingData.master.rmk2 || ""),
        tran_code:
          Number(existingData.master.tran_code) || voucherConfig.tran_code,
      };

      const mappedLines = existingData.lines?.map((line) => ({
        ...line,
        itcd: String(line.itcd || ""), // Convert number to string
        no_of_pack: Number(line.no_of_pack) || 0,
        qty_per_pack: Number(line.qty_per_pack) || 0,
        qty: Number(line.qty) || 0,
        rate: Number(line.rate) || 0,
        gross_amount: Number(line.gross_amount) || 0,
        st_rate: Number(line.st_rate) || 0,
        st_amount: Number(line.st_amount) || 0,
        additional_tax: Number(line.additional_tax) || 0,
        camt: Number(line.camt) || 0,
      })) || [{}];

      setMasterData(mappedMaster);
      setMainLines(mappedLines.length > 0 ? mappedLines : [{}]);
      setDeductionLines(
        existingData.deductions?.length > 0 ? existingData.deductions : [{}]
      );
    } else {
      setMasterData(defaultMasterData);
      setMainLines([{}]);
      setDeductionLines([{}]);
    }
  }, [voucherConfig, editMode, existingData, fetchOptions]);

  // Fetch next voucher number for create mode
  useEffect(() => {
    if (
      !editMode &&
      voucherConfig.masterFields?.some(
        (f) => f.name === "vr_no" && f.autoGenerate
      )
    ) {
      const fetchVrNo = async () => {
        setLoading((prev) => ({ ...prev, vrNo: true }));
        try {
          const response = await axios.get(
            `/api/voucher/next-vr-no?tran_code=${voucherConfig.tran_code}`
          );
          setMasterData((prev) => ({ ...prev, vr_no: response.data.nextVrNo }));
        } catch (error) {
          toast.error(`Failed to fetch voucher number: ${error.message}`);
        } finally {
          setLoading((prev) => ({ ...prev, vrNo: false }));
        }
      };
      fetchVrNo();
    }
  }, [voucherConfig, editMode]);

  // Calculate totals
  useEffect(() => {
    if (!voucherConfig.totals) return;

    const calculatedTotals = Object.entries(voucherConfig.totals).reduce(
      (acc, [key, config]) => {
        const lines = key === "deductionTotal" ? deductionLines : mainLines;
        acc[key] = config.calculate(lines, acc) || 0;
        return acc;
      },
      {}
    );

    setTotals(calculatedTotals);
    prevMainLinesRef.current = JSON.stringify(mainLines);
    prevDeductionLinesRef.current = JSON.stringify(deductionLines);
  }, [mainLines, deductionLines, voucherConfig]);

  // Event Handlers
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
      (acc, dep) => ({ ...acc, [dep]: parseFloat(line[dep]) || 0 }),
      {}
    );
    return fieldConfig.calculate(dependencies) || 0;
  };

  const handleLineChange = (index, fieldName, value, isMain) => {
    const lines = isMain ? [...mainLines] : [...deductionLines];
    const fieldConfigs = isMain
      ? voucherConfig.lineFields
      : voucherConfig.deductionFields;
    const fieldConfig = fieldConfigs.find(
      (f) => (f.formName || f.name) === fieldName
    );

    if (!fieldConfig) return;

    const processedValue =
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

    setErrors((prev) => ({
      ...prev,
      validation: {
        ...prev.validation,
        [`${isMain ? "main" : "deduction"}-${index}-${fieldName}`]: null,
      },
    }));
  };

  const addLine = (isMain) => {
    const newLine = {};
    const fields = isMain
      ? voucherConfig.lineFields
      : voucherConfig.deductionFields;
    fields?.forEach((field) => {
      if (field.calculate && field.dependencies)
        newLine[field.formName || field.name] = 0;
    });
    if (isMain) setMainLines((prev) => [...prev, newLine]);
    else setDeductionLines((prev) => [...prev, newLine]);
  };

  const removeLine = (index, isMain) => {
    const lines = isMain ? mainLines : deductionLines;
    if (lines.length <= 1) return;

    const newLines = lines.filter((_, i) => i !== index);
    if (isMain) setMainLines(newLines);
    else setDeductionLines(newLines);

    setSelectedRows((prev) =>
      prev.filter((k) => k !== `${isMain ? "main" : "deduction"}-${index}`)
    );
    setErrors((prev) => {
      const newValidation = { ...prev.validation };
      Object.keys(newValidation).forEach((key) => {
        if (key.startsWith(`${isMain ? "main" : "deduction"}-${index}`))
          delete newValidation[key];
      });
      return { ...prev, validation: newValidation };
    });
  };

  const toggleRowSelection = (index, isMain) => {
    const rowKey = `${isMain ? "main" : "deduction"}-${index}`;
    setSelectedRows((prev) =>
      prev.includes(rowKey)
        ? prev.filter((k) => k !== rowKey)
        : [...prev, rowKey]
    );
  };

  const toggleAllRowSelection = (isMain) => {
    const prefix = isMain ? "main" : "deduction";
    const currentLines = isMain ? mainLines : deductionLines;
    const allSelected = currentLines.every((_, i) =>
      selectedRows.includes(`${prefix}-${i}`)
    );
    setSelectedRows((prev) =>
      allSelected
        ? prev.filter((k) => !k.startsWith(prefix))
        : [
            ...prev.filter((k) => !k.startsWith(prefix)),
            ...currentLines.map((_, i) => `${prefix}-${i}`),
          ]
    );
  };

  const deleteSelectedRows = (isMain) => {
    const prefix = isMain ? "main" : "deduction";
    const currentLines = isMain ? mainLines : deductionLines;
    const newLines = currentLines.filter(
      (_, i) => !selectedRows.includes(`${prefix}-${i}`)
    ) || [{}];
    if (isMain) setMainLines(newLines);
    else setDeductionLines(newLines);
    setSelectedRows((prev) => prev.filter((k) => !k.startsWith(prefix)));
  };

  // Validation and Submission
  const validateForm = () => {
    const newErrors = {};

    // Master fields validation
    voucherConfig.masterFields?.forEach((field) => {
      const fieldName = field.formName || field.name;
      if (field.required && !masterData[fieldName]?.toString().trim()) {
        newErrors[fieldName] = `${field.label} is required`;
      }
    });

    // Main lines validation
    if (
      !mainLines.some((line) =>
        Object.values(line).some((v) => v?.toString().trim())
      )
    ) {
      newErrors.mainLines = "At least one line item is required";
    } else {
      mainLines.forEach((line, index) => {
        voucherConfig.lineFields?.forEach((field) => {
          const fieldName = field.formName || field.name;
          if (field.required && !line[fieldName]?.toString().trim()) {
            newErrors[
              `main-${index}-${fieldName}`
            ] = `${field.label} is required`;
          }
        });
      });
    }

    // Deduction lines validation
    if (voucherConfig.hasDeductionBlock) {
      deductionLines.forEach((line, index) => {
        if (Object.values(line).some((v) => v?.toString().trim())) {
          voucherConfig.deductionFields?.forEach((field) => {
            const fieldName = field.formName || field.name;
            if (field.required && !line[fieldName]?.toString().trim()) {
              newErrors[
                `deduction-${index}-${fieldName}`
              ] = `${field.label} is required`;
            }
          });
        }
      });
    }

    // Balance check
    if (voucherConfig.balanceCheck) {
      const formData = {
        master: masterData,
        lines: mainLines,
        deductions: deductionLines,
        totals,
      };
      if (!voucherConfig.balanceCheck.condition(formData)) {
        newErrors.balance =
          typeof voucherConfig.balanceCheck.errorMessage === "function"
            ? voucherConfig.balanceCheck.errorMessage(formData)
            : voucherConfig.balanceCheck.errorMessage;
      }
    }

    setErrors((prev) => ({ ...prev, validation: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const prepareFormData = () => ({
    master: { ...masterData, tran_code: voucherConfig.tran_code },
    lines: mainLines.filter((line) =>
      Object.values(line).some((v) => v?.toString().trim())
    ),
    deductions: voucherConfig.hasDeductionBlock
      ? deductionLines.filter((line) =>
          Object.values(line).some((v) => v?.toString().trim())
        )
      : [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading.options || loading.vrNo) {
      toast.error("Please wait for all operations to complete");
      return;
    }

    if (!validateForm()) {
      toast.error("Please correct the highlighted errors");
      const firstErrorKey = Object.keys(errors.validation)[0];
      if (firstErrorKey) {
        const element = document.querySelector(`[name="${firstErrorKey}"]`);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
        element?.focus();
      }
      return;
    }

    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      const formData = prepareFormData();
      const url =
        editMode && existingData?.voucherId
          ? `${apiMap[type]}`
          : apiMap[type];
      const method = editMode ? axios.put : axios.post;

      await method(url, formData);
      toast.success(`Voucher ${editMode ? "updated" : "saved"} successfully`);
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(
        `Failed to ${editMode ? "update" : "save"} voucher: ${errorMsg}`
      );
      setErrors((prev) => ({ ...prev, submit: errorMsg }));
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  // Utility Functions
  const getSelectOptions = (optionsType, valueKey = "id", nameKey = "name") => {
    return (optionsData[optionsType] || []).map((opt) => ({
      value: opt[valueKey]?.toString() || "",
      label: opt[nameKey] || opt.title || opt[valueKey]?.toString() || "",
    }));
  };

  // Render Functions
  const renderInputField = (line, fieldConfig, index, isMain) => {
    const fieldName = fieldConfig.formName || fieldConfig.name;
    const value = calculateFieldValue(line, fieldConfig);
    const Icon =
      ICON_MAP[fieldConfig.name] || ICON_MAP[fieldConfig.type] || FileText;

    if (fieldConfig.type === "select") {
      console.log(
        `Line select ${fieldName} (index ${index}): value=${line[fieldName]}, options=`,
        getSelectOptions(
          fieldConfig.options,
          fieldConfig.valueKey,
          fieldConfig.nameKey
        )
      );
      return (
        <SearchableSelect
          value={String(line[fieldName] || "")}
          onValueChange={(v) => {
            if (v === "add_new") {
              setModalType(fieldConfig.options);
              setModalField({
                ...fieldConfig,
                lineIndex: index,
                container: isMain ? "main" : "deduction",
              });
              setModalOpen(true);
            } else {
              handleLineChange(index, fieldName, v, isMain);
            }
          }}
          options={getSelectOptions(
            fieldConfig.options,
            fieldConfig.valueKey,
            fieldConfig.nameKey
          )}
          placeholder={`Select ${fieldConfig.label}`}
          label={fieldConfig.label}
          required={fieldConfig.required}
          error={
            errors.validation[
              `${isMain ? "main" : "deduction"}-${index}-${fieldName}`
            ]
          }
        />
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

    return fieldConfig.type === "textarea" ? (
      <Textarea
        value={value || ""}
        onChange={(e) =>
          handleLineChange(index, fieldName, e.target.value, isMain)
        }
        readOnly={isReadOnly}
        disabled={loading.submit || isReadOnly}
        className="h-16 text-sm w-full rounded-md border-gray-300 focus:ring-primary0 focus:border-primary0"
      />
    ) : (
      <FormInput
        icon={Icon}
        label={fieldConfig.label}
        type={inputType}
        value={value || ""}
        onChange={(e) =>
          handleLineChange(index, fieldName, e.target.value, isMain)
        }
        readOnly={isReadOnly}
        disabled={loading.submit || isReadOnly}
        className="h-9 text-sm w-full"
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
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-gray-50 rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {voucherConfig.masterFields
        ?.filter((f) => f.name !== "tran_code")
        .map((field) => {
          const fieldName = field.formName || field.name;
          const Icon = ICON_MAP[field.name] || ICON_MAP[field.type] || FileText;

          if (field.type === "select") {
            console.log(
              `Master select ${fieldName}: value=${masterData[fieldName]}, options=`,
              getSelectOptions(field.options, field.valueKey, field.nameKey)
            );
          }

          return (
            <div
              key={fieldName}
              className="flex flex-col space-y-1 min-w-[200px]"
            >
              {field.type === "select" ? (
                <SearchableSelect
                  value={String(masterData[fieldName] || "")}
                  onValueChange={(v) => {
                    if (v === "add_new") {
                      setModalType(field.options);
                      setModalField({ ...field, container: "master" });
                      setModalOpen(true);
                    } else {
                      handleMasterChange(fieldName, v);
                    }
                  }}
                  options={getSelectOptions(
                    field.options,
                    field.valueKey,
                    field.nameKey
                  )}
                  placeholder={`Select ${field.label}`}
                  label={field.label}
                  required={field.required}
                  error={errors.validation[fieldName]}
                />
              ) : field.type === "textarea" ? (
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  <Textarea
                    value={masterData[fieldName] || ""}
                    onChange={(e) =>
                      handleMasterChange(fieldName, e.target.value)
                    }
                    disabled={loading.submit}
                    className="h-16 text-sm w-full rounded-md border-gray-300 focus:ring-primary0 focus:border-primary0"
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
                  value={masterData[fieldName] || ""}
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
                  className="h-9 text-sm w-full"
                />
              )}
            </div>
          );
        })}
    </motion.div>
  );

  const renderTable = (isMain) => {
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
        className="mt-6 border rounded-lg bg-white shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-primary p-3 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Badge className="bg-white text-primary">{lines.length}</Badge>
            <span className="text-sm font-medium">{title}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteSelectedRows(isMain)}
              disabled={
                !selectedRows.some((k) => k.startsWith(prefix)) ||
                loading.submit
              }
              className="bg-white text-primary hover:bg-primary"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addLine(isMain)}
              disabled={loading.submit}
              className="bg-white text-primary hover:bg-primary"
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100 text-xs border-b text-gray-700">
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
                  >
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(`${prefix}-${idx}`)}
                        onChange={() => toggleRowSelection(idx, isMain)}
                        disabled={loading.submit}
                        className="cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="p-2 text-center text-sm">{idx + 1}</td>
                    {fields.map((f) => (
                      <td key={f.name} className="p-2 min-w-[180px]">
                        {renderInputField(line, f, idx, isMain)}
                      </td>
                    ))}
                    <td className="p-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLine(idx, isMain)}
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
                  (!isMain && k === "deductionTotal")
              )
              .map(([k, config]) => (
                <div key={k} className="text-right">
                  <span className="text-xs text-gray-700">
                    {config.label}:{" "}
                  </span>
                  <span className="text-primary font-bold">
                    {totals[k]?.toFixed(2) || "0.00"}
                  </span>
                </div>
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

    useEffect(() => {
      const initialData =
        fieldConfig.modalFields?.reduce(
          (acc, field) => ({
            ...acc,
            [field.name]:
              field.type === "number" ? 0 : field.defaultValue || "",
          }),
          {}
        ) || {};
      setEntityData(initialData);
    }, [fieldConfig]);

    const validateModal = () => {
      const newErrors = {};
      fieldConfig.modalFields?.forEach((field) => {
        if (field.required && !entityData[field.name]?.toString().trim()) {
          newErrors[field.name] = `${field.label} is required`;
        }
      });
      setModalErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
      if (!validateModal()) {
        toast.error("Please fix validation errors in the form");
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await axios.post(
          fieldConfig.createEndpoint,
          entityData
        );
        onSave(response.data);
        toast.success(`${fieldConfig.label} added successfully`);
        onClose();
      } catch (error) {
        toast.error(`Failed to add ${fieldConfig.label}: ${error.message}`);
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
          <div className="space-y-4">
            {fieldConfig.modalFields?.map((field) => {
              const Icon =
                ICON_MAP[field.name] || ICON_MAP[field.type] || FileText;
              return (
                <div key={field.name} className="space-y-1">
                  {field.type === "select" ? (
                    <SearchableSelect
                      value={entityData[field.name] || ""}
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
                      <Label className="text-xs text-gray-700">
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
                        disabled={isSubmitting}
                        className="h-16 text-sm w-full rounded-md border-gray-300 focus:ring-primary0 focus:border-primary0"
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
                      className="h-9 text-sm w-full"
                    />
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-primary text-white hover:bg-primary"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Render Logic
  if (!voucherConfig || !Object.keys(voucherConfig).length) {
    return (
      <div className="min-w-[320px] max-w-full bg-gray-100 min-h-screen p-4 flex flex-col items-center justify-center">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Invalid voucher type: "{type}"</AlertDescription>
        </Alert>
        <Button
          onClick={onClose}
          className="bg-primary text-white hover:bg-primary"
        >
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="min-w-[320px] max-w-full min-h-screen p-4 bg-gray-100">
      <Toaster richColors />
      {(loading.options || loading.vrNo) && (
        <div className="flex justify-center mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
          />
        </div>
      )}
      {Object.values(errors.validation).some(Boolean) && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Errors</AlertTitle>
          <AlertDescription>
            {Object.values(errors.validation).filter(Boolean).join("; ")}
          </AlertDescription>
        </Alert>
      )}
      {errors.submit && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Submission Error</AlertTitle>
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <Card className="mb-6 shadow-md">
          <CardHeader className="bg-primary text-white">
            <CardTitle className="text-lg">
              {editMode ? "Edit Voucher Details" : "Voucher Details"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">{renderMasterFields()}</CardContent>
        </Card>
        {renderTable(true)}
        {voucherConfig.hasDeductionBlock && renderTable(false)}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading.submit}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading.submit || loading.options || loading.vrNo}
            className="bg-primary text-white hover:bg-primary"
          >
            {loading.submit ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                {editMode ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                {editMode ? "Update Voucher" : "Save Voucher"}
              </>
            )}
          </Button>
        </div>
      </form>
      {modalOpen && (
        <AddEntityModal
          onClose={() => setModalOpen(false)}
          onSave={(newEntity) => {
            setOptionsData((prev) => ({
              ...prev,
              [modalType]: [...prev[modalType], newEntity],
            }));
            const fieldName = modalField.formName || modalField.name;
            const newValue = newEntity[modalField.valueKey];
            if (modalField.container === "master") {
              handleMasterChange(fieldName, newValue);
            } else if (modalField.lineIndex !== undefined) {
              handleLineChange(
                modalField.lineIndex,
                fieldName,
                newValue,
                modalField.container === "main"
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

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Trash2, Save, X, AlertCircle } from "lucide-react";
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
import axios from "axios";
import { VOUCHER_CONFIG } from "./constants";

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
    godowns: [],
  });
  const [loading, setLoading] = useState({
    options: true,
    submit: false,
    vrNo: false,
  });
  const [errors, setErrors] = useState({
    options: null,
    submit: null,
    validation: null,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalField, setModalField] = useState({});

  const apiMap = {
    payment: "/api/voucher/payment",
    receipt: "/api/voucher/receipt",
    journal: "/api/voucher/journal",
    purchase: "/api/voucher/purchase",
    sale: "/api/voucher/sale",
  };

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
      const endpointMap = {
        accounts: "/api/accounts/acno?macno=001",
        costCenters: "/api/setup/cost_centers",
        currencies: "/api/setup/currencies",
        suppliers: "/api/setup/suppliers",
        customers: "/api/setup/customers",
        products: "/api/setup/products",
        godowns: "/api/setup/godowns",
      };
      const requiredOptionTypes = getRequiredOptionTypes();
      const endpoints = Object.entries(endpointMap)
        .filter(([key]) => requiredOptionTypes.includes(key))
        .map(([key, url]) => ({ key, url }));

      const initialOptionsData = requiredOptionTypes.reduce(
        (acc, key) => ({ ...acc, [key]: [] }),
        {}
      );

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
    } finally {
      setLoading((prev) => ({ ...prev, options: false }));
    }
  }, [getRequiredOptionTypes]);

  const fetchNextVrNo = async (tran_code) => {
    try {
      const response = await axios.get(
        `/api/voucher/next-vr-no?tran_code=${tran_code}`
      );
      return response.data.nextVrNo;
    } catch (error) {
      console.error("Error fetching next voucher number:", error);
      return "";
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

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
  }, [mainLines, deductionLines, voucherConfig]);

  const handleMasterChange = (name, value) => {
    setMasterData((prev) => ({
      ...prev,
      [name]: value === "placeholder" ? "" : value,
    }));
    setErrors((prev) => ({ ...prev, validation: null }));
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

    setErrors((prev) => ({ ...prev, validation: null }));
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

  const removeLine = (index, isMain = true) => {
    const lines = isMain ? [...mainLines] : [...deductionLines];
    if (lines.length <= 1) return;

    lines.splice(index, 1);
    if (isMain) setMainLines(lines);
    else setDeductionLines(lines);

    setSelectedRows((prev) =>
      prev.filter((k) => k !== `${isMain ? "main" : "deduction"}-${index}`)
    );
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
    const missingFields = (
      voucherConfig.masterFields?.filter((f) => f.required) || []
    )
      .filter((f) => !masterData[f.formName || f.name]?.toString().trim())
      .map((f) => f.label);

    if (missingFields.length) {
      setErrors((prev) => ({
        ...prev,
        validation: `Required fields missing: ${missingFields.join(", ")}`,
      }));
      return false;
    }

    if (
      !mainLines.some((line) =>
        Object.values(line).some((v) => v?.toString().trim())
      )
    ) {
      setErrors((prev) => ({
        ...prev,
        validation: "At least one line item is required.",
      }));
      return false;
    }

    if (voucherConfig.balanceCheck) {
      const formData = {
        master: masterData,
        lines: mainLines,
        deductions: deductionLines,
        totals,
      };
      if (!voucherConfig.balanceCheck.condition(formData)) {
        const errorMsg = typeof voucherConfig.balanceCheck.errorMessage === 'function'
          ? voucherConfig.balanceCheck.errorMessage(formData)
          : voucherConfig.balanceCheck.errorMessage;
        setErrors((prev) => ({
          ...prev,
          validation: errorMsg,
        }));
        return false;
      }
    }

    return true;
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
    if (!validateForm()) return;

    setLoading((prev) => ({ ...prev, submit: true }));
    setErrors((prev) => ({ ...prev, submit: null }));

    try {
      const formData = prepareFormData();
      await axios.post(apiMap[type], formData);
      onClose();
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: `Failed to save: ${
          error.response?.data?.message || error.message
        }`,
      }));
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const getSelectOptions = (optionsType, valueKey = 'id', nameKey = 'name') => {
    const options = optionsData[optionsType];
    
    if (!options || !Array.isArray(options)) {
      console.warn(`No options available for ${optionsType} or not an array`);
      return [];
    }
    
    return options.map(opt => ({
      value: opt[valueKey]?.toString() || '',
      label: opt[nameKey] || opt.title || opt[valueKey]?.toString() || ''
    }));
  }

  const renderSelectField = (field, value, onChange, optionsType) => {
    const options = getSelectOptions(
      optionsType,
      field.valueKey,
      field.nameKey
    );

    return (
      <Select
        value={value?.toString() || ""}
        onValueChange={(v) => {
          if (v === "add_new") {
            setModalType(optionsType);
            setModalField(field);
            setModalOpen(true);
          } else {
            onChange(v);
          }
        }}
      >
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder={`Select ${field.label}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="placeholder" className="text-gray-400">
            Select {field.label}
          </SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
          <SelectItem value="add_new" className="text-blue-600">
            Add New {field.label}
          </SelectItem>
        </SelectContent>
      </Select>
    );
  };

  const renderInputField = (line, fieldConfig, index, isMain) => {
    const fieldName = fieldConfig.formName || fieldConfig.name;
    const value = calculateFieldValue(line, fieldConfig);

    if (fieldConfig.type === "select") {
      return renderSelectField(
        fieldConfig,
        line[fieldName],
        (v) => handleLineChange(index, fieldName, v, isMain),
        fieldConfig.options
      );
    }

    const inputType =
      fieldConfig.type === "number"
        ? "number"
        : fieldConfig.type === "date"
        ? "date"
        : "text";
    const isReadOnly = fieldConfig.calculate && fieldConfig.dependencies;

    return (
      <Input
        type={inputType}
        value={
          fieldConfig.type === "number" && typeof value === "number"
            ? value.toFixed(2)
            : value || ""
        }
        onChange={(e) =>
          handleLineChange(index, fieldName, e.target.value, isMain)
        }
        readOnly={isReadOnly}
        disabled={loading.submit || isReadOnly}
        className="h-8 text-xs w-full"
      />
    );
  };

  const renderMasterFields = () => (
    <motion.div
      className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {voucherConfig.masterFields
        ?.filter((f) => f.name !== "tran_code")
        .map((field) => {
          const fieldName = field.formName || field.name;
          return (
            <motion.div
              key={fieldName}
              className="flex flex-col space-y-1 min-w-[160px] flex-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Label className="text-xs text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
              {field.type === "select" ? (
                renderSelectField(
                  field,
                  masterData[fieldName],
                  (v) => handleMasterChange(fieldName, v),
                  field.options
                )
              ) : (
                <Input
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
                  className="h-9 text-sm"
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
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-3 flex justify-between items-center text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <Badge className="bg-white text-blue-600">{lines.length}</Badge>
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
              className="bg-white text-blue-600 hover:bg-blue-100"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addLine(isMain)}
              disabled={loading.submit}
              className="bg-white text-blue-600 hover:bg-blue-100"
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
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
                    className={`border-b hover:bg-gray-50 ${
                      selectedRows.includes(`${prefix}-${idx}`)
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >
                    <td className="p-1 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(`${prefix}-${idx}`)}
                        onChange={() => toggleRowSelection(idx, isMain)}
                        disabled={loading.submit}
                      />
                    </td>
                    <td className="p-1 text-center text-sm">{idx + 1}</td>
                    {fields.map((f) => (
                      <td key={f.name} className="p-1 min-w-[120px]">
                        {renderInputField(line, f, idx, isMain)}
                      </td>
                    ))}
                    <td className="p-1 text-center">
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
                  (!isMain && ["deductionTotal", "netTotal"].includes(k))
              )
              .map(([k, config]) => (
                <div key={k} className="text-right">
                  <span className="text-xs text-gray-700">
                    {config.label}:{" "}
                  </span>
                  <span className="text-blue-600 font-bold">
                    {totals[k]?.toFixed(2) || "0.00"}
                  </span>
                </div>
              ))}
          </div>
        )}
      </motion.div>
    );
  };

  const AddAccountModal = ({ onClose, onSave }) => {
    const [accountData, setAccountData] = useState({
      acname: "",
      macno: "001",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
      try {
        setIsSubmitting(true);
        const response = await axios.post("/api/accounts/acno", accountData);
        onSave(response.data);
      } catch (error) {
        console.error("Error adding account:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Account Name</Label>
              <Input
                placeholder="Account Name"
                value={accountData.acname}
                onChange={(e) =>
                  setAccountData({ ...accountData, acname: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Main Account</Label>
              <Select
                value={accountData.macno}
                onValueChange={(v) =>
                  setAccountData({ ...accountData, macno: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Main Account" />
                </SelectTrigger>
                <SelectContent>
                  {optionsData.accounts.map((a) => (
                    <SelectItem key={a.acno} value={a.acno}>
                      {a.acname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting || !accountData.acname.trim()}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const AddCostCenterModal = ({ onClose, onSave }) => {
    const [costCenterData, setCostCenterData] = useState({ ccname: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
      try {
        setIsSubmitting(true);
        const response = await axios.post("/api/setup/cost_centers", costCenterData);
        onSave(response.data);
      } catch (error) {
        console.error("Error adding cost center:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Cost Center</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Cost Center Name</Label>
              <Input
                placeholder="Cost Center Name"
                value={costCenterData.ccname}
                onChange={(e) =>
                  setCostCenterData({
                    ...costCenterData,
                    ccname: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting || !costCenterData.ccname.trim()}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={onClose}>
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
    <div className="min-w-[320px] max-w-full bg-gray-100 min-h-screen p-4">
      <motion.div
        className="mb-4 flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-800">
          {type.charAt(0).toUpperCase() + type.slice(1)} Voucher
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="hover:bg-gray-200"
        >
          <X className="h-4 w-4 mr-1" />
          Close
        </Button>
      </motion.div>

      {errors.options && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errors.options}</AlertDescription>
        </Alert>
      )}

      {errors.validation && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errors.validation}</AlertDescription>
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
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-lg text-gray-800">
              Voucher Details
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
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading.submit || loading.options || loading.vrNo}
            className="bg-blue-600 hover:bg-blue-700"
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
        </div>
      </form>

      {modalOpen && modalType === "accounts" && (
        <AddAccountModal
          onClose={() => setModalOpen(false)}
          onSave={(newAccount) => {
            setOptionsData((prev) => ({
              ...prev,
              accounts: [...prev.accounts, newAccount],
            }));
            handleMasterChange(
              modalField.formName || modalField.name,
              newAccount.acno
            );
            setModalOpen(false);
          }}
        />
      )}

      {modalOpen && modalType === "costCenters" && (
        <AddCostCenterModal
          onClose={() => setModalOpen(false)}
          onSave={(newCostCenter) => {
            setOptionsData((prev) => ({
              ...prev,
              costCenters: [...prev.costCenters, newCostCenter],
            }));
            handleMasterChange(
              modalField.formName || modalField.name,
              newCostCenter.ccno
            );
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
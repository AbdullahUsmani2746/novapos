"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { REPORT_CONFIG } from "./config";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  DownloadIcon,
  FilterIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  BarChart3Icon,
  CalendarIcon,
  SearchIcon,
  XIcon,
  EyeIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  FileIcon,
  ChevronDownIcon,
  Loader2Icon,
  DatabaseIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  Clock,
  Users,
  DollarSign,
  Activity,
} from "lucide-react";

const ReportViewer = ({ reportType }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Core state
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [config, setConfig] = useState(null);
  const [filters, setFilters] = useState({});
  const [filterOptions, setFilterOptions] = useState({});

  // UI state
  const [showFilters, setShowFilters] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Animation states
  const [isFilterAnimating, setIsFilterAnimating] = useState(false);
  const [dataLoadingProgress, setDataLoadingProgress] = useState(0);
  const [summaryAnimationDelay, setSummaryAnimationDelay] = useState(0);

  // Initialize configuration and filters
  useEffect(() => {
    if (!reportType) return;

    const reportConfig = REPORT_CONFIG[reportType];
    if (!reportConfig) {
      console.error("Invalid report type:", reportType);
      return;
    }

    setConfig(reportConfig);

    // Initialize filters from URL params
    const initialFilters = {};
    reportConfig.filters.forEach((filter) => {
      const paramValue = searchParams.get(filter.name);

      if (paramValue !== null) {
        if (filter.type === "date") {
          initialFilters[filter.name] = new Date(paramValue);
        } else {
          initialFilters[filter.name] =
            filter.type === "checkbox" ? paramValue === "true" : paramValue;
        }
      } else if (filter.default !== undefined) {
        initialFilters[filter.name] = filter.default;
      }
    });

    setFilters(initialFilters);
    loadFilterOptions(reportConfig.filters, initialFilters);
  }, [reportType, searchParams]);

  // Load data when config or filters change
  useEffect(() => {
    if (config && Object.keys(filters).length > 0) {
      loadReportData();
    }
  }, [config, filters]);

  const loadFilterOptions = async (filterDefs, currentFilters) => {
    const options = {};

    for (const filter of filterDefs) {
      if (filter.options && filter.apiEndpoint) {
        try {
          let endpoint = filter.apiEndpoint;

          if (filter.dependsOn) {
            const dependentValue = currentFilters[filter.dependsOn];
            if (!dependentValue) continue;
            endpoint += `${endpoint.includes("?") ? "&" : "?"}${
              filter.dependsOn
            }=${dependentValue}`;
          }

          const res = await fetch(endpoint);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const data = await res.json();
          options[filter.name] = Array.isArray(data) ? data : data.data || [];
        } catch (error) {
          console.error(`Error loading options for ${filter.name}:`, error);
          options[filter.name] = [];
        }
      }
    }

    setFilterOptions(options);
  };

  const loadReportData = async () => {
    if (!config) return;

    setLoading(true);
    setDataLoadingProgress(0);

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setDataLoadingProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressInterval);
          return 85;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, value);
          }
        }
      });

      const res = await fetch(`${config.apiEndpoint}?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const reportData = await res.json();

      clearInterval(progressInterval);
      setDataLoadingProgress(100);

      // Brief delay for smooth animation
      setTimeout(() => {
        setData(reportData.data || []);
        setSummary(reportData.summary || {});
        setDataLoadingProgress(0);
        setLoading(false);
        setSummaryAnimationDelay(200);
      }, 300);
    } catch (error) {
      console.error("Error loading report data:", error);
      clearInterval(progressInterval);
      setData([]);
      setSummary({});
      setDataLoadingProgress(0);
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setIsFilterAnimating(true);
    setTimeout(() => setIsFilterAnimating(false), 300);

    const newFilters = {
      ...filters,
      [name]: value === "All" ? "" : value,
    };
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== "") {
        if (val instanceof Date) {
          params.append(key, val.toISOString());
        } else {
          params.append(key, val);
        }
      }
    });
    router.replace(`?${params.toString()}`);
  };

  const handleDateChange = (name, date) => {
    const newFilters = { ...filters, [name]: date };
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== "") {
        if (val instanceof Date) {
          params.append(key, val.toISOString());
        } else {
          params.append(key, val);
        }
      }
    });
    router.replace(`?${params.toString()}`);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleRowClick = (row) => {
    if (config.detailColumns) {
      console.log(row.transactions);
      setDetailRow(row.transactions);
      setShowDetails(true);
    }
  };

  const handleExport = async (format) => {
    if (!data || data.length === 0) return;

    setIsExporting(true);

    try {
      switch (format) {
        case "excel":
          await exportToExcel();
          break;
        case "pdf":
          await exportToPDF();
          break;
        case "csv":
          await exportToCSV();
          break;
      }
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => {
        const row = {};
        config.columns.forEach((col) => {
          if (col.valueGetter) {
            row[col.headerName] = col.valueGetter({ row: item });
          } else {
            row[col.headerName] = item[col.field];
          }
        });
        return row;
      })
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, config.title);
    XLSX.writeFile(
      workbook,
      `${config.title}_${format(new Date(), "yyyy-MM-dd")}.xlsx`
    );
  };

  const exportToPDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(config.title, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on ${format(new Date(), "PPP")}`, 14, 28);

    const headers = config.columns.map((col) => col.headerName);
    const rows = data.map((item) =>
      config.columns.map((col) => {
        if (col.valueGetter) {
          return String(col.valueGetter({ row: item }) || "");
        }
        return String(item[col.field] || "");
      })
    );

    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 35,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
    });

    doc.save(`${config.title}_${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const exportToCSV = async () => {
    const headers = config.columns.map((col) => col.headerName).join(",");
    const rows = data
      .map((item) =>
        config.columns
          .map((col) => {
            let value = "";
            if (col.valueGetter) {
              value = col.valueGetter({ row: item }) || "";
            } else {
              value = item[col.field] || "";
            }
            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${config.title}_${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal || "").toLowerCase();
      const bStr = String(bVal || "").toLowerCase();

      return sortConfig.direction === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [data, sortConfig]);

  const renderFilter = (filter) => {
    switch (filter.type) {
      case "date":
        const dateValue = filters[filter.name];

        return (
          <div className="space-y-3 group">
            <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors duration-200">
              <CalendarIcon className="w-4 h-4" />
              {filter.label}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {dateValue ? (
                    <span className="text-slate-900 font-medium">
                      {format(dateValue, "MMM dd, yyyy")}
                    </span>
                  ) : (
                    <span className="text-slate-500">
                      Select {filter.label.toLowerCase()}
                    </span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 shadow-xl border-slate-200"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={dateValue}
                  onSelect={(date) => handleDateChange(filter.name, date)}
                  initialFocus
                  className="rounded-lg"
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case "select":
        return (
          <div className="space-y-3 group">
            <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors duration-200">
              <FilterIcon className="w-4 h-4" />
              {filter.label}
            </Label>
            <Select
              value={filters[filter.name] || ""}
              onValueChange={(value) => handleFilterChange(filter.name, value)}
            >
              <SelectTrigger className="border-slate-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md">
                <SelectValue
                  placeholder={`Select ${filter.label.toLowerCase()}`}
                />
              </SelectTrigger>
              <SelectContent className="shadow-xl border-slate-200">
                {filter.clearable && (
                  <SelectItem value="All">
                    All {filter.label.toLowerCase()}
                  </SelectItem>
                )}
                {(filterOptions[filter.name] || []).map((option) => (
                  <SelectItem
                    key={
                      option.value ||
                      option.id ||
                      option[filter.valueKey || "value"]
                    }
                    value={String(
                      option.value ||
                        option.id ||
                        option[filter.valueKey || "value"]
                    )}
                    className="hover:bg-blue-50"
                  >
                    {option.label ||
                      option.name ||
                      option[filter.nameKey || "label"]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50/50 transition-all duration-200 group">
            <Checkbox
              id={filter.name}
              checked={!!filters[filter.name]}
              onCheckedChange={(checked) =>
                handleFilterChange(filter.name, checked)
              }
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <Label
              htmlFor={filter.name}
              className="text-sm font-medium text-slate-700 cursor-pointer group-hover:text-blue-600 transition-colors"
            >
              {filter.label}
            </Label>
          </div>
        );

      default:
        return (
          <div className="space-y-3 group">
            <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors duration-200">
              <SearchIcon className="w-4 h-4" />
              {filter.label}
            </Label>
            <Input
              value={filters[filter.name] || ""}
              onChange={(e) => handleFilterChange(filter.name, e.target.value)}
              placeholder={
                filter.placeholder || `Enter ${filter.label.toLowerCase()}`
              }
              className="border-slate-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
            />
          </div>
        );
    }
  };

  const renderSummaryCard = (field, value, index) => {
    const icons = {
      currency: DollarSign,
      number: Users,
      percent: Activity,
      default: BarChart3Icon,
    };

    const Icon = icons[field.type] || icons.default;
    const isPositive = typeof value === "number" && value > 0;

    return (
      <div
        className="bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 p-6 rounded-2xl border border-slate-200/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-500 transform hover:scale-[1.02] group"
        style={{
          animationDelay: `${summaryAnimationDelay + index * 100}ms`,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <Label className="text-sm font-semibold text-slate-600 group-hover:text-slate-700 transition-colors">
            {field.label}
          </Label>
          <div
            className={`p-3 rounded-xl transition-all duration-300 ${
              field.type === "currency"
                ? "bg-green-100 group-hover:bg-green-200"
                : field.type === "percent"
                ? "bg-blue-100 group-hover:bg-blue-200"
                : "bg-purple-100 group-hover:bg-purple-200"
            }`}
          >
            <Icon
              className={`w-5 h-5 ${
                field.type === "currency"
                  ? "text-green-600"
                  : field.type === "percent"
                  ? "text-blue-600"
                  : "text-purple-600"
              }`}
            />
          </div>
        </div>
        <div className="text-3xl font-bold text-slate-900 mb-1">
          {field.type === "currency"
            ? formatCurrency(value)
            : field.type === "percent"
            ? `${(value || 0).toFixed(1)}%`
            : typeof value === "number"
            ? value.toLocaleString()
            : value}
        </div>
        {field.type === "percent" && (
          <div className="flex items-center gap-1 text-sm">
            {isPositive ? (
              <TrendingUpIcon className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDownIcon className="w-4 h-4 text-red-500" />
            )}
            <span className={isPositive ? "text-green-600" : "text-red-600"}>
              vs last period
            </span>
          </div>
        )}
      </div>
    );
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="shadow-2xl border-slate-200/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Loader2Icon className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Loading Report Configuration...
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Please wait while we prepare your report
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-12 space-y-8">
              <div className="space-y-4">
                <div className="h-4 bg-slate-200 rounded-full animate-pulse" />
                <div className="h-4 bg-slate-200 rounded-full animate-pulse w-3/4" />
                <div className="h-4 bg-slate-200 rounded-full animate-pulse w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />

          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
                <SparklesIcon className="w-8 h-8" />
                {config.title}
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">
                {config.description}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <BarChart3Icon className="w-10 h-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="shadow-xl border-slate-200/50 overflow-hidden backdrop-blur-sm bg-white/80">
          <CardHeader className="bg-gradient-to-r from-white to-slate-50/80 border-b border-slate-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FilterIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    Advanced Filters
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Refine your data with powerful filtering options
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
              >
                <ChevronDownIcon
                  className={`w-5 h-5 transition-transform duration-300 ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </div>
          </CardHeader>

          {showFilters && (
            <>
              <CardContent className="p-8 bg-gradient-to-br from-slate-50/50 to-white">
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all duration-300 ${
                    isFilterAnimating
                      ? "scale-[0.98] opacity-80"
                      : "scale-100 opacity-100"
                  }`}
                >
                  {config.filters.map((filter) => (
                    <div
                      key={filter.name}
                      className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      {renderFilter(filter)}
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="bg-white border-t border-slate-200/50 p-6">
                <div className="flex items-center justify-between w-full">
                  <Button
                    onClick={loadReportData}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <>
                        <Loader2Icon className="w-5 h-5 mr-3 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <RefreshCwIcon className="w-5 h-5 mr-3" />
                        Apply Filters
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-3">
                    {config.exportOptions?.excel && (
                      <Button
                        variant="outline"
                        onClick={() => handleExport("excel")}
                        disabled={isExporting || data.length === 0}
                        className="border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200 transform hover:scale-105"
                      >
                        <FileSpreadsheetIcon className="w-4 h-4 mr-2 text-green-600" />
                        Excel
                      </Button>
                    )}

                    {config.exportOptions?.pdf && (
                      <Button
                        variant="outline"
                        onClick={() => handleExport("pdf")}
                        disabled={isExporting || data.length === 0}
                        className="border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 transform hover:scale-105"
                      >
                        <FileTextIcon className="w-4 h-4 mr-2 text-red-600" />
                        PDF
                      </Button>
                    )}

                    {config.exportOptions?.csv && (
                      <Button
                        variant="outline"
                        onClick={() => handleExport("csv")}
                        disabled={isExporting || data.length === 0}
                        className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 transform hover:scale-105"
                      >
                        <FileIcon className="w-4 h-4 mr-2 text-blue-600" />
                        CSV
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {loading && dataLoadingProgress > 0 && (
                  <div className="w-full mt-4">
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${dataLoadingProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-slate-600 mt-2 text-center">
                      Loading data... {Math.round(dataLoadingProgress)}%
                    </p>
                  </div>
                )}
              </CardFooter>
            </>
          )}
        </Card>

        {/* Summary Cards */}
        {summary && Object.keys(summary).length > 0 && config.summaryFields && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.summaryFields.map((field, index) => (
              <div key={field.field} className="animate-fade-in-up">
                {renderSummaryCard(field, summary[field.field], index)}
              </div>
            ))}
          </div>
        )}

        {/* Data Table */}
        <Card className="shadow-2xl border-slate-200/50 overflow-hidden backdrop-blur-sm bg-white/90">
          <CardHeader className="bg-gradient-to-r from-white to-slate-50/80 border-b border-slate-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <DatabaseIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    Report Data
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    {loading
                      ? "Loading data..."
                      : sortedData.length > 0
                      ? `${sortedData.length} records found`
                      : "No data available"}
                  </CardDescription>
                </div>
              </div>
              {sortedData.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Live Data
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 space-y-6">
                <div className="flex items-center justify-center space-x-4">
                  <Loader2Icon className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="text-lg font-medium text-slate-700">
                    Loading report data...
                  </span>
                </div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 bg-slate-200 rounded animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ) : sortedData.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <DatabaseIcon className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  No Data Found
                </h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  No records match your current filter criteria. Try adjusting
                  your filters or check back later.
                </p>
                <Button
                  onClick={loadReportData}
                  variant="outline"
                  className="mt-4"
                >
                  <RefreshCwIcon className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow className="border-slate-200/50">
                      {config.columns.map((column) => (
                        <TableHead
                          key={column.field}
                          className={`font-bold text-slate-700 ${
                            column.sortable
                              ? "cursor-pointer hover:bg-slate-100 transition-colors"
                              : ""
                          }`}
                          onClick={() =>
                            column.sortable && handleSort(column.field)
                          }
                        >
                          <div className="flex items-center gap-2">
                            {column.headerName}
                            {column.sortable &&
                              sortConfig.key === column.field &&
                              (sortConfig.direction === "asc" ? (
                                <ArrowUpIcon className="w-4 h-4 text-blue-600" />
                              ) : (
                                <ArrowDownIcon className="w-4 h-4 text-blue-600" />
                              ))}
                          </div>
                        </TableHead>
                      ))}
                      {config.detailColumns && (
                        <TableHead className="font-bold text-slate-700">
                          Actions
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedData.map((row, index) => (
                      <TableRow
                        key={index}
                        className={`border-slate-200/50 hover:bg-slate-50/50 transition-all duration-200 ${
                          config.detailColumns ? "cursor-pointer" : ""
                        }`}
                        onClick={() => handleRowClick(row)}
                      >
                        {config.columns.map((column) => (
                          <TableCell key={column.field} className="py-4">
                            {column.valueGetter ? (
                              <span className={column.className || ""}>
                                {column.valueGetter({ row })}
                              </span>
                            ) : column.type === "currency" ? (
                              <span className="font-semibold text-green-600">
                                {formatCurrency(row[column.field])}
                              </span>
                            ) : column.type === "badge" ? (
                              <Badge
                                variant={getBadgeVariant(row[column.field])}
                                className="font-medium"
                              >
                                {row[column.field]}
                              </Badge>
                            ) : (
                              <span className={column.className || ""}>
                                {row[column.field]}
                              </span>
                            )}
                          </TableCell>
                        ))}
                        {config.detailColumns && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-blue-50 hover:text-blue-600"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Modal */}
        {showDetails && detailRow && config.detailColumns && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      Record Details
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      Detailed view of selected record
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <XIcon className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 overflow-y-auto max-h-[400px] custom-scrollbar">
                <div className="space-y-6">
                  {detailRow?.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="bg-white rounded-xl shadow border border-gray-200 p-4 "
                    >
                      {/* Section Header: Item 01, Item 02, ... */}
                      <h3 className="text-lg font-semibold text-slate-700 mb-4">
                        Item {String(rowIndex + 1).padStart(2, "0")}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {config.detailColumns.map((column) => {
                          const value = row[column.field];

                          return (
                            <div
                              key={`${rowIndex}-${column.field}`}
                              className="space-y-1 transition-all duration-200"
                            >
                              <Label className="text-sm font-medium text-gray-600">
                                {column.headerName}
                              </Label>
                              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-800 min-h-[42px]">
                                {column.valueGetter ? (
                                  column.valueGetter({ row })
                                ) : column.type === "currency" ? (
                                  <span className="font-semibold text-emerald-600">
                                    {formatCurrency(value)}
                                  </span>
                                ) : Array.isArray(value) ? (
                                  value.length === 0 ? (
                                    <span className="text-gray-400">N/A</span>
                                  ) : (
                                    <div className="flex flex-wrap gap-2">
                                      {value.map((item, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium"
                                        >
                                          {item}
                                        </span>
                                      ))}
                                    </div>
                                  )
                                ) : (
                                  value || (
                                    <span className="text-gray-400">N/A</span>
                                  )
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="bg-slate-50 border-t">
                <Button
                  onClick={() => setShowDetails(false)}
                  className="ml-auto"
                  variant="outline"
                >
                  Close
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
const formatCurrency = (value) => {
  if (typeof value !== "number") return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

const getBadgeVariant = (value) => {
  if (typeof value !== "string") return "secondary";

  const lowerValue = value.toLowerCase();
  if (
    lowerValue.includes("active") ||
    lowerValue.includes("complete") ||
    lowerValue.includes("success")
  ) {
    return "default"; // Green
  } else if (lowerValue.includes("pending") || lowerValue.includes("warning")) {
    return "secondary"; // Yellow
  } else if (
    lowerValue.includes("inactive") ||
    lowerValue.includes("error") ||
    lowerValue.includes("failed")
  ) {
    return "destructive"; // Red
  }
  return "secondary";
};

export default ReportViewer;

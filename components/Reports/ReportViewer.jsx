"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { REPORT_CONFIG } from "./config";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx-js-style";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
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
import axios from "axios";

const ReportViewer = ({ reportType }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [godowns, setGodowns] = useState([]);
  const [error, setError] = useState(null);

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

  const [showDrillDownModal, setShowDrillDownModal] = useState(false);
  const [drillDownRow, setDrillDownRow] = useState(null);
  const [drillDownFilters, setDrillDownFilters] = useState({});

  // Add this handler function
  const handleDrillDown = (row) => {
    setDrillDownRow(row);
    setDrillDownFilters({
      ...(filters.godown && { godown: filters.godown }),
      ...(filters.dateTo && { dateTo: filters.dateTo }),
    });
    if (config.drillDown.linkBuilder && !config.drillDown.fields) {
      const link = config.drillDown.linkBuilder(row, drillDownFilters);
      router.push(link);
    } else {
      setShowDrillDownModal(true);
    }
  };

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
    ta;
  };

  const handleRowClick = (row) => {
    if (config.detailColumns) {
      console.log("tx: ", row.transactions);
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


    const workbook = XLSX.utils.book_new();

    // Helper function to handle empty/zero values
    const formatCellValue = (value) => {
        if (value === null || value === undefined || value === 0 || value === "0") {
            return "0";
        }
        return value;
    };

    // Check if we should show details sheet
    const showDetails = config.detailColumns && data.some(item => item.transactions);

    if (showDetails) {
        // ============ DETAILS SHEET ============
        const detailData = [];
        data.forEach((item) => {
            if (item.transactions?.length > 0) {
                item.transactions.forEach((detail) => {
                    const detailRow = {
                      "Parent Date": formatCellValue(item.dateD) || "",
                      "Parent Voucher": formatCellValue(item.vr_no) || "",
                      "Customer": formatCellValue(item.acno.acname) || "",

                    };
                    config.detailColumns.forEach((col) => {
                        detailRow[col.headerName] = col.valueGetter 
                            ? formatCellValue(col.valueGetter({ row: detail }))
                            : formatCellValue(detail[col.field]);
                    });
                    detailData.push(detailRow);
                });
            }
        });

        const detailWorksheet = XLSX.utils.json_to_sheet(detailData, { origin: "A3" });

        // Add Title (Row 1)
        XLSX.utils.sheet_add_aoa(detailWorksheet, [[config.title]], { origin: "A1" });

        // Add generated date (Row 2)
        XLSX.utils.sheet_add_aoa(
            detailWorksheet,
            [[`Generated on ${format(new Date(), "PPP")}`]],
            { origin: "A2" }
        );

        detailWorksheet["!merges"] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: Object.keys(detailData[0] || {}).length - 1 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: Object.keys(detailData[0] || {}).length - 1 } },
        ];

        // Apply styling for header rows
        ["A1", "A2"].forEach((cellRef, idx) => {
            if (!detailWorksheet[cellRef]) {
                detailWorksheet[cellRef] = {
                    v: idx === 0 ? config.title : `Generated on ${format(new Date(), "PPP")}`,
                    t: "s",
                };
            }

            if (idx === 0) {
                // Title styling (Row 1)
                detailWorksheet[cellRef].s = {
                    font: {
                        bold: true,
                        sz: 24,
                        color: { rgb: "FFFFFF" },
                        name: "Calibri",
                        scheme: "major",
                    },
                    fill: {
                        patternType: "solid",
                        fgColor: { rgb: "27AE60" },
                        bgColor: { rgb: "27AE60" },
                    },
                    alignment: {
                        horizontal: "center",
                        vertical: "center",
                        wrapText: true,
                    },
                };

                if (!detailWorksheet["!rows"]) {
                    detailWorksheet["!rows"] = [];
                }
                detailWorksheet["!rows"][0] = { hpt: 40 };
                detailWorksheet["!rows"][1] = { hpt: 23 };
            } else {
                // Date styling (Row 2)
                detailWorksheet[cellRef].s = {
                    font: {
                        italic: true,
                        sz: 12,
                        color: { rgb: "2C3E50" },
                        name: "Calibri",
                    },
                    fill: {
                        patternType: "solid",
                        fgColor: { rgb: "D6EAF8" },
                        bgColor: { rgb: "D6EAF8" },
                    },
                    alignment: {
                        horizontal: "right",
                        vertical: "center",
                    },
                };
            }
        });

        // Calculate column widths for detail sheet with special handling for item name
        const calculateColumnWidth = (data, columnKey) => {
            const headerLength = columnKey.length;
            const maxContentLength = Math.max(
                ...data.map(row => (row[columnKey] ? row[columnKey].toString().length : 0))
            );
            
            if (columnKey.toLowerCase().includes("item") || columnKey.toLowerCase().includes("name")) {
                return Math.min(Math.max(headerLength, maxContentLength, 25), 40);
            }
            return Math.min(Math.max(headerLength, maxContentLength, 10), 30);
        };

        const detailWscols = Object.keys(detailData[0] || {}).map(key => ({
            wch: key.toLowerCase().includes("item") || key.toLowerCase().includes("name")
                ? 30
                : calculateColumnWidth(detailData, key)
        }));
        detailWorksheet["!cols"] = detailWscols;

        // Set row heights for detail sheet
        const detailWsrows = [];
        for (let i = 0; i <= detailData.length + 2; i++) { // +2 for the header rows
            detailWsrows.push({
                hpt: i === 0 ? 40 : i === 1 ? 23 : 36 // Title:40, Date:23, Data:36
            });
        }
        detailWorksheet["!rows"] = detailWsrows;

        // Add styling to detail sheet
        const detailRange = XLSX.utils.decode_range(detailWorksheet["!ref"] || "A1");
        for (let row = 0; row <= detailRange.e.r; row++) {
            for (let col = detailRange.s.c; col <= detailRange.e.c; col++) {
                const cell = XLSX.utils.encode_cell({ r: row, c: col });
                if (!detailWorksheet[cell]) {
                    detailWorksheet[cell] = { v: "" };
                }

                const borderStyle = {
                    style: "thin",
                    color: { rgb: "000000" }
                };

                if (row === 2) { // Header row (now row 3 because of title/date)
                    detailWorksheet[cell].s = {
                        fill: { fgColor: { rgb: "27AE60" } },
                        font: {
                            bold: true,
                            color: { rgb: "FFFFFF" },
                            size: 12,
                        },
                        alignment: {
                            horizontal: "center",
                            vertical: "center",
                            wrapText: true,
                        },
                        border: {
                            top: borderStyle,
                            bottom: borderStyle,
                            left: borderStyle,
                            right: borderStyle,
                        },
                    };
                } else if (row > 2) { // Data rows
                    detailWorksheet[cell].s = {
                        fill: {
                            fgColor: {
                                rgb: row % 2 === 0 ? "E8F5E9" : "FFFFFF",
                            },
                        },
                        font: {
                            size: 11,
                            color: { rgb: "000000" },
                        },
                        alignment: {
                            horizontal: "center",
                            vertical: "center",
                            wrapText: true,
                        },
                        border: {
                            top: borderStyle,
                            bottom: borderStyle,
                            left: borderStyle,
                            right: borderStyle,
                        },
                    };
                }
            }
        }

        XLSX.utils.book_append_sheet(workbook, detailWorksheet, "Details");
    } else {
        // ============ SUMMARY SHEET ============
        const filteredData = config?.dynamicColumns ? data?.items : data
        const mainData = filteredData.map((item) => {
            const row = {};
            allColumns?.forEach((col) => {
                if (col.valueGetter) {
                    row[col.headerName] = formatCellValue(col.valueGetter({ row: item }));
                } else {
                    row[col.headerName] = formatCellValue(item[col.field]);
                }
            });
            return row;
        });

        const mainWorksheet = XLSX.utils.json_to_sheet(mainData, { origin: "A3" });

        // Add Title (Row 1)
        XLSX.utils.sheet_add_aoa(mainWorksheet, [[config.title]], { origin: "A1" });

        // Add generated date (Row 2)
        XLSX.utils.sheet_add_aoa(
            mainWorksheet,
            [[`Generated on ${format(new Date(), "PPP")}`]],
            { origin: "A2" }
        );

        mainWorksheet["!merges"] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: allColumns.length - 1 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: allColumns.length - 1 } },
        ];

        // Apply styling for header rows
        ["A1", "A2"].forEach((cellRef, idx) => {
            if (!mainWorksheet[cellRef]) {
                mainWorksheet[cellRef] = {
                    v: idx === 0 ? config.title : `Generated on ${format(new Date(), "PPP")}`,
                    t: "s",
                };
            }

            if (idx === 0) {
                // Title styling (Row 1)
                mainWorksheet[cellRef].s = {
                    font: {
                        bold: true,
                        sz: 24,
                        color: { rgb: "FFFFFF" },
                        name: "Calibri",
                        scheme: "major",
                    },
                    fill: {
                        patternType: "solid",
                        fgColor: { rgb: "4472C4" },
                        bgColor: { rgb: "4472C4" },
                    },
                    alignment: {
                        horizontal: "center",
                        vertical: "center",
                        wrapText: true,
                    },
                };

                if (!mainWorksheet["!rows"]) {
                    mainWorksheet["!rows"] = [];
                }
                mainWorksheet["!rows"][0] = { hpt: 40 };
                mainWorksheet["!rows"][1] = { hpt: 23 };
            } else {
                // Date styling (Row 2)
                mainWorksheet[cellRef].s = {
                    font: {
                        italic: true,
                        sz: 12,
                        color: { rgb: "2C3E50" },
                        name: "Calibri",
                    },
                    fill: {
                        patternType: "solid",
                        fgColor: { rgb: "D6EAF8" },
                        bgColor: { rgb: "D6EAF8" },
                    },
                    alignment: {
                        horizontal: "right",
                        vertical: "center",
                    },
                };
            }
        });

        // Calculate optimal column widths with special handling for item name
        const calculateColumnWidth = (data, columnKey) => {
            const headerLength = columnKey.length;
            const maxContentLength = Math.max(
                ...data.map((row) => {
                    const value = row[columnKey];
                    return value ? value.toString().length : 0;
                })
            );

            if (columnKey.toLowerCase().includes("item") || columnKey.toLowerCase().includes("name")) {
                return Math.min(Math.max(headerLength, maxContentLength, 25), 40);
            }
            return Math.min(Math.max(headerLength, maxContentLength, 10), 30);
        };

        // Set column widths based on content
        const wscols = Object.keys(mainData[0] || {}).map((key) => ({
            wch: calculateColumnWidth(mainData, key),
        }));
        mainWorksheet["!cols"] = wscols;

        // Set row heights
        const wsrows = [];
        for (let i = 0; i <= mainData.length + 2; i++) {
            wsrows.push({
                hpt: i === 0 ? 40 : i === 1 ? 23 : 32
            });
        }
        mainWorksheet["!rows"] = wsrows;

        // Add borders and styling to all cells
        const range = XLSX.utils.decode_range(mainWorksheet["!ref"] || "A1");
        for (let row = 0; row <= range.e.r; row++) {
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cell = XLSX.utils.encode_cell({ r: row, c: col });
                if (!mainWorksheet[cell]) {
                    mainWorksheet[cell] = { v: "" };
                }

                const borderStyle = {
                    style: "thin",
                    color: { rgb: "000000" },
                };

                if (row === 2) {
                    mainWorksheet[cell].s = {
                        fill: { fgColor: { rgb: "2C3E50" } },
                        font: {
                            bold: true,
                            color: { rgb: "FFFFFF" },
                            size: 12,
                        },
                        alignment: {
                            horizontal: "center",
                            vertical: "center",
                            wrapText: true,
                        },
                        border: {
                            top: borderStyle,
                            bottom: borderStyle,
                            left: borderStyle,
                            right: borderStyle,
                        },
                    };
                } else if (row > 2) {
                    mainWorksheet[cell].s = {
                        fill: {
                            fgColor: {
                                rgb: row % 2 === 0 ? "F8F9FA" : "FFFFFF",
                            },
                        },
                        font: {
                            size: 11,
                            color: { rgb: "000000" },
                        },
                        alignment: {
                            horizontal: "center",
                            vertical: "center",
                            wrapText: true,
                        },
                        border: {
                            top: borderStyle,
                            bottom: borderStyle,
                            left: borderStyle,
                            right: borderStyle,
                        },
                    };
                }
            }
        }

        XLSX.utils.book_append_sheet(workbook, mainWorksheet, "Summary");
    }

    // Export with timestamped filename
    const timestamp = format(new Date(), "yyyy-MM-dd_HHmm");
    XLSX.writeFile(workbook, `${config.title}_${timestamp}.xlsx`);
};

const exportToPDF = async () => {
    try {
        setIsExporting(true);

        const { jsPDF } = await import("jspdf");
        const { default: autoTable } = await import("jspdf-autotable");

        // Initialize jsPDF
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            putOnlyUsedFonts: true,
        });

        // Check if we should show details
        const showDetails = config.detailColumns && data.some(item => item.transactions);

        if (showDetails) {
            // ============ DETAILS PDF ============
            const detailData = [];
            data.forEach((item) => {
                if (item.transactions?.length > 0) {
                    item.transactions.forEach((detail) => {
                        const detailRow = {
                            "Parent Date": formatCellValue(item.dateD) || "0",
                            "Parent Voucher": formatCellValue(item.vr_no) || "0",
                        };
                        config.detailColumns.forEach((col) => {
                            detailRow[col.headerName] = col.valueGetter 
                                ? formatCellValue(col.valueGetter({ row: detail }))
                                : formatCellValue(detail[col.field]);
                        });
                        detailData.push(detailRow);
                    });
                }
            });

            // Add title (green background like Excel)
            doc.setFont("helvetica", "bold");
            doc.setFontSize(24);
            doc.setTextColor(255, 255, 255);
            doc.setFillColor(39, 174, 96); // Green from Excel
            doc.rect(0, 0, doc.internal.pageSize.width, 15, 'F');
            doc.text(
                config.title,
                doc.internal.pageSize.width / 2,
                10,
                { align: "center" }
            );

            // Add generated date (light blue background)
            doc.setFont("helvetica", "italic");
            doc.setFontSize(12);
            doc.setTextColor(44, 62, 80); // Dark gray text
            doc.setFillColor(214, 234, 248); // Light blue from Excel
            doc.rect(0, 15, doc.internal.pageSize.width, 8, 'F');
            doc.text(
                `Generated on ${format(new Date(), "PPP")}`,
                doc.internal.pageSize.width - 10,
                20,
                { align: "right" }
            );

            // Prepare headers for detail table
            const detailHeaders = [
                { title: "Parent Date", dataKey: "Parent Date" },
                { title: "Parent Voucher", dataKey: "Parent Voucher" },
                ...config.detailColumns.map(col => ({
                    title: col.headerName,
                    dataKey: col.headerName
                }))
            ];

            // Add detail table
            autoTable(doc, {
                head: [detailHeaders.map(h => h.title)],
                body: detailData.map(row => detailHeaders.map(header => row[header.dataKey] || "0")),
                startY: 25,
                margin: { left: 10, right: 10 },
                styles: {
                    fontSize: 11,
                    font: "helvetica",
                    cellPadding: 4,
                    textColor: [0, 0, 0],
                    halign: "center",
                    valign: "middle",
                    lineWidth: 0.25,
                    lineColor: [0, 0, 0],
                    overflow: "linebreak",
                },
                headStyles: {
                    fillColor: [39, 174, 96], // Green header like Excel
                    textColor: [255, 255, 255],
                    fontSize: 12,
                    fontStyle: "bold",
                    halign: "center",
                    lineWidth: 0.25
                },
                bodyStyles: {
                    lineWidth: 0.25
                },
                alternateRowStyles: {
                    fillColor: [232, 245, 233] // Light green alternate rows
                },
                columnStyles: {
                    // Special handling for item/name columns
                    ...detailHeaders.reduce((acc, col, idx) => {
                        if (col.title.toLowerCase().includes("item") || 
                            col.title.toLowerCase().includes("name")) {
                            acc[idx] = { cellWidth: 30 };
                        }
                        return acc;
                    }, {})
                }
            });
        } else {
            // ============ SUMMARY PDF ============
            const filteredData = config?.dynamicColumns ? data?.items : data;
            const mainData = filteredData.map((item) => {
                const row = {};
                allColumns?.forEach((col) => {
                    if (col.valueGetter) {
                        row[col.headerName] = formatCellValue(col.valueGetter({ row: item }));
                    } else {
                        row[col.headerName] = formatCellValue(item[col.field]);
                    }
                });
                return row;
            });

            // Add title (blue background like Excel)
            doc.setFont("helvetica", "bold");
            doc.setFontSize(24);
            doc.setTextColor(255, 255, 255);
            doc.setFillColor(68, 114, 196); // Blue from Excel
            doc.rect(0, 0, doc.internal.pageSize.width, 15, 'F');
            doc.text(
                config.title,
                doc.internal.pageSize.width / 2,
                10,
                { align: "center" }
            );

            // Add generated date (light blue background)
            doc.setFont("helvetica", "italic");
            doc.setFontSize(12);
            doc.setTextColor(44, 62, 80); // Dark gray text
            doc.setFillColor(214, 234, 248); // Light blue from Excel
            doc.rect(0, 15, doc.internal.pageSize.width, 8, 'F');
            doc.text(
                `Generated on ${format(new Date(), "PPP")}`,
                doc.internal.pageSize.width - 10,
                20,
                { align: "right" }
            );

            // Prepare headers for main table
            const mainHeaders = allColumns.map(col => ({
                title: col.headerName,
                dataKey: col.headerName
            }));

        autoTable(doc, {
  head: [mainHeaders.map(h => h.title)],
  body: mainData.map(row => mainHeaders.map(header => row[header.dataKey] || "0")),
  startY: 25,
  margin: { left: 10, right: 10 },
  styles: {
    fontSize: 11,
    font: "helvetica",
    cellPadding: 4,
    textColor: [0, 0, 0],
    halign: "center",
    valign: "middle",
    lineWidth: 0.25,
    lineColor: [0, 0, 0],
    overflow: "linebreak",
  },
  headStyles: {
    fillColor: [44, 62, 80],
    textColor: [255, 255, 255],
    fontSize: 12,
    fontStyle: "bold",
    halign: "center",
    lineWidth: 0.25
  },
  bodyStyles: {
    lineWidth: 0.25
  },
  alternateRowStyles: {
    fillColor: [248, 249, 250]
  },
  columnStyles: {
    ...allColumns.reduce((acc, col, idx) => {
      if (
        col.headerName.toLowerCase().includes("item") || 
        col.headerName.toLowerCase().includes("name")
      ) {
        acc[idx] = { cellWidth: 30 };
      }
      return acc;
    }, {})
  }
});

        }

        // Save with timestamp
        const timestamp = format(new Date(), "yyyy-MM-dd_HHmm");
        doc.save(`${config.title}_${timestamp}.pdf`);
    } catch (error) {
        console.error("PDF Export Error:", error);
        alert("Failed to generate PDF. Please check console for details.");
    } finally {
        setIsExporting(false);
    }
};

// Reuse the same formatCellValue function from Excel export
const formatCellValue = (value) => {
    if (value === null || value === undefined || value === 0 || value === "0") {
        return "0";
    }
    return value;
};

  const exportToCSV = async () => {
    let csvContent = "";

    // Main headers
    const mainHeaders = config.columns.map(
      (col) => `"${col.headerName.replace(/"/g, '""')}"`
    );
    csvContent += mainHeaders.join(",") + "\n";

    // Main data
    data.forEach((item) => {
      const row = config.columns.map((col) => {
        let value = col.valueGetter
          ? col.valueGetter({ row: item })
          : item[col.field] || "";
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvContent += row.join(",") + "\n";

      // Details if available
      if (
        config.detailColumns &&
        item.transactions &&
        item.transactions.length > 0
      ) {
        csvContent += "\nDetails for " + (item.vr_no || item.id) + "\n";

        const detailHeaders = [
          "Parent ID",
          "Parent Voucher",
          ...config.detailColumns.map((col) => col.headerName),
        ];
        csvContent +=
          detailHeaders.map((h) => `"${h.replace(/"/g, '""')}"`).join(",") +
          "\n";

        item.transactions.forEach((detail) => {
          const detailRow = [
            item.id || "",
            item.vr_no || "",
            ...config.detailColumns.map((col) => {
              const value = col.valueGetter
                ? col.valueGetter({ row: detail })
                : detail[col.field] || "";
              return `"${String(value).replace(/"/g, '""')}"`;
            }),
          ];
          csvContent += detailRow.join(",") + "\n";
        });

        csvContent += "\n";
      }
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${config.title}_${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortConfig.key && data.items) return data.items;
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
            <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2 transition-colors duration-200">
              <CalendarIcon className="w-4 h-4" />
              {filter.label}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-white border-slate-200 hover:border-s300 hover:text-primary transition-all duration-200 shadow-sm hover:shadow-md"
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
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50 " />
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
            <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2  transition-colors duration-200">
              <FilterIcon className="w-4 h-4" />
              {filter.label}
            </Label>
            <Select
              value={filters[filter.name] || ""}
              onValueChange={(value) => handleFilterChange(filter.name, value)}
            >
              <SelectTrigger className="border-slate-200 focus:primary transition-all duration-200 shadow-sm hover:shadow-md">
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
        className="bg-white p-6 rounded-2xl border border-slate-200/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-500 transform hover:scale-[1.02] group"
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
                ? "bg-secondary "
                : field.type === "percent"
                ? "bg-secondary "
                : "bg-secondary "
            }`}
          >
            <Icon
              className={`w-5 h-5 ${
                field.type === "currency"
                  ? "text-primary"
                  : field.type === "percent"
                  ? "text-primary"
                  : "text-primary"
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

  useEffect(() => {
    if (!config?.dynamicColumns) return;

    const fetchGodowns = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/setup/godowns");
        console.log("Godown: ", res.data.data);
        setGodowns(res.data.data); // axios auto-parses JSON
      } catch (err) {
        setError(err.message || "Error fetching godowns");
      } finally {
        setLoading(false);
      }
    };

    fetchGodowns();
  }, [config?.dynamicColumns]);

  //   const { data: godowns } = useQuery({
  //   queryKey: ["godowns"],
  //   queryFn: async () => {
  //     const res = await fetch("/api/setup/godowns");
  //     return res.json();
  //   },
  //   enabled: config?.dynamicColumns,
  // });

  // Generate dynamic columns based on godowns
  const dynamicColumns = useMemo(() => {
    if (!config?.dynamicColumns || !godowns) return [];

    return godowns.map((godown) => ({
      field: `godown_${godown.id}`,
      headerName: godown.godown,
      width: 120,
      type: "number",
      valueGetter: (params) => params.row.godownStocks?.[godown.id] || 0,
    }));
  }, [config, godowns]);

  // Combine static and dynamic columns
  const allColumns = useMemo(() => {
    if (!config) return [];
    return [...(config.columns || []), ...dynamicColumns];
  }, [config, dynamicColumns]);

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
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-primary rounded-3xl p-8 text-primary shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-secondary/90 from-blue-600/90 to-purple-600/90" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />

          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <SparklesIcon className="w-8 h-8" />
                {config.title}
              </h1>
              <p className="text-primary text-lg max-w-2xl leading-relaxed">
                {config.description}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-primary text-white backdrop-blur-sm rounded-xl p-4">
                <BarChart3Icon className="w-10 h-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="shadow-lg border-slate-200/50 overflow-hidden backdrop-blur-sm bg-white/80">
          <CardHeader className="bg-gradient-to-r from-white to-slate-50/80 border-b border-slate-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary rounded-xl">
                  <FilterIcon className="w-6 h-6 text-white" />
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
                className="text-slate-600 hover:text-primary hover:bg-slate-100 transition-all duration-200"
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
                    className="bg-primary from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2Icon className="w-5 h-5 mr-3 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <RefreshCwIcon className="w-5 h-5 mr-1" />
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
                        className="border-0 bg-primary text-white hover:text-primary  transition-all duration-200 transform hover:scale-105"
                      >
                        <FileSpreadsheetIcon className="w-4 h-4 mr-2 hover:text-primary" />
                        Excel
                      </Button>
                    )}

                    {config.exportOptions?.pdf && (
                      <Button
                        variant="outline"
                        onClick={() => handleExport("pdf")}
                        disabled={isExporting || data.length === 0}
                        className="border-0 bg-primary text-white hover:text-primary transition-all duration-200 transform hover:scale-105"
                      >
                        <FileTextIcon className="w-4 h-4 mr-2 hover:text-primary " />
                        PDF
                      </Button>
                    )}

                    {config.exportOptions?.csv && (
                      <Button
                        variant="outline"
                        onClick={() => handleExport("csv")}
                        disabled={isExporting || data.length === 0}
                        className="border-0 bg-primary text-white hover:text-primary transition-all duration-200 transform hover:scale-105"
                      >
                        <FileIcon className="w-4 h-4 mr-2 hover:text-primary " />
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
                        className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
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
        <Card className="shadow-xl border-slate-200/50 overflow-hidden backdrop-blur-sm bg-white/90">
          <CardHeader className="bg-gradient-to-r from-white to-slate-50/80 border-b border-slate-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary rounded-xl">
                  <DatabaseIcon className="w-6 h-6 text-white" />
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
                    className="bg-primary text-white hover:bg-primary"
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
                <div className="p-4 bg-primary rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <DatabaseIcon className="w-8 h-8 text-white" />
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
                  className="mt-4 bg-primary text-white hover:bg-primary"
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
                      {allColumns?.map((column) => (
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
                      {(config.detailColumns || config.drillDown?.enabled) && (
                        <TableHead className="font-bold text-slate-700">
                          Actions
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedData?.map((row, index) => (
                      <TableRow
                        key={index}
                        className={`border-slate-200/50 hover:bg-slate-50/50 transition-all duration-200 ${
                          config.detailColumns ? "cursor-pointer" : ""
                        }`}
                        onClick={() => handleRowClick(row)}
                      >
                        {allColumns?.map((column) => (
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
                              className="bg-primary text-white hover:text-primary"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        )}
                        {config.drillDown?.enabled && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDrillDown(row);
                              }}
                              className="text-primary hover:text-primary"
                            >
                              {config.drillDown.label}
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
              <CardHeader className="bg-primary text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      Record Details
                    </CardTitle>
                    <CardDescription className="text-white">
                      Detailed view of selected record
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(false)}
                    className="text-primary bg-secondary hover:text-primary"
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

              {/* <CardFooter className="bg-slate-50 border-t">
                <Button
                  onClick={() => setShowDetails(false)}
                  className="ml-auto"
                  variant="outline"
                >
                  Close
                </Button>
              </CardFooter> */}
            </Card>
          </div>
        )}
      </div>

      {showDrillDownModal && config.drillDown && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="bg-primary text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">
                    {config.drillDown.modalTitle}
                  </CardTitle>
                  <CardDescription className="text-white">
                    Configure date range for detailed view
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDrillDownModal(false)}
                  className="text-white hover:text-white hover:bg-white/10"
                >
                  <XIcon className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {config.drillDown.fields?.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label>{field.label}</Label>
                  {field.type === "date" ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {drillDownFilters[field.name] ? (
                            format(drillDownFilters[field.name], "PPP")
                          ) : (
                            <span>Select {field.label.toLowerCase()}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={drillDownFilters[field.name]}
                          onSelect={(date) =>
                            setDrillDownFilters((prev) => ({
                              ...prev,
                              [field.name]: date,
                            }))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Input
                      type={field.type}
                      value={drillDownFilters[field.name] || ""}
                      onChange={(e) =>
                        setDrillDownFilters((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDrillDownModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (config.drillDown.linkBuilder) {
                    const link = config.drillDown.linkBuilder(
                      drillDownRow,
                      drillDownFilters
                    );
                    router.push(link);
                  }
                  setShowDrillDownModal(false);
                }}
                disabled={
                  !Object.keys(drillDownFilters).every(
                    (key) =>
                      drillDownFilters[key] !== undefined &&
                      drillDownFilters[key] !== null &&
                      drillDownFilters[key] !== ""
                  )
                }
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
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

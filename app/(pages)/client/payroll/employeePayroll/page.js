"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "@/lib/axiosInstance";
import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
// Add these imports at the top
import Header from "@/components/Others/breadcumb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Info,
  Loader2,
  LockOpen,
  Search,
  Trash2,
  X,
  Pencil,
} from "lucide-react";

// Add these imports at the top
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Add these imports at the top
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

const PayrollDashboard = () => {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "TestEmployer";
  const [payrolls, setPayrolls] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState({});
  const [employeesWithIssues, setEmployeesWithIssues] = useState([]);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [empPayrolls, setEmpPayrolls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [editableAllowances, setEditableAllowances] = useState({});
  const [editableDays, setEditableDays] = useState({});
  const [ytdTotals, setYtdTotals] = useState({}); // Object with employeeId as key and YTD data as value
  const [editableHours, setEditableHours] = useState({});
  const [editableRates, setEditableRates] = useState({});
  const [isMounted, setIsMounted] = useState(true);
  const [activeTab, setActiveTab] = useState("generate");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [settingsData, setSettingsData] = useState({});
  const [payrollStats, setPayrollStats] = useState({
    totalEmployees: 0,
    totalPayroll: 0,
    averageSalary: 0,
  });
  // Add state variables near other state declarations
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("approved");

  const [selectedPayroll, setSelectedPayroll] = useState(null);
  // Load tax settings from localStorage
  const taxSettings = JSON.parse(localStorage.getItem("taxSettings")) || {
    acc: { employee: 1, employer: 1 },
    npf: { employee: 10, employer: 10 },
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`/api/setting/${employerId}`);
        console.log("RESPOSNSE:", res.data);
        const data = res.data.data;
        setSettingsData(data);
      } catch (error) {
        console.log("Fetch Error: ", error.message);
      }
    };

    fetchSettings();
  }, []);

  const payrollSettings = {
    baseHoursPerWeek: settingsData?.payroll?.baseHoursPerWeek || 40,
    overtimeMultiplier: settingsData?.payroll?.overtimeMultiplier || 1.5,
    doubleTimeMultiplier: settingsData?.payroll?.doubleTimeMultiplier || 2,
    holidayMultiplier: settingsData?.payroll?.holidayMultiplier || 2,
    weeklyPayMultipliers: {
      weekly: settingsData?.payroll?.weeklyMultiplier || 1,
      fortnightly: settingsData?.payroll?.fortnightlyMultiplier || 2,
      monthly: settingsData?.payroll?.monthlyMultiplier || 4.33,
    },
    maxRegularHoursPerDay: settingsData?.payroll?.maxRegularHoursPerDay || 8,
    workingDaysPerWeek: settingsData?.payroll?.workingDaysPerWeek || 5,
    workingDaysPerMonth: settingsData?.payroll?.workingDaysPerMonth || 22, // Add this line
  };

  console.log("PAYROLL SETTINGS", payrollSettings);

  const payeConditions = JSON.parse(localStorage.getItem("payeConditions")) || {
    Weekly: [
      { id: 1, min: 0, max: 288, rate: 0, subtract: 0 },
      { id: 2, min: 288.01, max: 481, rate: 20, subtract: 57.6 },
      {
        id: 3,
        min: 481.01,
        max: 100000000000000000000000000000000000000,
        rate: 27,
        subtract: 91.27,
      },
    ],
    Fortnightly: [
      { id: 1, min: 0, max: 576, rate: 0, subtract: 0 },
      { id: 2, min: 576.01, max: 962, rate: 20, subtract: 115.2 },
      {
        id: 3,
        min: 962.01,
        max: 100000000000000000000000000000000000000,
        rate: 27,
        subtract: 182.54,
      },
    ],
    Monthly: [
      { id: 1, min: 0, max: 1250, rate: 0, subtract: 0 },
      { id: 2, min: 1250.01, max: 2083, rate: 20, subtract: 250 },
      {
        id: 3,
        min: 2083.01,
        max: 100000000000000000000000000000000000000,
        rate: 27,
        subtract: 395.81,
      },
    ],
  };

  const [formData, setFormData] = useState({
    payroll_id: "",
    employer_id: employerId,
  });

  // Add this state near your other state declarations
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const clearStatus = () => {
    setStatus({ type: "", message: "" });
  };

  // Add this function near your other utility functions
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Add this utility function at the top of your file
  const formatNumber = (num) => {
    return num?.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0.00";
  };

  // Add filtered payrolls calculation
  const filteredPayrolls = useMemo(() => {
    return payrolls.filter((payroll) => {
      const matchesSearch =
        payroll.payroll_id.toString().includes(searchTerm) ||
        new Date(payroll.date_from).toLocaleDateString().includes(searchTerm) ||
        new Date(payroll.date_to).toLocaleDateString().includes(searchTerm);

      const matchesStatus =
        selectedStatus === "all" ||
        payroll.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [payrolls, searchTerm, selectedStatus]);
  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayrolls.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredPayrolls.length / itemsPerPage);

  useEffect(() => {
    fetchPayrolls();
    fetchYtdData(); // Fetch YTD data when component mounts
    return () => {
      setIsMounted(false);
    };
  }, [employerId]);

  // Auto-dismiss status after 5 seconds
  useEffect(() => {
    let timeoutId;

    if (status.type) {
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set new timeout for 5 seconds
      timeoutId = setTimeout(() => {
        clearStatus();
      }, 5000);
    }

    // Cleanup function to clear timeout if component unmounts or status changes
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [status.type, status.message]); // Re-run when status changes

  useEffect(() => {
    if (formData.payroll_id) {
      const payroll = payrolls.find(
        (p) => p.payroll_id === formData.payroll_id
      );
      setSelectedPayroll(payroll || null);
      // Reset editable states
      setEditableAllowances({});
      setEditableHours({});
      setEditableRates({});
      setEmpPayrolls([]);
      setPayrollStats({
        totalEmployees: 0,
        totalPayroll: 0,
        averageSalary: 0,
      });
    }
  }, [formData.payroll_id, payrolls]);

  const fetchYtdData = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const response = await axios.get(
        `/api/payroll/ytd?employerId=${employerId}&year=${currentYear}`
      );

      if (response.data.success) {
        const ytdData = response.data.data.reduce((acc, payslip) => {
          const employeeId = payslip.employeeId;
          if (!acc[employeeId]) {
            acc[employeeId] = {
              grossPay: 0,
              netPay: 0,
              deductions: {
                paye: 0,
                npf: 0,
                acc: 0,
                other: 0,
                total: 0,
              },

              hours: {
                normal: 0,
                overtime: 0,
                doubleTime: 0,
                holiday: 0,
                total: 0,
              },
              employerContributions: {
                acc: 0,
                npf: 0,
                total: 0,
              },
            };
          }
          acc[employeeId].grossPay += payslip.payrollBreakdown.grossPay || 0;
          acc[employeeId].netPay += payslip.payrollBreakdown.netPayable || 0;
          acc[employeeId].deductions.paye +=
            payslip.payrollBreakdown.deductions.paye || 0;
          acc[employeeId].deductions.npf +=
            payslip.payrollBreakdown.deductions.npf || 0;
          acc[employeeId].deductions.acc +=
            payslip.payrollBreakdown.deductions.acc || 0;
          acc[employeeId].deductions.other +=
            payslip.payrollBreakdown.deductions.other || 0;
          acc[employeeId].deductions.total +=
            payslip.payrollBreakdown.deductions.total || 0;
          acc[employeeId].hours.normal += payslip.workDetails.normalHours || 0;
          acc[employeeId].hours.overtime +=
            payslip.workDetails.overtimeHours || 0;
          acc[employeeId].hours.doubleTime +=
            payslip.workDetails.doubleTimeHours || 0;
          acc[employeeId].hours.holiday +=
            payslip.workDetails.holidayHours || 0;
          acc[employeeId].hours.total +=
            payslip.workDetails.totalWorkHours || 0;
          acc[employeeId].employerContributions.acc +=
            payslip.payrollBreakdown.employerContributions?.acc || 0;
          acc[employeeId].employerContributions.npf +=
            payslip.payrollBreakdown.employerContributions?.npf || 0;
          acc[employeeId].employerContributions.total +=
            payslip.payrollBreakdown.employerContributions?.total || 0;
          return acc;
        }, {});
        setYtdTotals(ytdData);
      }
    } catch (error) {
      console.error("Failed to fetch YTD data:", error);
      toast.error("Failed to fetch YTD data");
      // setStatus({
      //   type: "error",
      //   message: "Failed to load YTD data",
      // });
    }
  };

  const fetchPayrolls = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/payroll/payroll-process?employerId=${employerId}`
      );

      if (isMounted && response?.data?.success) {
        const data = response.data.data || [];
        setPayrolls(data);
        return data; // Return the fetched data
      }
      return [];
    } finally {
      if (isMounted) setIsLoading(false);
    }
  };

  const calculatePAYE = (annualSalary, type) => {
    if (!payeConditions[type]) {
      console.warn(`Invalid payroll type: ${type}. Defaulting to Monthly.`);
      type = "Monthly";
    }

    if (isNaN(annualSalary) || annualSalary < 0) {
      console.warn(`Invalid annualSalary: ${annualSalary}. Returning 0.`);
      return 0;
    }

    let tax = 0;
    let remainingSalary = annualSalary;

    for (const bracket of payeConditions[type]) {
      if (remainingSalary > bracket.min && remainingSalary <= bracket.max) {
        const bracketAmount = remainingSalary;
        tax += bracketAmount * (bracket.rate / 100) - bracket.subtract;
        remainingSalary -= bracketAmount;
        break;
      }
    }

    return tax;
  };

  const handleDaysChange = (employeeId, value) => {
    const days = parseInt(value) || 0;
    setEditableDays((prev) => ({ ...prev, [employeeId]: days }));

    setEmpPayrolls((prev) =>
      prev.map((p) => {
        if (p.employeeId === employeeId && p.payType === "SALARY") {
          const monthlyRate =
            editableRates[employeeId] * 8
          const baseSalary =
            (monthlyRate * days) ;
          const taxableAllowances =
            editableAllowances[employeeId]?.taxable || 0;
          const nonTaxableAllowances =
            editableAllowances[employeeId]?.nonTaxable || 0;
          const grossPayWithTax = baseSalary + taxableAllowances;
          const grossPay = grossPayWithTax + nonTaxableAllowances;
          const paye = calculatePAYE(grossPayWithTax, p.payFrequency);
          const npf = grossPayWithTax * (taxSettings.npf.employee / 100);
          const acc = grossPayWithTax * (taxSettings.acc.employee / 100);
          const deductionsTotal = paye + npf + acc;

          return {
            ...p,

            workDetails: {
              ...p.workDetails,
              numberOfDays: days,
            },
            payrollBreakdown: {
              ...p.payrollBreakdown,
              baseSalary: baseSalary,
              normalPay: baseSalary,
              overtimePay: 0,
              doubleTimePay: 0,
              holidayPay: 0,
              taxableAllowances: taxableAllowances,
              nonTaxableAllowances: nonTaxableAllowances,
              grossPay: grossPay,
              deductions: {
                paye: paye,
                npf: npf,
                acc: acc,
                other: 0,
                total: deductionsTotal,
              },
              netPayable: grossPay - deductionsTotal,
              hasAdjustments: true,
            },
          };
        }
        return p;
      })
    );
  };

    const handleHoursChange = (employeeId, type, value) => {
    console.log("🔄 handleHoursChange called");
    console.log("➡️ Employee ID:", employeeId);
    console.log("➡️ Hour Type:", type);
    console.log("➡️ New Value (raw):", value);

    const parsedValue = parseFloat(value) || 0;
    console.log("✅ Parsed Value:", parsedValue);

    // Find the employee payroll to check payType
    const employeePayroll = empPayrolls.find(
      (p) => p.employeeId === employeeId
    );
    const isSalary = employeePayroll?.payType === "SALARY";

    let finalValue = parsedValue;
    if (isSalary) {
      if (type === "normalHours") {
        finalValue = Math.min(parsedValue, payrollSettings.baseHoursPerWeek); // Cap normal hours at 40 for SALARY
      } else {
        finalValue = 0; // Set overtime, doubleTime, holiday hours to 0 for SALARY
      }
    }

    // Update editableHours state
    setEditableHours((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [type]: finalValue,
      },
    }));


        // if (!isSalary) {

    // Update empPayrolls state
    setEmpPayrolls((prev) =>
      prev.map((p) => {
        if (p.employeeId === employeeId) {
          console.log(
            "📋 Updating payroll for:",
            p.employeeName || p.employeeId
          );

          const newHours = {
            ...p.workDetails,
            [type]: finalValue,
            ...(isSalary && {
              overtimeHours: 0,
              doubleTimeHours: 0,
              holidayHours: 0,
            }), // Ensure all other hours are 0 for SALARY
          };
          console.log("🕒 New Work Hours:", newHours);

          const totalWorkHours = isSalary
            ? Math.min(newHours.normalHours, payrollSettings.baseHoursPerWeek) // Cap total hours at 40 for SALARY
            : newHours.normalHours +
              newHours.overtimeHours +
              newHours.doubleTimeHours +
              newHours.holidayHours;
          console.log("🧮 Total Work Hours:", totalWorkHours);

          const normalPay = newHours.normalHours * p.workDetails.hourlyRate;
          const overtimePay = isSalary
            ? 0
            : newHours.overtimeHours * p.workDetails.overtimeRate;
          const doubleTimePay = isSalary
            ? 0
            : newHours.doubleTimeHours * p.workDetails.doubleTimeRate;
          const holidayPay = isSalary
            ? 0
            : newHours.holidayHours * p.workDetails.holidayRate;

          console.log("💰 Pay Breakdown:");
          console.log(" - Normal Pay:", normalPay);
          console.log(" - Overtime Pay:", overtimePay);
          console.log(" - Double Time Pay:", doubleTimePay);
          console.log(" - Holiday Pay:", holidayPay);

          const basePay = normalPay + overtimePay + doubleTimePay + holidayPay;

          const taxableAllowances = p.payrollBreakdown.taxableAllowances || 0;
          const nonTaxableAllowances =
            p.payrollBreakdown.nonTaxableAllowances || 0;

          const newGrossPay = 
            basePay + taxableAllowances + nonTaxableAllowances;
          console.log("📊 Gross Pay:", newGrossPay);

          const newPAYE = calculatePAYE(
            (basePay + taxableAllowances),
            p.payFrequency
          );
          console.log("🧾 PAYE:", newPAYE);

          const accEmployee = newGrossPay * (taxSettings.acc.employee / 100);
          const accEmployer = newGrossPay * (taxSettings.acc.employer / 100);
          const npfEmployee = newGrossPay * (taxSettings.npf.employee / 100);
          const npfEmployer = newGrossPay * (taxSettings.npf.employer / 100);

          const newDeductionsTotal =
            newPAYE +
            accEmployee +
            npfEmployee

            console.log("📉 Deductions:");
          console.log(" - ACC (Employee):", accEmployee);
          console.log(" - NPF (Employee):", npfEmployee);
          console.log(" - Total Deductions:", newDeductionsTotal);


          const newNetPayable = newGrossPay - newDeductionsTotal;
                    console.log("✅ Net Payable:", newNetPayable);


          
          return {
            ...p,
            workDetails: {
              ...p.workDetails,
              ...newHours,
              totalWorkHours,
            },
            payrollBreakdown: {
              ...p.payrollBreakdown,
              ...(!isSalary ? { normalPay } : {}),
              overtimePay,
              doubleTimePay,
              holidayPay,
              ...(!isSalary ? { grossPay: newGrossPay } : {}),
              ...(!isSalary ? {
                deductions: {
                ...p.payrollBreakdown.deductions,
                paye: newPAYE,
                npf: npfEmployee,
                acc: accEmployee,
                total: newDeductionsTotal,
              },
              employerContributions: {
                ...p.payrollBreakdown.employerContributions,
                acc: accEmployer,
                npf: npfEmployer,
                total: accEmployer + npfEmployer,
              },
              netPayable: newNetPayable,
              hasAdjustments: true,
              } : {}),
              
            },
          };
        }
        return p;
      })
    );
  // }
  };

  const handleRateChange = (employeeId, value) => {
    const parsedValue = parseFloat(value) || 0;
    const employee = empPayrolls.find((e) => e.employeeId === employeeId);

    setEditableRates((prev) => ({ ...prev, [employeeId]: parsedValue }));

    setEmpPayrolls((prev) =>
      prev.map((p) => {
        if (p.employeeId === employeeId) {
          if (p.payType === "SALARY") {
            const days = editableDays[employeeId] || 0;
              const monthlyRate =
            editableRates[employeeId] * 8
          const baseSalary =
            (monthlyRate * days) ;
            const taxableAllowances =
              editableAllowances[employeeId]?.taxable || 0;
            const nonTaxableAllowances =
              editableAllowances[employeeId]?.nonTaxable || 0;
            const grossPayWithTax = baseSalary + taxableAllowances;
            const grossPay = grossPayWithTax + nonTaxableAllowances;
            const paye = calculatePAYE(grossPayWithTax, p.payFrequency);
            const npf = grossPayWithTax * (taxSettings.npf.employee / 100);
            const acc = grossPayWithTax * (taxSettings.acc.employee / 100);
            const deductionsTotal = paye + npf + acc;

            return {
              ...p,
              payrollBreakdown: {
                ...p.payrollBreakdown,
                baseSalary: baseSalary,
                normalPay: baseSalary,
                overtimePay: 0,
                doubleTimePay: 0,
                holidayPay: 0,
                taxableAllowances: taxableAllowances,
                nonTaxableAllowances: nonTaxableAllowances,
                grossPay: grossPay,
                deductions: {
                  paye: paye,
                  npf: npf,
                  acc: acc,
                  other: 0,
                  total: deductionsTotal,
                },
                netPayable: grossPay - deductionsTotal,
                hasAdjustments: true,
              },
            };
          } else {
            const hourlyRate = parsedValue;
            const overtimeRate =
              hourlyRate * payrollSettings.overtimeMultiplier;
            const doubleTimeRate =
              hourlyRate * payrollSettings.doubleTimeMultiplier;
            const holidayRate = hourlyRate * payrollSettings.holidayMultiplier;

            
            const normalPay =
              (editableHours[employeeId]?.normalHours || 0) * hourlyRate;
            const overtimePay =
              (editableHours[employeeId]?.overtimeHours || 0) * overtimeRate;

            const doubleTimePay =
              (editableHours[employeeId]?.doubleTimeHours || 0) *
              doubleTimeRate;
            const holidayPay =
              (editableHours[employeeId]?.holidayHours || 0) * holidayRate;

            const basePay =
              normalPay + overtimePay + doubleTimePay + holidayPay;
            const taxableAllowances =
              editableAllowances[employeeId]?.taxable || 0;
            const nonTaxableAllowances =
              editableAllowances[employeeId]?.nonTaxable || 0;
            const grossPayWithTax = basePay + taxableAllowances;
            const grossPay = grossPayWithTax + nonTaxableAllowances;

            const paye = calculatePAYE(grossPayWithTax, p.payFrequency);
            const accEmployee =
              grossPayWithTax * (taxSettings.acc.employee / 100);
            const npfEmployee =
              grossPayWithTax * (taxSettings.npf.employee / 100);
            const deductionsTotal = paye + accEmployee + npfEmployee;

            return {
              ...p,
              payrollBreakdown: {
                ...p.payrollBreakdown,
                normalPay: normalPay,
                overtimePay: overtimePay,
                doubleTimePay: doubleTimePay,
                holidayPay: holidayPay,
                taxableAllowances: taxableAllowances,
                nonTaxableAllowances: nonTaxableAllowances,
                grossPay: grossPay,
                deductions: {
                  paye: paye,
                  npf: npfEmployee,
                  acc: accEmployee,
                  other: 0,
                  total: deductionsTotal,
                },
                netPayable: grossPay - deductionsTotal,
                hasAdjustments: true,
              },
            };
          }
        }
        return p;
      })
    );
  };

  const handleAllowanceChange = (employeeId, type, value) => {
    const parsedValue = parseFloat(value) || 0;
    const employee = empPayrolls.find((e) => e.employeeId === employeeId);

    setEditableAllowances((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [type]: parsedValue,
      },
    }));

    setEmpPayrolls((prev) =>
      prev.map((p) => {
        if (p.employeeId === employeeId) {
          let basePay;
          if (p.payType === "SALARY") {
            const days = editableDays[employeeId] || 0;
             const monthlyRate =
            editableRates[employeeId] * 8
          basePay =
            (monthlyRate * days) ;
          } else {
            const hourlyRate =
              editableRates[employeeId] || p.workDetails.hourlyRate;
            const overtimeRate =
              hourlyRate * payrollSettings.overtimeMultiplier;
            const doubleTimeRate =
              hourlyRate * payrollSettings.doubleTimeMultiplier;
            const holidayRate = hourlyRate * payrollSettings.holidayMultiplier;

            basePay =
              (editableHours[employeeId]?.normalHours || 0) * hourlyRate +
              (editableHours[employeeId]?.overtimeHours || 0) * overtimeRate +
              (editableHours[employeeId]?.doubleTimeHours || 0) *
                doubleTimeRate +
              (editableHours[employeeId]?.holidayHours || 0) * holidayRate;
          }

          const taxableAllowances =
            type === "taxable"
              ? parsedValue
              : editableAllowances[employeeId]?.taxable || 0;
          const nonTaxableAllowances =
            type === "nonTaxable"
              ? parsedValue
              : editableAllowances[employeeId]?.nonTaxable || 0;
          const grossPayWithTax = basePay + taxableAllowances;
          const grossPay = grossPayWithTax + nonTaxableAllowances;
          const paye = calculatePAYE(grossPayWithTax, p.payFrequency);
          const npf = grossPayWithTax * (taxSettings.npf.employee / 100);
          const acc = grossPayWithTax * (taxSettings.acc.employee / 100);
          const deductionsTotal = paye + npf + acc;

          return {
            ...p,
            payrollBreakdown: {
              ...p.payrollBreakdown,
              taxableAllowances: taxableAllowances,
              nonTaxableAllowances: nonTaxableAllowances,
              grossPay: grossPay,
              deductions: {
                paye: paye,
                npf: npf,
                acc: acc,
                other: 0,
                total: deductionsTotal,
              },
              netPayable: grossPay - deductionsTotal,
              hasAdjustments: true,
            },
          };
        }
        return p;
      })
    );
  };

  const loadPastPayrollForEdit = async (payrollId) => {
    try {
      const response = await axios.get(
        `/api/payroll/payroll-process/${payrollId}`
      );
      if (response.data.success) {
        const pastPayroll = response.data.data;
        setEmpPayrolls(pastPayroll.empPayrolls || []);

        setEditableDays((prev) => {
          const newDays = { ...prev };
          pastPayroll.empPayrolls.forEach((p) => {
            if (p.payType === "SALARY") {
              newDays[p.employeeId] = Math.ceil(
                p.workDetails.normalHours /
                  payrollSettings.maxRegularHoursPerDay
              );
            }
          });
          return newDays;
        });
        setEditableHours((prev) => {
          const newHours = { ...prev };
          pastPayroll.empPayrolls.forEach((p) => {
            newHours[p.employeeId] = {
              normalHours: p.workDetails.normalHours,
              overtimeHours: p.workDetails.overtimeHours,
              doubleTimeHours: p.workDetails.doubleTimeHours,
              holidayHours: p.workDetails.holidayHours,
            };
          });
          return newHours;
        });
        setEditableRates((prev) => {
          const newRates = { ...prev };
          pastPayroll.empPayrolls.forEach((p) => {
            newRates[p.employeeId] = p.workDetails.hourlyRate;
          });
          return newRates;
        });
        setStatus({
          type: "info",
          message: "Past payroll loaded for editing",
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to load past payroll",
      });
    }
  };

  const calculatePayroll = async () => {
    if (!formData.payroll_id) {
      setStatus({ type: "error", message: "Please select a payroll period" });
      return;
    }

    try {
      setIsLoading(true);
      const [empData, payrollData] = await Promise.all([
        axios.get(`/api/employees?employerId=${employerId}`),
        axios.get(`/api/payroll/payroll-process/${formData.payroll_id}`),
      ]);

      const selectedPayrollPeriod = payrollData.data.data;
      console.log("yes proces111");

      const processedEmployees = new Set(
        selectedPayrollPeriod.processedEmployees || []
      );

      console.log("yes proces22222");

      // Filter out already processed employees
      const unprocessedEmployees = empData.data.data.filter(
        (emp) => !processedEmployees.has(emp.employeeId)
      );

      console.log("yes proces");

      const processedPayroll = await processPayrollData(
        unprocessedEmployees,
        selectedPayrollPeriod
      );

      // Add this block to initialize editableDays
      setEditableDays((prev) => {
        const newDays = { ...prev };
        processedPayroll.forEach((p) => {
          if (p.payType === "SALARY") {
            newDays[p.employeeId] = Math.ceil(
              p.workDetails.normalHours / payrollSettings.maxRegularHoursPerDay
            );
          }
        });
        return newDays;
      });
      setEmpPayrolls(processedPayroll);
      console.log("Peek A BOO", processedPayroll);

      setEditableAllowances((prev) => {
        const newAllowances = { ...prev };
        processedPayroll.forEach((p) => {
          newAllowances[p.employeeId] = { taxable: 0, nonTaxable: 0 };
        });
        return newAllowances;
      });
      setEditableHours((prev) => {
        const newHours = { ...prev };
        processedPayroll.forEach((p) => {
          newHours[p.employeeId] = {
            normalHours: p.workDetails.normalHours,
            overtimeHours: p.workDetails.overtimeHours,
            doubleTimeHours: p.workDetails.doubleTimeHours,
            holidayHours: p.workDetails.holidayHours,
          };
        });
        return newHours;
      });
      setEditableRates((prev) => {
        const newRates = { ...prev };
        processedPayroll.forEach((p) => {
          newRates[p.employeeId] = p.workDetails.hourlyRate;
        });
        return newRates;
      });

      // Calculate statistics
      const stats = calculatePayrollStats(processedPayroll);
      console.log("Payroll Stats:", stats);

      setPayrollStats(stats);

      const initialSelection = {};
      processedPayroll.forEach((employee) => {
        initialSelection[employee.employeeId] = true; // All selected by default
      });
      setSelectedEmployees(initialSelection);

      console.log("Processed Payroll:", processedPayroll);
      setStatus({
        type: "success",
        message: "Payroll calculated successfully",
      });
      toast.success("Payroll calculated successfully");
    } catch (error) {
      setStatus({
        type: "error",
        message: "Error calculating payroll",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function right after the calculatePayroll function
  const recalculateSelectedPayroll = async () => {
    if (!formData.payroll_id) {
      setStatus({
        type: "error",
        message: "Please select a payroll period",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Get only the employees that need recalculation (previously unchecked due to issues)
      const employeesToRecalculate = employeesWithIssues.filter(
        (id) => !selectedEmployees[id]
      );

      if (employeesToRecalculate.length === 0) {
        setStatus({
          type: "info",
          message: "No employees selected for recalculation",
        });
        setIsLoading(false);
        return;
      }

      // Get the full employee data for the selected IDs
      const empData = await axios.get(
        `/api/employees?employerId=${employerId}`
      );
      const filteredEmployees = empData.data.data.filter((emp) =>
        employeesToRecalculate.includes(emp.employeeId)
      );

      const selectedPayrollPeriod = payrolls.find(
        (p) => p.payroll_id === formData.payroll_id
      );

      // Process only the selected employees
      const recalculatedPayrolls = await processPayrollData(
        filteredEmployees,
        selectedPayrollPeriod
      );

      // Merge the recalculated payrolls with existing ones
      const updatedPayrolls = [...empPayrolls];

      recalculatedPayrolls.forEach((newPayroll) => {
        const existingIndex = updatedPayrolls.findIndex(
          (p) => p.employeeId === newPayroll.employeeId
        );

        if (existingIndex >= 0) {
          updatedPayrolls[existingIndex] = newPayroll;
        } else {
          updatedPayrolls.push(newPayroll);
        }
      });

      setEmpPayrolls(updatedPayrolls);

      // Update selections to include recalculated employees
      const newSelections = { ...selectedEmployees };
      recalculatedPayrolls.forEach((p) => {
        const hasValidHours = p.workDetails.totalWorkHours > 0;
        const hasValidPay = p.payrollBreakdown.netPayable > 0;
        const isDataComplete = hasValidHours && hasValidPay;

        newSelections[p.employeeId] = isDataComplete;
      });
      setSelectedEmployees(newSelections);

      // Update statistics
      const stats = calculatePayrollStats(updatedPayrolls);
      setPayrollStats(stats);
      toast.success(
        `Recalculated payroll for ${recalculatedPayrolls.length} employees`
      );
      setStatus({
        type: "success",
        message: `Recalculated payroll for ${recalculatedPayrolls.length} employees`,
      });
    } catch (error) {
      console.error("Recalculation error:", error);
      toast.error("Recalculation Error");

      setStatus({
        type: "error",
        message: "Error recalculating payroll",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createAdjustmentPayroll = async () => {
    try {
      setIsLoading(true);
      const adjustedEmployees = empPayrolls.filter((p) => p.hasAdjustments); // Assume a flag for adjusted employees
      const response = await axios.post("/api/payroll/adjustment-payroll", {
        originalPayrollId: formData.payroll_id,
        employerId,
        adjustedEmployees,
      });
      if (response.data.success) {
        setStatus({
          type: "success",
          message: "Adjustment payroll created successfully",
        });
        fetchPayrolls();
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to create adjustment payroll",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Utility functions
  const convertToTotalHours = (timeString) => {
    if (!timeString) return 0;
    if (!isNaN(timeString)) return parseFloat(timeString);

    const timePattern = /(\d+)h\s*(\d*)m?/;
    const match = timeString.toString().match(timePattern);
    if (!match) return 0;

    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    return hours + minutes / 60;
  };

  const parseRate = (rateString) => {
    if (!rateString) return 0;
    if (rateString.includes("%")) {
      return parseFloat(rateString) / 100;
    }
    return parseFloat(rateString) || 0;
  };

  const calculateAdjustments = (items, baseSalary) => {
    return items.reduce((total, item) => {
      if (["ACC", "NPF", "PAYE"].includes(item?.deduction)) return total;

      const rate = parseRate(item.rate);
      return total + (item.rate.includes("%") ? baseSalary * rate : rate);
    }, 0);
  };

  const isWeekend = (date) => {
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
  };

  const calculateWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "0h 0m";

    try {
      const [checkInHour, checkInMin] = checkIn.split(":").map(Number);
      const [checkOutHour, checkOutMin] = checkOut.split(":").map(Number);

      const checkInMinutes = checkInHour * 60 + checkInMin;
      const checkOutMinutes = checkOutHour * 60 + checkOutMin;

      let diffMinutes = checkOutMinutes - checkInMinutes;
      if (diffMinutes < 0) diffMinutes += 24 * 60;

      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;

      return `${hours}h ${minutes}m`;
    } catch (error) {
      console.error("Error calculating working hours:", error);
      return "0h 0m";
    }
  };

  const calculateEmployeePayroll = async (
    employees,
    startDate,
    endDate,
    payrollPeriod,
    settings = {}
  ) => {
    try {
      console.log("Starting payroll calculation with:", {
        totalEmployees: employees.length,
        startDate,
        endDate,
        payrollID: payrollPeriod.payroll_id,
      });

      // Fetch all required data with error handling
      const [
        periodicAttendanceRes,
        deductionsRes,
        allowancesRes,
        payrollDeductionsRes,
        payrollAllowancesRes,
      ] = await Promise.allSettled([
        axios.get("/api/employees/periodicAttendance?employerId=" + employerId),
        axios.get("/api/employees/deduction?employerId=" + employerId),
        axios.get("/api/employees/allownce?employerId=" + employerId),
        axios.get(`/api/payroll/payrollDeduction/${payrollPeriod._id}`),
        axios.get(`/api/payroll/payrollAllownce/${payrollPeriod._id}`),
      ]);

      // Handle API response errors
      const allPeriodicAttendance =
        periodicAttendanceRes.status === "fulfilled"
          ? periodicAttendanceRes.value
          : { data: { data: [] } };
      const allDeductions =
        deductionsRes.status === "fulfilled"
          ? deductionsRes.value
          : { data: { data: [] } };
      const allAllowances =
        allowancesRes.status === "fulfilled"
          ? allowancesRes.value
          : { data: { data: [] } };
      const allPayrollDeductions =
        payrollDeductionsRes.status === "fulfilled"
          ? payrollDeductionsRes.value
          : { data: { data: [] } };
      const allPayrollAllowances =
        payrollAllowancesRes.status === "fulfilled"
          ? payrollAllowancesRes.value
          : { data: { data: [] } };

      // Log any failed API calls
      [
        periodicAttendanceRes,
        deductionsRes,
        allowancesRes,
        payrollDeductionsRes,
        payrollAllowancesRes,
      ].forEach((res, index) => {
        if (res.status === "rejected") {
          console.error(
            `API call ${index} failed:`,
            res.reason?.message || res.reason
          );
        }
      });

      const start = new Date(startDate);
      const end = new Date(endDate);
      const payPeriodDays =
        Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      const payPeriodWeeks = payPeriodDays / 5;
      const expectedBaseHours =
        payrollSettings.baseHoursPerWeek * payPeriodWeeks;

      // Process employees
      const processedEmployees = await Promise.allSettled(
        employees.map(async (employee) => {
          try {
            if (employee.status !== "ACTIVE") return null;

            console.log("Processing employee:", employee.employeeId);

            // Step 1: Try to get regular attendance first
            let regularAttendance = [];
            let attendanceSource = "none";

            try {
              const attendanceRes = await axios.get(
                `/api/users/attendance/${employee.employeeId}`
              );

              if (attendanceRes.data?.attendance?.length > 0) {
                regularAttendance = attendanceRes.data.attendance.filter(
                  (a) => {
                    const dateObject = new Date(a.date).toLocaleDateString();
                    return (
                      a.employeeId === employee.employeeId &&
                      new Date(dateObject).getTime() >= start.getTime() &&
                      new Date(dateObject).getTime() <= end.getTime() &&
                      a.status === "Approved"
                    );
                  }
                );
                attendanceSource = "regular";
                console.log(
                  `Found ${regularAttendance.length} regular attendance records`
                );
              }
            } catch (error) {
              if (error.response?.status !== 404) {
                console.error(
                  `Error fetching attendance for ${employee.employeeId}:`,
                  error.message
                );
              }
            }

            // Step 2: If no regular attendance, try leave requests and attendance corrections
            if (regularAttendance.length === 0) {
              try {
                const requestsRes = await axios.get(
                  `/api/users/request?employerId=${employee.clientId}&status=Approved`
                );

                const employeeRequests =
                  requestsRes.data?.filter(
                    (req) => req.employeeId === employee.employeeId
                  ) || [];

                // Process leave requests and attendance corrections
                regularAttendance = await processRequestsToAttendance(
                  employeeRequests,
                  start,
                  end,
                  employee,
                  payrollSettings
                );

                if (regularAttendance.length > 0) {
                  attendanceSource = "requests";
                  console.log(
                    `Generated ${regularAttendance.length} attendance records from requests`
                  );
                }
              } catch (error) {
                console.error(
                  `Error fetching requests for ${employee.employeeId}:`,
                  error.message
                );
              }
            }

            // Step 3: If still no attendance, try periodic attendance
            let periodicAttendance = [];
            if (regularAttendance.length === 0) {
              try {
                periodicAttendance =
                  allPeriodicAttendance?.data?.data?.filter((a) => {
                    const [startDateStr, endDateStr] =
                      a.dateRange.split(" to ");
                    const periodStart = new Date(startDateStr).getTime();
                    const periodEnd = new Date(endDateStr).getTime();

                    return (
                      a.employeeId === employee.employeeId &&
                      periodStart >= start.getTime() &&
                      periodEnd <= end.getTime() &&
                      a.status === "Approved"
                    );
                  }) || [];

                if (periodicAttendance.length > 0) {
                  attendanceSource = "periodic";
                  console.log(
                    `Found ${periodicAttendance.length} periodic attendance records`
                  );
                }
              } catch (error) {
                console.error(
                  `Error processing periodic attendance for ${employee.employeeId}:`,
                  error.message
                );
              }
            }

            // Calculate work hours based on attendance source
            const workHours = calculateWorkHours(
              regularAttendance,
              periodicAttendance,
              payrollSettings,
              attendanceSource
            );

            // For SALARY employees, cap normalHours at 40 and set other hours to 0
            if (employee.payType === "SALARY") {
              workHours.normalHours = Math.min(
                workHours.normalHours,
                payrollSettings.baseHoursPerWeek
              );
              workHours.numberOfDays = workHours.numberOfDays
              workHours.overtimeHours = 0;
              workHours.doubleTimeHours = 0;
              workHours.holidayHours = 0;
              workHours.totalWorkHours = workHours.normalHours;
            }

            // Calculate pay
            const payCalculation = calculateEmployeePay(
              employee,
              workHours,
              payrollSettings,
              payPeriodDays,
              expectedBaseHours
            );

            // Calculate deductions and allowances
            const adjustments = calculateEmployeeAdjustments(
              employee,
              allDeductions.data.data,
              allAllowances.data.data,
              allPayrollDeductions.data.data,
              allPayrollAllowances.data.data,
              payCalculation.grossPay
            );

            const finalPay = {
              ...payCalculation,
              grossPay: payCalculation.grossPay + adjustments.totalAllowances,
              netPayable:
                payCalculation.grossPay +
                adjustments.totalAllowances -
                adjustments.totalDeductions,
            };

            return buildEmployeePayrollResult(
              employee,
              payrollPeriod,
              finalPay,
              workHours,
              adjustments,
              { start, end, payPeriodDays, expectedBaseHours },
              payrollSettings,
              attendanceSource
            );
          } catch (error) {
            console.error(
              `Error processing employee ${employee.employeeId}:`,
              error.message
            );
            return null;
          }
        })
      );

      const validPayrolls = processedEmployees
        .filter(
          (result) => result.status === "fulfilled" && result.value !== null
        )
        .map((result) => result.value);

      console.log(
        `Successfully processed ${validPayrolls.length} out of ${employees.length} employees`
      );
      return validPayrolls;
    } catch (error) {
      console.error("Critical error in payroll calculation:", error);
      throw new Error(`Payroll calculation failed: ${error.message}`);
    }
  };

  // Helper function to process requests into attendance records
  const processRequestsToAttendance = async (
    requests,
    start,
    end,
    employee,
    payrollSettings
  ) => {
    const attendanceRecords = [];

    // Generate expected working days
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      if (isWeekend(currentDate)) continue;

      // Check for leave requests
      const leaveRequest = requests.find((req) => {
        if (req.type !== "leave" || req.status !== "Approved") return false;
        const leaveStart = new Date(req.startDate);
        const leaveEnd = new Date(req.endDate);
        return currentDate >= leaveStart && currentDate <= leaveEnd;
      });

      // Check for attendance corrections
      const attendanceRequest = requests.find((req) => {
        if (req.type !== "attendance" || req.status !== "Approved")
          return false;
        return (
          new Date(req.startDate).toDateString() === currentDate.toDateString()
        );
      });

      if (leaveRequest?.isPaidLeave) {
        const leaveHours = calculateLeaveHours(leaveRequest, payrollSettings);
        if (leaveHours > 0) {
          attendanceRecords.push({
            date: currentDate.toISOString(),
            employeeId: employee.employeeId,
            checkIn: "08:00",
            checkOut: "16:00",
            status: "Approved",
            totalWorkingHours: `${Math.floor(leaveHours)}h ${Math.round(
              (leaveHours % 1) * 60
            )}m`,
            isLeave: true,
            leaveType: leaveRequest.leaveType,
            source: "leave_request",
          });
        }
      } else if (attendanceRequest) {
        attendanceRecords.push({
          date: attendanceRequest.startDate,
          employeeId: employee.employeeId,
          checkIn: attendanceRequest.checkIn,
          checkOut: attendanceRequest.checkOut,
          status: "Approved",
          totalWorkingHours: calculateWorkingHours(
            attendanceRequest.checkIn,
            attendanceRequest.checkOut
          ),
          source: "attendance_request",
        });
      }
    }

    return attendanceRecords;
  };

  // Helper function to calculate leave hours
  const calculateLeaveHours = (leaveRequest, payrollSettings) => {
    const standardWorkHours = payrollSettings.maxRegularHoursPerDay || 8;

    switch (leaveRequest.leaveDurationType) {
      case "full-day":
        return standardWorkHours;
      case "half-day":
        return standardWorkHours / 2;
      case "hourly":
        if (leaveRequest.startTime && leaveRequest.endTime) {
          const [startHour, startMin] = leaveRequest.startTime
            .split(":")
            .map(Number);
          const [endHour, endMin] = leaveRequest.endTime.split(":").map(Number);
          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;
          let diffMinutes = endMinutes - startMinutes;
          if (diffMinutes < 0) diffMinutes += 24 * 60;
          return diffMinutes / 60;
        }
        return 0;
      default:
        return 0;
    }
  };

  // Helper function to calculate work hours
  const calculateWorkHours = (
    regularAttendance,
    periodicAttendance,
    payrollSettings,
    source
  ) => {
    let totalWorkHours = 0;
    let normalHours = 0;
    let overtimeHours = 0;
    let doubleTimeHours = 0;
    let holidayHours = 0;
    let paidLeaveHours = 0;
    let workingDays = 0; // New field for working days

    if (source === "periodic") {
      // Handle periodic attendance
      periodicAttendance.forEach((pa) => {
        const hours = convertToTotalHours(pa.totalWorkingHours);
        const doubleHours = convertToTotalHours(pa.totalDoubleTimeHours);
        totalWorkHours += hours;
        doubleTimeHours += doubleHours;
        workingDays += pa.numberOfDays || 0; // Use numberOfDays from periodic attendance
      });
      normalHours = Math.min(totalWorkHours, payrollSettings.baseHoursPerWeek);
      overtimeHours = Math.max(
        0,
        totalWorkHours - payrollSettings.baseHoursPerWeek
      );
    } else {
      // Handle regular attendance (including from requests)
      regularAttendance.forEach((att) => {
        const dailyHours = convertToTotalHours(att.totalWorkingHours) || 0;
        workingDays += dailyHours > 0 ? 1 : 0; // Count as working day if any hours

        if (att.isLeave && att.isPaidLeave) {
          paidLeaveHours += dailyHours;
        } else if (att.isHoliday) {
          holidayHours += dailyHours;
        } else if (att.isDoubleTime) {
          doubleTimeHours += dailyHours;
        } else {
          const dailyRegularHours = Math.min(
            dailyHours,
            payrollSettings.maxRegularHoursPerDay
          );
          const dailyOvertimeHours = Math.max(
            0,
            dailyHours - payrollSettings.maxRegularHoursPerDay
          );
          normalHours += dailyRegularHours;
          overtimeHours += dailyOvertimeHours;
        }

        totalWorkHours += dailyHours;
      });
    }

    return {
      totalWorkHours,
      normalHours,
      overtimeHours,
      doubleTimeHours,
      holidayHours,
      paidLeaveHours,
      numberOfDays: workingDays, // Include working days in return object
    };
  };

  // Helper function to calculate employee pay
  const calculateEmployeePay = (
    employee,
    workHours,
    payrollSettings,
    payPeriodDays,
    expectedBaseHours
  ) => {
    let baseSalary = 0;
    let hourlyRate = 0;

    if (employee.payType === "SALARY") {
      const basePayMultiplier =
        payPeriodDays <= 7
          ? payrollSettings.weeklyPayMultipliers.weekly
          : payPeriodDays <= 14
          ? payrollSettings.weeklyPayMultipliers.fortnightly
          : payrollSettings.weeklyPayMultipliers.monthly;

      // Get working days from editableDays or calculated from hours
      const workingDays =
        editableDays[employee.employeeId] ||
        Math.ceil(
          workHours.normalHours / payrollSettings.maxRegularHoursPerDay
        );

        console.log("editableDays: ", editableDays[employee.employeeId])
        console.log("Working ceil: ",
           Math.ceil(
          workHours.normalHours / payrollSettings.maxRegularHoursPerDay
        )
        )
        console.log("Working Day: ", workingDays)

      baseSalary =
        (employee.ratePerHour * basePayMultiplier * workingDays) /
        (payPeriodDays <= 7
          ? 5
          : payPeriodDays <= 14
          ? 10
          : payrollSettings.workingDaysPerMonth);

      hourlyRate =  hourlyRate = (employee.ratePerHour / payrollSettings.workingDaysPerWeek) / payrollSettings.maxRegularHoursPerDay
      console.log(
        `Calculated base salary for ${employee.employeeId}: ${baseSalary} (daily rate: ${hourlyRate}, working days: ${workingDays})`
      );
    } else if (employee.payType === "HOUR") {
      hourlyRate = employee.ratePerHour || 0;
      const regularHours = Math.min(
        workHours.totalWorkHours,
        expectedBaseHours
      );
      baseSalary = regularHours * hourlyRate;
    }

    const normalPay = employee.payType==="SALARY" ? baseSalary :workHours.normalHours * hourlyRate;
    const overtimePay =
      workHours.overtimeHours * hourlyRate * payrollSettings.overtimeMultiplier;
    const doubleTimePay =
      workHours.doubleTimeHours *
      hourlyRate *
      payrollSettings.doubleTimeMultiplier;
    const holidayPay =
      workHours.holidayHours * hourlyRate * payrollSettings.holidayMultiplier;

    const grossPay = normalPay + overtimePay + doubleTimePay + holidayPay;

    return {
      baseSalary,
      hourlyRate,
      normalPay,
      overtimePay,
      doubleTimePay,
      holidayPay,
      grossPay,
    };
  };

  // Helper function to calculate adjustments (deductions and allowances)
  const calculateEmployeeAdjustments = (
    employee,
    allDeductions,
    allAllowances,
    payrollDeductions,
    payrollAllowances,
    grossPay
  ) => {
    const employeeDeductions =
      allDeductions.filter((d) => employee.deductions?.includes(d._id)) || [];
    const employeeAllowances =
      allAllowances.filter((a) => employee.allownces?.includes(a._id)) || [];
    const employeePayrollDeductions =
      payrollDeductions.filter((d) => d.employeeId === employee._id) || [];
    const employeePayrollAllowances =
      payrollAllowances.filter((a) => a.employeeId === employee._id) || [];

    const totalAllowances = calculateAdjustments(
      [...employeeAllowances, ...employeePayrollAllowances],
      grossPay
    );
    const regularDeductions = calculateAdjustments(
      [...employeeDeductions, ...employeePayrollDeductions],
      grossPay
    );

    // Calculate statutory deductions (PAYE, ACC, NPF)
    const monthlyEquivalent = grossPay; // Simplified for this example
    const periodPAYE = calculatePAYE(monthlyEquivalent, employee.payFrequency);
    const accEmployee = grossPay * (taxSettings.acc.employee / 100);
    const npfEmployee = grossPay * (taxSettings.npf.employee / 100);

    const statutoryDeductions = periodPAYE + accEmployee + npfEmployee;
    const totalDeductions = statutoryDeductions + regularDeductions;

    return {
      totalAllowances,
      totalDeductions,
      regularDeductions,
      statutoryDeductions,
      paye: periodPAYE,
      acc: accEmployee,
      npf: npfEmployee,
    };
  };

  // Helper function to build final payroll result
  const buildEmployeePayrollResult = (
    employee,
    payrollPeriod,
    pay,
    workHours,
    adjustments,
    periodDetails,
    settings,
    attendanceSource
  ) => {
    return {
      employeeId: employee.employeeId,
      employeeName: `${employee.firstName} ${employee.middleName || ""} ${
        employee.surname
      }`.trim(),
      npfNumber: employee.npfNumber,
      employeeEmail: employee.emailAddress,
      payFrequency: employee.payFrequency,
      paymentMethod: employee.paymentMethod,
      allowanceEligible: employee.allowanceEligible,
      payType: employee.payType,
      monthNo: payrollPeriod.month_no,
      weekNo: payrollPeriod.week_no,
      year: payrollPeriod.year,
      paymentMethod: employee.paymentMethod,
      attendanceSource,

      payPeriodDetails: {
        startDate: periodDetails.start,
        endDate: periodDetails.end,
        expectedBaseHours: periodDetails.expectedBaseHours,
        totalDays: periodDetails.payPeriodDays,

      },

      workDetails: {
        ...workHours,
        hourlyRate: pay.hourlyRate,
        holidayRate: pay.hourlyRate * (settings.holidayMultiplier || 2),
        doubleTimeRate: pay.hourlyRate * (settings.doubleTimeMultiplier || 2),
        overtimeRate: pay.hourlyRate * settings.overtimeMultiplier,
      },

      payrollBreakdown: {
        baseSalary: pay.baseSalary,
        normalPay: employee.payType === "SALARY" ?pay.baseSalary :pay.normalPay ,
        overtimePay: pay.overtimePay,
        doubleTimePay: pay.doubleTimePay,
        holidayPay: pay.holidayPay,
        allowances: adjustments.totalAllowances,
        grossPay: pay.grossPay,
        deductions: {
          paye: adjustments.paye,
          acc: adjustments.acc,
          npf: adjustments.npf,
          other: adjustments.regularDeductions,
          total: adjustments.totalDeductions,
        },
        employerContributions: {
          acc: adjustments.acc,
          npf: adjustments.npf,
          total: adjustments.acc + adjustments.npf,
        },

        netPayable:
          pay.grossPay +
          adjustments.totalAllowances -
          adjustments.totalDeductions,
      },

      settings: {
        ...settings,
        tax: taxSettings,
        payeBrackets: payeConditions,
      },
    };
  };

  const processPayrollData = async (employees, payrollPeriod) => {
    const startDate = new Date(payrollPeriod.date_from);
    const endDate = new Date(payrollPeriod.date_to);
    console.log("Apyroll Detail payroll Datas: ", startDate);

    // ... existing payroll calculation logic ...
    // Enhanced with more detailed calculations
    const payrollDetails = await calculateEmployeePayroll(
      employees,
      startDate.toLocaleDateString(),
      endDate.toLocaleDateString(),
      payrollPeriod
    );
    console.log("Apyroll Details: ", payrollDetails);
    return payrollDetails;
  };

  const calculatePayrollStats = (payrollData) => {
    const totalEmployees = payrollData.length;
    const totalPayroll = payrollData.reduce(
      (sum, emp) => sum + (emp.payrollBreakdown.netPayable || 0),
      0
    );
    const averageSalary =
      totalEmployees > 0 ? totalPayroll / totalEmployees : 0;

    return {
      totalEmployees,
      totalPayroll,
      averageSalary,
    };
  };

  const approvePayroll = async () => {
    try {
      setIsLoading(true);
      const approvePromises = empPayrolls.map((payroll) =>
        axios.post("/api/payroll/payslip", {
          ...payroll,
          payrollId: formData.payroll_id,
          employerId,
        })
      );

      await Promise.all(approvePromises);
      setStatus({
        type: "success",
        message: "Payroll approved successfully",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to approve payroll",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeSelection = (employeeId) => {
    setSelectedEmployees((prev) => ({
      ...prev,
      [employeeId]: !prev[employeeId],
    }));
  };

  const getSelectedEmployees = () => {
    console.log(empPayrolls);
    return empPayrolls.filter((emp) => selectedEmployees[emp.employeeId]);
  };

  // Replace the existing approveSelectedPayroll function with this:

  const approveSelectedPayroll = async () => {
    try {
      setIsLoading(true);
      setShowApprovalDialog(false);

      const selectedPayrolls = getSelectedEmployees();
      const employeeIds = selectedPayrolls.map((p) => p.employeeId);
      const amounts = selectedPayrolls.map(
        (p) => p.payrollBreakdown.netPayable
      );

      // Update payroll status
      const response = await axios.put(
        `/api/payroll/payroll-process/${formData.payroll_id}`,
        {
          employeeIds,
          amounts,
          totalEmployees: empPayrolls.length,
        }
      );

      // Create payslips and update YTD
      const updatedYtd = { ...ytdTotals };
      for (const payroll of selectedPayrolls) {
        console.log("done1");
        await axios.post("/api/payroll/payslip", {
          ...payroll,
          payrollId: formData.payroll_id,
          employerId,
        });

        // Update YTD totals for this employee
        //   const employeeId = payroll.employeeId;
        //   if (!updatedYtd[employeeId]) {
        //     updatedYtd[employeeId] = {
        //       grossPay: 0,
        //       netPay: 0,
        //       deductions: { paye: 0, npf: 0, acc: 0, other: 0, total: 0 },
        //       allowances: { taxable: 0, nonTaxable: 0, total: 0 },
        //       hours: {
        //         normal: 0,
        //         overtime: 0,
        //         doubleTime: 0,
        //         holiday: 0,
        //         total: 0,
        //       },
        //       employerContributions: { acc: 0, npf: 0, total: 0 },
        //     };
        //   }

        //   updatedYtd[employeeId].grossPay +=
        //     payroll.payrollBreakdown.grossPay || 0;
        //   updatedYtd[employeeId].netPay +=
        //     payroll.payrollBreakdown.netPayable || 0;
        //   updatedYtd[employeeId].deductions.paye +=
        //     payroll.payrollBreakdown.deductions.paye || 0;
        //   updatedYtd[employeeId].deductions.npf +=
        //     payroll.payrollBreakdown.deductions.npf || 0;
        //   updatedYtd[employeeId].deductions.acc +=
        //     payroll.payrollBreakdown.deductions.acc || 0;
        //   updatedYtd[employeeId].deductions.other +=
        //     payroll.payrollBreakdown.deductions.other || 0;
        //   updatedYtd[employeeId].deductions.total +=
        //     payroll.payrollBreakdown.deductions.total || 0;
        //   updatedYtd[employeeId].allowances.taxable +=
        //     payroll.ytdContribution.allowances.taxable || 0;
        //   updatedYtd[employeeId].allowances.nonTaxable +=
        //     payroll.ytdContribution.allowances.nonTaxable || 0;
        //   updatedYtd[employeeId].allowances.total +=
        //     payroll.ytdContribution.allowances.total || 0;
        //   updatedYtd[employeeId].hours.normal +=
        //     payroll.workDetails.normalHours || 0;
        //   updatedYtd[employeeId].hours.overtime +=
        //     payroll.workDetails.overtimeHours || 0;
        //   updatedYtd[employeeId].hours.doubleTime +=
        //     payroll.workDetails.doubleTimeHours || 0;
        //   updatedYtd[employeeId].hours.holiday +=
        //     payroll.workDetails.holidayHours || 0;
        //   updatedYtd[employeeId].hours.total +=
        //     payroll.workDetails.totalWorkHours || 0;
        //   updatedYtd[employeeId].employerContributions.acc +=
        //     payroll.payrollBreakdown.employerContributions?.acc || 0;
        //   updatedYtd[employeeId].employerContributions.npf +=
        //     payroll.payrollBreakdown.employerContributions?.npf || 0;
        //   updatedYtd[employeeId].employerContributions.total +=
        //     payroll.payrollBreakdown.employerContributions?.total || 0;
      }

      // Save updated YTD totals to backend
      // await axios.post("/api/payroll/ytd", {
      //   employerId,
      //   year: new Date().getFullYear(),
      //   ytdData: updatedYtd,
      // });

      // setYtdTotals(updatedYtd);

      setStatus({
        type: "success",
        message: `Approved ${selectedPayrolls.length} employees. ${
          empPayrolls.length - selectedPayrolls.length
        } remaining.`,
      });

      if (response.data.success) {
        fetchPayrolls();
        calculatePayroll();
      }
    } catch (error) {
      setStatus({
        type: "error",
        message:
          "Failed to approve payroll: " +
          (error.response?.data?.message || error.message),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Editable States Updated: ", {
      editableAllowances,
      editableHours,
      editableRates,
    });
  }, [editableAllowances, editableHours, editableRates]);
  // Add this right before your return statement in the component
  // This will track employees with issues when the payroll is calculated
  useEffect(() => {
    if (empPayrolls.length > 0) {
      const issueEmployees = empPayrolls
        .filter((payroll) => {
          const hasValidHours = payroll.workDetails.totalWorkHours > 0;
          const hasValidPay = payroll.payrollBreakdown.netPayable > 0;
          return !(hasValidHours && hasValidPay);
        })
        .map((payroll) => payroll.employeeId);

      setEmployeesWithIssues(issueEmployees);
    }
  }, [empPayrolls]);

  const reopenPayrollPeriod = async (id) => {
    if (
      !confirm(
        "Reopening will allow modifications to approved payrolls. Continue?"
      )
    )
      return;

    try {
      setIsLoading(true);

      // Step 1: Reopen the payroll period by updating its status
      await axios.put(`/api/payroll/payroll-process?payrollID=${id}`, {
        status: "Pending",
        processedEmployees: [],
        totalAmount: 0,
      });

      // Step 2: Fetch payslip data for the payroll period
      const payslipResponse = await axios.get(
        `/api/payroll/payslip/reopen?employerId=${employerId}&payrollID=${id}`
      );
      if (!payslipResponse.data.success) {
        throw new Error("Failed to fetch payslip data");
      }

      const payslips = payslipResponse.data.data || [];
      console.log("Fetched payslips for reopening:", payslips);

      // Step 3: Populate empPayrolls with payslip data
      const processedPayrolls = payslips.map((payslip) => ({
        employeeId: payslip.employeeId,
        employeeName: payslip.employeeName,
        npfNumber: payslip.npfNumber,
        employeeEmail: payslip.employeeEmail,
        payType: payslip.payType,
        monthNo: payslip.monthNo,
        weekNo: payslip.weekNo,
        year: payslip.year,
        allowanceEligible: payslip.allowanceEligible,
        payPeriodDetails: payslip.payPeriodDetails,
        paymentMethod: payslip.paymentMethod,
        workDetails: {
          numberOfDays: payslip.workDetails.numberOfDays,
          totalWorkHours: payslip.workDetails.totalWorkHours,
          normalHours: payslip.workDetails.normalHours,
          overtimeHours: payslip.workDetails.overtimeHours,
          doubleTimeHours: payslip.workDetails.doubleTimeHours,
          holidayHours: payslip.workDetails.holidayHours,
          hourlyRate: payslip.workDetails.hourlyRate,
          overtimeRate: payslip.workDetails.overtimeRate,
          doubleTimeRate: payslip.workDetails.doubleTimeRate,
          holidayRate: payslip.workDetails.holidayRate,
        },
        payrollBreakdown: {
          baseSalary: payslip.payrollBreakdown.baseSalary,
          normalPay: payslip.payrollBreakdown.normalPay,
          overtimePay: payslip.payrollBreakdown.overtimePay,
          doubleTimePay: payslip.payrollBreakdown.doubleTimePay,
          holidayPay: payslip.payrollBreakdown.holidayPay,
          allowances: payslip.payrollBreakdown.allowances,
          grossPay: payslip.payrollBreakdown.grossPay,
          taxableAllowances: payslip.payrollBreakdown.taxableAllowances || 0,
          nonTaxableAllowances:
            payslip.payrollBreakdown.nonTaxableAllowances || 0,
          deductions: {
            paye: payslip.payrollBreakdown.deductions.paye,
            acc: payslip.payrollBreakdown.deductions.acc,
            npf: payslip.payrollBreakdown.deductions.npf,
            other: payslip.payrollBreakdown.deductions.other,
            total: payslip.payrollBreakdown.deductions.total,
          },
          employerContributions: {
            acc: payslip.payrollBreakdown.employerContributions.acc,
            npf: payslip.payrollBreakdown.employerContributions.npf,
            total: payslip.payrollBreakdown.employerContributions.total,
          },
          netPayable: payslip.payrollBreakdown.netPayable,
          // hasAdjustments: payslip.payrollBreakdown.hasAdjustments || false,
        },
        settings: payslip.settings,
        // ytdContribution: payslip.ytdContribution,
      }));
      setEditableDays((prev) => {
        const newDays = { ...prev };
        processedPayrolls.forEach((p) => {
          if (p.payType === "SALARY") {
            newDays[p.employeeId] = Math.ceil(
              p.workDetails.normalHours / payrollSettings.maxRegularHoursPerDay
            );
          }
        });
        return newDays;
      });
      // Step 4: Update states
      console.log("Processed Payrolls: ", processedPayrolls);

      // Step 5: Update YTD totals by removing contributions from these payslips
      // const updatedYtd = { ...ytdTotals };
      // payslips.forEach((payslip) => {
      //   const employeeId = payslip.employeeId;
      //   if (updatedYtd[employeeId]) {
      //     updatedYtd[employeeId].grossPay -= payslip.payrollBreakdown.grossPay || 0;
      //     updatedYtd[employeeId].netPay -= payslip.payrollBreakdown.netPayable || 0;
      //     updatedYtd[employeeId].deductions.paye -= payslip.payrollBreakdown.deductions.paye || 0;
      //     updatedYtd[employeeId].deductions.npf -= payslip.payrollBreakdown.deductions.npf || 0;
      //     updatedYtd[employeeId].deductions.acc -= payslip.payrollBreakdown.deductions.acc || 0;
      //     updatedYtd[employeeId].deductions.other -= payslip.payrollBreakdown.deductions.other || 0;
      //     updatedYtd[employeeId].deductions.total -= payslip.payrollBreakdown.deductions.total || 0;
      //     updatedYtd[employeeId].hours.normal -= payslip.workDetails.normalHours || 0;
      //     updatedYtd[employeeId].hours.overtime -= payslip.workDetails.overtimeHours || 0;
      //     updatedYtd[employeeId].hours.doubleTime -= payslip.workDetails.doubleTimeHours || 0;
      //     updatedYtd[employeeId].hours.holiday -= payslip.workDetails.holidayHours || 0;
      //     updatedYtd[employeeId].hours.total -= payslip.workDetails.totalWorkHours || 0;
      //     updatedYtd[employeeId].employerContributions.acc -=
      //       payslip.payrollBreakdown.employerContributions?.acc || 0;
      //     updatedYtd[employeeId].employerContributions.npf -=
      //       payslip.payrollBreakdown.employerContributions?.npf || 0;
      //     updatedYtd[employeeId].employerContributions.total -=
      //       payslip.payrollBreakdown.employerContributions?.total || 0;

      //     // Remove employee from YTD if all values are zero
      //     if (
      //       updatedYtd[employeeId].grossPay === 0 &&
      //       updatedYtd[employeeId].netPay === 0 &&
      //       updatedYtd[employeeId].deductions.total === 0 &&
      //       updatedYtd[employeeId].hours.total === 0 &&
      //       updatedYtd[employeeId].employerContributions.total === 0
      //     ) {
      //       delete updatedYtd[employeeId];
      //     }
      //   }
      // });
      // setYtdTotals(updatedYtd);

      // Step 6: Update payroll list and select the reopened payroll
      const updatedPayrolls = await fetchPayrolls(); // Modified fetchPayrolls to return data
      const refreshedPayroll = updatedPayrolls.find((p) => p.payroll_id === id);

      console.log("Refreshed Payroll: ", refreshedPayroll);
      console.log("Updated Payrolls: ", updatedPayrolls);
      setPayrolls(updatedPayrolls);
      setSelectedPayroll(refreshedPayroll || null);
      setFormData((prev) => ({ ...prev, payroll_id: id }));
      setTimeout(() => {
        setEmpPayrolls(processedPayrolls);

        // Initialize editable states with payslip data
        setEditableAllowances((prev) => {
          const newAllowances = { ...prev };
          processedPayrolls.forEach((p) => {
            newAllowances[p.employeeId] = {
              taxable: p.payrollBreakdown.taxableAllowances,
              nonTaxable: p.payrollBreakdown.nonTaxableAllowances,
            };
          });
          return newAllowances;
        });

        setEditableHours((prev) => {
          const newHours = { ...prev };
          processedPayrolls.forEach((p) => {
            newHours[p.employeeId] = {
              normalHours: p.workDetails.normalHours,
              overtimeHours: p.workDetails.overtimeHours,
              doubleTimeHours: p.workDetails.doubleTimeHours,
              holidayHours: p.workDetails.holidayHours,
            };
          });
          return newHours;
        });

        // Initialize editable rates with payslip data
        setEditableRates((prev) => {
          const newRates = { ...prev };
          processedPayrolls.forEach((p) => {
            newRates[p.employeeId] = p.workDetails.hourlyRate;
          });
          return newRates;
        });

        // Initialize employee selections
        const initialSelection = {};
        processedPayrolls.forEach((employee) => {
          initialSelection[employee.employeeId] = true; // All selected by default
        });
        setSelectedEmployees(initialSelection);
      }, 100);

      // Step 7: Programmatically switch to the "Generate Payroll" tab
      setActiveTab("generate");
      console.log("processedPayrolls : ", processedPayrolls);
      // Step 8: Calculate payroll stats
      const stats = calculatePayrollStats(processedPayrolls);
      setPayrollStats(stats);

      setStatus({
        type: "success",
        message:
          "Payroll reopened and previous payslip data loaded for editing",
      });
      toast.success(
        "Payroll reopened and previous payslip data loaded for editing"
      );
    } catch (error) {
      console.error("Error reopening payroll:", error);
      setStatus({
        type: "error",
        message: "Failed to reopen payroll or load payslip data",
      });
      toast.error("Failed to reopen payroll or load payslip data");
    } finally {
      setIsLoading(false);
    }
  };

  const getPayrollType = (dateFrom, dateTo) => {
    try {
      const start = new Date(dateFrom);
      const end = new Date(dateTo);

      if (isNaN(start) || isNaN(end)) {
        console.warn("Invalid dates provided. Defaulting to Monthly.");
        return "Monthly";
      }

      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays <= 7) return "Weekly";
      if (diffDays <= 14) return "Fortnightly";
      if (diffDays >= 28 && diffDays <= 31) return "Monthly";

      // Map custom periods to the closest standard type
      if (diffDays < 10) return "Weekly";
      if (diffDays < 20) return "Fortnightly";
      return "Monthly";
    } catch (error) {
      console.warn("Error in getPayrollType:", error.message);
      return "Monthly";
    }
  };

  // Add this sorting logic before rendering your table rows
  const sortedEmployees = useMemo(() => {
    return [...empPayrolls].sort((a, b) => {
      if (sortConfig.key === "payType") {
        const aValue = a.payType === "SALARY" ? 0 : 1;
        const bValue = b.payType === "SALARY" ? 0 : 1;
        return sortConfig.direction === "ascending"
          ? aValue - bValue
          : bValue - aValue;
      }
      return 0;
    });
  }, [empPayrolls, sortConfig]);

  return (
    <div className="min-h-screen bg-background">
      <Header heading="Payroll Management" />

      <div className="p-4 sm:p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Employees</CardTitle>
              <CardDescription>Current pay period</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold">
                {payrollStats.totalEmployees}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Payroll</CardTitle>
              <CardDescription>Current pay period</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold">
                ${formatNumber(payrollStats.totalPayroll)}
              </p>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle>Average Salary</CardTitle>
              <CardDescription>Per employee</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold">
                ${payrollStats.averageSalary.toFixed(2)}
              </p>
            </CardContent>
          </Card> */}
        </div>

        {/* Status Messages */}

        {status.type && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            <div className="flex items-center justify-center h-full px-4">
              <Alert
                className={`max-w-lg pointer-events-auto shadow-2xl border-2 transition-all duration-300 ease-in-out ${
                  status.type === "error"
                    ? "bg-red-50 border-red-300 shadow-red-200/50"
                    : status.type === "success"
                    ? "bg-green-50 border-green-300 shadow-green-200/50"
                    : "bg-blue-50 border-blue-300 shadow-blue-200/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {status.type === "error" ? (
                      <AlertCircle className="text-red-600 w-5 h-5" />
                    ) : status.type === "success" ? (
                      <CheckCircle2 className="text-green-600 w-5 h-5" />
                    ) : (
                      <Info className="text-blue-600 w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <AlertTitle
                      className={`font-bold text-lg ${
                        status.type === "error"
                          ? "text-red-800"
                          : status.type === "success"
                          ? "text-green-800"
                          : "text-blue-800"
                      }`}
                    >
                      {status.type === "error"
                        ? "Error"
                        : status.type === "success"
                        ? "Success!"
                        : "Notice"}
                    </AlertTitle>
                    <AlertDescription
                      className={`font-medium mt-1 ${
                        status.type === "error"
                          ? "text-red-700"
                          : status.type === "success"
                          ? "text-green-700"
                          : "text-blue-700"
                      }`}
                    >
                      {status.message}
                    </AlertDescription>

                    {/* Progress bar for visual countdown */}
                    <div className="mt-3 mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all duration-75 ease-linear ${
                            status.type === "error"
                              ? "bg-red-500"
                              : status.type === "success"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                          style={{
                            width: "100%",
                            animation: "countdown 5s linear forwards",
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`${
                          status.type === "error"
                            ? "text-red-600 hover:text-red-700 hover:bg-red-100"
                            : status.type === "success"
                            ? "text-green-600 hover:text-green-700 hover:bg-green-100"
                            : "text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                        }`}
                        onClick={clearStatus}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </Alert>
            </div>

            {/* CSS for countdown animation */}
            <style jsx>{`
              @keyframes countdown {
                from {
                  width: 100%;
                }
                to {
                  width: 0%;
                }
              }
            `}</style>
          </div>
        )}

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="generate">Generate Payroll</TabsTrigger>
            <TabsTrigger value="history">Payroll History</TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <Card>
              <CardHeader>
                <CardTitle>Generate Payroll</CardTitle>
                <CardDescription>
                  Select a payroll period to process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:gap-6">
                  <div className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex-1 w-full sm:w-auto">
                      <Label htmlFor="payroll_id" className="mr-2">
                        Payroll Period
                      </Label>
                      <Popover
                        open={isPopoverOpen}
                        onOpenChange={setIsPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full sm:w-[400px] justify-between hover:text-background"
                          >
                            {formData.payroll_id
                              ? payrolls.find(
                                  (payroll) =>
                                    payroll.payroll_id === formData.payroll_id
                                )?.date_from
                                ? `${format(
                                    parseISO(
                                      payrolls.find(
                                        (payroll) =>
                                          payroll.payroll_id ===
                                          formData.payroll_id
                                      ).date_from
                                    ),
                                    "MMM dd yyyy"
                                  )} - ${format(
                                    parseISO(
                                      payrolls.find(
                                        (payroll) =>
                                          payroll.payroll_id ===
                                          formData.payroll_id
                                      ).date_to
                                    ),
                                    "MMM dd yyyy"
                                  )}`
                                : "Select period..."
                              : "Select payroll period..."}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full sm:w-[400px] p-0 hover:text-text_background">
                          <Command>
                            <CommandInput placeholder="Search payroll periods..." />
                            <CommandList>
                              <CommandEmpty>
                                No payroll periods found.
                              </CommandEmpty>
                              <CommandGroup>
                                {payrolls
                                  .filter((item) => item.status !== "Approved")
                                  .sort((a, b) => {
                                    const now = new Date();
                                    const currentYear = now.getFullYear();
                                    const currentMonth = now.getMonth();

                                    const dateA = new Date(a.date_from);
                                    const dateB = new Date(b.date_from);

                                    const yearA = dateA.getFullYear();
                                    const monthA = dateA.getMonth();

                                    const yearB = dateB.getFullYear();
                                    const monthB = dateB.getMonth();

                                    const isAFuture =
                                      yearA > currentYear ||
                                      (yearA === currentYear &&
                                        monthA >= currentMonth);
                                    const isBFuture =
                                      yearB > currentYear ||
                                      (yearB === currentYear &&
                                        monthB >= currentMonth);

                                    if (isAFuture && !isBFuture) return -1;
                                    if (!isAFuture && isBFuture) return 1;

                                    return dateA - dateB;
                                  })
                                  .map((payroll) => (
                                    <CommandItem
                                      key={payroll.payroll_id}
                                      value={`${format(
                                        parseISO(payroll.date_from),
                                        "MMM dd yyyy"
                                      )} - ${format(
                                        parseISO(payroll.date_to),
                                        "MMM dd yyyy"
                                      )}`}
                                      onSelect={() => {
                                        setFormData((prev) => ({
                                          ...prev,
                                          payroll_id: payroll.payroll_id,
                                        }));
                                        setSelectedPayroll(payroll);
                                        setIsPopoverOpen(false); // Close the popover after selection
                                      }}
                                      className="group hover:bg-red_foreground transition-all duration-200"
                                    >
                                      <div className="w-full flex justify-between items-center p-1 rounded text-foreground group-hover:text-background">
                                        <span>
                                          {format(
                                            parseISO(payroll.date_from),
                                            "MMM dd yyyy"
                                          )}{" "}
                                          -{" "}
                                          {format(
                                            parseISO(payroll.date_to),
                                            "MMM dd yyyy"
                                          )}
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className="ml-2 text-foreground group-hover:text-background group-hover:border-background"
                                        >
                                          {getPayrollType(
                                            payroll.date_from,
                                            payroll.date_to
                                          )}
                                        </Badge>
                                      </div>
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Button
                      onClick={calculatePayroll}
                      disabled={isLoading || !formData.payroll_id}
                      className="w-full sm:w-auto bg-red_foreground hover:text-foreground hover:bg-background "
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing
                        </>
                      ) : (
                        "Calculate Payroll"
                      )}
                    </Button>
                  </div>

                  {/* Payroll Table */}
                  <div className="relative rounded-lg border border-text_background/10 overflow-x-auto z-0">
                    <Table className="min-w-[1500px]">
                      <TableHeader className="sticky top-0 bg-foreground text-background z-10 ">
                        <TableRow className="border-background/10 bg-red_foreground ">
                          <TableHead className="w-12  ">
                            <Checkbox
                              className=""
                              checked={
                                empPayrolls.length > 0 &&
                                empPayrolls.every(
                                  (p) => selectedEmployees[p.employeeId]
                                )
                              }
                              onCheckedChange={(checked) => {
                                const newSelection = {};
                                empPayrolls.forEach((p) => {
                                  newSelection[p.employeeId] = !!checked;
                                });
                                setSelectedEmployees(newSelection);
                              }}
                            />
                          </TableHead>
                          <TableHead className="font-bold text-background">
                            Employee
                          </TableHead>
                          <TableHead className="font-bold cursor-pointer hover:bg-muted/50 text-background">
                            <div
                              className="flex items-center gap-1"
                              onClick={() => handleSort("payType")}
                            >
                              Type
                              <ArrowUpDown className="h-4 w-4" />
                              {sortConfig.key === "payType" && (
                                <span className="text-xs ml-1">
                                  {sortConfig.direction === "ascending"
                                    ? "↑"
                                    : "↓"}
                                </span>
                              )}
                            </div>
                          </TableHead>
                          <TableHead className="font-bold text-background text-center">
                            Rate
                          </TableHead>
                          <TableHead className="font-bold text-background text-center">
                            Days
                          </TableHead>
                          <TableHead className="font-bold text-background text-center">
                            NT
                          </TableHead>
                          <TableHead className="font-bold text-background text-center">
                            OT
                          </TableHead>
                          <TableHead className="font-bold text-background text-center">
                            DT
                          </TableHead>
                          <TableHead className="font-bold text-background text-center">
                            HT
                          </TableHead>

                          <TableHead className="font-bold text-background text-center">
                            Allowances (Tax / Non-Tax)
                          </TableHead>
                          <TableHead className="font-bold text-background text-center">
                            Holiday Pay
                          </TableHead>
                          <TableHead className="font-bold text-background text-center">
                            Gross Pay
                          </TableHead>
                          <TableHead className="font-bold text-background text-center">
                            Deductions
                          </TableHead>
                          <TableHead className="font-bold text-background text-center">
                            Net Pay
                          </TableHead>
                          <TableHead className="font-bold text-background">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedEmployees.length > 0 ? (
                          sortedEmployees.map((payroll, index) => {
                            console.log(payroll);
                            // Calculate total deductions
                            const totalDeductions =
                              payroll.payrollBreakdown.deductions.paye +
                              payroll.payrollBreakdown.deductions.npf +
                              payroll.payrollBreakdown.deductions.acc +
                              payroll.payrollBreakdown.deductions.other;

                            // Check if data looks valid
                            const hasValidHours =
                              payroll.workDetails.totalWorkHours > 0;
                            const hasValidPay =
                              payroll.payrollBreakdown.netPayable > 0;
                            const isDataComplete = hasValidHours && hasValidPay;

                            return (
                              <TableRow
                                key={index}
                                className={
                                  !selectedEmployees[payroll.employeeId]
                                    ? "opacity-60 bg-muted/20"
                                    : ""
                                }
                              >
                                <TableCell>
                                  <Checkbox
                                    checked={
                                      !!selectedEmployees[payroll.employeeId]
                                    }
                                    onCheckedChange={() =>
                                      handleEmployeeSelection(
                                        payroll.employeeId
                                      )
                                    }
                                  />
                                </TableCell>
                                <TableCell className="font-medium">
                                  <div>
                                    <p className="text-md text-foreground font-bold ">
                                      {payroll.employeeName}
                                    </p>
                                    <p className="text-xs text-foreground truncate ">
                                      Email: {payroll.employeeEmail}
                                    </p>
                                    <p className="text-xs text-foreground truncate ">
                                      NPF: {payroll.npfNumber}
                                    </p>
                                    <p className="text-xs text-foreground truncate ">
                                      ID: {payroll.employeeId}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {payroll.payType === "SALARY"
                                    ? "Salary"
                                    : "Wages"}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                      editableRates[payroll.employeeId] || 0
                                    }
                                    onChange={(e) =>
                                      handleRateChange(
                                        payroll.employeeId,
                                        e.target.value
                                      )
                                    }
                                    disabled={payroll.payType === "SALARY"}
                                    placeholder="Hourly Rate"
                                    className="w-24 bg-background text-foreground shadow font-semibold"
                                  />
                                </TableCell>

                                <TableCell className="text-center">
                                  {payroll.payType === "SALARY" ? (
                                    <Input
                                      type="number"
                                      min="0"
                                      value={
                                        editableDays[payroll.employeeId] || 0
                                      }
                                      onChange={(e) =>
                                        handleDaysChange(
                                          payroll.employeeId,
                                          e.target.value
                                        )
                                      }
                                      placeholder="Days"
                                      className="w-24 bg-background text-foreground shadow font-semibold"
                                    />
                                  ) : (
                                    <span className="text-muted-foreground">
                                      N/A
                                    </span>
                                  )}
                                </TableCell>

                                {/* NT Column */}
                                <TableCell className="text-center">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={
                                      editableHours[payroll.employeeId]
                                        ?.normalHours || 0
                                    }
                                    onChange={(e) =>
                                      handleHoursChange(
                                        payroll.employeeId,
                                        "normalHours",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Hours"
                                    className="w-24 bg-background text-foreground shadow font-semibold"
                                  />
                                </TableCell>

                                <TableCell className="text-right">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={
                                      editableHours[payroll.employeeId]
                                        ?.overtimeHours || 0
                                    }
                                    onChange={(e) =>
                                      handleHoursChange(
                                        payroll.employeeId,
                                        "overtimeHours",
                                        e.target.value
                                      )
                                    }
                                    disabled={payroll.payType === "SALARY"}
                                    placeholder="Overtime Hours"
                                    className="w-24 bg-background text-foreground shadow font-semibold"
                                  />
                                </TableCell>

                                <TableCell className="text-right">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={
                                      editableHours[payroll.employeeId]
                                        ?.doubleTimeHours || 0
                                    }
                                    onChange={(e) =>
                                      handleHoursChange(
                                        payroll.employeeId,
                                        "doubleTimeHours",
                                        e.target.value
                                      )
                                    }
                                    disabled={payroll.payType === "SALARY"}
                                    placeholder="Double Time Hours"
                                    className="w-24 bg-background text-foreground shadow font-semibold"
                                  />
                                </TableCell>

                                <TableCell className="text-right">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={
                                      editableHours[payroll.employeeId]
                                        ?.holidayHours || 0
                                    }
                                    onChange={(e) =>
                                      handleHoursChange(
                                        payroll.employeeId,
                                        "holidayHours",
                                        e.target.value
                                      )
                                    }
                                    disabled={payroll.payType === "SALARY"}
                                    placeholder="Holiday Hours"
                                    className="w-24 bg-background text-foreground shadow font-semibold"
                                  />
                                </TableCell>

                                <TableCell className="text-right">
                                  <div className="flex gap-2">
                                    <Input
                                      type="number"
                                      min="0"
                                      value={
                                        editableAllowances[payroll.employeeId]
                                          ?.taxable || 0
                                      }
                                      onChange={(e) =>
                                        handleAllowanceChange(
                                          payroll.employeeId,
                                          "taxable",
                                          e.target.value
                                        )
                                      }
                                      disabled={!payroll.allowanceEligible}
                                      placeholder="Taxable"
                                      className="w-24 bg-background text-foreground shadow font-semibold"
                                    />
                                    <Input
                                      type="number"
                                      min="0"
                                      value={
                                        editableAllowances[payroll.employeeId]
                                          ?.nonTaxable || 0
                                      }
                                      onChange={(e) =>
                                        handleAllowanceChange(
                                          payroll.employeeId,
                                          "nonTaxable",
                                          e.target.value
                                        )
                                      }
                                      disabled={!payroll.allowanceEligible}
                                      placeholder="Non-Taxable"
                                      className="w-24 bg-background text-foreground shadow font-semibold"
                                    />
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  $
                                  {formatNumber(
                                    payroll.payrollBreakdown.holidayPay
                                  )}
                                </TableCell>

                                <TableCell className="font-bold text-right">
                                  $
                                  {formatNumber(
                                    payroll.payrollBreakdown.grossPay
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger className="underline underline-offset-4 decoration-dotted">
                                        ${formatNumber(totalDeductions)}
                                      </TooltipTrigger>
                                      <TooltipContent side="left">
                                        <div className="space-y-1 text-xs text-foreground">
                                          <div className="grid grid-cols-2 gap-2">
                                            <span>PAYE:</span>
                                            <span className="text-right">
                                              $
                                              {formatNumber(
                                                payroll.payrollBreakdown
                                                  .deductions.paye
                                              )}
                                            </span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2">
                                            <span>NPF:</span>
                                            <span className="text-right">
                                              $
                                              {formatNumber(
                                                payroll.payrollBreakdown
                                                  .deductions.npf
                                              )}
                                            </span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2">
                                            <span>ACC:</span>
                                            <span className="text-right">
                                              $
                                              {formatNumber(
                                                payroll.payrollBreakdown
                                                  .deductions.acc
                                              )}
                                            </span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2">
                                            <span>Other:</span>
                                            <span className="text-right">
                                              $
                                              {formatNumber(
                                                payroll.payrollBreakdown
                                                  .deductions.other
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                      
                                </TableCell>
                                <TableCell className="font-bold text-right">
                                  $
                                  {formatNumber(
                                    payroll.payrollBreakdown.netPayable
                                  )}
                                </TableCell>
                                <TableCell>
                                  {selectedPayroll?.processedEmployees?.includes(
                                    payroll.employeeId
                                  ) ? (
                                    <Badge
                                      variant="outline"
                                      className="border-green-200 text-green-700 bg-green-50"
                                    >
                                      <CheckCircle2 className="mr-1 h-3 w-3" />
                                      Approved
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="border-amber-200 text-amber-600 bg-amber-50"
                                    >
                                      Pending
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={9}
                              className="text-center py-8 text-muted-foreground"
                            >
                              <div className="flex flex-col items-center justify-center space-y-3">
                                <FileSpreadsheet className="h-8 w-8" />
                                <p>No payroll data available</p>
                                <p className="text-xs max-w-md">
                                  Select a payroll period and click
                                  &quot;Calculate Payroll&quot; to process
                                  employee data
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {empPayrolls.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                      <div className="text-sm text-muted-foreground">
                        {
                          Object.values(selectedEmployees).filter(Boolean)
                            .length
                        }{" "}
                        of {empPayrolls.length} employees selected
                      </div>
                      <div className="flex flex-wrap justify-end gap-4">
                        {/* <Button variant="outline" disabled={isLoading}>
                          <Download className="mr-2 h-4 w-4" />
                          Export to Excel
                        </Button> */}

                        {/* Add this recalculation button */}
                        {employeesWithIssues.some(
                          (id) => !selectedEmployees[id]
                        ) && (
                          <Button
                            variant="outline"
                            className="border-amber-500 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            onClick={recalculateSelectedPayroll}
                            disabled={isLoading}
                          >
                            <Loader2
                              className={`mr-2 h-4 w-4  ${
                                isLoading ? "animate-spin" : ""
                              }`}
                            />
                            Recalculate Fixed Employees
                          </Button>
                        )}
                        {/* <Button
                          onClick={createAdjustmentPayroll}
                          disabled={
                            isLoading ||
                            !formData.payroll_id 
                            // !empPayrolls.some((p) => p.hasAdjustments)
                          }
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                        >
                          Create Adjustment Payroll
                        </Button> */}

                        <Button
                          onClick={() => setShowApprovalDialog(true)}
                          disabled={
                            isLoading ||
                            Object.values(selectedEmployees).filter(Boolean)
                              .length === 0
                          }
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve Selected
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <CardTitle>Payroll History</CardTitle>
                    <CardDescription>
                      View and manage past payroll records
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative w-full sm:w-64">
                      <Input
                        placeholder="Search payrolls..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-10 bg-background placeholder:text-text_background/40 text-foreground"
                      />
                      <Search className="absolute left-3 top-2.5 h-5 w-5 text-red_foreground" />
                    </div>
                    {/* <Select
                      value={selectedStatus}
                      onValueChange={(value) => {
                        setSelectedStatus(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        
                        <SelectItem value="approved">Approved</SelectItem>
                      </SelectContent>
                    </Select> */}

                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => {
                        setItemsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Items/page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 per page</SelectItem>
                        <SelectItem value="25">25 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Add YTD Summary Card */}
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>
                      YTD Summary ({new Date().getFullYear()})
                    </CardTitle>
                    <CardDescription>
                      Cumulative payroll totals for the current year
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Gross Pay
                        </p>
                        <p className="text-lg font-bold">
                          $
                          {formatNumber(
                            Object.values(ytdTotals).reduce(
                              (sum, ytd) => sum + (ytd.grossPay || 0),
                              0
                            )
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Net Pay
                        </p>
                        <p className="text-lg font-bold">
                          $
                          {formatNumber(
                            Object.values(ytdTotals).reduce(
                              (sum, ytd) => sum + (ytd.netPay || 0),
                              0
                            )
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total PAYE
                        </p>
                        <p className="text-lg font-bold">
                          $
                          {formatNumber(
                            Object.values(ytdTotals).reduce(
                              (sum, ytd) => sum + (ytd.deductions.paye || 0),
                              0
                            )
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-background/10 bg-red_foreground">
                        <TableHead className="font-bold text-background cursor-pointer hover:bg-muted/50">
                          <div className="flex items-center gap-1">
                            Period
                            <button onClick={() => handleSort("period")}>
                              <ArrowUpDown className="h-4 w-4" />
                            </button>
                          </div>
                        </TableHead>
                        <TableHead className="font-bold text-background">
                          Type
                        </TableHead>
                        <TableHead className="font-bold text-background cursor-pointer hover:bg-muted/50">
                          <div className="flex items-center gap-1">
                            Date Range
                            <button onClick={() => handleSort("date")}>
                              <ArrowUpDown className="h-4 w-4" />
                            </button>
                          </div>
                        </TableHead>
                        <TableHead className="font-bold text-background text-right">
                          Employees
                        </TableHead>
                        <TableHead className="font-bold text-background text-right">
                          Total
                        </TableHead>
                        <TableHead className="font-bold text-background">
                          Status
                        </TableHead>
                        <TableHead className=" font-bold text-background">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        [...Array(itemsPerPage)].map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Search className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                              <Search className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                              <Search className="h-4 w-32" />
                            </TableCell>
                            <TableCell>
                              <Search className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                              <Search className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                              <Search className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                              <Search className="h-4 w-24" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : currentItems.length > 0 ? (
                        currentItems
                          .filter((payroll) => payroll.status === "Approved")
                          .map((payroll, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {payroll.month_no
                                  ? `${payroll.month_no}/${payroll.year}`
                                  : `Week ${payroll.week_no}, ${payroll.year}`}
                              </TableCell>
                              <TableCell>
                                {getPayrollType(
                                  payroll.date_from,
                                  payroll.date_to
                                )}
                              </TableCell>
                              <TableCell>
                                {format(
                                  parseISO(payroll.date_from),
                                  "MMM dd yyyy"
                                )}{" "}
                                -{" "}
                                {format(
                                  parseISO(payroll.date_to),
                                  "MMM dd yyyy"
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {payroll.processedEmployees.length || 0}
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                ${payroll.totalAmount?.toFixed(2) || "0.00"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    payroll.status === "Approved"
                                      ? "default"
                                      : "outline"
                                  }
                                  className={
                                    payroll.status === "Pending"
                                      ? "bg-amber-50 text-amber-600 border-amber-200"
                                      : payroll.status === "Approved"
                                      ? ""
                                      : "bg-muted text-muted-foreground"
                                  }
                                >
                                  {payroll.status || "Draft"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end space-x-2">
                                  {/* <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      payroll_id: payroll.payroll_id,
                                    }));
                                    setSelectedPayroll(payroll);
                                    document
                                      .querySelector('[value="generate"]')
                                      ?.click();
                                    if (payroll.status === "Approved")
                                      calculatePayroll();
                                  }}
                                >
                                  <FileSpreadsheet className="h-4 w-4" />
                                </Button> */}

                                  {selectedPayroll?.status !== "Pending" && (
                                    <Button
                                      variant="outline"
                                      className="border-red-200 text-red_foreground  hover:text-background"
                                      onClick={() =>
                                        reopenPayrollPeriod(payroll.payroll_id)
                                      }
                                    >
                                      <LockOpen className="mr-2 h-4 w-4" />
                                      Reopen Payroll
                                    </Button>
                                  )}
                                  {/* {payroll.status !== "Approved" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={async () => {
                                      if (
                                        confirm(
                                          `Delete payroll period ${new Date(
                                            payroll.date_from
                                          ).toLocaleDateString()} - ${new Date(
                                            payroll.date_to
                                          ).toLocaleDateString()}?`
                                        )
                                      ) {
                                        try {
                                          await axios.delete(
                                            `/api/payroll/payroll-process/${payroll.payroll_id}`
                                          );
                                          fetchPayrolls();
                                          setStatus({
                                            type: "success",
                                            message: "Payroll period deleted",
                                          });
                                        } catch (error) {
                                          setStatus({
                                            type: "error",
                                            message: "Delete failed",
                                          });
                                        }
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )} */}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-8 text-muted-foreground"
                          >
                            <div className="flex flex-col items-center justify-center space-y-3">
                              <FileSpreadsheet className="h-8 w-8" />
                              <p>No matching payrolls found</p>
                              {searchTerm && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSearchTerm("");
                                    setSelectedStatus("approved");
                                  }}
                                >
                                  Clear filters
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {filteredPayrolls.filter(
                  (payroll) => payroll.status === "Approved"
                ).length > itemsPerPage && (
                  <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {indexOfFirstItem + 1}-
                      {Math.min(indexOfLastItem, filteredPayrolls.length)} of{" "}
                      {filteredPayrolls.length} payrolls
                    </div>
                    <Pagination className="justify-end">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(Math.max(1, currentPage - 1));
                            }}
                            className={
                              currentPage === 1
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <span className="px-4 text-sm font-medium">
                            Page {currentPage} of {totalPages}
                          </span>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(
                                Math.min(totalPages, currentPage + 1)
                              );
                            }}
                            className={
                              currentPage === totalPages
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog
        open={showApprovalDialog}
        onOpenChange={setShowApprovalDialog}
      >
        <AlertDialogContent className="max-w-4xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payroll Approval</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to approve payroll for the following{" "}
              {getSelectedEmployees().length} employees:
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4 max-h-[40vh] overflow-auto border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-background ">
                <TableRow className="bg-muted/50">
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-right">Gross Pay</TableHead>
                  <TableHead className="text-right">Net Pay</TableHead>
                  <TableHead className="text-right">YTD Gross</TableHead>
                  <TableHead className="text-right">YTD Net</TableHead>
                  <TableHead className="text-right">YTD PAYE</TableHead>
                  <TableHead className="text-right">Payment Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getSelectedEmployees().map((emp, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      {emp.employeeName}
                    </TableCell>
                    <TableCell className="text-right">
                      ${formatNumber(emp.payrollBreakdown.grossPay)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ${formatNumber(emp.payrollBreakdown.netPayable)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${formatNumber(ytdTotals[emp.employeeId]?.grossPay || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${formatNumber(ytdTotals[emp.employeeId]?.netPay || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      $
                      {formatNumber(
                        ytdTotals[emp.employeeId]?.deductions.paye || 0
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {emp.paymentMethod}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted/20 font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    $
                    {formatNumber(
                      getSelectedEmployees().reduce(
                        (sum, emp) => sum + emp.payrollBreakdown.grossPay,
                        0
                      )
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    $
                    {formatNumber(
                      getSelectedEmployees().reduce(
                        (sum, emp) => sum + emp.payrollBreakdown.netPayable,
                        0
                      )
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    $
                    {formatNumber(
                      getSelectedEmployees().reduce(
                        (sum, emp) =>
                          sum + (ytdTotals[emp.employeeId]?.grossPay || 0),
                        0
                      )
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    $
                    {formatNumber(
                      getSelectedEmployees().reduce(
                        (sum, emp) =>
                          sum + (ytdTotals[emp.employeeId]?.netPay || 0),
                        0
                      )
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    $
                    {formatNumber(
                      getSelectedEmployees().reduce(
                        (sum, emp) =>
                          sum +
                          (ytdTotals[emp.employeeId]?.deductions.paye || 0),
                        0
                      )
                    )}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          <AlertDialogDescription className="text-amber-600">
            {selectedPayroll?.status === "Approved" && (
              <p className="mb-2 font-medium">
                ⚠️ This payroll was previously approved on{" "}
                {new Date(selectedPayroll.updatedAt).toLocaleDateString()}
              </p>
            )}
            <span className="mt-2">
              This action will generate payslips for{" "}
              {getSelectedEmployees().length} employees.
            </span>
            <br />
            {empPayrolls.length - getSelectedEmployees().length > 0 && (
              <span className="mt-2">
                {empPayrolls.length - getSelectedEmployees().length} employees
                will remain pending.
              </span>
            )}
          </AlertDialogDescription>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={approveSelectedPayroll}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve Payroll
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
export default PayrollDashboard;

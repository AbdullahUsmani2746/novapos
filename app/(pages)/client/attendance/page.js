"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { format, parseISO } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Clock8,
  Coffee,
  PauseCircle,
  Plus,
  Save,
  Search,
  XCircle,
  Calendar,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import Header from "@/components/Others/breadcumb";
import LoadingSpinner from "@/components/Others/spinner";
import axios from "@/lib/axiosInstance";

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";

// Animation Variants
const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  },
};

// Status Icon Component
const StatusIcon = ({ status }) => {
  const statusIcons = {
    Pending: <PauseCircle className="text-yellow-500 w-5 h-5" />,
    Approved: <CheckCircle2 className="text-green-500 w-5 h-5" />,
    Rejected: <XCircle className="text-red-500 w-5 h-5" />,
  };

  return statusIcons[status] || null;
};

// Attendance Statistics Card
const AttendanceStatsCard = ({ data }) => {
  const calculateStats = useMemo(() => {
    if (!data.length)
      return {
        totalHoursWorked: 0,
      };

    return {
      totalHoursWorked: data.reduce(
        (sum, record) => sum + parseFloat(record.totalWorkingHours || 0),
        0
      ),
    };
  }, [data]);

  return (
    <motion.div
      className="bg-background rounded-xl shadow-md p-6 space-y-2 border border-background/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      variants={ANIMATION_VARIANTS.item}
    >
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Clock className="w-6 h-6" /> Attendance Overview
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <div className="text-left">
          <p className="text-foreground/70 text-sm">Total Hours Worked</p>
          <p className="text-2xl font-bold text-foreground">
            {calculateStats.totalHoursWorked.toFixed(1)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// FormInput Component with Error Handling
const FormInput = ({
  label,
  icon,
  id,
  type,
  placeholder,
  value,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-2 p-2">
      <label className="text-sm text-foreground/60" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40">
            {icon}
          </div>
        )}
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          className={`${
            icon ? "pl-10" : ""
          } bg-background border-background/10 text-foreground placeholder:text-foreground/40 ${
            error ? "border-red-500 pr-10" : ""
          }`}
          value={value}
          onChange={onChange}
        />
        {error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

// Modal component
const Modal = ({ onClose, children }) => {
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
        <motion.div
          className="w-full max-w-4xl mx-auto h-[98vh] flex flex-col"
          variants={ANIMATION_VARIANTS.container}
        >
          <Card className="bg-background border-white/10 shadow-xl flex flex-col h-full">
            <div className="flex-1 overflow-hidden">{children}</div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main Attendance Component
const PeriodicAttendanceComponent = () => {
  const companyId = 1; // Fixed company ID as per your model default

  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [payrollSortBy, setPayrollSortBy] = useState("createdAt");
  const [payrollSortOrder, setPayrollSortOrder] = useState("desc");

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 15,
  });

  const checkboxRef = useRef(null);
  const [payrollPeriods, setPayrollPeriods] = useState([]);

  const [filterOptions, setFilterOptions] = useState({
    status: "",
    dateRange: null,
    sortBy: "dateRange",
  });

  const [newAttendance, setNewAttendance] = useState({
    payrollPeriod: null,
    entries: [],
    allHours: "",
    allDays: "",
    allBreakHours: "",
    allDoubleTime: "",
  });

  const [formErrors, setFormErrors] = useState({
    employeeId: "",
    dateRange: "",
    hoursWorked: "",
    breakHours: 0,
  });

  const [mode, setMode] = useState("bulk"); // 'bulk' or 'single'
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);

  const hasSalaryEmployees =
    mode === "bulk" &&
    employees.some(
      (emp) => selectedEmployees.has(emp.id) && emp.payType === "SALARY"
    );

  // Update the validateForm function
  const validateForm = async () => {
    const errors = {};
    let isValid = true;

    const response = await axios.get(`/api/employees?companyId=${companyId}`);
    const employees = response.data.data || [];
    const employee = employees.find(
      (emp) => emp.id === newAttendance.entries[0]?.employeeId
    );

    if (!newAttendance.payrollPeriod) {
      errors.payrollPeriod = "Payroll period is required";
      isValid = false;
    }
    
    const entryErrors = [];
    newAttendance.entries.forEach((entry, index) => {
      if (mode === "bulk" && !selectedEmployees.has(entry.employeeId)) return;

      const entryError = {};
      if (
        !entry.totalWorkingHours ||
        parseFloat(entry.totalWorkingHours) <= 0
      ) {
        entryError.hoursWorked = "must be greater than 0";
        isValid = false;
      }
      
      // Validation for break hours
      if (
        entry.totalBreakHours === "" ||
        entry.totalBreakHours === null ||
        entry.totalBreakHours === undefined
      ) {
        entryError.breakHours = "Required";
        isValid = false;
      } else if (parseFloat(entry.totalBreakHours) < 0) {
        entryError.breakHours = "must be 0 or greater";
        isValid = false;
      }

      // Validation for double time
      if (
        entry.totalDoubleTimeHours === "" ||
        entry.totalDoubleTimeHours === null ||
        entry.totalDoubleTimeHours === undefined
      ) {
        entryError.doubleTimeHours = "Required";
        isValid = false;
      } else if (parseFloat(entry.totalDoubleTimeHours) < 0) {
        entryError.doubleTimeHours = "must be 0 or greater";
        isValid = false;
      }

      // Validation for numberOfDays for salary employees
      if (employee?.payType === "SALARY") {
        if (
          entry.numberOfDays === "" ||
          entry.numberOfDays === null ||
          entry.numberOfDays === undefined
        ) {
          entryError.numberOfDays = "Required for salary employees";
          isValid = false;
        } else if (parseFloat(entry.numberOfDays) < 0) {
          entryError.numberOfDays = "must be 0 or greater";
          isValid = false;
        }
      }
      entryErrors[index] = entryError;
    });

    setFormErrors({
      ...errors,
      entries: entryErrors,
    });
    return isValid;
  };

  // Update the bulk update handler
  const handleBulkUpdate = (field, value) => {
    const updatedEntries = newAttendance.entries?.map((entry) => {
      const shouldUpdate =
        mode === "bulk"
          ? selectedEmployees.size === 0 ||
            selectedEmployees.has(entry.employeeId)
          : selectedEmployees.has(entry.employeeId);

      if (shouldUpdate) {
        return {
          ...entry,
          [field]: value === "" ? "" : Number(value),
        };
      }
      return entry;
    });

    setNewAttendance((prev) => ({
      ...prev,
      entries: updatedEntries,
      ...(mode === "bulk" && {
        allHours: field === "totalWorkingHours" ? value : prev.allHours,
        allDoubleTime:
          field === "totalDoubleTimeHours" ? value : prev.allDoubleTime,
        allBreakHours: field === "totalBreakHours" ? value : prev.allBreakHours,
        allDays: field === "numberOfDays" ? value : prev.allDays,
      }),
    }));
  };

  // Employee selection handlers
  const toggleEmployeeSelection = (employeeId) => {
    const newSelection = new Set(selectedEmployees);
    if (newSelection.has(employeeId)) {
      newSelection.delete(employeeId);
    } else {
      newSelection.add(employeeId);
    }
    setSelectedEmployees(newSelection);
  };

  const toggleAllEmployees = () => {
    if (mode === "bulk") {
      if (selectedEmployees.size === employees.length) {
        setSelectedEmployees(new Set());
      } else {
        setSelectedEmployees(new Set(employees?.map((e) => e.id)));
      }
    }
  };

  const handleAddAttendance = async () => {
    if (!(await validateForm())) return;

    try {
      setIsLoading(true);

      // Filter entries to only include selected employees in bulk mode
      const filteredEntries =
        mode === "bulk"
          ? newAttendance.entries.filter((entry) =>
              selectedEmployees.has(entry.employeeId)
            )
          : newAttendance.entries;

      const payload = {
        companyId: companyId,
        payrollPeriodId: newAttendance.payrollPeriod._id,
        entries: filteredEntries.map((entry) => ({
          employeeId: entry.employeeId,
          totalWorkingHours: entry.totalWorkingHours,
          totalBreakHours: entry.totalBreakHours,
          totalDoubleTimeHours: entry.totalDoubleTimeHours,
          numberOfDays: entry.numberOfDays,
          dateRange: `${format(parseISO(newAttendance.payrollPeriod.date_from), "yyyy-MM-dd")} to ${format(parseISO(newAttendance.payrollPeriod.date_to), "yyyy-MM-dd")}`,
          status: "Pending",
        })),
      };

      const response = await axios.post(
        `/api/employees/periodicAttendance`,
        payload
      );

      if (response.data.success) {
        toast.success("Attendance added successfully");
        fetchAttendanceData();
        closeModal();
      } else {
        toast.error("Error adding attendance");
      }
    } catch (error) {
      toast.error("Error: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setNewAttendance({
      payrollPeriod: null,
      entries: [],
      allHours: "",
      allDays: "",
      allBreakHours: "",
      allDoubleTime: "",
    });
    setFormErrors({});
  };

  const openModal = () => {
    setModalOpen(true);
  };

  useEffect(() => {
    if (newAttendance.payrollPeriod && employees.length > 0) {
      const initialEntries =
        mode === "bulk"
          ? employees?.map((employee) => ({
              employeeId: employee.id,
              totalWorkingHours: newAttendance.allHours || "",
              totalBreakHours: newAttendance.allBreakHours || "0",
              totalDoubleTimeHours: newAttendance.allDoubleTime || "0",
              numberOfDays: newAttendance.allDays || "0",
              status: "Pending",
            }))
          : [];

      setNewAttendance((prev) => ({
        ...prev,
        entries: initialEntries,
      }));

      if (mode === "bulk") {
        setSelectedEmployees(new Set(employees?.map((e) => e.id)));
      }
    }
  }, [newAttendance.payrollPeriod, employees, mode]);

  // Fetch payroll periods
  useEffect(() => {
    const fetchPayrollPeriods = async () => {
      try {
        const response = await axios.get(
          `/api/payroll/payroll-process?companyId=${companyId}`
        );
        setPayrollPeriods(response.data.data || []);
      } catch (error) {
        console.error("Error fetching payroll periods:", error);
      }
    };
    fetchPayrollPeriods();
  }, [companyId, payrollSortBy, payrollSortOrder]);

  useEffect(() => {
    fetchAttendanceData(1);
  }, [
    searchTerm,
    filterOptions.sortBy,
    sortOrder,
    filterOptions.status,
    filterOptions.dateRange,
  ]);

  // Fetch Attendance Data
  const fetchAttendanceData = async (
    page = 1,
    sortBy = filterOptions.sortBy,
    direction = sortOrder
  ) => {
    try {
      setIsLoading(true);

      const params = {
        companyId,
        page,
        limit: pagination.itemsPerPage,
        sortKey: sortBy,
        sortDirection: direction,
      };

      if (searchTerm) params.search = searchTerm;
      if (filterOptions.status) params.status = filterOptions.status;
      if (filterOptions.dateRange?.from && filterOptions.dateRange?.to) {
        params.from = filterOptions.dateRange.from;
        params.to = filterOptions.dateRange.to;
      }

      const response = await axios.get(`/api/employees/periodicAttendance`, {
        params,
      });

      setAttendanceData(response.data.data || []);
      if (response.data.pagination) {
        setPagination({
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.total,
          itemsPerPage: response.data.pagination.limit,
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        `/api/employees?companyId=${companyId}&inactive=ACTIVE`
      );
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleSort = (key) => {
    if (filterOptions.sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setFilterOptions((prev) => ({ ...prev, sortBy: key }));
      setSortOrder("asc");
    }
  };

  useEffect(() => {
    fetchAttendanceData(pagination.currentPage);
    fetchEmployees();
  }, [companyId, pagination.currentPage]);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate =
        selectedEmployees.size > 0 && selectedEmployees.size < employees.length;
    }
  }, [selectedEmployees, employees.length]);

  return (
    <>
      {isLoading ? (
        <LoadingSpinner
          variant="pulse"
          size="large"
          text="Processing..."
          fullscreen={true}
        />
      ) : (
        <>
          <Header heading="Time Entry Management" />

          <motion.div
            variants={ANIMATION_VARIANTS.container}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-background"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Card className="border-white/10">
                <CardContent className="p-8">
                  {/* Header Section */}
                  <motion.div
                    className="flex flex-col justify-between items-start gap-4 mb-8 
             sm:flex-row sm:items-center 
             lg:gap-6 lg:mb-10"
                    variants={ANIMATION_VARIANTS.item}
                  >
                    <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                      <h1 className="text-2xl font-bold text-foreground tracking-tight sm:text-3xl md:text-4xl lg:text-[2.5rem]">
                        Time Entry Management
                      </h1>
                      <p className="text-foreground/70 text-sm sm:text-base md:text-lg lg:text-foreground/80">
                        Comprehensive overview of employee attendance and
                        working hours
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto"
                    >
                      <Button
                        onClick={openModal}
                        className="w-full md:w-auto text-background bg-red_foreground hover:text-foreground hover:bg-background hover:bg-background/90 transition-all duration-200 shadow-lg hover:shadow-background/20 flex items-center justify-center py-2 px-4 text-sm sm:text-base"
                      >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2" />
                        Add Attendance Time
                      </Button>
                    </motion.div>
                  </motion.div>

                  {/* Stats and Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                    {/* Attendance Stats */}
                    <div className="sm:col-span-2 lg:col-span-1">
                      <AttendanceStatsCard data={attendanceData} />
                    </div>

                    {/* Filters */}
                    <motion.div
                      className="sm:col-span-2 lg:col-span-2 bg-background rounded-xl shadow-md p-4 sm:p-6 border border-background/10"
                      variants={ANIMATION_VARIANTS.item}
                    >
                      {/* Search Bar */}
                      <div className="mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red_foreground w-4 h-4" />
                          <Input
                            placeholder="Search Employees"
                            className="pl-10 bg-background/5 border-background/10 text-foreground placeholder:text-foreground/40 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Status Filter */}
                        <div>
                          <label className="block text-sm font-medium text-foreground/60 mb-2">
                            Filter by Status
                          </label>
                          <Select
                            value={filterOptions.status}
                            onValueChange={(value) =>
                              setFilterOptions((prev) => ({
                                ...prev,
                                status: value === "All" ? "" : value,
                              }))
                            }
                          >
                            <SelectTrigger className="bg-red_foreground text-background placeholder:text-foreground/40">
                              <SelectValue placeholder="All Statuses">
                                {filterOptions.status || "All Statuses"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">All Statuses</SelectItem>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Approved">Approved</SelectItem>
                              <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Payroll Period Date Range Filter */}
                        <div>
                          <label className="block text-sm font-medium text-foreground/60 mb-2">
                            Payroll Period
                          </label>
                          <Select
                            value={filterOptions.payrollPeriodId}
                            onValueChange={(value) => {
                              const selectedPeriod = payrollPeriods.find(
                                (p) => p._id === value
                              );
                              setFilterOptions((prev) => ({
                                ...prev,
                                payrollPeriodId: value,
                                dateRange: selectedPeriod
                                  ? {
                                      from: new Date(selectedPeriod.date_from),
                                      to: new Date(selectedPeriod.date_to),
                                    }
                                  : null,
                              }));
                            }}
                          >
                            <SelectTrigger className="bg-red_foreground text-background placeholder:text-foreground/40">
                              <SelectValue placeholder="Select payroll period">
                                {filterOptions.payrollPeriodId
                                  ? payrollPeriods.find(
                                      (p) =>
                                        p._id === filterOptions.payrollPeriodId
                                    )?.name
                                  : "Select Period"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">
                                <div className="flex justify-between items-center">
                                  <span className="ml-4">All Periods</span>
                                </div>
                              </SelectItem>
                              {payrollPeriods.map((period) => (
                                <SelectItem key={period._id} value={period._id}>
                                  <div className="flex justify-between items-center hover:bg-red_foreground hover:text-background">
                                    <span className="ml-4">
                                      {format(
                                        parseISO(period.date_from),
                                        "MMM dd yyyy"
                                      )}{" "}
                                      -{" "}
                                      {format(
                                        parseISO(period.date_to),
                                        "MMM dd yyyy"
                                      )}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Attendance Table */}
                  <motion.div
                    variants={ANIMATION_VARIANTS.container}
                    className="relative overflow-hidden rounded-lg border border-background/10"
                  >
                    <div className="relative rounded-lg border border-text_background/10 overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-background/10 bg-red_foreground">
                            {[
                              { key: "name", label: "Name" },
                              { key: "dateRange", label: "Date Range" },
                              { key: "totalWorkingHours", label: "Hours" },
                              { key: "totalBreakHours", label: "Break" },
                              { key: "totalDoubleTimeHours", label: "Double" },
                              { key: "numberOfDays", label: "Days" },
                            ].map((col) => (
                              <TableHead
                                key={col.key}
                                className="text-background font-medium py-5 px-6 cursor-pointer hover:bg-red-600 transition-colors"
                                onClick={() => handleSort(col.key)}
                              >
                                <div className="flex items-center gap-2">
                                  {col.label}
                                  {filterOptions.sortBy === col.key && (
                                    <ChevronDown
                                      className={`h-4 w-4 transform transition-transform ${
                                        sortOrder === "desc" ? "rotate-180" : ""
                                      }`}
                                    />
                                  )}
                                  {filterOptions.sortBy !== col.key && (
                                    <ChevronDown className="h-4 w-4 opacity-30" />
                                  )}
                                </div>
                              </TableHead>
                            ))}

                            <TableHead className="text-background font-medium py-5 px-6">
                              Status
                            </TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          <AnimatePresence>
                            {attendanceData?.map((record, index) => {
                              const emp = employees.find(
                                (e) => e.id === record.employeeId
                              );

                              if (!emp) return null;
                              return (
                                <motion.tr
                                  key={record.id}
                                  variants={ANIMATION_VARIANTS.item}
                                  initial="hidden"
                                  animate="visible"
                                  exit="hidden"
                                  className="border-b border-text_background/10"
                                >
                                  <TableCell className="py-4 px-6 text-foreground">
                                    <div className="text-foreground font-semibold">
                                      {emp ? `${emp.firstName} ${emp.surname}` : ""}
                                    </div>
                                    <span className="font-normal">
                                      {record.employeeId}
                                    </span>
                                  </TableCell>
                                  <TableCell className="py-4 px-6 text-foreground">
                                    <div className="font-medium text-foreground">
                                      {record.dateRange}
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4 px-6 text-foreground">
                                    <div className="text-foreground">
                                      {record.totalWorkingHours} hrs
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4 px-6 text-foreground">
                                    <div className="text-foreground">
                                      {record.totalBreakHours} hrs
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4 px-6 text-foreground">
                                    <div className="text-foreground">
                                      {record.totalDoubleTimeHours} hrs
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4 px-6 text-foreground">
                                    <div className="text-foreground">
                                      {record.numberOfDays} days
                                    </div>
                                  </TableCell>

                                  <TableCell className="py-4 px-6">
                                    <div className="flex items-center space-x-2">
                                      <Badge
                                        className={`text-white px-2 py-1 flex items-center gap-1.5 ${
                                          record.status === "Approved"
                                            ? "bg-[#A8E5A6]"
                                            : record.status === "Rejected"
                                              ? "bg-[#D0021B]"
                                              : record.status === "Pending"
                                                ? "bg-[#F5A623]"
                                                : ""
                                        }`}
                                      >
                                        <StatusIcon status={record.status} />
                                        {record.status}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                </motion.tr>
                              );
                            })}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {attendanceData.length > 0 && (
                      <div className="mt-4 py-4 border-t border-background/10">
                        <Pagination>
                          <PaginationContent className="text-foreground">
                            <PaginationItem>
                              <PaginationPrevious
                                className={`text-foreground ${
                                  pagination.currentPage === 1
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-background/10  hover:bg-red_foreground"
                                }`}
                                onClick={() => {
                                  if (pagination.currentPage > 1) {
                                    setPagination((prev) => ({
                                      ...prev,
                                      currentPage: prev.currentPage - 1,
                                    }));
                                  }
                                }}
                              />
                            </PaginationItem>

                            {Array.from(
                              { length: Math.min(5, pagination.totalPages) },
                              (_, i) => {
                                let pageNum;
                                if (pagination.totalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (pagination.currentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (
                                  pagination.currentPage >=
                                  pagination.totalPages - 2
                                ) {
                                  pageNum = pagination.totalPages - 4 + i;
                                } else {
                                  pageNum = pagination.currentPage - 2 + i;
                                }

                                return (
                                  <PaginationItem key={pageNum}>
                                    <PaginationLink
                                      className={`text-foreground ${
                                        pagination.currentPage === pageNum
                                          ? "bg-background/20 text-foreground cursor-pointer"
                                          : "hover-bg-background/10 text-foreground cursor-pointer"
                                      }`}
                                      onClick={() =>
                                        setPagination((prev) => ({
                                          ...prev,
                                          currentPage: pageNum,
                                        }))
                                      }
                                      isActive={
                                        pagination.currentPage === pageNum
                                      }
                                    >
                                      {pageNum}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              }
                            )}

                            {pagination.totalPages > 5 &&
                              pagination.currentPage <
                                pagination.totalPages - 2 && (
                                <PaginationItem>
                                  <PaginationEllipsis className="text-foreground" />
                                </PaginationItem>
                              )}

                            <PaginationItem>
                              <PaginationNext
                                className={`text-foreground ${
                                  pagination.currentPage ===
                                  pagination.totalPages
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-background/10 hover:bg-red_foreground"
                                }`}
                                onClick={() => {
                                  if (
                                    pagination.currentPage <
                                    pagination.totalPages
                                  ) {
                                    setPagination((prev) => ({
                                      ...prev,
                                      currentPage: prev.currentPage + 1,
                                    }));
                                  }
                                }}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </motion.div>

                  {/* Empty State */}
                  {attendanceData.length === 0 && (
                    <motion.div
                      variants={ANIMATION_VARIANTS.item}
                      className="text-center py-12"
                    >
                      <p className="text-foreground/40 text-lg">
                        {searchTerm || filterOptions.status
                          ? "No attendance records found matching your search"
                          : "No attendance records added yet"}
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </>
      )}

      {modalOpen && (
        <Modal
          onClose={closeModal}
          className="w-full max-w-md mx-auto p-2 sm:p-4"
        >
          <CardHeader className="pb-4 border-b border-background/10">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <CardTitle className="text-xl sm:text-2xl font-bold text-foreground w-full text-center sm:text-left">
                Add Attendance
              </CardTitle>
              <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
                <Button
                  variant={mode === "bulk" ? "default" : "outline"}
                  onClick={() => setMode("bulk")}
                  className="h-8 w-1/2 sm:w-auto"
                >
                  Bulk Mode
                </Button>
                <Button
                  variant={mode === "single" ? "default" : "outline"}
                  onClick={() => setMode("single")}
                  className="h-8 w-1/2 sm:w-auto"
                >
                  Single Mode
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddAttendance();
              }}
              className="h-full flex flex-col"
            >
              <div className="max-h-[70vh] space-y-4 overflow-auto">
                {/* Payroll Period Selection */}
                <div className="space-y-2 px-2">
                  <label className="text-sm text-foreground/60">
                    Payroll Period
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between bg-background/5 border-background/10 text-foreground"
                      >
                        {newAttendance.payrollPeriod
                          ? `${format(
                              parseISO(newAttendance.payrollPeriod.date_from),
                              "MMM dd yyyy"
                            )} - ${format(
                              parseISO(newAttendance.payrollPeriod.date_to),
                              "MMM dd yyyy"
                            )}`
                          : "Select payroll period..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 bg-background border-background/10">
                      <Command className="bg-background">
                        <CommandInput
                          placeholder="Search payroll periods..."
                          className="text-foreground"
                        />
                        <CommandList>
                          <CommandEmpty className="py-2 px-4 text-foreground/70">
                            No periods found.
                          </CommandEmpty>
                          {payrollPeriods
                            ?.sort((a, b) => {
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
                            .map((period) => (
                              <CommandItem
                                key={period._id}
                                value={`${format(
                                  parseISO(period.date_from),
                                  "MMM dd yyyy"
                                )} - ${format(
                                  parseISO(period.date_to),
                                  "MMM dd yyyy"
                                )}`}
                                onSelect={() => {
                                  const selected = payrollPeriods.find(
                                    (p) => p._id === period._id
                                  );
                                  setNewAttendance((prev) => ({
                                    ...prev,
                                    payrollPeriod: selected,
                                  }));
                                }}
                                className="cursor-pointer hover:bg-background/10 !text-foreground hover:bg-red_foreground hover:!text-background"
                              >
                                {format(
                                  parseISO(period.date_from),
                                  "MMM dd yyyy"
                                )}{" "}
                                -{" "}
                                {format(
                                  parseISO(period.date_to),
                                  "MMM dd yyyy"
                                )}
                              </CommandItem>
                            ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {formErrors.payrollPeriod && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.payrollPeriod}
                    </p>
                  )}
                </div>
                
                {newAttendance.payrollPeriod && (
                  <>
                    {mode === "bulk" && (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <FormInput
                          label="Apply Hours to Selected"
                          icon={<Clock className="w-5 h-5" />}
                          id="allHours"
                          type="number"
                          placeholder="Enter hours"
                          value={newAttendance.allHours}
                          onChange={(e) => {
                            const value = e.target.value;
                            setNewAttendance((prev) => ({
                              ...prev,
                              allHours: value,
                            }));
                            handleBulkUpdate("totalWorkingHours", value);
                          }}
                        />

                        <FormInput
                          label="Apply Break Hours"
                          icon={<Coffee className="w-5 h-5" />}
                          id="allBreakHours"
                          type="number"
                          placeholder="Enter break hours"
                          value={newAttendance.allBreakHours}
                          onChange={(e) => {
                            const value = e.target.value;
                            setNewAttendance((prev) => ({
                              ...prev,
                              allBreakHours: value,
                            }));
                            handleBulkUpdate("totalBreakHours", value);
                          }}
                        />

                        <FormInput
                          label="Apply Double Time"
                          icon={<Clock8 className="w-5 h-5" />}
                          id="allDoubleTime"
                          type="number"
                          placeholder="Enter double time"
                          value={newAttendance.allDoubleTime}
                          onChange={(e) => {
                            const value = e.target.value;
                            setNewAttendance((prev) => ({
                              ...prev,
                              allDoubleTime: value,
                            }));
                            handleBulkUpdate("totalDoubleTimeHours", value);
                          }}
                        />

                        {hasSalaryEmployees && (
                          <FormInput
                            label="Apply Days (Salary)"
                            icon={<Calendar className="w-5 h-5" />}
                            id="allDays"
                            type="number"
                            placeholder="Enter days"
                            value={newAttendance.allDays}
                            onChange={(e) => {
                              const value = e.target.value;
                              setNewAttendance((prev) => ({
                                ...prev,
                                allDays: value,
                              }));
                              handleBulkUpdate("numberOfDays", value);
                            }}
                          />
                        )}
                      </div>
                    )}

                    {/* Employee Selector */}
                    <Popover
                      open={showEmployeeSelector}
                      onOpenChange={setShowEmployeeSelector}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          className="bg-red_foreground hover:bg-background text-background hover:text-foreground"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Employees
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0 bg-background border-background/10">
                        <Command className="bg-background">
                          <CommandInput
                            placeholder="Search employees..."
                            className="placeholder:text-foreground text-foreground"
                            value={employeeSearch}
                            onValueChange={setEmployeeSearch}
                          />
                          <CommandList>
                            <CommandEmpty className="py-2 px-4 text-foreground/70">
                              No employees found.
                            </CommandEmpty>
                            {employees
                              .filter((employee) => {
                                const isAlreadyAdded =
                                  newAttendance.entries?.some(
                                    (entry) =>
                                      entry.employeeId === employee.id
                                  ) ?? false;
                                return (
                                  !isAlreadyAdded &&
                                  `${employee.firstName} ${employee.surname} ${employee.id}`
                                    .toLowerCase()
                                    .includes(employeeSearch.toLowerCase())
                                );
                              })
                              ?.map((employee) => (
                                <CommandItem
                                  key={employee.id}
                                  value={employee.id}
                                  onSelect={() => {
                                    setNewAttendance((prev) => ({
                                      ...prev,
                                      entries: [
                                        ...prev.entries,
                                        {
                                          employeeId: employee.id,
                                          totalWorkingHours: "",
                                          totalBreakHours: "0",
                                          totalDoubleTimeHours: "0",
                                          numberOfDays: "0",
                                          status: "Pending",
                                        },
                                      ],
                                    }));
                                    setShowEmployeeSelector(false);
                                  }}
                                  className="cursor-pointer hover:bg-red_foreground hover:!text-background !text-foreground"
                                >
                                  {employee.firstName} {employee.surname} (
                                  {employee.id})
                                </CommandItem>
                              ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {/* Employee Table */}
                    <div className="border border-background/10 rounded-lg overflow-hidden">
                      <div className="">
                        <Table className="relative">
                          <TableHeader className="sticky top-0 bg-background/5 z-10">
                            <TableRow>
                              {mode === "bulk" && (
                                <TableHead className="w-[40px] text-foreground ">
                                  <Checkbox
                                    checked={
                                      selectedEmployees.size ===
                                      employees.length
                                    }
                                    ref={checkboxRef}
                                    className="mt-1"
                                    onCheckedChange={toggleAllEmployees}
                                  />
                                </TableHead>
                              )}
                              <TableHead className="min-w-[200px] text-foreground">
                                Employee
                              </TableHead>
                              <TableHead className="text-foreground">
                                Hours Worked
                              </TableHead>
                              <TableHead className="text-foreground">
                                Break Hours
                              </TableHead>
                              <TableHead className="text-foreground">
                                Double Time
                              </TableHead>
                              <TableHead className="text-foreground">
                                Days
                              </TableHead>
                              {mode === "single" && (
                                <TableHead className="w-[100px] text-foreground">
                                  Actions
                                </TableHead>
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {newAttendance.entries?.map((entry, index) => {
                              const emp = employees.find(
                                (e) => e.id === entry.employeeId
                              );
                              if (!emp) return null;
                              return (
                                <TableRow key={entry.employeeId}>
                                  {mode === "bulk" && (
                                    <TableCell>
                                      <Checkbox
                                        checked={selectedEmployees.has(
                                          entry.employeeId
                                        )}
                                        ref={checkboxRef}
                                        onCheckedChange={() =>
                                          toggleEmployeeSelection(
                                            entry.employeeId
                                          )
                                        }
                                      />
                                    </TableCell>
                                  )}
                                  <TableCell>
                                    <div className="font-medium text-foreground">
                                      {emp.firstName} {emp.surname}
                                    </div>
                                    <div className="text-xs text-foreground/60">
                                      {entry.employeeId}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      min="0"
                                      type="number"
                                      step="0.1"
                                      className="w-24 bg-background text-foreground shadow"
                                      value={entry.totalWorkingHours}
                                      onChange={(e) => {
                                        const updated = [
                                          ...newAttendance.entries,
                                        ];
                                        updated[index].totalWorkingHours =
                                          e.target.value;
                                        setNewAttendance((prev) => ({
                                          ...prev,
                                          entries: updated,
                                        }));
                                      }}
                                    />
                                    {formErrors.entries?.[index]
                                      ?.hoursWorked && (
                                      <p className="text-red-500 text-xs mt-1">
                                        {formErrors.entries[index].hoursWorked}
                                      </p>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      min="0"
                                      type="number"
                                      step="0.1"
                                      className="w-24 bg-background text-foreground shadow"
                                      value={entry.totalBreakHours}
                                      onChange={(e) => {
                                        const updated = [
                                          ...newAttendance.entries,
                                        ];
                                        updated[index].totalBreakHours =
                                          e.target.value;
                                        setNewAttendance((prev) => ({
                                          ...prev,
                                          entries: updated,
                                        }));
                                      }}
                                    />
                                    {formErrors.entries?.[index]
                                      ?.breakHours && (
                                      <p className="text-red-500 text-xs mt-1">
                                        {
                                          formErrors.entries[index]
                                            .breakHours
                                        }
                                      </p>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      min="0"
                                      type="number"
                                      step="0.1"
                                      className="w-24 bg-background text-foreground shadow"
                                      value={entry.totalDoubleTimeHours}
                                      onChange={(e) => {
                                        const updated = [
                                          ...newAttendance.entries,
                                        ];
                                        updated[index].totalDoubleTimeHours =
                                          e.target.value;
                                        setNewAttendance((prev) => ({
                                          ...prev,
                                          entries: updated,
                                        }));
                                      }}
                                    />
                                    {formErrors.entries?.[index]
                                      ?.doubleTimeHours && (
                                      <p className="text-red-500 text-xs mt-1">
                                        {
                                          formErrors.entries[index]
                                            .doubleTimeHours
                                        }
                                      </p>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {emp.payType === "SALARY" ? (
                                      <>
                                        <Input
                                          min="0"
                                          type="number"
                                          step="0.1"
                                          className="w-24 bg-background text-foreground shadow"
                                          value={entry.numberOfDays || ""}
                                          onChange={(e) => {
                                            const updated = [
                                              ...newAttendance.entries,
                                            ];
                                            updated[index].numberOfDays =
                                              e.target.value;
                                            setNewAttendance((prev) => ({
                                              ...prev,
                                              entries: updated,
                                            }));
                                          }}
                                        />
                                        {formErrors.entries?.[index]
                                          ?.numberOfDays && (
                                          <p className="text-red-500 text-xs mt-1">
                                            {
                                              formErrors.entries[index]
                                                .numberOfDays
                                            }
                                          </p>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-foreground/50 text-sm">
                                        N/A
                                      </span>
                                    )}
                                  </TableCell>
                                  {mode === "single" && (
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const updated =
                                            newAttendance.entries.filter(
                                              (e) =>
                                                e.employeeId !==
                                                entry.employeeId
                                            );
                                          setNewAttendance((prev) => ({
                                            ...prev,
                                            entries: updated,
                                          }));
                                        }}
                                      >
                                        <XCircle className="w-4 h-4 text-red-500" />
                                      </Button>
                                    </TableCell>
                                  )}
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="pt-4 border-t border-background/10">
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    onClick={closeModal}
                    variant="outline"
                    className="border-background/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-background text-foreground hover:bg-red_foreground hover:text-background"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {mode === "bulk" ? "Save Selected Entries" : "Save Entries"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Modal>
      )}
    </>
  );
};

export default PeriodicAttendanceComponent;
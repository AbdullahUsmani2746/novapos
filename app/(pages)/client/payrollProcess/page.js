"use client";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import axios from "@/lib/axiosInstance";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Header from "@/components/Others/breadcumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertCircle,
  Trash2,
  Calendar as CalendarIcon,
  Plus,
  Repeat,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const DateRangePicker = ({ selectedRange, onRangeChange }) => {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState(selectedRange);

  useEffect(() => {
    if (range?.from && range?.to) {
      setOpen(false);
      onRangeChange(range);
    }
  }, [range]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {range?.from ? (
            range.to ? (
              `${format(range.from, "MMM dd")} - ${format(range.to, "MMM dd")}`
            ) : (
              format(range.from, "MMM dd, yyyy")
            )
          ) : (
            <span>Select date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          numberOfMonths={2}
          required
          className="rounded-md border"
        />
      </PopoverContent>
    </Popover>
  );
};

const RecurringSetupDialog = ({ open, onOpenChange, onSave }) => {
  const [frequency, setFrequency] = useState("week");
  const [repeatEvery, setRepeatEvery] = useState(1);
  const [selectedDays, setSelectedDays] = useState([]);
  const [endDate, setEndDate] = useState(null);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [startDate, setStartDate] = useState(new Date());

  // Function to calculate default end date based on start date
  const getDefaultEndDate = (start) => {
    const startYear = start.getFullYear();
    const startMonth = start.getMonth(); // 0-based (0 = January, 11 = December)

    // If start date is in December, end date falls in next year
    // Otherwise, end date falls in same year
    const endYear = startMonth === 11 ? startYear + 1 : startYear;

    return new Date(endYear, 11, 31); // December 31st
  };

  // Modified days array with unique keys
  const daysOfWeek = [
    { value: "M", label: "M", Name: "Monday" },
    { value: "T", label: "T", Name: "Tuesday" },
    { value: "W", label: "W", Name: "Wednesday" },
    { value: "Th", label: "T", Name: "Thursday" },
    { value: "F", label: "F", Name: "Friday" },
    { value: "Sa", label: "S", Name: "Saturday" },
    { value: "Su", label: "S", Name: "Sunday" },
  ];

  const handleSave = () => {
    // Calculate effective end date
    let effectiveEndDate = endDate;

    if (!hasEndDate) {
      // If no end date is specified, use default end date
      effectiveEndDate = getDefaultEndDate(startDate);
    }

    // ✅ Format config to match API expectations
    const config = {
      frequency,
      repeatEvery,
      selectedDays: frequency === "week" ? selectedDays : [], // Only for weekly
      endDate: effectiveEndDate, // ✅ Convert to ISO string
      startDate: startDate, // ✅ Convert to ISO string
      hasCustomEndDate: hasEndDate,
    };

    console.log("Recurring config:", config);

    onSave(config);
    onOpenChange(false);
  };

  // Update start date handler to reset end date if needed
  const handleStartDateChange = (newStartDate) => {
    setStartDate(newStartDate);
    // If no custom end date is set, we'll use the calculated default
    if (!hasEndDate) {
      // The default will be calculated in handleSave
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Repeat</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium mb-2">Start</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate
                    ? format(startDate, "dd/MM/yyyy")
                    : "Select start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Repeat every</p>
            <div className="flex items-center gap-2">
              <Select
                value={repeatEvery.toString()}
                onValueChange={(val) => setRepeatEvery(Number(val))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">day</SelectItem>
                  <SelectItem value="week">week</SelectItem>
                  <SelectItem value="month">month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {frequency === "week" && (
            <div>
              <p className="text-sm font-medium mb-2">Days</p>
              <div className="flex gap-2">
                {daysOfWeek.map((day) => (
                  <Button
                    key={day.value}
                    variant={
                      selectedDays.includes(day.value) ? "default" : "outline"
                    }
                    size="sm"
                    className={`h-8 w-8 p-0 rounded-full ${
                      selectedDays.includes(day.value) ? "bg-primary" : ""
                    }`}
                    onClick={() => {
                      setSelectedDays((prev) =>
                        prev.includes(day.value)
                          ? prev.filter((d) => d !== day.value)
                          : [...prev, day.value]
                      );
                    }}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                id="hasEndDate"
                checked={hasEndDate}
                onCheckedChange={(checked) => setHasEndDate(checked)}
              />
              <label htmlFor="hasEndDate" className="text-sm font-medium">
                Occurs every{" "}
                {frequency === "week"
                  ? selectedDays
                      .map((d) => {
                        const dayObj = daysOfWeek.find(
                          (day) => day.value === d
                        );
                        return dayObj ? dayObj.Name : d;
                      })
                      .join(", ")
                  : "day"}{" "}
                until
              </label>
            </div>

            {hasEndDate ? (
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[180px] justify-start text-left"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate
                        ? format(endDate, "MMM dd, yyyy")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHasEndDate(false)}
                >
                  ✓ Remove end date
                </Button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                <p>
                  Default end date:{" "}
                  {format(getDefaultEndDate(startDate), "MMM dd, yyyy")}
                </p>
                <p className="mt-1 text-xs">
                  Recurring payroll will continue until{" "}
                  {format(getDefaultEndDate(startDate), "MMMM yyyy")}
                  {startDate.getMonth() === 11 && (
                    <>
                      {" "}
                      and will handle cross-year periods (e.g., Dec 26,{" "}
                      {getDefaultEndDate(startDate).getFullYear()} - Jan 2, {getDefaultEndDate(startDate).getFullYear()+1})
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Discard
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function PayrollProcessPage() {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "CLIENT-001";
  const [payrolls, setPayrolls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Items per page
  const [status, setStatus] = useState({ type: "", message: "" });
  const [totalPages, setTotalPages] = useState(0);
  const [totalPayrolls, setTotalPayrolls] = useState(0);
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const [recurringConfig, setRecurringConfig] = useState(null);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  const [stats, setStats] = useState({
    totalPayrolls: 0,
    currentMonth: 0,
    pendingPayrolls: 0,
  });

  useEffect(() => {
    fetchPayrollProcesses();
  }, [currentPage]);

  useEffect(() => {
    if (payrolls.length > 0) calculateStats();
  }, [payrolls]);

  // Adjust current page when data changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [payrolls, totalPages, currentPage]);

  const calculateStats = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;

    setStats({
      totalPayrolls: payrolls.length,
      currentMonth: payrolls.filter((p) => p.month_no === currentMonth).length,
      pendingPayrolls: payrolls.filter((p) => !p.isProcessed).length,
    });
  };

  // Sorting function
const handleSort = (key) => {
  let direction = 'asc';
  if (sortConfig.key === key && sortConfig.direction === 'asc') {
    direction = 'desc';
  }

  const newConfig = { key, direction };
  setSortConfig(newConfig);
  fetchPayrollProcesses(newConfig); 
};

  // Sort icon component
  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) {
      return <ChevronsUpDown className="ml-2 h-4 w-4 text-background" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="ml-2 h-4 w-4 text-background" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4 text-background" />
    );
  };

const fetchPayrollProcesses = async (customSortConfig = sortConfig) => {
  setIsLoading(true);
  try {
    const { key, direction } = customSortConfig;

    const { data } = await axios.get(
      `/api/payroll/payroll-process?employerId=${employerId}&page=${currentPage}&limit=${itemsPerPage}&sortKey=${key}&sortDirection=${direction}`
    );

    setPayrolls(data.data || []);
    setStats(data.stats || { totalPayrolls: 0, currentMonth: 0, pendingPayrolls: 0 });
    setTotalPages(data.pagination?.totalPages || 0);
    setTotalPayrolls(data.pagination?.total || 0);

    setStartIndex((currentPage - 1) * itemsPerPage);
    setEndIndex(currentPage * itemsPerPage);
    setStatus({ type: "success", message: "Payroll periods loaded" });
  } catch (error) {
    setStatus({ type: "error", message: "Failed to fetch payroll periods" });
    toast.error("Failed to fetch payroll periods");
  } finally {
    setIsLoading(false);
  }
};


  const deletePayrollPeriod = async (payrollId) => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/payroll/payroll-process/${payrollId}`);
      setStatus({ type: "success", message: "Payroll period deleted" });
      fetchPayrollProcesses();
    } catch (error) {
      setStatus({ type: "error", message: "Delete failed" });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format cross-year periods in the table
  const formatDateRange = (dateFrom, dateTo) => {
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);

    if (startDate.getFullYear() !== endDate.getFullYear()) {
      // Cross-year format: "Dec 26, 2025 - Jan 2, 2026"
      return `${format(startDate, "MMM dd, yyyy")} - ${format(
        endDate,
        "MMM dd, yyyy"
      )}`;
    } else {
      // Same year format: "Dec 26 - Jan 2, 2025"
      return `${format(startDate, "MMM dd")} - ${format(
        endDate,
        "MMM dd, yyyy"
      )}`;
    }
  };

  const generatePayroll = async () => {
    if (!dateRange.from || !dateRange.to) {
      setStatus({ type: "error", message: "Select date range" });
      return;
    }

    if (dateRange.from > dateRange.to) {
      setStatus({ type: "error", message: "Invalid date range" });
      return;
    }

    setIsLoading(true);
    try {
      // ✅ FIXED: Send data in the format API expects
      const requestData = {
        date_from: dateRange.from,
        date_to: dateRange.to,
        employerId,
        recurringConfig: recurringConfig || null, // Let API handle recurring logic
      };

      console.log("Sending request:", requestData);

      const { data } = await axios.post(
        "/api/payroll/payroll-process",
        requestData // ✅ Correct structure
      );

      if (data.success) {
        const count = data.data?.length || 1;
        setStatus({
          type: "success",
          message: `${count} payroll period${
            count > 1 ? "s" : ""
          } generated successfully!`,
        });
        toast.success(
          `${count} payroll period${count > 1 ? "s" : ""} generated!`
        );
        fetchPayrollProcesses();
        setDateRange({});
        setRecurringConfig(null);
      }
    } catch (error) {
      console.error("Payroll generation error:", error);
      const errorMessage = error.response?.data?.error || "Generation failed";
      setStatus({ type: "error", message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isDateRangeOverlapping = (newStart, newEnd) => {
    return payrolls.some(({ date_from, date_to }) => {
      const existingStart = new Date(date_from);
      const existingEnd = new Date(date_to);
      return (
        (newStart >= existingStart && newStart <= existingEnd) ||
        (newEnd >= existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header heading="Payroll Process Management" />

      <div className="container mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(stats).map(([key, value]) => (
            <Card key={key} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <CardTitle className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-6">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg">Create Payroll Period</CardTitle>
            <CardDescription className="text-sm">
              Select date range for payroll processing
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="w-full">
                <DateRangePicker
                  selectedRange={dateRange}
                  onRangeChange={setDateRange}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setRecurringDialogOpen(true)}
                className="mr-2"
              >
                <Repeat className="h-4 w-4 mr-2" />
                Recurring
              </Button>
              <Button
                onClick={generatePayroll}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Generate
              </Button>
            </div>
            {recurringConfig && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Recurring Setup:</strong> Every{" "}
                  {recurringConfig.repeatEvery} {recurringConfig.frequency}(s)
                  until{" "}
                  {format(new Date(recurringConfig.endDate), "MMM dd, yyyy")}
                  {recurringConfig.crossesYear &&
                    " (includes cross-year periods)"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <RecurringSetupDialog
          open={recurringDialogOpen}
          onOpenChange={setRecurringDialogOpen}
          onSave={setRecurringConfig}
        />

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg">Payroll Periods</CardTitle>
            <CardDescription className="text-sm">
              Manage existing payroll periods (Click column headers to sort)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-background/10 bg-red_foreground">
                    <TableHead 
                      className="px-4 text-background cursor-pointer hover:bg-red-700 transition-colors select-none"
                      onClick={() => handleSort('payroll_id')}
                    >
                      <div className="flex items-center">
                        ID
                      </div>
                    </TableHead>
                    <TableHead 
                      className="px-4 text-background cursor-pointer hover:bg-red-700 transition-colors select-none"
                      onClick={() => handleSort('date_from')}
                    >
                      <div className="flex items-center">
                        Date Range
                        <SortIcon column="date_from" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="px-4 text-background cursor-pointer hover:bg-red-700 transition-colors select-none"
                      onClick={() => handleSort('week_no')}
                    >
                      <div className="flex items-center">
                        Period
                        <SortIcon column="week_no" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="px-4 text-background cursor-pointer hover:bg-red-700 transition-colors select-none"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        <SortIcon column="status" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="px-4 text-background cursor-pointer hover:bg-red-700 transition-colors select-none"
                      onClick={() => handleSort('processedEmployees')}
                    >
                      <div className="flex items-center">
                        Processed Employees
                        <SortIcon column="processedEmployees" />
                      </div>
                    </TableHead>
                    <TableHead className="px-4 text-background">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrolls.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No payroll periods found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payrolls.map((payroll) => (
                      <TableRow key={payroll._id} className="hover:bg-muted/50">
                        <TableCell className="px-4 font-medium">
                          {payroll.payroll_id}
                        </TableCell>
                        <TableCell className="px-4">
                          {formatDateRange(payroll.date_from, payroll.date_to)}
                        </TableCell>
                        <TableCell className="px-4">
                          Week {payroll.week_no}, {payroll.year}
                          {payroll.isRecurring && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Recurring
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-4">
                          <Badge
                            variant={payroll.status ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {payroll.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4">
                          {payroll.processedEmployees?.length || 0}
                        </TableCell>
                        <TableCell className="px-4">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Confirm Deletion
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the payroll
                                  period.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    deletePayrollPeriod(payroll._id)
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {totalPayrolls > 0 ? startIndex + 1 : 0} to{" "}
                {Math.min(endIndex, totalPayrolls)} of {totalPayrolls} entries
              </div>
              <div className="flex items-center gap-2">
                {/* Pagination buttons */}
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm font-medium">
                  Page {currentPage} of {Math.max(1, totalPages)}
                </span>
                <Button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage >= totalPages || totalPages === 0}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

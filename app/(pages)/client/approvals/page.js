"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "@/lib/axiosInstance";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  X,
  CalendarDays,
  Search,
  RefreshCcw,
  AlertCircle,
  Filter,
  Loader2,
  Clock,
} from "lucide-react";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import Header from "@/components/Others/breadcumb";
import { Label } from "@/components/ui/label";
import DynamicRequestApproval from "@/components/DynamicRequest";

const DatePicker = ({ selectedDate, onDateChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-[200px] pl-3 hover:text-background text-left font-normal flex justify-between items-center"
        >
          {selectedDate ? (
            format(new Date(selectedDate), "MMM d, yyyy")
          ) : (
            <span className=" flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Pick a date
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate ? new Date(selectedDate) : undefined}
          onSelect={(date) => {
            onDateChange(date);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

const StatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
    >
      {status}
    </span>
  );
};

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl flex items-center gap-4">
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="text-lg font-medium">Loading approvals...</p>
    </div>
  </div>
);

const EmptyState = ({ onRefresh }) => (
  <div className="text-center py-12">
    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
      <AlertCircle className="h-10 w-10 text-muted-foreground" />
    </div>
    <h3 className="mt-4 text-lg font-semibold">No Pending Approvals</h3>
    <p className="mt-2 text-sm text-muted-foreground">
      There are no pending approval requests at the moment.
    </p>
    <Button onClick={onRefresh} className="mt-4" variant="outline">
      <RefreshCcw className="mr-2 h-4 w-4" />
      Refresh
    </Button>
  </div>
);

const TimeInput = ({
  label,
  value,
  onChange,
  className = "",
  isBreak = false,
}) => {
  const [error, setError] = useState("");

  const handleTextChange = (val) => {
    // Allow empty value
    if (val.trim() === "") {
      setError("");
      onChange(val);
      return;
    }

    const valid = /^(\d{1,2})h\s(\d{1,2})m$/.test(val.trim());

    if (valid) {
      setError("");
      onChange(val);
    } else {
      setError("Invalid format. Use 1h 0m");
      onChange(val); // Optional: If you don't want to store invalid input, remove this line
    }
  };

  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <Label htmlFor={label} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={label}
          type={isBreak ? "text" : "time"}
          value={value}
          onChange={(e) =>
            isBreak
              ? handleTextChange(e.target.value)
              : onChange(e.target.value)
          }
          className="pl-8 bg-background shadow text-foreground"
          placeholder={isBreak ? "e.g. 1h 0m" : ""}
        />
        <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
};

const SearchableSelect = ({
  searchPayroll = false,
  items,
  value,
  onChange,
  placeholder,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? items.find((item) => item.value === value)?.label
            : placeholder}
          <Filter className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder={`Search ${placeholder.toLowerCase()}...`}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {(searchPayroll
                ? items.sort((a, b) => {
                    const now = new Date();
                    const currentYear = now.getFullYear();
                    const currentMonth = now.getMonth();

                    // Extract start dates from label
                    const dateA = new Date(a.label.split(" - ")[0]);
                    const dateB = new Date(b.label.split(" - ")[0]);

                    const yearA = dateA.getFullYear();
                    const monthA = dateA.getMonth();

                    const yearB = dateB.getFullYear();
                    const monthB = dateB.getMonth();

                    const isAFuture =
                      yearA > currentYear ||
                      (yearA === currentYear && monthA >= currentMonth);
                    const isBFuture =
                      yearB > currentYear ||
                      (yearB === currentYear && monthB >= currentMonth);

                    if (isAFuture && !isBFuture) return -1;
                    if (!isAFuture && isBFuture) return 1;

                    // Sort by date (most recent first)
                    return dateA - dateB;
                  })
                : items
              ).map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  className="hover:bg-red_foreground !text-foreground hover:!text-background"
                  onSelect={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value === item.value ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const Approvals = () => {
  const employeeId = 1

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [searchEmployeeName, setSearchEmployeeName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [payrollPeriods, setPayrollPeriods] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [breakTime, setBreakTime] = useState("");
  const [totalWorkingHours, setTotalWorkingHours] = useState("");
  const [totalBreakHours, setTotalBreakHours] = useState("");
  const [totalDoubleTimeHours, setTotalDoubleTimeHours] = useState("");
  const [numberOfDays, setNumberOfDays] = useState("");


  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const response = await axios.get(
          `/api/payroll/payroll-process?employerId=${employeeId}`
        );
        if (response.data && response.data.data) {
          setPayrollPeriods(response.data.data);
          if (response.data.data.length > 0 && !selectedPayroll) {
            setIsDialogOpen(true);
          }
        }
      } catch (error) {
        toast.error("Failed to fetch payroll periods");
      }
    };
    fetchPeriods();
  }, [employeeId]);

  const fetchData = useCallback(async () => {
    if (!selectedPayroll) return;

    setIsLoading(true);
    setError(null);
    try {
      const employeeResponse = await axios.get(
        `/api/employees?employerId=${employeeId}&inactive=ACTIVE`
      );
      const employees = employeeResponse.data.data;

      const allRecords = [];

      for (const employee of employees) {
        try {
          // Fetch daily attendance records
          try {
            const attendanceResponse = await axios.get(
              `/api/users/attendance/${employee.employeeId}`
            );
            console.log(
              `Attendance records for ${employee.employeeId}:`,
              attendanceResponse.data.attendance
            );
            if (attendanceResponse.data.attendance) {
              let filteredAttendance =
                attendanceResponse.data.attendance.filter(
                  (record) => record.checkOutTime && record.status === "Pending"
                );

              if (selectedPayroll) {
                const payroll = payrollPeriods.find(
                  (p) => p.payroll_id.toString() === selectedPayroll
                );
                if (payroll) {
                  filteredAttendance = filteredAttendance.filter((record) => {
                    const recordDate = new Date(record.date).setHours(0, 0, 0, 0);
                    record.employeeId==="003-0007" && console.log(
                      new Date(record.date),
                      new Date(payroll.date_from),
                      new Date(payroll.date_to)
                    );
                    return (
                      recordDate>= new Date(payroll.date_from) &&
                      recordDate <= new Date(payroll.date_to)
                    );
                  });
                }
              }

              const attendanceRecords = filteredAttendance.map((record) => ({
                ...record,
                type: "attendance",
                employeeId: employee.employeeId,
                firstName: employee.firstName,
                surname: employee.surname,
              }));

              allRecords.push(...attendanceRecords);
            }
          } catch (error) {
            console.log(`No attendance records for ${employee.employeeId}`);
          }

          // Fetch periodic attendance records
          try {
            const periodicResponse = await axios.get(
              `/api/employees/periodicAttendance/?employerId=${employeeId}`
            );
            if (periodicResponse.data && periodicResponse.data.data) {
              let filteredPeriodic = periodicResponse.data.data.filter(
                (record) =>
                  record.status === "Pending" &&
                  record.employeeId === employee.employeeId
              );

              if (selectedPayroll) {
                const payroll = payrollPeriods.find(
                  (p) => p.payroll_id.toString() === selectedPayroll
                );
                if (payroll) {
                  filteredPeriodic = filteredPeriodic.filter((record) => {
                    if (!record.dateRange) return false;

                    const [startStr, endStr] = record.dateRange.split(" to ");
                    const startDate = new Date(startStr);
                    const endDate = new Date(endStr);
                    const payrollStart = new Date(payroll.date_from);
                    const payrollEnd = new Date(payroll.date_to);

                    return startDate <= payrollEnd && endDate >= payrollStart;
                  });
                }
              }

              const periodicAttendanceRecords = filteredPeriodic.map(
                (record) => ({
                  ...record,
                  type: "periodicAttendance",
                  employeeId: employee.employeeId,
                  firstName: employee.firstName,
                  surname: employee.surname,
                })
              );

              allRecords.push(...periodicAttendanceRecords);
            }
          } catch (error) {
            console.log(
              `No periodic attendance records for ${employee.employeeId}`
            );
          }
        } catch (error) {
          console.error(
            `Error processing employee ${employee.employeeId}:`,
            error
          );
        }
      }

      setAttendanceData(allRecords);
    } catch (error) {
      setError("Failed to fetch approval data. Please try again later.");
      toast.error("Error loading approvals");
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, selectedPayroll, payrollPeriods]);

  useEffect(() => {
    if (selectedPayroll) {
      fetchData();
    }
  }, [fetchData, selectedPayroll]);

  const handleEditAttendance = (record) => {
    setEditingAttendance(record);

    if (record.type === "attendance") {
      // Format time for input
      const checkInDate = new Date(record.checkInTime);
      const checkOutDate = new Date(record.checkOutTime);

      setCheckInTime(
        `${checkInDate.getHours().toString().padStart(2, "0")}:${checkInDate
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      );
      setCheckOutTime(
        `${checkOutDate.getHours().toString().padStart(2, "0")}:${checkOutDate
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      );
    } else if (record.type === "periodicAttendance") {
      setTotalWorkingHours(record.totalWorkingHours || "");
      setTotalBreakHours(record.totalBreakHours || "0");
      setTotalDoubleTimeHours(record.totalDoubleTimeHours || "0");
      setNumberOfDays(record.numberOfDays || "0");

    }
  };

  const handleStatusChange = async (
    recordId,
    newStatus,
    type,
    withModification = false
  ) => {
    setIsUpdating(true);

    const record = attendanceData.find((r) => r._id === recordId);
    let updatedData;
    let updatePayload = { _id: recordId, status: newStatus };

    if (newStatus === "Rejected") {
      if (!rejectionReason.trim()) {
        toast.error("Please provide a rejection reason");
        setIsUpdating(false);
        return;
      }
      updatePayload.rejectionReason = rejectionReason;
    }

    if (withModification && type === "attendance") {
      const recordDate = new Date(record.date);

      const [checkInHours, checkInMinutes] = checkInTime.split(":").map(Number);
      const [checkOutHours, checkOutMinutes] = checkOutTime
        .split(":")
        .map(Number);

      const newCheckInTime = new Date(recordDate);
      newCheckInTime.setHours(checkInHours, checkInMinutes, 0);

      const newCheckOutTime = new Date(recordDate);
      newCheckOutTime.setHours(checkOutHours, checkOutMinutes, 0);

      const newBreakTime = breakTime;
      console.log("New Brewak Time",newBreakTime)

      // Calculate total duration in milliseconds
      let totalMillis = newCheckOutTime - newCheckInTime;
      console.log("totalMills : ",totalMillis)

      // Subtract break duration if provided
      if (newBreakTime) {
        const [breakHours, breakMinutes] = newBreakTime
          .replace("h", "")
          .replace("m", "")
          .split(" ")
          .map(Number);
        const breakMillis = (breakHours * 60 + breakMinutes) * 60 * 1000;
        totalMillis -= breakMillis;
      }

      // Convert milliseconds to hours and minutes
      const totalMinutes = Math.max(0, Math.floor(totalMillis / (1000 * 60)));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const totalWorkingFormatted = `${hours}h ${minutes}m`;

      // Add to update payload
      updatePayload.checkInTime = newCheckInTime;
      updatePayload.checkOutTime = newCheckOutTime;
      updatePayload.totalBreakDuration = newBreakTime;
      updatePayload.totalWorkingHours = totalWorkingFormatted; // <<-- ✅ ADDED HERE

      updatedData = attendanceData.map((item) =>
        item._id === recordId
          ? {
              ...item,
              status: newStatus,
              checkInTime: newCheckInTime,
              checkOutTime: newCheckOutTime,
              totalBreakDuration: newBreakTime,
              totalWorkingHours: totalWorkingFormatted, // <<-- ✅ ADDED HERE
              rejectionReason:
                newStatus === "Rejected" ? rejectionReason : undefined,
            }
          : item
      );
    } else if (withModification && type === "periodicAttendance") {
      // Add to update payload
      updatePayload.totalWorkingHours = totalWorkingHours;
      updatePayload.totalBreakHours = totalBreakHours;
      updatePayload.totalDoubleTimeHours = totalDoubleTimeHours;
      updatePayload.numberOfDays = numberOfDays;

      updatedData = attendanceData.map((item) =>
        item._id === recordId
          ? {
              ...item,
              status: newStatus,
              totalWorkingHours,
              totalBreakHours,
              totalDoubleTimeHours,
              numberOfDays,
              rejectionReason:
                newStatus === "Rejected" ? rejectionReason : undefined,
            }
          : item
      );
    } else {
      updatedData = attendanceData.map((item) =>
        item._id === recordId
          ? {
              ...item,
              status: newStatus,
              rejectionReason:
                newStatus === "Rejected" ? rejectionReason : undefined,
            }
          : item
      );
    }

    setAttendanceData(updatedData);

    try {
      const apiEndpoint =
        type === "attendance"
          ? `/api/users/attendance/${recordId}`
          : `/api/employees/periodicAttendance/${recordId}`;

      await axios.put(apiEndpoint, updatePayload);

      if (newStatus === "Approved") {
        setAttendanceData((prev) =>
          prev.filter((record) => record._id !== recordId)
        );
      }

      toast.success(`Successfully ${newStatus.toLowerCase()} the request`);
      setRejectionReason("");
      setEditingAttendance(null);
    } catch (error) {
      // Revert changes on error
      setAttendanceData((prev) =>
        prev.map((record) =>
          record._id === recordId ? { ...record, status: "Pending" } : record
        )
      );
      toast.error("Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredData = attendanceData.filter((record) => {
    const matchesName = searchEmployeeName
      ? `${record.firstName} ${record.surname}`
          .toLowerCase()
          .includes(searchEmployeeName.toLowerCase())
      : true;

    const matchesDate = searchDate
      ? record.type === "attendance"
        ? format(new Date(record.date), "yyyy-MM-dd") ===
          format(new Date(searchDate), "yyyy-MM-dd")
        : record.dateRange &&
          record.dateRange.includes(format(new Date(searchDate), "yyyy-MM-dd"))
      : true;

    return matchesName && matchesDate;
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const payrollOptions = payrollPeriods.map((period) => ({
    value: period.payroll_id.toString(),
    label: `${format(new Date(period.date_from), "MMM d, yyyy")} - ${format(
      new Date(period.date_to),
      "MMM d, yyyy"
    )}`,
  }));

  const pageSizeOptions = [
    { value: "5", label: "5 per page" },
    { value: "10", label: "10 per page" },
    { value: "20", label: "20 per page" },
    { value: "50", label: "50 per page" },
  ];

  return (
    <div>
      {/* Dialog for selecting payroll period */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Payroll Period</DialogTitle>
            <DialogDescription>
              Please select a payroll period to view the approval requests.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <SearchableSelect
              searchPayroll={true}
              items={payrollOptions}
              value={selectedPayroll}
              onChange={setSelectedPayroll}
              placeholder="Payroll Period"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedPayroll) setIsDialogOpen(false);
                else toast.error("Please select a payroll period");
              }}
              className="w-full sm:w-auto"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for editing attendance */}
      <Dialog
        open={!!editingAttendance}
        onOpenChange={(isOpen) => !isOpen && setEditingAttendance(null)}
      >
        {editingAttendance && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAttendance.type === "attendance"
                  ? "Edit Daily Attendance"
                  : "Edit Periodic Attendance"}
              </DialogTitle>
              <DialogDescription>
                {editingAttendance.type === "attendance"
                  ? "Modify check-in and check-out times before approval."
                  : "Modify working hours before approval."}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-medium">Employee</p>
                <p className="text-base">
                  {editingAttendance.firstName} {editingAttendance.surname}
                </p>
              </div>

              {editingAttendance.type === "attendance" ? (
                <>
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-base">
                      {format(new Date(editingAttendance.date), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                    <TimeInput
                      label="Check-in Time"
                      value={checkInTime}
                      onChange={setCheckInTime}
                    />
                    <TimeInput
                      label="Check-out Time"
                      value={checkOutTime}
                      onChange={setCheckOutTime}
                    />
                    <TimeInput
                      label="Break Time (e.g., 1h 0m format)"
                      value={breakTime}
                      onChange={setBreakTime}
                      isBreak={true}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-medium">Date Range</p>
                    <p className="text-base">
                      {format(
                        new Date(editingAttendance.dateRange.split(" to ")[0]),
                        "MMMM d, yyyy"
                      ) +
                        " to " +
                        format(
                          new Date(
                            editingAttendance.dateRange.split(" to ")[1]
                          ),
                          "MMMM d, yyyy"
                        )}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="totalWorkingHours"
                        className="text-sm font-medium"
                      >
                        Total Working Hours
                      </Label>
                      <Input
                        id="totalWorkingHours"
                        value={totalWorkingHours}
                        onChange={(e) => setTotalWorkingHours(e.target.value)}
                        className="mt-1"
                        placeholder="e.g., 40"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="totalBreakHours"
                        className="text-sm font-medium"
                      >
                        Total Break Hours
                      </Label>
                      <Input
                        id="totalBreakHours"
                        value={totalBreakHours}
                        onChange={(e) => setTotalBreakHours(e.target.value)}
                        className="mt-1"
                        placeholder="e.g., 5"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="totalDoubleTimeHours"
                        className="text-sm font-medium"
                      >
                        Total Double Time Hours
                      </Label>
                      <Input
                        id="totalDoubleTimeHours"
                        value={totalDoubleTimeHours}
                        onChange={(e) =>
                          setTotalDoubleTimeHours(e.target.value)
                        }
                        className="mt-1"
                        placeholder="e.g., 0"
                      />
                    </div>
                     <div>
                      <Label
                        htmlFor="numberOfDays"
                        className="text-sm font-medium"
                      >
                        Total Days
                      </Label>
                      <Input
                        id="numberOfDays"
                        value={numberOfDays}
                        onChange={(e) =>
                          setNumberOfDays(e.target.value)
                        }
                        className="mt-1"
                        placeholder="e.g., 0"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={() =>
                  handleStatusChange(
                    editingAttendance._id,
                    "Approved",
                    editingAttendance.type,
                    true
                  )
                }
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Dialog for rejecting attendance */}
      <Dialog
        open={!!rejectionReason || false}
        onOpenChange={(isOpen) => !isOpen && setRejectionReason("")}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Attendance Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this attendance request.
              This will be visible to the employee.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label
              htmlFor="rejectionReason"
              className="text-sm font-medium mb-2 block"
            >
              Rejection Reason
            </Label>
            <textarea
              id="rejectionReason"
              className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background resize-none"
              placeholder="Enter the reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setRejectionReason("")}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (!rejectionReason.trim()) {
                  toast.error("Please provide a rejection reason");
                  return;
                }
                if (editingAttendance) {
                  handleStatusChange(
                    editingAttendance._id,
                    "Rejected",
                    editingAttendance.type,
                    false
                  );
                }
              }}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Confirm Rejection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Title and Description */}
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold">
                  Approval Requests
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Manage attendance and periodic attendance approval requests
                </CardDescription>
              </div>

              {/* Refresh Button */}
              <Button
                onClick={fetchData}
                variant="outline"
                disabled={isLoading || !selectedPayroll}
                className="gap-2 w-full sm:w-auto"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Error alert */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-red_foreground" />
                <Input
                  placeholder="Search Employee"
                  value={searchEmployeeName}
                  onChange={(e) => setSearchEmployeeName(e.target.value)}
                  className="pl-10 bg-background/5 border-background/10 shadow text-text_background placeholder:text-text_background/40 w-full"
                />
              </div>

              {/* Date Picker */}
              <DatePicker
                selectedDate={searchDate}
                onDateChange={(date) => setSearchDate(date)}
              />

              {/* Payroll Period Select */}
              <SearchableSelect
                searchPayroll={true}
                items={payrollOptions}
                value={selectedPayroll}
                onChange={(value) => {
                  setSelectedPayroll(value);
                  setCurrentPage(1);
                }}
                placeholder="Select Payroll Period"
              />

              {/* Rows per Page Select */}
              <SearchableSelect
                items={pageSizeOptions}
                value={pageSize.toString()}
                onChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}
                placeholder="Rows per page"
              />
            </div>

            {/* Table or loading/empty state */}
            <AnimatePresence>
              {isLoading ? (
                <LoadingOverlay />
              ) : paginatedData.length === 0 ? (
                <EmptyState onRefresh={fetchData} />
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date/Period</TableHead>

                          {paginatedData[0]?.type === "attendance" ? (
                            <>
                              <TableHead className="text-center">
                                Check-in
                              </TableHead>
                              <TableHead className="text-center">
                                Check-out
                              </TableHead>
                              <TableHead className="text-center">
                                Break
                              </TableHead>
                              <TableHead
                                className="text-center"
                                colSpan={3}
                              ></TableHead>
                            </>
                          ) : (
                            <>
                              <TableHead
                                className="text-center"
                                colSpan={3}
                              ></TableHead>
                              <TableHead className="text-center">
                                Working Hours
                              </TableHead>
                              <TableHead className="text-center">
                                Break
                              </TableHead>
                              <TableHead className="text-center">
                                Double Time
                              </TableHead>
                              <TableHead className="text-center">
                                Days
                              </TableHead>
                            </>
                          )}

                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {paginatedData.map((record) => (
                          <motion.tr
                            key={record._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="border-b"
                          >
                            <TableCell className="font-medium">
                              {record.firstName} {record.surname}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {record.type === "attendance"
                                  ? "Daily"
                                  : "Periodic"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {record.type === "attendance"
                                ? format(new Date(record.date), "MMM d, yyyy")
                                : format(
                                    new Date(record.dateRange.split(" to ")[0]),
                                    "MMM d, yyyy"
                                  ) +
                                  " to " +
                                  format(
                                    new Date(record.dateRange.split(" to ")[1]),
                                    "MMM d, yyyy"
                                  )}
                            </TableCell>

                            {record.type === "attendance" ? (
                              <>
                                <TableCell className="text-center">
                                  {format(
                                    new Date(record.checkInTime),
                                    "h:mm a"
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {format(
                                    new Date(record.checkOutTime),
                                    "h:mm a"
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {record.totalBreakDuration || "0min"}
                                </TableCell>
                                <TableCell />
                                <TableCell />
                                <TableCell />
                              </>
                            ) : (
                              <>
                                <TableCell />
                                <TableCell />
                                <TableCell />
                                <TableCell className="text-center">
                                  {record.totalWorkingHours || 0} hrs
                                </TableCell>
                                <TableCell className="text-center">
                                  {record.totalBreakHours || 0} hrs
                                </TableCell>
                                <TableCell className="text-center">
                                  {record.totalDoubleTimeHours || 0} hrs
                                </TableCell>
                                 <TableCell className="text-center">
                                  {record.numberOfDays || "N/A"}
                                </TableCell>
                              </>
                            )}

                            <TableCell>
                              <StatusBadge status={record.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  onClick={() => handleEditAttendance(record)}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3"
                                >
                                  Edit
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleStatusChange(
                                      record._id,
                                      "Approved",
                                      record.type
                                    )
                                  }
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3 text-green-700 border-green-200 hover:bg-green-50"
                                  disabled={isUpdating}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => {
                                    setEditingAttendance(record);
                                    setRejectionReason(" ");
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3 text-red-700 border-red-200 hover:bg-red-50"
                                  disabled={isUpdating}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {!isLoading && paginatedData.length > 0 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const AttendanceApprovalDashboard = () => (
  <DynamicRequestApproval
    type="attendance"
    headerTitle="Attendance Request Approvals Dashboard"
  />
);

const Page = () => {
  return (
    <>
      <div className="min-h-screen">
        <Header heading="Approvals Dashboard" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Tabs defaultValue="attendance" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="attendance">Attendance Approvals</TabsTrigger>
              <TabsTrigger value="requests">
                Attendance Request Approvals
              </TabsTrigger>
            </TabsList>

            <TabsContent value="attendance" className="space-y-4">
              <Approvals />
            </TabsContent>

            <TabsContent value="requests" className="space-y-4">
              <AttendanceApprovalDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Page;

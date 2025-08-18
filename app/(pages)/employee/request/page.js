"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Calendar as CalendarIcon,
  Edit,
  Trash2,
  Plus,
  Search,
  ChevronDown,
  HelpCircle,
  FileBarChart,
} from "lucide-react";
import { format } from "date-fns";
import axios from "@/lib/axiosInstance";
import LoadingSpinner from "@/components/Others/spinner";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Others/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Header from "@/components/Others/breadcumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import LeaveManagementReport from "@/components/User/leaveManagement"; // Adjust the path as needed

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

const RequestForm = ({ type, onClose, existingData, employeeId, Leaves }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    _id: existingData?._id || null,
    type: type,
    employeeId: employeeId,
    employerId: `CLIENT-${employeeId.split("-")[0]}`,
    leaveDurationType: existingData?.leaveDurationType || "full-day",
    startDate: existingData?.startDate
      ? new Date(existingData.startDate)
      : null,
    endDate: existingData?.endDate ? new Date(existingData.endDate) : null,
    halfDayPeriod: existingData?.halfDayPeriod || "morning",
    startTime: existingData?.startTime || "",
    endTime: existingData?.endTime || "",
    reason: existingData?.reason || "",
    leaveType: existingData?.leaveType || "",
    leaveId: existingData?.leaveId || null,
    status: existingData?.status || "Pending",
    // Add attendance-specific fields
    checkIn: existingData?.checkIn || "",
    checkOut: existingData?.checkOut || "",
  });
  const [leaveBalances, setLeaveBalances] = useState([]);

  useEffect(() => {
    const fetchLeaveBalances = async () => {
      try {
        const response = await axios.get(
          `/api/users/leaveBalance/?employeeId=${employeeId}`
        );
        setLeaveBalances(response.data.leaveBalances);
      } catch (error) {
        toast.error("Error fetching leave balances");
      }
    };
    if (type === "leave") fetchLeaveBalances();
  }, [employeeId, type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Validation
    if (type === "leave") {
      if (!formData.leaveId) {
        toast.error("Please select a leave type");
        setIsSubmitting(false);
        return;
      }
      if (formData.leaveDurationType === "full-day") {
        if (!formData.startDate || !formData.endDate) {
          toast.error("Please select start and end dates");
          setIsSubmitting(false);
          return;
        }
        if (formData.startDate > formData.endDate) {
          toast.error("End date cannot be before start date");
          setIsSubmitting(false);
          return;
        }
      } else if (formData.leaveDurationType === "half-day") {
        if (!formData.startDate || !formData.halfDayPeriod) {
          toast.error("Please select date and period for half-day leave");
          setIsSubmitting(false);
          return;
        }
        // Set endDate = startDate for half-day
        formData.endDate = formData.startDate;
      } else if (formData.leaveDurationType === "hourly") {
        if (!formData.startDate || !formData.startTime || !formData.endTime) {
          toast.error("Please select date and start/end times");
          setIsSubmitting(false);
          return;
        }
        const start = new Date(`1970-01-01T${formData.startTime}:00`);
        const end = new Date(`1970-01-01T${formData.endTime}:00`);
        if (start >= end) {
          toast.error("End time must be after start time");
          setIsSubmitting(false);
          return;
        }
        // Set endDate = startDate for hourly
        formData.endDate = formData.startDate;
      }

      const selectedLeave = leaveBalances.find(
        (lb) => lb.leaveId === formData.leaveId
      );
      if (!selectedLeave) {
        toast.error("Selected leave type not found");
        setIsSubmitting(false);
        return;
      }

      // Calculate requested duration
      let requestedDuration;
      if (formData.leaveDurationType === "full-day") {
        requestedDuration =
          Math.floor(
            (new Date(formData.endDate) - new Date(formData.startDate)) /
              (1000 * 60 * 60 * 24)
          ) + 1;
      } else if (formData.leaveDurationType === "half-day") {
        requestedDuration = 0.5;
      } else if (formData.leaveDurationType === "hourly") {
        const startTime = new Date(`1970-01-01T${formData.startTime}:00`);
        const endTime = new Date(`1970-01-01T${formData.endTime}:00`);
        const hours = (endTime - startTime) / (1000 * 60 * 60);
        requestedDuration = hours / 8;
      }
      // Check if leave will be paid or unpaid
      if (requestedDuration > selectedLeave.available) {
        // Show warning for unpaid leave
        const isPaidDuration = selectedLeave.available;
        const unpaidDuration = requestedDuration - selectedLeave.available;

        if (selectedLeave.available === 0) {
          toast.warning(
            `This will be completely unpaid leave (${requestedDuration} days)`
          );
        } else {
          toast.warning(
            `This will be partially unpaid leave (${isPaidDuration} paid days, ${unpaidDuration} unpaid days)`
          );
        }

        // Set as unpaid leave
        formData.isPaidLeave = selectedLeave.available > 0 ? false : false; // false for completely unpaid
      } else {
        // Set as paid leave
        formData.isPaidLeave = true;
      }
    } else if (type === "attendance") {
      // Validation for attendance correction
      if (!formData.startDate) {
        toast.error("Please select a date");
        setIsSubmitting(false);
        return;
      }
      if (!formData.checkIn || !formData.checkOut) {
        toast.error("Please enter check-in and check-out times");
        setIsSubmitting(false);
        return;
      }
      const checkInTime = new Date(`1970-01-01T${formData.checkIn}:00`);
      const checkOutTime = new Date(`1970-01-01T${formData.checkOut}:00`);
      if (checkInTime >= checkOutTime) {
        toast.error("Check-out time must be after check-in time");
        setIsSubmitting(false);
        return;
      }
    }

    const isUpdate = !!existingData?._id;
    const url = `/api/users/request/${employeeId}${
      isUpdate ? `?id=${existingData._id}` : ""
    }`;

    const method = isUpdate ? "put" : "post";

    try {
      await axios[method](url, formData);
      toast.success(
        `Request ${isUpdate ? "updated" : "submitted"} successfully!`
      );
      onClose();
    } catch (error) {
      toast.error(
        `Error ${isUpdate ? "updating" : "submitting"} request: ${
          error.message
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.container}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-2xl mx-auto"
    >
      <Card className=" border-white/10">
        <CardHeader className="">
          <CardTitle className="text-2xl font-bold text-foreground">
            {type === "leave" ? "Leave Request" : "Attendance Correction"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <motion.div
              variants={ANIMATION_VARIANTS.item}
              className="space-y-4  rounded-lg bg-background/5 border border-background/10"
            >
              {type === "leave" && (
                <>
                  <motion.div variants={ANIMATION_VARIANTS.item}>
                    <label className="text-sm text-foreground">
                      Leave Type
                    </label>
                    <Select
                      value={
                        formData.leaveId
                          ? `${formData.leaveType}-${formData.leaveId}`
                          : ""
                      }
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          leaveType: value.split("-")[0],
                          leaveId: value.split("-")[1],
                        }))
                      }
                    >
                      <SelectTrigger className="bg-background/5 border-background/10 text-foreground">
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Leaves.map((type) => {
                          const available =
                            leaveBalances.find((lb) => lb.leaveId === type._id)
                              ?.available || 0;
                          return (
                            <SelectItem
                              key={type._id}
                              value={`${type.leave}-${type._id}`}
                              // disabled={available <= 0}
                            >
                              <div className="flex flex-col">
                                <span>
                                  {type.leave}: {available} days
                                </span>
                                {available === 0 && (
                                  <span className="text-xs text-orange-500">
                                    (Unpaid leave only)
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div variants={ANIMATION_VARIANTS.item}>
                    <label className="text-sm text-foreground">
                      Leave Duration Type
                    </label>
                    <Select
                      value={formData.leaveDurationType}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          leaveDurationType: value,
                        }))
                      }
                    >
                      <SelectTrigger className="bg-background/5 border-background/10 text-foreground">
                        <SelectValue placeholder="Select duration type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-day">Full Day</SelectItem>
                        <SelectItem value="half-day">Half Day</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {formData.leaveDurationType === "full-day" && (
                    <motion.div variants={ANIMATION_VARIANTS.item}>
                      <label className="text-sm text-foreground">
                        Leave Duration
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start mt-2 bg-background/5 border-background/10 text-foreground hover:text-background"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.startDate && formData.endDate
                              ? `${format(
                                  formData.startDate,
                                  "MMM dd, yyyy"
                                )} - ${format(
                                  formData.endDate,
                                  "MMM dd, yyyy"
                                )}`
                              : "Select dates"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="range"
                            selected={{
                              from: formData.startDate,
                              to: formData.endDate,
                            }}
                            onSelect={(range) =>
                              setFormData((prev) => ({
                                ...prev,
                                startDate: range?.from || null,
                                endDate: range?.to || null,
                              }))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </motion.div>
                  )}

                  {formData.leaveDurationType === "half-day" && (
                    <motion.div variants={ANIMATION_VARIANTS.item}>
                      <label className="text-sm text-foreground">Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start mt-2 bg-background/5 border-background/10 text-foreground hover:text-background"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.startDate
                              ? format(formData.startDate, "MMM dd, yyyy")
                              : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.startDate}
                            onSelect={(date) =>
                              setFormData((prev) => ({
                                ...prev,
                                startDate: date || null,
                                endDate: date || null,
                              }))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <label className="text-sm text-foreground mt-2">
                        Period
                      </label>
                      <Select
                        value={formData.halfDayPeriod}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            halfDayPeriod: value,
                          }))
                        }
                      >
                        <SelectTrigger className="bg-background/5 border-background/10 text-foreground mt-2">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}

                  {formData.leaveDurationType === "hourly" && (
                    <motion.div variants={ANIMATION_VARIANTS.item}>
                      <label className="text-sm text-foreground">Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start mt-2 bg-background/5 border-background/10 text-foreground hover:text-background"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.startDate
                              ? format(formData.startDate, "MMM dd, yyyy")
                              : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.startDate}
                            onSelect={(date) =>
                              setFormData((prev) => ({
                                ...prev,
                                startDate: date || null,
                                endDate: date || null,
                              }))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <label className="text-sm text-foreground">
                            Start Time
                          </label>
                          <Input
                            type="time"
                            value={formData.startTime}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                startTime: e.target.value,
                              }))
                            }
                            className="mt-2 bg-background/5 border-background/10 text-foreground"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-foreground">
                            End Time
                          </label>
                          <Input
                            type="time"
                            value={formData.endTime}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                endTime: e.target.value,
                              }))
                            }
                            className="mt-2 bg-background/5 border-background/10 text-foreground"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}

              {/* Add the attendance correction form fields */}
              {type === "attendance" && (
                <>
                  <motion.div variants={ANIMATION_VARIANTS.item}>
                    <label className="text-sm text-foreground">Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start mt-2 bg-background/5 border-background/10 text-foreground hover:text-background"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.startDate
                            ? format(formData.startDate, "MMM dd, yyyy")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.startDate}
                          onSelect={(date) =>
                            setFormData((prev) => ({
                              ...prev,
                              startDate: date || null,
                            }))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </motion.div>

                  <motion.div variants={ANIMATION_VARIANTS.item}>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="text-sm text-foreground">
                          Check-In Time
                        </label>
                        <Input
                          type="time"
                          value={formData.checkIn}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              checkIn: e.target.value,
                            }))
                          }
                          className="mt-2 bg-background/5 border-background/10 text-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-foreground">
                          Check-Out Time
                        </label>
                        <Input
                          type="time"
                          value={formData.checkOut}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              checkOut: e.target.value,
                            }))
                          }
                          className="mt-2 bg-background/5 border-background/10 text-foreground"
                        />
                      </div>
                    </div>
                  </motion.div>
                </>
              )}

              <motion.div variants={ANIMATION_VARIANTS.item}>
                <label className="text-sm text-foreground">Reason</label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  placeholder="Enter your reason here..."
                  className="mt-2 min-h-[150px] bg-background/5 border-background/10 text-foreground placeholder:text-foreground"
                />
              </motion.div>
            </motion.div>

            <div className="flex justify-end gap-2 pt-4 border-t border-background/10">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-background/10 text-foreground hover:bg-red_foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-red_foreground text-background hover:bg-background/90 hover:text-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner variant="pulse" size="small" />
                    Processing...
                  </div>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const RequestManagement = () => {
  const { data: session } = useSession();
  const employeeId = session?.user?.username;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [requestType, setRequestType] = useState("leave");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 15;
  const [Leaves, setLeaves] = useState({});
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const columns =
    requestType === "leave"
      ? [
          { key: "leaveType", header: "Leave Type" },
          { key: "period", header: "Leave Period" }, // Combined column
          { key: "reason", header: "Reason" },
          { key: "status", header: "Status" },
        ]
      : [
          { key: "startDate", header: "Date" },
          { key: "checkIn", header: "Check In" },
          { key: "checkOut", header: "Check Out" },
          { key: "reason", header: "Reason" },
          { key: "status", header: "Status" },
        ];

  const openReportModal = () => {
    setIsReportModalOpen(true);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
  };

  useEffect(() => {
    fetchRequests();
    FetchLeaves();
  }, [requestType, currentPage]);

  const FetchLeaves = async () => {
    try {
      const response = await axios.get(
        `/api/employees/leave/?employerId=CLIENT-${employeeId.split("-")[0]}`
      );
      setLeaves(response.data.data);
    } catch (error) {
      toast.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `/api/users/request/${employeeId}?type=${requestType}`
      );
      console.log("datadkfjkdfjj", data);
      setData(response.data.requests);
    } catch (error) {
      toast.error("No Request Found:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // New onDelete function to handle deletion of a request
  const onDelete = async (id) => {
    try {
      // Call your API endpoint to delete the request.
      await axios.delete(`/api/users/request?id=${id}`);
      // Update the state by filtering out the deleted request.
      setData((prevData) => prevData.filter((item) => item._id !== id));
    } catch (error) {
      toast.error("Error deleting request:", error);
    }
  };

  const filteredData = data?.filter(
    (item) =>
      item.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    const firstKey = columns[0].key;
    if (sortOrder === "asc") {
      return a[firstKey].toString().localeCompare(b[firstKey].toString());
    }
    return b[firstKey].toString().localeCompare(a[firstKey].toString());
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const openModal = (data = null) => {
    setSelectedData(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedData(null);
    fetchRequests();
  };

  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 3; i++) items.push(i);
        items.push("ellipsis");
        items.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        items.push(1);
        items.push("ellipsis");
        for (let i = totalPages - 2; i <= totalPages; i++) items.push(i);
      } else {
        items.push(1);
        items.push("ellipsis");
        items.push(currentPage - 1);
        items.push(currentPage);
        items.push(currentPage + 1);
        items.push("ellipsis");
        items.push(totalPages);
      }
    }
    return items;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        heading={
          requestType === "leave" ? "Leave Requests" : "Attendance Requests"
        }
      />
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        variants={ANIMATION_VARIANTS.container}
        initial="hidden"
        animate="visible"
      >
        <Card className=" border-white/10">
          <CardContent className="p-8">
            {/* Header Section */}
            <motion.div
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
              variants={ANIMATION_VARIANTS.item}
            >
              {/* Title and Description */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                  {requestType === "leave"
                    ? "Leave Requests"
                    : "Attendance Requests"}
                </h1>
                <p className="text-sm sm:text-base text-foreground/70">
                  Manage and track all {requestType} requests in one place
                </p>
              </div>

              {/* Select and Button */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {/* Select Dropdown */}
                <Select
                  value={requestType}
                  onValueChange={setRequestType}
                  className="w-full sm:min-w-[200px] bg-red_foreground"
                >
                  <SelectTrigger className="bg-red_foreground  border-background/10 text-background">
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leave">Leave Requests</SelectItem>
                    <SelectItem value="attendance">
                      Attendance Requests
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Buttons Container */}
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {/* Report Button - Only show for leave requests */}
                  {requestType === "leave" && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto"
                    >
                      <Button
                        onClick={openReportModal}
                        variant="outline"
                        className="w-full sm:w-auto border-background/10 text-background bg-red_foreground hover:text-foreground hover:bg-background transition-all duration-200"
                      >
                        <FileBarChart className="w-5 h-5 mr-2" />
                        Leave Report
                      </Button>
                    </motion.div>
                  )}

                  {/* New Request Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      onClick={() => openModal()}
                      className="w-full sm:w-auto border-background/10 text-background bg-red_foreground hover:text-foreground hover:bg-background transition-all duration-200"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      New Request
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Search Section */}
            <motion.div
              className="mb-6 flex flex-col sm:flex-row gap-4"
              variants={ANIMATION_VARIANTS.item}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red_foreground w-4 h-4" />
                <Input
                  placeholder="Search requests..."
                  className="pl-10 bg-background/5 border-background/10 text-foreground placeholder:text-foreground/40 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="w-full md:w-auto text-background bg-red_foreground hover:text-foreground hover:bg-background hover:bg-background/90 transition-all duration-200 shadow-lg hover:shadow-background/20 flex items-center justify-center py-2 px-4 text-sm sm:text-base"
              >
                Sort
                <ChevronDown
                  className={`ml-2 h-4 w-4 transform transition-transform ${
                    sortOrder === "desc" ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </motion.div>

            {/* Table Section */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner
                  variant="pulse"
                  size="large"
                  text="Processing..."
                  fullscreen={true}
                />
              </div>
            ) : (
              <motion.div
                variants={ANIMATION_VARIANTS.container}
                className="relative overflow-hidden rounded-lg border border-background/10"
              >
                <div className="relative rounded-lg border border-text_background/10 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-background/10 bg-red_foreground">
                        {columns.map((column) => (
                          <TableHead
                            key={column.key}
                            className="text-background font-medium py-5 px-6"
                          >
                            {column.header}
                          </TableHead>
                        ))}
                        <TableHead className="text-background font-medium py-5 px-6">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {currentData
                          .filter((item) => item.type === requestType)
                          .map((item) => (
                            <motion.tr
                              key={item._id}
                              variants={ANIMATION_VARIANTS.item}
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                              className="border-b border-text_background/10 "
                            >
                              {requestType === "leave" ? (
                                <>
                                  <TableCell className="py-4 px-6 text-foreground">
                                    {item.leaveType}
                                  </TableCell>
                                  <TableCell className="py-4 px-6 text-foreground">
                                    {item.leaveDurationType === "full-day"
                                      ? `${format(
                                          new Date(item.startDate),
                                          "MMM dd, yyyy"
                                        )} - 
                                    ${format(
                                      new Date(item.endDate),
                                      "MMM dd, yyyy"
                                    )}`
                                      : item.leaveDurationType === "half-day"
                                      ? `${format(
                                          new Date(item.startDate),
                                          "MMM dd, yyyy"
                                        )} (${item.halfDayPeriod})`
                                      : item.leaveDurationType === "hourly"
                                      ? `${format(
                                          new Date(item.startDate),
                                          "MMM dd, yyyy"
                                        )} ${item.startTime} - ${item.endTime}`
                                      : null}
                                  </TableCell>
                                </>
                              ) : (
                                <>
                                  <TableCell className="py-4 px-6 text-foreground">
                                    {format(
                                      new Date(item.startDate),
                                      "MMM dd, yyyy"
                                    )}
                                  </TableCell>
                                  <TableCell className="py-4 px-6 text-foreground">
                                    {item.checkIn}
                                  </TableCell>
                                  <TableCell className="py-4 px-6 text-foreground">
                                    {item.checkOut}
                                  </TableCell>
                                </>
                              )}

                              <TableCell className="py-4 px-6 text-foreground">
                                {item.reason}
                              </TableCell>
                              <TableCell className="py-4 px-6 text-foreground">
                                {item.status === "Rejected" ? (
                                  <div className="flex items-center">
                                    Rejected
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger className="underline underline-offset-4 decoration-dotted">
                                          <HelpCircle className="ml-1 h-4 w-4 text-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent side="left">
                                          <div className="space-y-1 text-xs">
                                            <p>{item.reason}</p>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                ) : (
                                  item.status
                                )}
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <div className="flex gap-4">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => openModal(item)}
                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                  >
                                    <Edit className="w-5 h-5" />
                                  </motion.button>
                                  {/* {item.status === "Pending" ? (
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => onDelete(item._id)}
                                        className="text-red-400 hover:text-red-300 transition-colors"
                                      >
                                        <Trash2 className="w-5 h-5" />
                                      </motion.button>
                                  ) : (
                                    <p className="text-foreground">No Action</p>
                                  )}  */}
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {sortedData.length > 0 && (
                  <div className="mt-4 py-4 border-t border-background/10">
                    <Pagination>
                      <PaginationContent className="text-foreground">
                        <PaginationItem>
                          <PaginationPrevious
                            className={`text-foreground ${
                              currentPage === 1
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-background/10"
                            }`}
                            onClick={() =>
                              currentPage > 1 &&
                              handlePageChange(currentPage - 1)
                            }
                          />
                        </PaginationItem>

                        {generatePaginationItems().map((item, index) => (
                          <PaginationItem key={index}>
                            {item === "ellipsis" ? (
                              <PaginationEllipsis className="text-foreground" />
                            ) : (
                              <PaginationLink
                                className={`text-foreground ${
                                  currentPage === item
                                    ? "bg-background/20 text-foreground cursor-pointer"
                                    : "hover-bg-background/10 text-foreground cursor-pointer"
                                }`}
                                onClick={() => handlePageChange(item)}
                                isActive={currentPage === item}
                              >
                                {item}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            className={`text-foreground ${
                              currentPage === totalPages
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-background/10"
                            }`}
                            onClick={() =>
                              currentPage < totalPages &&
                              handlePageChange(currentPage + 1)
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && sortedData.length === 0 && (
              <motion.div
                variants={ANIMATION_VARIANTS.item}
                className="text-center py-12"
              >
                <p className="text-foreground/40 text-lg">
                  {searchTerm
                    ? "No requests found matching your search"
                    : "No requests added yet"}
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <Modal onClose={closeModal}>
              <RequestForm
                type={requestType}
                existingData={selectedData}
                onClose={closeModal}
                employeeId={employeeId}
                Leaves={Leaves}
              />
            </Modal>
          )}
        </AnimatePresence>

        {/* Report Modal */}
        <AnimatePresence>
          {isReportModalOpen && (
            <Modal onClose={closeReportModal} size="lg">
              <LeaveManagementReport
                onClose={closeReportModal}
                employeeId={employeeId}
              />
            </Modal>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default RequestManagement;

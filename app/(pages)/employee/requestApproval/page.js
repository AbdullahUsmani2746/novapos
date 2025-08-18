"use client";

import Header from "@/components/Others/breadcumb";
import Modal from "@/components/Others/Modal";
import LoadingSpinner from "@/components/Others/spinner";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import axios from "@/lib/axiosInstance";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
// Add this import at the top with other icons
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  MessageSquare,
  Search,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

const RequestApprovalModal = ({
  request,
  onClose,
  onApprove,
  onReject,
  isProcessing,
  employeeNames,
}) => {
  const [rejectReason, setRejectReason] = useState("");
  const [showError, setShowError] = useState(false);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveDataLoading, setLeaveDataLoading] = useState(false);

  useEffect(() => {
    if (!request || request.type !== "leave") return;

    const fetchLeaveData = async () => {
      setLeaveDataLoading(true);
      try {
        console.log("Fetching leave data for request:", request.employeeId);
        // Fetch leave balances
        const balanceRes = await axios.get(
          `/api/users/leaveBalance?employeeId=${request.employeeId}`
        );
        setLeaveBalances(balanceRes.data.leaveBalances);

        // Fetch leave types
        const employerId = `CLIENT-${request.employeeId.split("-")[0]}`;
        const typesRes = await axios.get(
          `/api/employees/leave?employerId=${employerId}`
        );
        setLeaveTypes(typesRes.data.data);
      } catch (error) {
        toast.error("Failed to load leave information");
      } finally {
        setLeaveDataLoading(false);
      }
    };

    fetchLeaveData();
  }, [request]);

  const handleReject = () => {
    if (!rejectReason.trim()) {
      setShowError(true);
      return;
    }
    onReject(request._id, rejectReason);
  };

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.container}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="bg-foreground border-white/10 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-foreground">
            {request.type === "leave"
              ? "Leave Request Details"
              : "Attendance Correction Details"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div variants={ANIMATION_VARIANTS.item} className="space-y-6">
            <div className="space-y-4 p-4 rounded-lg bg-background/5 border border-background/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div variants={ANIMATION_VARIANTS.item}>
                  <label className="text-sm text-foreground/60">Employee</label>
                  <div className="mt-1 text-foreground">
                    <div className="font-medium">
                      {employeeNames[request.employeeId] || request.employeeId}
                    </div>
                    <div className="text-xs opacity-75">
                      {request.employeeId}
                    </div>
                  </div>
                </motion.div>
                {request.type === "leave" ? (
                  <>
                    <motion.div variants={ANIMATION_VARIANTS.item}>
                      <label className="text-sm text-foreground/60">
                        Leave Type
                      </label>
                      <p className="mt-1 capitalize text-foreground">
                        {request.leaveType}
                      </p>
                    </motion.div>
                      <motion.div variants={ANIMATION_VARIANTS.item}>
                                       <label className="text-sm text-foreground/60">Leave Duration Type</label>
                                       <p className="mt-1 capitalize text-foreground">
                                         {request.leaveDurationType}
                                       </p>
                                     </motion.div>
                                   
                                     <motion.div
                                       variants={ANIMATION_VARIANTS.item}
                                       className="sm:col-span-2"
                                     >
                                       <label className="text-sm text-foreground/60">Duration</label>
                                   
                                       {request.leaveDurationType === "full-day" && (
                                         <p className="mt-1 text-foreground">
                                           {format(new Date(request.startDate), "MMM dd, yyyy")} -{" "}
                                           {format(new Date(request.endDate), "MMM dd, yyyy")}
                                         </p>
                                       )}
                                   
                                       {request.leaveDurationType === "half-day" && (
                                         <p className="mt-1 text-foreground">
                                           {format(new Date(request.startDate), "MMM dd, yyyy")}
                                         </p>
                                       )}
                                   
                                       {request.leaveDurationType === "hourly" && (
                                         <p className="mt-1 text-foreground">
                                           {request.startTime} - {request.endTime}
                                         </p>
                                       )}
                                     </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div variants={ANIMATION_VARIANTS.item}>
                      <label className="text-sm text-foreground/60">Date</label>
                      <p className="mt-1 text-foreground">
                        {format(new Date(request.startDate), "MMM dd, yyyy")}
                      </p>
                    </motion.div>
                    <motion.div variants={ANIMATION_VARIANTS.item}>
                      <label className="text-sm text-foreground/60">Time</label>
                      <p className="mt-1 text-foreground">
                        {request.checkIn} - {request.checkOut}
                      </p>
                    </motion.div>
                  </>
                )}
              </div>

              {/* Leave Balances Section */}
              {request.type === "leave" && (
                <motion.div
                  variants={ANIMATION_VARIANTS.item}
                  className="space-y-4 pt-4 border-t border-background/10"
                >
                  <h3 className="text-sm font-medium text-foreground/80">
                    Leave Balances
                  </h3>
                  {leaveDataLoading ? (
                    <div className="flex justify-center items-center">
                      <LoadingSpinner size="small" />
                    </div>
                  ) : leaveBalances.length === 0 ? (
                    <p className="text-foreground/60 text-sm">
                      No leave balance information available.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {leaveBalances.map((balance) => {
                        const leaveType = leaveTypes.find(
                          (lt) => lt._id === balance.leaveId
                        );
                        return (
                          leaveType?.leave && (
                            <div
                              key={balance.leaveId}
                              className="flex justify-between items-center text-foreground"
                            >
                              <span className="text-sm">
                                {leaveType?.leave || "Unknown Leave Type"}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {balance.available} days remaining
                                </span>
                              </div>
                            </div>
                          )
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              <motion.div variants={ANIMATION_VARIANTS.item}>
                <label className="text-sm text-foreground/60">Reason</label>
                <p className="mt-1 text-foreground">{request.reason}</p>
              </motion.div>
              <motion.div variants={ANIMATION_VARIANTS.item}>
                <label className="text-sm text-foreground/60">
                  Rejection Reason (Required for rejection)
                </label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    setShowError(false);
                  }}
                  placeholder="Enter reason for rejection..."
                  className="mt-1 bg-background/5 border-background/10 text-foreground placeholder:text-foreground/40"
                />
                {showError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mt-2 p-3 bg-red-500/20 text-red-500 rounded-md"
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="text-sm">
                      Please provide a reason for rejection
                    </span>
                  </motion.div>
                )}
              </motion.div>
            </div>
            <div className="grid grid-cols-1 place-items-center sm:grid-cols-3 justify-end gap-2 pt-4 border-t border-background/10">
              <Button
                variant="outline"
                onClick={onClose}
                className="w-[200px] sm:w-[100%] border-background/10 text-foreground hover:bg-background/5"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                className="w-[200px] sm:w-[100%] bg-red-500 hover:bg-red-600 text-white"
              >
                <X className="w-4 h-4 mr-2" />
                {isProcessing ? "Processing..." : "Reject"}
              </Button>
              <Button
                onClick={() => onApprove(request._id)}
                className="w-[200px] sm:w-[100%] bg-background text-foreground hover:bg-background/90"
              >
                <Check className="w-4 h-4 mr-2" />
                {isProcessing ? "Processing..." : "Approve"}
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const RequestApprovalDashboard = () => {
  const { data: session } = useSession();
  const employeeId = session?.user?.username;
  const [activeTab, setActiveTab] = useState("leave");
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("All");

  // Add this state
  const [employeeNames, setEmployeeNames] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const itemsPerPage = 5;

  const columns = {
    leave: [
      { key: "employeeName", header: "Employee" }, // Changed from employeeId
      { key: "leaveType", header: "Leave Type" },
      { key: "startDate", header: "Start Date" },
      { key: "endDate", header: "End Date" },
      { key: "status", header: "Status" },
    ],
    attendance: [
      { key: "employeeName", header: "Employee" }, // Changed from employeeId
      { key: "startDate", header: "Date" },
      { key: "checkIn", header: "Check In" },
      { key: "checkOut", header: "Check Out" },
      { key: "status", header: "Status" },
    ],
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab, currentPage, filterStatus]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/users/request`, {
        params: {
          type: activeTab,
          status: filterStatus === "All" ? "" : filterStatus,
          employerId: "CLIENT-" + employeeId.split("-")[0],
        },
      });
      setRequests(response.data);

      // Fetch employee names for all requests
      const uniqueIds = [...new Set(response.data.map((r) => r.employeeId))];
      uniqueIds.forEach(async (id) => {
        if (!employeeNames[id]) {
          try {
            const res = await axios.get(`/api/employees/${id}`);
            setEmployeeNames((prev) => ({
              ...prev,
              [id]: res.data.data || id, // Fallback to ID if name not found
            }));
          } catch (error) {
            setEmployeeNames((prev) => ({ ...prev, [id]: id }));
          }
        }
      });
    } catch (error) {
      toast.error("No Request records found.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    setIsProcessing(true);

    try {
      await axios.put(`/api/users/request/${requestId}/approve`);
      toast.success("Request approved successfully");

      fetchRequests();

      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to approve request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (requestId, reason) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await axios.put(`/api/users/request/${requestId}/reject`, { reason });

      toast.success("Request rejected successfully");

      fetchRequests();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to reject request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return <Badge className={variants[status.toLowerCase()]}>{status}</Badge>;
  };

  const generatePaginationItems = () => {
    const totalPages = Math.ceil(requests.length / itemsPerPage);
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
      <Header heading="Request Approvals Dashboard" />
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2"
        variants={ANIMATION_VARIANTS.container}
        initial="hidden"
        animate="visible"
      >
        <Card className=" border-white/10">
          <CardContent className="p-8">
            <div className="space-y-2 ml-4 sm:ml-6 mb-4 sm:mb-6">
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                {activeTab === "leave"
                  ? "Leave Requests"
                  : "Attendance Requests"}
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base text-foreground/70">
                Manage and track all {activeTab} requests in one place
              </p>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col md:flex-row justify-between items-start gap-3 md:gap-6 mb-6">
                {/* Tabs */}
                <TabsList className="bg-background w-full md:w-auto flex-nowrap flex gap-4 md:flex-initial">
                  {/* Leave Requests Tab */}
                  <TabsTrigger
                    value="leave"
                    className="data-[state=active]:text-background data-[state=active]:bg-red_foreground flex items-center text-foreground p-2 text-sm md:text-[0.9375rem] md:min-w-[140px] justify-center flex-1 md:flex-initial"
                  >
                    <CalendarDays className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">Leave Requests</span>
                  </TabsTrigger>

                  {/* Attendance Requests Tab */}
                  <TabsTrigger
                    value="attendance"
                    className="data-[state=active]:text-background data-[state=active]:bg-red_foreground data-[state=active]:shadow flex items-center text-foreground p-2 text-sm md:text-[0.9375rem] md:min-w-[160px] justify-center flex-1 md:flex-initial"
                  >
                    <Clock className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">Attendance Requests</span>
                  </TabsTrigger>
                </TabsList>

                {/* Select Dropdown */}
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-[150px] lg:w-[170px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <motion.div
                className="mb-6 flex flex-col sm:flex-row gap-4"
                variants={ANIMATION_VARIANTS.item}
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red_foreground w-4 h-4" />
                  <Input
                    placeholder="Search by employee name..."
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
                  className="w-full sm:w-auto border-background/10 text-background bg-red_foreground hover:text-foreground hover:bg-background transition-all duration-200"
                >
                  Sort
                  <ChevronDown
                    className={`ml-2 h-4 w-4 transform transition-transform ${
                      sortOrder === "desc" ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </motion.div>
              <motion.div
                variants={ANIMATION_VARIANTS.container}
                className="relative overflow-hidden rounded-lg border border-background/10"
              >
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className="relative rounded-lg border border-text_background/10 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-background/10 bg-red_foreground">
                          {columns[activeTab].map((column) => (
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
                          {requests
                            .filter((item) => item.type === activeTab)
                            .map((request) => (
                              <motion.tr
                                key={request._id}
                                variants={ANIMATION_VARIANTS.item}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="border-b border-text_background/10 "
                              >
                                {columns[activeTab].map((column) => (
                                  <TableCell
                                    key={`${request._id}-${column.key}`}
                                    className="py-4 px-6 text-foreground"
                                  >
                                    {column.key === "employeeName" ? (
                                      <div>
                                        <div className="font-medium">
                                          {employeeNames[request.employeeId] ||
                                            request.employeeId}
                                        </div>
                                        <div className="text-xs opacity-75">
                                          {request.employeeId}
                                        </div>
                                      </div>
                                    ) : column.key === "status" ? (
                                      getStatusBadge(request.status)
                                    ) : column.key.includes(".") ? (
                                      column.key
                                        .split(".")
                                        .reduce((obj, key) => obj[key], request)
                                    ) : column.key === "startDate" ||
                                      column.key === "endDate" ||
                                      column.key === "date" ? (
                                      format(
                                        new Date(request[column.key]),
                                        "MMM dd, yyyy"
                                      )
                                    ) : (
                                      request[column.key]
                                    )}
                                  </TableCell>
                                ))}
                                <TableCell className="py-4 px-6">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewRequest(request)}
                                    className="flex items-center text-red?foreground hover:text-background hover:bg-red_foreground"
                                  >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    View
                                  </Button>
                                </TableCell>
                              </motion.tr>
                            ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                    {requests.length > 0 && (
                      <div className="mt-4 py-4 border-t border-background/10">
                        <Pagination>
                          <PaginationContent className="text-foreground">
                            <PaginationItem>
                              <PaginationPrevious
                                className={`text-foreground ${
                                  currentPage === 1
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-background/10 bg-background hover:bg-red_foreground"
                                }`}
                                onClick={() =>
                                  currentPage > 1 &&
                                  setCurrentPage(currentPage - 1)
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
                                    onClick={() => setCurrentPage(item)}
                                    isActive={currentPage === item}
                                  >
                                    {item}
                                  </PaginationLink>
                                )}
                              </PaginationItem>
                            ))}
                            <PaginationItem>
                              <PaginationNext
                                className={`text-background  bg-red_foreground${
                                  currentPage ===
                                  Math.ceil(requests.length / itemsPerPage)
                                    ? "opacity-50 cursor-not-allowed "
                                    : "hover:bg-background/10 text-foreground "
                                }`}
                                onClick={() =>
                                  currentPage <
                                    Math.ceil(requests.length / itemsPerPage) &&
                                  setCurrentPage(currentPage + 1)
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                    {requests.length === 0 && (
                      <motion.div
                        variants={ANIMATION_VARIANTS.item}
                        className="text-center py-12"
                      >
                        <p className="text-foreground/40 text-lg">
                          {searchTerm
                            ? "No requests found matching your search"
                            : "No requests found"}
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            </Tabs>
          </CardContent>
        </Card>
        <AnimatePresence>
          {isModalOpen && (
            <Modal onClose={() => setIsModalOpen(false)}>
              <RequestApprovalModal
                request={selectedRequest}
                onClose={() => setIsModalOpen(false)}
                onApprove={handleApprove}
                onReject={handleReject}
                isProcessing={isProcessing}
                employeeNames={employeeNames}
              />
            </Modal>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default RequestApprovalDashboard;

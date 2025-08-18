import { columns_employee as defaultColumns } from "@/components/Employee/column";
import LoadingSpinner from "@/components/Others/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
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
import axios from "@/lib/axiosInstance";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Edit,
  Eye,
  EyeOff,
  Plus,
  Search,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BulkEmployeeUpload from "./BulkEmployee";
import PopupForm from "./popup-client";

const EmployeeTable = () => {
  const { data: session } = useSession();
  const clientId = session?.user?.username || "";
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [deduction, setdeduction] = useState([]);
  const [Department, setDepartment] = useState([]);
  const [Designation, setDesignation] = useState([]);
  const [allownce, setAllownce] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupBulkOpen, setIsPopupBulkOpen] = useState(false);
  const [columns, setColumns] = useState(defaultColumns);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null, // 'asc', 'desc', or null
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
    hover: {
      scale: 1,
      text_backgroundColor: "rgba(247, 249, 242, 0.05)",
      transition: { duration: 0.2 },
    },
  };

  const fetchEmployees = async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `/api/employees?employerId=${clientId}&page=${page}&limit=${pagination.itemsPerPage}&sortKey=${sortConfig.key || "createdAt"}&sortDirection=${sortConfig.direction || "desc"}&search=${searchQuery}&inactive=${statusFilter} `
      );

      setEmployees(response.data.data || []);

      if (response.data.pagination) {
        setPagination({
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.total,
          itemsPerPage: response.data.pagination.limit,
        });
      }

      // Load dropdown data (optional: memoize)
      const [res1, res2, res3, res4] = await Promise.all([
        axios.get(`/api/employees/allownce?employerId=${clientId}`),
        axios.get(`/api/employees/deduction?employerId=${clientId}`),
        axios.get(`/api/employees/department?employerId=${clientId}`),
        axios.get(`/api/employees/jobTitle?employerId=${clientId}`),
      ]);
      setAllownce(res1.data.data);
      setdeduction(res2.data.data);
      setDepartment(res3.data.data);
      setDesignation(res4.data.data);
    } catch (error) {
      setError("Failed to load employees. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    const delayDebounce = setTimeout(() => {
      fetchEmployees(pagination.currentPage);
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounce); // cleanup previous timeout
  }, [pagination.currentPage, sortConfig, searchQuery,statusFilter]);

  const handleSort = (columnId) => {
    let direction = "asc";
    if (sortConfig.key === columnId && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === columnId && sortConfig.direction === "desc") {
      direction = null;
    }

    setSortConfig({ key: columnId, direction });
  };

  // Sort employees based on current sort config
  const getSortedEmployees = (employeesToSort) => {
    if (!sortConfig.key || !sortConfig.direction) {
      return employeesToSort;
    }

    return [...employeesToSort].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle special cases for sorting
      if (sortConfig.key === "firstName") {
        aValue = `${a.firstName} ${a.surname}`.toLowerCase();
        bValue = `${b.firstName} ${b.surname}`.toLowerCase();
      } else if (sortConfig.key === "department") {
        const aDept = Department.find((dept) => dept._id === a.department);
        const bDept = Department.find((dept) => dept._id === b.department);
        aValue = aDept ? aDept.department.toLowerCase() : "";
        bValue = bDept ? bDept.department.toLowerCase() : "";
      } else if (sortConfig.key === "jobTitle") {
        const aTitle = Designation.find((des) => des._id === a.jobTitle);
        const bTitle = Designation.find((des) => des._id === b.jobTitle);
        aValue = aTitle ? aTitle.job_title.toLowerCase() : "";
        bValue = bTitle ? bTitle.job_title.toLowerCase() : "";
      } else if (sortConfig.key === "phoneNumber") {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue ? bValue.toLowerCase() : "";
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredEmployees = employees
  // .filter((employee) => {
  //   if (!employee || !employee.firstName) return false;
  //   const matchesSearchQuery = employee.firstName
  //     .toLowerCase()
  //     .includes(searchQuery.toLowerCase());
  //   const matchesStatusFilter =
  //     statusFilter === "All" || employee.status === statusFilter;
  //   return matchesSearchQuery && matchesStatusFilter;
  // });

  // Get sort icon for column
  const getSortIcon = (columnId) => {
    if (sortConfig.key !== columnId) {
      return <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    if (sortConfig.direction === "asc") {
      return <ChevronUp className="ml-2 h-4 w-4" />;
    }
    if (sortConfig.direction === "desc") {
      return <ChevronDown className="ml-2 h-4 w-4" />;
    }
    return <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />;
  };

  // Apply sorting to filtered employees
  const sortedAndFilteredEmployees = getSortedEmployees(filteredEmployees);

  const toggleColumn = (columnId) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === columnId ? { ...col, isVisible: !col.isVisible } : col
      )
    );
  };

  const handleStatusChange = async (employeeId, newStatus) => {
    try {
      const response = await axios.put("/api/employees/status", {
        employeeId,
        status: newStatus,
      });

      if (response.status !== 200) {
        throw new Error(response.data.message || "Failed to update status");
      }

      // Refresh the employee list
      fetchEmployees();
    } catch (error) {
      setError(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    }
  };

  const openPopup = (employee = null, bulk = false) => {
    setEmployeeToEdit(employee);
    bulk ? setIsPopupBulkOpen(true) : setIsPopupOpen(true);
  };

  const closePopup = async () => {
    setIsPopupOpen(false);
    setIsPopupBulkOpen(false);

    setEmployeeToEdit(null);
    fetchEmployees();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(`/api/employees/${id}`);
        setEmployees(employees.filter((employee) => employee._id !== id));
        fetchEmployees();
      } catch (error) {
        setError("Failed to delete employee. Please try again.");
      }
    }
  };

  // Update your formatPhoneNumber function
  const formatPhoneNumber = (number) => {
    // Convert to string and remove all non-digit characters
    const cleaned = ("" + number).replace(/\D/g, "");

    // Check if the number is valid length for formatting
    if (cleaned.length === 10) {
      // Format as (XXX) XXX-XXXX
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(
        3,
        6
      )}-${cleaned.substring(6, 10)}`;
    }

    // Return original if not 10 digits
    return cleaned;
  };

  return (
    <div className="p-6 space-y-6 text-black rounded-xl overlow-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-text_background">
          Employee Management
        </h1>
        <p className="text-sm md:text-base text-text_background/70">
          Manage your organization&apos;s workforce
        </p>
      </motion.div>

      {error && (
        <Alert variant="destructive" className="mb-6 animate-in fade-in-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner
            variant="pulse"
            size="large"
            text="Processing..."
            fullscreen={true}
          />{" "}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Search Input */}
            <div className="w-full lg:flex-1 lg:max-w-md">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red_foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search Employees"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                    }}
                    className="pl-10 bg-background border-text_background/10 text-text_background placeholder:text-text_background/40 w-full"
                  />
              </div>
            </div>

            {/* Filters and Buttons */}
            <div className=" w-full lg:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
              {/* Status Filter Dropdown */}
              <div className="w-full sm:w-[180px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  {" "}
                  <SelectTrigger className="w-full border-foreground/20">
                    <SelectValue placeholder="All Employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Employees</SelectItem>
                    <SelectItem value="ACTIVE">Active Employees</SelectItem>
                    <SelectItem value="INACTIVE">Inactive Employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Show/Hide Columns Dropdown */}
              <div className="w-full sm:w-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full bg-red_foreground text-background hover:bg-background transition-all duration-200 shadow-lg hover:shadow-text_background/20 hover:text-foreground"
                    >
                      Show/Hide Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {columns.map((column) => (
                      <DropdownMenuItem
                        key={column.id}
                        onClick={() => toggleColumn(column.id)}
                      >
                        {column.isVisible ? (
                          <Eye className="mr-2 " />
                        ) : (
                          <EyeOff className="mr-2 " />
                        )}
                        {column.header}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Add Employee Button */}
              <div className="w-full sm:w-auto">
                <Button
                  onClick={() => openPopup(null)}
                  className="w-full bg-red_foreground text-background hover:bg-background transition-all duration-200 shadow-lg hover:shadow-text_background/20 hover:text-foreground"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Employee
                </Button>
              </div>

              {/* Add Bulk Employee Button */}
              <div className="w-full sm:w-auto">
                <Button
                  onClick={() => openPopup(null, true)}
                  className="w-full bg-red_foreground text-background hover:bg-background transition-all duration-200 shadow-lg hover:shadow-text_background/20 hover:text-foreground"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Bulk Employee
                </Button>
              </div>
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            className="relative rounded-lg border border-text_background/10 overflow-x-auto"
          >
            <Table className="text-text_background">
              <TableHeader>
                <TableRow className=" bg-red_foreground">
                  {/* <TableHead className="w-[100px] text-text_background font-medium py-3 px-3">Profile</TableHead> */}
                  {columns
                    .filter((col) => col.isVisible)
                    .map((col) => (
                      <TableHead
                        className="text-background font-bold py-3 px-3 cursor-pointer hover:bg-background/10 transition-colors select-none"
                        key={col.id}
                        onClick={() => handleSort(col.id)}
                      >
                        <div className="flex items-center">
                          {col.header}
                          {getSortIcon(col.id)}
                        </div>
                      </TableHead>
                    ))}
                  <TableHead className="text-background  font-bold py-3 px-3 ">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="wait">
                  {sortedAndFilteredEmployees.map((employee) => (
                    <motion.tr
                      key={employee._id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      whileHover="hover"
                      className="border-b border-text_background/10 "
                    >
                      {/* <TableCell>
                       <motion.div
                         whileHover={{ scale: 1.1}}
                         transition={{ type: "spring", stiffness: 300 }}
                       >
                         <Image
                           className="rounded-full ring-2 ring-blue-500/20"
                           src={employee.profileImage}
                           width={50}
                           height={50}
                           alt="Employee Profile"
                         />
                       </motion.div>
                     </TableCell> */}
                      {columns
                        .filter((col) => col.isVisible)
                        .map((col) => (
                          <TableCell key={col.id}>
                            {col.id === "firstName" ? (
                              <>
                                <p className="font-bold">
                                  {employee["firstName"] +
                                    " " +
                                    employee["surname"]}
                                </p>
                                <p className="text-xs">
                                  ID: {employee["employeeId"]}
                                </p>
                                <p className="text-xs">
                                  Email: {employee["emailAddress"]}
                                </p>
                              </>
                            ) : col.id === "phoneNumber" ? (
                              <span className="font-medium">
                                +{formatPhoneNumber(employee[col.id])}
                              </span>
                            ) : col.id === "status" ? (
                              <Select
                                value={employee[col.id]}
                                onValueChange={(value) =>
                                  handleStatusChange(employee._id, value)
                                }
                              >
                                <SelectTrigger
                                  className={`w-[120px] ${
                                    employee[col.id] === "ACTIVE"
                                      ? "bg-background text-text_backgroun"
                                      : "bg-red-600/20 text-red-400 border-red-500"
                                  }`}
                                >
                                  <SelectValue placeholder={employee[col.id]} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ACTIVE">Active</SelectItem>
                                  <SelectItem value="INACTIVE">
                                    Inactive
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            ) : col.id === "allownces" ? (
                              <div className="flex flex-wrap gap-1">
                                {employee[col.id]?.map((allownceId) => {
                                  const matchedAllownce = allownce.find(
                                    (item) => item._id === allownceId
                                  );
                                  return (
                                    matchedAllownce && (
                                      <Badge
                                        key={allownceId}
                                        className="bg-blue-600/20 text-blue-400 border-blue-500 border"
                                      >
                                        {matchedAllownce.allownce}
                                      </Badge>
                                    )
                                  );
                                })}
                              </div>
                            ) : col.id === "deductions" ? (
                              <div className="flex flex-wrap gap-1">
                                {employee[col.id]?.map((id) => {
                                  const matchedDeduction = deduction.find(
                                    (item) => item._id === id
                                  );
                                  return (
                                    matchedDeduction && (
                                      <Badge
                                        variant="outline"
                                        key={id}
                                        className="bg-red-600/20 text-red-400 border-red-500 border"
                                      >
                                        {matchedDeduction.deduction}
                                      </Badge>
                                    )
                                  );
                                })}
                              </div>
                            ) : col.id === "department" ? (
                              <p
                                variant="secondary"
                                className="bg-background text-text_background"
                              >
                                {
                                  Department.find(
                                    (dept) => dept._id === employee.department
                                  )?.department
                                }
                              </p>
                            ) : col.id === "jobTitle" ? (
                              <p
                                variant="secondary"
                                className="bg-background text-text_background "
                              >
                                {
                                  Designation.find(
                                    (des) => des._id === employee.jobTitle
                                  )?.job_title
                                }
                              </p>
                            ) : col.id2 ? (
                              employee[col.id] + " " + employee[col.id2]
                            ) : (
                              employee[col.id]
                            )}
                          </TableCell>
                        ))}
                      <TableCell>
                        <div className="flex pl-2 space-x-6">
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            size="icon"
                            onClick={() => openPopup(employee)}
                            className="text-foreground hover:text-red_foreground stransition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            size="icon"
                            onClick={() => handleDelete(employee._id)}
                            className="text-red-400 hover:text-foreground transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>

            <div className="p-4 border-t border-text_background/10">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => {
                        if (pagination.currentPage > 1) {
                          setPagination((prev) => ({
                            ...prev,
                            currentPage: prev.currentPage - 1,
                          }));
                        }
                      }}
                      disabled={pagination.currentPage === 1}
                      className="hover:bg-red_foreground hover:text-background text-text_background cursor-pointer"
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
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                currentPage: pageNum,
                              }))
                            }
                            isActive={pagination.currentPage === pageNum}
                            className={
                              pagination.currentPage === pageNum
                                ? "bg-background cursor-pointer"
                                : "hover-bg-text_background/10 cursor-pointer"
                            }
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                  )}

                  {pagination.totalPages > 5 &&
                    pagination.currentPage < pagination.totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => {
                        if (pagination.currentPage < pagination.totalPages) {
                          setPagination((prev) => ({
                            ...prev,
                            currentPage: prev.currentPage + 1,
                          }));
                        }
                      }}
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      className="hover:bg-red_foreground hover:text-background text-text_background cursor-pointer"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </motion.div>
        </motion.div>
      )}

      {isPopupOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <PopupForm
            onClose={closePopup}
            setEmployees={setEmployees}
            employeeToEdit={employeeToEdit}
          />
        </motion.div>
      )}

      {isPopupBulkOpen && (
        //  <motion.div
        //    initial={{ opacity: 0 }}
        //    animate={{ opacity: 1 }}
        //    exit={{ opacity: 0 }}
        //  >
        <BulkEmployeeUpload onClose={closePopup} setEmployees={setEmployees} />
        //  </motion.div>
      )}
    </div>
  );
};

export default EmployeeTable;

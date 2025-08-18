"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Search,
  ChevronDown,
} from "lucide-react";
import axios from "@/lib/axiosInstance";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/Others/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableHeader,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PopupForm from "./popupForm";
import { columns as defaultColumns } from "./columns";

// Animation variants matching the first code
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

const EmployerTable = () => {
  const router = useRouter();
  const [employers, setEmployers] = useState([]);
  const [plan, setPlan] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [columns, setColumns] = useState(defaultColumns);
  const [employerToEdit, setEmployerToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const fetchEmployers = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `/api/employers?page=${page}&limit=${pagination.itemsPerPage}`
      );

      setEmployers(response.data.data);

      // Update pagination state from backend response
      if (response.data.pagination) {
        setPagination({
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.total,
          itemsPerPage: response.data.pagination.limit,
        });
      }

      const responsePlan = await axios.get("/api/subscriptionPlanMaster");
      setPlan(responsePlan.data.data);
    } catch (error) {
      console.error("Error fetching employers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployers(pagination.currentPage);
  }, [pagination.currentPage]);

  const filteredEmployers = employers.filter((employer) => {
    if (!employer || !employer.businessName) return false;
    const matchesSearchQuery = employer.businessName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatusFilter =
      statusFilter === "All" || employer.status === statusFilter;
    return matchesSearchQuery && matchesStatusFilter;
  });

  // Sort employers
  const sortedEmployers = [...filteredEmployers].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.businessName.localeCompare(b.businessName);
    }
    return b.businessName.localeCompare(a.businessName);
  });

  const toggleColumn = (columnId) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === columnId ? { ...col, isVisible: !col.isVisible } : col
      )
    );
  };

  const handleStatusChange = async (employerId, newStatus) => {
    try {
      const response = await axios.put("/api/employers/status", {
        employerId,
        status: newStatus,
      });

      if (response.status !== 200) {
        throw new Error(response.data.message || "Failed to update status");
      }

      // Refresh the employer list
      fetchEmployers(pagination.currentPage);
    } catch (error) {
      console.error("Error updating employer status:", error);
    }
  };

  const openPopup = (employer = null) => {
    setEmployerToEdit(employer);
    setIsPopupOpen(true);
  };

  const closePopup = async () => {
    setIsPopupOpen(false);
    setEmployerToEdit(null);
    await fetchEmployers();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employer?")) {
      try {
        await axios.delete(`/api/employers/${id}`);
        await fetchEmployers(pagination.currentPage);
      } catch (error) {
        console.error("Error deleting employer:", error);
      }
    }
  };

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      variants={ANIMATION_VARIANTS.container}
      initial="hidden"
      animate="visible"
    >
      <Card className="bg-background border-white/10 ">
        <CardContent className="p-8">
          {/* Header Section */}
          <motion.div
            className="flex flex-col justify-between items-start gap-4 mb-8 md:flex-row md:items-center"
            variants={ANIMATION_VARIANTS.item}
          >
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground tracking-tight sm:text-4xl">
                Client Management
              </h1>
              <p className="text-foreground/70 text-sm sm:text-base">
                Manage your clients and their subscription plans
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full md:w-auto" // Ensure button takes full width on mobile
            >
              <Button
                onClick={() => openPopup()}
                className="w-full md:w-auto  text-background bg-red_foreground hover:text-foreground hover:bg-background hover:bg-background/90 transition-all duration-200 shadow-md hover:shadow-foreground/5 flex items-center justify-center py-2 px-4 text-sm sm:text-base"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Client
              </Button>
            </motion.div>
          </motion.div>

          {/* Search and Filter Section */}
          <motion.div
            className="mb-6 flex flex-col sm:flex-row gap-4"
            variants={ANIMATION_VARIANTS.item}
          >
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red_foreground w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <Input
                placeholder="Search Clients"
                className="pl-10 bg-background/5 border-background/10 shadow text-text_background placeholder:text-text_background/40 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter Dropdown */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background/5 border-background/10 text-background bg-red_foreground hover:text-foreground hover:bg-background">
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Clients</SelectItem>
                <SelectItem value="ACTIVE">Active Clients</SelectItem>
                <SelectItem value="INACTIVE">Inactive Clients</SelectItem>
              </SelectContent>
            </Select>

            {/* Columns Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-background/10 text-background bg-red_foreground hover:text-foreground hover:bg-background"
                >
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {columns.map((column) => (
                  <DropdownMenuItem
                    key={column.id}
                    onClick={() => toggleColumn(column.id)}
                  >
                    {column.isVisible ? (
                      <Eye className="mr-2" />
                    ) : (
                      <EyeOff className="mr-2" />
                    )}
                    {column.header}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Button */}
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="w-full sm:w-auto border-background/10 hover:bg-background/5 text-background bg-red_foreground hover:text-foreground hover:bg-background"
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
                text="Loading Clients..."
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
                      {columns
                        .filter((col) => col.isVisible && col.id !== "status")
                        .map((col) => (
                          <TableHead
                            key={col.id}
                            className="text-background font-medium py-5 px-6"
                          >
                            {col.header}
                          </TableHead>
                        ))}
                      <TableHead className="text-background font-medium py-5 px-6">
                        Plan
                      </TableHead>
                      <TableHead className="text-background font-medium py-5 px-6">
                        Fee
                      </TableHead>
                      <TableHead className="text-background font-medium py-5 px-6">
                        Status
                      </TableHead>
                      <TableHead className="text-background font-medium py-5 px-6">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredEmployers.map((employer) => (
                        <motion.tr
                          key={employer._id}
                          variants={ANIMATION_VARIANTS.item}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="border-b border-text_background/10 "
                        >
                          {/* Render dynamic visible columns, excluding 'status' */}
                          {columns
                            .filter(
                              (col) => col.isVisible && col.id !== "status"
                            )
                            .map((col) => (
                              <TableCell
                                key={col.id}
                                className="py-4 px-6 text-foreground"
                              >
                                {col.id === "businessName" ? (
                                  <>
                                    <p className="font-semibold">
                                      {employer.businessName}
                                    </p>
                                    <span className="font-normal">
                                      {employer.employerId}
                                    </span>
                                    <p className="font-normal">
                                      {employer.email}
                                    </p>
                                  </>
                                ) : col.id === "contactPerson" ? (
                                  `${employer.cpFirstName || ""} ${
                                    employer.cpSurname || ""
                                  }`
                                ) : col.id === "activatedOn" ? (
                                  `${new Date(
                                    employer.activatedOn
                                  ).toLocaleDateString("en-GB")}`
                                ) : (
                                  employer[col.id][0].toUpperCase() +
                                  employer[col.id].substring(1).toLowerCase()
                                )}
                              </TableCell>
                            ))}

                          {/* Plan */}
                          <TableCell className="py-4 px-6 text-foreground">
                            {plan
                              .filter(
                                (p) => p._id === employer.subscriptionPlan
                              )
                              .map((matchedPlan) => matchedPlan.planName)}
                          </TableCell>

                          {/* Fee */}
                          <TableCell className="py-4 px-6 text-foreground">
                            {plan
                              .filter(
                                (p) => p._id === employer.subscriptionPlan
                              )
                              .map(
                                (matchedPlan) =>
                                  `$${matchedPlan.subscriptionFee}`
                              )}
                          </TableCell>

                          {/* Status - Manual Insertion */}
                          <TableCell className="py-4 px-6 text-background">
                            <Select
                              value={employer.status}
                              onValueChange={(value) =>
                                handleStatusChange(employer._id, value)
                              }
                            >
                              <SelectTrigger className="w-[120px] bg-background text-foreground">
                                <SelectValue placeholder={employer.status} />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="INACTIVE">
                                  Inactive
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="py-4 px-6">
                            <div className="flex gap-4">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => openPopup(employer)}
                                className="text-foreground hover:text-red_foreground transition-colors"
                              >
                                <Edit className="w-5 h-5" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(employer._id)}
                                className="text-red_foreground hover:text-foreground transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </motion.button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              <div className="p-4 border-t border-background/10">
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
                        className={`text-foreground hover:text-background ${
                          pagination.currentPage === 1
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-background/10 hover:bg-red_foreground"
                        }`}
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
                                  ? "bg-background/20 text-foreground cursor-pointer"
                                  : "hover-bg-background/10 text-foreground cursor-pointer"
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
                         className={`text-foreground hover:text-background ${
                          pagination.currentPage >= pagination.totalPages 
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-background/10 hover:bg-red_foreground"
                        }`}
                         />

                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>

              {/* Empty State */}
              {!isLoading && sortedEmployers.length === 0 && (
                <motion.div
                  variants={ANIMATION_VARIANTS.item}
                  className="text-center py-12"
                >
                  <p className="text-background/40 text-lg">
                    {searchQuery
                      ? "No clients found matching your search"
                      : "No clients added yet"}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <AnimatePresence>
        {isPopupOpen && (
          <PopupForm
            onClose={closePopup}
            setEmployers={setEmployers}
            employerToEdit={employerToEdit}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EmployerTable;

"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import axios from "axios";
import HelpdeskModal from "@/components/Helpdesk/HelpdeskModal";
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

const onFetch = async (
  apiEndpoint,
  params,
  employerId,
  setData,
  setPagination,
  setIsLoading = setIsLoading,
  Helpdesk = false,
  setClients,
  data
) => {
  setIsLoading(true);
  try {
    const response = await axios.get(apiEndpoint, {
      params: {
        ...params,
        // Include Helpdesk specific params if needed
        ...(Helpdesk && { employeeId: params.employerId }),
      },
    });

    if (Helpdesk && response.data.clients && setClients) {
      setClients(response.data.clients);
    }

    setData(response.data.data);
    setPagination({
      total: response.data.pagination.total,
      totalPages: response.data.pagination.totalPages,
      currentPage: response.data.pagination.currentPage,
      limit: response.data.pagination.limit,
    });
  } catch (error) {
    // !data && toast.error('No Data Found')
  } finally {
    setIsLoading(false);
  }
};

const DataManagementPage = ({
  // Page Configuration
  pageTitle,
  pageDescription,
  addButtonText,
  Helpdesk,

  // Data Configuration
  columns,
  searchKeys = [], // Array of keys to search in

  // Component to render in modal
  FormComponent,

  // API Functions
  apiEndpoint,
  employerId,
  // onFetch,
  // onDelete,

  // Optional configurations

  onStatusUpdate = null,
}) => {
  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [data, setData] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [helpdeskViewModal, setHelpdeskViewModal] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 5,
  });

  useEffect(() => {
    const fetchParams = {
      employerId,
      page: currentPage,
      limit: itemsPerPage,
      sortKey: sortConfig.key,
      sortDirection: sortConfig.direction,
    };
    onFetch(
      apiEndpoint,
      fetchParams,
      employerId,
      setData,
      setPagination,
      setIsLoading,
      Helpdesk,
      setClients,
      data
    );
  }, [apiEndpoint, employerId, currentPage, itemsPerPage, sortConfig]);

  // Sorting function
  const handleSort = (columnKey) => {
    let direction = "asc";
    if (sortConfig.key === columnKey && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: columnKey, direction });
  };

  const onDelete = async (id) => {
    try {
      await axios.delete(`${apiEndpoint}/${id}`);
      const fetchParams = {
        employerId,
        page: currentPage,
        limit: itemsPerPage,
      };
      await onFetch(
        apiEndpoint,
        fetchParams,
        employerId,
        setData,
        setPagination,
        setIsLoading,
        setPagination,
        data
      );
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  // Modal handlers
  const openModal = (data = null, condition = false) => {
    setSelectedData(data);

    console.log(data);

    if (condition) {
      setHelpdeskViewModal(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const closeModal = async () => {
    setIsModalOpen(false);
    setHelpdeskViewModal(false);
    const fetchParams = {
      employerId,
      page: currentPage,
      limit: itemsPerPage,
    };

    setSelectedData(null);
    await onFetch(
      apiEndpoint,
      fetchParams,
      employerId,
      setData,
      "",
      setIsLoading,
      Helpdesk,
      data
    );
  };

  // Search and filter logic - client-side only
  const filteredData = data.filter((item) =>
    searchKeys.some((key) =>
      item[key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Client-side sorting
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key]?.toString() || "";
    const bValue = b[sortConfig.key]?.toString() || "";

    if (sortConfig.direction === "asc") {
      return aValue.localeCompare(bValue);
    }
    return bValue.localeCompare(aValue);
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Generate pagination items with ellipsis logic
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const { currentPage, totalPages } = pagination;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      let startPage, endPage;
      if (currentPage <= 3) {
        startPage = 1;
        endPage = 5;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 4;
        endPage = totalPages;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }

      if (startPage > 1) items.push(1);
      if (startPage > 2) items.push("ellipsis-left");
      for (let i = startPage; i <= endPage; i++) items.push(i);
      if (endPage < totalPages - 1) items.push("ellipsis-right");
      if (endPage < totalPages) items.push(totalPages);
    }

    return items;
  };

  // Render sort icon
  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronDown className="w-4 h-4 opacity-50" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {pageTitle !== "Help Desk" && <Header heading={pageTitle} />}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        variants={ANIMATION_VARIANTS.container}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-white/10 ">
          <CardContent className="p-8">
            {/* Header Section */}
            <motion.div
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
              variants={ANIMATION_VARIANTS.item}
            >
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-text_background tracking-tight">
                  {pageTitle}
                </h1>
                <p className="text-text_background/70">{pageDescription}</p>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {addButtonText === "" ? (
                  ""
                ) : (
                  <Button
                    onClick={() => openModal()}
                    className="bg-red_foreground text-background hover:bg-background hover:text-foreground hover:bg-background/5   hover:border transition-all duration-200 shadow-lg hover:shadow-background/20"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {addButtonText}
                  </Button>
                )}
              </motion.div>
            </motion.div>

            {/* Search Section */}
            <motion.div
              className="mb-6 flex flex-col sm:flex-row gap-4"
              variants={ANIMATION_VARIANTS.item}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red_foreground w-4 h-4" />
                <Input
                  placeholder={`Search ${pageTitle.toLowerCase()}...`}
                  className="pl-10 bg-background/5 border-background/10 shadow text-text_background placeholder:text-text_background/40 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </motion.div>

            {/* Table Section */}
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
                variants={ANIMATION_VARIANTS.container}
                className="relative  overflow-hidden rounded-lg border border-background/10"
              >
                <div className="relative rounded-lg border border-text_background/10 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-background/10 bg-red_foreground">
                        {columns.map((column) => (
                          <TableHead
                            key={column.key}
                            className="text-background font-medium py-5 px-6 cursor-pointer hover:bg-background/10 transition-colors"
                            onClick={() => handleSort(column.key)}
                          >
                            <div className="flex items-center justify-between">
                              <span>{column.header}</span>
                              {renderSortIcon(column.key)}
                            </div>
                          </TableHead>
                        ))}

                        <TableHead
                          key="action"
                          className="text-background font-medium py-5 px-6"
                        >
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {sortedData.map((item, index) => (
                          <motion.tr
                            key={index}
                            variants={ANIMATION_VARIANTS.item}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="border-b border-text_background/10 "
                          >
                            {columns.map((column, index) => {
                              if (column.key === "date") {
                                return (
                                  <TableCell
                                    key={index}
                                    className="py-4 px-6 text-text_background"
                                  >
                                    {column.cell
                                      ? column.cell(item)
                                      : item[column.key]}
                                  </TableCell>
                                );
                              } else if (column.header === "Status") {
                                return (
                                  <TableCell
                                    key={index}
                                    className="py-4 px-6 text-text_background"
                                  >
                                    <Badge
                                      className={`text-white px-2 py-1 ${
                                        item[column.key] === "In Progress"
                                          ? "bg-[#F5A623]"
                                          : item[column.key] === "open"
                                            ? "bg-green-500"
                                            : item[column.key] === "Closed"
                                              ? "bg-[#D0021B]"
                                              : ""
                                      }`}
                                    >
                                      {item[column.key] === "In Progress"
                                        ? "Open"
                                        : item[column.key]}
                                    </Badge>
                                  </TableCell>
                                );
                              }
                              return (
                                <TableCell
                                  key={column.key}
                                  className="py-4 px-6 text-text_background"
                                >
                                  {column.key
                                    ? column.key2
                                      ? (item[column.key]?.[column.key2] ?? "")
                                      : (item[column.key] ?? "")
                                    : ""}
                                </TableCell>
                              );
                            })}
                            <TableCell className="py-4 px-6">
                              <div className="flex gap-4">
                                {Helpdesk ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openModal(item, true)}
                                    className="flex items-center text-red?foreground hover:text-background hover:bg-red_foreground"
                                  >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    View
                                  </Button>
                                ) : (
                                  <>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => openModal(item)}
                                      className="text-foreground hover:text-red_foreground transition-colors"
                                    >
                                      <Edit className="w-5 h-5" />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => onDelete(item._id)}
                                      className="text-red-400 hover:text-foreground transition-colors"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </motion.button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                  {/* // Update your pagination section with: */}
                  {/* Pagination */}
                  {sortedData.length > 0 && (
                    <div className="mt-4 py-4 border-t border-foreground/10">
                      <Pagination>
                        <PaginationContent className="text-foreground">
                          <PaginationItem>
                            <PaginationPrevious
                              className={`text-foreground hover:text-background ${
                                currentPage === 1
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:bg-background/10 hover:bg-red_foreground"
                              }`}
                              onClick={() =>
                                currentPage > 1 &&
                                handlePageChange(currentPage - 1)
                              }
                            />
                          </PaginationItem>

                          {generatePaginationItems().map((item, index) => (
                            <PaginationItem key={index}>
                              {typeof item === "string" &&
                              item.includes("ellipsis") ? (
                                <PaginationEllipsis className="text-text_background" />
                              ) : (
                                <PaginationLink
                                  className={` ${
                                    currentPage === item
                                      ? "bg-background/20 text-foreground hover:text-background"
                                      : "hover:bg-red_foreground text-foreground hover:text-background"
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
                              className={`text-foreground hover:text-background ${
                                currentPage >= totalPages
                                  ? "opacity-50 cursor-not-allowed "
                                  : "hover:bg-background/10 hover:bg-red_foreground"
                              }`}
                              onClick={() =>
                                currentPage <= 1 &&
                                handlePageChange(currentPage + 1)
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && sortedData.length === 0 && (
              <motion.div
                variants={ANIMATION_VARIANTS.item}
                className="text-center py-12"
              >
                <p className="text-text_background/40 text-lg">
                  {searchTerm
                    ? `No ${pageTitle.toLowerCase()} found matching your search`
                    : `No ${pageTitle.toLowerCase()} added yet`}
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <Modal onClose={closeModal}>
              <FormComponent existingData={selectedData} onClose={closeModal} />
            </Modal>
          )}

          {helpdeskViewModal && (
            <Modal onClose={closeModal}>
              <HelpdeskModal
                complaint={selectedData}
                clients={clients}
                onClose={closeModal}
                onStatusUpdate={onStatusUpdate}
              />
            </Modal>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DataManagementPage;

"use client";

import { Button } from "@/components/ui/button";
import { deleteItem, fetchItems } from "@/lib/api";
import {
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ItemList() {
  const [items, setItems] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [localSearchValue, setLocalSearchValue] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const router = useRouter();

  // Field definitions for sorting
  const fields = [
    { name: "itcd", label: "ITCD", sortable: true },
    { name: "item", label: "Description", sortable: true },
    { name: "code", label: "Code", sortable: true },
    { name: "unit", label: "Unit", sortable: true },
  ];

  // Debounce search input
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (localSearchValue !== searchValue) {
        setSearchValue(localSearchValue);
        setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page on search
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [localSearchValue, searchValue]);

  // Load items when pagination, search, or sort changes
  useEffect(() => {
    loadItems();
  }, [pagination.page, pagination.limit, searchValue, sortField, sortOrder]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchValue && { search: searchValue }),
        ...(sortField && { sortField }),
        ...(sortOrder && { sortOrder }),
      };

      const data = await fetchItems(params);

      // Handle both old and new response formats
      if (data.items) {
        // New paginated format
        setItems(data.items);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0,
        }));
      } else {
        // Old format - all items at once
        setItems(data);
        setPagination((prev) => ({
          ...prev,
          total: data.length,
          pages: 1,
        }));
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      // Reload current page after deletion
      loadItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleSort = (field) => {
    if (!field.sortable) return;

    const newSortOrder =
      sortField === field.name && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field.name);
    setSortOrder(newSortOrder);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page on sort
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handlePageSizeChange = (newLimit) => {
    setPagination((prev) => ({
      ...prev,
      limit: parseInt(newLimit),
      page: 1,
    }));
  };

  const getPageNumbers = () => {
    const { page, pages } = pagination;
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const renderSortIcon = (field) => {
    if (!field.sortable) return null;

    if (sortField === field.name) {
      return sortOrder === "asc" ? (
        <ChevronUp size={14} className="ml-1" />
      ) : (
        <ChevronDown size={14} className="ml-1" />
      );
    }

    return (
      <div className="ml-1 opacity-50">
        <ChevronUp size={10} className="-mb-1" />
        <ChevronDown size={10} className="-mt-1" />
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                Item Management
              </h1>
              <p className="text-gray-600">
                Manage your inventory items efficiently
              </p>
            </div>

            <Button
              onClick={() => router.push("/accounting/forms/items/new")}
              className="bg-primary hover:bg-primary/90 text-lg text-white px-6 py-7 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center"
            >
              <Plus className="mr-2 h-5 w-5 text-lg" />
              Add New Item
            </Button>
          </div>

          {/* Enhanced Search Bar with Page Size */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <input
                type="text"
                placeholder="Search items..."
                value={localSearchValue}
                onChange={(e) => setLocalSearchValue(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary text-sm transition-all duration-200 shadow-sm hover:shadow-md"
              />
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center space-x-3 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-200">
              <Filter className="h-4 w-4 text-primary" />
              <label className="text-sm font-medium text-primary">Show:</label>
              <select
                value={pagination.limit}
                onChange={(e) => handlePageSizeChange(e.target.value)}
                className="border-0 bg-transparent text-sm font-medium text-primary focus:ring-0 focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={45}>45</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 flex justify-center items-center bg-gray-50">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-primary font-medium">Loading items...</p>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-primary to-primary">
                  {fields.map((field) => (
                    <th
                      key={field.name}
                      className={`group px-8 py-5 text-left text-sm text-white uppercase tracking-wider ${
                        field.sortable
                          ? "cursor-pointer hover:bg-opacity-90 transition-all duration-200"
                          : ""
                      }`}
                      onClick={() => handleSort(field)}
                    >
                      <div className="flex items-center">
                        {field.label}
                        {renderSortIcon(field)}
                      </div>
                    </th>
                  ))}
                  <th className="px-8 py-5 text-right text-sm text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.length <= 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-secondary/100 bg-opacity-10 rounded-full flex items-center justify-center">
                          <FileText className="w-8 h-8 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-semibold text-gray-900">
                            {searchValue
                              ? "No matching results found"
                              : "No items available"}
                          </p>
                          <p className="text-sm text-gray-500 max-w-sm mx-auto">
                            {searchValue
                              ? "Try adjusting your search terms to find what you're looking for"
                              : "Get started by adding your first item to see it appear here"}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.itcd}
                      className={`group transition-all duration-200 ${
                        hoveredRow === item.itcd
                          ? "bg-secondary shadow-sm"
                          : "hover:bg-secondary"
                      }`}
                      onMouseEnter={() => setHoveredRow(item.itcd)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td className="px-8 py-4 whitespace-nowrap text-md font-medium text-primary">
                        <div className="flex items-center">
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-semibold">
                            {item.itcd}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-md font-medium text-primary">
                        <div className="flex items-center">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {item.item}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-md font-medium text-primary">
                        <div className="flex items-center">
                          <span className="text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                            {item.code}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-md font-medium text-primary">
                        <div className="flex items-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-sm font-medium">
                            {item.unit}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-right text-md font-medium">
                        <div className="flex justify-end space-x-1">
                          <button
                            onClick={() =>
                              router.push(
                                `/accounting/forms/items/${item.itcd}`
                              )
                            }
                            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 hover:scale-105 shadow-sm"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.itcd)}
                            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 hover:scale-105 shadow-sm"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Enhanced Pagination */}
        {pagination && pagination.total > 0 && (
          <div className="px-8 py-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} results
                </span>
              </div>

              <div className="flex items-center space-x-1">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-l-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex">
                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium border-t border-b border-r transition-all duration-200 ${
                        pageNum === pagination.page
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 shadow-sm"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-r-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                >
                  Next
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

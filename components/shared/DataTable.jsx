import { useState, useEffect } from "react";
import {
  Pencil,
  Trash2,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileText,
  Filter,
} from "lucide-react";
import LoadingSpinner from "../Setups/spinner";

const DataTable = ({
  data = [],
  fields = [],
  tableFields = [],
  onEdit = () => {},
  onDelete = () => {},
  loading = false,
  pagination = null,
  onPaginationChange = () => {},
  onSearchChange = () => {},
  onSortChange = () => {},
  searchValue = "",
  sortField = "",
  sortOrder = "asc",
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);

  const displayFields = tableFields || fields;
  console.log("Display Fields:", displayFields);

  // Debounce search input
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (localSearchValue !== searchValue) {
        onSearchChange(localSearchValue);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [localSearchValue, searchValue, onSearchChange]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleSort = (field) => {
    if (!field.sortable) return;

    const newSortOrder =
      sortField === field.name && sortOrder === "asc" ? "desc" : "asc";
    onSortChange(field.name, newSortOrder);
  };

  const handlePageChange = (newPage) => {
    if (pagination && newPage >= 1 && newPage <= pagination.pages) {
      onPaginationChange(newPage, pagination.limit);
    }
  };

  const getPageNumbers = () => {
    if (!pagination) return [];

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

  console.log("DataTable", data, fields, loading);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Enhanced Search Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <input
              type="text"
              placeholder="Search data..."
              value={localSearchValue}
              onChange={(e) => setLocalSearchValue(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            />
          </div>

          {/* Page Size Selector */}
          {pagination && (
            <div className="flex items-center space-x-3 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-200">
              <Filter className="h-4 w-4 text-primary" />
              <label className="text-sm font-medium text-primary">Show:</label>
              <select
                value={pagination.limit}
                onChange={(e) =>
                  onPaginationChange(1, parseInt(e.target.value))
                }
                className="border-0 bg-transparent text-sm font-medium text-primary focus:ring-0 focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={45}>45</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-24 flex justify-center items-center bg-gray-50">
            <LoadingSpinner
              variant="pulse"
              size="default"
              fullscreen={false}
              text="Loading data..."
            />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-primary to-primary">
                {displayFields.map((field) => (
                  <th
                    key={field.label || field.name}
                    className={`group px-8 py-5 text-left text-sm text-white uppercase tracking-wider ${
                      field.sortable
                        ? "cursor-pointer hover:bg-opacity-90 text-white transition-all duration-200"
                        : ""
                    }`}
                    onClick={() => handleSort(field)}
                  >
                    <div className="flex items-center">
                      {field.label || field.name}
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
              {data.length <= 0 ? (
                <tr>
                  <td
                    colSpan={fields.length + 1}
                    className="px-8 py-16 text-center"
                  >
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 bg-secondary/100 bg-opacity-10 rounded-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-gray-900">
                          {localSearchValue
                            ? "No matching results found"
                            : "No data available"}
                        </p>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto">
                          {localSearchValue
                            ? "Try adjusting your search terms to find what you're looking for"
                            : "Get started by adding your first item to see it appear here"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.length > 0 &&
                data?.map((item, index) => (
                  <tr
                    key={item.id || Math.random().toString(36)}
                    className={`group transition-all duration-200 ${
                      hoveredRow === item.id
                        ? "bg-secondary shadow-sm"
                        : "hover:bg-secondary"
                    }`}
                    onMouseEnter={() => setHoveredRow(item.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {displayFields?.map((field) => {
                      let cellContent = "";
                      try {
                        if (field.fieldType === "date" && item[field.name]) {
                          cellContent = formatDate(item[field.name]);
                        } else if (field.relationName && item[field.relation]) {
                          cellContent =
                            item[field.relation][field.relationName] || "";
                        } else {
                          cellContent = item[field.name] || "";
                        }
                      } catch (e) {
                        cellContent = "";
                      }

                      return (
                        <td
                          key={field.label || field.name}
                          className="px-8 py-3 whitespace-nowrap text-md font-medium text-primary"
                        >
                          <div className="flex items-center">{cellContent}</div>
                        </td>
                      );
                    })}
                    <td className="px-8 py-3 whitespace-nowrap text-right text-md font-medium">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => onEdit(item)}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 hover:scale-105 shadow-sm"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(item.id || item.ccno)}
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
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
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
  );
};

export default DataTable;

"use client";

import { useEffect, useState, useCallback } from "react";
import DataTable from "./DataTable";
import AddModal from "./AddModal";
import EditModal from "./EditModal";
import axios from "axios";
import { Plus } from "lucide-react";

const EntityPageLayout = ({ title, endpoint, fields, buttonText = null }) => {
  const [items, setItems] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Search and sort states
  const [searchValue, setSearchValue] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Fetch data function with all filters
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (searchValue.trim()) {
        params.append("search", searchValue.trim());
      }

      if (sortField) {
        params.append("sortField", sortField);
        params.append("sortOrder", sortOrder);
      }

      const res = await axios.get(
        `/api/setup/${endpoint}?${params.toString()}`
      );

      if (res.data) {
        setItems(res.data.data || []);
        setPagination(res.data.pagination || null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setItems([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [endpoint, currentPage, limit, searchValue, sortField, sortOrder]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle pagination change
  const handlePaginationChange = (newPage, newLimit) => {
    setCurrentPage(newPage);
    setLimit(newLimit);
  };

  // Handle search change
  const handleSearchChange = (newSearchValue) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle sort change
  const handleSortChange = (newSortField, newSortOrder) => {
    setSortField(newSortField);
    setSortOrder(newSortOrder);
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleAddSubmit = async (formData) => {
    try {
      setLoading(true);
      await axios.post(`/api/setup/${endpoint}`, formData);
      setIsAddModalOpen(false);
      setCurrentPage(1);
      fetchData();
    } catch (error) {
      console.error("Error adding data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      setLoading(true);
      console.log("editingItem", editingItem);
      await axios.put(
        `/api/setup/${endpoint}/${editingItem.id || editingItem.ccno}`,
        formData
      );
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error("Error editing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        `Are you sure you want to delete this ${title
          .slice(0, -1)
          .toLowerCase()}?`
      )
    ) {
      try {
        setLoading(true);
        await axios.delete(`/api/setup/${endpoint}/${id}`);

        if (items.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchData();
        }
      } catch (error) {
        console.error("Error deleting data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6 lg:p-10">
        {/* Modern Header Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                {title}
              </h1>
              <p className="text-lg text-gray-600">
                Manage your {title.toLowerCase()} efficiently and effectively
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              disabled={loading}
              className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <div className="flex items-center space-x-3">
                <Plus
                  size={20}
                  className="transition-transform group-hover:rotate-90 duration-300"
                />
                <span>{buttonText || `Add ${title.slice(0, -1)}`}</span>
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={items}
          fields={fields}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
          searchValue={searchValue}
          sortField={sortField}
          sortOrder={sortOrder}
        />

        {isAddModalOpen && (
          <AddModal
            title={`Add ${title.slice(0, -1)}`}
            fields={fields}
            onSubmit={handleAddSubmit}
            onClose={() => setIsAddModalOpen(false)}
          />
        )}

        {editingItem && (
          <EditModal
            title={`Edit ${title.slice(0, -1)}`}
            fields={fields}
            initialData={editingItem}
            onSubmit={handleEditSubmit}
            onClose={() => setEditingItem(null)}
          />
        )}
      </div>
    </div>
  );
};

export default EntityPageLayout;

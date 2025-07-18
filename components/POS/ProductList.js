"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Edit3,
  DollarSign,
  Warehouse,
  Barcode,
  Grid3X3,
  List,
  ChevronDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  X,
  Menu,
} from "lucide-react";
import React from "react";
import Link from "next/link";
import axios from "axios";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 8,
    hasNext: false,
    hasPrev: false,
    startItem: 0,
    endItem: 0,
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const router = useRouter();
  const statuses = ["All", "active", "low_stock", "out_of_stock"];

  // Fetch products with pagination
  const fetchProducts = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        category: selectedCategory,
        status: selectedStatus,
        sortBy: sortBy,
        sortOrder: sortOrder,
      });

      const response = await axios.get(`/api/pos/products?${params}`);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/pos/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCategories();
    fetchProducts(1);
  }, []);

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts(1);
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder]);

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchProducts(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/pos/products/${id}`);
      fetchProducts(pagination.currentPage); // Refresh current page
      setDeleteConfirm(null);
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleView = (id) => {
    router.push(`/pos/products/${id}`);
  };

  const handleEdit = (id) => {
    router.push(`/pos/products/${id}`);
  };

  const addNewProduct = () => {
    router.push("/pos/products/create");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "low_stock":
        return "bg-yellow-100 text-yellow-800";
      case "out_of_stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-3 h-3" />;
      case "low_stock":
        return <AlertTriangle className="w-3 h-3" />;
      case "out_of_stock":
        return <X className="w-3 h-3" />;
      default:
        return <CheckCircle className="w-3 h-3" />;
    }
  };

  // Pagination component
  const PaginationComponent = () => {
    const {
      currentPage,
      totalPages,
      hasNext,
      hasPrev,
      startItem,
      endItem,
      totalCount,
    } = pagination;

    // Generate page numbers array
    const getPageNumbers = () => {
      const pages = [];
      const delta = 1; // Reduced for mobile

      // For mobile, show fewer pages
      const isMobile = window.innerWidth < 640;
      const maxPages = isMobile ? 3 : 5;

      if (totalPages <= maxPages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Always include first page
        if (currentPage - delta > 1) {
          pages.push(1);
          if (currentPage - delta > 2) {
            pages.push("...");
          }
        }

        // Add pages around current page
        for (
          let i = Math.max(1, currentPage - delta);
          i <= Math.min(totalPages, currentPage + delta);
          i++
        ) {
          pages.push(i);
        }

        // Always include last page
        if (currentPage + delta < totalPages) {
          if (currentPage + delta < totalPages - 1) {
            pages.push("...");
          }
          pages.push(totalPages);
        }
      }

      return pages;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl p-3 sm:p-4 lg:p-6 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Results info */}
          <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
            Showing {startItem} to {endItem} of {totalCount} products
          </div>

          {/* Pagination controls */}
          <div className="flex items-center justify-center space-x-1 order-1 sm:order-2">
            {/* Previous button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrev}
              className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg ${
                hasPrev
                  ? "bg-blue-50 hover:bg-blue-100 text-primary"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>

            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === "..." ? (
                    <span className="px-2 py-1 text-gray-400 text-sm">...</span>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePageChange(page)}
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-sm ${
                        page === currentPage
                          ? "bg-primary text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      {page}
                    </motion.button>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Next button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNext}
              className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg ${
                hasNext
                  ? "bg-blue-50 hover:bg-blue-100 text-primary"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl lg:rounded-2xl shadow-2xl p-6 lg:p-8 text-center max-w-sm w-full"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-4"
          >
            <RefreshCw className="w-full h-full text-blue-600" />
          </motion.div>
          <p className="text-gray-600 text-base lg:text-lg">
            Loading products...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full px-2 sm:px-4 lg:px-6 py-4 lg:py-6">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-xl lg:rounded-2xl shadow-lg lg:shadow-lg p-4 lg:p-6 mb-4 lg:mb-6"
        >
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            {/* Title section */}
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 lg:p-3 rounded-lg lg:rounded-xl">
                <Package className="text-white w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800">
                  Product Inventory
                </h1>
                <p className="text-sm lg:text-base text-gray-600 mt-0.5">
                  Manage your product catalog
                </p>
              </div>
            </div>

            {/* Stats and Add button */}
            <div className="flex items-center justify-between sm:justify-end space-x-4">
              <div className="bg-gray-50 p-3 rounded-lg lg:bg-transparent lg:p-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary text-center">
                  {pagination.totalCount}
                </div>
                <div className="text-xs lg:text-sm">Total Products</div>
              </div>
              <Link href="/pos/products/create">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-primary  text-white px-4 py-2.5 lg:px-4 lg:py-2 rounded-lg lg:rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="text-sm lg:text-base">Add Product</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl p-4 lg:p-6 mb-4 lg:mb-6"
        >
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 lg:py-3 border-2 border-gray-200 rounded-lg lg:rounded-xl focus:border-blue-500 focus:outline-none text-sm lg:text-base transition-colors"
              />
            </div>

            {/* Controls Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              {/* Left side controls */}
              <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                {/* Filter toggle */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-3 py-2 lg:px-4 lg:py-2.5 bg-gray-100 hover:bg-primary hover:text-white rounded-lg transition-colors text-sm lg:text-base"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </motion.button>

                {/* Sort dropdown */}
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="px-3 py-2 lg:px-4 lg:py-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm lg:text-base bg-white"
                >
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="price-asc">Price Low-High</option>
                  <option value="price-desc">Price High-Low</option>
                  <option value="stock-asc">Stock Low-High</option>
                  <option value="stock-desc">Stock High-Low</option>
                </select>
              </div>

              {/* View toggle */}
              {/* View toggle (Only on md and larger screens) */}
              <div className="hidden md:flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <List className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Category filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm lg:text-base"
                        >
                          <option value="All">All Categories</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.ic_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Status filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm lg:text-base"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status === "All"
                                ? "All Status"
                                : status
                                    .replace("_", " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Products Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`mb-6 ${
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
              : "space-y-3"
          }`}
        >
          <AnimatePresence>
            {products.map((product, index) => (
              <motion.div
                key={product.itcd}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: viewMode === "grid" ? 1.02 : 1 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {viewMode === "grid" ? (
                  /* Grid View */
                  <div className="p-4">
                    <div className="space-y-3">
                      {/* Product Image */}
                      <div className="relative">
                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                          {product.image_url ? (
                            <Image
                              src={`/api/pos/products/uploads${product.image_url}`}
                              alt={product.item}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Package className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        {/* Status Badge */}
                        <div
                          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                            product.sync_status
                          )}`}
                        >
                          {getStatusIcon(product.sync_status)}
                          <span className="hidden sm:inline">
                            {product.sync_status.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-800 text-sm lg:text-base line-clamp-2">
                          {product.item}
                        </h3>
                        <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-600">
                          <Barcode className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span className="font-mono truncate">
                            {product.sku}
                          </span>
                        </div>
                      </div>

                      {/* Price and Stock */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-green-600">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-bold text-sm lg:text-base">
                            {product.price ? product.price.toFixed(2) : "0.00"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-blue-600">
                          <Warehouse className="w-4 h-4" />
                          <span className="font-medium text-sm lg:text-base">
                            {product.stock || 0}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className=" py-1 flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleView(product.itcd)}
                          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(product.itcd)}
                          className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1"
                        >
                          <Edit3 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setDeleteConfirm(product.itcd)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3 rounded-lg font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* List View */
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {product.image_url ? (
                          <Image
                            src={`/api/pos/products/uploads${product.image_url}`}
                            alt={product.item}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-800 text-sm lg:text-base truncate">
                              {product.item}
                            </h3>
                            <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-600 mt-1">
                              <Barcode className="w-3 h-3 lg:w-4 lg:h-4" />
                              <span className="font-mono truncate">
                                {product.sku}
                              </span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                              product.sync_status
                            )}`}
                          >
                            {getStatusIcon(product.sync_status)}
                            <span>{product.sync_status.replace("_", " ")}</span>
                          </div>
                        </div>

                        {/* Price, Stock, and Actions */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1 text-green-600">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-bold text-sm lg:text-base">
                                {product.price
                                  ? product.price.toFixed(2)
                                  : "0.00"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 text-blue-600">
                              <Warehouse className="w-4 h-4" />
                              <span className="font-medium text-sm lg:text-base">
                                {product.stock || 0}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-1">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleView(product.itcd)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEdit(product.itcd)}
                              className="bg-green-50 hover:bg-green-100 text-green-600 p-2 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setDeleteConfirm(product.itcd)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Pagination */}
        <PaginationComponent />

        {/* Optional Delete Confirmation */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Confirm Deletion
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete this product? This action
                  cannot be undone.
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductList;

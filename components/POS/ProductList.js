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
  SortAsc,
  SortDesc,
  AlertTriangle,
  CheckCircle,
  X,
  ChevronDown,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";
import React from "react";
import Link from "next/link";
import axios from "axios";

// Mock data for demonstration
const mockProducts = [
  {
    itcd: "001",
    item: "Premium Coffee Beans 1kg",
    sku: "COF-001-1KG",
    price: 24.99,
    stock: 45,
    category: "Beverages",
    status: "active",
    image: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=Coffee",
  },
  {
    itcd: "002",
    item: "Wireless Bluetooth Headphones",
    sku: "ELE-002-WBH",
    price: 89.99,
    stock: 12,
    category: "Electronics",
    status: "low_stock",
    image: "https://via.placeholder.com/150x150/059669/FFFFFF?text=Audio",
  },
  {
    itcd: "003",
    item: "Organic Honey 500ml",
    sku: "FOD-003-HON",
    price: 15.5,
    stock: 0,
    category: "Food",
    status: "out_of_stock",
    image: "https://via.placeholder.com/150x150/DC2626/FFFFFF?text=Honey",
  },
  {
    itcd: "004",
    item: "Yoga Mat Premium",
    sku: "FIT-004-YOG",
    price: 32.0,
    stock: 28,
    category: "Fitness",
    status: "active",
    image: "https://via.placeholder.com/150x150/7C3AED/FFFFFF?text=Yoga",
  },
  {
    itcd: "005",
    item: "Smart Water Bottle",
    sku: "GAD-005-SWB",
    price: 45.99,
    stock: 8,
    category: "Gadgets",
    status: "low_stock",
    image: "https://via.placeholder.com/150x150/0891B2/FFFFFF?text=Bottle",
  },
  {
    itcd: "006",
    item: "Artisan Chocolate Box",
    sku: "FOD-006-CHO",
    price: 28.75,
    stock: 35,
    category: "Food",
    status: "active",
    image: "https://via.placeholder.com/150x150/92400E/FFFFFF?text=Choco",
  },
];

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const router = useRouter();


  const statuses = ["All", "active", "low_stock", "out_of_stock"];

  const fetchProducts = () => {
axios
      .get("/api/pos/products")
      .then((res) => {
        setProducts(res.data);
        setFilteredProducts(res.data); // use res.data, not products
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setIsLoading(false); // Ensure loading state is reset on error too
      });
  }

    const fetchCategories = () => {
axios
      .get("/api/pos/categories")
      .then((res) => {
        setCategories(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setIsLoading(false); // Ensure loading state is reset on error too
      });
  }

  useEffect(() => {
    setIsLoading(true);
    fetchProducts();
    fetchCategories();
    
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        product.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" ||
        product.ic_id === parseInt(selectedCategory);
      const matchesStatus =
        selectedStatus === "All" || product.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.item.toLowerCase();
          bValue = b.item.toLowerCase();
          break;
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "stock":
          aValue = a.stock;
          bValue = b.stock;
          break;
        default:
          aValue = a.item.toLowerCase();
          bValue = b.item.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  }, [
    products,
    searchTerm,
    selectedCategory,
    selectedStatus,
    sortBy,
    sortOrder,
  ]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/pos/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.itcd !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete product");
    }
  };
  const handleView = (id) => {
    router.push(`/pos/products/${id}`);
    // console.log('View product:', id);
  };

  const handleEdit = (id) => {
    router.push(`/pos/products/${id}`);
    console.log("Edit product:", id);
  };

  const addNewProduct = () => {
    // router.push('/pos/products/new');
    console.log("Add new product");
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 mx-auto mb-4"
          >
            <RefreshCw className="w-12 h-12 text-blue-600" />
          </motion.div>
          <p className="text-gray-600 text-lg">Loading products...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                <Package className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Product Inventory
                </h1>
                <p className="text-gray-600">Manage your product catalog</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredProducts.length}
                </div>
                <div className="text-sm text-gray-500">Products</div>
              </div>
              <Link href="/pos/products/create">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addNewProduct}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Product</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
              />
            </div>

            {/* Filters and View Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </motion.button>

                {/* Sort Options */}
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="price-asc">Price Low-High</option>
                  <option value="price-desc">Price High-Low</option>
                  <option value="stock-asc">Stock Low-High</option>
                  <option value="stock-desc">Stock High-Low</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  <List className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Filter Options */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-wrap gap-4 pt-4 border-t border-gray-200"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option key="All" value="All">
                        All
                      </option>

                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.ic_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Products Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          <AnimatePresence>
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.itcd}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                  viewMode === "list" ? "p-6" : "p-4"
                }`}
              >
                {viewMode === "grid" ? (
                  // Grid View
                  <div className="space-y-4 flex flex-col h-full justify-between">
                    <div className="relative">
                      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden relative">
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
                      <div
                        className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                          product.status
                        )}`}
                      >
                        {getStatusIcon(product.status)}
                        <span>{product.sync_status.replace("_", " ")}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-800 line-clamp-2">
                        {product.item}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Barcode className="w-4 h-4" />
                        <span className="font-mono">{product.sku}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-green-600">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-bold">
                            {product.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-blue-600">
                          <Warehouse className="w-4 h-4" />
                          <span className="font-medium">{product.stock}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleView(product.itcd)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(product.itcd)}
                        className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
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
                ) : (
                  // List View
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden relative flex-shrink-0">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.item}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-gray-800">
                            {product.item}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Barcode className="w-4 h-4" />
                              <span className="font-mono">{product.sku}</span>
                            </div>
                            <span className="text-blue-600 font-medium">
                              {product.category}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                            product.status
                          )}`}
                        >
                          {getStatusIcon(product.status)}
                          <span>{product.sync_status.replace("_", " ")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-8">
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-green-600">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-bold text-lg">
                            {product.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">Price</div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-blue-600">
                          <Warehouse className="w-4 h-4" />
                          <span className="font-bold text-lg">
                            {product.stock}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">Stock</div>
                      </div>
                      <div className="flex space-x-2">
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
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredProducts.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center"
          >
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ||
              selectedCategory !== "All" ||
              selectedStatus !== "All"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first product"}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addNewProduct}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Add Product</span>
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              <div className="text-center">
                <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4">
                  <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Delete Product
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this product? This action
                  cannot be undone.
                </p>
                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductList;

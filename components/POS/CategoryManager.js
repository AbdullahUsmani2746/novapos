"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  Edit3,
  Trash2,
  Plus,
  Search,
  Grid3X3,
  List,
  Filter,
  Package,
  ChevronRight,
  MoreVertical,
  Eye,
} from "lucide-react";
import React from "react";
import axios from "axios";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const router = useRouter();

  useEffect(() => {
    axios
      .get("/api/pos/categories")
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);
  const filteredCategories =
    categories.length > 0 &&
    categories.filter(
      (category) =>
        category.ic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.mainCategory.mc_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

  const handleDelete = async (id, categoryName) => {
    if (
      !confirm(
        `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      // await fetch(`/pos/api/categories/${id}`, { method: 'DELETE' });
      setCategories(
        categories.length > 0 && categories.filter((c) => c.id !== id)
      );
      toast.success("Category deleted successfully");
    } catch (error) {
      toast.error("Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
    exit: {
      y: -20,
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  const CategoryCard = ({ category }) => (
    <motion.div
      variants={itemVariants}
      layout
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group"
    >
      <Card className="w-full min-w-[200px] h-full relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl backdrop-blur-sm ">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Header with icon */}
        <div className="relative p-5">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center space-x-4">
              {/* <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <Package className="w-5 h-5 text-primary" />
            </div> */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary transition-colors ">
                  {category.ic_name}
                </h3>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                  {category.mainCategory.mc_name}
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-lg"
            >
              <MoreVertical className="w-4 h-4 text-primary" />
            </motion.button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-gray-600 flex items-center">
              <Package className="w-4 h-4 mr-1" />
              {category.itemCount} items
            </div>
            <ChevronRight className="w-4 h-4 text-primary transition-colors" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="relative px-5 pb-5 pt-2">
          <div className="flex gap-2">
            <Button
              onClick={() => router.push(`/pos/categories/${category.id}`)}
              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:shadow-lg transition-all duration-200"
              size="sm"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => router.push(`/pos/categories/${category.id}/edit`)}
              variant="outline"
              className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 border-0 transition-all duration-200"
              size="sm"
            >
              <Edit3 className="w-4 h-4 text-green-600" />
            </Button>
            <Button
              onClick={() => handleDelete(category.id, category.ic_name)}
              variant="outline"
              className="bg-red-50 hover:bg-red-100 text-red-600 border-0 transition-all duration-200"
              size="sm"
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const CategoryListItem = ({ category }) => (
    <motion.div
      variants={itemVariants}
      layout
      whileHover={{ x: 4 }}
      className="group"
    >
      <Card className="p-4 bg-white backdrop-blur-sm border-0 shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {category.ic_name}
              </h3>
              <p className="text-sm text-gray-500">
                {category.mainCategory.mc_name} • {category.itemCount} items
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => router.push(`/pos/categories/${category.id}`)}
              variant="ghost"
              size="sm"
              className="hover:bg-primary"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => router.push(`/pos/categories/${category.id}/edit`)}
              variant="ghost"
              size="sm"
              className="hover:bg-primary"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleDelete(category.id, category.ic_name)}
              variant="ghost"
              size="sm"
              className="hover:bg-primary text-red-600"
              disabled={loading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-xl lg:rounded-2xl shadow-lg lg:shadow-lg mb-2 sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Category Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your product categories and inventory
              </p>
            </div>
            <Button
              onClick={() => router.push("/pos/categories/create")}
              className="bg-primary  text-white px-4 py-2.5 lg:px-4 lg:py-2 rounded-lg lg:rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
              Add Category
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5 z-10" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white backdrop-blur-sm border border-gray-200 rounded-xl transition-all duration-200"
              />
            </div>
          </div>

          {/* View toggle */}
          <div className="flex bg-white backdrop-blur-sm rounded-xl border border-gray-200 p-2">
            <Button
              onClick={() => setViewMode("grid")}
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className={viewMode === "grid" ? "bg-primary text-white" : ""}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setViewMode("list")}
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className={viewMode === "list" ? "bg-primary text-white" : ""}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Categories */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-3"
          }
        >
          <AnimatePresence mode="popLayout">
            {filteredCategories.length > 0 &&
              filteredCategories.map((category) =>
                viewMode === "grid" ? (
                  
                  <CategoryCard key={category.id} category={category} />
                 
                ) : (
                  <CategoryListItem key={category.id} category={category} />
                )
              )}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filteredCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No categories found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Get started by creating your first category"}
            </p>
            <Button
              onClick={() => router.push("/pos/categories/create")}
              className="bg-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Category
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default CategoryManager;

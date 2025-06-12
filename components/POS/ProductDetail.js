"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Edit3,
  Save,
  ArrowLeft,
  DollarSign,
  Hash,
  Barcode,
  Tag,
  Warehouse,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  X,
  FileText,
  ImageIcon,
} from "lucide-react";
import React from "react";
import Image from "next/image";
import axios from "axios";

const ProductDetail = ({ productId}) => {
  const [product, setProduct] = useState([]);
  const [form, setForm] = useState({
    item: "",
    ic_id: "",
    sku: "",
    price: "",
    stock: "",
    description: "",
  });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  
  const fileInputRef = useRef(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch product by ID
        const productRes = await axios.get(`/api/pos/products/${productId}`);
        const productData = productRes.data;

        // Set product data
        setProduct(productData);
        setForm({
          item: productData.item,
          ic_id: productData.ic_id,
          sku: productData.sku,
          price: productData.price.toString(),
          stock: productData.stock.toString(),
          description: productData.description || "",
        });

        setImagePreview(productData.image_url);


        // Fetch categories
        const categoriesRes = await axios.get("/api/pos/categories");
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchData();
    }
  }, [productId]);

  const validateForm = () => {
    const newErrors = {};

    if (!form.item.trim()) newErrors.item = "Product name is required";
    if (!form.ic_id) newErrors.ic_id = "Category is required";
    if (!form.sku.trim()) newErrors.sku = "SKU is required";
    if (!form.price || parseFloat(form.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!form.stock || parseInt(form.stock) < 0)
      newErrors.stock = "Valid stock quantity is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ ...errors, image: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)' });
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image size must be less than 5MB' });
        return;
      }

      setSelectedImage(file);
      setRemoveImage(false);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Clear any image errors
      if (errors.image) {
        const newErrors = { ...errors };
        delete newErrors.image;
        setErrors(newErrors);
      }
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setSaveStatus(null);

    try {
      let response;
      
      // Check if we have an image to upload or need to remove image
      if (selectedImage || removeImage) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append('item', form.item);
        formData.append('ic_id', form.ic_id);
        formData.append('sku', form.sku);
        formData.append('price', form.price);
        formData.append('stock', form.stock);
        formData.append('description', form.description);
        
        if (selectedImage) {
          formData.append('image', selectedImage);
        }
        
        if (removeImage) {
          formData.append('deleteImage', 'true');
        }

        response = await fetch(`/api/pos/products/${productId}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        // Use JSON for text-only updates
        const payload = {
          ...form,
          ic_id: parseInt(form.ic_id),
          price: parseFloat(form.price),
          stock: parseInt(form.stock),
        };

        response = await fetch(`/api/pos/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        const result = await response.json();
        setSaveStatus("success");
        
        // Update local product state if API returns updated product
        if (result.data) {
          setProduct(result.data);
          if (result.data.image_url) {
            setImagePreview(result.data.image_url);
          }
        }
        
        // Reset file selection states
        setSelectedImage(null);
        setRemoveImage(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const errorData = await response.json();
        setSaveStatus("error");
        console.error('Update failed:', errorData);
      }

      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error("API Error:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const goBack = () => {
    console.log("Navigate back to products");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 text-lg">Loading product details...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goBack}
                className="bg-gray-100 hover:bg-gray-200 p-3 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </motion.button>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                <Edit3 className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Edit Product
                </h1>
                <p className="text-gray-600">Update product information</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Product ID</div>
              <div className="font-mono text-lg font-semibold text-blue-600">
                #{productId}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Product Preview */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Product Preview
              </h3>
              <div className="space-y-4">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt={form.item || "Product"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Package className="w-16 h-16 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-500">No Image</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Name</div>
                    <div className="font-semibold text-gray-800">
                      {form.item || "Product Name"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">SKU</div>
                    <div className="font-mono text-sm text-blue-600">
                      {form.sku || "SKU-CODE"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Description</div>
                    <div className="text-sm text-gray-700 line-clamp-3">
                      {form.description || "No description"}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Price</div>
                      <div className="text-xl font-bold text-green-600">
                        ${form.price || "0.00"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Stock</div>
                      <div className="text-xl font-bold text-blue-600">
                        {form.stock || "0"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="space-y-6">
                {/* Image Upload */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="relative"
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <ImageIcon className="w-4 h-4 inline mr-2" />
                    Product Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                    {imagePreview ? (
                      <div className="relative">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-xl mx-auto mb-4"
                          width={128}
                          height={128}
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-4">
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-2">Click to upload image</p>
                        <p className="text-sm text-gray-400">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  {errors.image && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-1 flex items-center"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.image}
                    </motion.p>
                  )}
                </motion.div>

                {/* Product Name */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Package className="w-4 h-4 inline mr-2" />
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={form.item}
                    onChange={(e) => handleInputChange("item", e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                      errors.item
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    }`}
                    placeholder="Enter product name"
                  />
                  {errors.item && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-1 flex items-center"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.item}
                    </motion.p>
                  )}
                </motion.div>

                {/* Description */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all resize-none ${
                      errors.description
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    }`}
                    placeholder="Enter product description (optional)"
                  />
                  {errors.description && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-1 flex items-center"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.description}
                    </motion.p>
                  )}
                </motion.div>

                {/* Category */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Category
                  </label>
                  <select
                    value={form.ic_id}
                    onChange={(e) => handleInputChange("ic_id", e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                      errors.ic_id
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    }`}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.ic_name}
                      </option>
                    ))}
                  </select>
                  {errors.ic_id && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-1 flex items-center"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.ic_id}
                    </motion.p>
                  )}
                </motion.div>

                {/* SKU */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Barcode className="w-4 h-4 inline mr-2" />
                    SKU (Stock Keeping Unit)
                  </label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => handleInputChange("sku", e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-mono ${
                      errors.sku
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    }`}
                    placeholder="Enter SKU code"
                  />
                  {errors.sku && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-1 flex items-center"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.sku}
                    </motion.p>
                  )}
                </motion.div>

                {/* Price and Stock Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Price */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-2" />
                      Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                          errors.price
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-blue-500"
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.price && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1 flex items-center"
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.price}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Stock */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.0 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Warehouse className="w-4 h-4 inline mr-2" />
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) => handleInputChange("stock", e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                        errors.stock
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-blue-500"
                      }`}
                      placeholder="0"
                    />
                    {errors.stock && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1 flex items-center"
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.stock}
                      </motion.p>
                    )}
                  </motion.div>
                </div>

                {/* Save Button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="pt-6 border-t border-gray-200"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                      isSaving
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    } text-white flex items-center justify-center space-x-3`}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-6 h-6" />
                        <span>Save Product</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Save Status Toast */}
        <AnimatePresence>
          {saveStatus && (
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.8 }}
              className="fixed bottom-8 right-8 z-50"
            >
              <div
                className={`px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 ${
                  saveStatus === "success"
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {saveStatus === "success" ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <AlertCircle className="w-6 h-6" />
                )}
                <span className="font-semibold">
                  {saveStatus === "success"
                    ? "Product updated successfully!"
                    : "Failed to update product. Please try again."}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductDetail;
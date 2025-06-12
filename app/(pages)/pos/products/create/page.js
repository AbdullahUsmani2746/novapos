"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  Package,
  Tag,
  DollarSign,
  Archive,
  ArrowLeft,
  Save,
  Loader2,
  Barcode,
  AlertCircle,
  CheckCircle2,
  Upload,
  Image,
  X,
  Camera,
} from "lucide-react";
import React from "react";
import axios from "axios";

const CreateProduct = () => {
  const [form, setForm] = useState({
    item: "",
    ic_id: "",
    sku: "",
    price: "",
    stock: "",
    description: "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try{
        const response = await axios.get("/api/pos/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!form.item.trim()) newErrors.item = "Product name is required";
    if (!form.ic_id) newErrors.ic_id = "Category is required";
    if (!form.sku.trim()) newErrors.sku = "SKU is required";
    if (!form.price || parseFloat(form.price) <= 0)
      newErrors.price = "Price must be greater than 0";
    if (!form.stock || parseInt(form.stock) < 0)
      newErrors.stock = "Stock must be 0 or greater";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateSKU = () => {
    const prefix = form.item.substring(0, 3).toUpperCase() || "PRD";
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}${random}${timestamp}`;
  };

  const handleImageSelect = (event) => {
    setImageUploading(true);
    setImagePreview(null);
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setImageUploading(false);

      };
      reader.readAsDataURL(file);

    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    try {
      // Create FormData to handle both data and image
      const formData = new FormData();
      
      // Append form data
      formData.append('item', form.item);
      formData.append('ic_id', form.ic_id);
      formData.append('sku', form.sku);
      formData.append('price', form.price);
      formData.append('stock', form.stock);
      
      if (form.description) {
        formData.append('description', form.description);
      }
      
      // Append image if selected
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await axios.post("/api/pos/products", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        toast.success(response.data.message || "Product created successfully!");
        router.push("/pos/products");
      } else {
        toast.error(response.data.error || "Failed to create product");
      }
    } catch (error) {
      console.error(error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error creating product");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                size="sm"
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Create New Product
                </h1>
                <p className="text-gray-600 mt-1">
                  Add a new product to your inventory
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <Package className="w-4 h-4" />
                <span>Product Management</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="p-8">
              {/* Progress indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600">
                    Product Information
                  </span>
                  <span className="text-sm text-gray-500">
                    Fill in the details below
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Image Upload */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <Image className="w-4 h-4 mr-2 text-gray-500" />
                    Product Image
                  </Label>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Image Preview */}
                    <div className="flex-1">
                      {imagePreview ? (
                        <div className="relative group">
                          <div className="aspect-square w-full max-w-xs mx-auto bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                            <img
                              src={imagePreview}
                              alt="Product preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={removeImage}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="aspect-square w-full max-w-xs mx-auto bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors duration-200"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera className="w-12 h-12 text-gray-400 mb-4" />
                          <p className="text-sm text-gray-500 text-center">
                            Click to upload image
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex flex-col gap-2 justify-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                        disabled={loading}
                      >
                        <Upload className="w-4 h-4" />
                        {selectedImage ? 'Change Image' : 'Upload Image'}
                      </Button>
                      
                      {selectedImage && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={removeImage}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                          Remove Image
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="item" className="text-sm font-medium text-gray-700 flex items-center">
                      <Package className="w-4 h-4 mr-2 text-gray-500" />
                      Product Name
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="item"
                        type="text"
                        value={form.item}
                        onChange={(e) => setForm({ ...form, item: e.target.value })}
                        placeholder="Enter product name"
                        className={`pl-10 transition-all duration-200 ${
                          errors.item
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                        }`}
                      />
                      <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    {errors.item && (
                      <div className="flex items-center text-red-500 text-xs mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.item}
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-gray-500" />
                      Category
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select onValueChange={(value) => setForm({ ...form, ic_id: value })}>
                      <SelectTrigger
                        className={`transition-all duration-200 ${
                          errors.ic_id
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-blue-500"
                        }`}
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.ic_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.ic_id && (
                      <div className="flex items-center text-red-500 text-xs mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.ic_id}
                      </div>
                    )}
                  </div>

                  {/* SKU */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700 flex items-center">
                        <Barcode className="w-4 h-4 mr-2 text-gray-500" />
                        SKU
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setForm({ ...form, sku: generateSKU() })}
                        className="text-xs hover:bg-blue-50 text-blue-600"
                      >
                        Generate
                      </Button>
                    </div>
                    <Input
                      id="sku"
                      type="text"
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      placeholder="Product SKU"
                      className={`transition-all duration-200 ${
                        errors.sku
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                    />
                    {errors.sku && (
                      <div className="flex items-center text-red-500 text-xs mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.sku}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium text-gray-700 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                      Price
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        placeholder="0.00"
                        className={`pl-10 transition-all duration-200 ${
                          errors.price
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                        }`}
                      />
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    {errors.price && (
                      <div className="flex items-center text-red-500 text-xs mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.price}
                      </div>
                    )}
                  </div>

                  {/* Stock */}
                  <div className="space-y-2">
                    <Label htmlFor="stock" className="text-sm font-medium text-gray-700 flex items-center">
                      <Archive className="w-4 h-4 mr-2 text-gray-500" />
                      Initial Stock
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                        placeholder="0"
                        className={`pl-10 transition-all duration-200 ${
                          errors.stock
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                        }`}
                      />
                      <Archive className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    {errors.stock && (
                      <div className="flex items-center text-red-500 text-xs mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.stock}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Description (Optional)
                    </Label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Enter product description..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || imageUploading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Product...
                      </>
                    ) : imageUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Uploading Image...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Create Product
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </Card>

          {/* Helper Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6"
          >
            <Card className="bg-blue-50/50 backdrop-blur-sm border border-blue-200/50">
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Quick Tips
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Use descriptive product names for better searchability</li>
                      <li>• SKU should be unique across your entire inventory</li>
                      <li>• Upload high-quality images (recommended: 800x800px)</li>
                      <li>• Set realistic initial stock levels</li>
                      <li>• Double-check pricing before creating the product</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateProduct;

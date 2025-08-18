"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import { 
  Plus, 
  Tag, 
  Folder, 
  ArrowLeft,
  Save,
  Loader2,
  FolderPlus,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Hash,
  Grid3X3,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp
} from 'lucide-react';
import React from 'react';

const CreateCategory = () => {
  const [form, setForm] = useState({ 
    ic_name: '', 
    description: '',
    stock_acno: '',
    sale_acno: '',
    pos_acno: '',
    cogs_acno: ''
  });
  
  const [mainCategories, setMainCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  // Fetch accounts on component mount
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const response = await axios.get('/api/accounts/macno');
        if (response.data) {
          setAccounts(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
        toast.error('Failed to load accounts');
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.ic_name.trim()) newErrors.ic_name = 'Category name is required';
    if (form.ic_name.length < 2) newErrors.ic_name = 'Category name must be at least 2 characters';
    if (!form.stock_acno) newErrors.stock_acno = 'Stock account is required';
    if (!form.sale_acno) newErrors.sale_acno = 'Sales account is required';
    if (!form.pos_acno) newErrors.pos_acno = 'POS account is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateCategoryName = () => {
    const suggestions = [
      'Electronics & Gadgets',
      'Home & Kitchen',
      'Sports & Outdoors',
      'Health & Beauty',
      'Automotive',
      'Office Supplies',
      'Pet Supplies',
      'Garden & Outdoor'
    ];
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setForm({ ...form, ic_name: randomSuggestion });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/pos/categories', {
        ic_name: form.ic_name,
        stock_acno: parseInt(form.stock_acno),
        sale_acno: parseInt(form.sale_acno),
        pos_acno: parseInt(form.pos_acno),
        cogs_acno: form.cogs_acno ? parseInt(form.cogs_acno) : null
      });
      
      if (response.data) {
        toast.success('Category created successfully!');
        router.push('/pos/categories');
      } else {
        toast.error('Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Error creating category');
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2 }
    }
  };

  const InputField = ({ 
    id, 
    label, 
    type = "text", 
    value, 
    onChange, 
    placeholder, 
    icon: Icon, 
    error, 
    required = false,
    ...props 
  }) => (
    <motion.div variants={itemVariants} className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700 flex items-center">
        {Icon && <Icon className="w-4 h-4 mr-2 text-gray-500" />}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`transition-all duration-200 ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
          } ${Icon ? 'pl-10' : ''}`}
          {...props}
        />
        {Icon && (
          <Icon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
            error ? 'text-red-400' : 'text-gray-400'
          }`} />
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-6 left-0 flex items-center text-red-500 text-xs"
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            {error}
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  const   SelectField = ({ 
    id, 
    label, 
    value, 
    onValueChange, 
    placeholder, 
    icon: Icon, 
    error, 
    required = false,
    options = [],
    loading = false,
    ...props 
  }) => (
    <motion.div variants={itemVariants} className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700 flex items-center">
        {Icon && <Icon className="w-4 h-4 mr-2 text-gray-500" />}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Select value={value} onValueChange={onValueChange} disabled={loading}>
          <SelectTrigger 
            className={`transition-all duration-200 ${
              error 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
            }`}
          >
            <SelectValue placeholder={loading ? "Loading..." : placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.macno} value={option.macno}>
                {option.macname || option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-6 left-0 flex items-center text-red-500 text-xs"
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            {error}
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  return (
  <div className="min-h-screen">
  {/* Header */}
  <motion.div
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="bg-white rounded-none sm:rounded-xl shadow-md sticky top-0 z-20"
  >
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="icon"
            className="hover:bg-primary rounded-md"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create New Category</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Add a new category to organize your products
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
          <FolderPlus className="w-4 h-4" />
          <span>Category Management</span>
        </div>
      </div>
    </div>
  </motion.div>

  {/* Main Content */}
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl">
        <div className="p-4 sm:p-8">
          {/* Progress */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <span className="text-sm font-medium text-gray-600">Category Information</span>
              <span className="text-xs sm:text-sm text-gray-500">Fill in the details below</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <motion.div
              variants={formVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
            >
              {/* Category Name */}
              <motion.div variants={itemVariants} className="md:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <Tag className="w-4 h-4 mr-2 text-gray-500" />
                    Category Name
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateCategoryName}
                    className="text-xs hover:bg-primary text-blue-600"
                  >
                    <Lightbulb className="w-3 h-3 mr-1" />
                    Suggest
                  </Button>
                </div>
                <InputField
                  id="ic_name"
                  value={form.ic_name}
                  onChange={(e) => setForm({ ...form, ic_name: e.target.value })}
                  placeholder="Enter category name (e.g., Electronics, Clothing)"
                  error={errors.ic_name}
                  required
                />
              </motion.div>

              {/* Main Category */}
              {/* Stock Account */}
              <SelectField
                id="stock_acno"
                label="Stock Account"
                value={form.stock_acno}
                onValueChange={(value) => setForm({ ...form, stock_acno: value })}
                placeholder="Select stock account"
                icon={Package}
                error={errors.stock_acno}
                required
                options={accounts}
                loading={loadingAccounts}
              />

              {/* Sales Account */}
              <SelectField
                id="sale_acno"
                label="Sales Account"
                value={form.sale_acno}
                onValueChange={(value) => setForm({ ...form, sale_acno: value })}
                placeholder="Select sales account"
                icon={DollarSign}
                error={errors.sale_acno}
                required
                options={accounts}
                loading={loadingAccounts}
              />

              {/* POS Account */}
              <SelectField
                id="pos_acno"
                label="POS Account"
                value={form.pos_acno}
                onValueChange={(value) => setForm({ ...form, pos_acno: value })}
                placeholder="Select POS account"
                icon={ShoppingCart}
                error={errors.pos_acno}
                required
                options={accounts}
                loading={loadingAccounts}
              />

              {/* COGS Account (Optional) */}
              <SelectField
                id="cogs_acno"
                label="COGS Account"
                value={form.cogs_acno}
                onValueChange={(value) => setForm({ ...form, cogs_acno: value })}
                placeholder="Select COGS account (optional)"
                icon={TrendingUp}
                error={errors.cogs_acno}
                required={false}
                options={accounts}
                loading={loadingAccounts}
              />

              {/* Description */}
              <motion.div variants={itemVariants} className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                  <Hash className="w-4 h-4 mr-2 text-gray-500" />
                  Description (Optional)
                </Label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter a brief description..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none text-sm"
                />
              </motion.div>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200"
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full sm:w-auto border-gray-300 hover:bg-primary"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading || loadingAccounts}
                className="w-full sm:w-auto bg-primary text-white shadow-md hover:shadow-lg transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Create Category
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>

      {/* Helper Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Tips Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-blue-50/50 backdrop-blur-sm border border-blue-200/50">
            <div className="p-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-2">Account Setup Tips</h3>
                  <ul className="text-sm text-primary space-y-1">
                    <li>• Stock Account: For inventory tracking</li>
                    <li>• Sales Account: For revenue recognition</li>
                    <li>• POS Account: For point-of-sale transactions</li>
                    <li>• COGS Account: For cost of goods sold (optional)</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Examples Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-purple-50/50 backdrop-blur-sm border border-purple-200/50">
            <div className="p-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-2">Category Examples</h3>
                  <div className="text-sm text-primary space-y-1">
                    <div><strong>Food & Drinks:</strong> Beverages, Snacks, Frozen</div>
                    <div><strong>Technology:</strong> Electronics, Accessories</div>
                    <div><strong>Fashion:</strong> Clothing, Shoes, Jewelry</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  </div>
</div>

  );
};

export default CreateCategory;
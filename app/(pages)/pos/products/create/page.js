  // "use client";
  // import { useState, useEffect } from 'react';
  // import { motion } from 'framer-motion';
  // import { toast } from 'sonner';
  // import { Button } from '@/components/ui/button';
  // import { Input } from '@/components/ui/input';
  // import { Label } from '@/components/ui/label';
  // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
  // import { useRouter } from 'next/navigation';
  // import React from 'react';

  // const CreateProduct = () => {
  //   const [form, setForm] = useState({ item: '', ic_id: '', sku: '', price: '', stock: '' });
  //   const [categories, setCategories] = useState([]);
  //   const router = useRouter();

  //   useEffect(() => {
  //     fetch('/pos/api/categories')
  //       .then(res => res.json())
  //       .then(data => setCategories(data));
  //   }, []);

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     try {
  //       const response = await fetch('/pos/api/products', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ ...form, ic_id: parseInt(form.ic_id), price: parseFloat(form.price), stock: parseInt(form.stock) }),
  //       });
  //       if (response.ok) {
  //         toast.success('Product created successfully');
  //         router.push('/pos/products');
  //       } else {
  //         toast.error('Failed to create product');
  //       }
  //     } catch (error) {
  //       toast.error('Error creating product');
  //     }
  //   };

  //   return (
  //     <div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 max-w-md mx-auto">
  //       <h2 className="text-2xl font-bold mb-4">Create Product</h2>
  //       <form onSubmit={handleSubmit} className="space-y-4">
  //         <div>
  //           <Label htmlFor="item">Product Name</Label>
  //           <Input id="item" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} />
  //         </div>
  //         <div>
  //           <Label htmlFor="ic_id">Category</Label>
  //           <Select onValueChange={(value) => setForm({ ...form, ic_id: value })}>
  //             <SelectTrigger>
  //               <SelectValue placeholder="Select category" />
  //             </SelectTrigger>
  //             <SelectContent>
  //               {categories.map(category => (
  //                 <SelectItem key={category.id} value={category.id}>{category.ic_name}</SelectItem>
  //               ))}
  //             </SelectContent>
  //           </Select>
  //         </div>
  //         <div>
  //           <Label htmlFor="sku">SKU</Label>
  //           <Input id="sku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
  //         </div>
  //         <div>
  //           <Label htmlFor="price">Price</Label>
  //           <Input id="price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
  //         </div>
  //         <div>
  //           <Label htmlFor="stock">Stock</Label>
  //           <Input id="stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
  //         </div>
  //         <Button type="submit">Create</Button>
  //       </form>
  //     </div>
  //   );
  // }
  // export default CreateProduct;

  
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
import { 
  Plus, 
  Package, 
  Tag, 
  DollarSign, 
  Hash, 
  Archive,
  ArrowLeft,
  Save,
  Loader2,
  ShoppingCart,
  Barcode,
  Camera,
  Upload,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import React from 'react';

const CreateProduct = () => {
  const [form, setForm] = useState({ 
    item: '', 
    ic_id: '', 
    sku: '', 
    price: '', 
    stock: '',
    description: '',
    image: null
  });
  const [categories, setCategories] = useState([
    // Mock data for demonstration
    { id: 1, ic_name: 'Beverages' },
    { id: 2, ic_name: 'Electronics' },
    { id: 3, ic_name: 'Clothing' },
    { id: 4, ic_name: 'Books' },
    { id: 5, ic_name: 'Home & Garden' }
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const router = useRouter();

  useEffect(() => {
    // Uncomment when API is available
    // fetch('/pos/api/categories')
    //   .then(res => res.json())
    //   .then(data => setCategories(data));
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.item.trim()) newErrors.item = 'Product name is required';
    if (!form.ic_id) newErrors.ic_id = 'Category is required';
    if (!form.sku.trim()) newErrors.sku = 'SKU is required';
    if (!form.price || parseFloat(form.price) <= 0) newErrors.price = 'Price must be greater than 0';
    if (!form.stock || parseInt(form.stock) < 0) newErrors.stock = 'Stock must be 0 or greater';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateSKU = () => {
    const prefix = form.item.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}${random}${timestamp}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // const response = await fetch('/pos/api/products', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     ...form, 
      //     ic_id: parseInt(form.ic_id), 
      //     price: parseFloat(form.price), 
      //     stock: parseInt(form.stock) 
      //   }),
      // });
      
      // if (response.ok) {
        toast.success('Product created successfully!');
        router.push('/pos/products');
      // } else {
      //   toast.error('Failed to create product');
      // }
    } catch (error) {
      toast.error('Error creating product');
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
    step, 
    min,
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
          step={step}
          min={min}
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Product</h1>
                <p className="text-gray-600 mt-1">Add a new product to your inventory</p>
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
                  <span className="text-sm font-medium text-gray-600">Product Information</span>
                  <span className="text-sm text-gray-500">Fill in the details below</span>
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

              <div className="space-y-8">
                              <form>

                <motion.div
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >

                  {/* Product Name */}
                  <motion.div variants={itemVariants} className="md:col-span-2">
                    <InputField
                      id="item"
                      label="Product Name"
                      value={form.item}
                      onChange={(e) => setForm({ ...form, item: e.target.value })}
                      placeholder="Enter product name"
                      icon={Package}
                      error={errors.item}
                      required
                    />
                  </motion.div>

                  {/* Category */}
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-gray-500" />
                      Category
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select onValueChange={(value) => setForm({ ...form, ic_id: value })}>
                      <SelectTrigger className={`transition-all duration-200 ${
                        errors.ic_id 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                      }`}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.ic_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.ic_id && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center text-red-500 text-xs"
                      >
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.ic_id}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* SKU */}
                  <motion.div variants={itemVariants} className="space-y-2">
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
                    <InputField
                      id="sku"
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      placeholder="Product SKU"
                      error={errors.sku}
                      required
                    />
                  </motion.div>

                  {/* Price */}
                  <InputField
                    id="price"
                    label="Price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                    icon={DollarSign}
                    error={errors.price}
                    required
                  />

                  {/* Stock */}
                  <InputField
                    id="stock"
                    label="Initial Stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="0"
                    icon={Archive}
                    error={errors.stock}
                    required
                  />

                  {/* Description */}
                  <motion.div variants={itemVariants} className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Description (Optional)</Label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Enter product description..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    />
                  </motion.div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200"
                >
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
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Product...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Create Product
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </div>
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
                    <h3 className="font-semibold text-blue-900 mb-2">Quick Tips</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Use descriptive product names for better searchability</li>
                      <li>• SKU should be unique across your entire inventory</li>
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
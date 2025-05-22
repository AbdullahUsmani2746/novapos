// "use client"
// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { toast } from 'sonner';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { useRouter } from 'next/navigation';
// import React from 'react';
// const ProductDetail = ({ productId }) => {
//   const [product, setProduct] = useState(null);
//   const [form, setForm] = useState({ item: '', ic_id: '', sku: '', price: '', stock: '' });
//   const [categories, setCategories] = useState([]);
//   const router = useRouter();

//   useEffect(() => {
//     fetch(`/pos/api/products/${productId}`)
//       .then(res => res.json())
//       .then(data => {
//         setProduct(data);
//         setForm({ item: data.item, ic_id: data.ic_id, sku: data.sku, price: data.price, stock: data.stock });
//       });
//     fetch('/pos/api/categories')
//       .then(res => res.json())
//       .then(data => setCategories(data));
//   }, [productId]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch(`/pos/api/products/${productId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ ...form, ic_id: parseInt(form.ic_id), price: parseFloat(form.price), stock: parseInt(form.stock) }),
//       });
//       if (response.ok) {
//         toast.success('Product updated successfully');
//         router.push('/pos/products');
//       } else {
//         toast.error('Failed to update product');
//       }
//     } catch (error) {
//       toast.error('Error updating product');
//     }
//   };

//   if (!product) return <div>Loading...</div>;

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 max-w-md mx-auto">
//       <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <Label htmlFor="item">Product Name</Label>
//           <Input id="item" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} />
//         </div>
//         <div>
//           <Label htmlFor="ic_id">Category</Label>
//           <Select value={form.ic_id} onValueChange={(value) => setForm({ ...form, ic_id: value })}>
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
//         <Button type="submit">Update</Button>
//       </form>
//     </motion.div>
//   );
// }
// export default ProductDetail;


"use client"
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Edit3, Save, ArrowLeft, DollarSign, Hash, Barcode, Tag, Warehouse, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import React from 'react';

// Mock data for demonstration
const mockProduct = {
  itcd: '001',
  item: 'Premium Coffee Beans 1kg',
  ic_id: '2',
  sku: 'COF-001-1KG',
  price: 24.99,
  stock: 45,
  category: 'Beverages',
  description: 'High-quality Arabica coffee beans',
  image: 'https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=Product'
};

const mockCategories = [
  { id: '1', ic_name: 'Electronics' },
  { id: '2', ic_name: 'Beverages' },
  { id: '3', ic_name: 'Food & Snacks' },
  { id: '4', ic_name: 'Health & Beauty' },
  { id: '5', ic_name: 'Home & Garden' },
];

const ProductDetail = ({ productId = '001' }) => {
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({ item: '', ic_id: '', sku: '', price: '', stock: '' });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [errors, setErrors] = useState({});

  // Mock API calls with delay to simulate real API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock product fetch
      setProduct(mockProduct);
      setForm({
        item: mockProduct.item,
        ic_id: mockProduct.ic_id,
        sku: mockProduct.sku,
        price: mockProduct.price.toString(),
        stock: mockProduct.stock.toString()
      });
      
      // Mock categories fetch
      setCategories(mockCategories);
      setIsLoading(false);
    };

    fetchData();
  }, [productId]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.item.trim()) newErrors.item = 'Product name is required';
    if (!form.ic_id) newErrors.ic_id = 'Category is required';
    if (!form.sku.trim()) newErrors.sku = 'SKU is required';
    if (!form.price || parseFloat(form.price) <= 0) newErrors.price = 'Valid price is required';
    if (!form.stock || parseInt(form.stock) < 0) newErrors.stock = 'Valid stock quantity is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    setSaveStatus(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful update
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const goBack = () => {
    // router.push('/pos/products');
    console.log('Navigate back to products');
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
      <div className="max-w-4xl mx-auto">
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
                <h1 className="text-3xl font-bold text-gray-800">Edit Product</h1>
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
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Product Preview</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center">
                  <Package className="w-16 h-16 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500">Product Image</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Name</div>
                    <div className="font-semibold text-gray-800">
                      {form.item || 'Product Name'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">SKU</div>
                    <div className="font-mono text-sm text-blue-600">
                      {form.sku || 'SKU-CODE'}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Price</div>
                      <div className="text-xl font-bold text-green-600">
                        ${form.price || '0.00'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Stock</div>
                      <div className="text-xl font-bold text-blue-600">
                        {form.stock || '0'}
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
            <form>

              <div className="space-y-6">
                {/* Product Name */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Package className="w-4 h-4 inline mr-2" />
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={form.item}
                    onChange={(e) => handleInputChange('item', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                      errors.item 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-blue-500'
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

                {/* Category */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Category
                  </label>
                  <select
                    value={form.ic_id}
                    onChange={(e) => handleInputChange('ic_id', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                      errors.ic_id 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
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
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Barcode className="w-4 h-4 inline mr-2" />
                    SKU
                  </label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-mono ${
                      errors.sku 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-blue-500'
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

                {/* Price and Stock */}
                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-2" />
                      Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                          errors.price 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-200 focus:border-blue-500'
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

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Warehouse className="w-4 h-4 inline mr-2" />
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) => handleInputChange('stock', e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                        errors.stock 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
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

                {/* Submit Button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="pt-6"
                >
                  <motion.button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSubmit}
                    whileHover={{ scale: isSaving ? 1 : 1.02 }}
                    whileTap={{ scale: isSaving ? 1 : 0.98 }}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 ${
                      isSaving
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Updating Product...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Update Product</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Success/Error Toast */}
      <AnimatePresence>
        {saveStatus && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className={`p-4 rounded-xl shadow-xl flex items-center space-x-3 ${
              saveStatus === 'success' 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
            }`}>
              {saveStatus === 'success' ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
              <span className="font-medium">
                {saveStatus === 'success' 
                  ? 'Product updated successfully!' 
                  : 'Failed to update product'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;
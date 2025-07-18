// "use client";
// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { toast } from 'sonner';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { useRouter } from 'next/navigation';

// import React from 'react'

// const CreateCategory = () => {
//   const [form, setForm] = useState({ ic_name: '', mc_id: '' });
//   const [mainCategories, setMainCategories] = useState([]);
//   const router = useRouter();

//   useEffect(() => {
//     fetch('/pos/api/categories')
//       .then(res => res.json())
//       .then(data => setMainCategories(data.map(c => c.mainCategory)));
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch('/pos/api/categories', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ ic_name: form.ic_name, mc_id: parseInt(form.mc_id) }),
//       });
//       if (response.ok) {
//         toast.success('Category created successfully');
//         router.push('/pos/categories');
//       } else {
//         toast.error('Failed to create category');
//       }
//     } catch (error) {
//       toast.error('Error creating category');
//     }
//   };

//   return (
//     <div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 max-w-md mx-auto">
//       <h2 className="text-2xl font-bold mb-4">Create Category</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <Label htmlFor="ic_name">Category Name</Label>
//           <Input id="ic_name" value={form.ic_name} onChange={(e) => setForm({ ...form, ic_name: e.target.value })} />
//         </div>
//         <div>
//           <Label htmlFor="mc_id">Main Category</Label>
//           <Select onValueChange={(value) => setForm({ ...form, mc_id: value })}>
//             <SelectTrigger>
//               <SelectValue placeholder="Select main category" />
//             </SelectTrigger>
//             <SelectContent>
//               {mainCategories.map(category => (
//                 <SelectItem key={category.id} value={category.id}>{category.mc_name}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//         <Button type="submit">Create</Button>
//       </form>
//     </div>
//   );
// }

// export default CreateCategory

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
  Grid3X3
} from 'lucide-react';
import React from 'react';

const CreateCategory = () => {
  const [form, setForm] = useState({ 
    ic_name: '', 
    mc_id: '',
    description: ''
  });
  // const [mainCategories, setMainCategories] = useState([
  //   // Mock data for demonstration
  //   { id: 1, mc_name: 'Food & Drinks' },
  //   { id: 2, mc_name: 'Technology' },
  //   { id: 3, mc_name: 'Fashion' },
  //   { id: 4, mc_name: 'Education' },
  //   { id: 5, mc_name: 'Lifestyle' },
  //   { id: 6, mc_name: 'Recreation' }
  // ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.ic_name.trim()) newErrors.ic_name = 'Category name is required';
    if (form.ic_name.length < 2) newErrors.ic_name = 'Category name must be at least 2 characters';
    
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
    });
      
      if (response.ok) {
        toast.success('Category created successfully!');
        router.push('/pos/categories');
      } else {
        toast.error('Failed to create category');
      }
    } catch (error) {
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
        {required && <span className="text-red-500 ml-1"></span>}
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
                  {/* <motion.div variants={itemVariants} className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                      <Folder className="w-4 h-4 mr-2 text-gray-500" />
                      Main Category
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select onValueChange={(value) => setForm({ ...form, mc_id: value })}>
                      <SelectTrigger className={`transition-all duration-200 ${
                        errors.mc_id 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                      }`}>
                        <SelectValue placeholder="Select a main category" />
                      </SelectTrigger>
                      <SelectContent>
                        {mainCategories.map(category => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            <div className="flex items-center">
                              <Grid3X3 className="w-4 h-4 mr-2 text-gray-400" />
                              {category.mc_name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.mc_id && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center text-red-500 text-xs mt-2"
                      >
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.mc_id}
                      </motion.div>
                    )}
                  </motion.div> */}

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
                disabled={loading}
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
                      <h3 className="font-semibold text-primary mb-2">Best Practices</h3>
                      <ul className="text-sm text-primary space-y-1">
                        <li>• Use clear, descriptive category names</li>
                        <li>• Keep categories organized and logical</li>
                        <li>• Avoid creating too many similar categories</li>
                        <li>• Consider your customers shopping patterns</li>
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
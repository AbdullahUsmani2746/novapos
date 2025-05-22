// "use client"
// import { useEffect, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { toast } from 'sonner';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { useRouter } from 'next/navigation';
// import React from 'react';

// const CategoryManager = () => {
//   const [categories, setCategories] = useState([]);
//   const router = useRouter();

//   useEffect(() => {
//     fetch('/pos/api/categories')
//       .then(res => res.json())
//       .then(data => setCategories(data));
//   }, []);

//   const handleDelete = async (id) => {
//     try {
//       await fetch(`/pos/api/categories/${id}`, { method: 'DELETE' });
//       setCategories(categories.filter(c => c.id !== id));
//       toast.success('Category deleted successfully');
//     } catch (error) {
//       toast.error('Failed to delete category');
//     }
//   };

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
//       <AnimatePresence>
//         {categories.map(category => (
//           <motion.div key={category.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
//             <Card className="p-4">
//               <h3 className="text-lg font-semibold">{category.ic_name}</h3>
//               <p>Main Category: {category.mainCategory.mc_name}</p>
//               <div className="flex gap-2 mt-2">
//                 <Button onClick={() => router.push(`/pos/categories/${category.id}`)}>Edit</Button>
//                 <Button variant="destructive" onClick={() => handleDelete(category.id)}>Delete</Button>
//               </div>
//             </Card>
//           </motion.div>
//         ))}
//       </AnimatePresence>
//     </motion.div>
//   );
// }
// export default CategoryManager;

"use client"
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
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
  Eye
} from 'lucide-react';
import React from 'react';

const CategoryManager = () => {
  const [categories, setCategories] = useState([
    // Mock data for demonstration
    { id: 1, ic_name: 'Beverages', mainCategory: { mc_name: 'Food & Drinks' }, itemCount: 24 },
    { id: 2, ic_name: 'Electronics', mainCategory: { mc_name: 'Technology' }, itemCount: 15 },
    { id: 3, ic_name: 'Clothing', mainCategory: { mc_name: 'Fashion' }, itemCount: 38 },
    { id: 4, ic_name: 'Books', mainCategory: { mc_name: 'Education' }, itemCount: 12 },
    { id: 5, ic_name: 'Home & Garden', mainCategory: { mc_name: 'Lifestyle' }, itemCount: 29 },
    { id: 6, ic_name: 'Sports', mainCategory: { mc_name: 'Recreation' }, itemCount: 17 }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Uncomment when API is available
    // fetch('/pos/api/categories')
    //   .then(res => res.json())
    //   .then(data => setCategories(data));
  }, []);

  const filteredCategories = categories.filter(category =>
    category.ic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.mainCategory.mc_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id, categoryName) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      // await fetch(`/pos/api/categories/${id}`, { method: 'DELETE' });
      setCategories(categories.filter(c => c.id !== id));
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    },
    exit: {
      y: -20,
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  const CategoryCard = ({ category }) => (
    <motion.div
      variants={itemVariants}
      layout
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group"
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-sm hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Header with icon */}
        <div className="relative p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
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
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </motion.button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Package className="w-4 h-4 mr-1" />
                {category.itemCount} items
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="relative px-6 pb-6">
          <div className="flex space-x-2">
            <Button
              onClick={() => router.push(`/pos/categories/${category.id}`)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
            <Button
              onClick={() => router.push(`/pos/categories/${category.id}/edit`)}
              variant="outline"
              className="flex-1 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              size="sm"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              onClick={() => handleDelete(category.id, category.ic_name)}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
              size="sm"
              disabled={loading}
            >
              <Trash2 className="w-4 h-4" />
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
      <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{category.ic_name}</h3>
              <p className="text-sm text-gray-500">{category.mainCategory.mc_name} • {category.itemCount} items</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => router.push(`/pos/categories/${category.id}`)}
              variant="ghost"
              size="sm"
              className="hover:bg-blue-50"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => router.push(`/pos/categories/${category.id}/edit`)}
              variant="ghost"
              size="sm"
              className="hover:bg-gray-100"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleDelete(category.id, category.ic_name)}
              variant="ghost"
              size="sm"
              className="hover:bg-red-50 text-red-600"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Category Management</h1>
              <p className="text-gray-600 mt-1">Manage your product categories and inventory</p>
            </div>
            <Button 
              onClick={() => router.push('/pos/categories/new')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
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
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          {/* View toggle */}
          <div className="flex bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-1">
            <Button
              onClick={() => setViewMode('grid')}
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className={viewMode === 'grid' ? 'bg-blue-600 text-white' : ''}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className={viewMode === 'list' ? 'bg-blue-600 text-white' : ''}
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
            viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-3"
          }
        >
          <AnimatePresence mode="popLayout">
            {filteredCategories.map(category => (
              viewMode === 'grid' 
                ? <CategoryCard key={category.id} category={category} />
                : <CategoryListItem key={category.id} category={category} />
            ))}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first category'}
            </p>
            <Button 
              onClick={() => router.push('/pos/categories/new')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
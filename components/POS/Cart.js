
// "use client"
// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { toast } from 'sonner';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { useRouter } from 'next/navigation';
// import { formatCurrency } from '@/lib/utils';
// import React from 'react'

// const Cart = () => {
//   const [cart, setCart] = useState([]);
//   const [products, setProducts] = useState([]);
//   const router = useRouter();

//   useEffect(() => {
//     fetch('/pos/api/products')
//       .then(res => res.json())
//       .then(data => setProducts(data));
//   }, []);

//   const addToCart = async (productId, quantity) => {
//     const product = await fetch(`/pos/api/products/${productId}`).then(res => res.json());
//     if (product.stock < quantity) {
//       toast.error('Insufficient stock');
//       return;
//     }
//     setCart([...cart, { ...product, quantity }]);
//     toast.success(`${product.item} added to cart`);
//   };

//   const updateQuantity = (id, quantity) => {
//     setCart(cart.map(item => item.itcd === id ? { ...item, quantity } : item));
//   };

//   const removeFromCart = (id) => {
//     setCart(cart.filter(item => item.itcd !== id));
//     toast.success('Item removed from cart');
//   };

//   const checkout = async () => {
//     try {
//       const response = await fetch('/pos/api/orders', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ cartItems: cart, customer: 'POS Customer', total: cart.reduce((sum, item) => sum + item.quantity * item.price, 0) }),
//       });
//       if (response.ok) {
//         setCart([]);
//         toast.success('Order placed successfully');
//         router.push('/pos/orders');
//       } else {
//         toast.error('Failed to place order');
//       }
//     } catch (error) {
//       toast.error('Checkout error');
//     }
//   };

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
//       <h2 className="text-2xl font-bold mb-4">Cart</h2>
//       <div className="mb-4">
//         <Select onValueChange={(value) => addToCart(value, 1)}>
//           <SelectTrigger>
//             <SelectValue placeholder="Add product to cart" />
//           </SelectTrigger>
//           <SelectContent>
//             {products.map(product => (
//               <SelectItem key={product.itcd} value={product.itcd}>{product.item}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//       {cart.map(item => (
//         <div key={item.itcd} className="flex justify-between items-center mb-2">
//           <span>{item.item} ({formatCurrency(item.price)})</span>
//           <div className="flex gap-2">
//             <Input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.itcd, parseInt(e.target.value))} className="w-16" />
//             <Button variant="destructive" onClick={() => removeFromCart(item.itcd)}>Remove</Button>
//           </div>
//         </div>
//       ))}
//       {cart.length > 0 && (
//         <div className="mt-4">
//           <p>Total: {formatCurrency(cart.reduce((sum, item) => sum + item.quantity * item.price, 0))}</p>
//           <Button onClick={checkout} className="mt-2">Checkout</Button>
//         </div>
//       )}
//     </motion.div>
//   );
// }
// export default Cart


"use client"
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Package, Search, Receipt, X } from 'lucide-react';
import React from 'react'

// Mock data for demonstration
const mockProducts = [
  { itcd: '001', item: 'Coca Cola 500ml', price: 2.50, stock: 50, category: 'Beverages', barcode: '123456789' },
  { itcd: '002', item: 'Bread Loaf', price: 3.25, stock: 30, category: 'Bakery', barcode: '987654321' },
  { itcd: '003', item: 'Milk 1L', price: 4.50, stock: 25, category: 'Dairy', barcode: '456789123' },
  { itcd: '004', item: 'Bananas 1kg', price: 1.99, stock: 40, category: 'Fruits', barcode: '789123456' },
  { itcd: '005', item: 'Chicken Breast 500g', price: 8.99, stock: 15, category: 'Meat', barcode: '321654987' },
  { itcd: '006', item: 'Pasta 500g', price: 2.75, stock: 35, category: 'Grocery', barcode: '654987321' },
];

const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showReceipt, setShowReceipt] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);

  const categories = ['All', ...new Set(products.map(p => p.category))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm);
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product, quantity = 1) => {
    if (product.stock < quantity) {
      toast.error('Insufficient stock');
      return;
    }

    const existingItem = cart.find(item => item.itcd === product.itcd);
    if (existingItem) {
      if (existingItem.quantity + quantity <= product.stock) {
        setCart(cart.map(item => 
          item.itcd === product.itcd 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ));
      }
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    const product = products.find(p => p.itcd === id);
    if (newQuantity > product.stock) return;
    
    setCart(cart.map(item => 
      item.itcd === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.itcd !== id));
  };

  const getSubtotal = () => cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const getTax = () => getSubtotal() * 0.08; // 8% tax
  const getTotal = () => getSubtotal() + getTax();

  const checkout = () => {
    const orderNum = 'ORD' + Date.now().toString().slice(-6);
    setOrderNumber(orderNum);
    setShowReceipt(true);
    setCart([]);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                <ShoppingCart className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">POS System</h1>
                <p className="text-gray-600">Professional Point of Sale</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(getTotal())}
              </div>
              <div className="text-sm text-gray-500">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Product Selection */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Products</h2>
              
              {/* Search and Filter */}
              <div className="mb-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products or scan barcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <motion.button
                      key={category}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.itcd}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, shadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addToCart(product)}
                      className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl cursor-pointer border-2 border-gray-100 hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          {product.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          Stock: {product.stock}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1 text-sm">
                        {product.item}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(product.price)}
                        </span>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-blue-600 text-white p-1 rounded-full"
                        >
                          <Plus className="w-4 h-4" />
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Cart */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white rounded-2xl shadow-xl p-6 sticky top-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Cart</h2>
                {cart.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                )}
              </div>

              <div className="space-y-4 max-h-80 overflow-y-auto mb-6">
                <AnimatePresence>
                  {cart.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 text-gray-500"
                    >
                      <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Your cart is empty</p>
                      <p className="text-sm">Add products to get started</p>
                    </motion.div>
                  ) : (
                    cart.map((item) => (
                      <motion.div
                        key={item.itcd}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-gray-50 p-4 rounded-xl"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-800 text-sm flex-1">
                            {item.item}
                          </h4>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(item.itcd)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.itcd, item.quantity - 1)}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-1 rounded-full transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </motion.button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.itcd, item.quantity + 1)}
                              className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </motion.button>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              {formatCurrency(item.price)} each
                            </div>
                            <div className="font-semibold text-green-600">
                              {formatCurrency(item.quantity * item.price)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {cart.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t-2 border-gray-100 pt-4"
                >
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(getSubtotal())}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (8%):</span>
                      <span>{formatCurrency(getTax())}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t border-gray-200">
                      <span>Total:</span>
                      <span className="text-green-600">{formatCurrency(getTotal())}</span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={checkout}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Checkout</span>
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReceipt(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full max-h-96 overflow-y-auto"
            >
              <div className="text-center mb-6">
                <Receipt className="w-12 h-12 mx-auto text-green-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800">Order Complete!</h3>
                <p className="text-gray-600">Order #{orderNumber}</p>
              </div>
              
              <div className="text-center">
                <p className="text-lg font-semibold text-green-600 mb-4">
                  Total: {formatCurrency(getTotal())}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowReceipt(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;
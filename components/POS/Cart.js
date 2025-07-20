"use client"
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Package, Search, Receipt, X, Banknote, Calculator } from 'lucide-react';
import React from 'react'
import axios from 'axios';
import { useSession } from 'next-auth/react';

const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

const Cart = () => {

  const {data:session} = useSession();
  const userId = session?.user?.id;

  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);

  const categories = ['All', ...new Set(products.map(p => p.itemCategories.ic_name))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.includes(searchTerm);
    const matchesCategory = selectedCategory === 'All' || product.itemCategories.ic_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    axios.get('/api/pos/products')
      .then(res => setProducts(res.data.products))
      .catch(() => toast.error('Failed to load products'));
  }, []);

  // Add to cart with live stock check
  const addToCart = async (productId, quantity = 1) => {
    try {
      const product = products.find(p => p.itcd === productId);
      
      if (!product || product.stock < quantity) {
        alert('Insufficient stock');
        return;
      }

      const existingItem = cart.find(item => item.itcd === product.itcd);
      if (existingItem) {
        if (existingItem.quantity + quantity > product.stock) {
          alert('Stock limit exceeded');
          return;
        }
        setCart(cart.map(item =>
          item.itcd === product.itcd
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ));
      } else {
        setCart([...cart, { ...product, quantity }]);
      }
    } catch (error) {
      alert('Error adding to cart');
    }
  };

  const updateQuantity = (id, newQuantity) => {
    const product = products.find(p => p.itcd === id);
    if (!product) return;

    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    if (newQuantity > product.stock) {
      alert('Stock limit exceeded');
      return;
    }

    setCart(cart.map(item =>
      item.itcd === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.itcd !== id));
  };

  const getSubtotal = () => cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const getTax = () => getSubtotal() * 0.08; // 8% tax
  const getTotal = () => getSubtotal();
  // const getTotal = () => getSubtotal() + getTax();


  const clearCart = () => {
    setCart([]);
  };

  const initiateCheckout = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    if (paymentMethod === 'CASH') {
      const cashAmountNum = parseFloat(cashAmount);
      if (!cashAmount || cashAmountNum < getTotal()) {
        alert('Please enter a valid cash amount');
        return;
      }
    }

    try {
      const orderData = {
        cartItems: cart,
        customer: paymentMethod === 'CASH' ?  '0001'  : '0003',
        id: userId,
        total: getTotal(),
        subtotal: getSubtotal(),
        tax: getTax(),
        paymentMethod: paymentMethod,
        cashAmount: paymentMethod === 'CASH' ? parseFloat(cashAmount) : null,
        change: paymentMethod === 'CASH' ? parseFloat(cashAmount) - getTotal() : 0
      };

      // Simulate API call
      await axios.post('/api/pos/orders', orderData);
      
      // Generate order number
      const newOrderNumber = Math.floor(Math.random() * 10000) + 1000;
      setOrderNumber(newOrderNumber);
      setOrderDetails(orderData);
      
      // Clear states and show receipt
      setCart([]);
      setShowPaymentModal(false);
      setShowReceipt(true);
      setPaymentMethod('');
      setCashAmount('');
      
    } catch (error) {
      alert('Checkout error');
    }
  };

  const calculateChange = () => {
    if (paymentMethod === 'CASH' && cashAmount) {
      const change = parseFloat(cashAmount) - getTotal();
      return change >= 0 ? change : 0;
    }
    return 0;
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary p-3 rounded-xl">
                <ShoppingCart className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">POS System</h1>
                <p className="text-gray-600">Professional Point of Sale</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
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
                    className="w-full pl-10 pr-4 py-1.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none text-md"
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
                          ? 'bg-primary text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[600px]  overflow-y-auto overflow-x-hidden">
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
                      onClick={() => addToCart(product.itcd)}
                      className="bg-secondary from-gray-50 to-white p-4 rounded-xl cursor-pointer border-2 border-gray-100 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-primary py-1">
                          {product.itemCategories.ic_name}
                        </span>
                         <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-primary text-white p-2 rounded-full flex items-center justify-center w-8 h-8"
                        >
                          
                        <span className="text-xs font-bold text-white">
                         {product.stock}
                        </span>
                        </motion.div>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-3 line-clamp-2 text-sm">
                        {product.item}
                      </h3>
                      <div className="flex items-center justify-between ">
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(product.price)}
                        </span>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-primary text-white p-1 rounded-full"
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
                      className="text-center py-8 text-gray-800"
                    >
                      <Package className="w-12 h-12 mx-auto mb-3 text-primary" />
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
                              className="bg-primary text-white p-1 rounded-full transition-colors"
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
                    {/* <div className="flex justify-between text-gray-600">
                      <span>Tax (8%):</span>
                      <span>{formatCurrency(getTax())}</span>
                    </div> */}
                    <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t border-gray-200">
                      <span>Total:</span>
                      <span className="text-green-600">{formatCurrency(getTotal())}</span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={initiateCheckout}
                    className="w-full bg-primary from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
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

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Payment Method</h3>
              
              <div className="space-y-4 mb-6">
                <div className="text-center bg-gray-50 p-4 rounded-xl">
                  <div className="text-lg font-semibold text-gray-700">Total Amount</div>
                  <div className="text-3xl font-bold text-green-600">{formatCurrency(getTotal())}</div>
                </div>
                
                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentMethod('CARD')}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-center space-x-3 ${
                      paymentMethod === 'CARD'
                        ? 'border-primary bg-secondary text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-6 h-6" />
                    <span className="font-semibold">Card Payment</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentMethod('CASH')}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-center space-x-3 ${
                      paymentMethod === 'CASH'
                        ? 'border-seconday bg-primary text-secondary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Banknote className="w-6 h-6" />
                    <span className="font-semibold">Cash Payment</span>
                  </motion.button>
                </div>

                {/* Cash Amount Input */}
                {paymentMethod === 'CASH' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cash Amount Received
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={cashAmount}
                        onChange={(e) => setCashAmount(e.target.value)}
                        placeholder="Enter cash amount"
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none text-lg"
                      />
                    </div>
                    
                    {cashAmount && parseFloat(cashAmount) >= getTotal() && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-green-50 p-3 rounded-xl"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-green-700 font-medium">Change:</span>
                          <span className="text-green-800 font-bold text-lg">
                            {formatCurrency(calculateChange())}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>

              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentMethod('');
                    setCashAmount('');
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={processPayment}
                  disabled={!paymentMethod || (paymentMethod === 'CASH' && (!cashAmount || parseFloat(cashAmount) < getTotal()))}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Process Payment
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
  <AnimatePresence>
  {showReceipt && orderDetails && (
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
        className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* Header - Fixed */}
        <div className="text-center mb-6 flex-shrink-0">
          <Receipt className="w-12 h-12 mx-auto text-primary mb-4" />
          <h3 className="text-2xl font-bold text-gray-800">Payment Successful!</h3>
          <p className="text-gray-600">Order #{orderNumber}</p>
          <p className="text-sm text-gray-500">{new Date().toLocaleString()}</p>
        </div>
        
        {/* Receipt Details - Scrollable */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-4">
          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-700 mb-3">Items:</h4>
            <div className="space-y-2">
              {orderDetails.cartItems.map((item) => (
                <div key={item.itcd} className="flex justify-between text-sm py-1">
                  <span className="flex-1">{item.item} x{item.quantity}</span>
                  <span className="font-medium">{formatCurrency(item.quantity * item.price)}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm py-1">
              <span>Subtotal:</span>
              <span>{formatCurrency(orderDetails.subtotal)}</span>
            </div>
            {/* <div className="flex justify-between text-sm py-1">
              <span>Tax (8%):</span>
              <span>{formatCurrency(orderDetails.tax)}</span>
            </div> */}
            <div className="flex justify-between font-bold text-lg border-t pt-3">
              <span>Total:</span>
              <span>{formatCurrency(orderDetails.total)}</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Payment Method:</span>
              <span className="font-semibold text-primary">
                {orderDetails.paymentMethod}
              </span>
            </div>
            {orderDetails.paymentMethod === 'CASH' && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Cash Received:</span>
                  <span>{formatCurrency(orderDetails.cashAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Change:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(orderDetails.change)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer Button - Fixed */}
        <div className="text-center flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowReceipt(false)}
            className="bg-primary text-white px-8 py-3 rounded-xl font-medium transition-colors w-full sm:w-auto"
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
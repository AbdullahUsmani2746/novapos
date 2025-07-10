"use client";
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, 
  Package, 
  Grid3X3, 
  Receipt, 
  TrendingUp, 
  DollarSign,
  Users,
  Clock,
  ArrowRight,
  Zap
} from 'lucide-react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

const ModernPOSDashboard = () => {

 const {data:session} = useSession();
  const userId = session?.user?.id;

  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const router = useRouter();
  const [stats, setStats] = useState({
  todaysSales: 0,
  transactions: 0,
  customers: 0,
});


useEffect(() => {
  setIsLoaded(true);

  const fetchStats = async () => {
    try {
      console.log('Fetching stats for user ID:', userId);
      const res = await axios.get(`/api/pos/stats?id=${userId}`);
      const data = await res.data;
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  fetchStats();
}, []);


  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const navigationCards = [
    {
      id: 'products',
      title: 'Products',
      description: 'Manage your inventory and product catalog',
      href: '/pos/products',
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      delay: 0.1
    },
    {
      id: 'categories',
      title: 'Categories',
      href: '/pos/categories',
      description: 'Organize products into categories',
      icon: Grid3X3,
      color: 'from-purple-500 to-purple-600',
      delay: 0.2
    },
    {
      id: 'cart',
      title: 'Shopping Cart',
      href: '/pos/cart',
      description: 'Process customer transactions',
      icon: ShoppingCart,
      color: 'from-green-500 to-green-600',
      delay: 0.3
    },
    {
      id: 'orders',
      href: '/pos/orders',
      title: 'Orders',
      description: 'View and manage order history',
      icon: Receipt,
      color: 'from-orange-500 to-orange-600',
      delay: 0.4
    }
  ];

  const statsCards = [
    {
      title: 'Today\'s Sales',
      value: `${stats.todaysSales}`,
      // change: '0',
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      title: 'Transactions',
    value: stats.transactions,
      // change: '0',
      icon: TrendingUp,
      color: 'text-blue-500'
    },
    {
      title: 'Customers',
    value: stats.customers,
      // change: '0',
      icon: Users,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-6">
      {/* Header Section */}
      <div 
        className={`transform transition-all duration-1000 ease-out ${
          isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
        }`}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              POS Dashboard
            </h1>
            <p className="text-slate-500 text-sm md:text-base">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {statsCards.map((stat, index) => (
          <Card 
            key={stat.title}
            className={`p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/70 transition-all duration-500 cursor-pointer transform hover:-translate-y-1 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: `${0.2 + index * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
                <p className={`text-sm font-medium mt-1 ${stat.color}`}>{stat.change}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color === 'text-green-500' ? 'from-green-100 to-green-50' : stat.color === 'text-blue-500' ? 'from-blue-100 to-blue-50' : 'from-purple-100 to-purple-50'}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Welcome Message */}
      <Card 
        className={`p-8 mb-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-0 shadow-2xl transform transition-all duration-1000 ease-out ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
        style={{ transitionDelay: '0.6s' }}
      >
        <div className="text-white">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6" />
            <h2 className="text-2xl md:text-3xl font-bold">Welcome Back!</h2>
          </div>
          <p className="text-white/90 text-base md:text-lg leading-relaxed">
            Your point of sale system is ready to go. Navigate through the options below to manage your business operations efficiently.
          </p>
        </div>
      </Card>

      {/* Navigation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {navigationCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.id}
              className={`group relative overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/30 cursor-pointer touch-manipulation transform transition-all duration-700 ease-out hover:-translate-y-2 hover:scale-105 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
              } ${activeCard === card.id ? 'scale-105 -translate-y-2' : ''}`}
              style={{ transitionDelay: `${0.8 + card.delay}s` }}
              onMouseEnter={() => setActiveCard(card.id)}
              onClick={() => router.push(card.href)}
              onMouseLeave={() => setActiveCard(null)}
              onTouchStart={() => router.push(card.href)}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Content */}
              <div className="relative p-6 md:p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-3 group-hover:text-slate-900 transition-colors duration-300">
                  {card.title}
                </h3>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed group-hover:text-slate-600 transition-colors duration-300">
                  {card.description}
                </p>
                
                {/* Animated Border */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
              
              {/* Ripple Effect */}
              <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 transition-opacity duration-150 pointer-events-none" />
            </Card>
          );
        })}
      </div>

      {/* Quick Actions Footer */}
      <div 
        className={`mt-12 text-center transform transition-all duration-1000 ease-out ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
        style={{ transitionDelay: '1.4s' }}
      >
        <p className="text-slate-400 text-sm">
          Tip: Tap any card above to get started with your POS operations
        </p>
      </div>
    </div>
  );
};

export default ModernPOSDashboard;
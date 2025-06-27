'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Table from "@/components/Category/Table"
import Modal from "@/components/Category/Modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, TrendingUp, BarChart3, Layers, Sparkles } from 'lucide-react'
import axios from 'axios'

const CONFIG = {
  voucher: {
    payment: {
      label: 'Payment',
      stats: ['total'],
      apiPath: 'payment',
      icon: TrendingUp,
      gradient: 'from-primary to-primary'
    },
    receipt: {
      label: 'Receipt',
      stats: ['total'],
      apiPath: 'receipt',
      icon: BarChart3,
      gradient: 'from-primary to-primary'
    },
    journal: {
      label: 'Journal',
      stats: ['total'],
      apiPath: 'journal',
      icon: Layers,
      gradient: 'from-primary to-primary'
    }
  },
  invoice: {
    purchase: {
      label: 'Purchase Invoice',
      stats: ['total'],
      apiPath: 'purchase',
      icon: TrendingUp,
      gradient: 'from-primary to-primary'
    },
    sale: {
      label: 'Sales Invoice',
      stats: ['total'],
      apiPath: 'sale',
      icon: Sparkles,
      gradient: 'from-primary to-primary'
    }
  },

  return: {
    purchaseReturn: {
      label: 'Purchase Return Invoice',
      stats: ['total'],
      apiPath: 'purchase',
      icon: TrendingUp,
      gradient: 'from-primary to-primary'
    },
    saleReturn: {
      label: 'Sales Return Invoice',
      stats: ['total'],
      apiPath: 'sale',
      icon: Sparkles,
      gradient: 'from-primary to-primary'
    }
  }
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

const cardHoverVariants = {
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

const StatCard = ({ stat, value, isLoading, gradient, icon: Icon }) => (
  <motion.div
    variants={itemVariants}
    whileHover="hover"
    whileTap="tap"
    className="group cursor-pointer"
  >
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
      <CardHeader className="pb-3 relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
            {stat.charAt(0).toUpperCase() + stat.slice(1)}
          </CardTitle>
          <div className={`p-2 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon size={16} className="text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-8 w-20 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 animate-pulse rounded-lg"
            />
          ) : (
            <motion.div
              key="loaded"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent"
            >
              {value ?? '-'}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  </motion.div>
)

export default function DynamicVoucherPage({ params: paramsPromise }) {
  const router = useRouter()
  const params = use(paramsPromise)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const categoryConfig = CONFIG[params.category]
  const typeConfig = categoryConfig?.[params.type]

  useEffect(() => {
    if (!typeConfig) {
      router.replace('/404')
      return
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        const res = await axios.get(`/api/voucher/${typeConfig.apiPath}`)
        const data = await res.data
        console.log('Fetched data:', data)
        
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
        setStats({})
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params, refreshTrigger, router, typeConfig])

  const refreshData = () => setRefreshTrigger(prev => prev + 1)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        refreshData()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!typeConfig) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-green-100/30 to-cyan-100/30 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        className="relative container mx-auto px-8 py-8 max-w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6"
        >
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3"
            >
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${typeConfig.gradient} shadow-xl`}>
                <typeConfig.icon size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {typeConfig.label}s
                </h1>
                <p className="text-slate-500 font-medium">
                  Manage {params.category} • {typeConfig.label}
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 w-full lg:w-auto"
          >
            <Button
              onClick={refreshData}
              variant="outline"
              size="lg"
              className="flex-1 lg:flex-none h-10 px-6 bg-primary/80 text-white hover:bg-secondary hover:text-primary group hover:shadow-lg transition-all duration-300 group"
              disabled={isLoading}
            >
              <RefreshCw 
                size={18} 
                className={`mr-2 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-300`} 
              />
              Refresh
              <span className="hidden sm:inline ml-1 text-xs text-white group-hover:text-primary">(Ctrl+R)</span>
            </Button>

            <Modal 
              category={params.category}
              type={params.type}
              onSuccess={refreshData}
            />
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {typeConfig.stats.map((stat) => (
            <StatCard
              key={stat}
              stat={stat}
              value={stats[stat]}
              isLoading={isLoading}
              gradient={typeConfig.gradient}
              icon={typeConfig.icon}
            />
          ))}

          <motion.div
            variants={itemVariants}
            whileHover="hover"
            whileTap="tap"
            className="group cursor-pointer"
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-300 h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500 to-slate-700 opacity-5 group-hover:opacity-10 transition-opacity duration-300" />
              <CardHeader className="pb-3 relative">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                  Category
                </CardTitle>
              </CardHeader>
              <CardContent className="relative flex items-center">
                <Badge 
                  variant="outline" 
                  className="text-sm font-bold px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-50 border-slate-200 text-slate-700 hover:from-slate-200 hover:to-slate-100 transition-all duration-300"
                >
                  {params.category.charAt(0).toUpperCase() + params.category.slice(1)}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Table Card */}
        <motion.div
          variants={itemVariants}
          className="relative"
        >
          <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-2xl shadow-black/5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20" />
            <CardContent className="relative p-0 lg:p-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Table
                  category={params.category}
                  type={params.type}
                  isLoading={isLoading}
                  refreshTrigger={refreshTrigger+1}
                />
              </motion.div>
            </CardContent>  
          </Card>
        </motion.div>

        {/* Floating action hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="fixed bottom-6 right-6 hidden lg:block"
        >
          <div className="bg-primary/80 backdrop-blur-xl text-white px-4 py-2 rounded-full text-xs font-medium shadow-2xl">
            Press Ctrl+R to refresh
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
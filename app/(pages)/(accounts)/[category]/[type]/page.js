'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Table from "@/components/Category/Table"
import Modal from "@/components/Category/Modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw } from 'lucide-react'
const CONFIG = {
  voucher: {
    payment: {
      label: 'Payment',
      stats: ['total', 'pending', 'completed'],
      apiPath: 'payment'
    },
    receipt: {
      label: 'Receipt',
      stats: ['total', 'verified', 'pending'],
      apiPath: 'receipt'
    },
    journal: {
      label: 'Journal',
      stats: ['entries', 'balanced'],
      apiPath: 'journal'
    }
  },
  invoice: {
    purchase: {
      label: 'Purchase Invoice',
      stats: ['total', 'tax', 'net'],
      apiPath: 'purchase'
    },
    sale: {
      label: 'Sales Invoice',
      stats: ['total', 'discount', 'tax'],
      apiPath: 'sale'
    }
  }
}

export default function DynamicVoucherPage({ params: paramsPromise}) {
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
        
        const res = await fetch(`/api/${params.category}/${typeConfig.apiPath}`)
        const data = await res.json()
        
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

  if (!typeConfig) return null

  return (
    <motion.div
      className="container mx-auto px-4 py-6 max-w-7xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {typeConfig.label}s
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage {params.category} - {typeConfig.label.toLowerCase()}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={refreshData}
            variant="outline"
            className="h-9"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Modal 
            category={params.category}
            type={params.type}
            onSuccess={refreshData}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {typeConfig.stats.map((stat) => (
          <Card key={stat}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.charAt(0).toUpperCase() + stat.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 w-16 bg-muted/30 animate-pulse rounded" />
                ) : (
                  stats[stat] ?? '-'
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-sm font-semibold px-3 py-1">
              {params.category}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table
            category={params.category}
            type={params.type}
            isLoading={isLoading}
            refreshData={refreshData}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}
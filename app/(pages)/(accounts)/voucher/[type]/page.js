'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import VoucherTable from "@/components/voucher/VoucherTable"
import VoucherModal from "@/components/voucher/VoucherModal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, FileText, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function Page({ params }) {
  const [isLoading, setIsLoading] = useState(true)
  const [voucherCount, setVoucherCount] = useState(0)
  const [activeView, setActiveView] = useState("table")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const type = params?.type || "Unknown"
  const voucherType = type.charAt(0).toUpperCase() + type.slice(1)

  useEffect(() => {
    setIsLoading(true)
    fetch(`/api/voucher/count/${type}`)
      .then(res => res.json())
      .then(data => {
        setVoucherCount(data.count || 0)
        setIsLoading(false)
      })
      .catch(() => {
        setVoucherCount(0)
        setIsLoading(false)
      })
  }, [type, refreshTrigger])

  const refreshData = () => setRefreshTrigger(prev => prev + 1)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 300
      }
    }
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-6 max-w-7xl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{voucherType} Vouchers</h1>
          <p className="text-muted-foreground mt-1">Manage and view your {type} vouchers</p>
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

          <VoucherModal type={type} onSuccess={refreshData} />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Vouchers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted/30 animate-pulse rounded" />
              ) : (
                voucherCount
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Voucher Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-sm font-semibold px-3 py-1">
              {voucherType}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="table" className="w-full" onValueChange={setActiveView}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="table" className="flex items-center gap-1">
                <FileText size={14} />
                <span>Table View</span>
              </TabsTrigger>
              <TabsTrigger value="grid" className="flex items-center gap-1">
                <PlusCircle size={14} />
                <span>Grid View</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="table" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <VoucherTable
                  type={type}
                  isLoading={isLoading}
                  refreshData={refreshData}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grid" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-48 rounded-lg bg-muted/30 animate-pulse"></div>
                    ))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                      <FileText size={48} className="text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">Grid view coming soon</h3>
                      <p className="text-muted-foreground mt-1">
                        This view is under development.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}

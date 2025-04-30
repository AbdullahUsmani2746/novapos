'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { VOUCHER_CONFIG } from './constants'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function VoucherTable({ type }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/voucher/${type}`)
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [type])

  const fields = VOUCHER_CONFIG[type]?.tableFields || []

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  }

  // Helper function to format cell content based on field type
  const formatCellContent = (value, type) => {
    if (value === null || value === undefined) return '-'
    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString()
      case 'number':
        return Number(value).toFixed(2)
      case 'text':
      default:
        return value.toString()
    }
  }

  return (
    <Card className="mt-6 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              {fields.map(field => (
                <TableHead 
                  key={field.name} 
                  className="font-semibold text-xs uppercase tracking-wider px-4 py-3"
                >
                  {field.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          
          {loading ? (
            <TableBody>
              {[...Array(5)].map((_, idx) => (
                <TableRow key={idx}>
                  {fields.map(field => (
                    <TableCell key={field.name} className="p-3">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <motion.tbody
              initial="hidden"
              animate="visible"
              variants={tableVariants}
              className="divide-y"
            >
              {data.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={fields.length} 
                    className="text-center py-8 text-muted-foreground"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                data.length > 0 && data?.map((entry, idx) => (
                  <motion.tr
                    key={idx}
                    variants={rowVariants}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    {fields.map(field => (
                      <TableCell 
                        key={field.name} 
                        className="px-4 py-3 text-sm"
                      >
                        {formatCellContent(entry[field.name], field.type)}
                      </TableCell>
                    ))}
                  </motion.tr>
                ))
              )}
            </motion.tbody>
          )}
        </Table>
      </div>
    </Card>
  )
}
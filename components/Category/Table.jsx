'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VOUCHER_CONFIG } from './constants'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import axios from 'axios'

// Separate component for cell content to fix the hooks issue
const CellContent = ({ value, field, formatCellContent }) => {
  const [content, setContent] = useState('-')
  
  useEffect(() => {
    let isMounted = true
    formatCellContent(value, field).then(result => {
      if (isMounted) setContent(result)
    })
    return () => { isMounted = false }
  }, [value, field, formatCellContent])
  
  return content
}

export default function VoucherTable({ type }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [refCache, setRefCache] = useState({}) // Cache for reference names

  const fields = VOUCHER_CONFIG[type]?.tableFields || []

  // Fetch voucher data with pagination
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`/api/voucher/${type}`, {
        params: { page, limit },
      })
      setData(response.data.data || [])
      setTotalPages(response.data.totalPages || 1)
    } catch (err) {
      setError('Failed to load data. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [type, page, limit])

  // Fetch reference names for fields with refApi
  const fetchRefName = useCallback(async (value, refApi, refValueKey, refNameKey) => {
    if (!value || !refApi) return value?.toString() || '-'
    const cacheKey = `${refApi}-${value}`
    if (refCache[cacheKey]) return refCache[cacheKey]

    try {
      const response = await axios.get(`${refApi}${value}`)
      const name = response.data.data[0][refNameKey] || value
      setRefCache((prev) => ({ ...prev, [cacheKey]: name }))
      return name
    } catch (err) {
      console.error(`Error fetching ref for ${value}:`, err)
      return value?.toString() || '-'
    }
  }, [refCache])

  useEffect(() => {
    let isMounted = true
    const fetchVouchers = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await axios.get(`/api/voucher/${type}`, {
          params: { page, limit },
        })
        if (isMounted) {
          setData(response.data.data || [])
          setTotalPages(response.data.totalPages || 1)
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load data. Please try again.')
          console.error(err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchVouchers()
    return () => { isMounted = false }
  }, [type, page, limit])

  // Format cell content and handle reference fields
  const formatCellContent = useCallback(
    async (value, field) => {
      if (value === null || value === undefined) return '-'
      if (field.refApi) {
        return await fetchRefName(value, field.refApi, field.refValueKey, field.refNameKey)
      }
      switch (field.type) {
        case 'date':
          return new Date(value).toLocaleDateString()
        case 'number':
          return Number(value).toFixed(2)
        case 'text':
        default:
          return value.toString()
      }
    },
    [fetchRefName]
  )

  // Animation variants
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const rowVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  }

  const paginationVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  }

  // Pagination controls
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const handleLimitChange = (value) => {
    setLimit(Number(value))
    setPage(1) // Reset to first page when limit changes
  }

  // Generate page numbers for display
  const pageNumbers = useMemo(() => {
    const pages = []
    const maxPagesToShow = 5
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2))
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }, [page, totalPages])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 "
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert variant="destructive" className="mb-4 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <Card className="mt-6 overflow-hidden shadow-sm rounded-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50 hover:bg-blue-50">
                {fields.map((field) => (
                  <TableHead
                    key={field.name}
                    className="font-semibold text-xs uppercase tracking-wider px-4 py-3 text-blue-800"
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
                    {fields.map((field) => (
                      <TableCell key={field.name} className="p-3">
                        <Skeleton className="h-4 w-full rounded-md" />
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
                className="divide-y divide-gray-200"
              >
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={fields.length}
                      className="text-center py-8 text-gray-500"
                    >
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((entry, idx) => (
                    <motion.tr
                      key={idx}
                      variants={rowVariants}
                      className="hover:bg-blue-50 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.01 }}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          // Add row selection logic if needed
                        }
                      }}
                    >
                      {fields.map((field) => (
                        <TableCell
                          key={field.name}
                          className="px-4 py-3 text-sm text-gray-700"
                        >
                          <CellContent 
                            value={entry[field.name]} 
                            field={field} 
                            formatCellContent={formatCellContent} 
                          />
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

      {/* Pagination Controls */}
      <AnimatePresence>
        {!loading && data.length > 0 && (
          <motion.div
            variants={paginationVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex items-center justify-between mt-4 px-4"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Rows per page:</span>
              <Select
                value={limit.toString()}
                onValueChange={handleLimitChange}
              >
                <SelectTrigger className="w-20 h-8 text-xs rounded-md border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50].map((value) => (
                    <SelectItem
                      key={value}
                      value={value.toString()}
                      className="text-xs"
                    >
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-700 disabled:opacity-50 rounded-md hover:bg-blue-100"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </motion.button>
                </PaginationItem>

                {pageNumbers.map((num) => (
                  <PaginationItem key={num}>
                    <PaginationLink
                      onClick={() => handlePageChange(num)}
                      isActive={num === page}
                      className={`text-sm rounded-md ${num === page ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'}`}
                    >
                      {num}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-700 disabled:opacity-50 rounded-md hover:bg-blue-100"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </motion.button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
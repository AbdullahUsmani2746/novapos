"use client"
import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { File, FileText, AlertCircle } from "lucide-react"
import axios from "axios"
import { toast } from 'sonner'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const SiegwerkAccountsView = () => {
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)
  const [accountData, setAccountData] = useState([])
  const [error, setError] = useState(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 20

  // Fetch account data with pagination
  const fetchAccountData = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(`/api/accounts/paged`, {
        params: { page, limit: itemsPerPage },
        timeout: 10000 // 10 second timeout
      })
      
      if (response.data && response.data.success) {
        setAccountData(response.data.data || [])
        setTotalItems(response.data.pagination?.total || 0)
        setTotalPages(Math.ceil((response.data.pagination?.total || 0) / itemsPerPage))
      } else {
        throw new Error(response.data?.message || "Failed to fetch data")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to load account data"
      setError(errorMessage)
      setAccountData([])
      
      toast.error("Error loading data", {
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }, [itemsPerPage])

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page)
      fetchAccountData(page)
    }
  }

  // Initial data load
  useEffect(() => {
    fetchAccountData(currentPage)
  }, [fetchAccountData, currentPage])

  // Export to Excel
  const exportToExcel = async () => {
    try {
      setExportLoading(true)
      
      // Dynamically import XLSX
      const XLSX = (await import('xlsx')).default
      
      // Fetch all data for export
      const response = await axios.get('/api/accounts/all', {
        timeout: 30000 // 30 second timeout for large exports
      })
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to fetch export data")
      }
      
      const exportData = response.data.data || []
      
      if (exportData.length === 0) {
        toast.error("No data to export")
        return
      }
      
      const flatData = exportData.flatMap(item => {
        // Ensure item has required properties
        const balanceSheetCode = item.balanceSheetCode || ''
        const balanceSheetCategory = item.balanceSheetCategory || ''
        const mainAccounts = item.mainAccounts || ''
        const subAccounts = Array.isArray(item.subAccounts) ? item.subAccounts : []
        
        if (subAccounts.length === 0) {
          return [{
            'Balance Sheet Codes': balanceSheetCode,
            'Balance Sheet Category': balanceSheetCategory,
            'Main Accounts': mainAccounts,
            'Sub Accounts': ''
          }]
        }
        
        return subAccounts.map(subAccount => ({
          'Balance Sheet Codes': balanceSheetCode,
          'Balance Sheet Category': balanceSheetCategory,
          'Main Accounts': mainAccounts,
          'Sub Accounts': subAccount || ''
        }))
      })

      const ws = XLSX.utils.json_to_sheet(flatData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Chart of Accounts")
      
      // Set column widths
      ws['!cols'] = [
        { wch: 25 },
        { wch: 35 },
        { wch: 45 },
        { wch: 45 }
      ]

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `chart-of-accounts-${timestamp}.xlsx`
      
      XLSX.writeFile(wb, filename)
      
      toast.success("Export Successful", {
        description: `Excel file "${filename}" has been downloaded.`
      })
    } catch (error) {
      console.error("Export error:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to export to Excel"
      toast.error("Export Failed", {
        description: errorMessage
      })
    } finally {
      setExportLoading(false)
    }
  }

  // Export to PDF
  const exportToPDF = async () => {
    try {
      setExportLoading(true)
      
      // Get all data for export
      const response = await axios.get('/api/accounts/all', {
        timeout: 30000 // 30 second timeout for large exports
      })
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to fetch export data")
      }
      
      const exportData = response.data.data || []
      
      if (exportData.length === 0) {
        toast.error("No data to export")
        return
      }
      
      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default
      
      // Create a temporary div for PDF generation
      const tempDiv = document.createElement('div')
      tempDiv.id = 'pdf-content'
      tempDiv.style.cssText = 'visibility: hidden; position: absolute; left: -9999px; top: 0;'
      document.body.appendChild(tempDiv)
      
      // Create PDF content with better formatting
      const tableRows = exportData.map(item => {
        const balanceSheetCode = item.balanceSheetCode || ''
        const balanceSheetCategory = item.balanceSheetCategory || ''
        const mainAccounts = item.mainAccounts || ''
        const subAccounts = Array.isArray(item.subAccounts) ? item.subAccounts : []
        
        return `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px; border: 1px solid #ddd; font-size: 10px;">${balanceSheetCode}</td>
            <td style="padding: 8px; border: 1px solid #ddd; font-size: 10px;">${balanceSheetCategory}</td>
            <td style="padding: 8px; border: 1px solid #ddd; font-size: 10px;">${mainAccounts}</td>
            <td style="padding: 8px; border: 1px solid #ddd; font-size: 10px;">
              ${subAccounts.length > 0 
                ? subAccounts.map(sub => `<div style="margin-bottom: 3px;">${sub || ''}</div>`).join('')
                : '<span style="color: #888;">No sub-accounts</span>'
              }
            </td>
          </tr>
        `
      }).join('')
      
      tempDiv.innerHTML = `
        <div style="padding: 15px; font-family: Arial, sans-serif;">
          <h1 style="text-align: center; color: #4F46E5; margin-bottom: 15px; font-size: 16px;">Chart of Accounts</h1>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #EEF2FF;">
                <th style="padding: 8px; text-align: left; border: 1px solid #ddd; font-size: 11px;">Balance Sheet Codes</th>
                <th style="padding: 8px; text-align: left; border: 1px solid #ddd; font-size: 11px;">Balance Sheet Category</th>
                <th style="padding: 8px; text-align: left; border: 1px solid #ddd; font-size: 11px;">Main Accounts</th>
                <th style="padding: 8px; text-align: left; border: 1px solid #ddd; font-size: 11px;">Sub Accounts</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      `
      
      const opt = {
        margin: 8,
        filename: `chart-of-accounts-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
          scale: 1.5, 
          useCORS: true,
          letterRendering: true,
          allowTaint: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'landscape',
          compress: true
        }
      }
      
      await html2pdf().from(tempDiv).set(opt).save()
      
      // Clean up the temporary div
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv)
      }
      
      toast.success("Export Successful", {
        description: "PDF file has been downloaded."
      })
    } catch (error) {
      console.error("PDF export error:", error)
      const errorMessage = error.message || "Failed to export to PDF"
      toast.error("Export Failed", {
        description: errorMessage
      })
    } finally {
      setExportLoading(false)
    }
  }

  // Generate pagination numbers with improved logic
  const paginationItems = () => {
    const items = []
    const delta = 2 // Number of pages to show around current page
    
    if (totalPages <= 1) return items
    
    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink 
          isActive={currentPage === 1}
          onClick={() => handlePageChange(1)}
          className="cursor-pointer"
        >
          1
        </PaginationLink>
      </PaginationItem>
    )
    
    // Add ellipsis if needed
    if (currentPage > delta + 2) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }
    
    // Add pages around current page
    const start = Math.max(2, currentPage - delta)
    const end = Math.min(totalPages - 1, currentPage + delta)
    
    for (let i = start; i <= end; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={currentPage === i}
            onClick={() => handlePageChange(i)}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }
    
    // Add ellipsis if needed
    if (currentPage < totalPages - delta - 1) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink 
            isActive={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }
    
    return items
  }

  // Loading spinner component
  const LoadingSpinner = ({ size = "w-8 h-8" }) => (
    <div className={`${size} border-4 border-indigo-600 border-t-transparent rounded-full animate-spin`} />
  )

  // Error display component
  const ErrorDisplay = ({ message, onRetry }) => (
    <div className="text-center py-16">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <p className="text-red-600 mb-4">{message}</p>
      {onRetry && (
        <Button 
          onClick={onRetry}
          variant="outline"
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          Try Again
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center bg-indigo-50 py-6 rounded-2xl shadow-sm">
          <h1 className="text-3xl font-bold text-indigo-800">Chart of Accounts</h1>
          {totalItems > 0 && (
            <p className="text-indigo-600 mt-2">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
            </p>
          )}
        </div>

        {/* Export Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button 
            onClick={exportToExcel} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || exportLoading || accountData.length === 0}
          >
            {exportLoading ? (
              <LoadingSpinner size="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Export to Excel
          </Button>
          <Button 
            onClick={exportToPDF} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || exportLoading || accountData.length === 0}
          >
            {exportLoading ? (
              <LoadingSpinner size="w-4 h-4" />
            ) : (
              <File className="w-4 h-4" />
            )}
            Export to PDF
          </Button>
        </div>

        {/* Accounts Table */}
        <Card className="overflow-hidden bg-white shadow-xl rounded-2xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <LoadingSpinner />
                </div>
              ) : error ? (
                <ErrorDisplay 
                  message={error} 
                  onRetry={() => fetchAccountData(currentPage)}
                />
              ) : accountData.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No account data available</p>
                </div>
              ) : (
                <>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-indigo-50 border-b border-indigo-100">
                        {[
                          'Balance Sheet Codes',
                          'Balance Sheet Category',
                          'Main Accounts',
                          'Sub Accounts'
                        ].map((header) => (
                          <th 
                            key={header}
                            className="px-6 py-4 text-left text-sm font-semibold text-indigo-800 border-r border-indigo-100 last:border-r-0"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {accountData.map((item, index) => {
                        const balanceSheetCode = item?.balanceSheetCode || ''
                        const balanceSheetCategory = item?.balanceSheetCategory || ''
                        const mainAccounts = item?.mainAccounts || ''
                        const subAccounts = Array.isArray(item?.subAccounts) ? item.subAccounts : []
                        
                        return (
                          <tr 
                            key={`${index}-${balanceSheetCode}`}
                            className="border-b border-gray-100 hover:bg-indigo-50/50 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm whitespace-nowrap border-r border-gray-100">
                              {balanceSheetCode}
                            </td>
                            <td className="px-6 py-4 text-sm border-r border-gray-100">
                              {balanceSheetCategory}
                            </td>
                            <td className="px-6 py-4 text-sm border-r border-gray-100">
                              {mainAccounts}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div className="space-y-2">
                                {subAccounts.length > 0 ? (
                                  subAccounts.map((subAccount, idx) => (
                                    <div key={idx} className="break-words">
                                      {subAccount || ''}
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-gray-400">No sub-accounts</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="py-4 bg-white border-t border-gray-100">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => handlePageChange(currentPage - 1)}
                              className={
                                currentPage === 1 
                                  ? "pointer-events-none opacity-50" 
                                  : "cursor-pointer hover:bg-indigo-50"
                              }
                            />
                          </PaginationItem>
                          
                          {paginationItems()}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => handlePageChange(currentPage + 1)}
                              className={
                                currentPage === totalPages 
                                  ? "pointer-events-none opacity-50" 
                                  : "cursor-pointer hover:bg-indigo-50"
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SiegwerkAccountsView
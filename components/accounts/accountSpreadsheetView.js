"use client"
import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  FileText, 
  FileSpreadsheet, 
  Download, 
  AlertCircle, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Database
} from "lucide-react"
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

const ChartOfAccountsView = () => {
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
        timeout: 10000
      })
      
      if (response.data?.success) {
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

  // Prepare export data
  const prepareExportData = (data) => {
    return data.flatMap(item => {
      const balanceSheetCode = item.balanceSheetCode || ''
      const balanceSheetCategory = item.balanceSheetCategory || ''
      const mainAccounts = item.mainAccounts || ''
      const subAccounts = Array.isArray(item.subAccounts) ? item.subAccounts : []
      
      if (subAccounts.length === 0) {
        return [{
          'Balance Sheet Code': balanceSheetCode,
          'Balance Sheet Category': balanceSheetCategory,
          'Main Account': mainAccounts,
          'Sub Account': ''
        }]
      }
      
      return subAccounts.map(subAccount => ({
        'Balance Sheet Code': balanceSheetCode,
        'Balance Sheet Category': balanceSheetCategory,
        'Main Account': mainAccounts,
        'Sub Account': subAccount || ''
      }))
    })
  }

  // Export to Excel - Fixed version
  const exportToExcel = async () => {
    try {
      setExportLoading(true)
      
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('Export is only available in browser environment')
      }
      
      const response = await axios.get('/api/accounts/all', {
        timeout: 30000
      })
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to fetch export data")
      }
      
      const exportData = response.data.data || []
      
      if (exportData.length === 0) {
        toast.warning("No data available for export")
        return
      }
      
      // Dynamic import with proper error handling
      let XLSX
      try {
        // Try different import methods
        if (typeof window !== 'undefined' && window.XLSX) {
          XLSX = window.XLSX
        } else {
          const xlsxModule = await import('xlsx')
          XLSX = xlsxModule.default || xlsxModule
        }
      } catch (importError) {
        console.error('Failed to load XLSX library:', importError)
        throw new Error('Excel export library not available. Please ensure XLSX is properly installed.')
      }
      
      const flatData = prepareExportData(exportData)
      
      // Create worksheet and workbook
      const ws = XLSX.utils.json_to_sheet(flatData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Chart of Accounts")
      
      // Set column widths
      ws['!cols'] = [
        { wch: 20 },
        { wch: 30 },
        { wch: 40 },
        { wch: 40 }
      ]

      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `chart-of-accounts-${timestamp}.xlsx`
      
      // Write file with error handling
      try {
        XLSX.writeFile(wb, filename)
        toast.success("Excel export completed", {
          description: `File "${filename}" has been downloaded successfully.`
        })
      } catch (writeError) {
        console.error('Error writing Excel file:', writeError)
        throw new Error('Failed to generate Excel file')
      }
      
    } catch (error) {
      console.error("Excel export error:", error)
      toast.error("Excel export failed", {
        description: error.message || "Failed to export to Excel. Please check your internet connection and try again."
      })
    } finally {
      setExportLoading(false)
    }
  }

  // Export to PDF - Fixed version
  const exportToPDF = async () => {
    try {
      setExportLoading(true)
      
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('Export is only available in browser environment')
      }
      
      const response = await axios.get('/api/accounts/all', {
        timeout: 30000
      })
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to fetch export data")
      }
      
      const exportData = response.data.data || []
      
      if (exportData.length === 0) {
        toast.warning("No data available for export")
        return
      }
      
      // Dynamic import with proper error handling
      let html2pdf
      try {
        if (typeof window !== 'undefined' && window.html2pdf) {
          html2pdf = window.html2pdf
        } else {
          const html2pdfModule = await import('html2pdf.js')
          html2pdf = html2pdfModule.default || html2pdfModule
        }
      } catch (importError) {
        console.error('Failed to load html2pdf library:', importError)
        throw new Error('PDF export library not available. Please ensure html2pdf.js is properly installed.')
      }
      
      // Create temporary element
      const tempDiv = document.createElement('div')
      tempDiv.style.cssText = 'position: absolute; left: -9999px; top: 0; visibility: hidden; width: 210mm;'
      document.body.appendChild(tempDiv)
      
      try {
        const tableRows = exportData.map(item => {
          const balanceSheetCode = item.balanceSheetCode || ''
          const balanceSheetCategory = item.balanceSheetCategory || ''
          const mainAccounts = item.mainAccounts || ''
          const subAccounts = Array.isArray(item.subAccounts) ? item.subAccounts : []
          
          return `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-size: 10px; word-wrap: break-word; max-width: 50mm;">${balanceSheetCode}</td>
              <td style="padding: 8px; border: 1px solid #ddd; font-size: 10px; word-wrap: break-word; max-width: 60mm;">${balanceSheetCategory}</td>
              <td style="padding: 8px; border: 1px solid #ddd; font-size: 10px; word-wrap: break-word; max-width: 70mm;">${mainAccounts}</td>
              <td style="padding: 8px; border: 1px solid #ddd; font-size: 10px; word-wrap: break-word; max-width: 70mm;">
                ${subAccounts.length > 0 
                  ? subAccounts.map(sub => `<div style="margin-bottom: 2px;">${sub || ''}</div>`).join('')
                  : '<span style="color: #888;">—</span>'
                }
              </td>
            </tr>
          `
        }).join('')
        
        tempDiv.innerHTML = `
          <div style="padding: 20px; font-family: 'Segoe UI', Arial, sans-serif; width: 100%;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #1e40af; margin: 0; font-size: 18px; font-weight: bold;">Chart of Accounts</h1>
              <p style="color: #64748b; margin: 5px 0 0 0; font-size: 12px;">Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed;">
              <thead>
                <tr style="background-color: #f1f5f9;">
                  <th style="padding: 10px; text-align: left; border: 1px solid #ddd; font-size: 11px; font-weight: bold; color: #1e40af; width: 20%;">Balance Sheet Code</th>
                  <th style="padding: 10px; text-align: left; border: 1px solid #ddd; font-size: 11px; font-weight: bold; color: #1e40af; width: 25%;">Category</th>
                  <th style="padding: 10px; text-align: left; border: 1px solid #ddd; font-size: 11px; font-weight: bold; color: #1e40af; width: 27.5%;">Main Account</th>
                  <th style="padding: 10px; text-align: left; border: 1px solid #ddd; font-size: 11px; font-weight: bold; color: #1e40af; width: 27.5%;">Sub Accounts</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>
        `
        
        const opt = {
          margin: [10, 10, 10, 10],
          filename: `chart-of-accounts-${new Date().toISOString().split('T')[0]}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 1.5, 
            useCORS: true,
            letterRendering: true,
            allowTaint: true,
            scrollX: 0,
            scrollY: 0
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'landscape'
          }
        }
        
        await html2pdf().from(tempDiv).set(opt).save()
        
        toast.success("PDF export completed", {
          description: "PDF file has been downloaded successfully."
        })
      } finally {
        // Always clean up the temporary element
        if (document.body.contains(tempDiv)) {
          document.body.removeChild(tempDiv)
        }
      }
      
    } catch (error) {
      console.error("PDF export error:", error)
      toast.error("PDF export failed", {
        description: error.message || "Failed to export to PDF. Please check your internet connection and try again."
      })
    } finally {
      setExportLoading(false)
    }
  }

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = []
    const delta = 2
    
    if (totalPages <= 1) return items
    
    // First page
    items.push(
      <PaginationItem key="first">
        <PaginationLink 
          isActive={currentPage === 1}
          onClick={() => handlePageChange(1)}
          className="cursor-pointer hover:bg-secondary"
        >
          1
        </PaginationLink>
      </PaginationItem>
    )
    
    // Left ellipsis
    if (currentPage > delta + 2) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }
    
    // Pages around current
    const start = Math.max(2, currentPage - delta)
    const end = Math.min(totalPages - 1, currentPage + delta)
    
    for (let i = start; i <= end; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={currentPage === i}
            onClick={() => handlePageChange(i)}
            className="cursor-pointer hover:bg-secondary"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }
    
    // Right ellipsis
    if (currentPage < totalPages - delta - 1) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }
    
    // Last page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink 
            isActive={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
            className="cursor-pointer hover:bg-secondary"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }
    
    return items
  }

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  const ErrorState = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-primary mb-6 max-w-md">{message}</p>
      <Button 
        onClick={onRetry}
        variant="outline"
        className="text-red-600 border-red-300 hover:bg-red-50"
      >
        Try Again
      </Button>
    </div>
  )

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Database className="w-12 h-12 text-primary mb-4" />
      <h3 className="text-lg font-semibold text-secondary mb-2">No Data Available</h3>
      <p className="text-primary">There are no account records to display at this time.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-muted p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Chart of Accounts</h1>
          <p className="text-primary">Manage and view your organizational account structure</p>
          {totalItems > 0 && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-secondary rounded-full text-primary text-sm font-medium">
              Showing {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
            </div>
          )}
        </div>

        {/* Actions Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <span className="text-sm text-primary">Account Management System</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={exportToExcel} 
              className="bg-primary hover:bg-primary/80 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              disabled={loading || exportLoading || accountData.length === 0}
            >
              {exportLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 mr-2" />
              )}
              Export Excel
            </Button>
            
            <Button 
              onClick={exportToPDF} 
              className="bg-primary hover:bg-primary/80 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              disabled={loading || exportLoading || accountData.length === 0}
            >
              {exportLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Export PDF
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-0">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorState 
                message={error} 
                onRetry={() => fetchAccountData(currentPage)}
              />
            ) : accountData.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-primary to-primary text-white">
                      {[
                        'Balance Sheet Code',
                        'Balance Sheet Category', 
                        'Main Account',
                        'Sub Accounts'
                      ].map((header) => (
                        <th 
                          key={header}
                          className="px-6 py-4 text-left text-sm font-semibold tracking-wide first:rounded-tl-lg last:rounded-tr-lg"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {accountData.map((item, index) => {
                      const balanceSheetCode = item?.balanceSheetCode || ''
                      const balanceSheetCategory = item?.balanceSheetCategory || ''
                      const mainAccounts = item?.mainAccounts || ''
                      const subAccounts = Array.isArray(item?.subAccounts) ? item.subAccounts : []
                      
                      return (
                        <tr 
                          key={`${index}-${balanceSheetCode}`}
                          className="hover:bg-secondary/50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            {balanceSheetCode}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {balanceSheetCategory}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {mainAccounts}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {subAccounts.length > 0 ? (
                              <div className="space-y-1">
                                {subAccounts.map((subAccount, idx) => (
                                  <div 
                                    key={idx} 
                                    className="px-2 py-1 bg-secondary rounded text-primary font-semibold text-xs"
                                  >
                                    {subAccount || '—'}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">No sub-accounts</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && !loading && !error && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={
                      currentPage === 1 
                        ? "pointer-events-none opacity-50" 
                        : "cursor-pointer hover:bg-secondary"
                    }
                  />
                </PaginationItem>
                
                {generatePaginationItems()}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={
                      currentPage === totalPages 
                        ? "pointer-events-none opacity-50" 
                        : "cursor-pointer hover:bg-secondary"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChartOfAccountsView
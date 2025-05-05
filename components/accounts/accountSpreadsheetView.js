"use client"
import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { File, FileText } from "lucide-react"
import axios from "axios"
import { toast } from 'sonner'
import html2pdf from 'html2pdf.js'
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
  const itemsPerPage = 20

  // Fetch account data with pagination
  const fetchAccountData = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      // Get paginated data
      const response = await axios.get(`/api/accounts/paged?page=${page}&limit=${itemsPerPage}`)
      
      if (response.data.success) {
        setAccountData(response.data.data)
        setTotalPages(Math.ceil(response.data.pagination.total / itemsPerPage))
      } else {
        throw new Error(response.data.message || "Failed to fetch data")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load account data. Please try again.")
      toast.error("Error loading data", {
        description: error.message || "Something went wrong. Please try again."
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchAccountData(page)
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
      const response = await axios.get('/api/accounts/all')
      const exportData = response.data.data
      
      const flatData = exportData.flatMap(item => {
        if (item.subAccounts.length === 0) {
          return [{
            'Balance Sheet Codes': item.balanceSheetCode,
            'Balance Sheet Category': item.balanceSheetCategory,
            'Main Accounts': item.mainAccounts,
            'Sub Accounts': ''
          }]
        }
        return item.subAccounts.map(subAccount => ({
          'Balance Sheet Codes': item.balanceSheetCode,
          'Balance Sheet Category': item.balanceSheetCategory,
          'Main Accounts': item.mainAccounts,
          'Sub Accounts': subAccount
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

      XLSX.writeFile(wb, "chart-of-accounts.xlsx")
      
      toast.success("Export Successful", {
        description: "Your Excel file has been downloaded."
      })
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Export Failed", {
        description: "Failed to export to Excel. Please try again."
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
      const response = await axios.get('/api/accounts/all')
      const exportData = response.data.data


      console.log("Export Data:", exportData)
      
      // Create a temporary div for PDF generation
      const tempDiv = document.createElement('div')
      tempDiv.id = 'pdf-content'
      tempDiv.style.visibility = 'hidden'
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      document.body.appendChild(tempDiv)
      
      // Create PDF content with better formatting
      tempDiv.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="text-align: center; color: #4F46E5; margin-bottom: 20px;">Chart of Accounts</h1>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background-color: #EEF2FF;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Balance Sheet Codes</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Balance Sheet Category</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Main Accounts</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Sub Accounts</th>
              </tr>
            </thead>
            <tbody>
              ${exportData.map(item => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px; border: 1px solid #ddd;">${item.balanceSheetCode}</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${item.balanceSheetCategory}</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${item.mainAccounts}</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">
                    ${item.subAccounts.length > 0 
                      ? item.subAccounts.map(sub => `<div style="margin-bottom: 5px;">${sub}</div>`).join('')
                      : '<span style="color: #888;">No sub-accounts</span>'
                    }
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `
      
      // Dynamically import html2pdf
      
      const opt = {
        margin: 10,
        filename: 'chart-of-accounts.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      }
      
      html2pdf().from(tempDiv).set(opt).save().then(() => {
        // Clean up the temporary div
        document.body.removeChild(tempDiv)
        
        toast.success("Export Successful", {
          description: "Your PDF file has been downloaded."
        })
      })
    } catch (error) {
      console.error("PDF export error:", error)
      toast.error("Export Failed", {
        description: "Failed to export to PDF. Please try again."
      })
    } finally {
      setExportLoading(false)
    }
  }

  // Generate pagination numbers
  const paginationItems = () => {
    const items = []
    
    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink 
          isActive={currentPage === 1}
          onClick={() => handlePageChange(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    )
    
    // Add ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }
    
    // Add pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i <= totalPages - 1 && i >= 2) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={currentPage === i}
              onClick={() => handlePageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }
    }
    
    // Add ellipsis if needed
    if (currentPage < totalPages - 2) {
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
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }
    
    return items
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center bg-indigo-50 py-6 rounded-2xl shadow-sm">
          <h1 className="text-3xl font-bold text-indigo-800">Chart of Accounts</h1>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button 
            onClick={exportToExcel} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            disabled={loading || exportLoading}
          >
            {exportLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Export to Excel
          </Button>
          <Button 
            onClick={exportToPDF} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            disabled={loading || exportLoading}
          >
            {exportLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <File className="w-4 h-4" />
            )}
            Export to PDF
          </Button>
        </div>

        {/* Accounts Table */}
        <Card className="overflow-hidden bg-white shadow-xl rounded-2xl">
          <CardContent className="p-0">
            <div id="accounts-content" className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center py-16 text-red-500">
                  {error}
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
                      {accountData.map((item, index) => (
                        <tr 
                          key={index}
                          className="border-b border-gray-100 hover:bg-indigo-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm whitespace-nowrap border-r border-gray-100">
                            {item.balanceSheetCode}
                          </td>
                          <td className="px-6 py-4 text-sm border-r border-gray-100">
                            {item.balanceSheetCategory}
                          </td>
                          <td className="px-6 py-4 text-sm border-r border-gray-100">
                            {item.mainAccounts}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="space-y-2">
                              {item.subAccounts.length > 0 ? (
                                item.subAccounts.map((subAccount, idx) => (
                                  <div key={idx}>
                                    {subAccount}
                                  </div>))
                              ) : (
                                <span className="text-gray-400">No sub-accounts</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Pagination */}
                  <div className="py-4 bg-white border-t border-gray-100">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {paginationItems()}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
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
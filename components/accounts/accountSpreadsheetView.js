"use client"
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { File, FileText } from "lucide-react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"

// Dynamic imports for performance
let html2pdf
let XLSX

const SiegwerkAccountsView = () => {
  const [loading, setLoading] = useState(true)
  const [accountData, setAccountData] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      import('html2pdf.js'),
      import('xlsx')
    ]).then(([html2pdfModule, XLSXModule]) => {
      html2pdf = html2pdfModule.default
      XLSX = XLSXModule
    }).catch(err => console.error("Error loading modules:", err))

    fetchAccountData()
  }, [])

  const fetchAccountData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data concurrently from the four endpoints
      const [mbscdRes, bscdRes, macnoRes, acnoRes] = await Promise.all([
        axios.get("/api/accounts/mbscd"),
        axios.get("/api/accounts/bscd"),
        axios.get("/api/accounts/macno"),
        axios.get("/api/accounts/acno")
      ])

      const mbscdData = mbscdRes.data.data
      const bscdData = bscdRes.data.data
      const macnoData = macnoRes.data.data
      const acnoData = acnoRes.data.data

      // Build the hierarchical structure on the frontend
      const formattedData = []

      for (const l1 of mbscdData) {
        // Filter level 2 (bscd) for this mbscd
        const level2Items = bscdData.filter(l2 => l2.mbscd === l1.bscd)

        for (const l2 of level2Items) {
          // Filter level 3 (macno) for this bscd
          const level3Items = macnoData.filter(l3 => l3.bscd === l2.bscd)

          for (const l3 of level3Items) {
            // Filter level 4 (acno) for this macno
            const level4Items = acnoData.filter(l4 => l4.macno === l3.macno)

            formattedData.push({
              balanceSheetCode: `${l1.bscd} ${l1.bscdDetail}`,
              balanceSheetCategory: `${l2.bscd} ${l2.bscdDetail}`,
              mainAccounts: `${l3.macno} ${l3.macname}`,
              subAccounts: level4Items.map(acc => `${acc.acno} ${acc.acname}`)
            })
          }
        }
      }

      setAccountData(formattedData)
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load account data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const exportToExcel = () => {
    if (!XLSX) return

    const flatData = accountData.flatMap(item => {
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
    
    ws['!cols'] = [
      { wch: 25 },
      { wch: 35 },
      { wch: 45 },
      { wch: 45 }
    ]

    XLSX.writeFile(wb, "chart-of-accounts.xlsx")
  }

  const exportToPDF = () => {
    if (!html2pdf) return
    
    const element = document.getElementById('accounts-content')
    const opt = {
      margin: 0.5,
      filename: 'chart-of-accounts.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    }
    html2pdf().set(opt).from(element).save()
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center bg-indigo-50 py-6 rounded-2xl shadow-sm"
        >
          <h1 className="text-3xl font-bold text-indigo-800">SIEGWERK PAKISTAN LIMITED</h1>
          <h2 className="text-xl font-semibold text-indigo-600 mt-2">Chart of Accounts</h2>
        </motion.div>

        {/* Export Buttons */}
        <motion.div 
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-end gap-3"
        >
          <Button 
            onClick={exportToExcel} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            disabled={loading}
          >
            <FileText className="w-4 h-4" />
            Export to Excel
          </Button>
          <Button 
            onClick={exportToPDF} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            disabled={loading}
          >
            <File className="w-4 h-4" />
            Export to PDF
          </Button>
        </motion.div>

        {/* Accounts Table */}
        <Card className="overflow-hidden bg-white shadow-xl rounded-2xl">
          <CardContent className="p-0">
            <div id="accounts-content" className="overflow-x-auto">
              <AnimatePresence>
                {loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center py-16"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"
                    />
                  </motion.div>
                ) : error ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 text-red-500"
                  >
                    {error}
                  </motion.div>
                ) : (
                  <motion.table 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full border-collapse"
                  >
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
                        <motion.tr 
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
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
                                  <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2, delay: idx * 0.1 }}
                                  >
                                    {subAccount}
                                  </motion.div>))
                              ) : (
                                <span className="text-gray-400">No sub-accounts</span>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </motion.table>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

export default SiegwerkAccountsView
'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusCircle, Trash2, Save, X, Search, ChevronDown, Edit, Plus, Trash } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { VOUCHER_CONFIG } from './constants'
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function VoucherForm({ type, onClose }) {
  const voucherConfig = VOUCHER_CONFIG[type]
  const [masterData, setMasterData] = useState({})
  const [mainLines, setMainLines] = useState([{}])
  const [deductionLines, setDeductionLines] = useState([{}])
  const [selectedRows, setSelectedRows] = useState([])
  const [allRowsSelected, setAllRowsSelected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('main')
  const [totals, setTotals] = useState({
    mainTotal: 0,
    deductionTotal: 0,
    netTotal: 0,
    debitTotal: 0,
    creditTotal: 0
  })

  // Set current date as default for date fields when component mounts
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const defaultMasterData = {}
    voucherConfig.masterFields.forEach(field => {
      if (field.type === 'date' && field.name === 'dateD') {
        defaultMasterData[field.name] = today
      }
    })
    setMasterData(prevData => ({ ...prevData, ...defaultMasterData }))
  }, [voucherConfig.masterFields])

  // Calculate totals based on the type of voucher
  useEffect(() => {
    if (type === 'journal') {
      const debitTotal = mainLines.reduce((sum, line) => 
        sum + (parseFloat(line.debit_amt || 0)), 0)
      const creditTotal = mainLines.reduce((sum, line) => 
        sum + (parseFloat(line.credit_amt || 0)), 0)
      
      setTotals({
        debitTotal,
        creditTotal,
        mainTotal: 0,
        deductionTotal: 0,
        netTotal: 0
      })
    } else {
      const mainTotal = mainLines.reduce((sum, line) => 
        sum + (parseFloat(line.amount || 0)), 0)
      const deductionTotal = deductionLines.reduce((sum, line) => 
        sum + (parseFloat(line.amount || 0)), 0)
      
      setTotals({
        mainTotal,
        deductionTotal,
        netTotal: mainTotal - deductionTotal,
        debitTotal: 0,
        creditTotal: 0
      })
    }
  }, [mainLines, deductionLines, type])

  const handleMasterChange = (e) => {
    const { name, value } = e.target
    setMasterData({
      ...masterData,
      [name]: value
    })
  }

  const handleSelectChange = (name, value) => {
    setMasterData({
      ...masterData,
      [name]: value
    })
  }

  const handleLineChange = (index, field, value, isMain = true) => {
    if (isMain) {
      const newLines = [...mainLines]
      newLines[index] = { ...newLines[index], [field]: value }
      setMainLines(newLines)
    } else {
      const newLines = [...deductionLines]
      newLines[index] = { ...newLines[index], [field]: value }
      setDeductionLines(newLines)
    }
  }

  const addLine = (isMain = true) => {
    if (isMain) {
      setMainLines([...mainLines, {}])
    } else {
      setDeductionLines([...deductionLines, {}])
    }
  }

  const removeLine = (index, isMain = true) => {
    if (isMain) {
      const newLines = [...mainLines]
      newLines.splice(index, 1)
      setMainLines(newLines.length ? newLines : [{}])
    } else {
      const newLines = [...deductionLines]
      newLines.splice(index, 1)
      setDeductionLines(newLines.length ? newLines : [{}])
    }
  }

  const toggleRowSelection = (index, isMain = true) => {
    const currentLines = isMain ? mainLines : deductionLines
    const newSelectedRows = [...selectedRows]
    
    const rowKey = `${isMain ? 'main' : 'deduction'}-${index}`
    const rowIndex = newSelectedRows.indexOf(rowKey)
    
    if (rowIndex === -1) {
      newSelectedRows.push(rowKey)
    } else {
      newSelectedRows.splice(rowIndex, 1)
    }
    
    setSelectedRows(newSelectedRows)
  }

  const toggleAllRowSelection = (isMain = true) => {
    const currentLines = isMain ? mainLines : deductionLines
    
    if (selectedRows.length === currentLines.length) {
      // If all rows are selected, deselect all
      setSelectedRows([])
      setAllRowsSelected(false)
    } else {
      // Select all rows
      const allRowKeys = currentLines.map((_, index) => 
        `${isMain ? 'main' : 'deduction'}-${index}`
      )
      setSelectedRows(allRowKeys)
      setAllRowsSelected(true)
    }
  }

  const isRowSelected = (index, isMain = true) => {
    const rowKey = `${isMain ? 'main' : 'deduction'}-${index}`
    return selectedRows.includes(rowKey)
  }

  const deleteSelectedRows = (isMain = true) => {
    const currentLines = isMain ? mainLines : deductionLines
    const newLines = currentLines.filter((_, index) => 
      !isRowSelected(index, isMain)
    )
    
    if (isMain) {
      setMainLines(newLines.length ? newLines : [{}])
    } else {
      setDeductionLines(newLines.length ? newLines : [{}])
    }
    
    setSelectedRows([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = {
      master: masterData,
      lines: mainLines,
      deductions: voucherConfig.hasDeductionBlock ? deductionLines : []
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Uncomment for actual API call
      /*
      const response = await fetch(`/api/voucher/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error('Error submitting form')
      }
      */
      
      setIsLoading(false)
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
      setIsLoading(false)
    }
  }

  const renderMasterFields = () => {
    const fields = voucherConfig.masterFields || []

    // Split fields into two rows maximum
    const firstRowFields = fields.slice(0, Math.ceil(fields.length / 2))
    const secondRowFields = fields.slice(Math.ceil(fields.length / 2))

    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {firstRowFields.map((field) => (
            <div key={field.name} className="flex flex-col space-y-1.5">
              <Label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              
              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={masterData[field.name] || ''}
                  onChange={handleMasterChange}
                />
              ) : field.type === 'select' ? (
                <Select 
                  value={masterData[field.name] || ''} 
                  onValueChange={(value) => handleSelectChange(field.name, value)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    value={masterData[field.name] || ''}
                    onChange={handleMasterChange}
                    className="h-9"
                  />
                  {field.type === 'date' && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.5 1H3V2H4.5V1ZM11.5 2V1H10V2H11.5ZM4.5 3H3V4H4.5V3ZM11.5 4V3H10V4H11.5ZM1 6.5H14V5H1V6.5ZM1 7.5V13.5H14V7.5H1ZM3 2V1H1.5V3.5H3V2ZM5.5 1V3.5H9V1H5.5ZM11 2V3.5H13V1.5H11.5V2H11Z" fill="currentColor" />
                      </svg>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {secondRowFields.map((field) => (
            <div key={field.name} className="flex flex-col space-y-1.5">
              <Label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              
              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={masterData[field.name] || ''}
                  onChange={handleMasterChange}
                />
              ) : field.type === 'select' ? (
                <Select 
                  value={masterData[field.name] || ''} 
                  onValueChange={(value) => handleSelectChange(field.name, value)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    value={masterData[field.name] || ''}
                    onChange={handleMasterChange}
                    className="h-9"
                  />
                  {field.type === 'date' && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.5 1H3V2H4.5V1ZM11.5 2V1H10V2H11.5ZM4.5 3H3V4H4.5V3ZM11.5 4V3H10V4H11.5ZM1 6.5H14V5H1V6.5ZM1 7.5V13.5H14V7.5H1ZM3 2V1H1.5V3.5H3V2ZM5.5 1V3.5H9V1H5.5ZM11 2V3.5H13V1.5H11.5V2H11Z" fill="currentColor" />
                      </svg>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  const renderTable = (isMain = true) => {
    const fields = isMain 
      ? (type === 'journal' ? voucherConfig.journalFields : type === 'payment' ? voucherConfig.paymentFields : voucherConfig.receiptFields) 
      : voucherConfig.deductionFields
    
    const lines = isMain ? mainLines : deductionLines
    
    const title = isMain 
      ? (type === 'journal' ? "Journal" : type === 'payment' ? "Payment" : "Receipt") 
      : "Deductions"
    
    const animateRow = {
      hidden: { opacity: 0, y: 20 },
      visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: i * 0.05,
          duration: 0.3,
          type: "spring",
          stiffness: 100
        }
      })
    }

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-6 border rounded-md shadow-sm bg-white overflow-hidden"
      >
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-3 flex justify-between items-center border-b">
          <div className="font-medium flex items-center">
            <Badge variant="outline" className="mr-2 bg-white">
              {lines.length}
            </Badge>
            {title}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
           
            
            <div className="flex gap-1 flex-wrap justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button" 
                      onClick={() => deleteSelectedRows(isMain)}
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs bg-white hover:bg-red-50 hover:text-red-600 transition-colors"
                      disabled={selectedRows.length === 0}
                    >
                      <Trash className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete selected rows</TooltipContent>
                </Tooltip>
              
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-white hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit selected row</TooltipContent>
                </Tooltip>
              
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      onClick={() => addLine(isMain)}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs flex items-center bg-white hover:bg-green-50 hover:text-green-600 transition-colors"
                    >
                      <Plus size={14} className="mr-1" />
                      Add Row
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add new row</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 text-xs border-b">
                <th className="p-2 w-10">
                  <div className="flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedRows.length === lines.length && lines.length > 0}
                      onChange={() => toggleAllRowSelection(isMain)}
                    />
                  </div>
                </th>
                <th className="p-2 w-10">
                  <div className="flex justify-center text-gray-500">
                    #
                  </div>
                </th>
                {fields.map((field) => (
                  <th key={field.name} className="p-2 text-left font-semibold whitespace-nowrap">
                    {field.label}
                  </th>
                ))}
                <th className="p-2 w-10">
                  <div className="flex justify-center">
                    <Trash2 size={14} className="text-gray-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {lines.map((line, idx) => (
                  <motion.tr
                    key={idx}
                    custom={idx}
                    initial="hidden"
                    animate="visible"
                    variants={animateRow}
                    exit={{ opacity: 0, x: -20 }}
                    className={`border-b hover:bg-blue-50 transition-colors ${isRowSelected(idx, isMain) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="p-1 text-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={isRowSelected(idx, isMain)}
                        onChange={() => toggleRowSelection(idx, isMain)}
                      />
                    </td>
                    <td className="p-1 text-center">
                      <span className="text-xs text-gray-500">{idx + 1}</span>
                    </td>
                    {fields.map((field) => (
                      <td key={field.name} className="p-1">
                        <Input
                          type={field.type}
                          value={line[field.name] || ''}
                          onChange={(e) => handleLineChange(idx, field.name, e.target.value, isMain)}
                          className="h-8 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </td>
                    ))}
                    <td className="p-1 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                        onClick={() => removeLine(idx, isMain)}
                      >
                        <X size={14} />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        <div className="p-2 bg-gradient-to-r from-slate-50 to-slate-100 flex justify-between items-center text-sm">
          <div className="flex items-center">
            {selectedRows.length > 0 && (
              <Badge variant="secondary" className="mr-2">
                {selectedRows.length} selected
              </Badge>
            )}
          </div>
          <div>
            {type === 'journal' ? (
              isMain && (
                <div className="text-right flex flex-wrap gap-x-4 justify-end">
                  <Badge variant="outline" className="font-medium mr-2">
                    Debit: {totals.debitTotal.toFixed(2)}
                  </Badge>
                  <Badge variant="outline" className="font-medium">
                    Credit: {totals.creditTotal.toFixed(2)}
                  </Badge>
                </div>
              )
            ) : (
              <div>
                {isMain ? (
                  <Badge variant="outline" className="font-medium">
                    Total {type === 'payment' ? 'Payment' : 'Received'}: {totals.mainTotal.toFixed(2)}
                  </Badge>
                ) : (
                  <div className="flex flex-wrap gap-x-4 justify-end">
                    <Badge variant="outline" className="font-medium mr-2">
                      Deduction: {totals.deductionTotal.toFixed(2)}
                    </Badge>
                    <Badge variant="secondary" className="font-medium">
                      Net {type === 'payment' ? 'Payment' : 'Received'}: {totals.netTotal.toFixed(2)}
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // For responsive design, use tabs on smaller screens for main/deduction tables
  const renderMobileLayout = () => {
    return (
      <div className="mt-6">
        <Tabs defaultValue="main" onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="main" className="flex-1">
              {type === 'journal' ? 'Journal' : type === 'payment' ? 'Payment' : 'Receipt'}
            </TabsTrigger>
            {voucherConfig.hasDeductionBlock && (
              <TabsTrigger value="deduction" className="flex-1">
                Deductions
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="main" className="mt-0">
            {renderTable(true)}
          </TabsContent>
          {voucherConfig.hasDeductionBlock && (
            <TabsContent value="deduction" className="mt-0">
              {renderTable(false)}
            </TabsContent>
          )}
        </Tabs>
      </div>
    )
  }

  return (
    <div className="max-w-full">
    
      
      <div className="p-4 bg-white">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="border rounded-md p-4 mb-6 shadow-sm bg-slate-50"
        >
          <h2 className="text-lg font-semibold mb-4 capitalize border-b pb-2 text-gray-700">
            {type === 'journal' ? 'Journal / Adjustment Voucher' : `${type} Voucher`} Details
          </h2>
          {renderMasterFields()}
        </motion.div>
        
        {/* Desktop layout */}
        <div className="hidden sm:block">
          {renderTable(true)}
          {voucherConfig.hasDeductionBlock && renderTable(false)}
        </div>
        
        {/* Mobile layout */}
        <div className="sm:hidden">
          {renderMobileLayout()}
        </div>
      </div>
      <motion.div 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-2 flex gap-3 justify-end border-b "
      >
       
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="bg-white hover:bg-gray-100 transition-colors"
          >
            <X size={16} className="mr-1" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Save size={16} className="mr-1" />
            )}
            Create
          </Button>
      </motion.div>
    </div>
  )
}
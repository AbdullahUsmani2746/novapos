'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusCircle, Trash2, Save, X, ChevronDown, Edit, Plus, Trash } from 'lucide-react'
// Remove the wildcard import and import each component individually
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { VOUCHER_CONFIG } from './constants'

export default function VoucherForm({ type, onClose }) {
  const voucherConfig = VOUCHER_CONFIG[type]
  const [masterData, setMasterData] = useState({})
  const [mainLines, setMainLines] = useState([{}])
  const [deductionLines, setDeductionLines] = useState([{}])
  const [selectedRows, setSelectedRows] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [totals, setTotals] = useState({})

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const defaultMasterData = voucherConfig.masterFields.reduce((acc, field) => ({
      ...acc,
      [field.name]: field.type === 'date' && field.name === 'dateD' ? today : ''
    }), {})
    setMasterData(defaultMasterData)
  }, [voucherConfig])

  useEffect(() => {
    if (voucherConfig.totals) {
      const calculatedTotals = Object.entries(voucherConfig.totals).reduce((acc, [key, config]) => {
        acc[key] = config.calculate(mainLines, acc)
        return acc
      }, {})
      setTotals(calculatedTotals)
    }
  }, [mainLines, voucherConfig])

  const handleMasterChange = (e) => {
    const { name, value } = e.target
    setMasterData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setMasterData(prev => ({ ...prev, [name]: value }))
  }

  const calculateFieldValue = (line, fieldConfig) => {
    if (!fieldConfig.calculate) return line[fieldConfig.name] || ''
    const dependencies = fieldConfig.dependencies?.reduce((acc, dep) => ({
      ...acc,
      [dep]: parseFloat(line[dep]) || 0
    }), {})
    return fieldConfig.calculate(dependencies)
  }

  const handleLineChange = (index, fieldName, value, isMain = true) => {
    const lines = isMain ? [...mainLines] : [...deductionLines]
    const fieldConfig = voucherConfig[isMain ? 'lineFields' : 'deductionFields']
      .find(f => f.name === fieldName)

    const newLine = {
      ...lines[index],
      [fieldName]: fieldConfig?.type === 'number' ? parseFloat(value) || 0 : value
    }

    voucherConfig[isMain ? 'lineFields' : 'deductionFields'].forEach(fConfig => {
      if (fConfig.dependencies?.includes(fieldName)) {
        newLine[fConfig.name] = calculateFieldValue(newLine, fConfig)
      }
    })

    lines[index] = newLine
    isMain ? setMainLines(lines) : setDeductionLines(lines)
  }

  const addLine = (isMain = true) => {
    isMain ? setMainLines([...mainLines, {}]) : setDeductionLines([...deductionLines, {}])
  }

  const removeLine = (index, isMain = true) => {
    const newLines = isMain ? [...mainLines] : [...deductionLines]
    newLines.splice(index, 1)
    isMain ? setMainLines(newLines) : setDeductionLines(newLines)
  }

  const toggleRowSelection = (index, isMain = true) => {
    const rowKey = `${isMain ? 'main' : 'deduction'}-${index}`
    setSelectedRows(prev => prev.includes(rowKey)
      ? prev.filter(k => k !== rowKey)
      : [...prev, rowKey])
  }

  const toggleAllRowSelection = (isMain = true) => {
    const currentLines = isMain ? mainLines : deductionLines
    setSelectedRows(prev => prev.length === currentLines.length
      ? []
      : currentLines.map((_, i) => `${isMain ? 'main' : 'deduction'}-${i}`))
  }

  const deleteSelectedRows = (isMain = true) => {
    const newLines = (isMain ? mainLines : deductionLines)
      .filter((_, i) => !selectedRows.includes(`${isMain ? 'main' : 'deduction'}-${i}`))
    isMain ? setMainLines(newLines) : setDeductionLines(newLines)
    setSelectedRows([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const formData = {
        master: masterData,
        lines: mainLines,
        deductions: voucherConfig.hasDeductionBlock ? deductionLines : []
      }
      await fetch(`/api/voucher/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      onClose()
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderInputField = (line, fieldConfig, index, isMain) => {
    const value = calculateFieldValue(line, fieldConfig)
    return (
      <Input
        type={fieldConfig.type}
        value={typeof value === 'number' ? value.toFixed(2) : value}
        onChange={(e) => handleLineChange(index, fieldConfig.name, e.target.value, isMain)}
        readOnly={fieldConfig.readOnly}
        disabled={fieldConfig.readOnly}
        className="h-8 text-xs"
      />
    )
  }

  const renderMasterFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {voucherConfig.masterFields.map((field) => (
        <div key={field.name} className="flex flex-col space-y-1.5">
          <Label className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {field.type === 'textarea' ? (
            <textarea
              name={field.name}
              className="h-20 w-full rounded-md border p-2"
              value={masterData[field.name] || ''}
              onChange={handleMasterChange}
            />
          ) : field.type === 'select' ? (
            <Select
              value={masterData[field.name] || ''}
              onValueChange={(v) => handleSelectChange(field.name, v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder={`Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {['Option 1', 'Option 2', 'Option 3'].map(opt => (
                  <SelectItem key={opt} value={opt.toLowerCase()}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              type={field.type}
              value={masterData[field.name] || ''}
              onChange={handleMasterChange}
              className="h-9"
            />
          )}
        </div>
      ))}
    </div>
  )

  const renderTable = (isMain = true) => {
    const fields = isMain ? voucherConfig.lineFields : voucherConfig.deductionFields
    const lines = isMain ? mainLines : deductionLines

    return (
      <motion.div className="mt-6 border rounded-md shadow-sm bg-white overflow-hidden">
        <div className="bg-gray-50 p-3 flex justify-between items-center border-b">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{lines.length}</Badge>
            <span className="font-medium">
              {isMain ? type.charAt(0).toUpperCase() + type.slice(1) : 'Deductions'}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteSelectedRows(isMain)}
              disabled={!selectedRows.length}
            >
              <Trash className="h-4 w-4 mr-1" /> Delete
            </Button>
            <Button variant="outline" size="sm" onClick={() => addLine(isMain)}>
              <Plus className="h-4 w-4 mr-1" /> Add Row
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-xs border-b">
                <th className="p-2 w-10">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === lines.length}
                    onChange={() => toggleAllRowSelection(isMain)}
                  />
                </th>
                <th className="p-2 w-10">#</th>
                {fields.map(field => (
                  <th key={field.name} className="p-2 text-left font-medium">
                    {field.label}
                  </th>
                ))}
                <th className="p-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-1 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(`${isMain ? 'main' : 'deduction'}-${idx}`)}
                      onChange={() => toggleRowSelection(idx, isMain)}
                    />
                  </td>
                  <td className="p-1 text-center text-sm">{idx + 1}</td>
                  {fields.map(field => (
                    <td key={field.name} className="p-1">
                      {renderInputField(line, field, idx, isMain)}
                    </td>
                  ))}
                  <td className="p-1 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(idx, isMain)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {voucherConfig.totals && (
          <div className="bg-gray-50 p-2 flex justify-end gap-4">
            {Object.entries(voucherConfig.totals).map(([key, config]) => (
              <div key={key} className="text-right">
                <div className="text-sm font-medium">
                  {config.label}: {totals[key]?.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="max-w-full">
      <div className="p-4 bg-white">
        <Card className="mb-6">
          <h2 className="text-lg font-semibold p-4 border-b">
            {type.charAt(0).toUpperCase() + type.slice(1)} Voucher Details
          </h2>
          <CardContent className="p-4">
            {renderMasterFields()}
          </CardContent>
        </Card>

        {renderTable(true)}
        {voucherConfig.hasDeductionBlock && renderTable(false)}
      </div>

      <div className="p-4 border-t flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          <X className="h-4 w-4 mr-1" /> Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2">↻</span> Saving...
            </span>
          ) : (
            <><Save className="h-4 w-4 mr-1" /> Create Voucher</>
          )}
        </Button>
      </div>
    </div>
  )
}
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { REPORT_CONFIG } from './config';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  DownloadIcon, 
  FilterIcon, 
  RefreshCwIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  BarChart3Icon,
  CalendarIcon,
  SearchIcon,
  XIcon,
  EyeIcon,
  ChevronLeftIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  FileIcon
} from 'lucide-react';

const ReportViewer = ({ reportType }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [config, setConfig] = useState(null);
  const [filters, setFilters] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const [date, setDate] = useState({ from: null, to: null });
  const [showFilters, setShowFilters] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!reportType) return;

    const reportConfig = REPORT_CONFIG[reportType];
    if (!reportConfig) {
      console.error('Invalid report type:', reportType);
      return;
    }

    setConfig(reportConfig);

    const initialFilters = {};
    reportConfig.filters.forEach(filter => {
      const value = searchParams.get(filter.name);
      if (value !== null) {
        if (filter.type === 'date') {
          if (filter.name.includes('From')) {
            initialFilters.dateFrom = value;
          } else if (filter.name.includes('To')) {
            initialFilters.dateTo = value;
          }
        } else {
          initialFilters[filter.name] = filter.type === 'checkbox' ? value === 'true' : value;
        }
      } else if (filter.default !== undefined) {
        initialFilters[filter.name] = filter.default;
      }
    });
    setFilters(initialFilters);

    if (initialFilters.dateFrom || initialFilters.dateTo) {
      setDate({
        from: initialFilters.dateFrom ? new Date(initialFilters.dateFrom) : null,
        to: initialFilters.dateTo ? new Date(initialFilters.dateTo) : null
      });
    }

    loadFilterOptions(reportConfig.filters, initialFilters);
  }, [reportType, searchParams]);

  useEffect(() => {
    if (config && Object.keys(filters).length > 0) {
      loadReportData();
    }
  }, [config, filters]);

  const loadFilterOptions = async (filterDefs, currentFilters) => {
    const options = {};
    
    for (const filter of filterDefs) {
      if (filter.options && filter.apiEndpoint) {
        try {
          let endpoint = filter.apiEndpoint;
          
          if (filter.dependsOn) {
            const dependentValue = currentFilters[filter.dependsOn];
            if (!dependentValue) continue;
            endpoint += `${endpoint.includes('?') ? '&' : '?'}${filter.dependsOn}=${dependentValue}`;
          }

          const res = await fetch(endpoint);
          const data = await res.json();
          options[filter.name] = Array.isArray(data) ? data : data.data || [];
        } catch (error) {
          console.error(`Error loading options for ${filter.name}:`, error);
          options[filter.name] = [];
        }
      }
    }

    setFilterOptions(options);
  };

  const loadReportData = async () => {
    if (!config) return;

    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value);
        }
      });

      const res = await fetch(`${config.apiEndpoint}?${params.toString()}`);
      const reportData = await res.json();

      setData(reportData.data || []);
      setSummary(reportData.summary || {});
    } catch (error) {
      console.error('Error loading report data:', error);
      setData([]);
      setSummary({});
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== '') {
        params.append(key, val);
      }
    });
    router.replace(`?${params.toString()}`);
  };

  const handleDateChange = (range) => {
    setDate(range);
    if (range?.from) {
      handleFilterChange('dateFrom', range.from.toISOString());
    }
    if (range?.to) {
      handleFilterChange('dateTo', range.to.toISOString());
    }
  };

  const handleRowClick = (row) => {
    if (config.detailColumns) {
      setDetailRow(row);
      setShowDetails(true);
    }
  };

  const handleExport = async (format) => {
    if (!data || data.length === 0) return;

    setIsExporting(true);
    
    try {
      switch (format) {
        case 'excel':
          await exportToExcel();
          break;
        case 'pdf':
          await exportToPDF();
          break;
        case 'csv':
          await exportToCSV();
          break;
        default:
          break;
      }
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    const worksheet = XLSX.utils.json_to_sheet(data.map(item => {
      const row = {};
      config.columns.forEach(col => {
        if (col.valueGetter) {
          row[col.headerName] = col.valueGetter({ row: item });
        } else {
          row[col.headerName] = item[col.field];
        }
      });
      return row;
    }));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, config.title);
    XLSX.writeFile(workbook, `${config.title}.xlsx`);
  };

  const exportToPDF = async () => {
    const doc = new jsPDF();
    doc.text(config.title, 14, 16);
    
    const headers = config.columns.map(col => col.headerName);
    const rows = data.map(item => 
      config.columns.map(col => {
        if (col.valueGetter) {
          return col.valueGetter({ row: item });
        }
        return item[col.field];
      })
    );

    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save(`${config.title}.pdf`);
  };

  const exportToCSV = async () => {
    const headers = config.columns.map(col => col.headerName).join(',');
    const rows = data.map(item => 
      config.columns.map(col => {
        if (col.valueGetter) {
          return `"${col.valueGetter({ row: item }) || ''}"`;
        }
        return `"${item[col.field] || ''}"`;
      }).join(',')
    ).join('\n');

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${config.title}.csv`);
  };

  const renderFilter = (filter) => {
    switch (filter.type) {
      case 'date':
        return (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              {filter.label}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  {date?.from ? (
                    date.to ? (
                      <span className="text-gray-900">
                        {format(date.from, 'MMM dd, yyyy')} - {format(date.to, 'MMM dd, yyyy')}
                      </span>
                    ) : (
                      <span className="text-gray-900">{format(date.from, 'MMM dd, yyyy')}</span>
                    )
                  ) : (
                    <span className="text-gray-500">Select date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 shadow-lg border-gray-200" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={handleDateChange}
                  numberOfMonths={2}
                  className="rounded-lg"
                />
              </PopoverContent>
            </Popover>
          </div>
        );
      case 'select':
        return (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FilterIcon className="w-4 h-4" />
              {filter.label}
            </Label>
            <Select
              value={filters[filter.name] || ''}
              onValueChange={(value) => handleFilterChange(filter.name, value)}
            >
              <SelectTrigger className="border-gray-200 hover:border-gray-300 focus:border-blue-500 transition-colors">
                <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent className="shadow-lg border-gray-200">
                {filter.clearable && (
                  <SelectItem value="All" className="text-gray-600">
                    All {filter.label.toLowerCase()}
                  </SelectItem>
                )}
                {(filterOptions[filter.name] || []).map((option) => (
                  <SelectItem 
                    key={option.value || option.id || option[filter.valueKey || 'value']} 
                    value={option.value || option.id || option[filter.valueKey || 'value']}
                    className="hover:bg-blue-50"
                  >
                    {option.label || option.name || option[filter.nameKey || 'label']}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Checkbox
              id={filter.name}
              checked={!!filters[filter.name]}
              onCheckedChange={(checked) => handleFilterChange(filter.name, checked)}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <Label htmlFor={filter.name} className="text-sm font-medium text-gray-700 cursor-pointer">
              {filter.label}
            </Label>
          </div>
        );
      default:
        return (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <SearchIcon className="w-4 h-4" />
              {filter.label}
            </Label>
            <Input
              value={filters[filter.name] || ''}
              onChange={(e) => handleFilterChange(filter.name, e.target.value)}
              placeholder={`Enter ${filter.label.toLowerCase()}`}
              className="border-gray-200 hover:border-gray-300 focus:border-blue-500 transition-colors"
            />
          </div>
        );
    }
  };

  const renderSummaryCard = (field, value) => {
    const isPositive = typeof value === 'number' && value > 0;
    const Icon = isPositive ? TrendingUpIcon : TrendingDownIcon;
    
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium text-gray-600">{field.label}</Label>
          <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-100' : 'bg-blue-100'}`}>
            <Icon className={`w-4 h-4 ${isPositive ? 'text-green-600' : 'text-blue-600'}`} />
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {field.type === 'currency' ? formatCurrency(value) : 
           field.type === 'percent' ? `${value?.toFixed(2)}%` : 
           typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </div>
    );
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="shadow-lg border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-xl font-bold">Loading Report...</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{config.title}</h1>
              <p className="text-blue-100 text-lg">{config.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <BarChart3Icon className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        <Card className="shadow-lg border-gray-200 overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FilterIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Filters & Controls</CardTitle>
                  <CardDescription className="text-gray-600">
                    Customize your report view with filters and export options
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-gray-600 hover:text-gray-900"
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </CardHeader>
          
          {showFilters && (
            <CardContent className="p-8 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {config.filters.map((filter) => (
                  <div key={filter.name} className="bg-white p-4 rounded-xl border border-gray-200">
                    {renderFilter(filter)}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
          
          <CardFooter className="bg-white border-t border-gray-200 p-6">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Button 
                  onClick={loadReportData} 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {loading ? (
                    <>
                      <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCwIcon className="w-4 h-4 mr-2" />
                      Apply Filters
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                {config.exportOptions?.excel && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleExport('excel')}
                    disabled={isExporting}
                    className="border-gray-300 hover:bg-green-50 hover:border-green-300 transition-colors"
                  >
                    <FileSpreadsheetIcon className="w-4 h-4 mr-2 text-green-600" />
                    Excel
                  </Button>
                )}
                
                {config.exportOptions?.pdf && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                    className="border-gray-300 hover:bg-red-50 hover:border-red-300 transition-colors"
                  >
                    <FileTextIcon className="w-4 h-4 mr-2 text-red-600" />
                    PDF
                  </Button>
                )}
                
                {config.exportOptions?.csv && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleExport('csv')}
                    disabled={isExporting}
                    className="border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <FileIcon className="w-4 h-4 mr-2 text-blue-600" />
                    CSV
                  </Button>
                )}
              </div>
            </div>
          </CardFooter>
        </Card>

        {summary && Object.keys(summary).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.summaryFields.map((field) => (
              <div key={field.field}>
                {renderSummaryCard(field, summary[field.field])}
              </div>
            ))}
          </div>
        )}

        <Card className="shadow-lg border-gray-200 overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BarChart3Icon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Report Data</CardTitle>
                  <CardDescription className="text-gray-600">
                    {data.length > 0 ? `${data.length} records found` : 'No data available'}
                  </CardDescription>
                </div>
              </div>
              {data.length > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                  {data.length} rows
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="hover:bg-gray-50">
                    {config.columns.map((column) => (
                      <TableHead 
                        key={column.field} 
                        className="font-semibold text-gray-700 border-b border-gray-200 px-6 py-4"
                      >
                        {column.headerName}
                      </TableHead>
                    ))}
                    {config.detailColumns && (
                      <TableHead className="font-semibold text-gray-700 border-b border-gray-200 px-6 py-4">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={config.columns.length + (config.detailColumns ? 1 : 0)} className="text-center py-12">
                        <div className="flex items-center justify-center gap-3">
                          <RefreshCwIcon className="w-5 h-5 animate-spin text-blue-600" />
                          <span className="text-gray-600">Loading data...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={config.columns.length + (config.detailColumns ? 1 : 0)} className="text-center py-12">
                        <div className="text-gray-500">
                          <BarChart3Icon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">No data found</p>
                          <p className="text-sm">Try adjusting your filters to see results</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((row, index) => (
                      <TableRow 
                        key={index} 
                        className={`hover:bg-gray-50 transition-colors ${
                          config.detailColumns ? 'cursor-pointer' : ''
                        } ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                        onClick={() => config.detailColumns && handleRowClick(row)}
                      >
                        {config.columns.map((column) => (
                          <TableCell key={column.field} className="px-6 py-4 text-gray-900 border-b border-gray-100">
                            {column.valueGetter ? column.valueGetter({ row }) : row[column.field]}
                          </TableCell>
                        ))}
                        {config.detailColumns && (
                          <TableCell className="px-6 py-4 border-b border-gray-100">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(row);
                              }}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {showDetails && detailRow && (
          <Card className="shadow-2xl border-gray-200 fixed inset-4 z-50 overflow-auto bg-white">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-bold">Transaction Details</CardTitle>
                  <CardDescription className="text-indigo-100">
                    Detailed view of selected transaction
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowDetails(false)}
                  className="text-white hover:bg-white/20"
                >
                  <XIcon className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      {config.detailColumns.map((column) => (
                        <TableHead key={column.field} className="font-semibold text-gray-700">
                          {column.headerName}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailRow.transactions.map((line, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        {config.detailColumns.map((column) => (
                          <TableCell key={column.field} className="text-gray-900">
                            {column.valueGetter ? column.valueGetter({ row: line }) : line[column.field]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value || 0);
};

export default ReportViewer;
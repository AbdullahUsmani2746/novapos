export const VOUCHER_CONFIG = {
  payment: {
    code: 2,
    hasDeductionBlock: true,
    masterFields: [
      { name: 'dateD', label: 'Date', type: 'date', required: true },
      { name: 'tran_code', label: 'Transaction Code', type: 'text' },
      { name: 'voucher_no', label: 'Voucher#', type: 'text', required: true },
      { name: 'bank_ac', label: 'Bank A/c', type: 'select', options: 'bankAccounts' },
      { name: 'cheque_no', label: 'Cheque No.', type: 'text' },
      { name: 'cheque_date', label: 'Cheque Date', type: 'date' },
      { name: 'narration', label: 'Narration', type: 'textarea' }
    ],
    lineFields: [
      { name: 'ac_name', label: 'A/c Name', type: 'select', options: 'accounts' },
      { name: 'cost_center', label: 'Cost Center', type: 'select', options: 'costCenters' },
      { name: 'invoice_no', label: 'Invoice No', type: 'text' },
      { name: 'cheque_no', label: 'Cheque No', type: 'text' },
      { name: 'wht_percent', label: 'WHT %', type: 'number' },
      { name: 'remarks', label: 'Remarks', type: 'text' },
      { 
        name: 'amount', 
        label: 'Amount', 
        type: 'number',
        dependencies: ['wht_percent'],
        calculate: (values) => values.amount * (1 - (values.wht_percent / 100))
      }
    ],
    deductionFields: [
      { name: 'ac_name', label: 'A/C Name', type: 'select', options: 'accounts' },
      { name: 'cost_center', label: 'Cost Center', type: 'select', options: 'costCenters' },
      { name: 'invoice_no', label: 'Invoice No', type: 'text' },
      { name: 'remarks', label: 'Remarks', type: 'text' },
      { name: 'amount', label: 'Amount', type: 'number' }
    ],
    totals: {
      mainTotal: {
        label: 'Payment Total',
        calculate: (lines) => lines.reduce((sum, line) => sum + (line.amount || 0), 0)
      },
      deductionTotal: {
        label: 'Deduction Total',
        calculate: (lines) => lines.reduce((sum, line) => sum + (line.amount || 0), 0)
      },
      netTotal: {
        label: 'Net Payment',
        calculate: (lines, totals) => totals.mainTotal - totals.deductionTotal
      }
    },
    tableFields: ['dateD', 'tran_no', 'vr_no', 'pycd', 'rmk']
  },
  receipt: {
    code: 1,
    hasDeductionBlock: true,
    masterFields: [
      { name: 'dateD', label: 'Date', type: 'date', required: true },
      { name: 'tran_code', label: 'Transaction Code', type: 'text' },
      { name: 'voucher_no', label: 'Voucher#', type: 'text', required: true },
      { name: 'pycd', label: 'Paid From', type: 'select', options: 'accounts' },
      { name: 'cheque_ref_no', label: 'Cheque/Ref No.', type: 'text' },
      { name: 'cheque_date', label: 'Cheque Date', type: 'date' },
      { name: 'narration', label: 'Narration', type: 'textarea' }
    ],
    lineFields: [
      { name: 'ac_name', label: 'A/c Name', type: 'select', options: 'accounts' },
      { name: 'cost_center', label: 'Cost Center', type: 'select', options: 'costCenters' },
      { name: 'invoice_no', label: 'Invoice No', type: 'text' },
      { name: 'wht_percent', label: 'WHT %', type: 'number' },
      { name: 'cheque_ref_no', label: 'Cheque/Ref No.', type: 'text' },
      { name: 'narration', label: 'Narration', type: 'text' },
      { 
        name: 'amount', 
        label: 'Amount', 
        type: 'number',
        dependencies: ['wht_percent'],
        calculate: (values) => values.amount * (1 - (values.wht_percent / 100))
      }
    ],
    deductionFields: [
      { name: 'ac_name', label: 'A/C Name', type: 'select', options: 'accounts' },
      { name: 'cost_center', label: 'Cost Center', type: 'select', options: 'costCenters' },
      { name: 'invoice_no', label: 'Invoice No', type: 'text' },
      { name: 'remarks', label: 'Remarks', type: 'text' },
      { name: 'amount', label: 'Amount', type: 'number' }
    ],
    totals: {
      mainTotal: {
        label: 'Receipt Total',
        calculate: (lines) => lines.reduce((sum, line) => sum + (line.amount || 0), 0)
      },
      deductionTotal: {
        label: 'Deduction Total',
        calculate: (lines) => lines.reduce((sum, line) => sum + (line.amount || 0), 0)
      },
      netTotal: {
        label: 'Net Receipt',
        calculate: (lines, totals) => totals.mainTotal - totals.deductionTotal
      }
    },
    tableFields: ['dateD', 'tran_no', 'vr_no', 'pycd', 'rmk']
  },
  journal: {
    code: 3,
    hasDeductionBlock: false,
    masterFields: [
      { name: 'tran_no', label: 'Transaction No.', type: 'text' },
      { name: 'dateD', label: 'Date', type: 'date', required: true },
      { name: 'voucher_no', label: 'Voucher No.', type: 'text', required: true },
      { name: 'remarks', label: 'Remarks', type: 'textarea' }
    ],
    lineFields: [
      { name: 'ac_name', label: 'A/C Name', type: 'select', options: 'accounts' },
      { name: 'invoice_no', label: 'Invoice No', type: 'text' },
      { name: 'remarks', label: 'Remarks', type: 'text' },
      { name: 'debit_amt', label: 'Debit Amt', type: 'number' },
      { name: 'credit_amt', label: 'Credit Amt', type: 'number' }
    ],
    totals: {
      debitTotal: {
        label: 'Total Debit',
        calculate: (lines) => lines.reduce((sum, line) => sum + (line.debit_amt || 0), 0)
      },
      creditTotal: {
        label: 'Total Credit',
        calculate: (lines) => lines.reduce((sum, line) => sum + (line.credit_amt || 0), 0)
      }
    },
    tableFields: ['dateD', 'tran_no', 'vr_no', 'rmk']
  },
  purchase: {
    code: 4,
    hasDeductionBlock: false,
    masterFields: [
      { name: 'dateD', label: 'Date', type: 'date', required: true },
      { name: 'tran_code', label: 'Trans Code', type: 'text' },
      { name: 'voucher_no', label: 'Voucher#', type: 'text', required: true },
      { name: 'supplier', label: 'Supplier', type: 'select', options: 'suppliers' },
      { name: 'invoice_no', label: 'Invoice No.', type: 'text' },
      { name: 'check_no', label: 'Check No.', type: 'text' },
      { name: 'check_date', label: 'Check Date', type: 'date' },
      { name: 'narration', label: 'Narration', type: 'textarea' }
    ],
    lineFields: [
      { 
        name: 'product', 
        label: 'Product', 
        type: 'select',
        options: 'products'
      },
      { 
        name: 'qty', 
        label: 'Qty', 
        type: 'number',
        dependencies: ['packs', 'qty_per_pack'],
        calculate: (values) => values.packs * values.qty_per_pack || values.qty
      },
      { name: 'packs', label: 'No. of Packs', type: 'number' },
      { name: 'qty_per_pack', label: 'Qty/Pack', type: 'number' },
      { name: 'rate', label: 'Rate', type: 'number' },
      {
        name: 'total',
        label: 'Amount',
        type: 'number',
        readOnly: true,
        dependencies: ['qty', 'rate'],
        calculate: (values) => values.qty * values.rate
      },
      {
        name: 'st_amount',
        label: 'ST Amount',
        type: 'number',
        readOnly: true,
        dependencies: ['total', 'st_rate'],
        calculate: (values) => values.total * (values.st_rate / 100)
      },
      { name: 'st_rate', label: 'ST Rate%', type: 'number' }
    ],
    totals: {
      grossTotal: {
        label: 'Gross Total',
        calculate: (lines) => lines.reduce((sum, line) => sum + (line.total || 0), 0)
      },
      taxTotal: {
        label: 'Total Tax',
        calculate: (lines) => lines.reduce((sum, line) => sum + (line.st_amount || 0), 0)
      },
      netTotal: {
        label: 'Net Total',
        calculate: (lines, totals) => totals.grossTotal + totals.taxTotal
      }
    },
    tableFields: ['dateD', 'voucher_no', 'supplier', 'total_amount']
  },
  sale: {
    code: 6,
    hasDeductionBlock: false,
    masterFields: [
      { name: 'dateD', label: 'Date', type: 'date', required: true },
      { name: 'tran_code', label: 'Trans Code', type: 'text' },
      { name: 'voucher_no', label: 'Voucher#', type: 'text', required: true },
      { name: 'customer', label: 'Customer', type: 'select', options: 'customers' },
      { name: 'invoice_no', label: 'Invoice No.', type: 'text' },
      { name: 'narration', label: 'Narration', type: 'textarea' }
    ],
    lineFields: [
      { 
        name: 'product', 
        label: 'Product', 
        type: 'select',
        options: 'products'
      },
      { name: 'qty', label: 'Qty', type: 'number' },
      { name: 'rate', label: 'Rate', type: 'number' },
      { name: 'discount', label: 'Discount%', type: 'number' },
      {
        name: 'total',
        label: 'Amount',
        type: 'number',
        readOnly: true,
        dependencies: ['qty', 'rate', 'discount'],
        calculate: (values) => {
          const total = values.qty * values.rate
          return total - (total * (values.discount / 100))
        }
      },
      {
        name: 'st_amount',
        label: 'ST Amount',
        type: 'number',
        readOnly: true,
        dependencies: ['total', 'st_rate'],
        calculate: (values) => values.total * (values.st_rate / 100)
      },
      { name: 'st_rate', label: 'ST Rate%', type: 'number' }
    ],
    totals: {
      grossTotal: {
        label: 'Gross Total',
        calculate: (lines) => lines.reduce((sum, line) => sum + (line.total || 0), 0)
      },
      taxTotal: {
        label: 'Total Tax',
        calculate: (lines) => lines.reduce((sum, line) => sum + (line.st_amount || 0), 0)
      },
      netTotal: {
        label: 'Net Total',
        calculate: (lines, totals) => totals.grossTotal + totals.taxTotal
      }
    },
    tableFields: ['dateD', 'voucher_no', 'customer', 'total_amount']
  }
};
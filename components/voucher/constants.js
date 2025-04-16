
  

  export const VOUCHER_CONFIG = {
    payment: {
      code: 2,
      hasDeductionBlock: true,
      masterFields: [
        { name: 'dateD', label: 'Date', type: 'date', required: true },
        { name: 'tran_code', label: 'Transaction Code', type: 'text' },
        { name: 'voucher_no', label: 'Voucher#', type: 'text', required: true },
        { name: 'bank_ac', label: 'Bank A/c', type: 'select' },
        { name: 'cheque_no', label: 'Cheque No.', type: 'text' },
        { name: 'cheque_date', label: 'Cheque Date', type: 'date' },
        { name: 'narration', label: 'Narration', type: 'textarea' }
      ],
      paymentFields: [
        { name: 'ac_name', label: 'A/c Name', type: 'text' },
        { name: 'cost_center', label: 'Cost Center', type: 'text' },
        { name: 'invoice_no', label: 'Invoice No', type: 'text' },
        { name: 'cheque_no', label: 'Cheque No', type: 'text' },
        { name: 'wht_percent', label: 'WHT %', type: 'number' },
        { name: 'remarks', label: 'Remarks', type: 'text' },
        { name: 'amount', label: 'Amount', type: 'number' }
      ],
      deductionFields: [
        { name: 'ac_name', label: 'A/C Name', type: 'text' },
        { name: 'cost_center', label: 'Cost Center', type: 'text' },
        { name: 'invoice_no', label: 'Invoice No', type: 'text' },
        { name: 'remarks', label: 'Remarks', type: 'text' },
        { name: 'amount', label: 'Amount', type: 'number' }
      ],
      tableFields: ['dateD', 'tran_no', 'vr_no', 'pycd', 'rmk']

    },
    receipt: {
      code: 1,
      hasDeductionBlock: true,
      masterFields: [
        { name: 'dateD', label: 'Date', type: 'date', required: true },
        { name: 'tran_code', label: 'Transaction Code', type: 'text' },
        { name: 'voucher_no', label: 'Voucher#', type: 'text', required: true },
        { name: 'paid_from', label: 'Paid From', type: 'select' },
        { name: 'cheque_ref_no', label: 'Cheque/Ref No.', type: 'text' },
        { name: 'cheque_date', label: 'Cheque Date', type: 'date' },
        { name: 'narration', label: 'Narration', type: 'textarea' },
        { name: 'exp_basis', label: 'Exp Basis', type: 'text' },
        { name: 'export_inv', label: 'Export Inv #', type: 'text' },
        { name: 'fwd_cont', label: 'FWD Cont #', type: 'text' },
        { name: 'fe_ref', label: 'FE Ref #', type: 'text' }
      ],
      receiptFields: [
        { name: 'ac_name', label: 'A/c Name', type: 'text' },
        { name: 'cost_center', label: 'Cost Center', type: 'text' },
        { name: 'invoice_no', label: 'Invoice No', type: 'text' },
        { name: 'wht_percent', label: 'WHT %', type: 'number' },
        { name: 'cheque_ref_no', label: 'Cheque/Ref No.', type: 'text' },
        { name: 'narration', label: 'Narration', type: 'text' },
        { name: 'nature', label: 'Nature', type: 'text' },
        { name: 'curr', label: 'CURR', type: 'text' },
        { name: 'fc_amount', label: 'FC Amount', type: 'number' },
        { name: 'amount', label: 'Amount', type: 'number' }
      ],
      deductionFields: [
        { name: 'ac_name', label: 'A/C Name', type: 'text' },
        { name: 'cost_center', label: 'Cost Center', type: 'text' },
        { name: 'invoice_no', label: 'Invoice No', type: 'text' },
        { name: 'remarks', label: 'Remarks', type: 'text' },
        { name: 'amount', label: 'Amount', type: 'number' }
      ],
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
      journalFields: [
        { name: 'ac_name', label: 'A/C Name', type: 'text' },
        { name: 'invoice_no', label: 'Invoice No', type: 'text' },
        { name: 'remarks', label: 'Remarks', type: 'text' },
        { name: 'debit_amt', label: 'Debit Amt', type: 'number' },
        { name: 'credit_amt', label: 'Credit Amt', type: 'number' }
      ],
      tableFields: ['dateD', 'tran_no', 'vr_no', 'rmk']

    }
  }
  
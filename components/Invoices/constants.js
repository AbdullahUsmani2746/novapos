
  

  export const INVOICE_CONFIG = {

    purchase:{
      code: 4,
      hasDeductionBlock: false,
      masterFields: [
        { name: 'tran_no', label: 'Transaction No.', type: 'text' },
        { name: 'dateD', label: 'Date', type: 'date', required: true },
        { name: 'voucher_no', label: 'Voucher No.', type: 'text', required: true },
        { name: 'remarks', label: 'Remarks', type: 'textarea' }
      ],
      transactionFields: [
        { name: 'ac_name', label: 'A/C Name', type: 'text' },
        { name: 'invoice_no', label: 'Invoice No', type: 'text' },
        { name: 'remarks', label: 'Remarks', type: 'text' },
        { name: 'debit_amt', label: 'Debit Amt', type: 'number' },
        { name: 'credit_amt', label: 'Credit Amt', type: 'number' }
      ],
      tableFields: ['dateD', 'tran_no', 'vr_no', 'rmk']

    },

   sale:{
      code: 6,
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
  
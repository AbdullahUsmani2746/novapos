export const voucherConfig = {
    payment: {
      tranCode: 2,
      fields: {
        main: [
          { name: 'dateD', label: 'Date', type: 'date' },
          { name: 'vr_no', label: 'VR No', type: 'number' },
          { name: 'pycd', label: 'Bank Account', type: 'acno-select' },
          { name: 'check_no', label: 'Check No', type: 'text' },
          { name: 'check_date', label: 'Check Date', type: 'date' },
          { name: 'rmk', label: 'Narration', type: 'text' }
        ],
        transactions: {
          subTranId: 1,
          fields: [
            { name: 'acno', label: 'Account', type: 'acno-select' },
            { name: 'camt', label: 'Amount', type: 'number' },
            { name: 'ccno', label: 'Cost Center', type: 'cost-center-select' },
            { name: 'invoice_no', label: 'Invoice No', type: 'text' }
          ]
        }
      }
    },
    receipt: {
      tranCode: 1,
      fields: {
        main: [
          { name: 'dateD', label: 'Date', type: 'date' },
          { name: 'vr_no', label: 'VR No', type: 'number' },
          { name: 'pycd', label: 'Received At', type: 'acno-select' },
          { name: 'check_no', label: 'Reference No', type: 'text' },
          { name: 'check_date', label: 'Reference Date', type: 'date' },
          { name: 'rmk', label: 'Narration', type: 'text' }
        ],
        transactions: {
          subTranId: 1,
          fields: [
            { name: 'acno', label: 'Account', type: 'acno-select' },
            { name: 'damt', label: 'Amount', type: 'number' },
            { name: 'ccno', label: 'Cost Center', type: 'cost-center-select' },
            { name: 'invoice_no', label: 'Invoice No', type: 'text' }
          ]
        }
      }
    },
    journal: {
      tranCode: 3,
      fields: {
        main: [
          { name: 'dateD', label: 'Date', type: 'date' },
          { name: 'vr_no', label: 'VR No', type: 'number' },
          { name: 'rmk1', label: 'Remarks', type: 'text' }
        ],
        transactions: {
          fields: [
            { name: 'acno', label: 'Account', type: 'acno-select' },
            { name: 'damt', label: 'Debit', type: 'number' },
            { name: 'camt', label: 'Credit', type: 'number' },
            { name: 'ccno', label: 'Cost Center', type: 'cost-center-select' }
          ]
        }
      }
    }
  };
import axios from "axios";
export const VOUCHER_CONFIG = {
  payment: {
    tran_code: 2,
    hasDeductionBlock: true,
    masterFields: [
      {
        name: "pycd",
        formName: "pycd",
        label: "Paid From",
        type: "select",
        options: "masterAccounts", // This is the key to store and access
        apiEndpoint: "/api/accounts/acno?macno=003,004",
        createEndpoint: "/api/accounts/acno",
        nameKey: "acname",
        valueKey: "acno",
        required: true,
        modalFields: [
          {
            name: "acname",
            label: "Account Name",
            type: "text",
            required: true,
          },
          {
            name: "acno",
            label: "Main Account",
            type: "select",
            options: "mainAccounts",
            apiEndpoint: "/api/accounts/acno?macno=003",
            valueKey: "acno",
            nameKey: "acname",
            required: true,
          },
        ],
      },
      {
        name: "dateD",
        label: "Date",
        type: "date",
        required: true,
      },
      {
        name: "vr_no",
        label: "Vr No",
        type: "text",
        required: true,
        autoGenerate: true,
      },
      { name: "check_no", label: "Check No", type: "text" },
      { name: "check_date", label: "Check Date", type: "date" },
      { name: "rmk", label: "Narration", type: "textarea" },
      // { name: "rmk1", label: "Export Inv From", type: "text" },
      // { name: "rmk2", label: "RMK1", type: "text" },
      // { name: "rmk3", label: "Fwd Cont#", type: "text" },
      // { name: "rmk4", label: "FE Ref#", type: "text" },
      // { name: "rmk5", label: "RMK5", type: "text" },
    ],
    lineFields: [
      {
        name: "acname",
        formName: "acno",
        label: "A/c Name",
        type: "select",
        options: "accounts",
        apiEndpoint: "/api/accounts/acno?excludeMacno=003,004",
        createEndpoint: "/api/accounts/acno",
        nameKey: "acname",
        valueKey: "acno",
        modalFields: [
          {
            name: "acname",
            label: "Account Name",
            type: "text",
            required: true,
          },
          {
            name: "macno",
            label: "Main Account",
            type: "select",
            options: "mainAccounts",
            apiEndpoint: "/api/accounts/macno",
            valueKey: "macno",
            nameKey: "macname",
            required: true,
          },
        ],
      },
      {
        name: "ccname",
        formName: "ccno",
        label: "Cost Center",
        type: "select",
        options: "costCenters",
        apiEndpoint: "/api/setup/cost_centers",
        createEndpoint: "/api/setup/cost_centers",
        nameKey: "ccname",
        valueKey: "ccno",
        modalFields: [
          {
            name: "ccname",
            label: "Cost Center Name",
            type: "text",
            required: true,
          },
        ],
      },
      { name: "invoice_no", label: "Invoice No", type: "text" },
      { name: "wht_rate", label: "WHT Rate", type: "number" },
      { name: "chno", label: "Check No", type: "text" },
      { name: "narration1", label: "Narration", type: "text" },
      { name: "narration2", label: "Narration2", type: "text" },
      {
        name: "currency",
        formName: "currency",
        label: "Currency",
        type: "select",
        options: "currencies",
        apiEndpoint: "/api/setup/currencies",
        createEndpoint: "/api/setup/currencies",
        nameKey: "currency",
        valueKey: "id",
        modalFields: [
          {
            name: "currency",
            label: "Currency Name",
            type: "text",
            required: true,
          },
        ],
      },
      { name: "fc_amount", label: "FC Amt", type: "number" },
      { name: "rate", label: "Exc Rate", type: "number" },
      {
        name: "damt",
        label: "Amount",
        type: "number",
        // dependencies: ["fc_amount", "rate"],
        calculate: (v) => v.fc_amount * v.rate,
        validate: (() => {
          let timeoutId;
          let lastValidatedValue = null;
          let pendingValidation = false;

          return async (value, line) => {
            // Skip if same as last validated value or already validating
            if (value === lastValidatedValue || pendingValidation) return null;

            // Clear any pending validation
            if (timeoutId) clearTimeout(timeoutId);

            // Return immediately for empty values
            if (!value || !line.invoice_no) {
              lastValidatedValue = value;
              return null;
            }

            // Set pending state
            pendingValidation = true;

            return new Promise((resolve) => {
              timeoutId = setTimeout(async () => {
                try {
                  const response = await axios.get(
                    `/api/voucher/check-amount?invoice_no=${line.invoice_no}&amount=${value}&camt=true`
                  );

                  lastValidatedValue = value;

                  if (!response.data.exists) {
                    resolve(`Invoice ${line.invoice_no} not found`);
                  } else if (!response.data.valid) {
                    resolve(
                      `Amount exceeds available balance (${response.data.availableBalance})`
                    );
                  } else {
                    resolve("null");
                  }
                } catch (error) {
                  resolve(`Validation error: ${error.message}`);
                } finally {
                  pendingValidation = false;
                }
              }, 800); // Increased debounce to 800ms for better UX
            });
          };
        })(),
      },
    ],
    deductionFields: [
      {
        name: "acname",
        formName: "acno",
        label: "A/c Name",
        type: "select",
        options: "accounts",
        apiEndpoint: "/api/accounts/acno?excludeMacno=003,004",
        createEndpoint: "/api/accounts/acno",
        nameKey: "acname",
        valueKey: "acno",
        modalFields: [
          {
            name: "acname",
            label: "Account Name",
            type: "text",
            required: true,
          },
          {
            name: "macno",
            label: "Main Account",
            type: "select",
            options: "mainAccounts",
            apiEndpoint: "/api/accounts/macno",
            valueKey: "macno",
            nameKey: "macname",
            required: true,
          },
        ],
      },
      {
        name: "ccname",
        formName: "ccno",
        label: "Cost Center",
        type: "select",
        options: "costCenters",
        apiEndpoint: "/api/setup/cost_centers",
        createEndpoint: "/api/setup/cost_centers",
        nameKey: "ccname",
        valueKey: "ccno",
        modalFields: [
          {
            name: "ccname",
            label: "Cost Center Name",
            type: "text",
            required: true,
          },
        ],
      },
      { name: "invoice_no", label: "Invoice No", type: "text" },
      { name: "wht_rate", label: "WHT Rate", type: "number" },
      { name: "chno", label: "Check No", type: "text" },
      { name: "narration1", label: "Narration", type: "text" },
      { name: "narration2", label: "Narration2", type: "text" },
      {
        name: "currency",
        formName: "currency",
        label: "Currency",
        type: "select",
        options: "currencies",
        apiEndpoint: "/api/setup/currencies",
        createEndpoint: "/api/setup/currencies",
        nameKey: "currency",
        valueKey: "id",
        modalFields: [
          {
            name: "currency",
            label: "Currency Name",
            type: "text",
            required: true,
          },
        ],
      },
      { name: "fc_amount", label: "FC Amt", type: "number" },
      { name: "rate", label: "Exc Rate", type: "number" },
      {
        name: "camt",
        label: "Amount",
        type: "number",
        dependencies: ["fc_amount", "rate"],
        calculate: (v) => v.fc_amount * v.rate,
      },
    ],
    totals: {
      mainTotal: {
        label: "Total Payments",
        calculate: (lines) => lines.reduce((sum, l) => sum + (l.damt || 0), 0),
      },
      deductionTotal: {
        label: "Total Deductions",
        calculate: (lines) => lines.reduce((sum, l) => sum + (l.camt || 0), 0),
      },
      netTotal: {
        label: "Net Payment",
        calculate: (_, t) => t.mainTotal - t.deductionTotal,
      },
    },
    balanceCheck: {
      condition: async (formData) => {
        // First check if net total is negative
        if (formData.totals.netTotal < 0) return false;

        // Then validate against API
        try {
          const response = await axios.get(
            "/api/reports/trialBalance?dateTo=2025-07-31T11:00:00.000Z"
          );
          let isValid = false;
          if (response.data.data) {
            response.data.data.forEach((data) => {
              if (data.acno === formData.master.pycd) {
                if (data.balance >= formData.totals.netTotal) {
                  isValid = true;
                }
              }
            });
          }

          return isValid;
        } catch (error) {
          console.error("Validation API error:", error);
          return false; // Fail-safe: don't allow if API fails
        }
      },
      errorMessage: (formData) => {
        if (formData.totals.netTotal < 0) {
          return `Net Receipt cannot be negative (Current: ${formData.totals.netTotal.toFixed(
            2
          )})`;
        }
        return "Net total exceeds available balance or violates business rules";
      },
    },

    tableFields: [
      { name: "dateD", label: "Date", type: "date" },
      { name: "tran_id", label: "Transaction No", type: "text" },
      { name: "vr_no", label: "Voucher No", type: "text" },
      {
        name: "pycd",
        label: "Paid From",
        type: "text",
        refApi: "/api/accounts/acno?acno=",
        refValueKey: "acno",
        refNameKey: "acname",
      },
      { name: "rmk", label: "Narration", type: "text" },
    ],
  },
  receipt: {
    tran_code: 1,
    hasDeductionBlock: true,
    masterFields: [
      {
        name: "pycd",
        formName: "pycd",
        label: "Received At",
        type: "select",
        options: "masterAccounts", // This is the key to store and access
        apiEndpoint: "/api/accounts/acno?macno=003,004",
        createEndpoint: "/api/accounts/acno",
        nameKey: "acname",
        valueKey: "acno",
        required: true,
        modalFields: [
          {
            name: "acname",
            label: "Account Name",
            type: "text",
            required: true,
          },
          {
            name: "macno",
            label: "Main Account",
            type: "select",
            options: "mainAccounts",
            apiEndpoint: "/api/accounts/macno",
            valueKey: "macno",
            nameKey: "macname",
            required: true,
          },
        ],
      },
      {
        name: "dateD",
        label: "Date",
        type: "date",
        required: true,
      },
      {
        name: "vr_no",
        label: "Vr No",
        type: "text",
        required: true,
        autoGenerate: true,
      },
      { name: "check_no", label: "Check No", type: "text" },
      { name: "check_date", label: "Check Date", type: "date" },
      { name: "rmk", label: "Narration", type: "textarea" },
      // { name: "rmk1", label: "Exp Basis", type: "text" },
      // { name: "rmk2", label: "Export INV#", type: "text" },
      // { name: "rmk3", label: "Fwd Cont#", type: "text" },
      // { name: "rmk5", label: "FE Ref#", type: "text" },
    ],
    lineFields: [
      {
        name: "acname",
        formName: "acno",
        label: "A/c Name",
        type: "select",
        options: "accounts",
        apiEndpoint: "/api/accounts/acno?excludeMacno=003,004",
        createEndpoint: "/api/accounts/acno",
        nameKey: "acname",
        valueKey: "acno",
        modalFields: [
          {
            name: "acname",
            label: "Account Name",
            type: "text",
            required: true,
          },
          {
            name: "macno",
            label: "Main Account",
            type: "select",
            options: "mainAccounts",
            apiEndpoint: "/api/accounts/macno",
            valueKey: "macno",
            nameKey: "macname",
            required: true,
          },
        ],
      },
      {
        name: "ccname",
        formName: "ccno",
        label: "Cost Center",
        type: "select",
        options: "costCenters",
        apiEndpoint: "/api/setup/cost_centers",
        createEndpoint: "/api/setup/cost_centers",
        nameKey: "ccname",
        valueKey: "ccno",
        modalFields: [
          {
            name: "ccname",
            label: "Cost Center Name",
            type: "text",
            required: true,
          },
        ],
      },
      // { name: "invoice_no", label: "Invoice No", type: "text" },
      {
        name: "invoice_no",
        formName: "invoice_no",
        label: "Invoice No",
        type: "select",
        options: "invoiceAccounts", // This is the key to store and access
        apiEndpoint: "/api/invoice/",
        createEndpoint: "/api/invoice/",
        nameKey: "display",
        valueKey: "invoice_no",
        required: true,
      },
      { name: "wht_rate", label: "WHT Rate", type: "number" },
      { name: "chno", label: "Check No", type: "text" },
      { name: "narration1", label: "Narration", type: "text" },
      { name: "narration2", label: "Narration2", type: "text" },
      {
        name: "currency",
        formName: "currency",
        label: "Currency",
        type: "select",
        options: "currencies",
        apiEndpoint: "/api/setup/currencies",
        createEndpoint: "/api/setup/currencies",
        nameKey: "currency",
        valueKey: "id",
        modalFields: [
          {
            name: "currency",
            label: "Currency Name",
            type: "text",
            required: true,
          },
        ],
      },
      { name: "fc_amount", label: "FC Amt", type: "number" },
      { name: "rate", label: "Exc Rate", type: "number" },
      {
        name: "camt",
        label: "Amount",
        type: "number",
        // dependencies: ["fc_amount", "rate"],
        calculate: (v) => v.fc_amount * v.rate,
        validate: (() => {
          let timeoutId;
          let lastValidatedValue = null;
          let pendingValidation = false;

          return async (value, line) => {
            // Skip if same as last validated value or already validating
            if (value === lastValidatedValue || pendingValidation) return null;

            // Clear any pending validation
            if (timeoutId) clearTimeout(timeoutId);

            // Return immediately for empty values
            if (!value || !line.invoice_no) {
              lastValidatedValue = value;
              return null;
            }

            // Set pending state
            pendingValidation = true;

            return new Promise((resolve) => {
              timeoutId = setTimeout(async () => {
                try {
                  const response = await axios.get(
                    `/api/voucher/check-amount?invoice_no=${line.invoice_no}&amount=${value}&damt=true`
                  );

                  lastValidatedValue = value;

                  if (!response.data.exists) {
                    resolve(`Invoice ${line.invoice_no} not found`);
                  } else if (!response.data.valid) {
                    resolve(
                      `Amount exceeds available balance (${response.data.availableBalance})`
                    );
                  } else {
                    resolve("null");
                  }
                } catch (error) {
                  resolve(`Validation error: ${error.message}`);
                } finally {
                  pendingValidation = false;
                }
              }, 800); // Increased debounce to 800ms for better UX
            });
          };
        })(),
      },
    ],
    deductionFields: [
      {
        name: "acname",
        formName: "acno",
        label: "A/c Name",
        type: "select",
        options: "accounts",
        apiEndpoint: "/api/accounts/acno?excludeMacno=003,004",
        createEndpoint: "/api/accounts/acno",
        nameKey: "acname",
        valueKey: "acno",
        modalFields: [
          {
            name: "acname",
            label: "Account Name",
            type: "text",
            required: true,
          },
          {
            name: "macno",
            label: "Main Account",
            type: "select",
            options: "mainAccounts",
            apiEndpoint: "/api/accounts/macno",
            valueKey: "macno",
            nameKey: "macname",
            required: true,
          },
        ],
      },
      {
        name: "ccname",
        formName: "ccno",
        label: "Cost Center",
        type: "select",
        options: "costCenters",
        apiEndpoint: "/api/setup/cost_centers",
        createEndpoint: "/api/setup/cost_centers",
        nameKey: "ccname",
        valueKey: "ccno",
        modalFields: [
          {
            name: "ccname",
            label: "Cost Center Name",
            type: "text",
            required: true,
          },
        ],
      },
      {
        name: "invoice_no",
        formName: "invoice_no",
        label: "Invoice No",
        type: "select",
        options: "invoiceAccounts", // This is the key to store and access
        apiEndpoint: "/api/invoice/",
        createEndpoint: "/api/invoice/",
        nameKey: "display",
        valueKey: "invoice_no",
        required: true,
      },
      { name: "wht_rate", label: "WHT Rate", type: "number" },
      { name: "chno", label: "Check No", type: "text" },
      { name: "narration1", label: "Narration", type: "text" },
      { name: "narration2", label: "Narration2", type: "text" },
      {
        name: "currency",
        formName: "currency",
        label: "Currency",
        type: "select",
        options: "currencies",
        apiEndpoint: "/api/setup/currencies",
        createEndpoint: "/api/setup/currencies",
        nameKey: "currency",
        valueKey: "id",
        modalFields: [
          {
            name: "currency",
            label: "Currency Name",
            type: "text",
            required: true,
          },
        ],
      },
      { name: "fc_amount", label: "FC Amt", type: "number" },
      { name: "rate", label: "Exc Rate", type: "number" },
      {
        name: "damt",
        label: "Amount",
        type: "number",
        dependencies: ["fc_amount", "rate"],
        calculate: (v) => v.fc_amount * v.rate,
      },
    ],
    totals: {
      mainTotal: {
        label: "Total Receipts",
        calculate: (lines) => lines.reduce((sum, l) => sum + (l.camt || 0), 0),
      },
      deductionTotal: {
        label: "Total Deductions",
        calculate: (lines) => lines.reduce((sum, l) => sum + (l.damt || 0), 0),
      },
      netTotal: {
        label: "Net Receipt",
        calculate: (_, t) => t.mainTotal - t.deductionTotal,
      },
    },

    balanceCheck: {
      condition: (formData) => formData.totals.netTotal >= 0,
      errorMessage: (formData) =>
        `Net Receipt (${formData.totals.netTotal.toFixed(
          2
        )}) cannot be negative.`,
    },
    tableFields: [
      { name: "dateD", label: "Date", type: "date" },
      { name: "tran_id", label: "Transaction No", type: "text" },
      { name: "vr_no", label: "Voucher No", type: "text" },
      { name: "pycd", label: "Received At", type: "text" },
      { name: "rmk", label: "Narration", type: "text" },
    ],
  },
  journal: {
    tran_code: 3,
    hasDeductionBlock: false,
    masterFields: [
      {
        name: "vr_no",
        label: "Vr No",
        type: "text",
        required: true,
        autoGenerate: true,
      },
      {
        name: "dateD",
        label: "Date",
        type: "date",
        required: true,
      },
      { name: "rmk1", label: "Narration", type: "textarea" },
    ],
    lineFields: [
      {
        name: "acname",
        formName: "acno",
        label: "A/c Name",
        type: "select",
        options: "accounts",
        apiEndpoint: "/api/accounts/acno?excludeMacno=003,004",
        createEndpoint: "/api/accounts/acno",
        nameKey: "acname",
        valueKey: "acno",
        modalFields: [
          {
            name: "acname",
            label: "Account Name",
            type: "text",
            required: true,
          },
          {
            name: "macno",
            label: "Main Account",
            type: "select",
            options: "mainAccounts",
            apiEndpoint: "/api/accounts/macno",
            valueKey: "macno",
            nameKey: "macname",
            required: true,
          },
        ],
      },
      {
        name: "ccname",
        formName: "ccno",
        label: "Cost Center",
        type: "select",
        options: "costCenters",
        apiEndpoint: "/api/setup/cost_centers",
        createEndpoint: "/api/setup/cost_centers",
        nameKey: "ccname",
        valueKey: "ccno",
        modalFields: [
          {
            name: "ccname",
            label: "Cost Center Name",
            type: "text",
            required: true,
          },
        ],
      },
      { name: "invoice_no", label: "Invoice No", type: "text" },
      { name: "narration1", label: "Narration1", type: "text" },
      {
        name: "damt",
        label: "Debit Amount",
        type: "number",
        validate: (value, line) => {
          const debit = parseFloat(value) || 0;
          const credit = parseFloat(line.camt) || 0;
          if (debit > 0 && credit > 0) {
            return "Cannot enter both Debit and Credit amounts in the same line.";
          }
          return null;
        },
      },
      {
        name: "camt",
        label: "Credit Amount",
        type: "number",
        validate: (value, line) => {
          const credit = parseFloat(value) || 0;
          const debit = parseFloat(line.damt) || 0;
          if (credit > 0 && debit > 0) {
            return "Cannot enter both Debit and Credit amounts in the same line.";
          }
          return null;
        },
      },
    ],
    totals: {
      debitTotal: {
        label: "Total Debit",
        calculate: (lines) => lines.reduce((sum, l) => sum + (l.damt || 0), 0),
      },
      creditTotal: {
        label: "Total Credit",
        calculate: (lines) => lines.reduce((sum, l) => sum + (l.camt || 0), 0),
      },
    },
    balanceCheck: {
      condition: (formData) =>
        formData.totals.debitTotal === formData.totals.creditTotal,
      errorMessage: (formData) =>
        `Total Debit (${formData.totals.debitTotal.toFixed(
          2
        )}) must equal Total Credit (${formData.totals.creditTotal.toFixed(
          2
        )}).`,
    },
    tableFields: [
      { name: "dateD", label: "Date", type: "date" },
      { name: "tran_id", label: "Transaction No", type: "text" },
      { name: "vr_no", label: "Voucher No", type: "text" },
      { name: "rmk1", label: "Narration", type: "text" },
    ],
  },
  purchase: {
    tran_code: 4,
    hasDeductionBlock: false,
    masterFields: [
      // { name: "dateD", label: "Date", type: "date", required: true },
      // { name: "time", label: "Time", type: "time", required: true },
      {
        name: "vr_no",
        label: "Vr No",
        type: "text",
        required: true,
        autoGenerate: true,
      },
      {
        name: "dateD",
        label: "Date",
        type: "date",
        required: true,
      },

      {
        name: "po_no",
        label: "Purchase Order No",
        type: "select",
        options: "purchaseOrders",
        apiEndpoint: "/api/orders/purchaseOrder",
        nameKey: "order_no",
        valueKey: "order_no",
        onChange: async (value, formData) => {
          if (!value) return;
          try {
            const response = await axios.get(`/api/orders/purchaseOrder`);
            console.log("respo: ", response.data.data);
            console.log("respoValue: ", value);
            console.log("respoValue Type: ", typeof value);

            const filterResponse = response.data.data.filter(
              (item) => item.order_no === Number(value)
            );
            console.log("filterRespo: ", filterResponse);
            return {
              pycd: filterResponse[0].party_code, // Vendor
              godown: filterResponse[0].godown,
              orderDetails: filterResponse[0].orderDetails, // Full details of the order
              // Add other fields you want to auto-fill
            };
          } catch (error) {
            console.error("Error fetching PO details:", error);
            return {};
          }
        },
      },

      {
        name: "pycd",
        label: "Vendor",
        type: "select",
        options: "accounts",
        apiEndpoint: "/api/accounts/acno?macno=006",
        createEndpoint: "/api/accounts/acno",
        nameKey: "acname",
        valueKey: "acno",
        required: true,
        modalFields: [
          { name: "name", label: "Vendor Name", type: "text", required: true },
        ],
      },
      { name: "check_no", label: "ST Inv No", type: "text" },
      { name: "check_date", label: "ST Inv Date", type: "Date" },
      { name: "rmk", label: "Narration", type: "textarea" },
      {
        name: "invoice_no",
        label: "Com Inv No",
        type: "text",
        required: true,
        validate: async (value, masterData) => {
          if (!value || !masterData.pycd) return null;
          try {
            const response = await axios.get(
              `/api/voucher/check-invoice?tran_code=4&pycd=${
                masterData.pycd
              }&invoice_no=${encodeURIComponent(value)}`
            );
            if (response.data.exists) {
              const nextInvoiceNo =
                response.data.nextInvoiceNo || parseInt(value) + 1;
              return `Invoice number ${value} already exists for this vendor. Try ${nextInvoiceNo} or another number.`;
            }
            return null;
          } catch (error) {
            return `Error checking invoice number: ${error.message}`;
          }
        },
      },
      {
        name: "godown",
        label: "Godown",
        type: "select",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        createEndpoint: "/api/setup/godowns",
        nameKey: "godown",
        valueKey: "id",
        required: true,
        modalFields: [
          {
            name: "godown",
            label: "Godown Name",
            type: "text",
            required: true,
          },
        ],
      },
      { name: "rmk2", label: "Delivery No", type: "text" },
    ],
    lineFields: [
      {
        name: "itcd",
        label: "Product",
        type: "select",
        options: "products",
        apiEndpoint: (formData) =>
          formData.po_no ? `/api/orders/purchaseOrder` : "/api/setup/items",
        createEndpoint: "/api/setup/items",
        nameKey: "item",
        valueKey: "itcd",
        required: true,
        modalFields: [
          { name: "item", label: "Product Name", type: "text", required: true },
          {
            name: "ic_id",
            label: "Item Category",
            type: "select",
            options: "itemCategories",
            apiEndpoint: "/api/setup/item_categories",
            valueKey: "id",
            nameKey: "ic_name",
            required: true,
          },
        ],
      },
      {
        name: "no_of_pack",
        label: "No of Packs",
        type: "number",
        required: true,
      },
      {
        name: "qty_per_pack",
        label: "Qty Per Pack",
        type: "number",
        required: true,
      },
      {
        name: "qty",
        label: "Qty",
        type: "number",
        required: true,
        dependencies: ["no_of_pack", "qty_per_pack"],
        calculate: (v) => v.no_of_pack * v.qty_per_pack,
        validate: (value, line, allLines, formData) => {
          if (formData.po_no && line.itcd) {
            const orderedQty = line.po_qty || 0;
            if (value > orderedQty) {
              return `Cannot exceed ordered quantity (${orderedQty})`;
            }
          }
          return null;
        },
      },
      { name: "rate", label: "Rate", type: "number" },
      {
        name: "gross_amount",
        label: "Gross Amount",
        type: "number",
        required: true,
        dependencies: ["qty", "rate", "no_of_pack", "qty_per_pack"],
        calculate: (v) => v.qty * v.rate,
      },
      { name: "st_rate", label: "ST Rate", type: "number" },
      {
        name: "st_amount",
        label: "ST Amount",
        type: "number",
        dependencies: [
          "gross_amount",
          "st_rate",
          "no_of_pack",
          "qty_per_pack",
          "rate",
        ],
        calculate: (v) => (v.gross_amount * v.st_rate) / 100,
      },
      { name: "additional_tax", label: "Additional Tax", type: "number" },
      {
        name: "damt",
        label: "Amount",
        required: true,
        type: "number",
        dependencies: [
          "qty",
          "rate",
          "st_rate",
          "additional_tax",
          "no_of_pack",
          "qty_per_pack",
        ], // Updated dependencies
        calculate: (v) => {
          console.log("V: ", v);
          const gross_amount = v.qty * v.rate; // Calculate gross_amount
          const st_amount = (gross_amount * (v.st_rate || 0)) / 100; // Calculate st_amount
          const addTax = (gross_amount * (v.additional_tax || 0)) / 100; // Calculate additional tax
          return gross_amount + st_amount + (addTax || 0); // Include additional_tax
        },
      },
    ],
    totals: {
      totalQty: {
        label: "Total Qty",
        calculate: (lines) => lines.reduce((sum, l) => sum + (l.qty || 0), 0),
      },
      grossTotal: {
        label: "Total Gross Amount",
        calculate: (lines) =>
          lines.reduce((sum, l) => sum + (l.gross_amount || 0), 0),
      },
      taxTotal: {
        label: "Total ST Amount",
        calculate: (lines) =>
          lines.reduce((sum, l) => sum + (l.st_amount || 0), 0),
      },
      additionalTaxTotal: {
        label: "Total Additional Tax",
        calculate: (lines) =>
          lines.reduce((sum, l) => sum + (l.additional_tax || 0), 0),
      },
      netTotal: {
        label: "Total Amount",
        calculate: (lines) => {
          console.log("Chajge:", lines);
          return lines.reduce((sum, l) => sum + (l.damt || 0), 0);
        },
      },
    },
    tableFields: [
      { name: "dateD", label: "Date", type: "date" },
      { name: "vr_no", label: "Voucher No", type: "text" },
      { name: "invoice_no", label: "Invoice No", type: "text" },
      {
        name: "pycd",
        label: "Vendor",
        type: "text",
        options: true,
        value1: "acno",
        value2: "acname",
      },
      { name: "rmk", label: "Narration", type: "text" },
      { name: "total", label: "Total Amount", type: "number", isTotal: true },
    ],
  },
  sale: {
    tran_code: 6,
    hasDeductionBlock: false,
    masterFields: [
      {
        name: "dateD",
        label: "Date",
        type: "date",
        required: true,
      },
      {
        name: "vr_no",
        label: "Vr No",
        type: "text",
        required: true,
        autoGenerate: true,
        readOnly: true, // Add this to make it non-editable
      },
      {
        name: "so_no",
        label: "Sale Order No",
        type: "select",
        options: "saleOrders",
        apiEndpoint: "/api/orders/saleOrder",
        nameKey: "order_no",
        valueKey: "order_no",
        onChange: async (value, formData) => {
          if (!value) return;
          try {
            const response = await axios.get(`/api/orders/saleOrder`);
            console.log("respo: ", response.data.data);
            console.log("respoValue: ", value);
            console.log("respoValue Type: ", typeof value);

            const filterResponse = response.data.data.filter(
              (item) => item.order_no === Number(value)
            );
            console.log("filterRespo: ", filterResponse);
            return {
              pycd: filterResponse[0].party_code, // Vendor
              godown: filterResponse[0].godown,
              orderDetails: filterResponse[0].orderDetails, // Full details of the order
              // Add other fields you want to auto-fill
            };
          } catch (error) {
            console.error("Error fetching PO details:", error);
            return {};
          }
        },
      },
      {
        name: "pycd",
        label: "Customer",
        type: "select",
        options: "accounts",
        apiEndpoint: "/api/accounts/acno?macno=001",
        createEndpoint: "/api/accounts/acno",
        nameKey: "acname",
        valueKey: "acno",
        required: true,
        modalFields: [
          {
            name: "name",
            label: "Customer Name",
            type: "text",
            required: true,
          },
        ],
      },
      {
        name: "check_no",
        label: "ST Inv No",
        type: "text",
        required: true,
        autoGenerate: true,
        validate: async (value, masterData) => {
          if (!value) return "ST Inv No is required";
          try {
            const response = await axios.get(
              `/api/voucher/check-sale-numbers?field=check_no&value=${encodeURIComponent(
                value
              )}&tran_code=6`
            );
            if (response.data.exists) {
              const nextNumber =
                response.data.nextNumber || parseInt(value) + 1;
              return `ST Inv No ${value} already exists. Try ${nextNumber} or another number.`;
            }
            return null;
          } catch (error) {
            return `Error checking ST Inv No: ${error.message}`;
          }
        },
      },
      { name: "check_date", label: "ST Inv Date", type: "Date" },
      { name: "rmk", label: "Narration", type: "textarea" },
      {
        name: "invoice_no",
        label: "Com Inv No",
        type: "text",
        required: true,
        validate: async (value, masterData) => {
          if (!value || !masterData.pycd) return null;
          try {
            const response = await axios.get(
              `/api/voucher/check-invoice?tran_code=6&pycd=${
                masterData.pycd
              }&invoice_no=${encodeURIComponent(value)}`
            );
            if (response.data.exists) {
              const nextInvoiceNo =
                response.data.nextInvoiceNo || parseInt(value) + 1;
              return `Invoice number ${value} already exists for this vendor. Try ${nextInvoiceNo} or another number.`;
            }
            return null;
          } catch (error) {
            return `Error checking invoice number: ${error.message}`;
          }
        },
      },
      {
        name: "godown",
        label: "Godown",
        type: "select",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        createEndpoint: "/api/setup/godowns",
        nameKey: "godown",
        valueKey: "id",
        modalFields: [
          {
            name: "godown",
            label: "Godown Name",
            type: "text",
            required: true,
          },
        ],
      },

      {
        name: "rmk2",
        label: "Delivery No",
        type: "text",
        required: true,
        autoGenerate: true,
        validate: async (value, masterData) => {
          if (!value) return "Delivery No is required";
          try {
            const response = await axios.get(
              `/api/voucher/check-sale-numbers?field=rmk2&value=${encodeURIComponent(
                value
              )}&tran_code=6`
            );
            if (response.data.exists) {
              const nextNumber =
                response.data.nextNumber || parseInt(value) + 1;
              return `Delivery No ${value} already exists. Try ${nextNumber} or another number.`;
            }
            return null;
          } catch (error) {
            return `Error checking Delivery No: ${error.message}`;
          }
        },
      },
    ],
    lineFields: [
      {
        name: "itcd",
        label: "Product",
        type: "select",
        options: "products",
        apiEndpoint: (formData) =>
          formData.so_no ? `/api/orders/saleOrder` : "/api/setup/items",
        createEndpoint: "/api/setup/items",
        nameKey: "item",
        valueKey: "itcd",
        required: true,
        modalFields: [
          { name: "item", label: "Product Name", type: "text", required: true },
          {
            name: "ic_id",
            label: "Item Category",
            type: "select",
            options: "itemCategories",
            apiEndpoint: "/api/setup/item_categories",
            valueKey: "id",
            nameKey: "ic_name",
            required: true,
          },
        ],
      },
      { name: "no_of_pack", label: "No of Packs", type: "number" },
      { name: "qty_per_pack", label: "Qty Per Pack", type: "number" },
      {
        name: "qty",
        label: "Qty",
        type: "number",
        required: true,
        dependencies: ["no_of_pack", "qty_per_pack"],
        calculate: (v) => v.no_of_pack * v.qty_per_pack,
        validate: (value, line, allLines, formData) => {
          if (formData.so_no && line.itcd) {
            const orderedQty = line.so_qty || 0;
            if (value > orderedQty) {
              return `Cannot exceed ordered quantity (${orderedQty})`;
            }
          }
          return null;
        },
      },
      { name: "rate", label: "Rate", type: "number" },
      {
        name: "gross_amount",
        label: "Gross Amount",
        type: "number",
        dependencies: ["qty", "rate", "no_of_pack", "qty_per_pack"],
        calculate: (v) => v.qty * v.rate,
      },
      { name: "st_rate", label: "ST Rate", type: "number" },
      {
        name: "st_amount",
        label: "ST Amount",
        type: "number",
        dependencies: [
          "gross_amount",
          "st_rate",
          "no_of_pack",
          "qty_per_pack",
          "rate",
        ],
        calculate: (v) => (v.gross_amount * v.st_rate) / 100,
      },
      { name: "additional_tax", label: "Additional Tax", type: "number" },
      {
        name: "camt",
        label: "Amount",
        required: true,
        type: "number",
        dependencies: [
          "qty",
          "rate",
          "st_rate",
          "additional_tax",
          "no_of_pack",
          "qty_per_pack",
        ], // Updated dependencies
        calculate: (v) => {
          console.log("V: ", v);
          const gross_amount = v.qty * v.rate; // Calculate gross_amount
          const st_amount = (gross_amount * (v.st_rate || 0)) / 100; // Calculate st_amount
          const addTax = (gross_amount * (v.additional_tax || 0)) / 100; // Calculate additional tax
          return gross_amount + st_amount + (addTax || 0); // Include additional_tax
        },
      },
    ],
    totals: {
      totalQty: {
        label: "Total Qty",
        calculate: (lines) => lines.reduce((sum, l) => sum + (l.qty || 0), 0),
      },
      grossTotal: {
        label: "Total Gross Amount",
        calculate: (lines) =>
          lines.reduce((sum, l) => sum + (l.gross_amount || 0), 0),
      },
      taxTotal: {
        label: "Total ST Amount",
        calculate: (lines) =>
          lines.reduce((sum, l) => sum + (l.st_amount || 0), 0),
      },
      additionalTaxTotal: {
        label: "Total Additional Tax",
        calculate: (lines) =>
          lines.reduce((sum, l) => sum + (l.additional_tax || 0), 0),
      },
      netTotal: {
        label: "Total Amount",
        calculate: (lines) => lines.reduce((sum, l) => sum + (l.camt || 0), 0),
      },
    },
    tableFields: [
      { name: "dateD", label: "Date", type: "date" },
      { name: "vr_no", label: "Voucher No", type: "text" },
      { name: "invoice_no", label: "Invoice No", type: "text" },
      {
        name: "pycd",
        label: "Customer",
        type: "text",
        options: true,
        value1: "acno",
        value2: "acname",
      },
      { name: "rmk", label: "Narration", type: "text" },
      { name: "total", label: "Total Amount", type: "number", isTotal: true },
    ],
  },
  purchaseReturn: {
    tran_code: 9,
    hasDeductionBlock: false,
    masterFields: [
      {
        name: "vr_no",
        label: "Vr No",
        type: "text",
        required: true,
        autoGenerate: true,
      },
      {
        name: "dateD",
        label: "Date",
        type: "date",
        required: true,
      },
      {
        name: "pycd",
        label: "Vendor",
        type: "select",
        options: "accounts",
        apiEndpoint: "/api/accounts/acno?macno=006",
        createEndpoint: "/api/accounts/acno",
        nameKey: "acname",
        valueKey: "acno",
        required: true,
        modalFields: [
          { name: "name", label: "Vendor Name", type: "text", required: true },
        ],
      },
      { name: "check_no", label: "ST Inv No", type: "text" },
      { name: "check_date", label: "ST Inv Date", type: "Date" },
      { name: "rmk", label: "Narration", type: "textarea" },
      {
        name: "invoice_no",
        label: "Com Inv No",
        type: "text",
        validate: async (value, masterData) => {
          if (!value || !masterData.pycd) return null;
          try {
            const response = await axios.get(
              `/api/voucher/check-invoice?tran_code=9&pycd=${
                masterData.pycd
              }&invoice_no=${encodeURIComponent(value)}`
            );
            if (response.data.exists) {
              const nextInvoiceNo =
                response.data.nextInvoiceNo || parseInt(value) + 1;
              return `Invoice number ${value} already exists for this vendor. Try ${nextInvoiceNo} or another number.`;
            }
            return null;
          } catch (error) {
            return `Error checking invoice number: ${error.message}`;
          }
        },
      },
      {
        name: "godown",
        label: "Godown",
        type: "select",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        createEndpoint: "/api/setup/godowns",
        nameKey: "godown",
        valueKey: "id",
        modalFields: [
          {
            name: "godown",
            label: "Godown Name",
            type: "text",
            required: true,
          },
        ],
      },
      { name: "rmk2", label: "Delivery No", type: "text" },
    ],
    lineFields: [
      {
        name: "itcd",
        label: "Product",
        type: "select",
        options: "products",
        apiEndpoint: "/api/setup/items",
        createEndpoint: "/api/setup/items",
        nameKey: "item",
        valueKey: "itcd",
        modalFields: [
          { name: "item", label: "Product Name", type: "text", required: true },
          {
            name: "ic_id",
            label: "Item Category",
            type: "select",
            options: "itemCategories",
            apiEndpoint: "/api/setup/item_categories",
            valueKey: "id",
            nameKey: "ic_name",
            required: true,
          },
        ],
      },
      { name: "no_of_pack", label: "No of Packs", type: "number" },
      { name: "qty_per_pack", label: "Qty Per Pack", type: "number" },
      {
        name: "qty",
        label: "Qty",
        type: "number",
        dependencies: ["no_of_pack", "qty_per_pack"],
        calculate: (v) => v.no_of_pack * v.qty_per_pack,
        validate: (value, line, allLines, originalData) => {
          const originalQty =
            originalData?.find((l) => l.itcd === line.itcd)?.qty || 0;
          if (value > originalQty) {
            return `Cannot return more than original quantity (${originalQty})`;
          }
          return null;
        },
      },
      { name: "rate", label: "Rate", type: "number" },
      {
        name: "gross_amount",
        label: "Gross Amount",
        type: "number",
        dependencies: ["qty", "rate", "no_of_pack", "qty_per_pack"],
        calculate: (v) => v.qty * v.rate,
      },
      { name: "st_rate", label: "ST Rate", type: "number" },
      {
        name: "st_amount",
        label: "ST Amount",
        type: "number",
        dependencies: [
          "gross_amount",
          "st_rate",
          "no_of_pack",
          "qty_per_pack",
          "rate",
        ],
        calculate: (v) => (v.gross_amount * v.st_rate) / 100,
      },
      { name: "additional_tax", label: "Additional Tax", type: "number" },
      {
        name: "camt",
        label: "Amount",
        required: true,
        type: "number",
        dependencies: [
          "qty",
          "rate",
          "no_of_pack",
          "qty_per_pack",
          "st_rate",
          "additional_tax",
        ], // Updated dependencies
        calculate: (v) => {
          console.log("V: ", v);
          const gross_amount = v.qty * v.rate; // Calculate gross_amount
          const st_amount = (gross_amount * (v.st_rate || 0)) / 100; // Calculate st_amount
          const addTax = (gross_amount * (v.additional_tax || 0)) / 100; // Calculate additional tax
          return gross_amount + st_amount + (addTax || 0); // Include additional_tax
        },
      },
    ],
    totals: {
      totalQty: {
        label: "Total Qty",
        calculate: (lines) => lines.reduce((sum, l) => sum + (l.qty || 0), 0),
      },
      grossTotal: {
        label: "Total Gross Amount",
        calculate: (lines) =>
          lines.reduce((sum, l) => sum + (l.gross_amount || 0), 0),
      },
      taxTotal: {
        label: "Total ST Amount",
        calculate: (lines) =>
          lines.reduce((sum, l) => sum + (l.st_amount || 0), 0),
      },
      additionalTaxTotal: {
        label: "Total Additional Tax",
        calculate: (lines) =>
          lines.reduce((sum, l) => sum + (l.additional_tax || 0), 0),
      },
      netTotal: {
        label: "Total Amount",
        calculate: (lines) => lines.reduce((sum, l) => sum + (l.camt || 0), 0),
      },
    },
    tableFields: [
      { name: "dateD", label: "Date", type: "date" },
      { name: "vr_no", label: "Voucher No", type: "text" },
      { name: "invoice_no", label: "Invoice No", type: "text" },
      {
        name: "pycd",
        label: "Vendor",
        type: "text",
        options: true,
        value1: "acno",
        value2: "acname",
      },
      { name: "rmk", label: "Narration", type: "text" },
      { name: "total", label: "Total Amount", type: "number", isTotal: true },
    ],
  },
  saleReturn: {
    tran_code: 10,
    hasDeductionBlock: false,
    masterFields: [
      {
        name: "vr_no",
        label: "Vr No",
        type: "text",
        required: true,
        autoGenerate: true,
      },
      {
        name: "dateD",
        label: "Date",
        type: "date",
        required: true,
      },

      {
        name: "pycd",
        label: "Vendor",
        type: "select",
        options: "accounts",
        apiEndpoint: "/api/accounts/acno?macno=001",
        createEndpoint: "/api/accounts/acno",
        nameKey: "acname",
        valueKey: "acno",
        required: true,
        modalFields: [
          { name: "name", label: "Vendor Name", type: "text", required: true },
        ],
      },
      { name: "check_no", label: "ST Inv No", type: "text" },
      { name: "check_date", label: "ST Inv Date", type: "Date" },
      { name: "rmk", label: "Narration", type: "textarea" },
      {
        name: "invoice_no",
        label: "Com Inv No",
        type: "text",
        validate: async (value, masterData) => {
          if (!value || !masterData.pycd) return null;
          try {
            const response = await axios.get(
              `/api/voucher/check-invoice?tran_code=10&pycd=${
                masterData.pycd
              }&invoice_no=${encodeURIComponent(value)}`
            );
            if (response.data.exists) {
              const nextInvoiceNo =
                response.data.nextInvoiceNo || parseInt(value) + 1;
              return `Invoice number ${value} already exists for this vendor. Try ${nextInvoiceNo} or another number.`;
            }
            return null;
          } catch (error) {
            return `Error checking invoice number: ${error.message}`;
          }
        },
      },
      {
        name: "godown",
        label: "Godown",
        type: "select",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        createEndpoint: "/api/setup/godowns",
        nameKey: "godown",
        valueKey: "id",
        modalFields: [
          {
            name: "godown",
            label: "Godown Name",
            type: "text",
            required: true,
          },
        ],
      },
      { name: "rmk2", label: "Delivery No", type: "text" },
    ],
    lineFields: [
      {
        name: "itcd",
        label: "Product",
        type: "select",
        options: "products",
        apiEndpoint: "/api/setup/items",
        createEndpoint: "/api/setup/items",
        nameKey: "item",
        valueKey: "itcd",
        modalFields: [
          { name: "item", label: "Product Name", type: "text", required: true },
          {
            name: "ic_id",
            label: "Item Category",
            type: "select",
            options: "itemCategories",
            apiEndpoint: "/api/setup/item_categories",
            valueKey: "id",
            nameKey: "ic_name",
            required: true,
          },
        ],
      },
      { name: "no_of_pack", label: "No of Packs", type: "number" },
      { name: "qty_per_pack", label: "Qty Per Pack", type: "number" },
      {
        name: "qty",
        label: "Qty",
        type: "number",
        dependencies: ["no_of_pack", "qty_per_pack"],
        calculate: (v) => v.no_of_pack * v.qty_per_pack,
        validate: (value, line, allLines, originalData) => {
          const originalQty =
            originalData?.find((l) => l.itcd === line.itcd)?.qty || 0;
          if (value > originalQty) {
            return `Cannot return more than original quantity (${originalQty})`;
          }
          return null;
        },
      },
      { name: "rate", label: "Rate", type: "number" },
      {
        name: "gross_amount",
        label: "Gross Amount",
        type: "number",
        dependencies: ["qty", "rate", "no_of_pack", "qty_per_pack"],
        calculate: (v) => v.qty * v.rate,
      },
      { name: "st_rate", label: "ST Rate", type: "number" },
      {
        name: "st_amount",
        label: "ST Amount",
        type: "number",
        dependencies: [
          "gross_amount",
          "st_rate",
          "no_of_pack",
          "qty_per_pack",
          "rate",
        ],
        calculate: (v) => (v.gross_amount * v.st_rate) / 100,
      },
      { name: "additional_tax", label: "Additional Tax", type: "number" },
      {
        name: "damt",
        label: "Amount",
        required: true,
        type: "number",
        dependencies: [
          "qty",
          "rate",
          "no_of_pack",
          "qty_per_pack",
          "st_rate",
          "additional_tax",
        ], // Updated dependencies
        calculate: (v) => {
          console.log("V: ", v);
          const gross_amount = v.qty * v.rate; // Calculate gross_amount
          const st_amount = (gross_amount * (v.st_rate || 0)) / 100; // Calculate st_amount
          const addTax = (gross_amount * (v.additional_tax || 0)) / 100; // Calculate additional tax
          return gross_amount + st_amount + (addTax || 0); // Include additional_tax
        },
      },
    ],
    totals: {
      totalQty: {
        label: "Total Qty",
        calculate: (lines) => lines.reduce((sum, l) => sum + (l.qty || 0), 0),
      },
      grossTotal: {
        label: "Total Gross Amount",
        calculate: (lines) =>
          lines.reduce((sum, l) => sum + (l.gross_amount || 0), 0),
      },
      taxTotal: {
        label: "Total ST Amount",
        calculate: (lines) =>
          lines.reduce((sum, l) => sum + (l.st_amount || 0), 0),
      },
      additionalTaxTotal: {
        label: "Total Additional Tax",
        calculate: (lines) =>
          lines.reduce((sum, l) => sum + (l.additional_tax || 0), 0),
      },
      netTotal: {
        label: "Total Amount",
        calculate: (lines) => lines.reduce((sum, l) => sum + (l.camt || 0), 0),
      },
    },
    tableFields: [
      { name: "dateD", label: "Date", type: "date" },
      { name: "vr_no", label: "Voucher No", type: "text" },
      { name: "invoice_no", label: "Invoice No", type: "text" },
      {
        name: "pycd",
        label: "Customer",
        type: "text",
        options: true,
        value1: "acno",
        value2: "acname",
      },
      { name: "rmk", label: "Narration", type: "text" },
      { name: "total", label: "Total Amount", type: "number", isTotal: true },
    ],
  },
  // Add to VOUCHER_CONFIG in constants.js
  transfer: {
    tran_code: 11,
    hasDeductionBlock: false,
    masterFields: [
      {
        name: "dateD",
        label: "Date",
        type: "date",
        required: true,
      },
      {
        name: "vr_no",
        label: "Vr No",
        type: "text",
        required: true,
        autoGenerate: true,
      },
      {
        name: "godown",
        label: "From Godown",
        type: "select",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        nameKey: "godown",
        valueKey: "id",
        required: true,
      },
      {
        name: "godown2",
        label: "To Godown",
        type: "select",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        nameKey: "godown",
        valueKey: "id",
        required: true,
        validate: (value, masterData) => {
          if (value === masterData.godown) {
            return "From and To godowns cannot be the same";
          }
          return null;
        },
      },
      { name: "rmk", label: "Narration", type: "textarea" },
    ],
    lineFields: [
      {
        name: "itcd",
        label: "Product",
        type: "select",
        options: "products",
        apiEndpoint: "/api/setup/items",
        nameKey: "item",
        valueKey: "itcd",
        required: true,
      },
      { name: "no_of_pack", label: "No of Packs", type: "number" },
      { name: "qty_per_pack", label: "Qty Per Pack", type: "number" },
      {
        name: "qty",
        label: "Qty",
        type: "number",
        dependencies: ["no_of_pack", "qty_per_pack"],
        calculate: (v) => v.no_of_pack * v.qty_per_pack,
        validate: async (value, line, allLines, formData) => {
          if (!value || value <= 0) return "Quantity must be greater than 0";

          // Check stock in source godown
          try {
            const response = await axios.get(
              `/api/inventory/stock?itcd=${line.itcd}&godown=${formData.master.godown}`
            );
            const availableStock = response.data.stock || 0;
            if (value > availableStock) {
              return `Only ${availableStock} available in source godown`;
            }
          } catch (error) {
            return "Error checking stock availability";
          }
          return null;
        },
      },
    ],
    totals: {
      totalQty: {
        label: "Total Quantity",
        calculate: (lines) => lines.reduce((sum, l) => sum + (l.qty || 0), 0),
      },
    },
    tableFields: [
      { name: "dateD", label: "Date", type: "date" },
      { name: "vr_no", label: "Voucher No", type: "text" },
      {
        name: "godown",
        label: "From Godown",
        type: "text",
        refApi: "/api/setup/godowns?id=",
        refValueKey: "id",
        refNameKey: "godown",
      },
      {
        name: "godown2",
        label: "To Godown",
        type: "text",
        refApi: "/api/setup/godowns?id=",
        refValueKey: "id",
        refNameKey: "godown",
      },
      { name: "rmk", label: "Narration", type: "text" },
    ],
  },

  // Add to VOUCHER_CONFIG in constants.js

  purchaseOrder: {
    tran_code: 400,
    hasDeductionBlock: false,
    masterFields: [
      {
        name: "dateD",
        label: "Date",
        type: "date",
        required: true,
      },
      {
        name: "party_code",
        label: "Supplier",
        type: "select",
        options: "masterAccounts",
        apiEndpoint: "/api/accounts/acno?macno=006", // Suppliers
        createEndpoint: "/api/accounts/acno",
        nameKey: "acname",
        valueKey: "acno",
        required: true,
        modalFields: [
          {
            name: "acname",
            label: "Supplier Name",
            type: "text",
            required: true,
          },
          {
            name: "macno",
            label: "Main Account",
            type: "select",
            options: "mainAccounts",
            apiEndpoint: "/api/accounts/macno",
            valueKey: "macno",
            nameKey: "macname",
            required: true,
          },
        ],
      },
      {
        name: "godown",
        label: "Godown",
        type: "select",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        createEndpoint: "/api/setup/godowns",
        nameKey: "godown",
        valueKey: "id",
        required: true,
      },
      {
        name: "due_date",
        label: "Due Date",
        type: "date",
        required: true,
      },
      {
        name: "delivery_terms",
        label: "Delivery Terms",
        type: "text",
      },
      {
        name: "payment_terms",
        label: "Payment Terms",
        type: "text",
      },
      {
        name: "delivery_location",
        label: "Delivery Location",
        type: "textarea",
      },
      {
        name: "additional_instructions",
        label: "Instructions",
        type: "textarea",
      },
      // {
      //   name: "status",
      //   label: "Status",
      //   type: "select",
      //   options: "orderStatus",
      //   apiEndpoint: "/api/setup/order-status",
      //   valueKey: "id",
      //   nameKey: "status",
      //   required: true,
      // },
    ],
    lineFields: [
      {
        name: "itcd",
        label: "Product",
        type: "select",
        options: "products",
        apiEndpoint: "/api/setup/items",
        createEndpoint: "/api/setup/items",
        nameKey: "item",
        valueKey: "itcd",
        required: true,
        modalFields: [
          { name: "item", label: "Product Name", type: "text", required: true },
          {
            name: "ic_id",
            label: "Item Category",
            type: "select",
            options: "itemCategories",
            apiEndpoint: "/api/setup/item_categories",
            valueKey: "id",
            nameKey: "ic_name",
            required: true,
          },
        ],
      },
      {
        name: "no_of_packs",
        label: "No of Packs",
        type: "number",
        required: true,
      },
      {
        name: "qty_per_pack",
        label: "Qty Per Pack",
        type: "number",
        required: true,
      },
      {
        name: "qty",
        label: "Total Qty",
        type: "number",
        dependencies: ["no_of_packs", "qty_per_pack"],
        calculate: (v) => v.no_of_packs * v.qty_per_pack,
      },
      { name: "unit", label: "Unit", type: "text" },
      { name: "rate", label: "Rate", type: "number", required: true },
      {
        name: "amount",
        label: "Amount",
        type: "number",
        dependencies: ["qty", "rate"],
        calculate: (v) => v.qty * v.rate,
      },
    ],
    totals: {
      totalQty: {
        label: "Total Quantity",
        calculate: (lines) => lines.reduce((sum, l) => sum + (l.qty || 0), 0),
      },
      totalAmount: {
        label: "Total Amount",
        calculate: (lines) =>
          lines.reduce((sum, l) => sum + (l.amount || 0), 0),
      },
    },
    tableFields: [
      { name: "dateD", label: "Date", type: "date" },
      { name: "order_no", label: "Order No", type: "text" },
      {
        name: "party_code",
        label: "Supplier",
        type: "text",
        options: true,
        value1: "acno",
        value2: "acname",
      },
      {
        name: "godown",
        label: "Godown",
        type: "text",
        options: true,
        value1: "godownDetails",
        value2: "godown",
      },
      // { name: "status", label: "Status", type: "text" },
    ],
  },
  saleOrder: {
    tran_code: 600,
    hasDeductionBlock: false,
    masterFields: [
      {
        name: "dateD",
        label: "Date",
        type: "date",
        required: true,
      },
      {
        name: "party_code",
        label: "Customer",
        type: "select",
        options: "masterAccounts",
        apiEndpoint: "/api/accounts/acno?macno=001", // Customers
        createEndpoint: "/api/accounts/acno",
        nameKey: "acname",
        valueKey: "acno",
        required: true,
        modalFields: [
          {
            name: "acname",
            label: "Customer Name",
            type: "text",
            required: true,
          },
          {
            name: "macno",
            label: "Main Account",
            type: "select",
            options: "mainAccounts",
            apiEndpoint: "/api/accounts/macno",
            valueKey: "macno",
            nameKey: "macname",
            required: true,
          },
        ],
      },
      {
        name: "godown",
        label: "Godown",
        type: "select",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        createEndpoint: "/api/setup/godowns",
        nameKey: "godown",
        valueKey: "id",
        required: true,
      },
      {
        name: "due_date",
        label: "Due Date",
        type: "date",
        required: true,
      },
      {
        name: "delivery_terms",
        label: "Delivery Terms",
        type: "text",
      },
      {
        name: "payment_terms",
        label: "Payment Terms",
        type: "text",
      },
      {
        name: "delivery_location",
        label: "Delivery Location",
        type: "textarea",
      },
      {
        name: "additional_instructions",
        label: "Instructions",
        type: "textarea",
      },
      // {
      //   name: "status",
      //   label: "Status",
      //   type: "select",
      //   options: "orderStatus",
      //   apiEndpoint: "/api/setup/order-status",
      //   valueKey: "id",
      //   nameKey: "status",
      //   required: true,
      // },
    ],
    lineFields: [
      {
        name: "itcd",
        label: "Product",
        type: "select",
        options: "products",
        apiEndpoint: "/api/setup/items",
        createEndpoint: "/api/setup/items",
        nameKey: "item",
        valueKey: "itcd",
        required: true,
        modalFields: [
          { name: "item", label: "Product Name", type: "text", required: true },
          {
            name: "ic_id",
            label: "Item Category",
            type: "select",
            options: "itemCategories",
            apiEndpoint: "/api/setup/item_categories",
            valueKey: "id",
            nameKey: "ic_name",
            required: true,
          },
        ],
      },
      {
        name: "no_of_packs",
        label: "No of Packs",
        type: "number",
        required: true,
      },
      {
        name: "qty_per_pack",
        label: "Qty Per Pack",
        type: "number",
        required: true,
      },
      {
        name: "qty",
        label: "Total Qty",
        type: "number",
        dependencies: ["no_of_packs", "qty_per_pack"],
        calculate: (v) => v.no_of_packs * v.qty_per_pack,
      },
      { name: "unit", label: "Unit", type: "text" },
      { name: "rate", label: "Rate", type: "number", required: true },
      {
        name: "amount",
        label: "Amount",
        type: "number",
        dependencies: ["qty", "rate"],
        calculate: (v) => v.qty * v.rate,
      },
    ],
    totals: {
      totalQty: {
        label: "Total Quantity",
        calculate: (lines) => lines.reduce((sum, l) => sum + (l.qty || 0), 0),
      },
      totalAmount: {
        label: "Total Amount",
        calculate: (lines) =>
          lines.reduce((sum, l) => sum + (l.amount || 0), 0),
      },
    },
    tableFields: [
      { name: "dateD", label: "Date", type: "date" },
      { name: "order_no", label: "Order No", type: "text" },
      {
        name: "party_code",
        label: "Customer",
        type: "text",
        options: true,
        value1: "acno",
        value2: "acname",
      },
      {
        name: "godown",
        label: "Godown",
        type: "text",
        options: true,
        value1: "godownDetails",
        value2: "godown",
      },
      // { name: "status", label: "Status", type: "text" },
    ],
  },
  grn: {
    tran_code: 4,
    hasDeductionBlock: false,
    masterFields: [
      // { name: "dateD", label: "Date", type: "date", required: true },
      // { name: "time", label: "Time", type: "time", required: true },
      {
        name: "vr_no",
        label: "Vr No",
        type: "text",
        required: true,
        autoGenerate: true,
      },
      {
        name: "dateD",
        label: "Date",
        type: "date",
        required: true,
      },

      {
        name: "po_no",
        label: "Purchase Order No",
        type: "select",
        options: "purchaseOrders",
        apiEndpoint: "/api/orders/purchaseOrder",
        nameKey: "order_no",
        valueKey: "order_no",
        onChange: async (value, formData) => {
          if (!value) return;
          try {
            const response = await axios.get(`/api/orders/purchaseOrder`);
            console.log("respo: ", response.data.data);
            console.log("respoValue: ", value);
            console.log("respoValue Type: ", typeof value);

            const filterResponse = response.data.data.filter(
              (item) => item.order_no === Number(value)
            );
            console.log("filterRespo: ", filterResponse);
            return {
              pycd: filterResponse[0].party_code, // Vendor
              godown: filterResponse[0].godown,
              orderDetails: filterResponse[0].orderDetails, // Full details of the order
              // Add other fields you want to auto-fill
            };
          } catch (error) {
            console.error("Error fetching PO details:", error);
            return {};
          }
        },
      },

      {
        name: "pycd",
        label: "Vendor",
        type: "select",
        options: "accounts",
        apiEndpoint: "/api/accounts/acno?macno=006",
        createEndpoint: "/api/accounts/acno",
        nameKey: "acname",
        valueKey: "acno",
        required: true,
        modalFields: [
          { name: "name", label: "Vendor Name", type: "text", required: true },
        ],
      },
      { name: "check_no", label: "ST Inv No", type: "text" },
      { name: "check_date", label: "ST Inv Date", type: "Date" },
      { name: "rmk", label: "Narration", type: "textarea" },
      // {
      //   name: "invoice_no",
      //   label: "Com Inv No",
      //   type: "text",
      //   required: true,
      //   validate: async (value, masterData) => {
      //     if (!value || !masterData.pycd) return null;
      //     try {
      //       const response = await axios.get(
      //         `/api/voucher/check-invoice?tran_code=4&pycd=${
      //           masterData.pycd
      //         }&invoice_no=${encodeURIComponent(value)}`
      //       );
      //       if (response.data.exists) {
      //         const nextInvoiceNo =
      //           response.data.nextInvoiceNo || parseInt(value) + 1;
      //         return `Invoice number ${value} already exists for this vendor. Try ${nextInvoiceNo} or another number.`;
      //       }
      //       return null;
      //     } catch (error) {
      //       return `Error checking invoice number: ${error.message}`;
      //     }
      //   },
      // },
      {
        name: "godown",
        label: "Godown",
        type: "select",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        createEndpoint: "/api/setup/godowns",
        nameKey: "godown",
        valueKey: "id",
        required: true,
        modalFields: [
          {
            name: "godown",
            label: "Godown Name",
            type: "text",
            required: true,
          },
        ],
      },
      { name: "rmk2", label: "Delivery No", type: "text" },
    ],
    lineFields: [
      {
        name: "itcd",
        label: "Product",
        type: "select",
        options: "products",
        apiEndpoint: (formData) =>
          formData.po_no ? `/api/orders/purchaseOrder` : "/api/setup/items",
        createEndpoint: "/api/setup/items",
        nameKey: "item",
        valueKey: "itcd",
        required: true,
        modalFields: [
          { name: "item", label: "Product Name", type: "text", required: true },
          {
            name: "ic_id",
            label: "Item Category",
            type: "select",
            options: "itemCategories",
            apiEndpoint: "/api/setup/item_categories",
            valueKey: "id",
            nameKey: "ic_name",
            required: true,
          },
        ],
      },
      {
        name: "no_of_pack",
        label: "No of Packs",
        type: "number",
        required: true,
      },
      {
        name: "qty_per_pack",
        label: "Qty Per Pack",
        type: "number",
        required: true,
      },
      {
        name: "qty",
        label: "Qty",
        type: "number",
        required: true,
        dependencies: ["no_of_pack", "qty_per_pack"],
        calculate: (v) => v.no_of_pack * v.qty_per_pack,
        validate: (value, line, allLines, formData) => {
          if (formData.po_no && line.itcd) {
            const orderedQty = line.po_qty || 0;
            if (value > orderedQty) {
              return `Cannot exceed ordered quantity (${orderedQty})`;
            }
          }
          return null;
        },
      },
      // { name: "rate", label: "Rate", type: "number" },
      // {
      //   name: "gross_amount",
      //   label: "Gross Amount",
      //   type: "number",
      //   required: true,
      //   dependencies: ["qty", "rate", "no_of_pack", "qty_per_pack"],
      //   calculate: (v) => v.qty * v.rate,
      // },
      // { name: "st_rate", label: "ST Rate", type: "number" },
      // {
      //   name: "st_amount",
      //   label: "ST Amount",
      //   type: "number",
      //   dependencies: [
      //     "gross_amount",
      //     "st_rate",
      //     "no_of_pack",
      //     "qty_per_pack",
      //     "rate",
      //   ],
      //   calculate: (v) => (v.gross_amount * v.st_rate) / 100,
      // },
      // { name: "additional_tax", label: "Additional Tax", type: "number" },
      // {
      //   name: "damt",
      //   label: "Amount",
      //   required: true,
      //   type: "number",
      //   dependencies: [
      //     "qty",
      //     "rate",
      //     "st_rate",
      //     "additional_tax",
      //     "no_of_pack",
      //     "qty_per_pack",
      //   ], // Updated dependencies
      //   calculate: (v) => {
      //     console.log("V: ", v);
      //     const gross_amount = v.qty * v.rate; // Calculate gross_amount
      //     const st_amount = (gross_amount * (v.st_rate || 0)) / 100; // Calculate st_amount
      //     const addTax = (gross_amount * (v.additional_tax || 0)) / 100; // Calculate additional tax
      //     return gross_amount + st_amount + (addTax || 0); // Include additional_tax
      //   },
      // },
    ],
    // totals: {
    //   totalQty: {
    //     label: "Total Qty",
    //     calculate: (lines) => lines.reduce((sum, l) => sum + (l.qty || 0), 0),
    //   },
    //   grossTotal: {
    //     label: "Total Gross Amount",
    //     calculate: (lines) =>
    //       lines.reduce((sum, l) => sum + (l.gross_amount || 0), 0),
    //   },
    //   taxTotal: {
    //     label: "Total ST Amount",
    //     calculate: (lines) =>
    //       lines.reduce((sum, l) => sum + (l.st_amount || 0), 0),
    //   },
    //   additionalTaxTotal: {
    //     label: "Total Additional Tax",
    //     calculate: (lines) =>
    //       lines.reduce((sum, l) => sum + (l.additional_tax || 0), 0),
    //   },
    //   netTotal: {
    //     label: "Total Amount",
    //     calculate: (lines) => {
    //       console.log("Chajge:", lines);
    //       return lines.reduce((sum, l) => sum + (l.damt || 0), 0);
    //     },
    //   },
    // },
    tableFields: [
      { name: "dateD", label: "Date", type: "date" },
      { name: "vr_no", label: "Voucher No", type: "text" },
      // { name: "invoice_no", label: "Invoice No", type: "text" },
      {
        name: "pycd",
        label: "Vendor",
        type: "text",
        options: true,
        value1: "acno",
        value2: "acname",
      },
      { name: "rmk", label: "Narration", type: "text" },
      // { name: "total", label: "Total Amount", type: "number", isTotal: true },
    ],
  },

  dispatch: {
    tran_code: 6,
    hasDeductionBlock: false,
    masterFields: [
      // { name: "dateD", label: "Date", type: "date", required: true },
      // { name: "time", label: "Time", type: "time", required: true },
      {
        name: "vr_no",
        label: "Vr No",
        type: "text",
        required: true,
        autoGenerate: true,
      },
      {
        name: "dateD",
        label: "Date",
        type: "date",
        required: true,
      },

      {
        name: "po_no",
        label: "Sale Order No",
        type: "select",
        options: "purchaseOrders",
        apiEndpoint: "/api/orders/saleOrder",
        nameKey: "order_no",
        valueKey: "order_no",
        onChange: async (value, formData) => {
          if (!value) return;
          try {
            const response = await axios.get(`/api/orders/saleOrder`);
            console.log("respo: ", response.data.data);
            console.log("respoValue: ", value);
            console.log("respoValue Type: ", typeof value);

            const filterResponse = response.data.data.filter(
              (item) => item.order_no === Number(value)
            );
            console.log("filterRespo: ", filterResponse);
            return {
              pycd: filterResponse[0].party_code, // Vendor
              godown: filterResponse[0].godown,
              orderDetails: filterResponse[0].orderDetails, // Full details of the order
              // Add other fields you want to auto-fill
            };
          } catch (error) {
            console.error("Error fetching PO details:", error);
            return {};
          }
        },
      },

      {
        name: "pycd",
        label: "Customer",
        type: "select",
        options: "accounts",
        apiEndpoint: "/api/accounts/acno?macno=001",
        createEndpoint: "/api/accounts/acno",
        nameKey: "acname",
        valueKey: "acno",
        required: true,
        modalFields: [
          { name: "name", label: "Vendor Name", type: "text", required: true },
        ],
      },
      { name: "check_no", label: "ST Inv No", type: "text" },
      { name: "check_date", label: "ST Inv Date", type: "Date" },
      { name: "rmk", label: "Narration", type: "textarea" },
      // {
      //   name: "invoice_no",
      //   label: "Com Inv No",
      //   type: "text",
      //   required: true,
      //   validate: async (value, masterData) => {
      //     if (!value || !masterData.pycd) return null;
      //     try {
      //       const response = await axios.get(
      //         `/api/voucher/check-invoice?tran_code=4&pycd=${
      //           masterData.pycd
      //         }&invoice_no=${encodeURIComponent(value)}`
      //       );
      //       if (response.data.exists) {
      //         const nextInvoiceNo =
      //           response.data.nextInvoiceNo || parseInt(value) + 1;
      //         return `Invoice number ${value} already exists for this vendor. Try ${nextInvoiceNo} or another number.`;
      //       }
      //       return null;
      //     } catch (error) {
      //       return `Error checking invoice number: ${error.message}`;
      //     }
      //   },
      // },
      {
        name: "godown",
        label: "Godown",
        type: "select",
        options: "godowns",
        apiEndpoint: "/api/setup/godowns",
        createEndpoint: "/api/setup/godowns",
        nameKey: "godown",
        valueKey: "id",
        required: true,
        modalFields: [
          {
            name: "godown",
            label: "Godown Name",
            type: "text",
            required: true,
          },
        ],
      },
      { name: "rmk2", label: "Delivery No", type: "text" },
    ],
    lineFields: [
      {
        name: "itcd",
        label: "Product",
        type: "select",
        options: "products",
        apiEndpoint: (formData) =>
          formData.po_no ? `/api/orders/saleOrder` : "/api/setup/items",
        createEndpoint: "/api/setup/items",
        nameKey: "item",
        valueKey: "itcd",
        required: true,
        modalFields: [
          { name: "item", label: "Product Name", type: "text", required: true },
          {
            name: "ic_id",
            label: "Item Category",
            type: "select",
            options: "itemCategories",
            apiEndpoint: "/api/setup/item_categories",
            valueKey: "id",
            nameKey: "ic_name",
            required: true,
          },
        ],
      },
      {
        name: "no_of_pack",
        label: "No of Packs",
        type: "number",
        required: true,
      },
      {
        name: "qty_per_pack",
        label: "Qty Per Pack",
        type: "number",
        required: true,
      },
      {
        name: "qty",
        label: "Qty",
        type: "number",
        required: true,
        dependencies: ["no_of_pack", "qty_per_pack"],
        calculate: (v) => v.no_of_pack * v.qty_per_pack,
        validate: (value, line, allLines, formData) => {
          if (formData.po_no && line.itcd) {
            const orderedQty = line.po_qty || 0;
            if (value > orderedQty) {
              return `Cannot exceed ordered quantity (${orderedQty})`;
            }
          }
          return null;
        },
      },
      // { name: "rate", label: "Rate", type: "number" },
      // {
      //   name: "gross_amount",
      //   label: "Gross Amount",
      //   type: "number",
      //   required: true,
      //   dependencies: ["qty", "rate", "no_of_pack", "qty_per_pack"],
      //   calculate: (v) => v.qty * v.rate,
      // },
      // { name: "st_rate", label: "ST Rate", type: "number" },
      // {
      //   name: "st_amount",
      //   label: "ST Amount",
      //   type: "number",
      //   dependencies: [
      //     "gross_amount",
      //     "st_rate",
      //     "no_of_pack",
      //     "qty_per_pack",
      //     "rate",
      //   ],
      //   calculate: (v) => (v.gross_amount * v.st_rate) / 100,
      // },
      // { name: "additional_tax", label: "Additional Tax", type: "number" },
      // {
      //   name: "damt",
      //   label: "Amount",
      //   required: true,
      //   type: "number",
      //   dependencies: [
      //     "qty",
      //     "rate",
      //     "st_rate",
      //     "additional_tax",
      //     "no_of_pack",
      //     "qty_per_pack",
      //   ], // Updated dependencies
      //   calculate: (v) => {
      //     console.log("V: ", v);
      //     const gross_amount = v.qty * v.rate; // Calculate gross_amount
      //     const st_amount = (gross_amount * (v.st_rate || 0)) / 100; // Calculate st_amount
      //     const addTax = (gross_amount * (v.additional_tax || 0)) / 100; // Calculate additional tax
      //     return gross_amount + st_amount + (addTax || 0); // Include additional_tax
      //   },
      // },
    ],
    // totals: {
    //   totalQty: {
    //     label: "Total Qty",
    //     calculate: (lines) => lines.reduce((sum, l) => sum + (l.qty || 0), 0),
    //   },
    //   grossTotal: {
    //     label: "Total Gross Amount",
    //     calculate: (lines) =>
    //       lines.reduce((sum, l) => sum + (l.gross_amount || 0), 0),
    //   },
    //   taxTotal: {
    //     label: "Total ST Amount",
    //     calculate: (lines) =>
    //       lines.reduce((sum, l) => sum + (l.st_amount || 0), 0),
    //   },
    //   additionalTaxTotal: {
    //     label: "Total Additional Tax",
    //     calculate: (lines) =>
    //       lines.reduce((sum, l) => sum + (l.additional_tax || 0), 0),
    //   },
    //   netTotal: {
    //     label: "Total Amount",
    //     calculate: (lines) => {
    //       console.log("Chajge:", lines);
    //       return lines.reduce((sum, l) => sum + (l.damt || 0), 0);
    //     },
    //   },
    // },
    tableFields: [
      { name: "dateD", label: "Date", type: "date" },
      { name: "vr_no", label: "Voucher No", type: "text" },
      // { name: "invoice_no", label: "Invoice No", type: "text" },
      {
        name: "pycd",
        label: "Vendor",
        type: "text",
        options: true,
        value1: "acno",
        value2: "acname",
      },
      { name: "rmk", label: "Narration", type: "text" },
      { name: "total", label: "Total Amount", type: "number", isTotal: true },
    ],
  },
};

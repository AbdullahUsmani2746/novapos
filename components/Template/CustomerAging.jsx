import { jsPDF } from "jspdf";

export const generateCustomerAgingPDF = () => {
  // ============== ALL VALUES CONSOLIDATED HERE ==============
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 2;

  // Color Palette
  const colors = {
    primary: [44, 62, 80], // Dark blue header background
    secondary: [52, 152, 219], // Blue (Accents)
    lightBg: [236, 240, 241], // Light gray for alternate rows
    darkText: [44, 62, 80], // Dark text
    border: [180, 180, 180], // Light gray borders
    white: [255, 255, 255],
    customerHeader: [52, 152, 219], // Blue (Customer Header)
    overdue: [231, 76, 60], // Red for overdue amounts
  };

  const companyName = "SIEGWERK PAKISTAN LIMITED";
  const documentTitle = "Customer Aging as of 30-JUL-25";
  const customerName = "KOMPASS PAKISTAN (PRIVATE) LIMITED";
  const pageInfo = "Page 1 of 9";

  // Sample data based on the image
  const agingData = [
    {
      invoiceDate: "28-APR-23",
      invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "28-MAR-23",
      invoiceAmount: "135,700",
      receipts: "0",
      outstanding: "135,700",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "135,700",
      totalOsDays: "824"
    },
    {
      invoiceDate: "14-JUL-23",
      invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "13-AUG-23",
      invoiceAmount: "49,708",
      receipts: "0",
      outstanding: "49,708",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "49,708",
      totalOsDays: "747"
    },
    {
      invoiceDate: "26-SEP-23",
      invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "26-OCT-23",
      invoiceAmount: "325,090",
      receipts: "0",
      outstanding: "325,090",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "325,090",
      totalOsDays: "673"
    },
    {
      invoiceDate: "27-SEP-23",
       invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "27-OCT-23",
      invoiceAmount: "131,971",
      receipts: "125,372",
      outstanding: "6,599",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "6,599",
      totalOsDays: "672"
    },
    {
      invoiceDate: "24-FEB-24",
      invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "25-MAR-24",
      invoiceAmount: "1,333,093",
      receipts: "0",
      outstanding: "1,333,093",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "1,333,093",
      totalOsDays: "522"
    },
    {
      invoiceDate: "26-FEB-24",
      invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "27-MAR-24",
      invoiceAmount: "94,282",
      receipts: "0",
      outstanding: "94,282",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "94,282",
      totalOsDays: "520"
    },
    {
      invoiceDate: "29-FEB-24",
      invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "30-MAR-24",
      invoiceAmount: "109,858",
      receipts: "1,485,974",
      outstanding: "-1,376,116",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "-1,376,116",
      totalOsDays: "517"
    },
    {
      invoiceDate: "01-MAR-24",
       invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "31-MAR-24",
      invoiceAmount: "0",
      receipts: "786,352",
      outstanding: "-786,352",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "-786,352",
      totalOsDays: "516"
    },
    {
      invoiceDate: "22-JUN-24",
     invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "22-JUL-24",
      invoiceAmount: "2,002,932",
      receipts: "1,902,785",
      outstanding: "100,147",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "100,147",
      totalOsDays: "403"
    },
    {
      invoiceDate: "04-JUL-24",
      invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "03-AUG-24",
      invoiceAmount: "1,498,010",
      receipts: "1,423,110",
      outstanding: "74,900",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "74,900",
      totalOsDays: "391"
    },
    {
      invoiceDate: "05-JUL-24",
      invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "04-AUG-24",
      invoiceAmount: "1,228,262",
      receipts: "1,166,848",
      outstanding: "61,414",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "61,414",
      totalOsDays: "390"
    },
    {
      invoiceDate: "09-JUL-24",
      invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "08-AUG-24",
      invoiceAmount: "1,403,020",
      receipts: "1,332,869",
      outstanding: "70,151",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "70,151",
      totalOsDays: "386"
    },
    {
      invoiceDate: "11-JUL-24",
      invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "10-AUG-24",
      invoiceAmount: "778,800",
      receipts: "739,860",
      outstanding: "38,940",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "38,940",
      totalOsDays: "384"
    },
    {
      invoiceDate: "22-JUL-24",
      invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "21-AUG-24",
      invoiceAmount: "1,137,520",
      receipts: "1,080,644",
      outstanding: "56,876",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "56,876",
      totalOsDays: "373"
    },
    {
      invoiceDate: "24-SEP-24",
       invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "24-OCT-24",
      invoiceAmount: "1,190,030",
      receipts: "1,130,528",
      outstanding: "59,502",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "59,502",
      totalOsDays: "309"
    },
    {
      invoiceDate: "25-SEP-24",
      invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "25-OCT-24",
      invoiceAmount: "658,440",
      receipts: "625,518",
      outstanding: "32,922",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "32,922",
      totalOsDays: "308"
    },
    {
      invoiceDate: "25-SEP-24",
      invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "25-OCT-24",
      invoiceAmount: "1,360,540",
      receipts: "1,292,513",
      outstanding: "68,027",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "68,027",
      totalOsDays: "308"
    },
    {
      invoiceDate: "26-SEP-24",
      invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "26-OCT-24",
      invoiceAmount: "988,238",
      receipts: "938,826",
      outstanding: "49,412",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "49,412",
      totalOsDays: "307"
    },
    {
      invoiceDate: "28-SEP-24",
    invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "28-OCT-24",
      invoiceAmount: "269,748",
      receipts: "256,261",
      outstanding: "13,487",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "13,487",
      totalOsDays: "305"
    },
    {
      invoiceDate: "28-SEP-24",
      invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "28-OCT-24",
      invoiceAmount: "1,419,422",
      receipts: "1,348,451",
      outstanding: "70,971",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "70,971",
      totalOsDays: "305"
    },
    {
      invoiceDate: "28-SEP-24",
      invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "28-OCT-24",
      invoiceAmount: "1,574,420",
      receipts: "1,495,414",
      outstanding: "78,706",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "78,706",
      totalOsDays: "305"
    },
    {
      invoiceDate: "04-OCT-24",
      invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "03-NOV-24",
      invoiceAmount: "261,252",
      receipts: "248,189",
      outstanding: "13,063",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "13,063",
      totalOsDays: "299"
    },
    {
      invoiceDate: "04-OCT-24",
      invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "03-NOV-24",
      invoiceAmount: "1,105,660",
      receipts: "1,050,377",
      outstanding: "55,283",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "55,283",
      totalOsDays: "299"
    },
    {
      invoiceDate: "08-OCT-24",
     invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "07-NOV-24",
      invoiceAmount: "780,299",
      receipts: "741,284",
      outstanding: "39,015",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "39,015",
      totalOsDays: "295"
    },
    {
      invoiceDate: "09-OCT-24",
     invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "08-NOV-24",
      invoiceAmount: "1,493,278",
      receipts: "1,418,614",
      outstanding: "74,664",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "74,664",
      totalOsDays: "294"
    },
    {
      invoiceDate: "09-OCT-24",
      invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "08-NOV-24",
      invoiceAmount: "1,115,442",
      receipts: "1,104,288",
      outstanding: "11,154",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "11,154",
      totalOsDays: "294"
    },
    {
      invoiceDate: "09-OCT-24",
       invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "08-NOV-24",
      invoiceAmount: "424,800",
      receipts: "403,560",
      outstanding: "21,240",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "21,240",
      totalOsDays: "294"
    },
    {
      invoiceDate: "09-OCT-24",
       invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "08-NOV-24",
      invoiceAmount: "789,125",
      receipts: "749,668",
      outstanding: "39,457",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "39,457",
      totalOsDays: "294"
    },
    {
      invoiceDate: "10-OCT-24",
      invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "09-NOV-24",
      invoiceAmount: "1,019,520",
      receipts: "968,544",
      outstanding: "50,976",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "50,976",
      totalOsDays: "293"
    },
    {
      invoiceDate: "10-OCT-24",
       invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "09-NOV-24",
      invoiceAmount: "341,020",
      receipts: "323,969",
      outstanding: "17,051",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "17,051",
      totalOsDays: "293"
    },
    {
      invoiceDate: "10-OCT-24",
     invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "09-NOV-24",
      invoiceAmount: "314,352",
      receipts: "298,634",
      outstanding: "15,718",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "15,718",
      totalOsDays: "293"
    },
    {
      invoiceDate: "10-OCT-24",
      invoiceNo: "00024",
      crDays: "30",
      tranNo: "",
      dueDate: "09-NOV-24",
      invoiceAmount: "1,071,204",
      receipts: "1,017,644",
      outstanding: "53,560",
      below30: "0",
      between31_45: "0",
      between46_60: "0",
      between61_90: "0",
      between91_120: "0",
      above120: "53,560",
      totalOsDays: "293"
    }
  ];

  // ============== PDF GENERATION CODE ==============
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const drawHeader = (yPosition = margin) => {
    // Company name section with dark blue background
    const companyHeight = 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setFillColor(...colors.primary);
    doc.rect(0, yPosition, pageWidth, companyHeight, "F");
    doc.setTextColor(...colors.white);
    doc.text(companyName, pageWidth / 2, yPosition + 7, { align: "center" });

    // Document title
    yPosition += companyHeight + 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...colors.darkText);
    doc.text(documentTitle, pageWidth / 2, yPosition, { align: "center" });

    return yPosition + 5;
  };

  const drawCustomerHeader = (customer, yPosition) => {
    const rowHeight = 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setFillColor(...colors.customerHeader);
    doc.setTextColor(...colors.white);
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, rowHeight, "FD");
    doc.text(`Customer    ${customer}`, margin + 2, yPosition + 5);
    doc.text(pageInfo, pageWidth - margin - 2, yPosition + 5, {
      align: "right",
    });
    return yPosition + rowHeight + 2;
  };

const drawTableHeader = (yPosition) => {
  const rowHeight = 10;
  const colWidths = [18, 12, 12, 10, 15, 20, 20, 20, 15, 15, 15, 15, 15, 15, 15];
  let currentX = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setLineWidth(0.5);

  const headers = [
    "Invoice Date",
    "Tran No",
    "Invoice No",
    "CR Days",
    "Due Date",
    "Invoice Amount",
    "Receipts",
    "Outstanding",
    "Below 30",
    "31 to 45",
    "46 to 60",
    "61 to 90",
    "91 to 120",
    "Above 120",
    "Total OS Days"
  ];

  headers.forEach((header, index) => {
    // Draw filled rectangle for header cell
    doc.setFillColor(...colors.secondary);
    doc.setDrawColor(...colors.border);
    doc.rect(currentX, yPosition , colWidths[index], rowHeight, "FD");

    // Split text if too long for the column width
    const lines = doc.splitTextToSize(header, colWidths[index] - 2);
    const lineHeight = 3.5;
    const startY = yPosition + (rowHeight - (lines.length * lineHeight)) / 2 + lineHeight;

    // Draw each line of header text
    lines.forEach((line, lineIndex) => {
      doc.setTextColor(...colors.white); // Ensure white text color
      doc.text(line, currentX + colWidths[index] / 2, startY + (lineIndex * lineHeight), {
        align: "center"
      });
    });

    currentX += colWidths[index];
  });

  return yPosition + rowHeight;
};


  const drawAgingRow = (rowData, yPosition) => {
    const colWidths = [18, 12, 12, 10, 15, 20, 20, 20, 15, 15, 15, 15, 15, 15, 15];
    let currentX = margin;
    const rowHeight = 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setLineWidth(0.2);
    doc.setDrawColor(...colors.border);

    const values = [
      rowData.invoiceDate,
      rowData.tranNo,
      rowData.invoiceNo,
      rowData.crDays,
      rowData.dueDate,
      rowData.invoiceAmount,
      rowData.receipts,
      rowData.outstanding,
      rowData.below30,
      rowData.between31_45,
      rowData.between46_60,
      rowData.between61_90,
      rowData.between91_120,
      rowData.above120,
      rowData.totalOsDays
    ];

    // Alternate row colors for better readability
    const rowColor = (yPosition / rowHeight) % 2 === 0 ? colors.white : colors.lightBg;

    values.forEach((value, index) => {
      doc.setFillColor(...rowColor);
      doc.rect(currentX, yPosition, colWidths[index], rowHeight, "FD");

      // Highlight negative values in red
      if ((index === 7 || index === 14) && value.startsWith("-")) {
        doc.setTextColor(...colors.overdue);
      } else {
        doc.setTextColor(...colors.darkText);
      }

      // Center-align all text
      doc.text(value, currentX + colWidths[index] / 2, yPosition + 4, {
        align: "center"
      });

      currentX += colWidths[index];
    });

    return yPosition + rowHeight;
  };

  // === Begin PDF Rendering ===
  let currentY = drawHeader();
  currentY = drawCustomerHeader(customerName, currentY);
  currentY = drawTableHeader(currentY);

  agingData.forEach((row) => {
    // Check if we need a new page
    if (currentY > pageHeight - 15) {
      doc.addPage();
      currentY = drawHeader();
      currentY = drawCustomerHeader(customerName, currentY);
      currentY = drawTableHeader(currentY);
    }

    currentY = drawAgingRow(row, currentY);
  });

  return doc;
};
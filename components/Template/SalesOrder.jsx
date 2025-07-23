import { jsPDF } from "jspdf";

export const generateSalesOrderPDF = () => {
  // ============== ALL VALUES CONSOLIDATED HERE ==============
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;

  // Modern Color Palette
  const colors = {
    primary: [33, 82, 156], // Dark Blue (Header)
    secondary: [241, 90, 34], // Orange (Accents)
    lightBg: [248, 249, 250], // Light Gray (Backgrounds)
    darkText: [33, 37, 41], // Almost Black (Text)
    border: [206, 212, 218], // Soft Gray (Borders)
    success: [40, 167, 69], // Green (Totals)
    white: [255, 255, 255],
  };

  const companyName = "EASTLAND INDUSTRIES PVT LTD";
  const documentTitle = "SALE ORDER";

  const orderDetails = {
    date: "01-JUL-25",
    saleOrderNo: "003868",
    customer: "ZM CONVERTERS (PRIVATE) LIMITED-EICL",
    customerRef: "",
    paymentTerms: "OVER 30 DAYS",
  };

  const orderItems = [
    {
      sNo: "1",
      prodCode: "0677EHR",
      productName: "MATT REDUCTION MEDIUM-",
      packing: "25",
      qtyKg: "50",
      rate: "",
      amount: "",
    },
    {
      sNo: "2",
      prodCode: "5885EHR",
      productName: "P.CYAN-",
      packing: "25",
      qtyKg: "50",
      rate: "",
      amount: "",
    },
    {
      sNo: "3",
      prodCode: "2066CONC",
      productName: "NC ORANGE PASTE-",
      packing: "25",
      qtyKg: "25",
      rate: "",
      amount: "",
    },
    {
      sNo: "4",
      prodCode: "1144CONC",
      productName: "NC YELLOW PASTE-",
      packing: "25",
      qtyKg: "50",
      rate: "",
      amount: "",
    },
  ];

  const totalQty = "175";

  // ============== PDF GENERATION CODE ==============
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Modern Header with square borders
  const drawHeader = (yPosition = margin) => {
    const companyHeight = 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);

    // Primary Color Header
    doc.setFillColor(...colors.primary);
    doc.rect(0, yPosition, pageWidth, companyHeight, "F");

    // White text
    doc.setTextColor(...colors.white);
    doc.text(companyName, pageWidth / 2, yPosition + 10, { align: "center" });

    // Title section
    const titleHeight = 10;
    const titleY = yPosition + companyHeight;
    doc.setFillColor(...colors.lightBg);
    doc.rect(0, titleY, pageWidth, titleHeight, "F");

    // Title text
    doc.setTextColor(...colors.secondary);
    doc.setFontSize(16);
    doc.text(documentTitle, pageWidth / 2, titleY + 6.5, { align: "center" });

    // Add a thin underline (straight line)
    doc.setDrawColor(...colors.secondary);
    doc.setLineWidth(0.5);
    doc.line(
      pageWidth / 2 - 30,
      titleY + 8.5,
      pageWidth / 2 + 30,
      titleY + 8.5
    );

    return titleY + titleHeight;
  };

  // Modern Card-like Details Section with square borders
  const drawOrderDetails = (yPosition) => {
    yPosition += 5; // Add some spacing

    // Create a card container with square corners
    doc.setFillColor(...colors.white);
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 20, "FD");

    const rowHeight = 6;
    const labelWidth = 30;
    const valueWidth = 45;

    doc.setFontSize(10);
    doc.setLineWidth(0.2);
    doc.setDrawColor(...colors.border);

    // --- Date Row ---
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primary);
    doc.text("Date", margin + 5, yPosition + 4);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.darkText);
    doc.text(
      orderDetails.date,
      margin + labelWidth + valueWidth / 2,
      yPosition + 4,
      { align: "center" }
    );

    // --- Sale Order No (right side) ---
    const rightX = pageWidth - margin - labelWidth - valueWidth;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primary);
    doc.text("Sale Order No", rightX + 5, yPosition + 4);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.secondary);
    doc.text(
      orderDetails.saleOrderNo,
      rightX + labelWidth + 5 + (valueWidth - 5) / 2,
      yPosition + 4,
      { align: "center" }
    );

    yPosition += rowHeight;

    // --- Customer Row ---
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primary);
    doc.text("Customer", margin + 5, yPosition + 4);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.darkText);
    doc.text(
      orderDetails.customer,
      margin + labelWidth + (pageWidth - 2 * margin - labelWidth) / 2,
      yPosition + 4,
      { align: "center" }
    );

    yPosition += rowHeight;

    // --- Customer Ref + Payment Terms Row ---
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primary);
    doc.text("Customer Ref", margin + 5, yPosition + 4);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.darkText);
    doc.text(
      orderDetails.customerRef || "-",
      margin + labelWidth + valueWidth / 2,
      yPosition + 4,
      { align: "center" }
    );

    const paymentX = pageWidth - margin - labelWidth - valueWidth;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primary);
    doc.text("Payment Terms", paymentX + 5, yPosition + 4);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.darkText);
    doc.text(
      orderDetails.paymentTerms,
      paymentX + labelWidth + 5 + (valueWidth - 5) / 2,
      yPosition + 4,
      { align: "center" }
    );

    return yPosition + rowHeight + 5;
  };

  // Modern Table with square borders
  const drawTableHeader = (yPosition) => {
    const rowHeight = 7;
    const colWidths = [10, 20, 70, 22, 15, 18, 35];
    let currentX = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...colors.white);
    doc.setLineWidth(0.5);
    doc.setDrawColor(...colors.primary);

    const headers = [
      "S.No",
      "Prod Code",
      "Product Name",
      "Packing",
      "Qty Kg",
      "Rate",
      "Amount",
    ];

    headers.forEach((header, index) => {
      doc.setFillColor(...colors.primary);
      doc.rect(currentX, yPosition, colWidths[index], rowHeight, "FD");
      doc.text(header, currentX + colWidths[index] / 2, yPosition + 5, {
        align: "center",
      });
      currentX += colWidths[index];
    });

    return yPosition + rowHeight;
  };

  const drawTableRow = (item, yPosition, rowHeight = 6) => {
    const colWidths = [10, 20, 70, 22, 15, 18, 35];
    let currentX = margin;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setLineWidth(0.2);
    doc.setDrawColor(...colors.border);

    const values = [
      item.sNo,
      item.prodCode,
      item.productName,
      item.packing,
      item.qtyKg,
      item.rate,
      item.amount,
    ];

    // Zebra striping
    const isEvenRow = parseInt(item.sNo) % 2 === 0;
    const rowColor = isEvenRow ? colors.lightBg : colors.white;

    values.forEach((value, index) => {
      doc.setFillColor(...rowColor);
      doc.rect(currentX, yPosition, colWidths[index], rowHeight, "FD");

      // Highlight important numeric fields
      if (index === 4) doc.setTextColor(...colors.secondary); // Qty
      else if (index === 5 || index === 6)
        doc.setTextColor(...colors.primary); // Rate/Amount
      else doc.setTextColor(...colors.darkText);

      if (index === 0 || index === 3 || index === 4) {
        doc.text(value, currentX + colWidths[index] / 2, yPosition + 4, {
          align: "center",
        });
      } else if (index === 5 || index === 6) {
        doc.text(value || "-", currentX + colWidths[index] - 2, yPosition + 4, {
          align: "right",
        });
      } else {
        doc.text(value, currentX + 2, yPosition + 4);
      }
      currentX += colWidths[index];
    });

    return yPosition + rowHeight;
  };

  // Highlighted Total Row with square borders
  const drawTotal = (yPosition) => {
    const rowHeight = 7;
    const colWidths = [10, 20, 70, 22, 15, 18, 35];
    let currentX = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setFillColor(...colors.lightBg);
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.3);
    doc.setTextColor(...colors.primary);

    // Merged cells for label
    const mergedWidth =
      colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3];
    doc.rect(currentX, yPosition, mergedWidth, rowHeight, "FD");
    doc.text("Total", currentX + mergedWidth - 5, yPosition + 5, {
      align: "right",
    });
    currentX += mergedWidth;

    // Highlighted total value
    doc.setFillColor(...colors.white);
    // doc.setDrawColor(...colors.success);
    doc.setLineWidth(0.3);
    doc.rect(currentX, yPosition, colWidths[4], rowHeight, "FD");
    doc.setTextColor(...colors.success);
    doc.text(totalQty, currentX + colWidths[4] / 2, yPosition + 5, {
      align: "center",
    });
    currentX += colWidths[4];

    // Empty cells
    doc.setFillColor(...colors.white);
    doc.setDrawColor(...colors.border);
    doc.rect(currentX, yPosition, colWidths[5], rowHeight, "FD");
    currentX += colWidths[5];
    doc.rect(currentX, yPosition, colWidths[6], rowHeight, "FD");

    return yPosition + rowHeight;
  };

  // Modern Signature Lines with square borders
  const drawSignatures = (yPosition) => {
    yPosition += 160;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...colors.darkText);

    // Signature lines
    doc.setDrawColor(...colors.secondary);
    doc.setLineWidth(0.5);

    // Authorized
    const lineY = yPosition + 15;
    doc.line(margin + 20, lineY, margin + 80, lineY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primary);
    doc.text("AUTHORIZED SIGNATURE", margin + 50, lineY + 5, {
      align: "center",
    });

    // Received
    doc.line(pageWidth - margin - 80, lineY, pageWidth - margin - 20, lineY);
    doc.text("RECEIVED SIGNATURE", pageWidth - margin - 50, lineY + 5, {
      align: "center",
    });
  };

  // === Begin PDF Rendering ===
  let currentY = drawHeader();
  currentY = drawOrderDetails(currentY);
  currentY = drawTableHeader(currentY);

  orderItems.forEach((item) => {
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = drawHeader();
      currentY = drawOrderDetails(currentY);
      currentY = drawTableHeader(currentY);
    }
    currentY = drawTableRow(item, currentY);
  });

  currentY = drawTotal(currentY);
  drawSignatures(currentY);

  // Add subtle watermark
  doc.setFontSize(40);
  doc.setTextColor(...colors.lightBg);
  doc.setGState(new doc.GState({ opacity: 0.1 }));
  doc.text("EASTLAND", pageWidth / 2, pageHeight / 2, {
    align: "center",
    angle: 45,
  });

  return doc;
};

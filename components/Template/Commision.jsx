import { jsPDF } from "jspdf";

export const generateCommisionPDF = () => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // All configurable values consolidated here
  const config = {
    page: {
      width: 210,
      height: 297,
      margin: 10,
    },
    company: {
      name: "EASTLAND INDUSTRIES CORPORATION PVT LTD.",
      address: "B-60, SITE, MANGHOPIR ROAD SITE, KARACHI",
      contact: "TEL. : 32581073-74   EMAIL : info@eastlandind.com",
      taxInfo: "STRN : 02-02-3215-001-91    NTN : 1019571-8",
    },
    customer: {
      name: "MUNDIA EXPORTS-EICL",
      strn: "",
      ntn: "",
      address: "",
    },
    invoice: {
      title: "Commission Invoice",
      number: "",
      date: "03-07-2024",
    },
    entries: [
      ["1", "0565D DILUENT", "4365", "225", "", "754.02", "169,655"],
      ["2", "5639NT P-CYAN", "", "24", "", "1,510.40", "36,250"],
      ["3", "5011GXF ROYAL BLUE", "3900", "25", "KG", "1,521.02", "38,026"],
    ],
    totals: {
      amount: "243,930",
      tax: {
        value: "43,907",
        percentage: "18",
      },
      grandTotal: {
        value: "287,837",
        weight: "274",
      },
    },
    amountInWords:
      "Rupees Two Hundred Eighty-Seven Thousand Eight Hundred Thirty-Six And Ninety-Three Paisas Only.",
    footer: {
      remarks: "REMARKS:",
      signatureText: "For EASTLAND INDUSTRIES CORPORATION PVT LTD.",
      signatures: [
        "Receiver's Signature",
        "Rechecked Signature",
        "Authorized Signature",
      ],
    },
  };

  const {
    page,
    company,
    customer,
    invoice,
    entries,
    totals,
    amountInWords,
    footer,
  } = config;
  const { width: pageWidth, height: pageHeight, margin } = page;

  const drawHeader = (y = margin) => {
    const headerStartY = y;
    const headerHeight = 30;
    const contentWidth = pageWidth - 2 * margin;

    // Outer border for full header section
    doc.setLineWidth(0.3);
    doc.rect(margin, headerStartY, contentWidth, headerHeight);

    // Logo placeholder as a circle
    const logoX = margin + 18.5;
    const logoY = y + 14.5;
    doc.setLineWidth(0.2);
    doc.circle(logoX, logoY, 10);
    doc.setFontSize(7);
    doc.text("LOGO", logoX, logoY, { align: "center" });

    // === Top Row ===
    // Commission Invoice (top center)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(invoice.title, pageWidth / 2, y + 4, { align: "center" });

    // Underline under 'Commission Invoice'
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.line(pageWidth / 2 - 16, y + 5, pageWidth / 2 + 16, y + 5);

    // === Company Info (centered lower) ===
    const centerX = pageWidth / 2 + 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(company.name, centerX, y + 11, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(company.address, centerX, y + 15.5, { align: "center" });
    doc.text(company.contact, centerX, y + 19.5, { align: "center" });
    doc.text(company.taxInfo, centerX, y + 23.5, { align: "center" });

    return y + headerHeight;
  };

  const drawInvoiceInfo = (y = margin + 35) => {
    const sectionHeight = 35;
    const sectionWidth = pageWidth - 2 * margin;
    const halfWidth = sectionWidth / 2;

    const leftX = margin;
    const rightX = margin + halfWidth;

    // Draw equal-width left & right boxes
    doc.setLineWidth(0.2);
    doc.rect(leftX, y, halfWidth, sectionHeight);
    doc.rect(rightX, y, halfWidth, sectionHeight);

    // Fonts
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Customer Details:", leftX + 1.5, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(customer.name, leftX + 1.5, y + 10);

    // STRN and NTN side by side
    doc.text("STRN:", leftX + 1.5, y + 15);
    doc.text(customer.strn, leftX + 10, y + 15);
    doc.text("NTN:", leftX + halfWidth / 2, y + 15);
    doc.text(customer.ntn, leftX + halfWidth / 2 + 10, y + 15);

    // Address
    doc.text("Address:", leftX + 1.5, y + 20);
    doc.text(customer.address, leftX + 1.5, y + 20);

    // === Right Column ===
    doc.setFont("helvetica", "bold");
    doc.text("Invoice No:", rightX + 1.5, y + 5);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.number, rightX + 28, y + 5);

    doc.setFont("helvetica", "bold");
    doc.text("Date:", rightX + 1.5, y + 10);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.date, rightX + 28, y + 10);

    return y + sectionHeight;
  };

  const capitalizeFirst = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const drawTableHeader = (y) => {
    const headers = [
      "S.no",
      "DESCRIPTION",
      "BATCH NO",
      "QTY",
      "U/M",
      "PRICE",
      "AMOUNT (Rs)",
    ];
    const colWidths = [10, 62, 18, 25, 10, 30, 35];
    let x = margin;
    const headerHeight = 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0);

    headers.forEach((text, i) => {
      doc.setFillColor(220);
      doc.rect(x, y, colWidths[i], headerHeight, "FD");

      const textX = x + colWidths[i] / 2;
      const textY = y + headerHeight / 2 + 2.5;

      doc.text(capitalizeFirst(text), textX, textY, { align: "center" });

      x += colWidths[i];
    });

    return y + headerHeight;
  };

  const drawTableRow = (row, y) => {
    const colWidths = [10, 62, 18, 25, 10, 30, 35];
    let x = margin;
    const rowHeight = 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    row.forEach((cell, i) => {
      doc.rect(x, y, colWidths[i], rowHeight);

      const textX = x + colWidths[i] / 2;
      const textY = y + 4.2;

      doc.text(String(cell), textX, textY, { align: "center" });

      x += colWidths[i];
    });

    return y + rowHeight;
  };

  const drawTotals = (y) => {
    const rowHeight = 6;
    const labelWidth = 58;
    const valueWidth = 35;
    const boxX = pageWidth - margin - (labelWidth + valueWidth);

    const totalRows = [
      { label: "TOTAL AMOUNT", value: totals.amount, bold: true },
      { label: "ADD: SALES TAX", value: totals.tax.value, bold: true },
      { label: "GRAND AMOUNT", value: totals.grandTotal.value, bold: true },
    ];

    const priceColX = margin + 10 + 62 + 18 + 25 + 10; // PRICE column start

    totalRows.forEach(({ label, value, bold }) => {
      const textY = y + rowHeight / 2 + 2.2;

      // === Label ===
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(label, boxX + 1.5, textY);

      // === Value Cell ===
      doc.rect(boxX + labelWidth, y, valueWidth, rowHeight);
      doc.text(value, boxX + labelWidth + valueWidth / 2, textY, {
        align: "center",
      });

      y += rowHeight;

      // === Special Notes (BOLD now) ===
      if (label === "ADD: SALES TAX") {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`${totals.tax.percentage}     %`, priceColX + 12, y - 2);
      }

      if (label === "GRAND AMOUNT") {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`${totals.grandTotal.weight}     KG`, priceColX + 12, y - 2);

        // Underline under weight value
        const underlineStart = priceColX + 12;
        const underlineEnd = underlineStart + 5;
        doc.setLineWidth(0.3);
        doc.line(underlineStart, y - 1, underlineEnd, y - 1);
      }
    });

    return y;
  };

  const drawTableLeftRightBorders = (topY, bottomY) => {
    const tableLeft = margin;
    const tableRight = pageWidth - margin;

    doc.setLineWidth(0.4);
    doc.line(tableLeft, topY, tableLeft, bottomY);
    doc.line(tableRight, topY, tableRight, bottomY);
  };

  const drawAmountInWords = (y) => {
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(amountInWords, margin + 2, y);
    return y;
  };

  const drawFooter = (y) => {
    const remarksY = y + 5;

    // === REMARKS label ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(footer.remarks, margin + 2, remarksY);

    // === Dashed line after REMARKS ===
    const dashStartX = margin + 20;
    const dashEndX = 179;
    const dashY = remarksY;

    const dashLength = 2;
    const gap = 0.1;
    let x = dashStartX;
    while (x < dashEndX) {
      doc.line(x, dashY, x + dashLength, dashY);
      x += dashLength + gap;
    }

    // Line below REMARKS
    const borderY = dashY + 2;
    doc.setLineWidth(0.3);
    doc.line(margin, borderY, pageWidth - margin, borderY);

    // === Heading (right aligned above signatures) ===
    const headingY = borderY + 6;
    doc.setFont("helvetica", "bold");
    doc.text(footer.signatureText, margin + 103, headingY);

    // === Signature labels ===
    const signatureY = headingY + 25;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    footer.signatures.forEach((sig, index) => {
      const xPos =
        index === 0
          ? margin + 12
          : index === 1
          ? pageWidth / 2 - 20
          : pageWidth - margin - 40;
      doc.text(sig, xPos, signatureY);
    });

    return signatureY + 2;
  };

  // === Render Sequence ===
  let currentY = drawHeader();
  currentY = drawInvoiceInfo(currentY);
  currentY = drawTableHeader(currentY);

  const tableTopY = currentY;

  entries.forEach((row) => {
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = drawHeader();
      currentY = drawInvoiceInfo(currentY);
      currentY = drawTableHeader(currentY);
    }
    currentY = drawTableRow(row, currentY);
  });

  currentY = drawTotals(currentY);
  currentY = drawAmountInWords(currentY);
  const tableBottomY = drawFooter(currentY);

  drawTableLeftRightBorders(tableTopY, tableBottomY);
  doc.line(margin, tableBottomY, pageWidth - margin, tableBottomY);

  return doc;
};

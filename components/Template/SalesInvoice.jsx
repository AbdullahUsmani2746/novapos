import { jsPDF } from "jspdf";

export const generateSalesInvoicePDF = () => {
  // Consolidated configuration object
  const config = {
    page: {
      width: 210, // A4 width in mm
      height: 297, // A4 height in mm
      margin: 10,
    },
    company: {
      name: "EASTLAND INDUSTRIES CORPORATION PVT LTD.",
      address: "B-60, SITE, MANGHOPIR ROAD SITE, KARACHI",
      contact: "TEL. : 32581073-74   EMAIL : info@eastlandind.com",
      taxInfo: "STRN : 02-02-3215-001-91    NTN : 1019571-8",
    },
    invoice: {
      title: "Sales Tax Invoice",
      originalText: "ORIGINAL INVOICE",
      number: "13",
      date: "02-07-2024",
    },
    customer: {
      name: "MUNDIA EXPORTS-EICL",
      strn: "",
      ntn: "",
      address: "Address",
    },
    table: {
      headers: [
        "S.no",
        "DESCRIPTION",
        "BATCH NO",
        "QTY",
        "U/M",
        "PRICE",
        "AMOUNT (Rs)",
      ],
      colWidths: [10, 62, 18, 25, 10, 30, 35],
      rowHeight: 5,
      headerHeight: 18,
    },
    entries: [
      ["1", "0565D DILUENT", "4365", "225", "KG", "754.02", "169,655"],
      ["2", "5639NT P-CYAN", "3900", "24", "KG", "1510.40", "36,250"],
      ["3", "5011GXF ROYAL BLUE", "", "25", "KG", "1521.02", "38,026"],
      ["1", "0565D DILUENT", "4365", "225", "KG", "754.02", "169,655"],
      ["2", "5639NT P-CYAN", "3900", "24", "KG", "1510.40", "36,250"],
      ["3", "5011GXF ROYAL BLUE", "", "25", "KG", "1521.02", "38,026"],
      ["1", "0565D DILUENT", "4365", "225", "KG", "754.02", "169,655"],
      ["2", "5639NT P-CYAN", "3900", "24", "KG", "1510.40", "36,250"],
      ["3", "5011GXF ROYAL BLUE", "", "25", "KG", "1521.02", "38,026"],
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

  // Destructure config for easier access
  const {
    page,
    company,
    invoice,
    customer,
    table,
    entries,
    totals,
    amountInWords,
    footer,
  } = config;
  const { width: pageWidth, height: pageHeight, margin } = page;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

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

    // Invoice title and original text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(invoice.title, pageWidth / 2, y + 4, { align: "center" });

    // Underline under invoice title
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.line(pageWidth / 2 - 16, y + 5, pageWidth / 2 + 16, y + 5);

    // Original invoice text
    doc.setFont("helvetica", "italic", "bold");
    doc.setFontSize(9);
    doc.text(invoice.originalText, pageWidth - margin - 34, y + 4);

    // Company information
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

    // Customer details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Customer Details:", leftX + 1.5, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(customer.name, leftX + 1.5, y + 10);

    // STRN and NTN
    doc.text("STRN:", leftX + 1.5, y + 15);
    doc.text(customer.strn, leftX + 10, y + 15);
    doc.text("NTN:", leftX + halfWidth / 2, y + 15);
    doc.text(customer.ntn, leftX + halfWidth / 2 + 10, y + 15);

    // Address
    doc.text("Address:", leftX + 1.5, y + 20);
    doc.text(customer.address, leftX + 1.5, y + 20);

    // Invoice details (right column)
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
    let x = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0);

    table.headers.forEach((text, i) => {
      doc.setFillColor(220);
      doc.rect(x, y, table.colWidths[i], table.headerHeight, "FD");

      const textX = x + table.colWidths[i] / 2;
      const textY = y + table.headerHeight / 2 + 2.5;

      doc.text(capitalizeFirst(text), textX, textY, { align: "center" });
      x += table.colWidths[i];
    });

    return y + table.headerHeight;
  };

  const drawTableRow = (row, y) => {
    let x = margin;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    row.forEach((cell, i) => {
      doc.rect(x, y, table.colWidths[i], table.rowHeight);
      doc.text(String(cell), x + table.colWidths[i] / 2, y + 4.2, {
        align: "center",
      });
      x += table.colWidths[i];
    });

    return y + table.rowHeight;
  };

  const drawTotals = (y) => {
    const rowHeight = 6;
    const labelWidth = 58;
    const valueWidth = 35;
    const boxX = pageWidth - margin - (labelWidth + valueWidth);
    const priceColX = margin + 10 + 62 + 18 + 25 + 10; // PRICE column start

    const totalRows = [
      { label: "TOTAL AMOUNT", value: totals.amount },
      { label: "ADD: SALES TAX", value: totals.tax.value },
      { label: "GRAND AMOUNT", value: totals.grandTotal.value },
    ];

    totalRows.forEach(({ label, value }) => {
      const textY = y + rowHeight / 2 + 2.2;

      // Label and value
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(label, boxX + 1.5, textY);
      doc.rect(boxX + labelWidth, y, valueWidth, rowHeight);
      doc.text(value, boxX + labelWidth + valueWidth / 2, textY, {
        align: "center",
      });

      // Special notes
      if (label === "ADD: SALES TAX") {
        doc.text(`${totals.tax.percentage}     %`, priceColX + 12, y - 2);
      }

      if (label === "GRAND AMOUNT") {
        doc.text(`${totals.grandTotal.weight}     KG`, priceColX + 12, y - 2);
        doc.setLineWidth(0.3);
        doc.line(priceColX + 12, y - 1, priceColX + 17, y - 1);
      }

      y += rowHeight;
    });

    return y;
  };

  const drawTableLeftRightBorders = (topY, bottomY) => {
    doc.setLineWidth(0.4);
    doc.line(margin, topY, margin, bottomY);
    doc.line(pageWidth - margin, topY, pageWidth - margin, bottomY);
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

    // Remarks section
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(footer.remarks, margin + 2, remarksY);

    // Dashed line
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

    // Line below remarks
    doc.setLineWidth(0.3);
    doc.line(margin, remarksY + 2, pageWidth - margin, remarksY + 2);

    // Signature heading
    const headingY = remarksY + 8;
    doc.setFont("helvetica", "bold");
    doc.text(footer.signatureText, margin + 103, headingY);

    // Signature labels
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

  // === Main rendering sequence ===
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

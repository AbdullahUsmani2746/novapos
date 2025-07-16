import { jsPDF } from "jspdf";
import { toWords } from "number-to-words";

export const generateUnifiedPDF = (voucher) => {
  const {
    dateD,
    tran_code,
    vr_no,
    userId,
    rmk,
    transactions,
    acno,
    rmk1,
    documentType,
    customer,
    entries,
    totals,
    invoice,
  } = voucher;


  console.log("Generating PDF for document type:", voucher);

  // Professional color palette with better contrast
  const colors = {
    primary: [30, 81, 123], // Deep professional blue
    secondary: [44, 62, 80], // Charcoal gray
    accent: [192, 57, 43], // Corporate red
    success: [39, 174, 96], // Professional green
    warning: [243, 156, 18], // Amber
    light: [245, 246, 247], // Subtle light gray
    lighter: [250, 251, 252], // Very light background
    white: [255, 255, 255], // Pure white
    dark: [33, 37, 41], // Dark text
    border: [169, 169, 169], // Medium gray border
    headerBg: [241, 243, 244], // Header background
    alternateRow: [249, 250, 251], // Table alternate row
    shadow: [200, 200, 200], // Shadow effect
    textMuted: [108, 117, 125], // Muted text
  };

  // Document type configurations with enhanced styling
  const documentTypes = {
    commission: {
      title: "COMMISSION INVOICE",
      color: colors.primary,
      headers: [
        "S.No",
        "DESCRIPTION",
        "BATCH NO",
        "QTY",
        "U/M",
        "PRICE",
        "AMOUNT (Rs)",
      ],
      colWidths: [12, 60, 20, 18, 12, 28, 35],
      showTotals: true,
      showAmountInWords: true,
      showTax: true,
      icon: "₹",
    },
    delivery: {
      title: "DELIVERY NOTE",
      color: colors.success,
      headers: ["S.No", "DESCRIPTION", "BATCH NO", "ITEM UNITS"],
      colWidths: [15, 70, 25, 75],
      showTotals: true,
      showAmountInWords: false,
      showTax: false,
      icon: "📦",
    },
    sales: {
      title: "SALES TAX INVOICE",
      color: colors.accent,
      headers: [
        "S.No",
        "DESCRIPTION",
        "BATCH NO",
        "QTY",
        "U/M",
        "PRICE",
        "AMOUNT (Rs)",
      ],
      colWidths: [12, 60, 20, 18, 12, 28, 35],
      showTotals: true,
      showAmountInWords: true,
      showTax: true,
      originalText: "ORIGINAL INVOICE",
      icon: "📋",
    },
  };

  const config = documentTypes[documentType] || documentTypes.commission;

  // Enhanced page configuration
  const page = {
    width: 210,
    height: 297,
    margin: 12,
    padding: 8,
  };

  // Enhanced company information
  const company = {
    name: "SILKY SILK INDUSTRIES (PVT) LTD",
    address: "B-60, SITE, MANGHOPIR ROAD SITE, KARACHI",
    contact: "TEL: 32581073-74 | EMAIL: info@eastlandind.com",
    taxInfo: "STRN: 02-02-3215-001-91 | NTN: 1019571-8",
    website: "www.eastlandind.com",
  };

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const { width: pageWidth, height: pageHeight, margin, padding } = page;

  // Enhanced helper functions
  const capitalizeFirst = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount.toString().replace(/,/g, "")) || 0;
    return num.toLocaleString("en-PK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const drawRoundedRect = (x, y, width, height, radius = 2) => {
    doc.roundedRect(x, y, width, height, radius, radius);
  };

  const drawShadowBox = (x, y, width, height, fillColor, borderColor) => {
    // Shadow effect
    doc.setFillColor(...colors.shadow);
    doc.rect(x + 0.5, y + 0.5, width, height, "F");

    // Main box
    doc.setFillColor(...fillColor);
    doc.rect(x, y, width, height, "FD");

    // Border
    doc.setLineWidth(0.3);
    doc.setDrawColor(...borderColor);
    doc.rect(x, y, width, height);
  };

  // Enhanced header with modern design
  const drawHeader = (y = margin) => {
    const headerHeight = 45;
    const contentWidth = pageWidth - 2 * margin;

    // Header background with gradient effect
    doc.setFillColor(...colors.headerBg);
    drawRoundedRect(margin, y, contentWidth, headerHeight);

    // Professional border
    doc.setLineWidth(0.8);
    doc.setDrawColor(...config.color);
    drawRoundedRect(margin, y, contentWidth, headerHeight);

    // Enhanced company logo area
    const logoX = margin + 20;
    const logoY = y + 22;

    // Logo shadow
    doc.setFillColor(...colors.shadow);
    doc.circle(logoX + 0.8, logoY + 0.8, 14, "F");

    // Logo background
    doc.setFillColor(...colors.white);
    doc.circle(logoX, logoY, 14, "F");

    // Logo border with gradient
    doc.setLineWidth(1.2);
    doc.setDrawColor(...config.color);
    doc.circle(logoX, logoY, 14);

    // Inner circle
    doc.setLineWidth(0.5);
    doc.setDrawColor(...colors.light);
    doc.circle(logoX, logoY, 11);

    // Logo text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(...config.color);
    doc.text("EASTLAND", logoX, logoY - 2, { align: "center" });
    doc.setFontSize(5);
    doc.text("INDUSTRIES", logoX, logoY + 2, { align: "center" });

    // Document title with enhanced styling
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...config.color);
    doc.text(config.title, pageWidth / 2, y + 12, { align: "center" });

    // Modern underline with multiple layers
    const titleWidth = 45;
    const underlineY = y + 15;
    doc.setLineWidth(1.5);
    doc.setDrawColor(...config.color);
    doc.line(
      pageWidth / 2 - titleWidth / 2,
      underlineY,
      pageWidth / 2 + titleWidth / 2,
      underlineY
    );

    doc.setLineWidth(0.5);
    doc.setDrawColor(...colors.light);
    doc.line(
      pageWidth / 2 - titleWidth / 2 - 5,
      underlineY + 1,
      pageWidth / 2 + titleWidth / 2 + 5,
      underlineY + 1
    );

    // Original invoice badge for sales
    if (documentType === "sales") {
      const badgeWidth = 35;
      const badgeHeight = 8;
      const badgeX = pageWidth - margin - badgeWidth - 5;
      const badgeY = y + 8;

      doc.setFillColor(...colors.accent);
      drawRoundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 3);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...colors.white);
      doc.text("ORIGINAL", badgeX + badgeWidth / 2, badgeY + 5, {
        align: "center",
      });
    }

    // Enhanced company information with better typography
    const centerX = pageWidth / 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...colors.dark);
    doc.text(company.name, centerX+5, y + 22, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...colors.secondary);
    doc.text(company.address, centerX, y + 27, { align: "center" });

    doc.setFontSize(8);
    doc.setTextColor(...colors.textMuted);
    doc.text(company.contact, centerX, y + 31, { align: "center" });
    doc.text(company.taxInfo, centerX, y + 35, { align: "center" });

    // Website
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(...config.color);
    doc.text(company.website, centerX, y + 39, { align: "center" });

    return y + headerHeight + 5;
  };

  // Enhanced invoice information with professional boxes
  const drawInvoiceInfo = (y) => {
    const sectionHeight = 45;
    const sectionWidth = pageWidth - 2 * margin;
    const halfWidth = (sectionWidth - 4) / 2;

    const leftX = margin;
    const rightX = margin + halfWidth + 4;

    // Customer details box with shadow
    drawShadowBox(
      leftX,
      y,
      halfWidth,
      sectionHeight,
      colors.lighter,
      colors.border
    );

    // Customer header
    doc.setFillColor(...config.color);
    doc.rect(leftX, y, halfWidth, 12, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...colors.white);
    doc.text("CUSTOMER DETAILS", leftX + 3, y + 8);

    // Customer content
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...colors.dark);
    doc.text(customer?.name || "MUNDIA EXPORTS-EICL", leftX + 3, y + 18);

    // Customer info in structured format
    const customerInfo = [
      { label: "STRN:", value: customer?.strn || "Not Available" },
      { label: "NTN:", value: customer?.ntn || "Not Available" },
    ];

    let infoY = y + 25;
    customerInfo.forEach(({ label, value }) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...colors.secondary);
      doc.text(label, leftX + 3, infoY);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colors.dark);
      doc.text(value, leftX + 18, infoY);
      infoY += 5;
    });

    // Address with better formatting
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...colors.secondary);
    doc.text("ADDRESS:", leftX + 3, y + 37);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.dark);
    const address = customer?.address || "Karachi, Pakistan";
    doc.text(address, leftX + 3, y + 42);

    // Invoice details box with shadow
    drawShadowBox(
      rightX,
      y,
      halfWidth,
      sectionHeight,
      colors.lighter,
      colors.border
    );

    // Invoice header
    doc.setFillColor(...config.color);
    doc.rect(rightX, y, halfWidth, 12, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...colors.white);
    doc.text("INVOICE DETAILS", rightX + 3, y + 8);

    // Invoice details with enhanced formatting
    const invoiceDetails = [
      { label: "Invoice No:", value: invoice?.number || vr_no || "INV-001" },
      {
        label: "Date:",
        value:
          invoice?.date ||
          (dateD
            ? new Date(dateD).toLocaleDateString("en-GB")
            : new Date().toLocaleDateString("en-GB")),
      },
      { label: "P.O. Number:", value: invoice?.po || "N/A" },
      { label: "Due Date:", value: invoice?.dueDate || "30 Days" },
    ];

    let detailY = y + 18;
    invoiceDetails.forEach(({ label, value }) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...colors.secondary);
      doc.text(label, rightX + 3, detailY);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colors.dark);
      doc.text(value, rightX + 28, detailY);
      detailY += 5;
    });

    return y + sectionHeight + 8;
  };

  // Enhanced table header with gradient effect
  const drawTableHeader = (y) => {
    let x = margin;
    const headerHeight = 12;

    // Header background with gradient
    doc.setFillColor(...config.color);
    doc.rect(margin, y, pageWidth - 2 * margin, headerHeight, "F");

    // Header border
    doc.setLineWidth(0.5);
    doc.setDrawColor(...colors.white);
    doc.rect(margin, y, pageWidth - 2 * margin, headerHeight);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...colors.white);

    config.headers.forEach((text, i) => {
      // Column separators
      if (i > 0) {
        doc.setLineWidth(0.3);
        doc.setDrawColor(...colors.white);
        doc.line(x, y, x, y + headerHeight);
      }

      // Header text with proper alignment
      const textX = x + config.colWidths[i] / 2;
      const textY = y + headerHeight / 2 + 2;
      doc.text(text.toUpperCase(), textX, textY, { align: "center" });

      x += config.colWidths[i];
    });

    return y + headerHeight;
  };

  // Enhanced table row with better formatting
  const drawTableRow = (row, y, isAlternate = false) => {
    let x = margin;
    const rowHeight = documentType === "delivery" ? 10 : 8;

    // Row background
    if (isAlternate) {
      doc.setFillColor(...colors.alternateRow);
      doc.rect(margin, y, pageWidth - 2 * margin, rowHeight, "F");
    }

    // Row border
    doc.setLineWidth(0.2);
    doc.setDrawColor(...colors.border);
    doc.rect(margin, y, pageWidth - 2 * margin, rowHeight);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colors.dark);

    row.forEach((cell, i) => {
      // Column separators
      if (i > 0) {
        doc.setLineWidth(0.1);
        doc.setDrawColor(...colors.border);
        doc.line(x, y, x, y + rowHeight);
      }

      // Cell text with proper alignment
      const textX = x + config.colWidths[i] / 2;
      const textY = y + rowHeight / 2 + 2;

      let cellText = String(cell || "");

      // Format currency columns
      if (i === config.headers.length - 1 && documentType !== "delivery") {
        cellText = formatCurrency(cellText);
      }

      doc.text(cellText, textX, textY, { align: "center" });

      x += config.colWidths[i];
    });

    return y + rowHeight;
  };

  // Enhanced totals section with professional styling
  const drawTotals = (y) => {
    if (!config.showTotals) return y;

    y += 5;
    const rowHeight = 10;
    const labelWidth = 70;
    const valueWidth = 45;
    const boxX = pageWidth - margin - (labelWidth + valueWidth);

    if (documentType === "delivery") {
      // Delivery totals with enhanced styling
      const totalBoxY = y;
      const totalBoxHeight = 20;

      drawShadowBox(
        boxX,
        totalBoxY,
        labelWidth + valueWidth,
        totalBoxHeight,
        colors.lighter,
        colors.border
      );

      doc.setFillColor(...config.color);
      doc.rect(boxX, totalBoxY, labelWidth + valueWidth, 8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...colors.white);
      doc.text(
        "DELIVERY SUMMARY",
        boxX + (labelWidth + valueWidth) / 2,
        totalBoxY + 5,
        { align: "center" }
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...colors.dark);
      doc.text(`Total Cans: ${totals?.cans || "0"}`, boxX + 5, totalBoxY + 15);
      doc.text(
        `Grand Total: ${totals?.weight || "0 KG"}`,
        boxX + 40,
        totalBoxY + 15
      );

      return y + totalBoxHeight + 5;
    } else {
      // Invoice totals with enhanced styling
      const totalRows = [
        {
          label: "SUBTOTAL",
          value: totals?.amount || "0.00",
          color: colors.dark,
        },
        {
          label: "SALES TAX",
          value: totals?.tax?.value || "0.00",
          color: colors.secondary,
        },
        {
          label: "GRAND TOTAL",
          value: totals?.grandTotal?.value || "0.00",
          color: config.color,
          isFinal: true,
        },
      ];

      totalRows.forEach(({ label, value, color, isFinal }) => {
        // Enhanced total row with shadow
        if (isFinal) {
          drawShadowBox(
            boxX,
            y,
            labelWidth + valueWidth,
            rowHeight,
            colors.lighter,
            config.color
          );
        }

        // Label section
        doc.setFillColor(...colors.light);
        doc.rect(boxX, y, labelWidth, rowHeight, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...color);
        doc.text(label, boxX + 5, y + rowHeight / 2 + 2);

        // Value section
        doc.setFillColor(...colors.white);
        doc.rect(boxX + labelWidth, y, valueWidth, rowHeight, "F");

        // Enhanced border for final total
        doc.setLineWidth(isFinal ? 0.8 : 0.3);
        doc.setDrawColor(...(isFinal ? config.color : colors.border));
        doc.rect(boxX + labelWidth, y, valueWidth, rowHeight);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(isFinal ? 10 : 9);
        doc.setTextColor(...color);
        doc.text(
          formatCurrency(value),
          boxX + labelWidth + valueWidth / 2,
          y + rowHeight / 2 + 2,
          { align: "center" }
        );

        y += rowHeight;
      });

      return y;
    }
  };

  // Enhanced amount in words with professional styling
  const drawAmountInWords = (y) => {
    if (!config.showAmountInWords) return y;

    y += 8;
    const totalAmount = String(totals?.grandTotal?.value) || String(totals?.amount )|| "0";
    const numericAmount = parseFloat(totalAmount.replace(/,/g, "")) || 0;
    const amountInWords = `Rupees ${toWords(parseInt(numericAmount)).replace(
      /\b\w/g,
      (l) => l.toUpperCase()
    )} Only.`;

    // Amount in words box
    const boxHeight = 15;
    drawShadowBox(
      margin,
      y,
      pageWidth - 2 * margin,
      boxHeight,
      colors.lighter,
      colors.border
    );

    doc.setFillColor(...config.color);
    doc.rect(margin, y, 50, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...colors.white);
    doc.text("AMOUNT IN WORDS", margin + 25, y + 5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...colors.dark);
    doc.text(amountInWords, margin + 5, y + 12);

    return y + boxHeight + 5;
  };

  // Enhanced footer with professional signature boxes
  const drawFooter = (y) => {
    y += 10;

    // Remarks section with enhanced styling
    if (documentType !== "delivery") {
      const remarksHeight = 20;
      drawShadowBox(
        margin,
        y,
        pageWidth - 2 * margin,
        remarksHeight,
        colors.lighter,
        colors.border
      );

      doc.setFillColor(...config.color);
      doc.rect(margin, y, 30, 8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...colors.white);
      doc.text("REMARKS", margin + 15, y + 5, { align: "center" });

      // Remarks text area
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...colors.dark);
      doc.text(rmk || "", margin + 5, y + 15);

      y += remarksHeight + 10;
    }

    // Company signature with enhanced styling
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...config.color);
    doc.text(
      `For ${company.name}`,
      pageWidth - margin - 5,
      y,
      { align: "right" }
    );

    y += 20;

    // Enhanced signature boxes
    const signatures = [
      { title: "RECEIVER'S SIGNATURE", subtitle: "Date & Stamp" },
      { title: "RECHECKED BY", subtitle: "Quality Control" },
      { title: "AUTHORIZED BY", subtitle: "Management" },
    ];

    const sigWidth = (pageWidth - 2 * margin - 8) / 3;
    const sigHeight = 25;

    signatures.forEach((sig, index) => {
      const xPos = margin + index * (sigWidth + 4);

      // Enhanced signature box with shadow
      drawShadowBox(
        xPos,
        y,
        sigWidth,
        sigHeight,
        colors.lighter,
        colors.border
      );

      // Signature header
      doc.setFillColor(...config.color);
      doc.rect(xPos, y, sigWidth, 8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...colors.white);
      doc.text(sig.title, xPos + sigWidth / 2, y + 5, { align: "center" });

      // Signature area
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...colors.textMuted);
      doc.text(sig.subtitle, xPos + sigWidth / 2, y + sigHeight - 3, {
        align: "center",
      });

      // Signature line
      doc.setLineWidth(0.3);
      doc.setDrawColor(...colors.border);
      doc.line(
        xPos + 5,
        y + sigHeight - 8,
        xPos + sigWidth - 5,
        y + sigHeight - 8
      );
    });

    return y + sigHeight + 5;
  };

  // Main rendering
  let currentY = drawHeader();
  currentY = drawInvoiceInfo(currentY);
  currentY = drawTableHeader(currentY);
  const tableTopY = currentY;

  const tableEntries = entries || [];
  const footerReserveHeight =
    (config.showTotals ? 30 : 0) + (config.showAmountInWords ? 20 : 0) + 60; // Includes footer height

  tableEntries.forEach((row, index) => {
    const isLastRow = index === tableEntries.length - 1;
    const rowHeight = 8;

    // Calculate remaining space
    const availableHeight = isLastRow
      ? pageHeight - footerReserveHeight - margin
      : pageHeight - margin;

    if (currentY + rowHeight > availableHeight) {
      doc.addPage();
      currentY = drawHeader();
      currentY = drawTableHeader(currentY);
    }

    currentY = drawTableRow(row, currentY, index % 2 === 1);
  });

  // Fill remaining space with empty rows for professional look
  const remainingSpace = pageHeight - currentY - 100;
  const emptyRowsCount = Math.floor(remainingSpace / 8);

  // for (let i = 0; i < Math.min(emptyRowsCount, 5); i++) {
  //   currentY = drawTableRow(
  //     new Array(config.headers.length).fill(""),
  //     currentY,
  //     (tableEntries.length + i) % 2 === 1
  //   );
  // }

  // Ensure footer starts from fixed bottom Y
  let footerStartY = pageHeight - footerReserveHeight - 10;
  if (footerStartY < currentY + 10) {
    doc.addPage();
    currentY = drawHeader();
    currentY = drawTableHeader(currentY);
    footerStartY = pageHeight - footerReserveHeight + 5;
  }

  // Pad empty space with blank rows (optional)
  // while (currentY + 8 < footerStartY - 5) {
  //   currentY = drawTableRow(
  //     new Array(config.headers.length).fill(""),
  //     currentY,
  //     (tableEntries.length + Math.floor((currentY - tableTopY) / 8)) % 2 === 1
  //   );
  // }

  // Draw footer sections starting from bottom
  let footerY = footerStartY;
  footerY = drawTotals(footerY);
  footerY = drawAmountInWords(footerY);
  const finalY = drawFooter(footerY);

  // Enhanced table borders
  doc.setLineWidth(0.8);
  doc.setDrawColor(...config.color);
  doc.rect(margin, tableTopY-53, pageWidth - 2 * margin, finalY - tableTopY +48);

  // Add page numbering
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colors.textMuted);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - margin - 5,
      pageHeight - 5,
      { align: "right" }
    );
  }

  return doc;
};

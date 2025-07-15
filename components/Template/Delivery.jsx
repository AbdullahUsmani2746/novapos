import { jsPDF } from "jspdf";

export const generateDeliveryPDF = () => {
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
      number: "13",
      date: "02-07-2024",
      po: "PO No: 12345",
    },
    document: {
      title: "Delivery Note",
    },
    customer: {
      name: "MUNDIA EXPORTS-EICL",
      strn: "",
      ntn: "",
      address: "Address",
    },
    table: {
      headers: ["S.NO", "Description", "Batch No", "Item Units"],
      colWidths: [12, 72, 22, 84], // Adjusted for delivery note columns
      rowHeight: 6,
      headerHeight: 15,
    },
    entries: [
      ["1", "0565D DILUENT", "4365", "25 X 9 = 225"],
      ["2", "5639NT P-CYAN", "", "24 X 1 = 24"],
      ["3", "5011GXF ROYAL BLUE", "3900", "25 X 1 = 25 KG"],
    ],
    totals: {
      cans: "11",
      weight: "274 KG",
    },
    footer: {
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
    document,
    invoice,
    customer,
    table,
    entries,
    totals,
    footer,
  } = config;
  const { width: pageWidth, height: pageHeight, margin } = page;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const capitalizeFirst = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const drawTableHeader = (y) => {
    let x = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0);

    // Draw vertical borders for each column
    table.headers.forEach((text, i) => {
      doc.setFillColor(220);
      doc.rect(x, y, table.colWidths[i], table.headerHeight, "FD");

      const textX = x + table.colWidths[i] / 2;
      const textY = y + table.headerHeight / 2 + 3;

      doc.text(capitalizeFirst(text), textX, textY, { align: "center" });

      // Draw right border for each column
      doc.setLineWidth(0.2);
      doc.line(
        x + table.colWidths[i],
        y,
        x + table.colWidths[i],
        y + table.headerHeight
      );

      x += table.colWidths[i];
    });

    // Draw left border for first column
    doc.setLineWidth(0.2);
    doc.line(margin, y, margin, y + table.headerHeight);

    return y + table.headerHeight;
  };

  const drawTableRow = (row, y) => {
    let x = margin;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    row.forEach((cell, i) => {
      const colWidth = table.colWidths[i];

      // Draw cell border
      doc.setLineWidth(0.1);
      doc.rect(x, y, colWidth, table.rowHeight);

      // Draw right border
      doc.setLineWidth(0.2);
      doc.line(x + colWidth, y, x + colWidth, y + table.rowHeight);

      // Center-align all text
      const textX = x + colWidth / 2;
      const textY = y + 5;

      doc.text(String(cell), textX, textY, { align: "center" });

      x += colWidth;
    });

    // Draw left border for first column
    doc.setLineWidth(0.2);
    doc.line(margin, y, margin, y + table.rowHeight);

    return y + table.rowHeight;
  };

  const drawTotals = (y) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);

    // Position within the last column ("Item Units")
    const colWidths = table.colWidths;
    const xStart = margin;
    const itemUnitsX = xStart + colWidths[0] + colWidths[1] + colWidths[2]; // Start of Item Units
    const itemUnitsWidth = colWidths[3];

    const yText = y + 6;

    // === Compose totals text
    const label1 = "Total Cans:";
    const value1 = totals.cans;
    const label2 = "Grand Total:";
    const value2 = totals.weight;

    // Final line to draw: "Total Cans: 11   Grand Total: 274"
    const fullText = `${label1} ${value1}                ${label2} ${value2}`;

    // Draw centered in "Item Units" column
    const textX = itemUnitsX + itemUnitsWidth / 2;
    doc.text(fullText, textX, yText, { align: "center" });

    // === Underline just the numbers (11 and 274)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);

    const value1Width = doc.getTextWidth(value1);
    const value2Width = doc.getTextWidth(value2);

    const label1Width = doc.getTextWidth(label1 + " ");
    const label2Width = doc.getTextWidth(label2 + " ");

    const fullTextWidth = doc.getTextWidth(fullText);

    // Calculate starting X for the full text
    const fullTextStartX = textX - fullTextWidth / 2;

    // Underline "11"
    const value1X = fullTextStartX + label1Width;
    doc.setLineWidth(0.3);
    doc.line(value1X, yText + 1, value1X + value1Width, yText + 1);

    // Underline "274"
    const value2X =
      fullTextStartX +
      label1Width +
      value1Width +
      doc.getTextWidth("   ") +
      label2Width;
    doc.line(value2X + 12, yText + 1, value2X + 12 + value2Width, yText + 1);

    return y + 10;
  };

  // === Main rendering sequence ===
  let currentY = margin;

  // Draw header (same as original)
  const headerStartY = currentY;
  const headerHeight = 30;
  const contentWidth = pageWidth - 2 * margin;
  doc.setLineWidth(0.3);
  doc.rect(margin, headerStartY, contentWidth, headerHeight);
  const logoX = margin + 18.5;
  const logoY = currentY + 14.5;
  doc.setLineWidth(0.2);
  doc.circle(logoX, logoY, 10);
  doc.setFontSize(7);
  doc.text("LOGO", logoX, logoY, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(document.title, pageWidth / 2, currentY + 4, { align: "center" });
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.line(pageWidth / 2 - 16, currentY + 5, pageWidth / 2 + 16, currentY + 5);
  doc.setFont("helvetica", "italic", "bold");
  doc.setFontSize(9);
  const centerX = pageWidth / 2 + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(company.name, centerX, currentY + 11, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(company.address, centerX, currentY + 15.5, { align: "center" });
  doc.text(company.contact, centerX, currentY + 19.5, { align: "center" });
  doc.text(company.taxInfo, centerX, currentY + 23.5, { align: "center" });

  const drawInvoiceInfo = (y = margin + 35) => {
    const sectionHeight = 35;
    const sectionWidth = pageWidth - 2 * margin;
    const halfWidth = sectionWidth / 2;

    const leftX = margin;
    const rightX = margin + halfWidth;

    // Draw left & right bordered sections
    doc.setLineWidth(0.2);
    doc.rect(leftX, y, halfWidth, sectionHeight);
    doc.rect(rightX, y, halfWidth, sectionHeight);

    // === Left: Customer Info ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Customer Details:", leftX + 1.5, y + 5);

    doc.setFont("helvetica", "normal");
    doc.text(customer.name, leftX + 1.5, y + 10);

    doc.text("STRN:", leftX + 1.5, y + 15);
    doc.text(customer.strn, leftX + 12, y + 15);

    doc.text("NTN:", leftX + halfWidth / 2, y + 15);
    doc.text(customer.ntn, leftX + halfWidth / 2 + 10, y + 15);

    doc.text("Address:", leftX + 1.5, y + 20);
    doc.text(customer.address, leftX + 15, y + 20, {
      maxWidth: halfWidth - 17,
    });

    // === Right: Invoice Info ===
    doc.setFont("helvetica", "bold");
    doc.text("Invoice No:", rightX + 1.5, y + 5);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.number, rightX + 28, y + 5);

    doc.setFont("helvetica", "bold");
    doc.text("Date:", rightX + 1.5, y + 10);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.date, rightX + 28, y + 10);

    doc.setFont("helvetica", "bold");
    doc.text("P.O. Number:", rightX + 1.5, y + 15);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.po, rightX + 28, y + 15);

    return y + sectionHeight;
  };

  currentY += headerHeight;
  currentY = drawInvoiceInfo(currentY);

  // Draw the modified table
  currentY = drawTableHeader(currentY);
  const tableTopY = currentY;

  entries.forEach((row) => {
    currentY = drawTableRow(row, currentY);
  });

  currentY = drawTotals(currentY);

  // Draw footer (same as original)
  const headingY = currentY + 8;
  doc.setFont("helvetica", "bold");
  doc.text(footer.signatureText, pageWidth - margin - 2, headingY, {
    align: "right",
  });
  const signatureY = headingY + 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  footer.signatures.forEach((sig, index) => {
    const xPos =
      index === 0
        ? margin + 25
        : index === 1
        ? pageWidth / 2
        : pageWidth - margin - 40;
    doc.text(sig, xPos, signatureY, { align: "center" });
  });
  const tableBottomY = signatureY + 2;

  // Draw table borders
  doc.setLineWidth(0.4);
  doc.line(margin, tableTopY, margin, tableBottomY);
  doc.line(pageWidth - margin, tableTopY, pageWidth - margin, tableBottomY);
  doc.line(margin, tableBottomY, pageWidth - margin, tableBottomY);

  return doc;
};

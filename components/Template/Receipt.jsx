import { jsPDF } from "jspdf";

export const generateReceiptPDF = () => {
  // ============== ALL VALUES CONSOLIDATED HERE ==============
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;

  const companyName = "MNT";
  const voucherTitle = "RECEIPT VOUCHER";
  const headerColor = [240, 255, 200];
  const titleColor = [100, 100, 100];

  const headerValues = {
    date: "02-07-24",
    vrNo: "BRV",
    trNo: "1020000087",
    user: "FA_MNT",
    printOn: "10-07-25 19:05:20",
    paidFrom: "Cash-MNT",
    narration: "CHEQUE RECEIVED SAQIB PRINTER",
  };

  const entries = [
    { acctNo: "1657", accountTitle: "SAQIB PRINTER-MNT", amount: "25,000.00" },
    { acctNo: "1657", accountTitle: "SAQIB PRINTER-MNT", amount: "68,200.00" },
    { acctNo: "1657", accountTitle: "SAQIB PRINTER-MNT", amount: "50,000.00" },
    { acctNo: "1657", accountTitle: "SAQIB PRINTER-MNT", amount: "100,000.00" },
  ];

  const totalAmount = "243,200.00";
  const amountInWordsText =
    "Rupees Two Hundred Forty-Three Thousand Two Hundred Only.";

  // ============== ORIGINAL CODE BELOW (UNCHANGED) ==============
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const drawHeader = (yPosition = margin) => {
    // Company name section
    const companyHeight = 10;
    doc.setFont("times", "italic");
    doc.setFontSize(20);
    doc.setFillColor(...headerColor);
    doc.rect(0, yPosition, pageWidth, companyHeight, "FD");
    doc.setLineWidth(0.3);
    doc.setDrawColor(0);
    doc.line(0, yPosition, pageWidth, yPosition);
    doc.line(
      0,
      yPosition + companyHeight,
      pageWidth,
      yPosition + companyHeight
    );
    doc.setTextColor(0, 51, 153);
    doc.text(companyName, pageWidth / 2, yPosition + 7, { align: "center" });

    // Receipt Voucher title
    const titleHeight = 6;
    const titleY = yPosition + companyHeight + 4;
    doc.setFillColor(...titleColor);
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bolditalic");
    doc.setFontSize(12);

    doc.rect(margin, titleY, pageWidth - 2 * margin, titleHeight, "FD");

    // Centered title text
    doc.text(voucherTitle, pageWidth / 2, titleY + 5, {
      align: "center",
    });

    // Reset styles for form
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setLineWidth(0.4);
    doc.setDrawColor(150, 150, 150);
    const formY = titleY + titleHeight;
    const rowHeight = 5;
    const gap = 1.5;
    const labelW = 12;
    const valueW = 24;

    // ===== Row 1 =====
    const row1Y = formY;

    // Date
    doc.setFillColor(245);
    doc.rect(margin, row1Y, labelW, rowHeight, "FD");
    doc.text("Date", margin + 2, row1Y + 4);

    doc.rect(margin + labelW + gap, row1Y, valueW, rowHeight);
    doc.text(headerValues.date, margin + labelW + gap + 2, row1Y + 4);

    // Vr No
    const vrX = pageWidth - margin - 4 - labelW - valueW - gap;
    doc.setFillColor(245);
    doc.rect(vrX, row1Y, labelW, rowHeight, "FD");
    doc.text("Vr No", vrX + 2, row1Y + 4);

    doc.rect(vrX + labelW + gap, row1Y, valueW + 4, rowHeight);
    doc.text(headerValues.vrNo, vrX + labelW + gap + 2, row1Y + 4);

    // ===== Row 2 =====
    const row2Y = row1Y + rowHeight;

    doc.setFillColor(245);
    doc.rect(margin, row2Y, labelW, rowHeight, "FD");
    doc.text("Tr No", margin + 2, row2Y + 4);

    doc.rect(margin + labelW + gap, row2Y, valueW, rowHeight);
    doc.text(headerValues.trNo, margin + labelW + gap + 1, row2Y + 4);

    // Check#
    const checkX = margin + labelW + gap + valueW + gap;
    doc.setFillColor(245);
    doc.rect(checkX, row2Y, labelW, rowHeight, "FD");
    doc.text("Check#", checkX + 2, row2Y + 4);

    doc.rect(checkX + labelW + gap, row2Y, 25, rowHeight);

    // Chk Date
    const chkDateX = checkX + labelW + gap + 25 + gap;
    doc.setFillColor(245);
    doc.rect(chkDateX, row2Y, labelW + 2, rowHeight, "FD");
    doc.text("Chk Date", chkDateX + 2, row2Y + 4);

    doc.rect(chkDateX + labelW + 2 + gap, row2Y, valueW - 2, rowHeight);

    // User
    const userX = chkDateX + labelW + 2 + gap + valueW - 2 + gap;
    doc.setFillColor(245);
    doc.rect(userX, row2Y, labelW, rowHeight, "FD");
    doc.text("User", userX + 2, row2Y + 4);

    doc.rect(userX + labelW + gap, row2Y, valueW, rowHeight);
    doc.text(headerValues.user, userX + labelW + gap + 2, row2Y + 4);

    // Print On
    doc.setFillColor(245);
    doc.rect(vrX, row2Y, labelW, rowHeight, "FD");
    doc.text("Print on", vrX + 2, row2Y + 4);

    doc.rect(vrX + labelW + gap, row2Y, valueW + 4, rowHeight);
    doc.text(headerValues.printOn, vrX + labelW + gap + 2, row2Y + 4);

    // ===== Paid From =====
    const paidFromY = row2Y + rowHeight;
    const paidFromHeight = 5;
    const labelWidth = 18;
    const valueWidth = pageWidth - 2 * margin - labelWidth - gap;

    doc.setFillColor(245);
    doc.rect(margin, paidFromY, labelWidth, paidFromHeight, "FD");
    doc.text("Paid From", margin + 2, paidFromY + 3.5);

    const valueX = margin + labelWidth + gap;
    doc.rect(valueX, paidFromY, valueWidth, paidFromHeight);
    doc.text(headerValues.paidFrom, valueX + 2, paidFromY + 3.5);

    // ===== Narration =====
    const narrationY = paidFromY + paidFromHeight;
    doc.rect(margin, narrationY, pageWidth - 2 * margin, 5);
    doc.text("Narration", pageWidth / 2, narrationY + 4, { align: "center" });

    const narrationContentY = narrationY + 5;
    doc.rect(margin, narrationContentY, pageWidth - 2 * margin, 5);
    doc.text(headerValues.narration, margin + 2, narrationContentY + 3.5);

    return narrationY + 13;
  };

  const drawTableHeader = (yPosition) => {
    const rowHeight = 6;
    const gap = 1.5;
    const col1Width = 15;
    const col2Width = 135;
    const col3Width = 37;

    const col1X = margin;
    const col2X = col1X + col1Width + gap;
    const col3X = col2X + col2Width + gap;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);

    // Column 1: Acct No
    doc.setLineWidth(0.5);
    doc.setDrawColor(140, 140, 140);
    doc.setFillColor(245, 245, 245);
    doc.rect(col1X, yPosition, col1Width, rowHeight, "FD");
    doc.text("Acct No", col1X + col1Width / 2, yPosition + 4, {
      align: "center",
    });

    // Column 2: Account Title
    doc.setLineWidth(0.5);
    doc.setDrawColor(140, 140, 140);
    doc.setFillColor(245, 245, 245);
    doc.rect(col2X, yPosition, col2Width, rowHeight, "FD");
    doc.text("Account Title", col2X + col2Width / 2, yPosition + 4, {
      align: "center",
    });

    // Column 3: Amount
    doc.setLineWidth(0.5);
    doc.setDrawColor(140, 140, 140);
    doc.setFillColor(245, 245, 245);
    doc.rect(col3X, yPosition, col3Width, rowHeight, "FD");
    doc.text("Amount", col3X + col3Width / 2, yPosition + 4, {
      align: "center",
    });

    return yPosition + rowHeight;
  };

  const drawTableRow = (entry, yPosition, rowHeight = 5) => {
    const gap = 1.5;
    const col1Width = 15;
    const col2Width = 135;
    const col3Width = 37;

    const col1X = margin;
    const col2X = col1X + col1Width + gap;
    const col3X = col2X + col2Width + gap;

    doc.setLineWidth(0.2);
    doc.setDrawColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);

    // Acct No Cell
    doc.rect(col1X, yPosition, col1Width, rowHeight);
    doc.text(entry.acctNo, col1X + 4, yPosition + 3.5);

    // Account Title Cell
    doc.rect(col2X, yPosition, col2Width, rowHeight);
    doc.text(entry.accountTitle, col2X + 2, yPosition + 3.5);

    // Amount Cell
    doc.rect(col3X, yPosition, col3Width, rowHeight);
    doc.text(entry.amount, col3X + col3Width - 2, yPosition + 3.5, {
      align: "right",
    });

    return yPosition + rowHeight;
  };

  const drawTotal = (yPosition) => {
    const totalHeight = 6;
    yPosition += 22;

    const labelWidth = 152;
    const gap = 2;
    const amountWidth = 37;

    const labelX = margin;
    const amountX = margin + labelWidth + gap;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);

    // === Left Box ("Total:")
    doc.setLineWidth(0.2);
    doc.setDrawColor(0);
    doc.setFillColor(245, 245, 245);
    doc.rect(labelX, yPosition, labelWidth, totalHeight, "FD");
    doc.text("Total:", labelX + labelWidth - 10, yPosition + 4.2, {
      align: "right",
    });

    // === Right Box (Amount)
    doc.setLineWidth(0.2);
    doc.setDrawColor(0);
    doc.setFillColor(245, 245, 245);
    doc.rect(amountX, yPosition, amountWidth, totalHeight, "FD");
    doc.text(totalAmount, amountX + amountWidth - 2, yPosition + 4.2, {
      align: "right",
    });

    return yPosition + totalHeight;
  };

  const drawAmountInWords = (yPosition) => {
    yPosition += 1;

    const textX = margin;
    const textY = yPosition + 5;
    const boxWidth = pageWidth - 1.8 * margin;
    const boxHeight = 9;

    doc.setLineWidth(0.2);
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(0);
    doc.rect(textX, textY, boxWidth, boxHeight, "F");
    doc.rect(textX, textY, boxWidth, boxHeight);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text(amountInWordsText, textX + 2, textY + 4);

    return textY + boxHeight;
  };

  const drawFooter = (yPosition) => {
    yPosition += 12;
    const signatureY = yPosition + 25;
    const lineY = signatureY - 5;
    const lineWidth = 35;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);

    const accountantX = margin + 20;
    doc.line(accountantX, lineY, accountantX + lineWidth, lineY);
    doc.text("Accountant", accountantX + lineWidth / 2, signatureY, {
      align: "center",
    });

    const directorX = pageWidth / 2 - lineWidth / 2;
    doc.line(directorX, lineY, directorX + lineWidth, lineY);
    doc.text("Director", directorX + lineWidth / 2, signatureY, {
      align: "center",
    });

    const director2X = pageWidth - margin - 20 - lineWidth;
    doc.line(director2X, lineY, director2X + lineWidth, lineY);
    doc.text("Director", director2X + lineWidth / 2, signatureY, {
      align: "center",
    });
  };

  // === Begin PDF Rendering ===
  let currentY = drawHeader();
  currentY = drawTableHeader(currentY);

  entries.forEach((entry) => {
    if (currentY > pageHeight - 80) {
      doc.addPage();
      currentY = drawHeader();
      currentY = drawTableHeader(currentY);
    }
    currentY = drawTableRow(entry, currentY);
  });

  currentY = drawTotal(currentY);
  currentY = drawAmountInWords(currentY);
  drawFooter(currentY);

  return doc;
};

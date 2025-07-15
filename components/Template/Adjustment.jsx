import { jsPDF } from "jspdf";

export const generateAdjustmentPDF = () => {
  // Consolidated configuration object
  const config = {
    page: {
      width: 210, // A4 width in mm
      height: 290, // A4 height in mm
      margin: 10,
    },
    company: {
      name: "EASTLAND INDUSTRIES PVT LTD",
      title: "Journal Voucher",
    },
    header: {
      date: "30-JUN-24",
      voucherNo: "1",
      postedBy: "Posted By",
      timestamp: "10-07-25 19:03:15",
    },
    entries: [
      {
        code: "1351",
        account: "I.O.U.HBL A/C MR.GHAZANFAR-MNT",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "",
        credit: ".00",
      },
      {
        code: "1353",
        account: "I.O.U.MEZN A/C MRS.KIRAN GHAZANFAR-MNT",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "",
        credit: ".00",
      },
      {
        code: "1349",
        account: "I.O.U.CASH GATE PASS MR.ATHER-MNT",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "",
        credit: ".00",
      },
      {
        code: "1348",
        account: "I.O.U.CASH COMMETTI-MNT",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "",
        credit: ".00",
      },
      {
        code: "0246",
        account: "FAYSAL A/C # 3418 3010 0000 1385-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "",
        credit: ".00",
      },
      {
        code: "0964",
        account: "UBL A/C # 1374-9-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "",
        credit: ".00",
      },
      {
        code: "1350",
        account: "I.O.U.FSB A/C MR.ATHER-MNT",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "",
        credit: ".00",
      },
      {
        code: "1352",
        account: "I.O.U.MEZN A/C MR.ATIF ATHER-MNT",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "",
        credit: ".00",
      },
      {
        code: "1358",
        account: "I.O.U.UBL A/C MR.ATHER-MNT",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "",
        credit: ".00",
      },
      {
        code: "1034",
        account: "ZABS PACKAGES-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "1,044.30",
        credit: "",
      },
      {
        code: "0941",
        account: "THAL PACKAGES-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "3,782.60",
        credit: "",
      },
      {
        code: "0833",
        account: "ROTOTEC (PVT) LTD-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "5,572.50",
        credit: "",
      },
      {
        code: "0351",
        account: "KARIM CONTAINER (PVT) LTD-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "7,607.67",
        credit: "",
      },
      {
        code: "0739",
        account: "PACK N PACKAGES (PRIVATE) LIMITED-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "9,602.50",
        credit: "",
      },
      {
        code: "0784",
        account: "PREMIER PLASTIC INDS.PVT LTD-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "9,789.40",
        credit: "",
      },
      {
        code: "0772",
        account: "POLYCLOTH (PVT) LTD.-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "10,189.50",
        credit: "",
      },
      {
        code: "0300",
        account: "HIMALIYA PACKAGES (PVT) LTD-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "16,578.55",
        credit: "",
      },
      {
        code: "0234",
        account: "F.Z PACKAGES PVT LTD-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "16,610.41",
        credit: "",
      },
      {
        code: "0345",
        account: "JILANIFLEXIBLEPACKAGES.PVT.LTD-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "33,792.30",
        credit: "",
      },
      {
        code: "0242",
        account: "FAROOQ ENTERPRISES-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "41,477.12",
        credit: "",
      },
      {
        code: "0955",
        account: "TRANSWORLD MULTIPURPOSE (POLYESTER)-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "44,256.90",
        credit: "",
      },
      {
        code: "0306",
        account: "HUB POLY PACKAGES (PVT) LTD-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "45,104.91",
        credit: "",
      },
      {
        code: "0787",
        account: "PRIME PLASTICS (PVT) LTD.-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "62,129.31",
        credit: "",
      },
      {
        code: "0946",
        account: "THREADZ POLY PVT LTD-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "64,459.00",
        credit: "",
      },
      {
        code: "0949",
        account: "TOP LINK PACKAGING (PVT) LTD-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "64,722.50",
        credit: "",
      },
      {
        code: "0269",
        account: "GARIB SONS (PVT) LTD-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "64,900.00",
        credit: "",
      },
      {
        code: "0752",
        account: "PAK PLASTI PACK INDUSTRIES LTD-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "67,540.03",
        credit: "",
      },
      {
        code: "0653",
        account: "MAXX-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "84,568.32",
        credit: "",
      },
      {
        code: "0096",
        account: "BURHANI TUBE-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "109,563.20",
        credit: "",
      },
      {
        code: "0095",
        account: "BURHANI STS INDUSTRIES PVT LTD-EICL",
        narration: "OPENING BALANCE 01-JUL-2024",
        debit: "130,615.20",
        credit: "",
      },
    ],
    table: {
      header: {
        height: 6,
        fillColor: [220, 220, 220],
        columns: [
          { name: "Account", x: 1, align: "left", width: 80 },
          { name: "Narration", x: 100, align: "center", width: 31 },
          { name: "Debit", x: 157, align: "right", width: 31 },
          { name: "Credit", x: 188, align: "right", width: 31 },
        ],
        dividers: [80, 131, 158],
      },
      row: {
        height: 5,
        dividers: [10, 80, 131, 158],
      },
      total: {
        height: 6,
        gap: 3,
        label: "Total:",
        debit: "257,524,546.93",
        credit: "257,524,546.93",
      },
    },
    footer: {
      signatures: [
        { label: "Accountant", x: 20, lineWidth: 30 },
        { label: "Director", x: "center", lineWidth: 30 },
        { label: "Director", x: 20, lineWidth: 30, rightAlign: true },
      ],
      lineYOffset: -5,
      textYOffset: 28,
    },
  };

  // Destructure config for easier access
  const { page, company, header, entries, table, footer } = config;
  const { width: pageWidth, height: pageHeight, margin } = page;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  doc.setLineWidth(0.4);

  const drawHeader = (yPosition = margin) => {
    const companyHeight = 10;

    // Set font style and size
    doc.setFont("times", "italic");
    doc.setFontSize(20);

    const headerColor = [240, 255, 200];
    doc.setFillColor(...headerColor);
    doc.rect(0, yPosition, pageWidth, companyHeight, "FD");

    // Set top and bottom border lines for the bar
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
    doc.text(company.name, pageWidth / 2, yPosition + 7, { align: "center" });

    const titleHeight = 8;
    const titleY = yPosition + companyHeight + 2;

    doc.setFillColor(0, 0, 0);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "italic", "bold");
    doc.setFontSize(14);
    doc.rect(margin, titleY, pageWidth - 1.2 * margin, titleHeight, "F");
    doc.text(company.title, pageWidth / 2, titleY + 5, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    const dividerY = titleY + titleHeight + 2;
    doc.line(margin, dividerY, pageWidth - margin, dividerY);

    const infoY = dividerY + 5;
    const infoHeight = 7;
    doc.rect(margin, infoY - 5, pageWidth - 2 * margin, infoHeight);

    const dateLabelX = margin + 2;
    const dateValueX = margin + 25;
    const voucherLabelX = margin + 43;
    const voucherValueX = margin + 74;
    const postedByLabelX = margin + 90;
    const postedByValueX = margin + 145;
    const timestampX = margin + 160;

    doc.line(dateLabelX + 8, infoY - 5, dateLabelX + 8, infoY - 5 + infoHeight);
    doc.line(
      dateValueX + 15,
      infoY - 5,
      dateValueX + 15,
      infoY - 5 + infoHeight
    );
    doc.line(
      voucherLabelX + 14,
      infoY - 5,
      voucherLabelX + 14,
      infoY - 5 + infoHeight
    );
    doc.line(
      voucherValueX + 15,
      infoY - 5,
      voucherValueX + 15,
      infoY - 5 + infoHeight
    );
    doc.line(
      postedByLabelX + 13,
      infoY - 5,
      postedByLabelX + 13,
      infoY - 5 + infoHeight
    );
    doc.line(
      postedByValueX - 2,
      infoY - 5,
      postedByValueX - 2,
      infoY - 5 + infoHeight
    );
    doc.line(timestampX - 3, infoY - 5, timestampX - 3, infoY - 5 + infoHeight);

    doc.setFontSize(7);
    doc.text("Date", dateLabelX, infoY);
    doc.text(header.date, dateValueX, infoY, { align: "center" });
    doc.text("Voucher No", voucherLabelX, infoY);
    doc.text(header.voucherNo, voucherValueX, infoY);
    doc.text("Posted By", postedByLabelX, infoY);
    doc.text(header.postedBy, postedByValueX, infoY);
    doc.text(header.timestamp, timestampX, infoY);

    return infoY + infoHeight - 2;
  };

  const drawTableHeader = (yPosition) => {
    doc.setDrawColor(0, 0, 0);
    doc.setFillColor(...table.header.fillColor);
    doc.rect(
      margin,
      yPosition,
      pageWidth - 2 * margin,
      table.header.height,
      "F"
    );
    doc.rect(margin, yPosition, pageWidth - 2 * margin, table.header.height);

    table.header.dividers.forEach((x) => {
      doc.line(
        margin + x,
        yPosition,
        margin + x,
        yPosition + table.header.height
      );
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    table.header.columns.forEach((col) => {
      doc.text(col.name, margin + col.x, yPosition + 4, { align: col.align });
    });

    doc.line(
      margin,
      yPosition + table.header.height,
      pageWidth - margin,
      yPosition + table.header.height
    );
    doc.setDrawColor(150, 150, 150);

    return yPosition + 8;
  };

  const drawTableRow = (entry, yPosition) => {
    doc.rect(margin, yPosition, pageWidth - 2 * margin, table.row.height);
    table.row.dividers.forEach((x) => {
      doc.line(margin + x, yPosition, margin + x, yPosition + table.row.height);
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    doc.text(entry.code, margin + 1, yPosition + 3);
    const accountText = doc.splitTextToSize(entry.account, 67);
    doc.text(accountText, margin + 11, yPosition + 3);

    if (entry.narration) {
      const narrationText = doc.splitTextToSize(entry.narration, 48);
      doc.text(narrationText, margin + 81, yPosition + 3);
    }

    if (entry.debit) {
      doc.text(entry.debit, margin + 157, yPosition + 3, { align: "right" });
    }

    if (entry.credit) {
      doc.text(entry.credit, margin + 189, yPosition + 3, { align: "right" });
    }

    return yPosition + table.row.height;
  };

  const drawTotal = (yPosition) => {
    yPosition += table.total.gap;

    doc.setFillColor(...table.header.fillColor);
    doc.setDrawColor(0, 0, 0);
    doc.rect(
      margin,
      yPosition,
      pageWidth - 2 * margin,
      table.total.height,
      "F"
    );
    doc.rect(margin, yPosition, pageWidth - 2 * margin, table.total.height);

    doc.line(
      margin + 131,
      yPosition,
      margin + 131,
      yPosition + table.total.height
    );
    doc.line(
      margin + 158,
      yPosition,
      margin + 158,
      yPosition + table.total.height
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(table.total.label, margin + 1, yPosition + 4);
    doc.text(table.total.debit, margin + 157, yPosition + 4, {
      align: "right",
    });
    doc.text(table.total.credit, margin + 189, yPosition + 4, {
      align: "right",
    });

    doc.setDrawColor(150, 150, 150);

    return yPosition + table.total.height;
  };

  const drawFooter = (yPosition) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    footer.signatures.forEach((sig) => {
      const lineY = yPosition + 26 + footer.lineYOffset;
      const textY = yPosition + footer.textYOffset;
      let xPos;

      if (sig.x === "center") {
        xPos = pageWidth / 2;
      } else if (sig.rightAlign) {
        xPos = pageWidth - margin - sig.x;
      } else {
        xPos = margin + sig.x;
      }

      doc.line(
        xPos - sig.lineWidth / 2,
        lineY,
        xPos + sig.lineWidth / 2,
        lineY
      );
      doc.text(sig.label, xPos, textY, { align: "center" });
    });
  };

  // === Begin Drawing PDF ===
  let currentY = drawHeader();
  currentY = drawTableHeader(currentY);

  entries.forEach((entry) => {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = drawHeader();
      currentY = drawTableHeader(currentY);
    }
    currentY = drawTableRow(entry, currentY);
  });

  currentY = drawTotal(currentY);
  drawFooter(currentY);

  return doc;
};

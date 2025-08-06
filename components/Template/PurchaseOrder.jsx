import axios from "axios";
import { jsPDF } from "jspdf";

export const generatePurchaseOrderPDF = async (orderData) => {
  const order = orderData.data[0];

  // ============== PDF CONFIGURATION ==============
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;

  // Color Palette
  const colors = {
    primary: [46, 125, 50], // Green (Header)
    secondary: [239, 108, 0], // Orange (Accents)
    lightBg: [248, 249, 250],
    darkText: [33, 37, 41],
    border: [206, 212, 218],
    success: [40, 167, 69],
    white: [255, 255, 255],
  };

  let companyName = "";
  try {
    const response = await axios.get("/api/setup/companies");
    companyName = response.data.data[0].company;
  } catch (error) {
    console.error("Error fetching company name:", error);
    companyName = "EASTLAND INDUSTRIES PVT LTD";
  }

  const documentTitle = "PURCHASE ORDER";

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      })
      .toUpperCase();
  };

  // Dynamic order details from API
  const orderDetails = {
    date: formatDate(order.dateD),
    poNumber: order.order_no.toString().padStart(6, "0"),
    vendor: order.acno?.acname || "Unknown Vendor",
    reference: order.additional_instructions || "-",
    paymentTerms: order.payment_terms || "-",
    deliveryTerms: order.delivery_terms || "-",
    deliveryLocation: order.delivery_location || "-",
    dueDate: formatDate(order.due_date),
  };

  // Process order items from API (removed unit from here)
  const orderItems = order.orderDetails.map((item, index) => ({
    sNo: (index + 1).toString(),
    prodCode: item.items?.sku || "-",
    productName: item.items?.item || "Unknown Product",
    packing: `${item.no_of_packs}x${item.qty_per_pack}=${item.qty}`,
    qty: item.qty.toString(),
    rate: item.rate ? `$${item.rate.toFixed(2)}` : "-",
    amount: item.amount ? `$${item.amount.toFixed(2)}` : "-",
  }));

  // Calculate totals
  const totalAmount = order.orderDetails.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );

  // ============== PDF GENERATION ==============
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Header with company name and title
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

    // Underline
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

  // Order details section (unchanged)
  const drawOrderDetails = (yPosition) => {
    yPosition += 5;
    doc.setFillColor(...colors.white);
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 28, "FD");

    const rowHeight = 6;
    const labelWidth = 30;
    const valueWidth = 45;

    doc.setFontSize(10);
    doc.setLineWidth(0.2);
    doc.setDrawColor(...colors.border);

    // Date Row
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

    // PO Number (right side)
    const rightX = pageWidth - margin - labelWidth - valueWidth;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primary);
    doc.text("PO Number", rightX + 5, yPosition + 4);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.secondary);
    doc.text(
      orderDetails.poNumber,
      rightX + labelWidth + 5 + (valueWidth - 5) / 2,
      yPosition + 4,
      { align: "center" }
    );

    yPosition += rowHeight;

    // Vendor Row
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primary);
    doc.text("Vendor", margin + 5, yPosition + 4);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.darkText);
    doc.text(
      orderDetails.vendor,
      margin + labelWidth + (pageWidth - 2 * margin - labelWidth) / 2,
      yPosition + 4,
      { align: "center" }
    );

    yPosition += rowHeight;

    // Reference + Payment Terms Row
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primary);
    doc.text("Reference", margin + 5, yPosition + 4);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.darkText);
    doc.text(
      orderDetails.reference,
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

    yPosition += rowHeight;

    // Delivery Terms + Due Date Row
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primary);
    doc.text("Delivery Terms", margin + 5, yPosition + 4);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.darkText);
    doc.text(
      orderDetails.deliveryTerms,
      margin + labelWidth + valueWidth / 2,
      yPosition + 4,
      { align: "center" }
    );

    const dueDateX = pageWidth - margin - labelWidth - valueWidth;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primary);
    doc.text("Due Date", dueDateX + 5, yPosition + 4);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.darkText);
    doc.text(
      orderDetails.dueDate,
      dueDateX + labelWidth + 5 + (valueWidth - 5) / 2,
      yPosition + 4,
      { align: "center" }
    );

    return yPosition + rowHeight + 6;
  };

  // Table with items (modified to remove unit column)
  const drawTableHeader = (yPosition) => {
    const rowHeight = 7;
    // Removed unit column width (15) and redistributed to description
    const colWidths = [10, 23, 87, 20, 15, 15, 20];
    let currentX = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...colors.white);
    doc.setLineWidth(0.5);
    doc.setDrawColor(...colors.primary);

    // Removed "Unit" from headers
    const headers = [
      "S.No",
      "Prod Code",
      "Product Name",
      "Packing",
      "Qty",
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
    // Adjusted column widths to match header (without unit)
    const colWidths = [10, 23, 87, 20, 15, 15, 20];
    let currentX = margin;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setLineWidth(0.2);
    doc.setDrawColor(...colors.border);

    // Removed unit from values
    const values = [
      item.sNo,
      item.prodCode,
      item.productName,
      item.packing,
      item.qty,
      item.rate,
      item.amount,
    ];

    // Zebra striping
    const isEvenRow = parseInt(item.sNo) % 2 === 0;
    const rowColor = isEvenRow ? colors.lightBg : colors.white;

    values.forEach((value, index) => {
      doc.setFillColor(...rowColor);
      doc.rect(currentX, yPosition, colWidths[index], rowHeight, "FD");

      if (index === 5 || index === 6) doc.setTextColor(...colors.primary);
      else if (index === 4) doc.setTextColor(...colors.secondary);
      else doc.setTextColor(...colors.darkText);

      if ([0, 3, 4].includes(index)) {
        doc.text(value, currentX + colWidths[index] / 2, yPosition + 4, {
          align: "center",
        });
      } else if ([5, 6].includes(index)) {
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

  // Total row (adjusted for removed column)
  const drawTotal = (yPosition) => {
    const rowHeight = 7;
    const colWidths = [10, 23, 87, 20, 15, 15, 20];
    let currentX = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setFillColor(...colors.lightBg);
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.3);
    doc.setTextColor(...colors.primary);

    // Merged cells for label (adjusted for removed column)
    const mergedWidth =
      colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4];
    doc.rect(currentX, yPosition, mergedWidth, rowHeight, "FD");
    doc.text("Total", currentX + mergedWidth - 5, yPosition + 5, {
      align: "right",
    });
    currentX += mergedWidth;

    // Total amount
    doc.setFillColor(...colors.white);
    doc.rect(currentX, yPosition, colWidths[5] + colWidths[6], rowHeight, "FD");
    doc.setTextColor(...colors.success);
    doc.text(
      `$${totalAmount.toFixed(2)}`,
      pageWidth - margin - 5,
      yPosition + 5,
      { align: "right" }
    );

    return yPosition + rowHeight;
  };

  // Signature section (unchanged)
  const drawSignatures = (yPosition) => {
    yPosition += 160;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...colors.darkText);

    doc.setDrawColor(...colors.secondary);
    doc.setLineWidth(0.5);

    const lineY = yPosition + 15;
    doc.line(margin + 20, lineY, margin + 80, lineY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primary);
    doc.text("AUTHORIZED SIGNATURE", margin + 50, lineY + 5, {
      align: "center",
    });

    doc.line(pageWidth - margin - 80, lineY, pageWidth - margin - 20, lineY);
    doc.text("VENDOR SIGNATURE", pageWidth - margin - 50, lineY + 5, {
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

  return doc;
};

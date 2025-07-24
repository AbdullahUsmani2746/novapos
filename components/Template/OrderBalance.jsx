import { jsPDF } from "jspdf";

export const generateOrderBalancePDF = () => {
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
    customerHeader: [120, 160, 240], // Light Blue (Customer Header)
  };

  const companyName = "EASTLAND INDUSTRIES PVT LTD";
  const documentTitle = "Sales Order Balance";
  const positionDate = "Position Date 17-JUL-25";
  const reportDate = "Thursday July 17 2025 9:13 AM";
  const pageInfo = "Page 1 of 52";

  // Sample data based on the image
  const orderBalanceData = [
    {
      customer: "A J CONTAINERS-EICL",
      customerCode: "2",
      orders: [
        {
          sOrderNo: "1407",
          soDate: "29-11-24",
          custPO: "",
          items: [
            {
              code: "7085GXF",
              item: "SUPER BLACK",
              orderQty: "30",
              despQty: "0",
              balance: "30",
            },
          ],
          salesOrderTotal: { orderQty: "30", despQty: "0", balance: "30" },
        },
      ],
      customerTotal: { orderQty: "30", despQty: "0", balance: "30" },
    },
    {
      customer: "AAA INTERNATIONAL INDUSTRIES-EICL",
      customerCode: "10",
      orders: [
        {
          sOrderNo: "1287",
          soDate: "21-11-24",
          custPO: "",
          items: [
            {
              code: "5182ETP",
              item: "PROCESS CYAN-1",
              orderQty: "250",
              despQty: "246",
              balance: "4",
            },
            {
              code: "0182ETP",
              item: "ETP MEDIUM",
              orderQty: "375",
              despQty: "373",
              balance: "2",
            },
            {
              code: "3496ETP",
              item: "PROCESS MAGENTA",
              orderQty: "125",
              despQty: "0",
              balance: "125",
            },
            {
              code: "1135ETP",
              item: "PROCESS YELLOW",
              orderQty: "100",
              despQty: "99",
              balance: "1",
            },
          ],
          salesOrderTotal: { orderQty: "850", despQty: "718", balance: "132" },
        },
        {
          sOrderNo: "1712",
          soDate: "26-12-24",
          custPO: "",
          items: [
            {
              code: "5182ETP",
              item: "PROCESS CYAN-1",
              orderQty: "250",
              despQty: "247",
              balance: "3",
            },
            {
              code: "1135ETP",
              item: "PROCESS YELLOW",
              orderQty: "250",
              despQty: "249",
              balance: "1",
            },
            {
              code: "0182ETP",
              item: "ETP MEDIUM",
              orderQty: "375",
              despQty: "374",
              balance: "1",
            },
            {
              code: "3496ETP",
              item: "PROCESS MAGENTA",
              orderQty: "150",
              despQty: "0",
              balance: "150",
            },
          ],
          salesOrderTotal: {
            orderQty: "1,025",
            despQty: "870",
            balance: "155",
          },
        },
      ],
      customerTotal: { orderQty: "1875", despQty: "1,588", balance: "287" },
    },
  ];

  // ============== PDF GENERATION CODE ==============
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const drawHeader = (yPosition = margin) => {
    // Company name section with dark blue background
    const companyHeight = 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setFillColor(...colors.primary);
    doc.rect(0, yPosition, pageWidth, companyHeight, "F");
    doc.setTextColor(...colors.white);
    doc.text(companyName, pageWidth / 2, yPosition + 10, { align: "center" });

    // Report info section
    yPosition += companyHeight + 5;
    doc.setTextColor(...colors.darkText);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(reportDate, margin, yPosition);
    doc.text(pageInfo, pageWidth - margin, yPosition, { align: "right" });

    // Document title and position date
    yPosition += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(documentTitle, pageWidth / 2, yPosition, { align: "center" });

    yPosition += 5;
    doc.setFontSize(12);
    doc.text(positionDate, pageWidth / 2, yPosition, { align: "center" });

    return yPosition + 4;
  };

  const drawCustomerHeader = (customer, customerCode, yPosition) => {
    const rowHeight = 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setFillColor(...colors.customerHeader);
    doc.setTextColor(...colors.darkText);
    doc.setDrawColor(...colors.border);
    doc.rect(margin, yPosition, pageWidth - 2 * margin + 1, rowHeight, "FD");
    doc.text(`Customer    ${customer}`, margin + 2, yPosition + 4);
    doc.text(customerCode, pageWidth - margin - 10, yPosition + 4, {
      align: "right",
    });
    return yPosition + rowHeight;
  };

  const drawTableHeader = (yPosition) => {
    const rowHeight = 6;
    const colWidths = [20, 18, 18, 15, 60, 20, 20, 20];
    let currentX = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...colors.white);
    doc.setLineWidth(0.3);
    doc.setDrawColor(...colors.primary);

    const headers = [
      "S Order No",
      "SO Date",
      "Cust PO#",
      "Code",
      "Item",
      "Order Qty",
      "Desp Qty",
      "Balance",
    ];

    headers.forEach((header, index) => {
      doc.setFillColor(...colors.primary);
      doc.rect(currentX, yPosition, colWidths[index], rowHeight, "FD");
      doc.text(header, currentX + colWidths[index] / 2, yPosition + 4, {
        align: "center",
      });
      currentX += colWidths[index];
    });

    return yPosition + rowHeight;
  };

  const drawOrderRow = (
    order,
    item,
    yPosition,
    isFirstItem = false,
    rowHeight = 6
  ) => {
    const colWidths = [20, 18, 18, 15, 60, 20, 20, 20];
    let currentX = margin;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colors.darkText);
    doc.setLineWidth(0.3);
    doc.setDrawColor(...colors.border);

    // Zebra striping
    const isEvenRow = parseInt(item.code) % 2 === 0;
    const rowColor = isEvenRow ? colors.lightBg : colors.white;

    const values = [
      isFirstItem ? order.sOrderNo : "",
      isFirstItem ? order.soDate : "",
      isFirstItem ? order.custPO : "",
      item.code,
      item.item,
      item.orderQty,
      item.despQty,
      item.balance,
    ];

    values.forEach((value, index) => {
      // Skip first 3 columns if not first item
      if (!isFirstItem && index < 3) {
        currentX += colWidths[index];
        return;
      }

      doc.setFillColor(...rowColor);
      doc.rect(currentX, yPosition, colWidths[index], rowHeight, "FD");

      // Highlight balance column
      if (index === 7) doc.setTextColor(...colors.secondary);
      else doc.setTextColor(...colors.darkText);

      doc.text(value, currentX + colWidths[index] / 2, yPosition + 3.5, {
        align: "center",
      });
      currentX += colWidths[index];
    });

    return yPosition + rowHeight;
  };

  const drawSalesOrderTotal = (total, yPosition, rowHeight = 6) => {
    const colWidths = [20, 18, 18, 15, 60, 20, 20, 20];
    let currentX = margin;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colors.darkText);
    doc.setLineWidth(0.3);
    doc.setDrawColor(...colors.border);

    const fillColor = [240, 240, 240];
    doc.setFillColor(...fillColor);

    // Merge columns 3 and 4 only (skip 0,1,2)
    const mergedWidth = colWidths[3] + colWidths[4];
    currentX += colWidths[0] + colWidths[1] + colWidths[2]; // Skip col 0,1,2

    // Draw merged rect for label
    doc.rect(currentX, yPosition, mergedWidth, rowHeight, "FD");
    doc.text(
      "Sales Order Total:",
      currentX + mergedWidth - 2,
      yPosition + 3.5,
      {
        align: "right",
      }
    );
    currentX += mergedWidth;

    // Totals
    const totalValues = [total.orderQty, total.despQty, total.balance];
    totalValues.forEach((value, index) => {
      doc.setFillColor(...fillColor);
      doc.rect(currentX, yPosition, colWidths[5 + index], rowHeight, "FD");

      // Highlight balance column
      if (index === 2) doc.setTextColor(...colors.success);
      else doc.setTextColor(...colors.darkText);

      doc.text(value, currentX + colWidths[5 + index] / 2, yPosition + 3.5, {
        align: "center",
      });
      currentX += colWidths[5 + index];
    });

    return yPosition + rowHeight;
  };

  const drawCustomerTotal = (total, yPosition, rowHeight = 6) => {
    const colWidths = [20, 18, 18, 15, 60, 20, 20, 20];
    let currentX = margin;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colors.darkText);
    doc.setLineWidth(0.3);
    doc.setDrawColor(...colors.border);

    const fillColor = [220, 220, 220];
    doc.setFillColor(...fillColor);

    const mergedWidth =
      colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4];
    doc.rect(currentX, yPosition, mergedWidth, rowHeight, "FD");
    doc.text("Customer Total:", currentX + mergedWidth - 2, yPosition + 3.5, {
      align: "right",
    });
    currentX += mergedWidth;

    const totalValues = [total.orderQty, total.despQty, total.balance];
    totalValues.forEach((value, index) => {
      doc.setFillColor(...fillColor);
      doc.rect(currentX, yPosition, colWidths[5 + index], rowHeight, "FD");

      // Highlight balance column
      if (index === 2) doc.setTextColor(...colors.success);
      else doc.setTextColor(...colors.darkText);

      doc.text(value, currentX + colWidths[5 + index] / 2, yPosition + 3.5, {
        align: "center",
      });
      currentX += colWidths[5 + index];
    });

    return yPosition + rowHeight;
  };

  // === Begin PDF Rendering ===
  let currentY = drawHeader();

  orderBalanceData.forEach((customerData) => {
    // Check if we need a new page
    if (currentY > pageHeight - 100) {
      doc.addPage();
      currentY = drawHeader();
    }

    // Draw customer header
    currentY = drawCustomerHeader(
      customerData.customer,
      customerData.customerCode,
      currentY
    );
    currentY = drawTableHeader(currentY);

    customerData.orders.forEach((order) => {
      order.items.forEach((item, itemIndex) => {
        if (currentY > pageHeight - 30) {
          doc.addPage();
          currentY = drawHeader();
          currentY = drawCustomerHeader(
            customerData.customer,
            customerData.customerCode,
            currentY
          );
          currentY = drawTableHeader(currentY);
        }
        currentY = drawOrderRow(order, item, currentY, itemIndex === 0);
      });

      // Draw sales order total
      currentY = drawSalesOrderTotal(order.salesOrderTotal, currentY);

      // Draw customer total after each sales order (as shown in image)
      if (customerData.customerTotal) {
        currentY = drawCustomerTotal(customerData.customerTotal, currentY);
      }
    });

    currentY += 0; // Add some space between customers
  });

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

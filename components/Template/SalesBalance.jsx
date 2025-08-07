import axios from "axios";
import { jsPDF } from "jspdf";

export const generateSalesBalancePDF = async () => {
  // ============== ALL VALUES CONSOLIDATED HERE ==============
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;

  // Modern Color Palette
  const colors = {
    primary: [44, 62, 80], // Dark blue header background
    secondary: [52, 152, 219], // Blue (Accents)
    lightBg: [236, 240, 241], // Light gray customer background
    darkText: [44, 62, 80], // Dark blue (Text)
    border: [180, 180, 180], // Light gray borders
    success: [30, 130, 76], // Green (Totals)
    white: [255, 255, 255],
    customerHeader: [52, 152, 219], // Blue (Customer Header)
    salesOrderBg: [241, 196, 15], // Yellow (Sales order total background)
    accent: [231, 76, 60], // Red for important elements
    highlight: [155, 89, 182], // Purple for highlights
  };

  // const companyName = axios.get("api/setup/companies")
  //   .then((response) => response.data.data[0].company)
  let companyName = ""; // Default value in case of error
    try {
      const response = await axios.get("/api/setup/companies");
      companyName = response.data.data[0].company;
      response.data.data[0].company;
    } catch (error) {
      console.error("Error fetching company name:", error);
    }
  

  // console.log("Company Name:", companyName());
  // const companyName = "SIEGWERK PAKISTAN LIMITED";
  const documentTitle = "Order Balance";
  const positionDate = `Position Date  ${new Date().toLocaleDateString()}`;
  const reportDate = new Date().toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  );
  const pageInfo = "Page 1 of 12";

  // Sample data based on the image
  const orderBalanceData = [
    {
      customer: "KOMPASS PAKISTAN (PRIVATE) LIMITED",
      customerCode: "186",
      orders: [
        {
          sOrderNo: "500609",
          soDate: "12-06-25",
          soTime: "09:06:37",
          custPO: "10000006",
          custPOItem: "02",
          items: [
            {
              code: "1000739",
              item: "15-000049-1.1510 NC496 ROTO PET LAM R-MEDIUM(K)(180kg)",
              orderQty: "360",
              despQty: "180",
              balance: "180",
            },
          ],
          salesOrderTotal: { orderQty: "360", despQty: "180", balance: "180" },
        },
        {
          sOrderNo: "500690",
          soDate: "07-07-25",
          soTime: "10:07:08",
          custPO: "10000007",
          custPOItem: "72",
          items: [
            {
              code: "1001125",
              item: "12-000077-5.1510 NC0794 GRAVURE WHITE (K)(170kg)",
              orderQty: "2,000",
              despQty: "1,545",
              balance: "455",
            },
          ],
          salesOrderTotal: {
            orderQty: "2,000",
            despQty: "1,545",
            balance: "455",
          },
        },
        {
          sOrderNo: "500697",
          soDate: "08-07-25",
          soTime: "02:07:44",
          custPO: "10000007",
          custPOItem: "29",
          items: [
            {
              code: "1000280",
              item: "12-120476-9.1510 NC MB 601 CYAN MB75(180kg)",
              orderQty: "540",
              despQty: "0",
              balance: "540",
            },
            {
              code: "1000407",
              item: "15-000019-7.1510 EX-42 FLEXO HC VARNISH(180kg)",
              orderQty: "720",
              despQty: "539",
              balance: "181",
            },
            {
              code: "1001170",
              item: "12-800237-5.1710 NC0786 GENERAL PURPOSE MAGENTA (K)(250kg)",
              orderQty: "150",
              despQty: "0",
              balance: "150",
            },
            {
              code: "1001172",
              item: "12-300117-5.1510 NC0786 GENERAL PURPOSE YELLOW (K)(160kg)",
              orderQty: "450",
              despQty: "0",
              balance: "450",
            },
            {
              code: "1001185",
              item: "15-000076-5.1510 NC0786 G.P REDUCTION MEDIUM (K)(160kg)",
              orderQty: "450",
              despQty: "0",
              balance: "450",
            },
          ],
          salesOrderTotal: {
            orderQty: "2,310",
            despQty: "539",
            balance: "1,771",
          },
        },
        {
          sOrderNo: "500721",
          soDate: "17-07-25",
          soTime: "12:07:21",
          custPO: "10000008",
          custPOItem: "09",
          items: [
            {
              code: "1000156",
              item: "12-300464-9.1510 NC MB 3114 YELLOW MB24 (YELLOW14) PAK(180kg)",
              orderQty: "180",
              despQty: "130",
              balance: "50",
            },
            {
              code: "1000424",
              item: "12-300035-1.1510 NC496 ROTO PET LAM YELLOW 14(K)(180kg)",
              orderQty: "360",
              despQty: "320",
              balance: "40",
            },
            {
              code: "1000759",
              item: "15-000049-1.1510 NC496 ROTO PET LAM R-MEDIUM(K)(180kg)",
              orderQty: "180",
              despQty: "0",
              balance: "180",
            },
            {
              code: "1001188",
              item: "12-800241-5.1710 NC0786 G.P MAX GREN(J35kg)",
              orderQty: "200",
              despQty: "0",
              balance: "200",
            },
            {
              code: "1001189",
              item: "12-500094-5.1710 NC0786 G.P MAX GREN(J45kg)",
              orderQty: "500",
              despQty: "0",
              balance: "500",
            },
          ],
          salesOrderTotal: {
            orderQty: "1,420",
            despQty: "450",
            balance: "970",
          },
        },
      ],
    },
    
  ];

  // ============== PDF GENERATION CODE ==============
    const doc = new jsPDF({ unit: "mm", format: "a4" });


  const drawHeader = (yPosition = margin) => {
    // Company name section with dark blue background
    const companyHeight = 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setFillColor(...colors.primary);
    doc.rect(0, yPosition, pageWidth, companyHeight, "F");
    doc.setTextColor(...colors.white);
    doc.text(companyName, pageWidth / 2, yPosition + 8, { align: "center" });

    // Report info section
    yPosition += companyHeight + 3;
    doc.setTextColor(...colors.darkText);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(reportDate, margin, yPosition);
    doc.text(pageInfo, pageWidth - margin, yPosition, { align: "right" });

    // Document title
    yPosition += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(documentTitle, pageWidth / 2, yPosition, { align: "center" });

    // Position date with accent color
    yPosition += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    // doc.setTextColor(...colors.accent);
    doc.text(positionDate, pageWidth / 2, yPosition, { align: "center" });
    doc.setTextColor(...colors.darkText);

    return yPosition + 5;
  };

  const drawCustomerHeader = (customerCode, customer, yPosition) => {
    const rowHeight = 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setFillColor(...colors.success);
    doc.setTextColor(...colors.white);
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPosition, pageWidth - 2.1 * margin, rowHeight, "FD");
    doc.text(`Customer    ${customer}`, margin + 2, yPosition + 5);
    doc.text(customerCode, pageWidth - margin - 2, yPosition + 5, {
      align: "right",
    });
    return yPosition + rowHeight + 2;
  };

  const drawTableHeader = (yPosition) => {
    const rowHeight = 6;
    const colWidths = [13, 15, 15, 15, 75, 18, 18, 20];
    let currentX = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...colors.white);
    doc.setLineWidth(0.5);
    doc.setDrawColor(...colors.border);

    const headers = [
      "S OrderNo",
      "SO Date",
      "Cust PO#",
      "M/M#",
      "Item",
      "Po Qty",
      "Rec Qty",
      "Balance",
    ];

    headers.forEach((header, index) => {
      doc.setFillColor(...colors.secondary);
      doc.rect(currentX, yPosition, colWidths[index], rowHeight, "FD");
      doc.text(header, currentX + colWidths[index] / 2, yPosition + 4, {
        align: "center",
      });
      currentX += colWidths[index];
    });

    return yPosition + rowHeight + 2;
  };

  const drawOrderRow = (
    order,
    item,
    yPosition,
    isFirstItem = false,
    defaultRowHeight = 6
  ) => {
    const colWidths = [13, 15, 15, 15, 75, 18, 18, 20];
    let currentX = margin;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...colors.darkText);
    doc.setLineWidth(0.2);
    doc.setDrawColor(...colors.border);

    const values = [
      isFirstItem ? order.sOrderNo : "",
      isFirstItem ? `${order.soDate}\n${order.soTime}` : "",
      isFirstItem ? `${order.custPO}\n${order.custPOItem}` : "",
      item.code,
      item.item,
      item.orderQty,
      item.despQty,
      item.balance,
    ];

    let maxRowHeight = defaultRowHeight;


    // Precalculate height if item column needs wrapping
    const wrappedItem = doc.splitTextToSize(values[4], colWidths[4] - 2);
    const itemHeight = wrappedItem.length * 3 + 1;
    maxRowHeight = Math.max(maxRowHeight, itemHeight);

    // Alternate row colors for better readability
    const rowColor = (yPosition / 6) % 2 === 0 ? colors.white : colors.lightBg;

    values.forEach((value, index) => {
         // Skip first 3 columns if not first item
      if (!isFirstItem && index < 3) {
        currentX += colWidths[index];
        return;
      }
      doc.setFillColor(...rowColor);
      doc.rect(currentX, yPosition, colWidths[index], maxRowHeight, "FD");

      if (index === 4) {
        wrappedItem.forEach((line, lineIndex) => {
          const textWidth = doc.getTextWidth(line);
          const centerX = currentX + colWidths[index] / 2 - textWidth / 2;
          doc.text(line, centerX, yPosition + 3 + lineIndex * 3);
        });
      } else if (index === 1 || index === 2) {
        const lines = value.split("\n");
        lines.forEach((line, lineIndex) => {
          doc.text(
            line,
            currentX + colWidths[index] / 2,
            yPosition + 2.5 + lineIndex * 3,
            { align: "center" }
          );
        });
      } else if (value) {
        // Highlight balance if it's equal to order quantity (nothing received)
        if (index === 7 && item.despQty === "0") {
          //   doc.setTextColor(...colors.accent);
          doc.setFont("helvetica", "bold");
        }

        doc.text(value, currentX + colWidths[index] / 2, yPosition + 4, {
          align: "center",
        });

        // Reset text style
        doc.setTextColor(...colors.darkText);
        doc.setFont("helvetica", "normal");
      }

      currentX += colWidths[index];
    });

    return yPosition + maxRowHeight;
  };

  const drawSalesOrderTotal = (total, yPosition, rowHeight = 6) => {
    const colWidths = [13, 15, 15, 15, 75, 18, 18, 20];
    let currentX = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...colors.darkText);
    doc.setLineWidth(0.2);
    doc.setDrawColor(...colors.border);

    const fillColor = colors.border;
    doc.setFillColor(...fillColor);

    // Skip first 4 columns and merge them
    const mergedWidth =
      colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3];
    doc.rect(currentX, yPosition, mergedWidth, rowHeight, "FD");
    currentX += mergedWidth;

    // Draw Item column with label
    doc.rect(currentX, yPosition, colWidths[4], rowHeight, "FD");
    doc.text("Sales Order Total", currentX + colWidths[4] - 2, yPosition + 4, {
      align: "right",
    });
    currentX += colWidths[4];

    // Totals
    const totalValues = [total.orderQty, total.despQty, total.balance];
    totalValues.forEach((value, index) => {
      doc.setFillColor(...fillColor);
      doc.rect(currentX, yPosition, colWidths[5 + index], rowHeight, "FD");

      // Highlight balance if it's significant
      if (index === 2 && parseInt(value.replace(/,/g, "")) > 0) {
        // doc.setTextColor(...colors.success);
      }

      doc.text(value, currentX + colWidths[5 + index] / 2, yPosition + 4, {
        align: "center",
      });

      // Reset text color
      doc.setTextColor(...colors.darkText);
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
      customerData.customerCode,
      customerData.customer,
      currentY
    );
    currentY = drawTableHeader(currentY);

    customerData.orders.forEach((order) => {
      if (order.items.length === 0) return;

      order.items.forEach((item, itemIndex) => {
        if (currentY > pageHeight - 30) {
          doc.addPage();
          currentY = drawHeader();
          currentY = drawCustomerHeader(
            customerData.customerCode,
            customerData.customer,
            currentY
          );
          currentY = drawTableHeader(currentY);
        }

        const rowHeight = itemIndex === 0 ? 8 : 6;
        currentY = drawOrderRow(
          order,
          item,
          currentY,
          itemIndex === 0,
          rowHeight
        );
      });

      if (currentY > pageHeight - 15) {
        doc.addPage();
        currentY = drawHeader();
        currentY = drawCustomerHeader(
          customerData.customerCode,
          customerData.customer,
          currentY
        );
        currentY = drawTableHeader(currentY);
      }

      currentY = drawSalesOrderTotal(order.salesOrderTotal, currentY);
      currentY += 2;

      // Only draw next table header if there are more orders ahead with data
      const hasMoreOrdersWithData = customerData.orders.some(
        (o, idx) =>
          idx > customerData.orders.indexOf(order) && o.items.length > 0
      );

      if (hasMoreOrdersWithData) {
        if (currentY > pageHeight - 30) {
          doc.addPage();
          currentY = drawHeader();
          currentY = drawCustomerHeader(
            customerData.customerCode,
            customerData.customer,
            currentY
          );
        }
        currentY = drawTableHeader(currentY);
      }
    });

    currentY += 5; // Add some space between customers
  });


  return doc;

};

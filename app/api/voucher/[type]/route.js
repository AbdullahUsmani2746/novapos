import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { VOUCHER_CONFIG } from "@/components/Category/constants";
import { BadgeCent } from "lucide-react";

// GET method
export async function GET(req, { params }) {
  const { type } = await params;
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  const tran_code = VOUCHER_CONFIG[type]?.tran_code;
  if (!tran_code) {
    return NextResponse.json(
      { message: "Invalid voucher type" },
      { status: 400 }
    );
  }

  const [vouchers, total] = await Promise.all([
    prisma.transactionsMaster.findMany({
      where: { tran_code },
      skip,
      take: limit,
      orderBy: { tran_id: "desc" },
      include: {
        acno: true,
        godownDetails: true,
        transactions: {
          include: {
            acnoDetails: true,
            itemDetails: true,
            godownDetails: true,
            costCenter: true,
            currencyDetails: true,
          },
        },
      },
    }),
    prisma.transactionsMaster.count({ where: { tran_code } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({
    data: vouchers,
    totalPages,
    page,
    limit,
    total,
    status: 200,
  });
}
// POST method
export async function POST(req, { params }) {
  try {
    const { type } = await params;
    const tran_code = VOUCHER_CONFIG[type]?.tran_code;

    console.log("type:", type);
    console.log("tran_code:", tran_code);

    if (!tran_code) {
      return NextResponse.json(
        { message: "Invalid voucher type" },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Request body must be a JSON object" },
        { status: 400 }
      );
    }

    const { master, lines, deductions } = body;

    console.log("master:", master);
    console.log("lines:", lines);
    console.log("deductions:", deductions);

    if (!master || typeof master !== "object") {
      return NextResponse.json(
        { message: "Master must be a valid object" },
        { status: 400 }
      );
    }

    if (!Array.isArray(lines)) {
      return NextResponse.json(
        { message: "Lines must be a valid array" },
        { status: 400 }
      );
    }

    if (deductions && !Array.isArray(deductions)) {
      return NextResponse.json(
        { message: "Deductions must be a valid array if provided" },
        { status: 400 }
      );
    }

    const parseOptionalInt = (value) => {
      if (value === null || value === undefined || value === "") return null;
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? null : parsed;
    };

    let masterDateTime;
    let masterCheckDateTime;
    if ([1, 2, 4, 6, 9, 10].includes(tran_code)) {
      const now = new Date();

      masterCheckDateTime =
        master.check_date && master.check_date !== ""
          ? new Date(master.check_date)
          : now;

      masterDateTime =
        master.dateD && master.dateD !== "" ? new Date(master.dateD) : now;

      master.dateD = masterDateTime;
      master.time = masterDateTime;
      master.check_date = masterCheckDateTime;

      if ([4, 6, 9, 10].includes(tran_code)) {
        master.godown = parseOptionalInt(master.godown);
      }
    } else if (tran_code === 3) {
      console.log("masterDate:", master.dateD);

      masterDateTime = new Date(`${master.dateD}`);
      console.log("masterDateTime:", masterDateTime);
      master.dateD = masterDateTime; // Format date as YYYY-MM-DD    master.check_date = masterDateTime; // Format check_date as YYYY-MM-DD HH:MM:SS
    }

    // Add this validation before creating the master record (around line 70)
    if ([9, 10].includes(tran_code)) {
      for (const line of lines) {
        const originalQty = parseFloat(line.original_qty || 0);
        const returnQty = parseFloat(line.qty || 0);

        if (returnQty > originalQty) {
          return NextResponse.json(
            {
              message: `Cannot return more than original quantity for item ${line.itcd}`,
              details: {
                itemId: line.itcd,
                originalQty,
                returnQty,
              },
            },
            { status: 400 }
          );
        }
      }
    }
    console.log("master after:", master);

    const masterData = await prisma.transactionsMaster.create({
      data: master,
    });

    console.log("masterData:", masterData.tran_id);

        let itemAccountMap = {};


      // 🔁 Build item account map based on item category accounts
    if ([4, 6, 9, 10].includes(tran_code)) {
      const itemIds = lines
        .map((line) => parseOptionalInt(line.itcd))
        .filter((itcd) => itcd !== undefined);

      const items = await prisma.item.findMany({
        where: { itcd: { in: itemIds } },
        include: {
          itemCategories: true,
        },
      });

      for (const item of items) {
        const category = item.itemCategories;

        let acnoValue = null;
        if ([4, 9].includes(tran_code)) {
          acnoValue = category?.stock_acno;
        } else if (tran_code === 6) {
          acnoValue = category?.sale_acno;
        } else if (tran_code === 10) {
          acnoValue = category?.sale_acno;
        }

        if (acnoValue !== null && acnoValue !== undefined) {
          itemAccountMap[item.itcd] = acnoValue.toString().padStart(4, "0");
        }
      }

      console.log("Item Account Map:", itemAccountMap);
    }

    const linesss = await prisma.transactions.createMany({
      data: lines.map((line) => {
        const base = {
          ...line,
          tran_id: masterData.tran_id,
          sub_tran_id: 1,
        };

        // Handle currency for tran_code 1 or 2
        if ([1, 2].includes(tran_code)) {
          const currencyValue = parseOptionalInt(line.currency);
          if (currencyValue !== undefined) {
            base.currency = currencyValue;
          }
        }

        // Handle cost center for tran_code 1, 2, or 3
        if ([1, 2, 3].includes(tran_code)) {
          const costCenterValue = parseOptionalInt(line.ccno);
          if (costCenterValue !== undefined) {
            base.ccno = costCenterValue;
          }
        }
        // Handle item code for tran_code 4 or 6
        if ([4, 6, 9, 10].includes(tran_code)) {
          // if ([4, 9].includes(tran_code)) {
          //   base.acno = masterData.pycd;
          // } else if ([6, 10].includes(tran_code)) {
          //   base.acno = masterData.pycd;
          // }

          const itemValue = parseOptionalInt(line.itcd);
          if (itemValue !== undefined) {
            base.itcd = itemValue;
            base.acno = itemAccountMap[itemValue] || null;
          }

          // Add original_qty for returns (tran_code 9 and 10)
          if ([9, 10].includes(tran_code) && line.original_qty) {
            base.original_qty = parseFloat(line.original_qty) || 0;
          }
        }
        console.log("base:", base);
        return base;
      }),
    });

    console.log("linesss:", linesss);

    // ✅ Update item stock for purchase (tran_code === 4) or sale (tran_code === 6)
    if ([4, 6, 9, 10].includes(tran_code)) {
      for (const line of lines) {
        const itemId = parseOptionalInt(line.itcd);
        const qty = parseFloat(line.qty || 0);

        if (itemId && qty > 0) {
          // Logic:
          // - tran_code 4 (Purchase) ➜ increase stock
          // - tran_code 10 (Sale Return) ➜ increase stock
          // - tran_code 6 (Sale) ➜ decrease stock
          // - tran_code 9 (Purchase Return) ➜ decrease stock
          const isIncrement = [4, 10].includes(tran_code);
          const updateQty = isIncrement ? qty : -qty;

          await prisma.item.update({
            where: { itcd: itemId },
            data: {
              stock: {
                increment: updateQty,
              },
            },
          });

          console.log(
            `Stock updated for item ${itemId}: ${isIncrement ? "+" : "-"}${qty}`
          );
        }
      }
    }

    if (deductions?.length > 0) {
      const ded = await prisma.transactions.createMany({
        data: deductions.map((deduction) => ({
          ...deduction,
          tran_id: masterData.tran_id,
          ccno: parseOptionalInt(deduction.ccno),
          currency: parseOptionalInt(deduction.currency),
          sub_tran_id: 2,
        })),
      });

      console.log("ded:", ded);
    }

    if ([1, 2, 4, 6, 9, 10].includes(tran_code)) {
      let totalDamt = 0;
      let totalCamt = 0;

      // Lines totals
      for (const line of lines) {
        totalDamt += parseFloat(line.damt || 0);
        totalCamt += parseFloat(line.camt || 0);
      }

      // Deductions for tran_code 1 and 2
      if ([1, 2].includes(tran_code) && Array.isArray(deductions)) {
        for (const deduction of deductions) {
          if (tran_code === 1) {
            totalCamt += parseFloat(deduction.camt || 0);
          } else if (tran_code === 2) {
            totalDamt += parseFloat(deduction.damt || 0);
          }
        }
      }

      let damt = 0;
      let camt = 0;

      if (tran_code === 1) {
        camt = totalCamt - totalDamt ;
      } else if (tran_code === 2) {
        damt = totalDamt - totalCamt ;
      } else if (tran_code === 6 || tran_code === 9) {
        damt = totalCamt; // mirror camt as damt
      } else if ( tran_code === 10 || tran_code === 4) {
        camt = totalDamt; // mirror damt as camt
      }

      const autoEntry = {
        tran_id: masterData.tran_id,
        sub_tran_id: 3,
        narration1: "Auto Entry",
        damt: damt || 0,
        camt: camt || 0,
        acno: masterData.pycd || null,
      };

      await prisma.transactions.create({ data: autoEntry });
      console.log("Auto transaction entry created:", autoEntry);
    }

    return NextResponse.json({ message: "Voucher saved" });
  } catch (error) {
    console.error("Error saving voucher:", error);

    return NextResponse.json(
      {
        message: "Server error",
        error:
          typeof error === "object" && error !== null
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}

// PUT method
export async function PUT(req) {
  try {
    const { master, lines, deductions } = await req.json();

    const tran_code = master?.tran_code;
    const tran_id = master?.tran_id;

    if (!tran_code || !tran_id) {
      console.error("Missing tran_code or tran_id:", { tran_code, tran_id });
      return NextResponse.json(
        { message: "Missing tran_code or tran_id" },
        { status: 400 }
      );
    }

    const parseOptionalInt = (v) =>
      v === null || v === undefined || v === ""
        ? null
        : isNaN(+v)
        ? null
        : parseInt(v);

    // 🛠️ Revert existing stock for this transaction
    if ([4, 6, 9, 10].includes(tran_code)) {
      const existingLines = await prisma.transactions.findMany({
        where: { tran_id, sub_tran_id: 1 },
      });

      for (const oldLine of existingLines) {
        const itemId = parseOptionalInt(oldLine.itcd);
        const qty = parseFloat(oldLine.qty || 0);

        if (itemId && qty > 0) {
          const isIncrement = [4, 10].includes(tran_code);
          const revertQty = isIncrement ? -qty : qty;

          await prisma.item.update({
            where: { itcd: itemId },
            data: {
              stock: {
                increment: revertQty,
              },
            },
          });
        }
      }
    }

    // Format date/times
   if ([1, 2, 4, 6, 9, 10].includes(tran_code)) {
  const now = new Date();

  const dateObj =
    master.dateD && master.dateD !== "" ? new Date(master.dateD) : now;

  const checkDateObj =
    master.check_date && master.check_date !== ""
      ? new Date(master.check_date)
      : now;

  master.dateD = dateObj;
  master.time = dateObj;
  master.check_date = checkDateObj;

  if ([4, 6, 9, 10].includes(tran_code)) {
    master.godown = parseOptionalInt(master.godown);
  }
} else if (tran_code === 3) {
  master.dateD = new Date(master.dateD || new Date());
}

    // Update master
    await prisma.transactionsMaster.update({
      where: { tran_id },
      data: {
        ...master,
        godown: parseOptionalInt(master.godown),
        vr_no: parseOptionalInt(master.vr_no),
      },
    });

    // Update lines
    for (const line of lines) {
      const { id, tran_id, acno, ...rest } = line;

      const updatedLine = {
        ...rest,
        currency: [1, 2].includes(tran_code)
          ? parseOptionalInt(line.currency)
          : null,
        ccno: [1, 2, 3].includes(tran_code)
          ? parseOptionalInt(line.ccno)
          : null,
        itcd: [4, 6, 9, 10].includes(tran_code)
          ? parseOptionalInt(line.itcd)
          : null,
        acno: [4, 9].includes(tran_code)
          ? "0004"
          : [6, 10].includes(tran_code)
          ? "0014"
          : line.acno,
      };

      if ([9, 10].includes(tran_code)) {
        updatedLine.original_qty = parseFloat(line.original_qty || 0);
      }

      try {
        await prisma.transactions.update({
          where: { id },
          data: updatedLine,
        });

        // 🛠️ Apply new stock
        if ([4, 6, 9, 10].includes(tran_code)) {
          const itemId = parseOptionalInt(line.itcd);
          const qty = parseFloat(line.qty || 0);
          if (itemId && qty > 0) {
            const isIncrement = [4, 10].includes(tran_code);
            const updateQty = isIncrement ? qty : -qty;

            await prisma.item.update({
              where: { itcd: itemId },
              data: {
                stock: {
                  increment: updateQty,
                },
              },
            });
          }
        }
      } catch (err) {
        console.error(`Failed to update line id ${id}:`, err.message);
      }
    }

    // 🔥 Delete removed lines
    const existingLines = await prisma.transactions.findMany({
      where: {
        tran_id,
        sub_tran_id: { not: 3 }, // skip auto
      },
      select: { id: true },
    });

    const incomingLineIds = lines.map((line) => line.id).filter(Boolean);
    const linesToDelete = existingLines
      .map((l) => l.id)
      .filter((id) => !incomingLineIds.includes(id));

    if (linesToDelete.length > 0) {
      await prisma.transactions.deleteMany({
        where: { id: { in: linesToDelete } },
      });
    }

    // Update deductions
    if (deductions?.length > 0) {
      for (const ded of deductions) {
        const updatedDed = {
          ...ded,
          tran_id,
          sub_tran_id: 2,
          ccno: parseOptionalInt(ded.ccno),
          currency: parseOptionalInt(ded.currency),
        };

        try {
          await prisma.transactions.update({
            where: { id: ded.id },
            data: updatedDed,
          });
        } catch (err) {
          console.error(
            `Failed to update deduction id ${ded.id}:`,
            err.message
          );
        }
      }
    }

    // 🔥 Delete removed deductions
    const existingDeductions = await prisma.transactions.findMany({
      where: {
        tran_id,
        sub_tran_id: 2,
      },
      select: { id: true },
    });

    const incomingDedIds = (deductions || []).map((d) => d.id).filter(Boolean);
    const dedToDelete = existingDeductions
      .map((d) => d.id)
      .filter((id) => !incomingDedIds.includes(id));

    if (dedToDelete.length > 0) {
      await prisma.transactions.deleteMany({
        where: { id: { in: dedToDelete } },
      });
    }

    // Auto Entry (sub_tran_id: 3)
    if ([1, 2, 4, 6].includes(tran_code)) {
      let totalDamt = 0;
      let totalCamt = 0;

      for (const line of lines) {
        totalDamt += parseFloat(line.damt || 0);
        totalCamt += parseFloat(line.camt || 0);
      }

      for (const ded of deductions || []) {
        if (tran_code === 1) totalCamt += parseFloat(ded.camt || 0);
        if (tran_code === 2) totalDamt += parseFloat(ded.damt || 0);
      }

      const damt =
        tran_code === 1
          ? totalDamt - totalCamt
          : tran_code === 4
          ? totalCamt
          : 0;
      const camt =
        tran_code === 2
          ? totalCamt - totalDamt
          : tran_code === 6
          ? totalDamt
          : 0;

      const autoEntry = await prisma.transactions.findFirst({
        where: { tran_id, sub_tran_id: 3 },
      });

      if (autoEntry) {
        const autoUpdate = {
          damt,
          camt,
          narration1: "Auto Entry",
          acno: master.acno || null,
        };

        try {
          await prisma.transactions.update({
            where: { id: autoEntry.id },
            data: autoUpdate,
          });
        } catch (err) {
          console.error("Failed to update auto entry:", err.message);
        }
      } else {
        console.warn("No auto entry found for tran_id:", tran_id);
      }
    }

    return NextResponse.json({ message: "Voucher updated successfully" });
  } catch (error) {
    console.error("General error in PUT /voucher:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}

// DELETE method
export async function DELETE(req) {
  try {
    const { tran_id } = await req.json();

    if (!tran_id) {
      return NextResponse.json(
        { message: "tran_id is required" },
        { status: 400 }
      );
    }

    // 🛠️ Get tran_code first
    const master = await prisma.transactionsMaster.findUnique({
      where: { tran_id },
    });

    if (!master) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 }
      );
    }

    const tran_code = master.tran_code;

    // 🛠️ Revert stock before deleting if applicable
     // 🛠️ Revert stock before deleting if applicable
    if ([4, 6, 9, 10].includes(tran_code)) {
      const lines = await prisma.transactions.findMany({
        where: {
          tran_id,
          sub_tran_id: 1,
        },
      });

      for (const line of lines) {
        const itemId = parseInt(line.itcd);
        const qty = parseFloat(line.qty || 0);

        if (itemId && qty > 0) {
          const isIncrement = [4, 10].includes(tran_code);
          const revertQty = isIncrement ? -qty : qty;

          // 🔍 Get current stock first
          const item = await prisma.item.findUnique({
            where: { itcd: itemId },
            select: { stock: true },
          });

          if (!item) continue;

          const newStock = item.stock + revertQty;

          // ✅ Only update stock if it won't go below zero
          if (newStock >= 0) {
            await prisma.item.update({
              where: { itcd: itemId },
              data: {
                stock: {
                  increment: revertQty,
                },
              },
            });
          } else {
            console.warn(
              `Skipped stock update for item ${itemId}: stock would go negative.`
            );
          }
        }
      }
    }
    // Delete child and master records
    await prisma.transactions.deleteMany({ where: { tran_id } });
    await prisma.transactionsMaster.delete({ where: { tran_id } });

    return NextResponse.json({
      message: "Voucher and related transactions deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

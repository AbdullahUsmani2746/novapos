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
    if (
      tran_code === 2 ||
      tran_code === 1 ||
      tran_code === 6 ||
      tran_code === 4 ||
      tran_code === 9 ||
      tran_code === 10
    ) {
      if (master.check_date !== "") {
        masterCheckDateTime = new Date(`${master.check_date}T${master.time}`);
      }
      masterDateTime = new Date(`${master.dateD}T${master.time}`);

      console.log("masterDateTime:", masterDateTime);
      master.dateD = masterDateTime; // Format date as YYYY-MM-DD
      master.time = masterDateTime; // Format time as HH:MM:SS
      master.check_date = masterCheckDateTime; // Format check_date as YYYY-MM-DD HH:MM:SS

      if (tran_code === 4 || tran_code === 6 || tran_code === 9 ||tran_code === 10) {
        master.godown = parseOptionalInt(master.godown);
      } // Format check_date as YYYY-MM-DD HH:MM:SS
    } else if (tran_code === 3) {
      console.log("masterDate:", master.dateD);

      masterDateTime = new Date(`${master.dateD}`);
      console.log("masterDateTime:", masterDateTime);
      master.dateD = masterDateTime; // Format date as YYYY-MM-DD    master.check_date = masterDateTime; // Format check_date as YYYY-MM-DD HH:MM:SS
    }
    console.log("master after:", master);

    const masterData = await prisma.transactionsMaster.create({
      data: master,
    });

    console.log("masterData:", masterData.tran_id);

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
          if ([4, 9].includes(tran_code)) {
            base.acno = "0004";
          } else if ([6, 10].includes(tran_code)) {
            base.acno = "0014";
          }

          const itemValue = parseOptionalInt(line.itcd);
          if (itemValue !== undefined) {
            base.itcd = itemValue;
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

    if ([1, 2, 4, 6,9,10].includes(tran_code)) {
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
        damt = totalDamt - totalCamt;
      } else if (tran_code === 2) {
        camt = totalCamt - totalDamt;
      } else if (tran_code === 4 || tran_code === 9) {
        damt = totalCamt; // mirror camt as damt
      } else if (tran_code === 6 || tran_code === 10) {
        camt = totalDamt; // mirror damt as camt
      }

      const autoEntry = {
        tran_id: masterData.tran_id,
        sub_tran_id: 3,
        narration1: "Auto Entry",
        damt: damt || 0,
        camt: camt || 0,
        acno: master.acno || null,
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

    // Format date/times
    console.log("Parsing dates...");
    if ([1, 2, 4, 6].includes(tran_code)) {
      const dateObj = new Date(`${master.dateD}T${master.time}`);
      const checkDateObj = new Date(`${master.check_date}T${master.time}`);

      master.dateD = dateObj;
      master.time = dateObj;
      master.check_date = checkDateObj;
      if ([4, 6].includes(tran_code)) {
        master.godown = parseOptionalInt(master.godown);
      }
    } else if (tran_code === 3) {
      master.dateD = new Date(master.dateD);
    }

    console.log("Updating master:", master);
    await prisma.transactionsMaster.update({
      where: { tran_id },
      data: {
        ...master,
        godown: parseOptionalInt(master.godown),
        vr_no: parseOptionalInt(master.vr_no),
      },
    });

    // Update lines
    console.log(`Updating ${lines?.length} lines...`);
    for (const line of lines) {
      const {
        id, // extract and exclude from update data
        tran_id,
        acno,
        ...rest
      } = line;

      const updatedLine = {
        ...rest,
        currency: [1, 2].includes(tran_code)
          ? parseOptionalInt(line.currency)
          : null,
        ccno: [1, 2, 3].includes(tran_code)
          ? parseOptionalInt(line.ccno)
          : null,
        itcd: [4, 6].includes(tran_code) ? parseOptionalInt(line.itcd) : null,
        acno: tran_code === 4 ? "0004" : line.acno,
      };

      console.log("Updating line:", updatedLine);

      try {
        await prisma.transactions.update({
          where: { id: line.id },
          data: updatedLine,
        });
      } catch (err) {
        console.error(`Failed to update line id ${line.id}`, err.message);
      }
    }

    // Update deductions
    if (deductions?.length > 0) {
      console.log(`Updating ${deductions.length} deductions...`);
      for (const ded of deductions) {
        const updatedDed = {
          ...ded,
          tran_id,
          sub_tran_id: 2,
          ccno: parseOptionalInt(ded.ccno),
          currency: parseOptionalInt(ded.currency),
        };

        console.log("Updating deduction:", updatedDed);

        try {
          await prisma.transactions.update({
            where: { id: ded.id },
            data: updatedDed,
          });
        } catch (err) {
          console.error(`Failed to update deduction id ${ded.id}`, err.message);
        }
      }
    }

    // Auto Entry update logic
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

      console.log("Looking for auto entry...");
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
        console.log("Updating auto entry:", autoUpdate);

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

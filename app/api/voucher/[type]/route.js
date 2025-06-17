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
      include:{
      acno:true,
      godownDetails:true,
      transactions: {
          include: {
            acnoDetails: true,
            itemDetails: true,
            godownDetails: true,
            costCenter: true,
            currencyDetails: true
          }
        }

      }
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
      tran_code === 4
    ) {
      masterCheckDateTime = new Date(`${master.check_date}T${master.time}`);
      masterDateTime = new Date(`${master.dateD}T${master.time}`);

      console.log("masterDateTime:", masterDateTime);
      master.dateD = masterDateTime; // Format date as YYYY-MM-DD
      master.time = masterDateTime; // Format time as HH:MM:SS
      master.check_date = masterCheckDateTime; // Format check_date as YYYY-MM-DD HH:MM:SS

      if (tran_code === 4 || tran_code === 6) {
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
        if ([4, 6].includes(tran_code)) {
          if (tran_code === 4) {
            base.acno = "0004";
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

    if ([1, 2, 4, 6].includes(tran_code)) {
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
      } else if (tran_code === 4) {
        damt = totalCamt; // mirror camt as damt
      } else if (tran_code === 6) {
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
  const { id, master, lines, deductions } = await req.json();

  await prisma.transactionsMaster.update({
    where: { tran_id: id },
    data: master,
  });

  await prisma.transactions.deleteMany({ where: { tran_id: id } });

  await prisma.transactions.createMany({
    data: lines.map((l) => ({
      ...l,
      tran_id: id,
      sub_tran_id: 1,
    })),
  });

  if (deductions?.length) {
    await prisma.transactions.createMany({
      data: deductions.map((d) => ({
        ...d,
        tran_id: id,
        sub_tran_id: 2,
      })),
    });
  }

  return NextResponse.json({ message: "Voucher updated" });
}

// DELETE method
export async function DELETE(req) {
  const { tran_id } = await req.json();

  await prisma.transactions.deleteMany({ where: { tran_id } });
  await prisma.transactionsMaster.delete({ where: { tran_id } });

  return NextResponse.json({ message: "Voucher deleted" });
}

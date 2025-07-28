import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { VOUCHER_CONFIG } from "@/components/Category/constants";

// GET method
export async function GET(req, { params }) {
  const { type } = params;
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;
  const status = parseInt(url.searchParams.get("status") || "0"); // 0 means all
  
  const config = VOUCHER_CONFIG[type]?.tran_code;
  console.log(Number(config.toString()[0]))
  if (!config) {
    return NextResponse.json(
      { message: "Invalid order type" },
      { status: 400 }
    );
  }

  const whereClause = {
    order_catagory: Number(config.toString()[0]),
    ...(status > 0 && { status }),
  };

  const [orders, total] = await Promise.all([
    prisma.orderMaster.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { order_no: "desc" },
      include: {
        godownDetails: true,
        acno: true,
        users: true,
        orderDetails: {
          include: {
            items: true,
          },
        },
      },
    }),
    prisma.orderMaster.count({ where: whereClause }),
  ]);
  
  const totalPages = Math.ceil(total / limit);
  
  return NextResponse.json({
    data: orders,
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
    const { type } = params;
    const config = VOUCHER_CONFIG[type];
    
    if (!config) {
      return NextResponse.json(
        { message: "Invalid order type" },
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

    const { master, lines } = body;
    if (!master || typeof master !== "object") {
      return NextResponse.json(
        { message: "Master must be a valid object" },
        { status: 400 }
      );
    }

    if (!Array.isArray(lines)) {
      return NextResponse.json(
        { message: "Details must be a valid array" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!master.party_code) {
      return NextResponse.json(
        { message: "Party code is required" },
        { status: 400 }
      );
    }

    if (!master.godown) {
      return NextResponse.json(
        { message: "Godown is required" },
        { status: 400 }
      );
    }

    // Create the order
    const orderMaster = await prisma.orderMaster.create({
      data: {
        additional_instructions: master.additional_instructions,
        delivery_location:master.delivery_location ,
        payment_terms: master.payment_terms,
        party_code: master.party_code,
        delivery_terms: master.delivery_terms,
        order_catagory: Number(config.tran_code.toString()[0]),
        godown:Number(master.godown),
        dateD: master.dated ? new Date(master.dated) : new Date(),
        due_date: master.due_date ? new Date(master.due_date) : null,
        status:1,
      },
    });

    // Create order details
    const orderDeatils = await prisma.orderDetail.createMany({ 
      data: lines.map( (detail, index) =>{
        console.log(index)
        const data = {
            amount: detail.amount,
            no_of_packs: detail.no_of_packs,
            qty: detail.qty,
            qty_per_pack: detail.qty_per_pack,
            rate:detail.rate,
            unit: detail.unit,
            itcd: Number(detail.itcd),
            order_no: orderMaster.order_no
        }
        return data
      })
    })

    return NextResponse.json({
      message: `${type} created successfully`,
      order_no: orderMaster.order_no,
      status: 201,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// PUT method
export async function PUT(req, { params }) {
  try {
    const { type } = params;
    const config = VOUCHER_CONFIG[type];
    
    if (!config) {
      return NextResponse.json(
        { message: "Invalid order type" },
        { status: 400 }
      );
    }

    const { master, lines } = await req.json();
    delete master.tran_code;
    delete master.users;

    if (!master || !master.order_no) {
      return NextResponse.json(
        { message: "Order number is required for update" },
        { status: 400 }
      );
    }

    // Check if order exists and matches type
    const existingOrder = await prisma.orderMaster.findUnique({
      where: { order_no: master.order_no },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    if (existingOrder.order_catagory !== Number(config.tran_code.toString()[0])) {
      return NextResponse.json(
        { message: `Order type doesn't match ${config.title}` },
        { status: 400 }
      );
    }

    // Update master
    const updatedMaster = await prisma.orderMaster.update({
      where: { order_no: master.order_no },
      data: {
        ...master,
        dateD: master.dateD ? new Date(master.dateD) : existingOrder.dateD,
        due_date: master.due_date ? new Date(master.due_date) : existingOrder.due_date,
      },
    });

    // Get existing details
    const existingDetails = await prisma.orderDetail.findMany({
      where: { order_no: master.order_no },
    });

    // Process details updates
    const updateOperations = [];
    const detailIdsToKeep = [];

    for (const detail of lines) {
      if (detail.id) {
        // Update existing detail
        updateOperations.push(
          prisma.orderDetail.update({
            where: { id: detail.id },
            data: {
              amount: detail.amount,
            no_of_packs: detail.no_of_packs,
            qty: detail.qty,
            qty_per_pack: detail.qty_per_pack,
            rate:detail.rate,
            unit: detail.unit,
            itcd: Number(detail.itcd),
            },
          })
        );
        detailIdsToKeep.push(detail.id);
      } else {
        // Add new detail
        updateOperations.push(
          prisma.orderDetail.create({
            data: {
              amount: detail.amount,
            no_of_packs: detail.no_of_packs,
            qty: detail.qty,
            qty_per_pack: detail.qty_per_pack,
            rate:detail.rate,
            unit: detail.unit,
            itcd: Number(detail.itcd),
            order_no: master.order_no
            },
          })
        );
      }
    }

    // Delete removed details
    const detailsToDelete = existingDetails
      .filter(ed => !detailIdsToKeep.includes(ed.id))
      .map(d => d.id);

    if (detailsToDelete.length > 0) {
      updateOperations.push(
        prisma.orderDetail.deleteMany({
          where: { id: { in: detailsToDelete } },
        })
      );
    }

    // Execute all operations in a transaction
    await prisma.$transaction(updateOperations);

    return NextResponse.json({
      message: `${config.title} updated successfully`,
      order_no: master.order_no,
      status: 200,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE method
export async function DELETE(req, { params }) {
  try {
    const { type } = params;
    const config = VOUCHER_CONFIG[type];
    
    if (!config) {
      return NextResponse.json(
        { message: "Invalid order type" },
        { status: 400 }
      );
    }

    const { order_no } = await req.json();

    if (!order_no) {
      return NextResponse.json(
        { message: "Order number is required" },
        { status: 400 }
      );
    }

    // Check if order exists and matches type
    const existingOrder = await prisma.orderMaster.findUnique({
      where: { order_no },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    console.log("ordeR: ",Number(config.tran_code.toString()[0]))
    if (existingOrder.order_catagory !== Number(config.tran_code.toString()[0])) {
      return NextResponse.json(
        { message: `Order type doesn't match ${config.title}` },
        { status: 400 }
      );
    }

    // Delete in transaction
  
     await  prisma.orderDetail.deleteMany({
        where: { order_no },
      });
     await prisma.orderMaster.delete({
        where: { order_no },
      });
    

    return NextResponse.json({
      message: `${config.title} deleted successfully`,
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
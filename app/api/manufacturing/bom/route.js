import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    const [routes, total] = await Promise.all([
        prisma.bomMaster.findMany({
        skip,
        take: limit,
        orderBy: { finishedId: "desc" },
        include: {
            bomDetails : {
                include: {
                    item: true,
                },
            },
        },
        }),
        prisma.bomMaster.count(),
    ]);
    
    const formattedData = routes.map((route) => ({
    finishedId: String(route.finishedId),
    productName: route.finishedProduct?.name || "",
    category: "Finished",
    materials: route.bomDetails.map((detail) => ({
      id: String(detail.materialId),
      name: detail.item?.item || "",
      percentage: detail.materialPercentage,
    })),
  }));
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
        data: formattedData,
        totalPages,
        page,
        limit,
        total,
        status: 200,
    });
    }

// POST method
export async function POST(req) {
    const data = await req.json();
    try {
        console.log("Data: ", data);
        const newRoute = await prisma.bomMaster.create({
            data: {
                finishedId: parseInt(data.finishedId),

            },
        });

        const details = data.materials.map((detail) => ({
            finishedId: parseInt(data.finishedId),
            materialId: parseInt(detail.id),
            materialPercentage: parseFloat(detail.percentage),
        }));

        await prisma.bomDetail.createMany({ data: details });
        return NextResponse.json({ data: newRoute, status: 201 });
    } catch (error) {
        console.error("Error creating BOM route:", error);
        return NextResponse.json(
            { message: "Failed to create BOM route", error: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(req) {
     const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
    const data = await req.json();
    try {

        const updatedRoute = await prisma.bomMaster.update({
            where: { finishedId: parseInt(id) },
            data: {
                finishedId: parseInt(data.finishedId),
            },
        });
        // Delete existing details
        await prisma.bomDetail.deleteMany({
            where: { finishedId: parseInt(id) },
        });
        // Create new details
        const details = data.materials.map((detail) => ({
            finishedId: parseInt(data.finishedId),
            materialId: parseInt(detail.id),
            materialPercentage: parseFloat(detail.percentage),
        }));
        await prisma.bomDetail.createMany({ data: details });
        return NextResponse.json({ data: updatedRoute, status: 200 });
    } catch (error) {
        console.error("Error updating BOM route:", error);
        return NextResponse.json(
            { message: "Failed to update BOM route", error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req) {
    const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
    try {
         await prisma.bomDetail.deleteMany({
            where: { finishedId: parseInt(id) },
        });

        await prisma.bomMaster.delete({
            where: { finishedId: parseInt(id) },
        });
       
        return NextResponse.json({ message: "BOM route deleted", status: 200 });
    } catch (error) {
        console.error("Error deleting BOM route:", error);
        return NextResponse.json(
            { message: "Failed to delete BOM route", error: error.message },
            { status: 500 }
        );
    }
}

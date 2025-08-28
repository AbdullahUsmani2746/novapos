import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    const [routes, total] = await Promise.all([
        prisma.productionPlanMaster.findMany({
        skip,
        take: limit,
        orderBy: { id: "desc" },
        include: {
            productionPlanDetail: true,
            item: true,
        },
        }),
        prisma.productionPlanMaster.count(),
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
        data: routes,
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
        const newRoute = await prisma.bomRoute.create({
            data: {
                ...data,
                created_at: new Date(),
                updated_at: new Date(),
            },
        });
        return NextResponse.json({ data: newRoute, status: 201 });
    } catch (error) {
        console.error("Error creating BOM route:", error);
        return NextResponse.json(
            { message: "Failed to create BOM route", error: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(req, { params }) {
    const { id } = params;
    const data = await req.json();
    try {
        const updatedRoute = await prisma.bomRoute.update({
            where: { id: parseInt(id) },
            data: {
                ...data,
                updated_at: new Date(),
            },
        });
        return NextResponse.json({ data: updatedRoute, status: 200 });
    } catch (error) {
        console.error("Error updating BOM route:", error);
        return NextResponse.json(
            { message: "Failed to update BOM route", error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req, { params }) {
    const { id } = params;
    try {
        await prisma.bomRoute.delete({
            where: { id: parseInt(id) },
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

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortField = searchParams.get("sortField") || "itcd";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build where clause for search
    const whereClause = search
      ? {
          OR: [
            {
              item: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              code: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              unit: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              itcd: {
                equals: isNaN(parseInt(search)) ? undefined : parseInt(search),
              },
            },
          ].filter(
            (condition) =>
              condition.itcd?.equals !== undefined ||
              condition.item ||
              condition.code ||
              condition.unit
          ),
        }
      : {};

    // Build orderBy clause for sorting
    const orderByClause = {};
    if (sortField && ["itcd", "item", "code", "unit"].includes(sortField)) {
      orderByClause[sortField] = sortOrder === "desc" ? "desc" : "asc";
    }

    // Get total count for pagination
    const total = await prisma.item.count({
      where: whereClause,
    });

    // Get items with pagination, search, and sorting
    const items = await prisma.item.findMany({
      where: whereClause,
      include: {
        itemCategories: true,
        subtrateRef: true,
      },
      orderBy: orderByClause,
      skip: offset,
      take: limit,
    });

    // Calculate total pages
    const pages = Math.ceil(total / limit);

    // Return paginated response
    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch items",
        details: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const item = await prisma.item.create({ data });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create item", details: error.message },
      { status: 500 }
    );
  }
}

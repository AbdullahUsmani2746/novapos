import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 1000000;
    const skip = (page - 1) * limit;

    const [shifts, total] = await Promise.all([
      prisma.shift.findMany({
        where: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        orderBy: { startTime: "asc" },
        skip,
        take: limit,
        include: {
          users: {
            select: {
              id: true,
              name: true,
              role: true,
              isActive: true,
            },
          },
        },
      }),
      prisma.shift.count({
        where: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      }),
    ]);

    return NextResponse.json({ shifts, total });
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, startTime, endTime } = await request.json();

    if (!name || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: "Time must be in HH:MM format" },
        { status: 400 }
      );
    }

    // Compare times
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    const shift = await prisma.shift.create({
      data: { name, startTime, endTime },
    });

    return NextResponse.json(shift, { status: 201 });
  } catch (error) {
    console.error("Error creating shift:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

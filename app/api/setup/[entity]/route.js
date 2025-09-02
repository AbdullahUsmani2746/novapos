// /app/api/[entity]/route.js
import entityModelMap from "@/lib/entityModelMap";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { entity } = await params;
    console.log("Processing entity:", entity);

    const config = entityModelMap[entity];
    if (!config) {
      return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const searchQuery = searchParams.get("search");
    const sortField = searchParams.get("sortField");
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // Build where clause for search
    let whereClause = {};
    if (searchQuery && searchQuery.trim() !== "") {
      // Define searchable fields for each entity
      const searchableFields = config.searchableFields || [
        "name",
        "title",
        "description",
      ];

      console.log("Searching in fields:", searchableFields);
      console.log("Search query:", searchQuery);
      whereClause.OR = searchableFields
        .map((field) => {
          const isNumberField = field.endsWith("?");
          const cleanField = field.replace("?", "");

          if (isNumberField) {
            const numVal = Number(searchQuery);
            if (isNaN(numVal)) return null;
            return { [cleanField]: numVal };
          }

          return {
            [cleanField]: {
              contains: searchQuery,
              mode: "insensitive",
            },
          };
        })
        .filter(Boolean);
    }

    // Build orderBy clause for sorting
    let orderByClause = {};
    if (sortField) {
      orderByClause[sortField] = sortOrder;
    } else {
      // Default sorting (you can customize this based on your needs)
      orderByClause = config.defaultSort || { id: "desc" };
    }

    // If page or limit is missing, don't paginate
    const shouldPaginate = pageParam !== null && limitParam !== null;
    console.log("Using pagination:", shouldPaginate);

    if (shouldPaginate) {
      const page = parseInt(pageParam, 10);
      const limit = parseInt(limitParam, 10);
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        config.model.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: orderByClause,
          include: config.include || undefined,
        }),
        config.model.count({
          where: whereClause,
        }),
      ]);

      return NextResponse.json({
        data,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
        filters: {
          search: searchQuery,
          sortField,
          sortOrder,
        },
      });
    } else {
      // Fetch all data without pagination
      console.log("Fetching all data for entity:", entity);
      const data = await config.model.findMany({
        where: whereClause,
        orderBy: orderByClause,
        include: config.include || undefined,
      });

      return NextResponse.json({
        data,
        total: data.length,
        filters: {
          search: searchQuery,
          sortField,
          sortOrder,
        },
      });
    }
  } catch (error) {
    console.error(`Error in ${params?.entity || "unknown"} API route:`, error);

    return NextResponse.json(
      {
        error: "Failed to fetch data",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  const { entity } = await params;
  const config = entityModelMap[entity];

  console.log("Processing POST for entity:", config);

  if (!config) {
    return new NextResponse(JSON.stringify({ error: "Invalid entity" }), {
      status: 400,
    });
  }

  const trim = (data) => {
    config.fields(data);
    Object.keys(data).forEach((key) => {
      if (typeof data[key] === "string") {
        data[key] = data[key].trim();
      }
    });
    return data;
  };

  try {
    const body = await req.json();

    if (body.ic_id) {
      body.ic_id = parseInt(body.ic_id);
    } else if (body.company || body.currency) {
      console.log("body.company", body);
    } else {
      body.company_id = 1;
    }

    console.log("body", body);

    const newItem = await config.model.create({
      data: trim(config.fields(body)),
    });
    return NextResponse.json(newItem);
  } catch (error) {
    console.log(error);
    return new NextResponse({ error: "Error creating item" }, { status: 500 });
  }
}

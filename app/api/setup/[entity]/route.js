// /app/api/[entity]/route.js
import entityModelMap from "@/lib/entityModelMap";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { entity } = await params;
    console.log("Processing entity:", entity);
    
    const config = entityModelMap[entity];
    if (!config) {
      return NextResponse.json(
        { error: "Invalid entity" }, 
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    // If page or limit is missing, don't paginate
    const shouldPaginate = pageParam !== null && limitParam !== null;
    console.log("Using pagination:", shouldPaginate);

    if (shouldPaginate) {
      const page = parseInt(pageParam, 10);
      const limit = parseInt(limitParam, 10);
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        config.model.findMany({
          skip,
          take: limit,
          include: config.include || undefined,
        }),
        config.model.count(),
      ]);

      return NextResponse.json({
        data,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } else {
      // Fetch all data without pagination
      console.log("Fetching all data for entity:", entity);
      const data = await config.model.findMany({
        include: config.include || undefined,
      });

      return NextResponse.json({
        data,
        total: data.length
      });
    }
  } catch (error) {
    // console.error(`Error in ${params?.entity || 'unknown'} API route:`, error);
    
    // Always return a proper JSON response object
    return NextResponse.json(
      { 
        error: "Failed to fetch data", 
        message: error.message 
      }, 
      { status: 500 }
    );
  }
}



export async function POST(req, { params }) {
  const { entity } = await params;
  const config = entityModelMap[entity];

  if (!config) {
    return new NextResponse(JSON.stringify({ error: "Invalid entity" }), { status: 400 });
  }

  try {
    const body = await req.json();

    if (body.ic_id) {
      body.ic_id = parseInt(body.ic_id);
    }else if(body.company|| body.currency) {
      console.log("body.company", body)
    }
    else {
      body.company_id = 1;
    }

    console.log("body", body);


   

    // console.log("body..", config.fields(body))

    const newItem = await config.model.create({
      data: body,
    });
    return NextResponse.json(newItem);
  } catch (error) {
    console.log(error)
    return new NextResponse({ error: "Error creating item" }, { status: 500 });
  }
}

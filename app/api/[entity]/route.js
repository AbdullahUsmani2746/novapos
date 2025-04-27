// /app/api/[entity]/route.js
import entityModelMap from "@/lib/entityModelMap";

export async function GET(req, { params }) {
  const { entity } = params;
  const config = entityModelMap[entity];

  if (!config) {
    return new Response(JSON.stringify({ error: "Invalid entity" }), { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  const skip = (page - 1) * limit;

  try {
    const [data, total] = await Promise.all([
      config.model.findMany({
        skip,
        take: limit,
        include: config.include || undefined,
      }),
      config.model.count(),
    ]);

    return Response.json({ data, total });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error fetching data" }), { status: 500 });
  }
}

export async function POST(req, { params }) {
  console.log("params..", params)
  const { entity } = params;
  const config = entityModelMap[entity];

  if (!config) {
    return new Response(JSON.stringify({ error: "Invalid entity" }), { status: 400 });
  }

  try {
    const body = await req.json();
    const newItem = await config.model.create({
      data: config.fields(body),
    });
    return Response.json(newItem);
  } catch (error) {
    console.log(error)
    return new Response(JSON.stringify({ error: "Error creating item" }), { status: 500 });
  }
}

// /app/api/[entity]/route.js
import entityModelMap from "@/lib/entityModelMap";

export async function GET(req, { params }) {
  const { entity } = params;
  const config = entityModelMap[entity];

  if (!config) {
    return new Response(JSON.stringify({ error: "Invalid entity" }), { status: 400 });
  }

  try {
    const data = await config.model.findMany({
      include: config.include || undefined,
    });
    return Response.json(data);
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

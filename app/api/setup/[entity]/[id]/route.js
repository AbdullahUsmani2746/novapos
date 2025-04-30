// /app/api/[entity]/[id]/route.js
import entityModelMap from "@/lib/entityModelMap";

export async function GET(req, { params }) {
  const { entity, id } = params;
  const config = entityModelMap[entity];

  if (!config) {
    return new Response(JSON.stringify({ error: "Invalid entity" }), { status: 400 });
  }

  try {
    const item = await config.model.findUnique({
      where: { id: parseInt(id) },
      include: config.include || undefined,
    });
    return Response.json(item);
  } catch (error) {
    return new Response(JSON.stringify({ error: "Item not found" }), { status: 404 });
  }
}

export async function PUT(req, { params }) {
  const { entity, id } = params;
  const config = entityModelMap[entity];

  if (!config) {
    return new Response(JSON.stringify({ error: "Invalid entity" }), { status: 400 });
  }

  try {
    const body = await req.json();
    const updated = await config.model.update({
      where: { id: parseInt(id) },
      data: config.fields(body),
    });
    return Response.json(updated);
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error updating item" }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { entity, id } = params;
  const config = entityModelMap[entity];

  if (!config) {
    return new Response(JSON.stringify({ error: "Invalid entity" }), { status: 400 });
  }

  try {
    await config.model.delete({
      where: { id: parseInt(id) },
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error deleting item" }), { status: 500 });
  }
}

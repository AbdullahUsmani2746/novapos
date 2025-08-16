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
  const { entity, id } = await params;
  const config = entityModelMap[entity];

  if (!config) {
    return new Response(JSON.stringify({ error: "Invalid entity" }), { status: 400 });
  }

  const trim = (data) => 
  {
    config.fields(data);
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'string') {
        data[key] = data[key].trim();
      }
    })
    return data;
  }
  try {
    const body = await req.json();
    const updated = await config.model.update({
      where: { 

        ...body.ccno ? { ccno: body.ccno } : {id: parseInt(id) }, // Handle case where ccno is used instead of id
        
      },
      data: trim(config.fields(body)),
    });
    return Response.json(updated);
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error updating item" }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { entity, id } = await params;
  const config = entityModelMap[entity];
  console.log("Processing DELETE for entity:", config, id, config.id);

  if (!config) {
    return new Response(JSON.stringify({ error: "Invalid entity" }), { status: 400 });
  }

  try {
    await config.model.delete({
      where: { ...config.id!==null ? {ccno: Number(id)} : { id: Number(id)} }, // Handle case where ccno is used instead of id
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error deleting item" }), { status: 500 });
  }
}

// app/api/bom/[id]/route.js
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const bom = await prisma.bomMaster.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        bomDetails: {
          include: { item: true },
        },
        item: true,
        receipeMasters: true,
      },
    });
    if (!bom) return Response.json({ error: 'Not found' }, { status: 404 });
    const formatted = {
      id: bom.id,
      finishedId: bom.finished_id,
      productName: bom.item.item,
      dateCreated: bom.dated?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      instructions: bom.instructions,
      status: 'Active',
      materials: bom.bomDetails.map(detail => ({
        id: detail.material_id,
        name: detail.item.item,
        percentage: detail.material_percentage,
      })),
      linkedRecipes: bom.receipeMasters.map(recipe => recipe.receipe_id),
    };
    return Response.json(formatted, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const { finishedId, materials, instructions } = data;
    await prisma.bomMaster.update({
      where: { id: parseInt(params.id) },
      data: {
        finished_id: parseInt(finishedId),
        instructions,
      },
    });
    await prisma.bomDetail.deleteMany({ where: { bom_id: parseInt(params.id) } });
    for (const mat of materials) {
      await prisma.bomDetail.create({
        data: {
          bom_id: parseInt(params.id),
          finished_id: parseInt(finishedId),
          material_id: parseInt(mat.id),
          material_percentage: mat.percentage,
        },
      });
    }
    const updatedBom = await prisma.bomMaster.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        bomDetails: {
          include: { item: true },
        },
        item: true,
        receipeMasters: true,
      },
    });
    const formattedUpdated = {
      id: updatedBom.id,
      finishedId: updatedBom.finished_id,
      productName: updatedBom.item.item,
      dateCreated: updatedBom.dated?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      instructions: updatedBom.instructions,
      status: 'Active',
      materials: updatedBom.bomDetails.map(detail => ({
        id: detail.material_id,
        name: detail.item.item,
        percentage: detail.material_percentage,
      })),
      linkedRecipes: updatedBom.receipeMasters.map(recipe => recipe.receipe_id),
    };
    return Response.json(formattedUpdated, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.bomDetail.deleteMany({ where: { bom_id: parseInt(params.id) } });
    await prisma.bomMaster.delete({ where: { id: parseInt(params.id) } });
    return Response.json({}, { status: 204 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
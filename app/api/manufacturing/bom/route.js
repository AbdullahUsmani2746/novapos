// app/api/bom/route.js
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const boms = await prisma.bomMaster.findMany({
      include: {
        bomDetails: {
          include: { item: true },
        },
        item: true,
        receipeMasters: true, // Link to recipes
      },
    });
    const formatted = boms.map(bom => ({
      id: bom.id,
      finishedId: bom.finished_id,
      productName: bom.item.item,
      dateCreated: bom.dated?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      instructions: bom.instructions,
      status: 'Active', // Assume default
      materials: bom.bomDetails.map(detail => ({
        id: detail.material_id,
        name: detail.item.item,
        percentage: detail.material_percentage,
      })),
      linkedRecipes: bom.receipeMasters.map(recipe => recipe.receipe_id),
    }));
    return Response.json({ data: formatted }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { finishedId, materials, instructions } = data;
    const master = await prisma.bomMaster.create({
      data: {
        finished_id: parseInt(finishedId),
        instructions,
      },
    });
    for (const mat of materials) {
      await prisma.bomDetail.create({
        data: {
          bom_id: master.id,
          finished_id: parseInt(finishedId),
          material_id: parseInt(mat.id),
          material_percentage: mat.percentage,
        },
      });
    }
    const newBom = await prisma.bomMaster.findUnique({
      where: { id: master.id },
      include: {
        bomDetails: {
          include: { item: true },
        },
        item: true,
        receipeMasters: true,
      },
    });
    const formattedNew = {
      id: newBom.id,
      finishedId: newBom.finished_id,
      productName: newBom.item.item,
      dateCreated: newBom.dated?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      instructions: newBom.instructions,
      status: 'Active',
      materials: newBom.bomDetails.map(detail => ({
        id: detail.material_id,
        name: detail.item.item,
        percentage: detail.material_percentage,
      })),
      linkedRecipes: newBom.receipeMasters.map(recipe => recipe.receipe_id),
    };
    return Response.json(formattedNew, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
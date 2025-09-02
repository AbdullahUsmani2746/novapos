// app/api/recipe/[id]/route.js
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const recipe = await prisma.rECEIPE_MASTER.findUnique({
      where: { receipe_id: parseInt(params.id) },
      include: {
        receipeDetails: {
          include: { item: true },
        },
        item: true,
        bomRef: true,
      },
    });
    if (!recipe) return Response.json({ error: 'Not found' }, { status: 404 });
    const formatted = {
      id: recipe.receipe_id,
      finishedId: recipe.finished_id,
      productName: recipe.item.item,
      date: recipe.dated.toISOString().split('T')[0],
      finishedCount: recipe.finished_count,
      machineId: recipe.machine_id,
      timeMin: recipe.time_min,
      status: recipe.status,
      bomId: recipe.bom_id,
      details: recipe.receipeDetails.map(detail => ({
        id: detail.id,
        productId: detail.product_id,
        productDesc: detail.product_desc,
        qty: detail.qty,
        percentage: detail.product_percentage,
        sno: detail.sno,
        name: detail.item?.item || '',
      })),
      linkedBom: recipe.bomRef ? recipe.bomRef.id : null,
    };
    return Response.json(formatted, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const { finishedId, finishedCount, machineId, bomId, timeMin, status, details, date } = data;
    await prisma.rECEIPE_MASTER.update({
      where: { receipe_id: parseInt(params.id) },
      data: {
        finished_id: parseInt(finishedId),
        finished_count: finishedCount,
        machine_id: parseInt(machineId),
        bom_id: bomId ? parseInt(bomId) : null,
        time_min: timeMin,
        status,
        dated: new Date(date),
      },
    });
    await prisma.rECEIPE_DETAIL.deleteMany({ where: { receipe_id: parseInt(params.id) } });
    for (const det of details) {
      await prisma.rECEIPE_DETAIL.create({
        data: {
          receipe_id: parseInt(params.id),
          product_id: det.productId ? parseInt(det.productId) : null,
          product_desc: det.productDesc,
          qty: det.qty,
          product_percentage: det.percentage,
          sno: det.sno,
        },
      });
    }
    const updatedRecipe = await prisma.rECEIPE_MASTER.findUnique({
      where: { receipe_id: parseInt(params.id) },
      include: {
        receipeDetails: {
          include: { item: true },
        },
        item: true,
        bomRef: true,
      },
    });
    const formattedUpdated = {
      id: updatedRecipe.receipe_id,
      finishedId: updatedRecipe.finished_id,
      productName: updatedRecipe.item.item,
      date: updatedRecipe.dated.toISOString().split('T')[0],
      finishedCount: updatedRecipe.finished_count,
      machineId: updatedRecipe.machine_id,
      timeMin: updatedRecipe.time_min,
      status: updatedRecipe.status,
      bomId: updatedRecipe.bom_id,
      details: updatedRecipe.receipeDetails.map(detail => ({
        id: detail.id,
        productId: detail.product_id,
        productDesc: detail.product_desc,
        qty: detail.qty,
        percentage: detail.product_percentage,
        sno: detail.sno,
        name: detail.item?.item || '',
      })),
      linkedBom: updatedRecipe.bomRef ? updatedRecipe.bomRef.id : null,
    };
    return Response.json(formattedUpdated, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.rECEIPE_DETAIL.deleteMany({ where: { receipe_id: parseInt(params.id) } });
    await prisma.rECEIPE_MASTER.delete({ where: { receipe_id: parseInt(params.id) } });
    return Response.json({}, { status: 204 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
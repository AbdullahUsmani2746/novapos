// app/api/recipe/route.js
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const recipes = await prisma.rECEIPE_MASTER.findMany({
      include: {
        receipeDetails: {
          include: { item: true },
        },
        item: true,
        bomRef: true, // Link to BOM
      },
    });
    const formatted = recipes.map(recipe => ({
      id: recipe.receipe_id,
      finishedId: recipe.finished_id,
      productName: recipe.item.item,
      date: recipe.dated?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      finishedCount: recipe.finished_count,
      machineId: recipe.machine_id,
      timeMin: recipe.time_min,
      status: recipe.status || 'Active',
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
    }));
    return Response.json({ data: formatted }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { finishedId, finishedCount, machineId, bomId, timeMin, status, details, date } = data;
    const master = await prisma.rECEIPE_MASTER.create({
      data: {
        finished_id: parseInt(finishedId),
        finished_count: finishedCount,
        machine_id: parseInt(machineId),
        bom_id: bomId ? parseInt(bomId) : null,
        time_min: timeMin,
        status,
        dated: date ? new Date(date) : new Date(),
      },
    });
    for (const det of details) {
      await prisma.rECEIPE_DETAIL.create({
        data: {
          receipe_id: master.receipe_id,
          product_id: det.productId ? parseInt(det.productId) : null,
          product_desc: det.productDesc,
          qty: det.qty,
          product_percentage: det.percentage,
          sno: det.sno,
        },
      });
    }
    const newRecipe = await prisma.rECEIPE_MASTER.findUnique({
      where: { receipe_id: master.receipe_id },
      include: {
        receipeDetails: {
          include: { item: true },
        },
        item: true,
        bomRef: true,
      },
    });
    const formattedNew = {
      id: newRecipe.receipe_id,
      finishedId: newRecipe.finished_id,
      productName: newRecipe.item.item,
      date: newRecipe.dated.toISOString().split('T')[0],
      finishedCount: newRecipe.finished_count,
      machineId: newRecipe.machine_id,
      timeMin: newRecipe.time_min,
      status: newRecipe.status,
      bomId: newRecipe.bom_id,
      details: newRecipe.receipeDetails.map(detail => ({
        id: detail.id,
        productId: detail.product_id,
        productDesc: detail.product_desc,
        qty: detail.qty,
        percentage: detail.product_percentage,
        sno: detail.sno,
        name: detail.item?.item || '',
      })),
      linkedBom: newRecipe.bomRef ? newRecipe.bomRef.id : null,
    };
    return Response.json(formattedNew, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
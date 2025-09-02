// app/api/production/[id]/route.js
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const plan = await prisma.productionPlanMaster.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        productionPlanDetail: {
          include: { item: true },
        },
        item: true,
      },
    });
    if (!plan) return Response.json({ error: 'Not found' }, { status: 404 });
    const formatted = {
      id: plan.id,
      finishedId: plan.finished_id,
      productName: plan.item.item,
      date: plan.date_created.toISOString().split('T')[0],
      qty: plan.Qty,
      status: plan.status,
      materialRequirements: plan.productionPlanDetail.map(detail => ({
        id: detail.material_id,
        name: detail.item.item,
        percentage: detail.material_percentage,
        required: detail.material_qty,
      })),
    };
    return Response.json(formatted, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const { finishedId, qty, date, materialRequirements } = data;
    await prisma.productionPlanMaster.update({
      where: { id: parseInt(params.id) },
      data: {
        finished_id: parseInt(finishedId),
        Qty: qty,
        date_created: new Date(date),
      },
    });
    await prisma.productionPlanDetail.deleteMany({ where: { plan_id: parseInt(params.id) } });
    for (const mat of materialRequirements) {
      await prisma.productionPlanDetail.create({
        data: {
          plan_id: parseInt(params.id),
          material_id: parseInt(mat.id),
          material_qty: mat.required,
          material_percentage: mat.percentage,
        },
      });
    }
    const updatedPlan = await prisma.productionPlanMaster.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        productionPlanDetail: {
          include: { item: true },
        },
        item: true,
      },
    });
    const formattedUpdated = {
      id: updatedPlan.id,
      finishedId: updatedPlan.finished_id,
      productName: updatedPlan.item.item,
      date: updatedPlan.date_created.toISOString().split('T')[0],
      qty: updatedPlan.Qty,
      status: updatedPlan.status,
      materialRequirements: updatedPlan.productionPlanDetail.map(detail => ({
        id: detail.material_id,
        name: detail.item.item,
        percentage: detail.material_percentage,
        required: detail.material_qty,
      })),
    };
    return Response.json(formattedUpdated, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.productionPlanDetail.deleteMany({ where: { plan_id: parseInt(params.id) } });
    await prisma.productionPlanMaster.delete({ where: { id: parseInt(params.id) } });
    return Response.json({}, { status: 204 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
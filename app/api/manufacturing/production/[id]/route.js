import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Fetch all production plans with pagination, sorting, and filtering
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const sortBy = searchParams.get('sortBy') || 'id';
  const sortOrder = searchParams.get('sortOrder') || 'asc';

  try {
    const where = {};
    if (search) {
      where.OR = [
        { item: { item: { contains: search, mode: 'insensitive' } } },
        { finished_id: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const orderBy = { [sortBy]: sortOrder };

    const total = await prisma.productionPlan.count({ where });
    const plans = await prisma.productionPlan.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        item: true,
        bomMaster: { include: { bomDetails: { include: { item: true } } } },
      },
    });

    const formatted = plans.map(plan => ({
      id: plan.id,
      finishedId: plan.finished_id,
      productName: plan.item?.item || 'Unknown',
      date: plan.date?.toISOString().split('T')[0] || '',
      qty: plan.quantity,
      status: plan.status || 'Scheduled',
      materialRequirements: plan.bomMaster?.bomDetails.map(detail => ({
        id: detail.item.itcd,
        name: detail.item.item,
        percentage: detail.percentage,
        required: (plan.quantity * detail.percentage) / 100,
      })) || [],
    }));

    return NextResponse.json({ data: formatted, total }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const {
      receipe_id,
      finished_id,
      qty,
      dated,
      req_del_date,
      batch_no,
      sale_ord_no,
      actual_yield,
      viscosity,
      machine_id,
      time_min,
      bom_id,
      productionPlanDetail,
      status,
    } = data;

    await prisma.productionPlanMaster.update({
      where: { id: parseInt(params.id) },
      data: {
        receipe_id: parseInt(receipe_id),
        finished_id: parseInt(finished_id),
        bom_id: bom_id ? parseInt(bom_id) : null,
        qty: parseFloat(qty),
        dated: new Date(dated),
        req_del_date: req_del_date ? new Date(req_del_date) : null,
        batch_no: batch_no || null,
        machine_id: machine_id ? parseInt(machine_id) : null,
        time_min: time_min ? parseInt(time_min) : null,
        actual_yield: actual_yield ? parseFloat(actual_yield) : null,
        viscosity: viscosity || null,
        sale_ord_no: sale_ord_no ? parseInt(sale_ord_no) : null,
        status: status || 'Scheduled',
      },
    });

    await prisma.productionPlanDetail.deleteMany({ where: { plan_id: parseInt(params.id) } });

    for (const mat of productionPlanDetail) {
      await prisma.productionPlanDetail.create({
        data: {
          plan_id: parseInt(params.id),
          material_id: parseInt(mat.material_id),
          material_qty: parseFloat(mat.material_qty),
          material_percentage: parseFloat(mat.material_percentage),
          material_desc: mat.material_desc || '',
          sno: mat.sno || null,
        },
      });
    }

    const updatedPlan = await prisma.productionPlanMaster.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        productionPlanDetail: { include: { item: true } },
        item: true,
        receipe: { include: { receipeDetails: true } },
      },
    });

    const formattedUpdated = {
      id: updatedPlan.id,
      receipe_id: updatedPlan.receipe_id,
      finished_id: updatedPlan.finished_id,
      productName: updatedPlan.item?.item || 'Unknown',
      dated: updatedPlan.dated?.toISOString().split('T')[0] || '',
      req_del_date: updatedPlan.req_del_date?.toISOString().split('T')[0] || '',
      batch_no: updatedPlan.batch_no || '',
      sale_ord_no: updatedPlan.sale_ord_no || null,
      qty: updatedPlan.qty,
      actual_yield: updatedPlan.actual_yield || null,
      viscosity: updatedPlan.viscosity || '',
      machine_id: updatedPlan.machine_id || null,
      time_min: updatedPlan.time_min || null,
      bom_id: updatedPlan.bom_id || null,
      status: updatedPlan.status,
      productionPlanDetail: updatedPlan.productionPlanDetail.map(detail => ({
        material_id: detail.material_id,
        material_desc: detail.material_desc,
        material_percentage: detail.material_percentage,
        material_qty: detail.material_qty,
        sno: detail.sno || null,
      })),
    };

    return NextResponse.json(formattedUpdated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.productionPlanDetail.deleteMany({ where: { plan_id: parseInt(params.id) } });
    await prisma.productionPlanMaster.delete({ where: { id: parseInt(params.id) } });
    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
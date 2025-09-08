import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

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

    const total = await prisma.productionPlanMaster.count({ where });
    const plans = await prisma.productionPlanMaster.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        item: true,
        receipe: { include: { receipeDetails: true } },
        productionPlanDetail: { include: { item: true } },
      },
    });

    const formatted = plans.map(plan => ({
      id: plan.id,
      receipe_id: plan.receipe_id,
      finished_id: plan.finished_id,
      productName: plan.item?.item || 'Unknown',
      dated: plan.dated?.toISOString().split('T')[0] || '',
      req_del_date: plan.req_del_date?.toISOString().split('T')[0] || '',
      batch_no: plan.batch_no || '',
      sale_ord_no: plan.sale_ord_no || null,
      qty: plan.qty,
      actual_yield: plan.actual_yield || null,
      viscosity: plan.viscosity || '',
      machine_id: plan.machine_id || null,
      time_min: plan.time_min || null,
      bom_id: plan.bom_id || null,
      status: plan.status || 'Scheduled',
      productionPlanDetail: plan.productionPlanDetail.map(detail => ({
        material_id: detail.material_id,
        material_desc: detail.material_desc,
        material_percentage: detail.material_percentage,
        material_qty: detail.material_qty,
        sno: detail.sno || null,
      })),
    }));

    return NextResponse.json({ data: formatted, total }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
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
    } = data;

    const master = await prisma.productionPlanMaster.create({
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
        status: 'Scheduled',
      },
    });

    for (const mat of productionPlanDetail) {
      await prisma.productionPlanDetail.create({
        data: {
          plan_id: master.id,
          material_id: parseInt(mat.material_id),
          material_qty: parseFloat(mat.material_qty),
          material_percentage: parseFloat(mat.material_percentage),
          material_desc: mat.material_desc || '',
          sno: mat.sno || null,
        },
      });
    }

    const newPlan = await prisma.productionPlanMaster.findUnique({
      where: { id: master.id },
      include: {
        productionPlanDetail: { include: { item: true } },
        item: true,
        receipe: { include: { receipeDetails: true } },
      },
    });

    const formattedNew = {
      id: newPlan.id,
      receipe_id: newPlan.receipe_id,
      finished_id: newPlan.finished_id,
      productName: newPlan.item?.item || 'Unknown',
      dated: newPlan.dated?.toISOString().split('T')[0] || '',
      req_del_date: newPlan.req_del_date?.toISOString().split('T')[0] || '',
      batch_no: newPlan.batch_no || '',
      sale_ord_no: newPlan.sale_ord_no || null,
      qty: newPlan.qty,
      actual_yield: newPlan.actual_yield || null,
      viscosity: newPlan.viscosity || '',
      machine_id: newPlan.machine_id || null,
      time_min: newPlan.time_min || null,
      bom_id: newPlan.bom_id || null,
      status: newPlan.status,
      productionPlanDetail: newPlan.productionPlanDetail.map(detail => ({
        material_id: detail.material_id,
        material_desc: detail.material_desc,
        material_percentage: detail.material_percentage,
        material_qty: detail.material_qty,
        sno: detail.sno || null,
      })),
    };

    return NextResponse.json(formattedNew, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


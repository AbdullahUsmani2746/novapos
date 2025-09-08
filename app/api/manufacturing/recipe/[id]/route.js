// app/api/recipe/[id]/route.js
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

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
    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const { finished_id, finished_count, machine_id, bom_id, time_min, status, dated, receipeDetails } = data;

    if (status === 'Active') {
      await prisma.rECEIPE_MASTER.updateMany({
        where: { finished_id: parseInt(finished_id), status: 'Active', NOT: { receipe_id: parseInt(params.id) } },
        data: { status: 'Inactive' },
      });
    }

    await prisma.rECEIPE_MASTER.update({
      where: { receipe_id: parseInt(params.id) },
      data: {
        finished_id: parseInt(finished_id),
        finished_count: parseInt(finished_count),
        machine_id: parseInt(machine_id),
        bom_id: parseInt(bom_id),
        time_min: parseInt(time_min),
        status,
        dated: new Date(dated),
      },
    });

    await prisma.rECEIPE_DETAIL.deleteMany({ where: { receipe_id: parseInt(params.id) } });

    for (const det of receipeDetails) {
      await prisma.rECEIPE_DETAIL.create({
        data: {
          receipe_id: parseInt(params.id),
          product_id: parseInt(det.product_id),
          product_desc: det.product_desc,
          type: det.type,
          qty: parseInt(det.qty) || 0,
          product_percentage: parseFloat(det.product_percentage) || 0,
          instructions: det.instructions || null,
          sno: parseInt(det.sno),
        },
      });
    }

    const updatedRecipe = await prisma.rECEIPE_MASTER.findUnique({
      where: { receipe_id: parseInt(params.id) },
      include: {
        item: true,
        receipeDetails: true,
      },
    });

    const formattedUpdated = {
      receipe_id: updatedRecipe.receipe_id,
      finished_id: updatedRecipe.finished_id,
      productName: updatedRecipe.item?.item || 'Unknown',
      machine_id: updatedRecipe.machine_id,
      bom_id: updatedRecipe.bom_id,
      time_min: updatedRecipe.time_min,
      status: updatedRecipe.status,
      dated: updatedRecipe.dated?.toISOString().split('T')[0] || '',
      finished_count: updatedRecipe.finished_count,
      receipeDetails: updatedRecipe.receipeDetails.map(detail => ({
        product_id: detail.product_id,
        product_desc: detail.product_desc,
        type: detail.type,
        qty: detail.qty,
        product_percentage: detail.product_percentage,
        instructions: detail.instructions,
        sno: detail.sno,
      })),
    };

    return NextResponse.json(formattedUpdated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.rECEIPE_DETAIL.deleteMany({ where: { receipe_id: parseInt(params.id) } });
    await prisma.rECEIPE_MASTER.delete({ where: { receipe_id: parseInt(params.id) } });
    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
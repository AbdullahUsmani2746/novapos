import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const item = await prisma.item.findUnique({
      where: { itcd: parseInt(params.id) },
      include: {
        itemCategories: true,
        subtrateRef: true,
      },
    });
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch item', details: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const item = await prisma.item.update({
      where: { itcd: parseInt(params.id) },
      data,
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update item', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.item.delete({ where: { itcd: parseInt(params.id) } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete item', details: error.message }, { status: 500 });
  }
}
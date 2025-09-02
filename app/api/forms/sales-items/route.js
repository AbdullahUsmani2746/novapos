// app/api/sales-items/route.js (similar)
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const acno = parseInt(searchParams.get('acno') || '0');
  const search = searchParams.get('search') || '';

  const where = {
    acno,
    OR: search ? [
      { itcd: { equals: parseInt(search) || undefined } },
      // Add more if needed
    ] : undefined,
  };

  const items = await prisma.sALES_ITEM_CUST.findMany({ where });
  return NextResponse.json(items);
}

export async function POST(request) {
  const data = await request.json();
  const item = await prisma.sALES_ITEM_CUST.create({ data });
  return NextResponse.json(item);
}

export async function PUT(request) {
  const { id, ...data } = await request.json();
  const item = await prisma.sALES_ITEM_CUST.update({
    where: { id: parseInt(id) },
    data,
  });
  return NextResponse.json(item);
}

export async function DELETE(request) {
  const { id } = await request.json();
  await prisma.sALES_ITEM_CUST.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}

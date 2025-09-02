

// app/api/customers/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const city = searchParams.get('city');
  const category = searchParams.get('category');
  const area = searchParams.get('area');
  const salesArea = searchParams.get('salesArea');

  const where = {
    AND: [
      search ? {
        OR: [
          { acname: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          // Add more fields as needed
        ]
      } : {},
      {macno: 35},
      city ? { city } : {},
      category ? { category } : {},
      area ? { area } : {},
      salesArea ? { salesArea } : {},
    ]
  };

  const [customers, total] = await Promise.all([
    prisma.aCNO.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.aCNO.count({ where }),
  ]);

  return NextResponse.json({ customers, total });
}

export async function POST(request) {
  const data = await request.json();
  const customer = await prisma.aCNO.create({ data });
  return NextResponse.json(customer);
}

export async function PUT(request) {
  const { acno, ...data } = await request.json();
  const customer = await prisma.aCNO.update({
    where: { acno: parseInt(acno) },
    data,
  });
  return NextResponse.json(customer);
}

export async function DELETE(request) {
  const { acno } = await request.json();
  await prisma.aCNO.delete({ where: { acno: parseInt(acno) } });
  return NextResponse.json({ success: true });
}
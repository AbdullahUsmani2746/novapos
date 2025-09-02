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
    macno: 1,
    AND: [
      search ? {
        OR: [
          { acname: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
        ]
      } : {},
      city ? { city } : {},
      category ? { category } : {},
      area ? { area } : {},
      salesArea ? { salesArea } : {},
    ]
  };

  const [vendors, total] = await Promise.all([
    prisma.aCNO.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.aCNO.count({ where }),
  ]);

  return NextResponse.json({ vendors, total });
}

export async function PUT(request) {
  const { acno, ...data } = await request.json();
  const vendor = await prisma.aCNO.update({
    where: { acno: parseInt(acno) },
    data,
  });
  return NextResponse.json(vendor);
}
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const mbscds = await prisma.mBSCD.findMany({
    
    });
    
    return NextResponse.json( {data:mbscds, status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch MBSCD data' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log(body);
    const { bscd, bscdDetail } = body;
    
    if (!bscd || !bscdDetail) {
      return NextResponse.json(
        { error: 'Both bscd and bscdDetail are required' },
        { status: 400 }
      );
    }

    const newMbscd = await prisma.mBSCD.create({
      data: {
        bscd,
        bscdDetail,
      },
    });
    
    return NextResponse.json({data:newMbscd ,status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'BSCD code already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create MBSCD' },
      { status: 500 }
    );
  }
}
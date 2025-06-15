import prisma from '@/lib/prisma'; 
import { NextResponse } from 'next/server';



export async function GET(request) {

    try {
  
      // Get the mbscd query parameter from the URL
      const { searchParams } = new URL(request.url);
      const mbscd = searchParams.get('mbscd') || "";
  
      const where = mbscd !== "" ? { mbscd:mbscd } : {};
  
  
      const bscds = await prisma.bSCD.findMany({
          where
        });
      
        return NextResponse.json( { data:bscds  , status: 200 });
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to fetch BSCD data' },
          { status: 500 }
        );
      }
    }

export async function POST(request) {
  try {
    const body = await request.json();
    const { bscd, bscdDetail, mbscd } = body;
    
    if (!bscd || !bscdDetail || !mbscd) {
      return NextResponse.json(
        { error: 'bscd, bscdDetail, and mbscd are required' },
        { status: 400 }
      );
    }

    const parentExists = await prisma.mBSCD.findUnique({
      where: { mbscd: mbscd },
    });

    if (!parentExists) {
      return NextResponse.json(
        { error: 'Parent MBSCD does not exist' },
        { status: 400 }
      );
    }

    const newBscd = await prisma.bSCD.create({
      data: {
        bscd: bscd,
        bscdDetail,
        mbscd: mbscd,
      },
    //   include: {
    //     mainBsCd: true,
    //   },
    });
    
    return NextResponse.json({ data: newBscd,  status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'BSCD code already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create BSCD' },
      { status: 500 }
    );
  }
}

// PUT update existing BSCD
export async function PUT(request) {
  try {
    const body = await request.json();
    const { bscd, bscdDetail, mbscd } = body;

    if (!bscd || !bscdDetail || !mbscd) {
      return NextResponse.json(
        { error: 'bscd, bscdDetail, and mbscd are required' },
        { status: 400 }
      );
    }

    const parentExists = await prisma.mBSCD.findUnique({ where: { mbscd } });

    if (!parentExists) {
      return NextResponse.json(
        { error: 'Parent MBSCD does not exist' },
        { status: 400 }
      );
    }

    const updated = await prisma.bSCD.update({
      where: { bscd },
      data: { bscdDetail, mbscd },
    });

    return NextResponse.json({ data: updated, status: 200 });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update BSCD' }, { status: 500 });
  }
}

// DELETE BSCD by query param (?code=XYZ)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bscd = searchParams.get('code');

    if (!bscd) {
      return NextResponse.json(
        { error: 'Query parameter "code" is required' },
        { status: 400 }
      );
    }

    await prisma.bSCD.delete({ where: { bscd } });

    return NextResponse.json({ message: 'BSCD deleted successfully', status: 200 });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete BSCD' }, { status: 500 });
  }
}
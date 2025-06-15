import prisma from '@/lib/prisma'; 
import { NextResponse } from 'next/server';

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
    const { mbscd, mbscdDetail } = body;
    
    if (!mbscd || !mbscdDetail) {
      return NextResponse.json(
        { error: 'Both bscd and bscdDetail are required' },
        { status: 400 }
      );
    }

    const newMbscd = await prisma.mBSCD.create({
      data: {
        mbscd,
        mbscdDetail,
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

// PUT to update existing MBSCD
export async function PUT(request) {
  try {
    const body = await request.json();
    const { mbscd, mbscdDetail } = body;

    if (!mbscd || !mbscdDetail) {
      return NextResponse.json(
        { error: 'Both mbscd and mbscdDetail are required' },
        { status: 400 }
      );
    }

    const updated = await prisma.mBSCD.update({
      where: { mbscd },
      data: { mbscdDetail },
    });

    return NextResponse.json({ data: updated, status: 200 });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: 'Failed to update MBSCD' }, { status: 500 });
  }
}

// DELETE MBSCD
export async function DELETE(request) {
  try {
   const { searchParams } = new URL(request.url);
    const mbscd = searchParams.get('code');

    if (!mbscd) {
      return NextResponse.json(
        { error: 'mbscd is required for deletion' },
        { status: 400 }
      );
    }

    await prisma.mBSCD.delete({
      where: { mbscd },
    });

    return NextResponse.json({ message: 'MBSCD deleted successfully', status: 200 });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: 'Failed to delete MBSCD' }, { status: 500 });
  }
}
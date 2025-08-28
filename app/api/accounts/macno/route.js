import prisma from '@/lib/prisma'; 
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {

     // Get the bscd query parameter from the URL
    const { searchParams } = new URL(request.url);
    const bscd = searchParams.get('bscd');

    console.log(bscd);

    // Construct where clause based on bscd parameter
    const where = bscd ? { bscd:parseInt(bscd) } : {};

    console.log(where)
  
    const macnos = await prisma.mACNO.findMany({
    //   include: {
    //     businessCat: true,
    //     acnos: true,
    //   },
    //   orderBy: {
    //     macno: 'asc',
    //   },
      where
    });
    
    return NextResponse.json({data:macnos, status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch MACNO data' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { macno, macname, bscd } = await request.json();

    // Validate input
    if (!macno || !macname || !bscd) {
      return NextResponse.json(
        { error: 'macno, macname, and bscd are required' },
        { status: 400 }
      );
    }

    // Check if parent BSCD exists
    const parentExists = await prisma.bSCD.findUnique({
      where: { bscd: bscd },
    });

    if (!parentExists) {
      return NextResponse.json(
        { error: 'Parent BSCD does not exist' },
        { status: 400 }
      );
    }

    const newMacno = await prisma.mACNO.create({
      data: {
        macno: macno,
        macname,
        bscd: bscd,
      },
    //   include: {
    //     businessCat: true,
    //   },
    });

    return NextResponse.json({data:newMacno, status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'MACNO code already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create MACNO' },
      { status: 500 }
    );
  }
}

// PUT update MACNO
export async function PUT(request) {
  try {
    const { macno, macname, bscd } = await request.json();

    if (!macno || !macname || !bscd) {
      return NextResponse.json(
        { error: 'macno, macname, and bscd are required' },
        { status: 400 }
      );
    }

    const parentExists = await prisma.bSCD.findUnique({
      where: { bscd },
    });

    if (!parentExists) {
      return NextResponse.json(
        { error: 'Parent BSCD does not exist' },
        { status: 400 }
      );
    }

    const updatedMacno = await prisma.mACNO.update({
      where: { macno },
      data: { macname, bscd },
    });

    return NextResponse.json({ data: updatedMacno, status: 200 });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'MACNO not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to update MACNO' },
      { status: 500 }
    );
  }
}

// DELETE MACNO using query param (?code=XYZ)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const macno = searchParams.get('code');

    if (!macno) {
      return NextResponse.json(
        { error: 'Query parameter "code" is required' },
        { status: 400 }
      );
    }

    await prisma.mACNO.delete({ where: { macno } });

    return NextResponse.json({ message: 'MACNO deleted successfully', status: 200 });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'MACNO not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to delete MACNO' },
      { status: 500 }
    );
  }
}

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {

     // Get the bscd query parameter from the URL
    const { searchParams } = new URL(request.url);
    const bscd = searchParams.get('bscd');

    console.log(bscd);

    // Construct where clause based on bscd parameter
    const where = bscd ? { bscd:bscd } : {};

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
    
    return NextResponse.json(macnos, { status: 200 });
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

    return NextResponse.json(newMacno, { status: 201 });
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
import prisma from '@/lib/prisma'; 
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const macnoParam = searchParams.get('macno') || "";
    const acno = searchParams.get('acno') || "";
    const excludeMacnoParam = searchParams.get('excludeMacno') || "";

    const where = {};

    // Case 1 or 2: If macno is provided
    if (macnoParam) {
      const macnos = macnoParam.split(',').map(m => m.trim());
      where.macno = macnos.length === 1 ? macnos[0] : { in: macnos };
    }

    // Case 3: Exclude by macno (e.g., get all acnos except where macno is 003 or 004)
    if (excludeMacnoParam) {
      const excludeMacnos = excludeMacnoParam.split(',').map(m => m.trim());
      where.macno = { notIn: excludeMacnos };
    }

    const acnos = await prisma.aCNO.findMany({ where });

    return NextResponse.json({ data: acnos, status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch ACNO data' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      macno, 
      acno, 
      acname, 
      bankAccountNo,
      address,
      city,
      phoneFax,
      email,
      website,
      crDays,
      stRate,
      area,
      category,
      subCategory,
      country,
      customerBank,
      customerBankAddr,
      stRegNo,
      ntnNo,
      contactPerson,
      crLimit,
      salesArea
    } = body;

    console.log('body:', body);
    
    if (!macno || !acname) {
      return NextResponse.json(
        { error: 'macno, acno, and acname are required' },
        { status: 400 }
      );
    }

    if(!acno ){}

    const parentExists = await prisma.mACNO.findUnique({
      where: { macno },
    });

    if (!parentExists) {
      return NextResponse.json(
        { error: 'Parent MACNO does not exist' },
        { status: 400 }
      );
    }
    // Check if the combination of macno and acno already exists
    const existingAcno = await prisma.aCNO.findFirst({
      where: {
        macno: macno,
        acno: acno,
      },
    });

    if (existingAcno) {
      console.log('ACNO combination already exists:', existingAcno);
      return NextResponse.json(
        { error: 'ACNO combination already exists' },
        { status: 400 }
      );
    }

    const newAcno = await prisma.aCNO.create({
      data: {
        macno: macno,
        acno: acno,
        acname,
        bankAccountNo,
        address,
        city,
        phoneFax,
        email,
        website,
        crDays: crDays ? crDays : null,
        stRate: stRate ? stRate : null,
        area,
        category,
        subCategory,
        country,
        customerBank,
        customerBankAddr,
        stRegNo,
        ntnNo,
        contactPerson,
        crLimit: crLimit ? crLimit : null,
        salesArea
      },
    //   include: {
    //     mainAccount: true,
    //   },
    });

    console.log('New ACNO created:', newAcno);
    
    return NextResponse.json({data:newAcno, status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'ACNO combination already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create ACNO' },
      { status: 500 }
    );
  }
}

// PUT (Update an ACNO)
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      macno,
      acno,
      acname,
      bankAccountNo,
      address,
      city,
      phoneFax,
      email,
      website,
      crDays,
      stRate,
      area,
      category,
      subCategory,
      country,
      customerBank,
      customerBankAddr,
      stRegNo,
      ntnNo,
      contactPerson,
      crLimit,
      salesArea,
    } = body;

    if (!macno || !acno || !acname) {
      return NextResponse.json(
        { error: 'macno, acno, and acname are required' },
        { status: 400 }
      );
    }

    // Ensure parent MACNO exists
    const parentExists = await prisma.mACNO.findUnique({ where: { macno } });
    if (!parentExists) {
      return NextResponse.json(
        { error: 'Parent MACNO does not exist' },
        { status: 400 }
      );
    }

    const updatedAcno = await prisma.aCNO.update({
      where: {
        macno_acno: {
          macno,
          acno,
        },
      },
      data: {
        acname,
        bankAccountNo,
        address,
        city,
        phoneFax,
        email,
        website,
        crDays: crDays ?? null,
        stRate: stRate ?? null,
        area,
        category,
        subCategory,
        country,
        customerBank,
        customerBankAddr,
        stRegNo,
        ntnNo,
        contactPerson,
        crLimit: crLimit ?? null,
        salesArea,
      },
    });

    return NextResponse.json({ data: updatedAcno, status: 200 });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'ACNO not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to update ACNO' },
      { status: 500 }
    );
  }
}

// DELETE (?macno=XX&acno=YY)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const macno = searchParams.get('macno');
    const acno = searchParams.get('acno');

    if (!macno || !acno) {
      return NextResponse.json(
        { error: 'Both macno and acno query parameters are required' },
        { status: 400 }
      );
    }

    await prisma.aCNO.delete({
      where: {
        macno_acno: {
          macno,
          acno,
        },
      },
    });

    return NextResponse.json({
      message: 'ACNO deleted successfully',
      status: 200,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'ACNO not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to delete ACNO' },
      { status: 500 }
    );
  }
}
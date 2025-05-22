import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {

      // Get the mbscd query parameter from the URL
      const { searchParams } = new URL(request.url);
      const macno = searchParams.get('macno') || "";
      const acno = searchParams.get('acno') || "";

  
      const where = macno!=="" ? { macno: macno } : acno!=="" ? { acno: acno } : {};
  
    const acnos = await prisma.aCNO.findMany({
      where
    });
    
    return NextResponse.json({data:acnos, status: 200 });
  } catch (error) {
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
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  
  const tranCode = {
    payment: 2,
    receipt: 1,
    journal: 3
  }[type];

  const vouchers = await prisma.transactionsMaster.findMany({
    where: { tran_code: tranCode },
    include: { 
      transactions: true,
      acno:true,
      godownDetails:true,

    }
  });

  return NextResponse.json(vouchers);
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    const master = await prisma.transactionsMaster.create({
      data: {
        ...data,
        transactions: undefined
      }
    });

    if (data.transactions) {
      await prisma.transactions.createMany({
        data: data.transactions.map((t) => ({
          ...t,
          tran_id: master.tran_id
        }))
      });
    }

    return NextResponse.json({ success: true, data: master });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    
    const master = await prisma.transactionsMaster.update({
      where: { tran_id: data.tran_id },
      data: {
        ...data,
        transactions: undefined
      }
    });

    await prisma.transactions.deleteMany({
      where: { tran_id: data.tran_id }
    });

    if (data.transactions) {
      await prisma.transactions.createMany({
        data: data.transactions.map((t) => ({
          ...t,
          tran_id: master.tran_id
        }))
      });
    }

    return NextResponse.json({ success: true, data: master });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));

    await prisma.transactions.deleteMany({
      where: { tran_id: id }
    });

    await prisma.transactionsMaster.delete({
      where: { tran_id: id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
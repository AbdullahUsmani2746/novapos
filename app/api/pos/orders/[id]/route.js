import prisma from '@/lib/prisma';
import { syncOrderToWooCommerce } from '@/services/wooCommerceSync';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const order = await prisma.transactionsMaster.findUnique({
      where: { tran_id: parseInt(params.id) },
      include: {
        transactions: {
          include: {
            itemDetails: true,
          },
        },
      },
    });

    return order
      ? NextResponse.json(order)
      : NextResponse.json({ error: 'Order not found' }, { status: 404 });
  } catch (error) {
    console.error('GET order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { status } = await request.json();

    const order = await prisma.transactionsMaster.update({
      where: { tran_id: parseInt(params.id) },
      data: { rmk: status, sync_status: 'pending' },
      include: { transactions: true },
    });

    // await syncOrderToWooCommerce(order);

    return NextResponse.json(order);
  } catch (error) {
    console.error('PUT order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

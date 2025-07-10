import prisma from '@/lib/prisma';
import { syncOrderToWooCommerce } from '@/services/wooCommerceSync';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const orders = await prisma.transactionsMaster.findMany({
      where: { tran_code: 5 },
      include: {
        transactions: {
          include: {
            itemDetails: true,
          },
        },
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('GET orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { cartItems, customer, total, id } = await request.json();

    const order = await prisma.transactionsMaster.create({
      data: {
        dateD: new Date(),
        time: new Date(),
        tran_code: 5,
        pycd:customer,
        userId:id,
        vr_no: Math.floor(Math.random() * 1000000),
        invoice_no: `POS-${Date.now()}`,
        sync_status: 'pending',
        transactions: {
          create: cartItems.map(item => ({
            itcd: item.itcd,
            qty: item.quantity,
            rate: item.price,
            gross_amount: item.quantity * item.price,
            narration1: `POS Sale: ${item.item}`,
          })),
        },
      },
      include: { transactions: true },
    });

    for (const item of cartItems) {
      await prisma.item.update({
        where: { itcd: item.itcd },
        data: { stock: { decrement: item.quantity }, sync_status: 'pending' },
      });
    }

    // Uncomment this if syncing is needed
    // await syncOrderToWooCommerce(order);

    return NextResponse.json(order);
  } catch (error) {
    console.error('POST order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

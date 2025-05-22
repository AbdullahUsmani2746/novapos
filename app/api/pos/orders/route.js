import { prisma } from '@/lib/prisma';
import { syncOrderToWooCommerce } from '@/services/wooCommerceSync';
import { NextResponse } from 'next/server';

export async function GET() {
  const orders = await prisma.transactionsMaster.findMany({
    where: { tran_code: 5 },
    include: { transactions: { include: { itemDetails: true } } },
  });
  return NextResponse.json(orders);
}

export async function POST(request) {
  const { cartItems, customer, total } = await request.json();

  const order = await prisma.transactionsMaster.create({
    data: {
      dateD: new Date(),
      time: new Date(),
      tran_code: 5,
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

  await syncOrderToWooCommerce(order);
  return NextResponse.json(order);
}
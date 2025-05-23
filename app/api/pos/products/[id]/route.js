import prisma from '@/lib/prisma';
import { syncProductToWooCommerce } from '@/services/wooCommerceSync';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const product = await prisma.item.findUnique({
    where: { itcd: parseInt(params.id) },
    include: { itemCategories: { include: { mainCategory: { include: { ProductCategories: { include: { ProductGroups: { include: { ProductMasterCategories: true } } } } } } } } },

  });
  return product ? NextResponse.json(product) : NextResponse.json({ error: 'Product not found' }, { status: 404 });
}

export async function PUT(request, { params }) {
  const data = await request.json();
  const product = await prisma.item.update({
    where: { itcd: parseInt(params.id) },
    data: { ...data, sync_status: 'pending' },
    include: { itemCategory: true },
  });
  await syncProductToWooCommerce(product);
  return NextResponse.json(product);
}

export async function DELETE(request, { params }) {
  const product = await prisma.item.update({
    where: { itcd: parseInt(params.id) },
    data: { sync_status: 'deleted' },
  });
  await syncProductToWooCommerce(product);
  await prisma.item.delete({ where: { itcd: parseInt(params.id) } });
  return NextResponse.json({ message: 'Product deleted' });
}
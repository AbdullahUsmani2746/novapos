import prisma from '@/lib/prisma';
import { syncProductToWooCommerce, syncFromWooCommerce } from '@/services/wooCommerceSync';
import { NextResponse } from 'next/server';

export async function GET() {
  const products = await prisma.item.findMany({
    include: { itemCategories: { include: { mainCategory: { include: { ProductCategories: { include: { ProductGroups: { include: { ProductMasterCategories: true } } } } } } } } },
    orderBy: { item: 'asc' },
  });
  // syncFromWooCommerce()
  return NextResponse.json(products);
}

export async function POST(request) {
  const data = await request.json();
  console.log('Received data:', data);
  const { item, ic_id, sku, price, stock } = data;

  const product = await prisma.item.create({
    data: { item, ic_id, sku, price, stock, wc_product_id:1, wc_parent_id:1, sync_status: 'pending' },
    include: { itemCategories: true },
  });

  // await syncProductToWooCommerce(product);
  return NextResponse.json(product);
}   
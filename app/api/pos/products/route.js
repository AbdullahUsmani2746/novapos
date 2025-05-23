import prisma from '@/lib/prisma';
import { syncProductToWooCommerce, syncProductFromWooCommerce } from '@/services/wooCommerceSync';
import { NextResponse } from 'next/server';

export async function GET() {
  const products = await prisma.item.findMany({
    include: { itemCategories: { include: { mainCategory: { include: { ProductCategories: { include: { ProductGroups: { include: { ProductMasterCategories: true } } } } } } } } },
    orderBy: { item: 'asc' },
  });
  return NextResponse.json(products);
}

export async function POST(request) {
  const data = await request.json();
  const { item, ic_id, sku, price, stock, wc_product_id, wc_parent_id } = data;

  const product = await prisma.item.create({
    data: { item, ic_id, sku, price, stock, wc_product_id, wc_parent_id, sync_status: 'pending' },
    include: { itemCategory: true },
  });

  await syncProductToWooCommerce(product);
  return NextResponse.json(product);
}   
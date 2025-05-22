import { prisma } from '@/lib/prisma';
import { syncCategoryToWooCommerce } from '@/services/wooCommerceSync';
import { NextResponse } from 'next/server';

export async function GET() {
  const categories = await prisma.itemCategory.findMany({
    include: { mainCategory: { include: { productCategory: { include: { productGroup: { include: { productMasterCategory: true } } } } } }},
  });
  return NextResponse.json(categories);
}

export async function POST(request) {
  const data = await request.json();
  const { ic_name, mc_id } = data;

  const category = await prisma.itemCategory.create({
    data: { ic_name, mc_id, sync_status: 'pending' },
    include: { mainCategory: { include: { productCategory: { include: { productGroup: { include: { productMasterCategory: true } } } } } }},
  });

  const parentCategory = await prisma.mainCategory.findUnique({ where: { id: mc_id } });
  await prisma.productCategory.update({ where: { id: parentCategory.pc_id }, data: { pc_name: ic_name, sync_status: 'pending' } });
  const parentGroup = await prisma.productGroup.findUnique({ where: { id: parentCategory.productCategory.pg_id } });
  await prisma.productGroup.update({ where: { id: parentGroup.id }, data: { pg_name: ic_name, sync_status: 'pending' } });
  await prisma.productMasterCategory.update({ where: { id: parentGroup.productMasterCategory.id }, data: { pmc_name: ic_name, sync_status: 'pending' } });

  await syncCategoryToWooCommerce(category);
  return NextResponse.json(category);
}
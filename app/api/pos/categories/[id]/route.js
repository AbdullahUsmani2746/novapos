import prisma from '@/lib/prisma';
import { syncCategoryToWooCommerce } from '@/services/wooCommerceSync';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const category = await prisma.itemCategory.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        mainCategory: {
          include: {
            ProductCategories: {
              include: {
                ProductGroups: {
                  include: {
                    ProductMasterCategories: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return category
      ? NextResponse.json(category)
      : NextResponse.json({ error: 'Category not found' }, { status: 404 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json();

    const category = await prisma.itemCategory.update({
      where: { id: parseInt(params.id) },
      data: { ...data, sync_status: 'pending' },
      include: {
        mainCategory: {
          include: {
            ProductCategories: {
              include: {
                ProductGroups: {
                  include: {
                    ProductMasterCategories: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const parentCategory = await prisma.mainCategory.findUnique({
      where: { id: category.mc_id },
    });

    await prisma.productCategory.update({
      where: { id: parentCategory.pc_id },
      data: { pc_name: data.ic_name, sync_status: 'pending' },
    });

    const parentGroup = await prisma.productGroup.findUnique({
      where: { id: parentCategory.productCategory.pg_id },
    });

    await prisma.productGroup.update({
      where: { id: parentGroup.id },
      data: { pg_name: data.ic_name, sync_status: 'pending' },
    });

    await prisma.productMasterCategory.update({
      where: { id: parentGroup.productMasterCategory.id },
      data: { pmc_name: data.ic_name, sync_status: 'pending' },
    });

    // await syncCategoryToWooCommerce(category);
    return NextResponse.json(category);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const category = await prisma.itemCategory.update({
      where: { id: parseInt(params.id) },
      data: { sync_status: 'deleted' },
    });

    // await syncCategoryToWooCommerce(category);

    await prisma.itemCategory.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

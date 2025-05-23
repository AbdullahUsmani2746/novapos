import prisma from '@/lib/prisma';
import { syncProductToWooCommerce } from '@/services/wooCommerceSync';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const product = await prisma.item.findUnique({
      where: { itcd: parseInt(params.id) },
      include: {
        itemCategories: {
          include: {
            mainCategory: {
              include: {
                ProductCategories: {
                  include: {
                    ProductGroups: {
                      include: {
                        ProductMasterCategories: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    return product
      ? NextResponse.json(product)
      : NextResponse.json({ error: 'Product not found' }, { status: 404 });
  } catch (error) {
    console.error('GET product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json();

    const product = await prisma.item.update({
      where: { itcd: parseInt(params.id) },
      data: { ...data, sync_status: 'pending' },
      include: { itemCategories: true },
    });

    // Uncomment if syncing is required
    // await syncProductToWooCommerce(product);

    return NextResponse.json(product);
  } catch (error) {
    console.error('PUT product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const product = await prisma.item.update({
      where: { itcd: parseInt(params.id) },
      data: { sync_status: 'deleted' },
    });

    // Uncomment if syncing is required
    // await syncProductToWooCommerce(product);

    await prisma.item.delete({
      where: { itcd: parseInt(params.id) },
    });

    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('DELETE product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

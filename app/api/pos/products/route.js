import prisma from '@/lib/prisma';
import { syncProductToWooCommerce, syncFromWooCommerce } from '@/services/wooCommerceSync';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const products = await prisma.item.findMany({
      include: {
        itemCategories: {
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
        },
      },
      orderBy: { item: 'asc' },
    });

    // Uncomment if syncing from WooCommerce is required
    // await syncFromWooCommerce();

    return NextResponse.json(products);
  } catch (error) {
    console.error('GET products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Received data:', data);

    const { item, ic_id, sku, price, stock } = data;

    const product = await prisma.item.create({
      data: {
        item,
        ic_id,
        sku,
        price,
        stock,
        wc_product_id: 1,
        wc_parent_id: 1,
        sync_status: 'pending',
      },
      include: { itemCategories: true },
    });

    // Uncomment if syncing to WooCommerce is required
    // await syncProductToWooCommerce(product);

    return NextResponse.json(product);
  } catch (error) {
    console.error('POST product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

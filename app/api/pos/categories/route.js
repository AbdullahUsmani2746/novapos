
import prisma from '@/lib/prisma';
import { syncCategoryToWooCommerce } from '@/services/wooCommerceSync';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Fetching categories...');
    const categories = await prisma.itemCategory.findMany({
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
    });

    console.log('Fetched categories:', categories);

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    const data = await request.json();
    const { ic_name } = data;

    if (!ic_name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const FIXED_NAME = 'Default'; // You can replace this per request

    // 1. Check or Create ProductMasterCategory
    let pmc = await prisma.productMasterCategory.findFirst({
      where: { pmc_name: FIXED_NAME },
    });

    if (!pmc) {
      pmc = await prisma.productMasterCategory.create({
        data: {
          pmc_name: FIXED_NAME,
        },
      });
    }

    // 2. Check or Create ProductGroup
    let pg = await prisma.productGroup.findFirst({
      where: {
        pg_name: FIXED_NAME,
        pmc_id: pmc.id,
      },
    });

    if (!pg) {
      pg = await prisma.productGroup.create({
        data: {
          pg_name: FIXED_NAME,
          pmc_id: pmc.id,
        },
      });
    }

    // 3. Check or Create ProductCategory
    let pc = await prisma.productCategory.findFirst({
      where: {
        pc_name: FIXED_NAME,
        pg_id: pg.id,
      },
    });

    if (!pc) {
      pc = await prisma.productCategory.create({
        data: {
          pc_name: FIXED_NAME,
          pg_id: pg.id,
        },
      });
    }

    // 4. Check or Create MainCategory
    let mc = await prisma.mainCategory.findFirst({
      where: {
        mc_name: FIXED_NAME,
        pc_id: pc.id,
      },
    });

    if (!mc) {
      mc = await prisma.mainCategory.create({
        data: {
          mc_name: FIXED_NAME,
          pc_id: pc.id,
        },
      });
    }

    // 5. Check if ItemCategory exists
    const existingItemCategory = await prisma.itemCategory.findFirst({
      where: { ic_name },
    });

    if (existingItemCategory) {
      return NextResponse.json({ error: 'Item Category already exists' }, { status: 400 });
    }

    // 6. Create ItemCategory
    const newItemCategory = await prisma.itemCategory.create({
      data: {
        ic_name,
        mc_id: mc.id,
        sync_status: 'pending',
        wc_category_id: null, // or default value
      },
    });

    return NextResponse.json(newItemCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}



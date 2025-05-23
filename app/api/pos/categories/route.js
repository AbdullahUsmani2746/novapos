
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
  const data = await request.json();
  const { ic_name } = data;

  const FIXED_MAIN_CATEGORY_ID = 1; // use the ID of your static/shared mainCategory

  try{
    // Check if the category already exists
    const existingCategory = await prisma.itemCategory.findFirst({
      where: { ic_name },
    });

    if (existingCategory) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
    }
  
    // Create new itemCategory linked to fixed mainCategory
    const category = await prisma.itemCategory.create({
      data: {
        ic_name,
        mc_id: FIXED_MAIN_CATEGORY_ID,
        sync_status: 'pending'
      },
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

  // No need to update mainCategory or other levels now

  
  try {
    console.log('Category to sync:', category);

  // await syncCategoryToWooCommerce(category);
} catch (error) {
  console.error('WooCommerce sync failed:', error);
  // Optionally log the failure in DB or return a warning message
}
  return NextResponse.json(category);
}
  catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

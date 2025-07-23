import prisma from '@/lib/prisma';
import { syncProductToWooCommerce } from '@/services/wooCommerceSync';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const godown = searchParams.get("godown") || 1;

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

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // If godown is provided, calculate stock using raw query
    if (godown) {
      try {
        const stockResult = await prisma.$queryRaw`
          SELECT SUM(
            CASE 
              WHEN tm.tran_code IN (4, 10) AND tm.godown = ${Number(godown)} THEN t.qty  -- Purchase, Sale Return (add to stock)
              WHEN tm.tran_code IN (6, 9, 5) AND tm.godown = ${Number(godown)} THEN -t.qty  -- Sale, Purchase Return (remove from stock)
              WHEN tm.tran_code = 11 AND tm.godown = ${Number(godown)} THEN -t.qty  -- Transfer out
              WHEN tm.tran_code = 11 AND tm.godown2 = ${Number(godown)} THEN t.qty   -- Transfer in
              ELSE 0
            END
          ) as stock
          FROM "Transactions" t
          JOIN "TRANSACTIONS_MASTER" tm ON t.tran_id = tm.tran_id
          WHERE t.itcd = ${product.itcd} 
          AND (tm.godown = ${Number(godown)} OR tm.godown2 = ${Number(godown)})
        `;
        
        // Add calculated stock to product object
        product.stock = stockResult[0]?.stock || 0;
      } catch (stockError) {
        console.error(`Error calculating stock for item ${product.itcd}:`, stockError);
        product.stock = 0;
      }
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('GET product error:', error);
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

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function PUT(request, { params }) {
  try {
    const contentType = request.headers.get('content-type');
    let productData = {};
    let imageUrl = null;
    let shouldUpdateImage = false;

    // Handle different content types
    if (contentType?.includes('multipart/form-data')) {
      // Handle form data with potential image upload
      const formData = await request.formData();
      
      // Extract product data from form
      productData = {
        item: formData.get('item'),
        ic_id: formData.get('ic_id'),
        sku: formData.get('sku'),
        price: formData.get('price'),
        stock: formData.get('stock'),
        description: formData.get('description') || null,
      };

      // Handle image upload if present
      const imageFile = formData.get('image');
      if (imageFile && imageFile.size > 0) {
        imageUrl = await saveUploadedImage(imageFile);
        shouldUpdateImage = true;
      }

      // Check if image should be removed (when deleteImage flag is sent)
      const deleteImage = formData.get('deleteImage');
      if (deleteImage === 'true') {
        imageUrl = null;
        shouldUpdateImage = true;
      }
    } else {
      // Handle JSON data
      const data = await request.json();
      productData = data;
      
      // If image_url is provided in JSON, use it
      if (data.hasOwnProperty('image_url')) {
        imageUrl = data.image_url;
        shouldUpdateImage = true;
      }
    }

    console.log('Received product update data:', productData);
    console.log('Image URL:', imageUrl);
    console.log('Should update image:', shouldUpdateImage);

    // Validate product data
    validateProductData(productData);

    // Get current product to check if SKU is being changed
    const currentProduct = await prisma.item.findUnique({
      where: { itcd: parseInt(params.id) }
    });

    if (!currentProduct) {
      return NextResponse.json(
        { error: 'Product not found.' },
        { status: 404 }
      );
    }

    // Check if SKU is being changed and if new SKU already exists
    if (productData.sku && productData.sku.trim() !== currentProduct.sku) {
      const existingSku = await prisma.item.findFirst({
        where: { 
          sku: productData.sku.trim(),
          itcd: { not: parseInt(params.id) } // Exclude current product
        }
      });

      if (existingSku) {
        return NextResponse.json(
          { error: 'SKU already exists. Please use a unique SKU.' },
          { status: 400 }
        );
      }
    }

    // Verify category exists if category is being updated
    if (productData.ic_id) {
      const categoryExists = await prisma.itemCategory.findUnique({
        where: { id: parseInt(productData.ic_id) }
      });

      if (!categoryExists) {
        return NextResponse.json(
          { error: 'Invalid category selected.' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      sync_status: 'pending',
      last_sync: new Date(),
    };

    // Only update fields that are provided
    if (productData.item) updateData.item = productData.item.trim();
    if (productData.ic_id) updateData.ic_id = parseInt(productData.ic_id);
    if (productData.sku) updateData.sku = productData.sku.trim();
    if (productData.price !== undefined) updateData.price = parseFloat(productData.price);
    if (productData.stock !== undefined) updateData.stock = parseInt(productData.stock);
    if (productData.hasOwnProperty('description')) {
      updateData.description = productData.description?.trim() || null;
    }

    // Update image URL if provided
    if (shouldUpdateImage) {
      updateData.image_url = imageUrl;
    }

    console.log('Update data:', updateData);

    // Update the product
    const product = await prisma.item.update({
      where: { itcd: parseInt(params.id) },
      data: updateData,
      include: { itemCategories: true },
    });

    console.log('Product updated successfully:', product.itcd);

    // Uncomment and implement if syncing to WooCommerce is required
    // try {
    //   await syncProductToWooCommerce(product);
    //   console.log('Product synced to WooCommerce');
    // } catch (syncError) {
    //   console.error('WooCommerce sync failed:', syncError);
    //   // Update sync status to failed but don't fail the entire request
    //   await prisma.item.update({
    //     where: { itcd: product.itcd },
    //     data: { sync_status: 'failed' }
    //   });
    // }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });

  } catch (error) {
    console.error('PUT product error:', error);

    // Handle specific error types
    if (error.message.includes('Validation failed')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error.message.includes('Failed to save image')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return NextResponse.json(
        { error: `${field} already exists. Please use a unique value.` },
        { status: 400 }
      );
    }

    // Generic server error
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      },
      { status: 500 }
    );
  }
}

// Helper function to validate product data
function validateProductData(data) {
  const errors = [];

  if (data.item && !data.item.trim()) {
    errors.push('Product name cannot be empty');
  }

  if (data.sku && !data.sku.trim()) {
    errors.push('SKU cannot be empty');
  }

  if (data.price !== undefined && (isNaN(data.price) || parseFloat(data.price) < 0)) {
    errors.push('Price must be a valid positive number');
  }

  if (data.stock !== undefined && (isNaN(data.stock) || parseInt(data.stock) < 0)) {
    errors.push('Stock must be a valid non-negative number');
  }

  if (data.ic_id && (isNaN(data.ic_id) || parseInt(data.ic_id) <= 0)) {
    errors.push('Category ID must be a valid positive number');
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
}

// Helper function to save uploaded image (you'll need to implement this)
async function saveUploadedImage(imageFile) {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = imageFile.name.split('.').pop();
    const filename = `product_${timestamp}_${randomString}.${extension}`;

    // Convert file to buffer
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    // Save file to your preferred storage (local, S3, Cloudinary, etc.)
    // This is a placeholder - implement according to your storage solution
    const savedPath = await saveImageToStorage(buffer, filename);

    return savedPath;
  } catch (error) {
    console.error('Image save error:', error);
    throw new Error(`Failed to save image: ${error.message}`);
  }
}

// Placeholder function - implement according to your storage solution
async function saveImageToStorage(buffer, filename) {
  // Example for local storage:
  const path = require('path');
  const fs = require('fs').promises;
  const uploadDir = path.join(process.cwd(), 'public/uploads/products');
  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, filename);
  await fs.writeFile(filePath, buffer);
  return `/uploads/products/${filename}`;

  // Example for cloud storage (AWS S3, Cloudinary, etc.):
  // return await uploadToCloudStorage(buffer, filename);

  // For now, return a placeholder
  // return `/uploads/${filename}`;
}

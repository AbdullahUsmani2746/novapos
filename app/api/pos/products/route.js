import prisma from "@/lib/prisma";
import {
  syncProductToWooCommerce,
  syncFromWooCommerce,
} from "@/services/wooCommerceSync";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    // Get pagination parameters
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10000000;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "item";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const godown = searchParams.get("godown") || 1; // Add godown parameter

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause = {};

    // Search filter
    if (search) {
      whereClause.OR = [
        { item: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    // Category filter
    if (category && category !== "All") {
      whereClause.ic_id = parseInt(category);
    }

    // Status filter
    if (status && status !== "All") {
      whereClause.sync_status = status;
    }

    // Build orderBy clause
    const orderBy = {};
    switch (sortBy) {
      case "name":
        orderBy.item = sortOrder;
        break;
      case "price":
        orderBy.price = sortOrder;
        break;
      case "stock":
        orderBy.stock = sortOrder;
        break;
      default:
        orderBy.item = sortOrder;
    }

    // Get total count for pagination info
    const totalCount = await prisma.item.count({
      where: whereClause,
    });

    // Get products with pagination
    const products = await prisma.item.findMany({
      where: whereClause,
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
      orderBy: orderBy,
      skip: offset,
      take: limit,
    });

    // If godown is provided, get stock for each product using raw query
    if (godown) {
      for (let product of products) {
        try {
          const stockResult = await prisma.$queryRaw`
            SELECT SUM(
              CASE 
                WHEN tm.tran_code IN (4, 10, 12) AND tm.godown = ${Number(godown)} THEN t.qty  -- Purchase, Sale Return (add to stock)
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
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNext,
        hasPrev,
        startItem: offset + 1,
        endItem: Math.min(offset + limit, totalCount),
      },
    });
  } catch (error) {
    console.error("GET products error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
// Helper function to validate image file
const validateImageFile = (file) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed."
    );
  }

  if (file.size > maxSize) {
    throw new Error("File size too large. Maximum size is 5MB.");
  }

  return true;
};

// Helper function to generate unique filename
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = path.extname(originalName).toLowerCase();
  const baseName = path
    .basename(originalName, extension)
    .replace(/[^a-zA-Z0-9]/g, "-")
    .substring(0, 20);

  return `${baseName}-${timestamp}-${randomString}${extension}`;
};

// Helper function to save uploaded image
const saveUploadedImage = async (file) => {
  try {
    // Validate the file
    validateImageFile(file);

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name);
    const filepath = path.join(uploadDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the public URL
    return `/uploads/products/${filename}`;
  } catch (error) {
    console.error("Image save error:", error);
    throw new Error(`Failed to save image: ${error.message}`);
  }
};

// Helper function to validate product data
const validateProductData = (data) => {
  const errors = [];

  if (!data.item || !data.item.trim()) {
    errors.push("Product name is required");
  }

  if (!data.ic_id || isNaN(parseInt(data.ic_id))) {
    errors.push("Valid category ID is required");
  }

  if (!data.sku || !data.sku.trim()) {
    errors.push("SKU is required");
  }

  if (
    !data.price ||
    isNaN(parseFloat(data.price)) ||
    parseFloat(data.price) <= 0
  ) {
    errors.push("Valid price greater than 0 is required");
  }

  if (
    data.stock === undefined ||
    isNaN(parseInt(data.stock)) ||
    parseInt(data.stock) < 0
  ) {
    errors.push("Valid stock quantity (0 or greater) is required");
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(", ")}`);
  }

  return true;
};

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type");
    let productData = {};
    let imageUrl = null;

    // Handle different content types
    if (contentType?.includes("multipart/form-data")) {
      // Handle form data with potential image upload
      const formData = await request.formData();

      // Extract product data from form
      productData = {
        item: formData.get("item"),
        ic_id: formData.get("ic_id"),
        sku: formData.get("sku"),
        price: formData.get("price"),
        stock: formData.get("stock"),
        description: formData.get("description") || null,
      };

      // Handle image upload if present
      const imageFile = formData.get("image");
      if (imageFile && imageFile.size > 0) {
        imageUrl = await saveUploadedImage(imageFile);
      }
    } else {
      // Handle JSON data
      const data = await request.json();
      productData = data;

      // If image_url is provided in JSON, use it
      if (data.image_url) {
        imageUrl = data.image_url;
      }
    }

    console.log("Received product data:", productData);
    console.log("Image URL:", imageUrl);

    // Validate product data
    validateProductData(productData);

    console.log("Product Data Validation Passed");

    // Check if SKU already exists
    const existingSku = await prisma.item.findUnique({
      where: { sku: productData.sku.trim() },
    });

    if (existingSku) {
      return NextResponse.json(
        { error: "SKU already exists. Please use a unique SKU." },
        { status: 400 }
      );
    }

    // Verify category exists
    const categoryExists = await prisma.itemCategory.findUnique({
      where: { id: parseInt(productData.ic_id) },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { error: "Invalid category selected." },
        { status: 400 }
      );
    }

    console.log("Product Craetion Statred");
    // Create the product
    const product = await prisma.item.create({
      data: {
        item: productData.item.trim(),
        ic_id: parseInt(productData.ic_id),
        sku: productData.sku.trim(),
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock),
        description: productData.description?.trim() || null,
        image_url: imageUrl, // Add the image URL
        wc_product_id: null, // Set to null initially
        wc_parent_id: null, // Set to null initially
        sync_status: "pending",
        last_sync: new Date(),
      },
      include: {
        itemCategories: true,
      },
    });

    console.log("Product created successfully:", product.itcd);

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

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST product error:", error);

    // Handle specific error types
    if (error.message.includes("Validation failed")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message.includes("Failed to save image")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0] || "field";
      return NextResponse.json(
        { error: `${field} already exists. Please use a unique value.` },
        { status: 400 }
      );
    }

    // Generic server error
    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      },
      { status: 500 }
    );
  }
}

// Optional: Handle other HTTP methods
// export async function GET(request) {
//   return NextResponse.json(
//     { error: 'Method not allowed' },
//     { status: 405 }
//   );
// }

// Optional: Add method to get upload configuration
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

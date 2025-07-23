// app/api/inventory/transfer/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path to your auth config

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const { itcd, fromGodown, toGodown, qty } = await request.json();

    // Validate required fields
    if (!itcd || !fromGodown || !toGodown || !qty) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate that source and destination are different
    if (fromGodown === toGodown) {
      return NextResponse.json(
        { message: 'Cannot transfer to the same godown' },
        { status: 400 }
      );
    }

    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Verify sufficient stock in source godown
      const stockResult = await prisma.$queryRaw`
        SELECT SUM(
          CASE 
            WHEN tm.tran_code IN (4, 10) THEN t.qty  -- Purchase, Sale Return (add to stock)
            WHEN tm.tran_code IN (6, 9) THEN -t.qty  -- Sale, Purchase Return (remove from stock)
            WHEN tm.tran_code = 11 AND tm.godown = ${fromGodown} THEN -t.qty  -- Transfer out
            WHEN tm.tran_code = 11 AND tm.godown2 = ${fromGodown} THEN t.qty   -- Transfer in
            ELSE 0
          END
        ) as stock
        FROM "Transactions" t
        JOIN "TRANSACTIONS_MASTER" tm ON t.tran_id = tm.tran_id
        WHERE t.itcd = ${itcd} 
        AND (tm.godown = ${fromGodown} OR tm.godown2 = ${fromGodown})
      `;
      
      const availableStock = stockResult[0]?.stock || 0;
      if (availableStock < qty) {
        throw new Error(`Insufficient stock. Only ${availableStock} available in source godown`);
      }

      // 2. Update the item's stock tracking (optional - if you have a separate stock table)
      // This is just an example - adjust based on your actual schema
      await prisma.item.update({
        where: { itcd: parseInt(itcd) },
        data: {
          stock: {
            decrement: parseInt(qty), // Decrement from source godown
            // Note: You might need a more complex stock tracking system
          }
        }
      });

      return { success: true };
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Stock update error:', error);
    return NextResponse.json(
      { 
        message: 'Failed to update stock',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
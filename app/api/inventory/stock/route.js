// app/api/inventory/stock/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust the import path based on your setup

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const itcd = searchParams.get('itcd');
    const godown = searchParams.get('godown');

    // Validate required parameters
    if (!itcd || !godown) {
      return NextResponse.json(
        { error: 'Missing required parameters: itcd and godown' },
        { status: 400 }
      );
    }

    const stock = await prisma.$queryRaw`
      SELECT SUM(
        CASE 
          WHEN tm.tran_code IN (4, 10, 12) AND tm.godown = ${godown}THEN t.qty  -- Purchase, Sale Return (add to stock)
          WHEN tm.tran_code IN (6, 9, 5) AND tm.godown = ${godown} THEN -t.qty  -- Sale, Purchase Return (remove from stock)
          WHEN tm.tran_code = 11 AND tm.godown = ${godown} THEN -t.qty  -- Transfer out
          WHEN tm.tran_code = 11 AND tm.godown2 = ${godown} THEN t.qty   -- Transfer in
          ELSE 0
        END
      ) as stock
      FROM "Transactions" t
      JOIN "TRANSACTIONS_MASTER" tm ON t.tran_id = tm.tran_id
      WHERE t.itcd = ${itcd} 
      AND (tm.godown = ${godown} OR tm.godown2 = ${godown})
    `;
    
    return NextResponse.json({ 
      stock: stock[0]?.stock || 0 
    });

  } catch (error) {
    console.error('Stock check error:', error);
    return NextResponse.json(
      { error: 'Failed to check stock' },
      { status: 500 }
    );
  }
}
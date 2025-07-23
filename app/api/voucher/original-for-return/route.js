import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const tran_code = parseInt(searchParams.get("tran_code"));

  if (!date || !tran_code) {
    return NextResponse.json(
      { message: "Date and tran_code are required" },
      { status: 400 }
    );
  }

  try {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const transactions = await prisma.transactionsMaster.findMany({
      where: {
        tran_code,
        dateD: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        transactions: {
          where: {
            sub_tran_id: 1 // Only main lines
          },
          include: {
            itemDetails: true // Include item details if needed
          }
        },
        acno: true // Include account details
      },
      orderBy: {
        dateD: 'desc'
      }
    });

    // Add stock information for each transaction item using raw query
    const transactionsWithStock = await Promise.all(
      transactions.map(async (transaction) => {
        const transactionsWithStock = await Promise.all(
          transaction.transactions.map(async (transactionItem) => {
            let stock = 0;
            
            if (transactionItem.itcd && transaction.godown) {
              const stockResult = await prisma.$queryRaw`
                SELECT SUM(
                  CASE 
                    WHEN tm.tran_code IN (4, 10) AND tm.godown = ${transaction.godown} THEN t.qty  -- Purchase, Sale Return (add to stock)
                    WHEN tm.tran_code IN (6, 9, 5) AND tm.godown = ${transaction.godown} THEN -t.qty  -- Sale, Purchase Return (remove from stock)
                    WHEN tm.tran_code = 11 AND tm.godown = ${transaction.godown} THEN -t.qty  -- Transfer out
                    WHEN tm.tran_code = 11 AND tm.godown2 = ${transaction.godown} THEN t.qty   -- Transfer in
                    ELSE 0
                  END
                ) as stock
                FROM "Transactions" t
                JOIN "TRANSACTIONS_MASTER" tm ON t.tran_id = tm.tran_id
                WHERE t.itcd = ${transactionItem.itcd} 
                AND (tm.godown = ${transaction.godown} OR tm.godown2 = ${transaction.godown})
              `;
              
              stock = stockResult[0]?.stock || 0;
            }

            return {
              ...transactionItem,
              stock: stock
            };
          })
        );

        return {
          ...transaction,
          transactions: transactionsWithStock
        };
      })
    );

    return NextResponse.json({
      data: transactionsWithStock,
      status: 200
    });
  } catch (error) {
    console.error("Error fetching original transactions:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
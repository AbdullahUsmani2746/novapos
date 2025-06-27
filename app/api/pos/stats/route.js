import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // ✅ Total sales where tran_code = 5
   const salesToday = await prisma.transactions.aggregate({
  _sum: { gross_amount: true },
  where: {
    transactionsMaster: {
      // dateD is commented out
      tran_code: 5,
    },
  },
});


    // ✅ Count of TransactionsMaster where tran_code = 5
    const transactionCount = await prisma.transactionsMaster.count({
      where: {
        // dateD: {
        //   gte: today,
        //   lt: tomorrow,
        // },
        tran_code: 5,
      },
    });

    // ✅ Unique customers (by acno) for tran_code = 5
    const uniqueCustomers = await prisma.transactions.findMany({
      where: {
        transactionsMaster: {
          dateD: {
            gte: today,
            lt: tomorrow,
          },
          tran_code: 5,
        },
        acno: {
          not: null,
        },
      },
      distinct: ['acno'],
    });

    return NextResponse.json({
      todaysSales: salesToday._sum.gross_amount || 0,
      transactions: transactionCount,
      customers: uniqueCustomers.length || 0,
    });

  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

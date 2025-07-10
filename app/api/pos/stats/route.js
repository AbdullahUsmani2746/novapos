import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const role = searchParams.get('role') || "CASHIER";

  console.log('📊 Fetching stats for role:', role, '| user ID:', id);

  try {
    const userCondition = role === "CASHIER" ? { userId: id } : {};

    // ✅ Total Sales (all pycd)
    const totalSales = await prisma.transactions.aggregate({
      _sum: { gross_amount: true },
      where: {
        transactionsMaster: {
          tran_code: 5,
          ...userCondition,
        },
      },
    });

    // ✅ Total Cash Sales
    const totalCashSales = await prisma.transactions.aggregate({
      _sum: { gross_amount: true },
      where: {
        transactionsMaster: {
          tran_code: 5,
          pycd: '0001',
          ...userCondition,
        },
      },
    });

    // ✅ Total Card Sales
    const totalCardSales = await prisma.transactions.aggregate({
      _sum: { gross_amount: true },
      where: {
        transactionsMaster: {
          tran_code: 5,
          pycd: '0003',
          ...userCondition,
        },
      },
    });

    // ✅ Transaction Count
    const transactionCount = await prisma.transactionsMaster.count({
      where: {
        tran_code: 5,
        ...userCondition,
      },
    });

    // ✅ Unique Customers - Card
    const customersCard = await prisma.transactionsMaster.count({
      where: {
        tran_code: 5,
        pycd: '0003',
        ...userCondition,
      },
    });

    // ✅ Unique Customers - Cash
    const customersCash = await prisma.transactionsMaster.count({
      where: {
        tran_code: 5,
        pycd: '0001',
        ...userCondition,
      },
    });

    return NextResponse.json({
      totalSales: totalSales._sum.gross_amount || 0,
      totalCashSales: totalCashSales._sum.gross_amount || 0,
      totalCardSales: totalCardSales._sum.gross_amount || 0,
      transactions: transactionCount,
      customersCard,
      customersCash,
    });

  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

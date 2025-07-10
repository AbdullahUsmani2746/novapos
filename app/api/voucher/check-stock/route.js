// /api/voucher/check-stock/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req) {
  try {
    const { productIds } = await req.json()

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { message: 'Missing or invalid product IDs' }, 
        { status: 400 }
      )
    }

    // Get current stock for all requested products
    const stocks = await prisma.item.findMany({
      where: {
        itcd: {
          in: productIds.map(id => parseInt(id))
        }
      },
      select: {
        itcd: true,
        stock: true
      }
    })

    // Convert to object with itcd as key
    const stockLevels = stocks.reduce((acc, item) => {
      acc[item.itcd] = item.stock
      return acc
    }, {})

    return NextResponse.json(stockLevels)
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to fetch stock levels' },
      { status: 500 }
    )
  }
}
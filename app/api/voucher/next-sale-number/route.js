import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const field = searchParams.get('field') // 'check_no' or 'rmk2'
  const tran_code = searchParams.get('tran_code') // 6 for sales

  if (!field || !tran_code) {
    return NextResponse.json({ message: 'Missing parameters' }, { status: 400 })
  }

  const lastRecord = await prisma.transactionsMaster.findFirst({
    where: { 
      tran_code: parseInt(tran_code),
      [field]: { not: null }
    },
    orderBy: { [field]: 'desc' },
    select: { [field]: true }
  })

  let nextNumber = 1;
  if (lastRecord && lastRecord[field]) {
    // Handle both numeric and alphanumeric values
    const lastValue = lastRecord[field];
    const numericPart = String(lastValue).match(/\d+/);
    if (numericPart) {
      nextNumber = parseInt(numericPart[0]) + 1;
    }
  }

  return NextResponse.json({ nextNumber })
}
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const field = searchParams.get('field') // 'st_inv_no' or 'delivery_no'
  const value = searchParams.get('value')
  const tran_code = searchParams.get('tran_code') // 6 for sales

  if (!field || !value || !tran_code) {
    return NextResponse.json({ message: 'Missing parameters' }, { status: 400 })
  }

  const existing = await prisma.transactionsMaster.findFirst({
    where: {
      tran_code: parseInt(tran_code),
      [field]: value
    }
  })

  return NextResponse.json({ 
    exists: !!existing,
    nextNumber: existing ? parseInt(value) + 1 : null
  })
}
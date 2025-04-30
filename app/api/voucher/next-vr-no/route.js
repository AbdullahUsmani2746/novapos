import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const tran_code = searchParams.get('tran_code')

  if (!tran_code || isNaN(tran_code)) {
    return NextResponse.json({ message: 'Invalid tran_code' }, { status: 400 })
  }

  const lastVoucher = await prisma.transactionsMaster.findFirst({
    where: { tran_code: parseInt(tran_code) },
    orderBy: { vr_no: 'desc' },
  })

  const nextVrNo = lastVoucher ? lastVoucher.vr_no + 1 : 1
  return NextResponse.json({ nextVrNo })
}

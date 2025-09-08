import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const tran_code = searchParams.get('tran_code')
  const paymentMode = searchParams.get('paymentType') // "cash" or "bank"

  if (!tran_code || isNaN(tran_code)) {
    return NextResponse.json({ message: 'Invalid tran_code' }, { status: 400 })
  }

  const tranCodeNum = parseInt(tran_code)

  // validate paymentMode when tran_code is 1 or 2
  if ((tranCodeNum === 1 || tranCodeNum === 2) && !paymentMode) {
    return NextResponse.json(
      { message: 'Missing paymentMode (cash/bank)' },
      { status: 400 }
    )
  }

  let whereClause = { tran_code: tranCodeNum }

  // filter by macno through relation
  if (tranCodeNum === 1 || tranCodeNum === 2) {
    if (paymentMode.toLowerCase() === 'cash') {
      whereClause.acno = { macno: 65 } // parent Cash group
    } else if (paymentMode.toLowerCase() === 'bank') {
      whereClause.acno = { macno: 27 } // parent Bank group
    } else {
      return NextResponse.json(
        { message: 'Invalid paymentMode. Use cash or bank.' },
        { status: 400 }
      )
    }
  }

  const lastVoucher = await prisma.transactionsMaster.findFirst({
    where: whereClause,
    orderBy: { vr_no: 'desc' },
  })

  const nextVrNo = lastVoucher ? lastVoucher.vr_no + 1 : 1

  return NextResponse.json({ nextVrNo })
}

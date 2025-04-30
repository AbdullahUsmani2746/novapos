import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { VOUCHER_CONFIG } from '@/components/Category/constants'

// GET method
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  const tran_code = VOUCHER_CONFIG[type]?.tran_code
  if (!tran_code) {
    return NextResponse.json({ message: 'Invalid voucher type' }, { status: 400 })
  }

  const vouchers = await prisma.transactionsMaster.findMany({ where: { tran_code } })
  return NextResponse.json(vouchers)
}

// POST method
export async function POST(req) {
  const { type } = new URL(req.url).searchParams
  const tran_code = VOUCHER_CONFIG[type]?.tran_code
  if (!tran_code) {
    return NextResponse.json({ message: 'Invalid voucher type' }, { status: 400 })
  }

  const { master, lines, deductions } = await req.json()

  const masterData = await prisma.transactionsMaster.create({
    data: { ...master, tran_code }
  })

  await prisma.transactions.createMany({
    data: lines.map(l => ({
      ...l,
      tran_id: masterData.tran_id,
      sub_tran_id: 1
    }))
  })

  if (deductions?.length) {
    await prisma.transactions.createMany({
      data: deductions.map(d => ({
        ...d,
        tran_id: masterData.tran_id,
        sub_tran_id: 2
      }))
    })
  }

  return NextResponse.json({ message: 'Voucher saved' })
}

// PUT method
export async function PUT(req) {
  const { id, master, lines, deductions } = await req.json()

  await prisma.transactionsMaster.update({
    where: { tran_id: id },
    data: master
  })

  await prisma.transactions.deleteMany({ where: { tran_id: id } })

  await prisma.transactions.createMany({
    data: lines.map(l => ({
      ...l,
      tran_id: id,
      sub_tran_id: 1
    }))
  })

  if (deductions?.length) {
    await prisma.transactions.createMany({
      data: deductions.map(d => ({
        ...d,
        tran_id: id,
        sub_tran_id: 2
      }))
    })
  }

  return NextResponse.json({ message: 'Voucher updated' })
}

// DELETE method
export async function DELETE(req) {
  const { tran_id } = await req.json()

  await prisma.transactions.deleteMany({ where: { tran_id } })
  await prisma.transactionsMaster.delete({ where: { tran_id } })

  return NextResponse.json({ message: 'Voucher deleted' })
}

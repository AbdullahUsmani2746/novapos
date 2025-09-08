import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Fetch all machine instructions with pagination, sorting, and filtering
// export async function GET(request) {
//   const { searchParams } = new URL(request.url);
//   const search = searchParams.get('search') || '';
//   const status = searchParams.get('status') || '';
//   const page = parseInt(searchParams.get('page') || '1');
//   const limit = parseInt(searchParams.get('limit') || '10');
//   const sortBy = searchParams.get('sortBy') || 'id';
//   const sortOrder = searchParams.get('sortOrder') || 'asc';

//   try {
//     const where = {};
//     if (search) {
//       where.OR = [
//         { item: { item: { contains: search, mode: 'insensitive' } } },
//         { machine_id: { contains: search, mode: 'insensitive' } },
//       ];
//     }
//     if (status) {
//       where.status = status;
//     }

//     const orderBy = { [sortBy]: sortOrder };

//     const total = await prisma.mACHINE_INSTRUCTION_MASTER.count({ where });
//     const instructions = await prisma.mACHINE_INSTRUCTION_MASTER.findMany({
//       where,
//       orderBy,
//       skip: (page - 1) * limit,
//       take: limit,
//       include: {
//         item: true,
//         machineRef: { include: { item: true } },
//       },
//     });

//     const formatted = instructions.map(instruction => ({
//       id: instruction.id,
//       machineId: instruction.machine_id,
//       productName: instruction.item?.item || 'Unknown',
//       timeMin: instruction.time_min,
//       descr: instruction.description || '',
//       status: instruction.status || 'Active',
//       details: instruction.machineInstructionDetails.map(detail => ({
//         machineId: detail.item_id,
//         part: detail.part,
//         timeMin: detail.time_min,
//         instructions: detail.instructions,
//       })),
//     }));

//     return NextResponse.json({ data: formatted, total }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

export async function GET(request) {
    const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  let sortBy = searchParams.get('sortBy') || 'rec_id';
  const sortOrder = searchParams.get('sortOrder') || 'asc';
   if(sortBy==='id'){
        sortBy='rec_id';
      }


  try {
    const where = {};
    if (search) {
      where.OR = [
        // { item: { item: { contains: search, mode: 'insensitive' } } },
        { machine_id: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const orderBy = { [sortBy]: sortOrder };

    const total = await prisma.mACHINE_INSTRUCTION_MASTER.count({ where });
    const machines = await prisma.mACHINE_INSTRUCTION_MASTER.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        machineDetails: {
          include: { item: true },
        },
        item: true,
      },
    });
    // const formatted = machines.map(machine => ({
    //   id: machine.rec_id,
    //   machineId: machine.machine_id,
    //   productName: machine.item.item,
    //   timeMin: machine.time_min,
    //   descr: machine.descr,
    //   details: machine.machineDetails.map(detail => ({
    //     id: detail.id,
    //     machineId: detail.machine_id,
    //     part: detail.part,
    //     timeMin: detail.time_min,
    //     instructions: detail.instructions,
    //     name: detail.item.item,
    //   })),
    // }));
    return NextResponse.json({ data: machines, total }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { machineId, timeMin, descr, details } = data;
    const master = await prisma.mACHINE_INSTRUCTION_MASTER.create({
      data: {
        machine_id: parseInt(machineId),
        time_min: timeMin,
        descr,
      },
    });
    for (const det of details) {
      await prisma.mACHINE_INSTRUCTION_DETAIL.create({
        data: {
          rec_id: master.rec_id,
          machine_id: parseInt(det.machineId),
          part: det.part,
          time_min: det.timeMin,
          instructions: det.instructions,
        },
      });
    }
    const newMachine = await prisma.mACHINE_INSTRUCTION_MASTER.findUnique({
      where: { rec_id: master.rec_id },
      include: {
        machineDetails: {
          include: { item: true },
        },
        item: true,
      },
    });
    const formattedNew = {
      id: newMachine.rec_id,
      machineId: newMachine.machine_id,
      productName: newMachine.item.item,
      timeMin: newMachine.time_min,
      descr: newMachine.descr,
      details: newMachine.machineDetails.map(detail => ({
        id: detail.id,
        machineId: detail.machine_id,
        part: detail.part,
        timeMin: detail.time_min,
        instructions: detail.instructions,
        name: detail.item.item,
      })),
    };
    return Response.json(formattedNew, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
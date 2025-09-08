import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Fetch all recipes with pagination, sorting, and filtering
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
//         { finished_id: { contains: search, mode: 'insensitive' } },
//       ];
//     }
//     if (status) {
//       where.status = status;
//     }

//     const orderBy = { [sortBy]: sortOrder };

//     const total = await prisma.rECEIPE_MASTER.count({ where });
//     const recipes = await prisma.rECEIPE_MASTER.findMany({
//       where,
//       orderBy,
//       skip: (page - 1) * limit,
//       take: limit,
//       include: {
//         item: true,
//         bomMaster: { select: { id: true } },
//         // machine: { select: { itcd: true, item: true } },
//         receipeDetails: { include: { item: true } },
//       },
//     });

//     const formatted = recipes.map(recipe => ({
//       id: recipe.id,
//       finishedId: recipe.finished_id,
//       productName: recipe.item?.item || 'Unknown',
//       finishedCount: recipe.finished_count,
//       machineId: recipe.machine_id,
//       machineName: recipe.machine?.item || 'Unknown',
//       bomId: recipe.bom_id,
//       linkedBom: recipe.bomMaster?.id || 'None',
//       timeMin: recipe.time_min,
//       status: recipe.status || 'Active',
//       date: recipe.date?.toISOString().split('T')[0] || '',
//       details: recipe.receipeDetails.map(detail => ({
//         productId: detail.item_id,
//         productDesc: detail.item?.item || detail.description || '',
//         qty: detail.quantity,
//         percentage: detail.percentage,
//         sno: detail.sno,
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
  let sortBy = searchParams.get('sortBy') || 'receipe_id';
  const sortOrder = searchParams.get('sortOrder') || 'asc';

      if(sortBy==='id'){  
        sortBy='receipe_id';
      }

  try {
     const where = {};
    if (search) {
      where.OR = [
        // { item: { item: { contains: search, mode: 'insensitive' } } }, 
        { finished_id: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const orderBy = { [sortBy]: sortOrder };

    const total = await prisma.rECEIPE_MASTER.count({ where });
    console.log("Total: ", total)
    const recipes = await prisma.rECEIPE_MASTER.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        item: true,
        receipeDetails: true,
      },
    });

    // const formatted = recipes.map(recipe => ({
    //   receipe_id: recipe.receipe_id,
    //   finished_id: recipe.finished_id,
    //   productName: recipe.item?.item || 'Unknown',
    //   machine_id: recipe.machine_id,
    //   bom_id: recipe.bom_id,
    //   time_min: recipe.time_min,
    //   status: recipe.status,
    //   dated: recipe.dated?.toISOString().split('T')[0] || '',
    //   finished_count: recipe.finished_count,
    //   receipeDetails: recipe.receipeDetails.map(detail => ({
    //     product_id: detail.product_id,
    //     product_desc: detail.product_desc,
    //     type: detail.type,
    //     qty: detail.qty,
    //     product_percentage: detail.product_percentage,
    //     instructions: detail.instructions,
    //     sno: detail.sno,
    //   })),
    // }));
    return NextResponse.json({ data: recipes,total }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
const { finished_id, finished_count, machine_id, bom_id, time_min, status, dated, receipeDetails } = data; 

if (status === 'Active') {
      await prisma.rECEIPE_MASTER.updateMany({
        where: { finished_id: parseInt(finished_id), status: 'Active', NOT: { receipe_id: data.receipe_id } },
        data: { status: 'Inactive' },
      });
    }
const master = await prisma.rECEIPE_MASTER.create({
      data: {
        finished_id: parseInt(finished_id),
        finished_count: parseInt(finished_count),
        machine_id: parseInt(machine_id),
        bom_id: parseInt(bom_id),
        time_min: parseInt(time_min),
        status,
        dated: new Date(dated),
      },
    });

    for (const det of receipeDetails) {
      await prisma.rECEIPE_DETAIL.create({
        data: {
          receipe_id: master.receipe_id,
          product_id: parseInt(det.product_id),
          product_desc: det.product_desc,
          type: det.type,
          qty: parseInt(det.qty) || 0,
          product_percentage: parseFloat(det.product_percentage) || 0,
          instructions: det.instructions || null,
          sno: parseInt(det.sno),
        },
      });
    }

    const newRecipe = await prisma.rECEIPE_MASTER.findUnique({
      where: { receipe_id: master.receipe_id },
      include: {
        item: true,
        receipeDetails: true,
      },
    });

    const formattedNew = {
      receipe_id: newRecipe.receipe_id,
      finished_id: newRecipe.finished_id,
      productName: newRecipe.item?.item || 'Unknown',
      machine_id: newRecipe.machine_id,
      bom_id: newRecipe.bom_id,
      time_min: newRecipe.time_min,
      status: newRecipe.status,
      dated: newRecipe.dated?.toISOString().split('T')[0] || '',
      finished_count: newRecipe.finished_count,
      receipeDetails: newRecipe.receipeDetails.map(detail => ({
        product_id: detail.product_id,
        product_desc: detail.product_desc,
        type: detail.type,
        qty: detail.qty,
        product_percentage: detail.product_percentage,
        instructions: detail.instructions,
        sno: detail.sno,
      })),
    };
    return NextResponse.json(formattedNew, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
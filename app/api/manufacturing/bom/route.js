import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Fetch all BOMs with pagination, sorting, and filtering
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

//     const total = await prisma.bomMaster.count({ where });
//     const boms = await prisma.bomMaster.findMany({
//       where,
//       orderBy,
//       skip: (page - 1) * limit,
//       take: limit,
//       include: {
//         bomDetails: {
//           include: { item: true },
//         },
//         item: true,
//         receipeMasters: { select: { id: true } }, // For linkedRecipes
//       },
//     });

//     const formatted = boms.map(bom => ({
//       id: bom.id,
//       finishedId: bom.finished_id,
//       productName: bom.item?.item || 'Unknown',
//       dateCreated: bom.created_at?.toISOString().split('T')[0] || '',
//       status: bom.status || 'Active',
//       linkedRecipes: bom.receipeMasters.map(r => r.id),
//       materials: bom.bomDetails.map(detail => ({
//         id: detail.item.itcd,
//         name: detail.item.item,
//         percentage: detail.percentage,
//       })),
//       category: bom.category || 'Finished',
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
  const sortBy = searchParams.get('sortBy') || 'id';
  const sortOrder = searchParams.get('sortOrder') || 'asc';
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

    const total = await prisma.bomMaster.count({ where });
    const boms = await prisma.bomMaster.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        bomDetails: {
          include: { item: true },
        },
        item: true,
        receipeMasters: true,
      },
    });
    if (!boms) return Response.json({ error: 'Not found' }, { status: 404 });
    // const formatted = boms.map(bom => ({
    //   id: bom.id,
    //   finishedId: bom.finished_id,
    //   productName: bom.item.item,
    //   dateCreated: bom.dated?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    //   instructions: bom.instructions,
    //   status: 'Active',
    //   materials: bom.bomDetails.map(detail => ({
    //     id: detail.material_id,
    //     name: detail.item.item,
    //     percentage: detail.material_percentage,
    //   })),
    //   linkedRecipes: bom.receipeMasters.map(recipe => recipe.receipe_id),
    // }));
    return NextResponse.json({data: boms, total}, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function POST(request) {
  try {
    const data = await request.json();
    const { finishedId, materials, instructions } = data;
    const master = await prisma.bomMaster.create({
      data: {
        finished_id: parseInt(finishedId),
        instructions,
      },
    });
    for (const mat of materials) {
      await prisma.bomDetail.create({
        data: {
          bom_id: master.id,
          finished_id: parseInt(finishedId),
          material_id: parseInt(mat.id),
          material_percentage: mat.percentage,
        },
      });
    }
    const newBom = await prisma.bomMaster.findUnique({
      where: { id: master.id },
      include: {
        bomDetails: {
          include: { item: true },
        },
        item: true,
        receipeMasters: true,
      },
    });
    const formattedNew = {
      id: newBom.id,
      finishedId: newBom.finished_id,
      productName: newBom.item.item,
      dateCreated: newBom.dated?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      instructions: newBom.instructions,
      status: 'Active',
      materials: newBom.bomDetails.map(detail => ({
        id: detail.material_id,
        name: detail.item.item,
        percentage: detail.material_percentage,
      })),
      linkedRecipes: newBom.receipeMasters.map(recipe => recipe.receipe_id),
    };
    return NextResponse.json(formattedNew, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
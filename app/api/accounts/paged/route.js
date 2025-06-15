import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 

// Initialize Prisma clien
// Database fetching functions
async function fetchMbscd() {
  try {
    const data = await prisma.mBSCD.findMany();
    return data;
  } catch (error) {
    console.error("Error fetching MBSCD:", error);
    return [];
  }
}

async function fetchBscd() {
  try {
    const data = await prisma.bSCD.findMany();
    return data;
  } catch (error) {
    console.error("Error fetching BSCD:", error);
    return [];
  }
}

async function fetchMacno() {
  try {
    const data = await prisma.mACNO.findMany();
    return data;
  } catch (error) {
    console.error("Error fetching MACNO:", error);
    return [];
  }
}

async function fetchAcno() {
  try {
    const data = await prisma.aCNO.findMany();
    return data;
  } catch (error) {
    console.error("Error fetching ACNO:", error);
    return [];
  }
}

// Utility function to build structured account data
function buildAccountsHierarchy(mbscdData, bscdData, macnoData, acnoData) {
  const formattedData = [];
  
  for (const l1 of mbscdData) {
    // Filter level 2 (bscd) for this mbscd
    const level2Items = bscdData.filter(l2 => l2.mbscd === l1.mbscd);
    
    for (const l2 of level2Items) {
      // Filter level 3 (macno) for this bscd
      const level3Items = macnoData.filter(l3 => l3.bscd === l2.bscd);
      
      for (const l3 of level3Items) {
        // Filter level 4 (acno) for this macno
        const level4Items = acnoData.filter(l4 => l4.macno === l3.macno);
        
        formattedData.push({
          balanceSheetCode: `${l1.mbscd} ${l1.mbscdDetail}`,
          balanceSheetCategory: `${l2.bscd} ${l2.bscdDetail}`,
          mainAccounts: `${l3.macno} ${l3.macname}`,
          subAccounts: level4Items.map(acc => `${acc.acno} ${acc.acname}`)
        });
      }
    }
  }
  
  return formattedData;
}

// API handler for paginated data
export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20'); // Match frontend's itemsPerPage
    
    // Fetch all data
    const [mbscdData, bscdData, macnoData, acnoData] = await Promise.all([
      fetchMbscd(),
      fetchBscd(),
      fetchMacno(),
      fetchAcno()
    ]);
    
    // Build the hierarchical structure
    const allData = buildAccountsHierarchy(mbscdData, bscdData, macnoData, acnoData);
    
    // Calculate pagination values
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalItems = allData.length;
    const totalPages = Math.ceil(totalItems / limit);
    
    // Get paginated data slice
    const paginatedData = allData.slice(startIndex, endIndex);
    
    return NextResponse.json({
      success: true,
      data: paginatedData,
      pagination: {
        total: totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch account data" },
      { status: 500 }
    );
  }
}
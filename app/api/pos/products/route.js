import { syncFromWooCommerce } from '@/services/wooCommerceSync';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await syncFromWooCommerce();
    return NextResponse.json({ message: 'Sync completed' });
  } catch (error) {
    console.error('Sync from WooCommerce failed:', error);
    return NextResponse.json({ error: 'Failed to sync from WooCommerce' }, { status: 500 });
  }
}

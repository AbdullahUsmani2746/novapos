import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { prisma } from '@/lib/prisma';

const wooCommerce = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_URL,
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  version: 'wc/v3',
});

export async function syncProductToWooCommerce(product) {
  const data = {
    name: product.item,
    sku: product.sku,
    regular_price: product.price.toString(),
    stock_quantity: product.stock,
    categories: [{ id: product.itemCategory.wc_category_id }],
  };

  try {
    if (product.sync_status === 'deleted') {
      await wooCommerce.delete(`products/${product.wc_product_id}`, { force: true });
    } else if (product.wc_product_id) {
      await wooCommerce.put(`products/${product.wc_product_id}`, data);
    } else {
      const response = await wooCommerce.post('products', data);
      await prisma.item.update({
        where: { itcd: product.itcd },
        data: { wc_product_id: response.data.id, sync_status: 'synced', last_sync: new Date() },
      });
    }
  } catch (error) {
    console.error('WooCommerce sync error:', error);
    await prisma.item.update({
      where: { itcd: product.itcd },
      data: { sync_status: 'failed' },
    });
  }
}

export async function syncCategoryToWooCommerce(category) {
  const data = {
    name: category.ic_name,
    parent: category.mainCategory.wc_category_id || 0,
  };

  try {
    if (category.wc_category_id) {
      await wooCommerce.put(`products/categories/${category.wc_category_id}`, data);
    } else {
      const response = await wooCommerce.post('products/categories', data);
      await prisma.itemCategory.update({
        where: { id: category.id },
        data: { wc_category_id: response.data.id, sync_status: 'synced', last_sync: new Date() },
      });
      const parentCategory = await prisma.mainCategory.findUnique({ where: { id: category.mc_id } });
      await prisma.productCategory.update({ where: { id: parentCategory.pc_id }, data: { wc_category_id: response.data.id, sync_status: 'synced', last_sync: new Date() } });
      const parentGroup = await prisma.productGroup.findUnique({ where: { id: parentCategory.productCategory.pg_id } });
      await prisma.productGroup.update({ where: { id: parentGroup.id }, data: { wc_category_id: response.data.id, sync_status: 'synced', last_sync: new Date() } });
      await prisma.productMasterCategory.update({ where: { id: parentGroup.productMasterCategory.id }, data: { wc_category_id: response.data.id, sync_status: 'synced', last_sync: new Date() } });
    }
  } catch (error) {
    console.error('WooCommerce category sync error:', error);
    await prisma.itemCategory.update({
      where: { id: category.id },
      data: { sync_status: 'failed' },
    });
  }
}

export async function syncOrderToWooCommerce(order) {
  const data = {
    status: 'processing',
    line_items: order.transactions.map(t => ({
      product_id: t.itemDetails.wc_product_id,
      quantity: t.qty,
      price: t.rate,
    })),
    billing: { first_name: order.party_name || 'POS Customer' },
  };

  try {
    const response = await wooCommerce.post('orders', data);
    await prisma.transactionsMaster.update({
      where: { tran_id: order.tran_id },
      data: { wc_order_id: response.data.id, sync_status: 'synced', last_sync: new Date() },
    });
  } catch (error) {
    console.error('WooCommerce order sync error:', error);
    await prisma.transactionsMaster.update({
      where: { tran_id: order.tran_id },
      data: { sync_status: 'failed' },
    });
  }
}

export async function syncFromWooCommerce() {
  try {
    const products = await wooCommerce.get('products', { per_page: 100 });
    for (const product of products.data) {
      const existing = await prisma.item.findUnique({ where: { wc_product_id: product.id } });
      if (!existing) {
        const category = await prisma.itemCategory.findFirst({ where: { wc_category_id: product.categories[0]?.id } });
        if (category) {
          await prisma.item.create({
            data: {
              item: product.name,
              ic_id: category.id,
              sku: product.sku,
              price: parseFloat(product.price),
              stock: product.stock_quantity,
              wc_product_id: product.id,
              sync_status: 'synced',
              last_sync: new Date(),
            },
          });
        }
      } else {
        await prisma.item.update({
          where: { wc_product_id: product.id },
          data: {
            item: product.name,
            sku: product.sku,
            price: parseFloat(product.price),
            stock: product.stock_quantity,
            sync_status: 'synced',
            last_sync: new Date(),
          },
        });
      }
    }

    const categories = await wooCommerce.get('products/categories', { per_page: 100 });
    for (const category of categories.data) {
      const existing = await prisma.itemCategory.findUnique({ where: { wc_category_id: category.id } });
      if (!existing && category.parent !== 0) {
        const parent = await prisma.mainCategory.findFirst({ where: { wc_category_id: category.parent } });
        if (parent) {
          await prisma.itemCategory.create({
            data: {
              ic_name: category.name,
              mc_id: parent.id,
              wc_category_id: category.id,
              sync_status: 'synced',
              last_sync: new Date(),
            },
          });
        }
      }
    }

    const orders = await wooCommerce.get('orders', { per_page: 100 });
    for (const order of orders.data) {
      const existing = await prisma.transactionsMaster.findUnique({ where: { wc_order_id: order.id } });
      if (!existing) {
        await prisma.transactionsMaster.create({
          data: {
            dateD: new Date(order.date_created),
            time: new Date(order.date_created),
            tran_code: 5,
            vr_no: Math.floor(Math.random() * 1000000),
            invoice_no: `WC-${order.id}`,
            wc_order_id: order.id,
            sync_status: 'synced',
            last_sync: new Date(),
            transactions: {
              create: order.line_items.map(item => ({
                itcd: (/* await */ prisma.item.findFirst({ where: { wc_product_id: item.product_id } }))?.itcd,
                qty: item.quantity,
                rate: item.price,
                gross_amount: item.quantity * item.price,
                narration1: `WC Order: ${item.name}`,
              })),
            },
          },
        });
      }
    }
  } catch (error) {
    console.error('WooCommerce sync error:', error);
  }
}
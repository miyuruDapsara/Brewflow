const Order = require('../orders/order.model');
const InventoryItem = require('../inventory/inventoryItem.model');
const {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} = require('../orders/order.constants');

function resolveDateRange({ from, to } = {}) {
  const end = to ? new Date(to) : new Date();
  const start = from
    ? new Date(from)
    : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { start, end };
}

function revenueMatch(start, end) {
  return {
    createdAt: { $gte: start, $lte: end },
    paymentStatus: PAYMENT_STATUSES.SUCCEEDED,
    status: { $ne: ORDER_STATUSES.CANCELLED },
  };
}

async function getSalesReport({ from, to, groupBy = 'day' } = {}) {
  const { start, end } = resolveDateRange({ from, to });
  const match = revenueMatch(start, end);

  const periodFormat =
    groupBy === 'week' ? '%G-W%V' : '%Y-%m-%d';

  const [summaryRows, series, categorySales, failedPayments, cancellations] =
    await Promise.all([
      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$total' },
            orderCount: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              $dateToString: {
                format: periodFormat,
                date: '$createdAt',
              },
            },
            revenue: { $sum: '$total' },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            period: '$_id',
            revenue: 1,
            orderCount: 1,
          },
        },
      ]),
      Order.aggregate([
        { $match: match },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$product.categoryId',
            revenue: { $sum: '$items.lineTotal' },
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            categoryId: {
              $cond: [
                { $ifNull: ['$_id', false] },
                { $toString: '$_id' },
                null,
              ],
            },
            name: {
              $ifNull: ['$category.name', 'Unknown'],
            },
            revenue: 1,
          },
        },
        { $sort: { revenue: -1 } },
      ]),
      Order.countDocuments({
        createdAt: { $gte: start, $lte: end },
        $or: [
          { status: ORDER_STATUSES.PAYMENT_FAILED },
          { paymentStatus: PAYMENT_STATUSES.FAILED },
        ],
      }),
      Order.countDocuments({
        createdAt: { $gte: start, $lte: end },
        status: ORDER_STATUSES.CANCELLED,
      }),
    ]);

  const summary = summaryRows[0] || { revenue: 0, orderCount: 0 };

  return {
    range: { from: start.toISOString(), to: end.toISOString() },
    groupBy,
    summary: {
      revenue: summary.revenue || 0,
      orderCount: summary.orderCount || 0,
    },
    series,
    categorySales,
    failedPayments,
    cancellations,
  };
}

async function getProductReport({ from, to } = {}) {
  const { start, end } = resolveDateRange({ from, to });
  const match = revenueMatch(start, end);

  const products = await Order.aggregate([
    { $match: match },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        name: { $first: '$items.name' },
        unitsSold: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.lineTotal' },
      },
    },
    { $sort: { unitsSold: -1 } },
    {
      $project: {
        _id: 0,
        productId: {
          $cond: [
            { $ifNull: ['$_id', false] },
            { $toString: '$_id' },
            null,
          ],
        },
        name: 1,
        unitsSold: 1,
        revenue: 1,
      },
    },
  ]);

  return {
    range: { from: start.toISOString(), to: end.toISOString() },
    products,
  };
}

async function getInventoryReport() {
  const items = await InventoryItem.find({ isActive: true }).sort({ name: 1 });
  const mapped = items.map((item) => ({
    id: item._id.toString(),
    name: item.name,
    unit: item.unit,
    currentQuantity: item.currentQuantity,
    reorderLevel: item.reorderLevel,
    isLowStock: item.currentQuantity <= item.reorderLevel,
  }));

  return {
    items: mapped,
    summary: {
      totalItems: mapped.length,
      lowStockCount: mapped.filter((i) => i.isLowStock).length,
    },
  };
}

module.exports = {
  getSalesReport,
  getProductReport,
  getInventoryReport,
  resolveDateRange,
};

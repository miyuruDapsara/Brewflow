const mongoose = require('mongoose');
const {
  ORDER_TYPE_VALUES,
  ORDER_STATUS_VALUES,
  PAYMENT_STATUS_VALUES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} = require('./order.constants');

const selectedModifierSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true },
    groupName: { type: String, required: true },
    optionId: { type: String, required: true },
    optionName: { type: String, required: true },
    priceAdjustment: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    productType: { type: String, required: true },
    basePrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1, max: 10 },
    selectedModifiers: {
      type: [selectedModifierSchema],
      default: [],
    },
    notes: { type: String, default: '', maxlength: 200 },
    unitPrice: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    orderType: {
      type: String,
      enum: ORDER_TYPE_VALUES,
      required: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUS_VALUES,
      default: ORDER_STATUSES.PLACED,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS_VALUES,
      default: PAYMENT_STATUSES.PENDING,
    },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length >= 1;
        },
        message: 'Order must have at least one item',
      },
    },
  },
  { timestamps: true }
);

orderSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    customerId: this.customerId.toString(),
    orderNumber: this.orderNumber,
    orderType: this.orderType,
    status: this.status,
    paymentStatus: this.paymentStatus,
    subtotal: this.subtotal,
    tax: this.tax,
    discount: this.discount,
    total: this.total,
    items: (this.items || []).map((item) => ({
      id: item._id.toString(),
      productId: item.productId.toString(),
      name: item.name,
      productType: item.productType,
      basePrice: item.basePrice,
      quantity: item.quantity,
      selectedModifiers: item.selectedModifiers || [],
      notes: item.notes || '',
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('Order', orderSchema);

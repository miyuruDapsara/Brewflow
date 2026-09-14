const mongoose = require('mongoose');
const { TRANSACTION_TYPE_VALUES } = require('./inventory.constants');

const inventoryTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: TRANSACTION_TYPE_VALUES,
      required: true,
      index: true,
    },
    quantityChange: {
      type: Number,
      required: true,
    },
    quantityAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    inventoryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      default: null,
      index: true,
      sparse: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
      index: true,
      sparse: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
      index: true,
      sparse: true,
    },
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

inventoryTransactionSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    type: this.type,
    quantityChange: this.quantityChange,
    quantityAfter: this.quantityAfter,
    inventoryItemId: this.inventoryItemId
      ? this.inventoryItemId.toString()
      : null,
    productId: this.productId ? this.productId.toString() : null,
    orderId: this.orderId ? this.orderId.toString() : null,
    notes: this.notes || '',
    createdBy: this.createdBy ? this.createdBy.toString() : null,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model(
  'InventoryTransaction',
  inventoryTransactionSchema
);

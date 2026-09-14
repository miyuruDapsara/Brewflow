const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },
    currentQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reorderLevel: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

inventoryItemSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    name: this.name,
    unit: this.unit,
    currentQuantity: this.currentQuantity,
    reorderLevel: this.reorderLevel,
    isActive: this.isActive,
    isLowStock: this.currentQuantity <= this.reorderLevel,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);

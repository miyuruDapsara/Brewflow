const mongoose = require('mongoose');
const {
  PRODUCT_TYPE_VALUES,
  INVENTORY_MODE_VALUES,
  SELECTION_TYPE_VALUES,
  INVENTORY_MODES,
} = require('./product.constants');

const modifierOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    priceAdjustment: { type: Number, required: true, default: 0 },
  },
  { _id: true }
);

const modifierGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    isRequired: { type: Boolean, default: false },
    minSelections: { type: Number, default: 0, min: 0 },
    selectionType: {
      type: String,
      enum: SELECTION_TYPE_VALUES,
      default: 'SINGLE',
    },
    options: {
      type: [modifierOptionSchema],
      default: [],
    },
  },
  { _id: true }
);

const recipeItemSchema = new mongoose.Schema(
  {
    inventoryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    quantityRequired: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    productType: {
      type: String,
      enum: PRODUCT_TYPE_VALUES,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 1,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    inventoryMode: {
      type: String,
      enum: INVENTORY_MODE_VALUES,
      required: true,
    },
    stockQuantity: {
      type: Number,
      min: 0,
      default: 0,
    },
    recipeItems: {
      type: [recipeItemSchema],
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    modifierGroups: {
      type: [modifierGroupSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

productSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    categoryId: this.categoryId.toString(),
    name: this.name,
    productType: this.productType,
    basePrice: this.basePrice,
    imageUrl: this.imageUrl,
    inventoryMode: this.inventoryMode,
    stockQuantity: this.stockQuantity,
    recipeItems: (this.recipeItems || []).map((item) => ({
      inventoryItemId: item.inventoryItemId.toString(),
      quantityRequired: item.quantityRequired,
      unit: item.unit,
    })),
    isAvailable: this.isAvailable,
    isActive: this.isActive,
    modifierGroups: (this.modifierGroups || []).map((group) => ({
      id: group._id.toString(),
      name: group.name,
      isRequired: group.isRequired,
      minSelections: group.minSelections,
      selectionType: group.selectionType,
      options: (group.options || []).map((option) => ({
        id: option._id.toString(),
        name: option.name,
        priceAdjustment: option.priceAdjustment,
      })),
    })),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

productSchema.statics.isProductAvailable = function isProductAvailable(product) {
  if (!product.isActive || !product.isAvailable) {
    return false;
  }

  if (product.inventoryMode === INVENTORY_MODES.STOCK_BASED) {
    return product.stockQuantity > 0;
  }

  return Array.isArray(product.recipeItems) && product.recipeItems.length > 0;
};

module.exports = mongoose.model('Product', productSchema);

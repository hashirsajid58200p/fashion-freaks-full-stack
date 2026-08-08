const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true }, // Men, Women, Kids
    subCategory: { type: String, required: true }, // Jackets, T-shirts, etc.
    condition: { type: String, enum: ["New", "Sale"], default: "New" },
    style: {
      type: String,
      enum: ["Casual", "Dressy", "Girly"],
      required: true,
    },
    sizes: [{ type: String }], // ['S', 'M', 'L', 'XL']
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    reviews: { type: Number, default: 0 },
    description: { type: String, required: true },
    // Multiple Images Array
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
  },
  { timestamps: true },
);

productSchema.index({ category: 1 });
productSchema.index({ subCategory: 1 });
productSchema.index({ style: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model("Product", productSchema);

const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { upload } = require("../config/cloudinary");

// API: POST /api/products/add
// 'images' field name frontend se match hona chahiye, max 5 images
router.post("/add", upload.array("images", 5), async (req, res) => {
  try {
    const {
      secretKey,
      name,
      category,
      subCategory,
      condition,
      style,
      sizes,
      price,
      oldPrice,
      reviews,
      description,
    } = req.body;

    // 1. Password Verification
    const expectedPassword = process.env.UPLOAD_PASSWORD || "Fash1onFr3aks#Admin2026!";
    if (secretKey !== expectedPassword) {
      return res
        .status(401)
        .json({
          success: false,
          message: "❌ Invalid Secret Key! Access Denied.",
        });
    }

    // 2. Check if images were uploaded
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "❌ Please upload at least one image.",
        });
    }

    // 3. Map Cloudinary results to our images array
    const imagesData = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));

    // 4. Create and Save Product
    const newProduct = new Product({
      name,
      category,
      subCategory,
      condition,
      style,
      sizes: JSON.parse(sizes), // Frontend se stringify ho kar aayega
      price,
      oldPrice,
      reviews,
      description,
      images: imagesData,
    });

    await newProduct.save();
    res
      .status(201)
      .json({
        success: true,
        message: "✅ Product Live Ho Gaya!",
        product: newProduct,
      });
  } catch (error) {
    console.error("Upload Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "❌ Upload Failed!",
        error: error.message,
      });
  }
});

// API: GET /api/products/all
router.get("/all", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ success: false, message: "❌ Server Error!", error: error.message });
  }
});

// API: GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Fetch Product Error:", error);
    res.status(500).json({ success: false, message: "❌ Server Error!", error: error.message });
  }
});

module.exports = router;



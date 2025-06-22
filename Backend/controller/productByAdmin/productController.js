const productSchema = require("../../models/productSchema");
const cloudinary = require("../../config/cloudinary");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const categorySchema = require("../../models/categorySchema");

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products"); // Temporary storage
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/i;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    const mimetype = filetypes.test(file.mimetype.split("/")[1].toLowerCase());

    if (extname || mimetype) {
      return cb(null, true); // Accept file if either extension or MIME type matches
    } else {
      req.fileTypeError = "Only images (jpeg, jpg, png) are allowed!";
      cb(null, false);
    }
  },
});

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "../../uploads/products");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Add a new product
const addproduct = async (req, res) => {
  try {
    const {
      productName,
      productCategory,
      productPrice,
      productStock,
      brand,
      size,
      strapMaterial,
      color,
    } = req.body;

    // Validate required fields
    if (
      !productName ||
      !productCategory ||
      !productPrice ||
      !productStock ||
      !brand ||
      !size ||
      !strapMaterial ||
      !color
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //the file validaion

    if (req.fileTypeError) {
      return res.status(400).json({ message: req.fileTypeError });
    }

    // Validate images (expecting 1 to 3 images)
    if (!req.files || req.files.length < 1) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }
    if (req.files.length > 3) {
      return res
        .status(400)
        .json({ message: "A product can have up to 3 images" });
    }

    // Check if a product with the same name already exists
    const existingProduct = await productSchema.findOne({
      name: productName.trim(),
    });

    if (existingProduct) {
      return res
        .status(400)
        .json({ message: "Product with this name already exists" });
    }

    // Find the corresponding category document
    const category = await categorySchema.findOne({
      categoryName: productCategory.trim(),
    });

    if (!category) {
      return res.status(400).json({ message: "Invalid category" });
    }

    // Validate numeric fields
    const price = parseFloat(productPrice);
    const stock = parseInt(productStock, 10);
    if (isNaN(price) || price <= 0) {
      return res
        .status(400)
        .json({ message: "Product price must be a positive number" });
    }
    if (isNaN(stock) || stock < 0) {
      return res
        .status(400)
        .json({ message: "Product stock must be a non-negative number" });
    }

    // Upload images to Cloudinary
    const imageUploadPromises = req.files.map(async (file) => {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
          resource_type: "image",
        });
        // Delete the temporary file from the server
        fs.unlinkSync(file.path);
        return result.secure_url;
      } catch (error) {
        throw new Error(
          `Failed to upload image to Cloudinary: ${error.message}`
        );
      }
    });

    const imageUrls = await Promise.all(imageUploadPromises);

    // Create a new product with both category fields
    const newProduct = new productSchema({
      name: productName.trim(),
      category: productCategory.trim(), // String field
      categoryRef: category._id, // ObjectId reference
      price: price,
      stock: stock,
      brand: brand.trim(),
      size: size.trim(),
      strap_material: strapMaterial.trim(),
      color: color.trim(),
      images: imageUrls,
    });

    // Save the product to the database
    await newProduct.save();

    // Respond with success
    res.status(201).json({
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    // Clean up any uploaded files in case of an error
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(500).json({
      message: "Server error while adding product",
     
    });
  }
};

const getproductdetails = async (req, res) => {
  try {
    const { page = 1, limit = 5, search = "" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { "categoryRef.categoryName": { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Get total count for pagination metadata
    const totalProducts = await productSchema.countDocuments(query);

    // Fetch paginated products with category population
    const products = await productSchema
      .find(query)
      .populate({
        path: "categoryRef",
        select: "categoryName image description -_id",
      })
      .sort({ _id: -1 }) // Sort by _id descending (newest first)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limitNum);

    // Send response
    res.status(200).json({
      products,
      totalProducts,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Failed to fetch products" });
  }
};

//delete the product
const deletecproduct = async (req, res) => {
  const productid = req.params.id;

  try {
    await productSchema.findByIdAndDelete({ _id: productid });
    res.status(200).json({ message: "the product is deleted" });
  } catch (error) {
    res.status(400).json({ message: "there is something error" });
  }
};

const editproduct = async (req, res) => {
  const productID = req.params.id;

  const {
    productName,
    productCategory,
    productPrice,
    productStock,
    brand,
    size,
    strapMaterial,
    color,
    existingImages,
    imagesToDelete,
  } = req.body;

  try {
    const product = await productSchema.findById(productID);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const category = await categorySchema.findOne({
      categoryName: productCategory.trim(),
    });

    if (!category) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const price = parseFloat(productPrice);
    const stock = parseInt(productStock, 10);
    if (isNaN(price) || price <= 0) {
      return res
        .status(400)
        .json({ message: "Product price must be a positive number" });
    }
    if (isNaN(stock) || stock < 0) {
      return res
        .status(400)
        .json({ message: "Product stock must be a non-negative number" });
    }

    let finalImages = [];
    try {
      finalImages = existingImages ? JSON.parse(existingImages) : [];
    } catch (e) {
      finalImages = [];
    }

    if (req.fileTypeError) {
      return res.status(400).json({ message: req.fileTypeError });
    }

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products",
            resource_type: "image",
          });
          fs.unlinkSync(file.path);
          return result.secure_url;
        } catch (error) {
          throw error;
        }
      });

      const newImageUrls = await Promise.all(uploadPromises);
      finalImages = [...finalImages, ...newImageUrls];

      finalImages = finalImages.slice(0, 3);
    }

    const updatedProduct = await productSchema.findByIdAndUpdate(
      productID,
      {
        $set: {
          name: productName.trim(),
          category: productCategory.trim(),
          categoryRef: category._id,
          price: price,
          stock: stock,
          brand: brand.trim(),
          size: size.trim(),
          strap_material: strapMaterial.trim(),
          color: color.trim(),
          images: finalImages,
        },
      },
      { new: true }
    );

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    if (
      error instanceof multer.MulterError ||
      error.message.includes("Only JPEG, JPG, PNG  images are allowed")
    ) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({
      message: "Server error while updating product",
    });
  }
};

const toggleProductVisibility = async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the product and get current isHidden status
    const product = await productSchema.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Toggle the isHidden status
    product.isHidden = !product.isHidden;
    await product.save();

    res.status(200).json({
      message: `Product ${
        product.isHidden ? "hidden" : "visible"
      } successfully`,
      product,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while toggling product visibility" });
  }
};

const productsearch = async (req, res) => {
  const { query } = req.query;

  try {
    const products = await productSchema.find({
      name: { $regex: query, $options: "i" },
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(404).json({ message: "the product is not found" });
  }
};

const productsdetails = async (req, res) => {
  try {
    const products = await productSchema.find();

    if (!products)
      return res.status(404).json({ message: "products not founded" });

    res.status(200).json(products);
  } catch (error) {
    res.status(404).json({ message: "the product is not found" });
  }
};

module.exports = {
  addproduct,
  upload,
  getproductdetails,
  deletecproduct,
  editproduct,
  productsearch,
  toggleProductVisibility,
  productsdetails
};

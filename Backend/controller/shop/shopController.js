const productSchema = require("../../models/productSchema");
const categorySchema = require("../../models/categorySchema");
const { calculateProductdiscount } = require("../../services/offerservice");
const product_shop = async (req, res) => {
  try {
    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const { category, minPrice, maxPrice, strapMaterial, sortBy } = req.query;

    // categories logic
    const visibleCategories = await categorySchema.find({ isHiddenCat: false });
    const visibleCategoryIds = visibleCategories.map((cat) => cat._id);
    const visibleCategoryNames = visibleCategories.map(
      (cat) => cat.categoryName
    );

    let query = {
      isHidden: false,
      $or: [
        { categoryRef: { $in: visibleCategoryIds } },
        { category: { $in: visibleCategoryNames } },
      ],
    };

    // Filter by category
    if (category) {
      const categories = category.split(",").map((cat) => cat.trim());
      query.category = { $in: categories };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Filter by strap material
    if (strapMaterial) {
      const materials = strapMaterial.split(",").map((mat) => mat.trim());
      query.strap_material = { $in: materials };
    }

    // Fetch total number of products matching the filters
    const totalProducts = await productSchema.countDocuments(query);

    // Build the sort object
    let sortOption = {};
    if (sortBy) {
      switch (sortBy) {
        case "priceLowToHigh":
          sortOption.price = 1;
          break;
        case "priceHighToLow":
          sortOption.price = -1;
          break;
        case "aToZ":
          sortOption.name = 1;
          break;
        case "zToA":
          sortOption.name = -1;
          break;
        default:
          break;
      }
    }

    // Fetch paginated and filtered products
    const products = await productSchema
      .find(query)
      .populate("categoryRef")
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    //calculate discount for each product

    const productsWithDiscount = await Promise.all(
      products.map(async (product) => {
        const discountData = await calculateProductdiscount(product);

        return {
          ...product.toObject(),
          originalPrice: discountData.originalPrice,
          discountedPrice: discountData.discountedPrice,
          offer: discountData.offer,
        };
      })
    );

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limit);

    // Send response with products and pagination info
    res.status(200).json({
      products: productsWithDiscount,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        productsPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
};
// Search products with pagination
const Searching = async (req, res) => {
  const { query, page = 1, limit = 9 } = req.query; // Default to page 1, 9 items
  const skip = (page - 1) * limit;

  try {
    const allcategories = await categorySchema.find(
      { isHiddenCat: false },
      { _id: 1 }
    );

    const neededcategories = allcategories.map((cat) => cat._id);
    // Search products with regex
    const products = await productSchema
      .find({
        name: { $regex: query, $options: "i" },
        isHidden: false,
        categoryRef: { $in: neededcategories },
      })

      .skip(skip)
      .limit(parseInt(limit));

    // Get total matching products for pagination
    const totalProducts = await productSchema.countDocuments({
      name: { $regex: query, $options: "i" },
    });

    const productsWithDiscount = await Promise.all(
      products.map(async (product) => {
        const discountData = await calculateProductdiscount(product);
        return {
          ...product.toObject(),
          originalPrice: discountData.originalPrice,
          discountedPrice: discountData.discountedPrice,
          offer: discountData.offer,
        };
      })
    );

    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      products: productsWithDiscount,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        productsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(404).json({ message: "Products not found" });
  }
};

const strapfetch = async (req, res) => {
  try {
    // Using aggregation pipeline to get unique, non-empty strap materials
    const materials = await productSchema.aggregate([
      { $match: { strap_material: { $exists: true, $ne: "" } } },
      { $group: { _id: "$strap_material" } },
      { $project: { _id: 0, material: "$_id" } },
    ]);

    const strapMaterials = materials.map((item) => item.material);

    res.status(200).json(strapMaterials);
  } catch (error) {
    res.status(500).json({ message: "Error fetching strap materials" });
  }
};

const productdetails = async (req, res) => {
  const productId = req.params.id;

  try {
    const details = await productSchema
      .findOne({ _id: productId })
      .populate("categoryRef");

    if (!details)
      return res.status(404).json({ message: "Product not founded" });

    const discountData = await calculateProductdiscount(details);

    res.status(200).json({
      ...details.toObject(),
      originalPrice: discountData.originalPrice,
      discountedPrice: discountData.discountedPrice,
      offer: discountData.offer,
    });
  } catch (error) {
    res.status(404).json({ message: "Products not found" });
  }
};

const productRecommendation = async (req, res) => {
  const productId = req.params.id;

  try {
    const currentProduct = await productSchema
      .findById(productId)
      .populate("categoryRef");
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const recommendations = await productSchema
      .find({
        $and: [
          { _id: { $ne: productId } },
          { isHidden: false },
          { $or: [{ category: currentProduct.category }] },
        ],
      })
      .populate("categoryRef")
      .limit(4)
      .sort({ createdAt: -1 });

    const recommendationsWithDiscounts = await Promise.all(
      recommendations.map(async (product) => {
        const discountData = await calculateProductdiscount(product);
        return {
          ...product.toObject(),
          originalPrice: discountData.originalPrice,
          discountedPrice: discountData.discountedPrice,
          offer: discountData.offer,
        };
      })
    );

    res.status(200).json(recommendationsWithDiscounts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recommendations" });
  }
};

const getfiltercategory = async (req, res) => {
  try {
    const cat = await categorySchema.find();

    res.status(200).json(cat);
  } catch (error) {
    res.status(500).json({ message: "something error" });
  }
};

module.exports = {
  product_shop,
  Searching,
  productdetails,
  productRecommendation,
  strapfetch,
  getfiltercategory,
};



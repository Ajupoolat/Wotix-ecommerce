const categorySchema = require("../../models/categorySchema");
const uploadcategories = require("../../multers/multercategory");
const productSchema = require('../../models/productSchema')

//add the category

const addcategory = async (req, res) => {
  try {
    // Check for file type error first
    if (req.fileTypeError) {
      return res.status(400).json({ message: req.fileTypeError });
    }

    const { categoryName, description } = req.body;

    if (!categoryName || !description) {
      return res.status(400).json({ message: "Category name and description are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Category image is required" });
    }

    // Rest of your checks (existing category, etc.)
    const existingCategory = await categorySchema.findOne({
      categoryName: categoryName.trim(),
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category with this name already exists" });
    }

    const newCategory = new categorySchema({
      categoryName: categoryName.toLowerCase().trim(),
      description: description.trim(),
      image: req.file.path,
    });

    await newCategory.save();
    res.status(201).json({ message: "Category added successfully", category: newCategory });
  } catch (error) {
    res.status(500).json({ message: "Server error while adding category" });
  }
};




const getCategoriesWithStock = async (req, res) => {
  try {
    const { search = '', status = 'all', page = 1, limit = 4, sort = 'desc' } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (search.trim()) {
      query.categoryName = { $regex: search, $options: 'i' };
    }

    if (status !== 'all') {
      query.isHiddenCat = status === 'listed' ? false : true;
    }

    // Get stock totals by category name
    const stockByCategory = await productSchema.aggregate([
      {
        $group: {
          _id: '$category', // Group by the string category name
          totalStock: { $sum: '$stock' },
        },
      },
    ]);

    const stockMap = new Map();
    stockByCategory.forEach((item) => {
      stockMap.set(item._id, item.totalStock);
    });

    const totalCategories = await categorySchema.countDocuments(query);
    const categories = await categorySchema
      .find(query)
      .sort({ _id: sort === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    if (!categories.length && totalCategories === 0) {
      return res.status(404).json({ message: 'No categories found' });
    }

    const categoriesWithStock = categories.map((category) => ({
      ...category,
      totalStock: stockMap.get(category.categoryName) || 0,
    }));

    const totalPages = Math.ceil(totalCategories / limitNum);

    res.status(200).json({
      categories: categoriesWithStock,
      totalCategories,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


const getcategory = async (req,res) =>{

  try {
    const categories = await categorySchema.find();

    if(!categories)return res.status(404).json({message:"the categories is not founded"})

      res.status(200).json(categories)
  } catch (error) {
     res.status(500).json({ message: "Server error while fecthing categories" });
  }
}




const toggleCategoryVisibilty = async (req, res) => {
  try {
      const categoryId = req.params.id;
      
      // Find the product and get current isHidden status
      const category = await categorySchema.findById(categoryId);
      if (!category) {
          return res.status(404).json({ message: "Product not found" });
      }
      
      // Toggle the isHidden status
      category.isHiddenCat = !category.isHiddenCat;
      await category.save();
      
      res.status(200).json({
          message: `Product ${category.isHiddenCat ? 'hidden' : 'visible'} successfully`,
          category
      });
  } catch (error) {
      res.status(500).json({ message: "Server error while toggling product visibility" });
  }
};

const deletecategory = async (req,res)=>{

    const categoryid=req.params.id


    try {
        await categorySchema.findByIdAndDelete({_id:categoryid})
        res.status(200).json({message:"the category is deleted"})

    } catch (error) {
      res.status(400).json({message:"there is something issue!"})
    }
}


const editcategory = async (req, res) => {
  const categoryid = req.params.id;
  const { categoryName, description } = req.body;

  if (req.fileTypeError) return res.status(400).json({ message: req.fileTypeError });

  try {
    const category = await categorySchema.findById(categoryid);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const oldCategoryName = category.categoryName;
    const lowName = categoryName.toLowerCase().trim();

    const updateFields = { categoryName: lowName, description: description.trim() };
    if (req.file) updateFields.image = req.file.path;

    const editingcategory = await categorySchema.findByIdAndUpdate(
      { _id: categoryid },
      { $set: updateFields },
      { new: true }
    );

    await productSchema.updateMany(
      { category: oldCategoryName },
      { $set: { category: lowName } }
    );

    res.status(200).json(editingcategory);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const categorySearch = async (req,res)=>{
    const {query}=req.query

    try {
        
        const categories=await categorySchema.find({
            categoryName:{$regex:query,$options:'i'}
        })
        res.status(200).json(categories)
    } catch (error) {

        res.status(404).json({message:'the category is not found'})
    }

}

module.exports = {
  addcategory: [uploadcategories.single("image"), addcategory],
  getCategoriesWithStock,
  deletecategory,
  toggleCategoryVisibilty,
  editcategory:[uploadcategories.single('image'),editcategory],
  categorySearch,
  getcategory
};


const categorySchema = require("../../models/categorySchema");
const uploadcategories = require("../../multers/multercategory");
const productSchema = require('../../models/productSchema')
const {CategoryMessages} = require('../../enums/categories/categoryEnums')
//add the category

const addcategory = async (req, res) => {
  try {
    // Check for file type error first
    if (req.fileTypeError) {
      return res.status(CategoryMessages.ADD_ERROR.status).json({ message: req.fileTypeError });
    }

    const { categoryName, description } = req.body;
    const categoryNameIntoString = categoryName.toLowerCase().trim()
    if (!categoryNameIntoString || !description) {
      return res.status(CategoryMessages.ADD_ERROR.status).json({ message: CategoryMessages.ADD_ERROR.message});
    }

    if (!req.file) {
      return res.status(CategoryMessages.ADD_ERROR.status).json({ message: CategoryMessages.ADD_ERROR.message });
    }

    // Rest of your checks (existing category, etc.)
    const existingCategory = await categorySchema.findOne({
      categoryName: categoryNameIntoString,
    });

    if (existingCategory) {
      return res.status(CategoryMessages.CATEGORY_EXISTS.status).json({ message:CategoryMessages.CATEGORY_EXISTS.message });
    }

    const newCategory = new categorySchema({
      categoryName: categoryNameIntoString,
      description: description.trim(),
      image: req.file.path,
    });

    await newCategory.save();
    res.status(CategoryMessages.ADD_SUCCESS.status).json({ message:CategoryMessages.ADD_SUCCESS.message, category: newCategory });
  } catch (error) {
    res.status(CategoryMessages.ADD_ERROR.status).json({ message: CategoryMessages.ADD_ERROR.message });
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
      return res.status(CategoryMessages.NO_CATEGORIES_FOUND.status).json({ message: CategoryMessages.NO_CATEGORIES_FOUND.message });
    }

    const categoriesWithStock = categories.map((category) => ({
      ...category,
      totalStock: stockMap.get(category.categoryName) || 0,
    }));

    const totalPages = Math.ceil(totalCategories / limitNum);

    res.status(CategoryMessages.FETCH_SUCCESS.status).json({
      categories: categoriesWithStock,
      totalCategories,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    res.status(CategoryMessages.FETCH_ERROR.status).json({
     message:CategoryMessages.FETCH_ERROR.message
    });
  }
};


const getcategory = async (req,res) =>{

  try {
    const categories = await categorySchema.find();

    if(!categories)return res.status(CategoryMessages.NO_CATEGORIES_FOUND.status).json({message:CategoryMessages.NO_CATEGORIES_FOUND.message})

      res.status(200).json(categories)
  } catch (error) {
     res.status(CategoryMessages.FETCH_SUCCESS.status).json({ message: CategoryMessages.FETCH_ERROR.message });
  }
}




const toggleCategoryVisibilty = async (req, res) => {
  try {
      const categoryId = req.params.id;
      
      // Find the product and get current isHidden status
      const category = await categorySchema.findById(categoryId);
      if (!category) {
          return res.status(CategoryMessages.NO_CATEGORIES_FOUND.status).json({ message: CategoryMessages.NO_CATEGORIES_FOUND.message});
      }
      
      // Toggle the isHidden status
      category.isHiddenCat = !category.isHiddenCat;
      await category.save();
      
      res.status(CategoryMessages.UPDATE_SUCCESS.status).json({
          message: `Product ${category.isHiddenCat ? 'hidden' : 'visible'} successfully`,
          category
      });
  } catch (error) {
      res.status(CategoryMessages.UPDATE_ERROR.status).json({ message: CategoryMessages.TOGGLE_VISIBILITY_ERROR.message });
  }
};

const deletecategory = async (req,res)=>{

    const categoryid=req.params.id


    try {
        await categorySchema.findByIdAndDelete({_id:categoryid})
        res.status(CategoryMessages.DELETE_SUCCESS.status).json({message:CategoryMessages.DELETE_ERROR.status})

    } catch (error) {
      res.status(CategoryMessages.DELETE_ERROR.status).json({message:CategoryMessages.DELETE_ERROR.message})
    }
}


const editcategory = async (req, res) => {
  const categoryid = req.params.id;
  const { categoryName, description } = req.body;

  if (req.fileTypeError) return res.status(CategoryMessages.UPDATE_ERROR.status).json({ message: req.fileTypeError });

  try {
    const category = await categorySchema.findById(categoryid);
    if (!category) return res.status(CategoryMessages.NO_CATEGORIES_FOUND.status).json({ message: CategoryMessages.NO_CATEGORIES_FOUND.message });

    const oldCategoryName = category.categoryName;
    const lowName = categoryName.toLowerCase().trim();

    const updateFields = { categoryName: lowName, description: description.trim() };
    if (req.file) updateFields.image = req.file.path;

      await categorySchema.findByIdAndUpdate(
      { _id: categoryid },
      { $set: updateFields },
      { new: true }
    );

    await productSchema.updateMany(
      { category: oldCategoryName },
      { $set: { category: lowName } }
    );

    res.status(CategoryMessages.UPDATE_SUCCESS.status).json({message:CategoryMessages.UPDATE_SUCCESS.message});
  } catch (error) {
    res.status(CategoryMessages.UPDATE_ERROR.status).json({ message: CategoryMessages.UPDATE_ERROR.message });
  }
};

const categorySearch = async (req,res)=>{
    const {query}=req.query

    try {
        
        const categories=await categorySchema.find({
            categoryName:{$regex:query,$options:'i'}
        })
        res.status(CategoryMessages.SEARCH_SUCCESS.status).json(categories)
    } catch (error) {

        res.status(CategoryMessages.SEARCH_ERROR.status).json({message:CategoryMessages.SEARCH_ERROR.message})
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


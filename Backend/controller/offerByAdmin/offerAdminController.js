const offerSchema = require('../../models/offerSchema')
const mongoose = require('mongoose')
const productSchema = require('../../models/productSchema')
const categorySchema = require('../../models/categorySchema');

//get all offers 

const getalloffers = async (req, res) => {
  try {
    const { search = '', status = 'all', page = 1, limit = 5 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (search.trim()) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (status !== 'all') {
      const now = new Date();
      if (status === 'active') {
        query.startDate = { $lte: now };
        query.endDate = { $gte: now };
      } else if (status === 'upcoming') {
        query.startDate = { $gt: now };
      } else if (status === 'expired') {
        query.endDate = { $lt: now };
      }
    }

    const totalOffers = await offerSchema.countDocuments(query);
    const offers = await offerSchema
      .find(query)
      .sort({createdAt:-1})
      .skip(skip)
      .limit(limitNum)
      .lean();

    if (!offers.length && totalOffers === 0) {
      return res.status(404).json({ message: 'No offers found' });
    }

    const totalPages = Math.ceil(totalOffers / limitNum);

    res.status(200).json({
      offers,
      totalOffers,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch offers' });
  }
};

// Add new offer
const addOffer = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    
    try {
        const {
            title,
            offerType,
            description,
            discountType,
            discountValue,
            applicableProducts = [],
            applicableCategories = [],
            referralCode,
            referralReward,
            startDate,
            endDate,
            isActive = true
        } = req.body;

        // Basic validation
        if (!title || !offerType || !discountType || !discountValue || !startDate || !endDate) {
            return res.status(400).json({ message: "Required fields are missing" });
        }

        // Validate offer type specific fields
        if (offerType === 'product' && applicableProducts.length === 0) {
            return res.status(400).json({ message: "Products must be selected for product offers" });
        }

        if (offerType === 'category' && applicableCategories.length === 0) {
            return res.status(400).json({ message: "Categories must be selected for category offers" });
        }

 
        // Validate dates
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ message: "End date must be after start date" });
        }

        // Validate discount value
        if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
            return res.status(400).json({ message: "Percentage discount must be between 1 and 100" });
        }

        
        
        const offerNumber = `OFF-${Date.now()}-${Math.floor(Math.random() * 10)}`;

        // Create new offer
        const newOffer = new offerSchema({
            title,
            offerType,
            description,
            discountType,
            discountValue,
            applicableProducts,
            applicableCategories,
            referralCode,
            referralReward,
            startDate,
            endDate,
            isActive,
            offerNumber:offerNumber

        });

        await newOffer.save({ session });

        await session.commitTransaction();
        res.status(201).json({
            success: true,
            message: "Offer created successfully",
            offer: newOffer
        });

    } catch (error) {
        await session.abortTransaction();
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ 
                success: false,
                message: "Validation error",
                errors: messages 
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create offer",
            error: error.message
        });
    } finally {
        session.endSession();
    }
}

//edit the offer 

const editOffer = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const {
            title,
            offerType,
            description,
            discountType,
            discountValue,
            applicableProducts = [],
            applicableCategories = [],
            referralCode,
            referralReward,
            startDate,
            endDate,
            isActive
        } = req.body;

        // Basic validation
        if (!title || !offerType || !discountType || !discountValue || !startDate || !endDate) {
            return res.status(400).json({ message: "Required fields are missing" });
        }

        // Validate offer type specific fields
        if (offerType === 'product' && applicableProducts.length === 0) {
            return res.status(400).json({ message: "Products must be selected for product offers" });
        }

        if (offerType === 'category' && applicableCategories.length === 0) {
            return res.status(400).json({ message: "Categories must be selected for category offers" });
        }

        // Validate dates
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ message: "End date must be after start date" });
        }

        // Validate discount value
        if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
            return res.status(400).json({ message: "Percentage discount must be between 1 and 100" });
        }

        // Check if offer exists
        const existingOffer = await offerSchema.findById(id).session(session);
        if (!existingOffer) {
            return res.status(404).json({ message: "Offer not found" });
        }

        // Check for duplicate referral code if changed
        if (offerType === 'referral' && referralCode !== existingOffer.referralCode) {
            const duplicateOffer = await offerSchema.findOne({ referralCode }).session(session);
            if (duplicateOffer) {
                return res.status(400).json({ message: "Referral code already exists" });
            }
        }

        // Update offer
        existingOffer.title = title;
        existingOffer.offerType = offerType;
        existingOffer.description = description;
        existingOffer.discountType = discountType;
        existingOffer.discountValue = discountValue;
        existingOffer.applicableProducts = applicableProducts;
        existingOffer.applicableCategories = applicableCategories;
        existingOffer.referralCode = referralCode;
        existingOffer.referralReward = referralReward;
        existingOffer.startDate = startDate;
        existingOffer.endDate = endDate;
        existingOffer.isActive = isActive;

        await existingOffer.save({ session });
        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: "Offer updated successfully",
            offer: existingOffer
        });

    } catch (error) {
        await session.abortTransaction();
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ 
                success: false,
                message: "Validation error",
                errors: messages 
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update offer",
            error: error.message
        });
    } finally {
        session.endSession();
    }
}


const deleteOffer = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;

        // Check if offer exists
        const existingOffer = await offerSchema.findById(id).session(session);
        if (!existingOffer) {
            return res.status(404).json({ message: "Offer not found" });
        }

        // Delete the offer
        await offerSchema.findByIdAndDelete(id).session(session);
        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: "Offer deleted successfully"
        });

    } catch (error) {
        await session.abortTransaction();
        
        res.status(500).json({
            success: false,
            message: "Failed to delete offer",
            error: error.message
        });
    } finally {
        session.endSession();
    }
}


const getOfferById = async (req,res) =>{

    const offerId = req.params.id

    if(!offerId) return res.status(400).json({message:"the offerid is needed here"})
    try {
        const offerdetails = await offerSchema.findById({_id:offerId})


        res.status(200).json(offerdetails)
    } catch (error) {
        res.status(404).json({message:'some thing issue in fetching'})
    }
}


const producslist = async (req,res)=>{

    try {
        const allproducts = await productSchema.find()
        if (!allproducts || allproducts.length === 0) {
            return res.status(404).json({ message: "No products found" });
          }
      
          const allproductsNames = allproducts.map(product => product.name);
          res.status(200).json(allproducts);
    } catch (error) {
        res.status(404).json({message:'some thing issue in fetching'})

    }
}

const categorylist = async (req,res)=>{

    try {
        const allcategories = await categorySchema.find()
        if (!allcategories || allcategories.length === 0) {
            return res.status(404).json({ message: "No categories found" });


          }

      
          res.status(200).json(allcategories);
    } catch (error) {
        res.status(404).json({message:'some thing issue in fetching'})

    }
}




module.exports = {
    getalloffers,
    addOffer,
    categorylist,
    producslist,
    deleteOffer,
    editOffer,
    getOfferById
 
};



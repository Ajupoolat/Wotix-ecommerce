const mongoose = require("mongoose");
const Address = require("../../models/addressSchema");
const userSchema = require("../../models/userSchema");
const { AddressMessages } = require("../../enums/AddressEnums/addressUserEnum");

// Add a new address
const addAddress = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.params.id;
    const addressData = { ...req.body, userId };

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (addressData.isDefault) {
      await Address.updateMany(
        { userId, isDefault: true },
        { $set: { isDefault: false } },
        { session }
      );
    }

    const newAddress = new Address(addressData);
    const savedAddress = await newAddress.save({ session });

    if (!savedAddress)
      return res
        .status(AddressMessages.ADD_ERROR.status)
        .json({ message: AddressMessages.ADD_ERROR.message });

    await session.commitTransaction();
    res
      .status(AddressMessages.ADD_SUCCESS.status)
      .json({ message: AddressMessages.ADD_SUCCESS.message });
  } catch (error) {
    await session.abortTransaction();
    res
      .status(AddressMessages.ADD_ERROR.status)
      .json({ message: AddressMessages.ADD_SUCCESS.message });
  } finally {
    session.endSession();
  }
};

// Get all addresses for the logged-in user
const getAddresses = async (req, res) => {
  try {
    const userId = req.params.id;
    const email = req.params.email;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const addresses = await Address.find({ userId }).sort({ createdAt: -1 });

    const user = await userSchema.findById(userId);
    if (user.email !== email) {
      if (user.email !== email) {
        return res.status(403).json({ message: "Oops this page is not get !" });
      }
    }
    res.status(AddressMessages.FETCH_SUCCESS.status).json(addresses);
  } catch (error) {
    res
      .status(AddressMessages.FETCH_ERROR.status)
      .json({ message: AddressMessages.FETCH_ERROR.message });
  }
};

// Update an address
const updateAddress = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const addressId = req.params.idadd;
    const userId = req.params.id;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      await session.abortTransaction();
      return res
        .status(AddressMessages.INVALID_USER_ID.status)
        .json({ message: AddressMessages.INVALID_USER_ID.message });
    }
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      await session.abortTransaction();
      return res
        .status(AddressMessages.INVALID_ADDRESS_ID.status)
        .json({ message: AddressMessages.INVALID_ADDRESS_ID.message });
    }

    if (req.body.isDefault) {
      await Address.updateMany(
        {
          userId,
          _id: { $ne: new mongoose.Types.ObjectId(addressId) },
          isDefault: true,
        },
        { $set: { isDefault: false } },
        { session }
      );
    }

    const updated = await Address.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(addressId), userId },
      { $set: req.body },
      { new: true, session }
    );

    if (!updated) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ message: "Address not found or not authorized" });
    }

    await session.commitTransaction();
    res
      .status(AddressMessages.UPDATE_SUCCESS.status)
      .json({ message: AddressMessages.UPDATE_SUCCESS.message });
  } catch (error) {
    await session.abortTransaction();
    res
      .status(AddressMessages.UPDATE_ERROR.status)
      .json({ message: AddressMessages.UPDATE_ERROR.message });
  } finally {
    session.endSession();
  }
};

// Delete an address
const deleteAddress = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const addressId = req.params.idadd;
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      await session.abortTransaction();
      return res
        .status(AddressMessages.INVALID_USER_ID.status)
        .json({ message: AddressMessages.INVALID_ADDRESS_ID.message });
    }
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      await session.abortTransaction();
      return res
        .status(AddressMessages.INVALID_ADDRESS_ID.status)
        .json({ message: AddressMessages.INVALID_ADDRESS_ID.message });
    }

    const deleted = await Address.findOneAndDelete(
      { _id: new mongoose.Types.ObjectId(addressId), userId },
      { session }
    );

    if (!deleted) {
      await session.abortTransaction();
      return res
        .status(AddressMessages.DELETE_ERROR.status)
        .json({ message: AddressMessages.DELETE_ERROR.message });
    }

    if (deleted.isDefault) {
      const nextAddress = await Address.findOne({
        userId,
        _id: { $ne: addressId },
      })
        .sort({ createdAt: -1 })
        .session(session);
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save({ session });
      }
    }

    await session.commitTransaction();
    res
      .status(AddressMessages.DELETE_SUCCESS.status)
      .json({ message: AddressMessages.DELETE_SUCCESS.message });
  } catch (error) {
    await session.abortTransaction();
    res
      .status(AddressMessages.DELETE_ERROR.status)
      .json({ message: AddressMessages.DELETE_ERROR.message });
  } finally {
    session.endSession();
  }
};

module.exports = {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
};

const address = require("../../models/addressSchema");
const userSchema = require("../../models/userSchema");
const { AddressMessages } = require("../../enums/checkout/checkoutenum");

const defaultaddress = async (req, res) => {
  try {
    const userId = req.params.id;
    const email = req.params.email;

    const user = await userSchema.findById(userId);

    if (user.email !== email) {
      return res.status(403).json({
        message: AddressMessages.UNAUTHORIZED_ACCESS,
      });
    }

    const addresses = await address.find({ userId, isDefault: true });
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: AddressMessages.FETCH_ERROR, error });
  }
};

module.exports = { defaultaddress };

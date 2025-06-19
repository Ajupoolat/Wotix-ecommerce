module.exports = Object.freeze({
  AddressMessages: {
    // Success messages with status codes
    ADD_SUCCESS: { message: "Address added successfully", status: 201 },
    FETCH_SUCCESS: { message: "Addresses fetched successfully", status: 200 },
    UPDATE_SUCCESS: { message: "Address updated successfully", status: 200 },
    DELETE_SUCCESS: { message: "Address deleted successfully", status: 200 },

    INVALID_USER_ID: { message: "Invalid user ID", status: 400 },
    INVALID_ADDRESS_ID: { message: "Invalid address ID", status: 400 },
    UNAUTHORIZED_ACCESS: { message: "Address not found or not authorized", status: 404 },
    EMAIL_MISMATCH: { message: "Oops, this page cannot be accessed!", status: 403 },
    ADD_ERROR: { message: "Error adding address", status: 500 },
    FETCH_ERROR: { message: "Error fetching addresses", status: 500 },
    UPDATE_ERROR: { message: "Error updating address", status: 500 },
    DELETE_ERROR: { message: "Error deleting address", status: 500 }
  }
});
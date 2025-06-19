module.exports = Object.freeze({
  CategoryMessages: {
    ADD_SUCCESS: { message: "Category added successfully", status: 201 },
    FETCH_SUCCESS: { message: "Categories fetched successfully", status: 200 },
    FETCH_WITH_STOCK_SUCCESS: {
      message: "Categories with stock fetched successfully",
      status: 200,
    },
    UPDATE_SUCCESS: { message: "Category updated successfully", status: 200 },
    DELETE_SUCCESS: { message: "Category deleted successfully", status: 200 },
    TOGGLE_VISIBILITY_SUCCESS: {
      message: "Category visibility toggled successfully",
      status: 200,
    },
    SEARCH_SUCCESS: {
      message: "Category search completed successfully",
      status: 200,
    },

    INVALID_FILE_TYPE: { message: "Invalid file type", status: 400 },
    MISSING_FIELDS: {
      message: "Category name and description are required",
      status: 400,
    },
    MISSING_IMAGE: { message: "Category image is required", status: 400 },
    CATEGORY_EXISTS: {
      message: "Category with this name already exists",
      status: 400,
    },
    INVALID_CATEGORY_ID: { message: "Invalid category ID", status: 400 },
    CATEGORY_NOT_FOUND: { message: "Category not found", status: 404 },
    NO_CATEGORIES_FOUND: { message: "No categories found", status: 404 },
    ADD_ERROR: { message: "Server error while adding category", status: 500 },
    FETCH_ERROR: {
      message: "Server error while fetching categories",
      status: 500,
    },
    UPDATE_ERROR: {
      message: "Server error while updating category",
      status: 500,
    },
    DELETE_ERROR: {
      message: "Server error while deleting category",
      status: 500,
    },
    TOGGLE_VISIBILITY_ERROR: {
      message: "Server error while toggling category visibility",
      status: 500,
    },
    SEARCH_ERROR: {
      message: "Server error while searching categories",
      status: 500,
    },
  },
});

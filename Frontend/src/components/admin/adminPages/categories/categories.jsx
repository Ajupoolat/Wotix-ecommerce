import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  PlusIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import { adminLogout } from "@/api/admin/Login/loginAuth";
import {
  addcategory,
  getcategory,
  deletecategory,
  editcategory,
  handleHideCategoy,
} from "@/api/admin/categorymgt/categorymgt";
import AdminSidebar from "../../reuse/sidebar/sidebar";
import CategoryForm from "../../reuse/category/categoryform";

const CategoryList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addFileInput = useRef(null);
  const editFileInput = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const categoriesPerPage = 4;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [addCategoryImage, setAddCategoryImage] = useState(null);
  const [editCategoryImage, setEditCategoryImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hidingStates, setHidingStates] = useState({});
  const [showUnlistConfirm, setShowUnlistConfirm] = useState(false);
  const [categoryToToggle, setCategoryToToggle] = useState(null);

  const {
    data: categoryData = {
      categories: [],
      totalCategories: 0,
      totalPages: 0,
      currentPage: 1,
    },
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["categories", { searchQuery, statusFilter, currentPage }],
    queryFn: () =>
      getcategory({
        search: searchQuery,
        status: statusFilter,
        page: currentPage,
        limit: categoriesPerPage,
      }),
    keepPreviousData: true,
    onError: (err) => {
      toast.error(err.message || "Failed to fetch categories");
    },
  });

  const { mutate: logoutMutate, isPending: isLoggingOut } = useMutation({
    mutationFn: adminLogout,
    onSuccess: () => {
      toast.success("Logged out successfully!");
      queryClient.removeQueries(["auth"]);
      navigate("/adminlogin");
    },
    onError: (err) => {
      toast.error(err.message || "Logout failed");
    },
  });

  const { mutate: deleteTheCategory, isPending: isDeleting } = useMutation({
    mutationFn: deletecategory,
    onSuccess: (data) => {
      toast.success(data.message || "Category deleted successfully!");
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete category");
    },
  });

  const { mutate: addCategoryMutate, isPending: isAdding } = useMutation({
    mutationFn: addcategory,
    onSuccess: (data) => {
      toast.success(data.message || "Category added successfully!");
      queryClient.invalidateQueries(["categories"]);
      setIsAddModalOpen(false);
      setAddCategoryImage(null);
      if (addFileInput.current) addFileInput.current.value = "";
    },
    onError: (err) => {
      toast.error(err.message || "Failed to add category");
    },
  });

  const { mutate: editCategoryMutate, isPending: isEditing } = useMutation({
    mutationFn: ({ categoryId, updatedata }) =>
      editcategory(categoryId, updatedata),
    onSuccess: (data) => {
      toast.success(data.message || "Category updated successfully!");
      queryClient.invalidateQueries(["categories"]);
      setIsEditModalOpen(false);
      setEditCategoryImage(null);
      if (editFileInput.current) editFileInput.current.value = "";
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update category");
    },
  });

  const { mutate: hidecategoryMutation, isPending: isHiding } = useMutation({
    mutationFn: handleHideCategoy,
    onMutate: async ({ categoryId }) => {
      setHidingStates((prev) => ({ ...prev, [categoryId]: true }));
    },
    onSuccess: (data, variables) => {
      toast.success(data.message || "Category status updated!");
      queryClient.invalidateQueries(["categories"]);
      setShowUnlistConfirm(false);
      setHidingStates((prev) => ({ ...prev, [variables.categoryId]: false }));
    },
    onError: (err, variables) => {
      toast.error(err.message || "Failed to update category status");
      setShowUnlistConfirm(false);
      setHidingStates((prev) => ({ ...prev, [variables.categoryId]: false }));
    },
  });

  const handlePreviousPage = () =>
    currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () =>
    currentPage < categoryData.totalPages && setCurrentPage(currentPage + 1);
  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };
  const handleLogout = () => logoutMutate();

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleToggleVisibility = (categoryId, isCurrentlyHidden) => {
    setCategoryToToggle({ categoryId, isCurrentlyHidden });
    setShowUnlistConfirm(true);
  };

  const confirmToggleVisibility = () => {
    if (!categoryToToggle) return;

    hidecategoryMutation({
      categoryId: categoryToToggle.categoryId,
      isHidden: !categoryToToggle.isCurrentlyHidden,
    });
  };

  const handleDeleteCategory = (categoryId) => {
    deleteTheCategory(categoryId);
  };

  const handleAddCategory = (data) => {
    const formData = new FormData();
    formData.append("categoryName", data.categoryName);
    formData.append("description", data.description);
    formData.append("image", addCategoryImage);

    addCategoryMutate(formData);
  };

  const handleEditCategorySubmit = (data) => {
    const updatedata = new FormData();
    updatedata.append("categoryName", data.categoryName);
    updatedata.append("description", data.description);
    if (editCategoryImage) updatedata.append("image", editCategoryImage);

    editCategoryMutate({ categoryId: selectedCategory._id, updatedata });
  };

  const getPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(categoryData.totalPages, startPage + maxButtons - 1);
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </Button>
      );
    }
    return buttons;
  };

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "listed", label: "Listed" },
    { value: "unlisted", label: "Unlisted" },
  ];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar activeRoute="/admin/categories" />
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4 relative">
              <Skeleton className="h-10 w-64 rounded-full" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </header>
          <main className="p-6">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-40" />
            </div>
            <div className="bg-white rounded-lg shadow">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[...Array(5)].map((_, i) => (
                      <TableHead key={i}>
                        <Skeleton className="h-4 w-24" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(4)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(5)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar activeRoute="/admin/categories" />
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4 relative">
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-64 rounded-full border-gray-300 bg-gray-100 placeholder-gray-500 pr-20"
              />
              {searchQuery && (
                <div className="absolute right-4 flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSearch}
                    className="p-1"
                  >
                    <XMarkIcon className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="Admin"
                  />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <span className="text-gray-800">Admin</span>
              </div>
            </div>
          </header>
          <main className="p-6 flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-500 mb-2">
                Error loading categories
              </h2>
              <p className="text-gray-600 mb-4">
                {error?.message || "Failed to fetch category data"}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-black text-white"
              >
                Retry
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar activeRoute="/admin/categories" />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 relative">
            <Input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-full border-gray-300 bg-gray-100 placeholder-gray-500 pr-20"
            />
            {searchQuery && (
              <div className="absolute right-4 flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="p-1"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-600" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <span className="text-gray-800">Admin</span>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Category List</h2>
            <Button
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => setIsAddModalOpen(true)}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          <Dialog
            open={isAddModalOpen}
            onOpenChange={(open) => {
              setIsAddModalOpen(open);
              if (!open) {
                setAddCategoryImage(null);
                if (addFileInput.current) addFileInput.current.value = "";
              }
            }}
          >
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <CategoryForm
                mode="add"
                onSubmit={handleAddCategory}
                onCancel={() => setIsAddModalOpen(false)}
                isSubmitting={isAdding}
                categoryImage={addCategoryImage}
                setCategoryImage={setAddCategoryImage}
                fileInputRef={addFileInput}
              />
            </DialogContent>
          </Dialog>

          <Dialog
            open={isEditModalOpen}
            onOpenChange={(open) => {
              setIsEditModalOpen(open);
              if (!open) {
                setEditCategoryImage(null);
                if (editFileInput.current) editFileInput.current.value = "";
              }
            }}
          >
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
              </DialogHeader>
              <CategoryForm
                mode="edit"
                initialData={selectedCategory || {}}
                onSubmit={handleEditCategorySubmit}
                onCancel={() => setIsEditModalOpen(false)}
                isSubmitting={isEditing}
                categoryImage={editCategoryImage}
                setCategoryImage={setEditCategoryImage}
                fileInputRef={editFileInput}
              />
            </DialogContent>
          </Dialog>

          <AlertDialog
            open={showUnlistConfirm}
            onOpenChange={setShowUnlistConfirm}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {categoryToToggle?.isCurrentlyHidden
                    ? "List this category?"
                    : "Unlist this category?"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {categoryToToggle?.isCurrentlyHidden
                    ? "This will make the category visible to users."
                    : "This will hide the category from users."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmToggleVisibility}
                  disabled={hidingStates[categoryToToggle?.categoryId]}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  {hidingStates[categoryToToggle?.categoryId]
                    ? "Processing..."
                    : categoryToToggle?.isCurrentlyHidden
                    ? "List"
                    : "Unlist"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">S.NO</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryData.categories.length > 0 ? (
                  categoryData.categories.map((category, index) => (
                    <TableRow key={category._id}>
                      <TableCell>
                        {(currentPage - 1) * categoriesPerPage + index + 1}.
                      </TableCell>
                      <TableCell>{category.categoryName}</TableCell>
                      <TableCell>{category.totalStock || 0}</TableCell>
                      <TableCell>
                        {category.isHiddenCat ? (
                          <Badge variant="destructive">Unlisted</Badge>
                        ) : (
                          <Badge variant="success">Listed</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          className="mr-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                          onClick={() => handleEditCategory(category)}
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="mr-2 border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() =>
                            handleToggleVisibility(
                              category._id,
                              category.isHiddenCat
                            )
                          }
                          disabled={hidingStates[category._id]}
                        >
                          {hidingStates[category._id]
                            ? "Processing..."
                            : category.isHiddenCat
                            ? "List"
                            : "Unlist"}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              disabled={isDeleting}
                            >
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the category{" "}
                                {category.categoryName}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteCategory(category._id)
                                }
                                className="bg-black text-white hover:bg-gray-800"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No categories found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {categoryData.totalCategories > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * categoriesPerPage + 1}-
                {Math.min(
                  currentPage * categoriesPerPage,
                  categoryData.totalCategories
                )}{" "}
                of {categoryData.totalCategories}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </Button>
                {getPaginationButtons()}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === categoryData.totalPages}
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CategoryList;

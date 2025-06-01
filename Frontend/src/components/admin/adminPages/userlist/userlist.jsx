import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import {
  getuserdetails,
  blockuser,
} from "../../../../api/admin/usermanagment/usermanagment";
import AdminSidebar from "../../reuse/sidebar/sidebar";
import LoadingSpinner from "../../adminCommon/loadingSpinner";
import CommonError from "../../adminCommon/error";

const Userlist = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBlockAlert, setShowBlockAlert] = useState(false);
  const [userToBlock, setUserToBlock] = useState(null);
  const [blockAction, setBlockAction] = useState("");
  const usersPerPage = 10;

  const {
    data: userData = {
      users: [],
      totalUsers: 0,
      totalPages: 0,
      currentPage: 1,
    },
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["users", currentPage, searchQuery],
    queryFn: () =>
      getuserdetails({
        page: currentPage,
        limit: usersPerPage,
        search: searchQuery,
      }),
    keepPreviousData: true, // Retain previous data while fetching new page
  });

  const { mutate: toggleBlockUser, isPending: isBlocking } = useMutation({
    mutationFn: blockuser,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(["users"]);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update user status");
    },
  });

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const { users, totalUsers, totalPages, currentPage: serverPage } = userData;

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleBlockClick = (userId, isCurrentlyBlocked) => {
    setUserToBlock(userId);
    setBlockAction(isCurrentlyBlocked ? "unblock" : "block");
    setShowBlockAlert(true);
  };

  const handleConfirmBlock = () => {
    if (userToBlock) {
      toggleBlockUser({
        userId: userToBlock,
        isBlocked: blockAction === "block",
      });
    }
    setShowBlockAlert(false);
    setUserToBlock(null);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Generate pagination buttons dynamically
  const getPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar activeRoute="/admin/users" />
        <LoadingSpinner />
      </div>
    );
  }

  if (error || isError) {
    return (
      <CommonError
        Route={"/admin/users"}
        m1={"error to load user data"}
        m2={"Error loading userdata"}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* side bar  */}
      <AdminSidebar activeRoute="/admin/users" />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 relative">
            <Input
              type="text"
              placeholder="Search users..."
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
            <h2 className="text-2xl font-bold">Users List</h2>
          </div>

          {!isLoading && !isError && (
            <div className="bg-white rounded-lg shadow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">S.NO</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user, index) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          {(currentPage - 1) * usersPerPage + index + 1}.
                        </TableCell>
                        <TableCell>{user.firstName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.isBlocked ? (
                            <Badge variant="destructive">Blocked</Badge>
                          ) : (
                            <Badge variant="success">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            className="mr-2 border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() =>
                              handleBlockClick(user._id, user.isBlocked)
                            }
                            disabled={isBlocking}
                          >
                            {user.isBlocked ? "Unblock" : "Block"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {!isLoading && !isError && totalUsers > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * usersPerPage + 1}-
                {Math.min(currentPage * usersPerPage, totalUsers)} of{" "}
                {totalUsers}
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
                  disabled={currentPage === totalPages}
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      <AlertDialog open={showBlockAlert} onOpenChange={setShowBlockAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to {blockAction} this user?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will {blockAction} the user's account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBlock}
              className="bg-red-600 hover:bg-red-700"
            >
              {blockAction === "block" ? "Block" : "Unblock"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Userlist;

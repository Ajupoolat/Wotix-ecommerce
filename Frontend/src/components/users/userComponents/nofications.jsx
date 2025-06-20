import React, { useEffect, useState } from "react";
import {
  getNotificationsUser,
  updateNotificationsUser,
  deleteNotifactionsUser,
} from "@/api/users/notifiByUser/noficationmgt";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/authuser";
import { io } from "socket.io-client";
import {
  BellIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const NotificationsUser = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(5); 
  const [totalPages, setTotalPages] = useState(1);
  const baseUrl = import.meta.env.VITE_API_URL;
  const userId = localStorage.getItem("userId");
  const queryClient = useQueryClient();

  const { data: notificationData } = useQuery({
    queryKey: ["userNotifications", page],
    queryFn: () => getNotificationsUser(page, limit),
    enabled: isAuthenticated && !!userId,
    keepPreviousData: true, // Smooth transitions between pages
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => updateNotificationsUser(id),
    onSuccess: (_, id) => {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount((prev) => prev - 1);
      toast.success("notification marked as read successfully");
      queryClient.invalidateQueries(["userNotifications"]);
    },
    onError: () => {
      toast.error("some thing issue in marking as read notification");
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => deleteNotifactionsUser(id),
    onSuccess: (_, id) => {
      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== id)
      );
      setUnreadCount((prev) => {
        const deletedNotification = notifications.find((n) => n._id === id);
        return deletedNotification && !deletedNotification.isRead
          ? prev - 1
          : prev;
      });
      toast.success("notification deleted successfully");
      queryClient.invalidateQueries(["userNotifications"]);
    },
    onError: (err) => {
      toast.error("notification delete have issue");
    },
  });

  useEffect(() => {
    if (notificationData) {
      setNotifications(notificationData.notifications);
      setTotalPages(notificationData.totalPages);
      setUnreadCount(
        notificationData?.notifications?.filter((n) => !n.isRead)?.length
      );
    }
  }, [notificationData]);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const socket = io(baseUrl, {
      withCredentials: true,
      autoConnect: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    socket.on("notification", (notification) => {
      // For new notifications, add to first page and refresh
      setPage(1);
      queryClient.invalidateQueries(["userNotifications"]);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, isAuthenticated]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "return_approved":
        return "✅";
      default:
        return "🔔";
    }
  };

  const handleMarkAsRead = (id, e) => {
    e.stopPropagation();
    markAsReadMutation.mutate(id);
  };

  const handleDeleteNotification = (id, e) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate(id);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative rounded-full">
            <BellIcon className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-80 max-h-[calc(100vh-200px)] overflow-y-auto shadow-lg rounded-lg border border-gray-200"
        >
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No notifications yet
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification?._id}
                    className="p-0 focus:bg-gray-50"
                  >
                    <div className="flex gap-3 w-full p-3 hover:bg-gray-50">
                      <div className="flex-shrink-0 text-lg mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification?.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.createdAt &&
                          !isNaN(new Date(notification.createdAt))
                            ? formatDistanceToNow(
                                new Date(notification.createdAt),
                                { addSuffix: true }
                              )
                            : "Recently"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.isRead ? (
                          <button
                            onClick={(e) => handleMarkAsRead(notification._id, e)}
                            className="flex-shrink-0 mt-1 text-gray-400 hover:text-gray-600"
                            title="Mark as read"
                          >
                            <EyeSlashIcon className="h-4 w-4" />
                          </button>
                        ) : (
                          <div className="flex-shrink-0 mt-1 text-gray-300">
                            <EyeIcon className="h-4 w-4" />
                          </div>
                        )}
                        <button
                          onClick={(e) =>
                            handleDeleteNotification(notification._id, e)
                          }
                          className="flex-shrink-0 mt-1 text-gray-400 hover:text-red-500"
                          title="Delete notification"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-2 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NotificationsUser;
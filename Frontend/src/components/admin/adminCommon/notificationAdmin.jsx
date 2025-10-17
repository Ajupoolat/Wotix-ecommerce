import React, { useEffect, useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
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
import { formatDistanceToNow } from "date-fns";
import {
  getNotificationsAdmin,
  updateNoificationsAdmin,
  deleteNotifactionsAdmin,
} from "@/api/admin/notifications/adminNotimgt";
import toast from "react-hot-toast";

const NotificationsAdmin = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const baseUrl = import.meta.env.VITE_API_URL;
  const isAdmin = localStorage.getItem("admin");
  const queryClient = useQueryClient();

  const { data: notificationData } = useQuery({
    queryKey: ["adminNotifications", page],
    queryFn: () => getNotificationsAdmin(page, limit),
    enabled: !!isAdmin,
    keepPreviousData: true, // Smooth transitions between pages
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => updateNoificationsAdmin(id),
    onSuccess: (_, id) => {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount((prev) => prev - 1);
      toast.success("Notification marked as read");
      queryClient.invalidateQueries(["adminNotifications"]);
    },
    onError: () => {
      toast.error("Failed to mark notification as read");
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => deleteNotifactionsAdmin(id),
    onSuccess: (_, id) => {
      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== id)
      );
      // Decrease unread count if the deleted notification was unread
      setUnreadCount((prev) => {
        const deletedNotification = notifications.find((n) => n._id === id);
        return deletedNotification && !deletedNotification.isRead
          ? prev - 1
          : prev;
      });
      toast.success("Notification deleted successfully");
      queryClient.invalidateQueries(["adminNotifications"]);
    },
    onError: () => {
      toast.error("Failed to delete notification");
    },
  });

  useEffect(() => {
    if (notificationData) {
      setNotifications(notificationData.notifications);
      setTotalPages(notificationData.totalPages);
      setUnreadCount(
        notificationData.notifications.filter((n) => !n.isRead).length
      );
    }
  }, [notificationData]);

  //socket connection to backend
  useEffect(() => {
    if (!isAdmin) return;

    const socket = io(baseUrl, {
      withCredentials: true,
    });

    socket.emit("register_user", "admin");

    socket.on("new_admin_notification", (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      queryClient.setQueryData(["adminNotifications", page], (old) => {
        const updatedNotifications = old
          ? { ...old, notifications: [newNotification, ...old.notifications] }
          : { notifications: [newNotification], totalPages: 1 };
        return updatedNotifications;
      });

      toast.success(`New Notification:${newNotification?.message}`);
    });

    return () => {
      socket.off("new_admin_notification");
      socket.off("new_notification");
      socket.disconnect();
    };
  }, [isAdmin]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "return_request":
        return "❗";
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
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full bg-gray-300"
          >
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
                            onClick={(e) =>
                              handleMarkAsRead(notification._id, e)
                            }
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

export default NotificationsAdmin;

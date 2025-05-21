import React, { useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { useWebSocket } from "../../../../../context/adminreturn";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead } = useWebSocket();
  const [isOpen, setIsOpen] = useState(false);


  const handleReturnAction = (notification, action) => {
    if (notification.type === 'return_request') {
      const { orderId, requestId } = notification.relatedEntity;
      processReturn({ 
        orderId, 
        requestId, 
        status: action === 'accept' ? 'approved' : 'rejected',
        adminNotes: action === 'accept' ? 'Return approved' : 'Return rejected'
      });
    }
  };
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative p-2">
          <BellIcon className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-blue-500 text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <DropdownMenuItem className="text-gray-500">
            No notifications
          </DropdownMenuItem>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification._id}
              className="flex flex-col items-start gap-2 p-4"
              onClick={() => markAsRead(notification._id)}
            >
              <div className="font-medium">{notification.message}</div>
              {notification.type === "return_request" && (
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReturnAction(notification, "accept");
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReturnAction(notification, "reject");
                    }}
                  >
                    Reject
                  </Button>
                </div>
              )}
              <div className="text-xs text-gray-500">
                {new Date(notification.createdAt).toLocaleString()}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
